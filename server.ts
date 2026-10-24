import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json());

  // Initialize Gemini SDK with telemetry header
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || '',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  // Proxy for live backend messages (avoiding CORS and ngrok landing page issues)
  app.get('/api/backend-messages', async (req, res) => {
    try {
      const response = await fetch('https://traffic-spearfish-tweezers.ngrok-free.dev/messages', {
        headers: {
          'ngrok-skip-browser-warning': 'true',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        return res.status(response.status).json({
          status: 'error',
          statusCode: response.status,
          message: `Backend returned HTTP ${response.status}`,
        });
      }

      const data = await response.json();
      return res.json(data);
    } catch (err: any) {
      return res.status(502).json({
        status: 'error',
        message: err.message || 'Failed to reach backend endpoint',
      });
    }
  });

  // High-precision deterministic Georgian linguistic parser
  function parseGeorgianMessage(text: string, serverStartTime: number, source: string) {
    const clean = text.toLowerCase();
    let productQuery: string | null = null;
    if (clean.includes('რეალ') || clean.includes('მადრიდ') || clean.includes('real')) {
      productQuery = 'რეალ მადრიდი';
    } else if (clean.includes('ნაკრებ') || clean.includes('კვარა') || clean.includes('georgia') || clean.includes('ჯვაროსნებ')) {
      productQuery = 'საქართველოს ნაკრები';
    } else if (clean.includes('დინამო') || clean.includes('dinamo')) {
      productQuery = 'დინამო თბილისი';
    } else if (clean.includes('ბარს') || clean.includes('barca') || clean.includes('ბარსელონა')) {
      productQuery = 'ბარსელონა';
    } else if (clean.includes('ბორჯღალ') || clean.includes('რაგბი') || clean.includes('rugby')) {
      productQuery = 'ბორჯღალოსნები - სარაგბო მაისური 2024';
    }

    let size: string | null = null;
    const sizeMatch = text.match(/\b(xxl|xl|l|m|s|xs)\b/i) || text.match(/([smlxlxxl]+)\s*ზომ/i);
    if (sizeMatch) {
      size = sizeMatch[1].toUpperCase();
    }

    let customerOffer: number | null = null;
    const offerMatch = text.match(/(\d+)\s*(?:ლარ|₾|gel|lari)/i);
    if (offerMatch) {
      customerOffer = parseInt(offerMatch[1], 10);
    }

    const serverDurationMs = Math.round(performance.now() - serverStartTime);
    return {
      success: true,
      extractionSource: 'deterministic_georgian_engine',
      geminiAvailable: false,
      extracted: {
        productQuery,
        size,
        customerOffer,
        intent: customerOffer ? 'DISCOUNT_NEGOTIATION' : 'INVENTORY_QUERY',
      },
      durationMs: serverDurationMs,
      source: 'deterministic_georgian_engine',
    };
  }

  let geminiPermissionDenied = false;

  // Secure Server-Side Gemini Extraction Pipeline
  app.post('/api/agent/extract', async (req, res) => {
    const { text } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ success: false, error: 'Text query is required' });
    }

    const serverStartTime = performance.now();

    // If key is not configured or permission was previously denied (403), use deterministic engine directly
    if (!process.env.GEMINI_API_KEY || geminiPermissionDenied) {
      return res.json(
        parseGeorgianMessage(
          text,
          serverStartTime,
          geminiPermissionDenied ? 'deterministic_georgian_engine' : 'rule_fallback_no_key'
        )
      );
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Analyze this Georgian customer message for an athletic jersey store: "${text}".
Extract:
1. productQuery: The football jersey team or player mentioned in Georgian or English (e.g. "რეალ მადრიდი", "საქართველოს ნაკრები", "დინამო თბილისი", "ბარსელონა"). Return null if not identified.
2. size: Apparel size requested (e.g. "S", "M", "L", "XL", "XXL"). Return null if not stated.
3. customerOffer: The specific monetary price in Georgian Lari (GEL) that the customer is offering/bargaining for (e.g. 50 if they ask "50 ლარად თუ გაქვთ?"). Return null if the customer is merely asking for the catalog price or asking if stock is available without proposing a price.
4. intent: One of "DISCOUNT_NEGOTIATION", "INVENTORY_QUERY", "ORDER_REQUEST", "GENERAL_INQUIRY".`,
        config: {
          systemInstruction: 'You are an accurate, structured extraction parser for Georgian e-commerce sales. Return valid JSON only adhering strictly to the schema.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              productQuery: {
                type: Type.STRING,
                description: 'Product or team name identified from the message, or empty/null.',
              },
              size: {
                type: Type.STRING,
                description: 'Clothing size mentioned, or empty/null.',
              },
              customerOffer: {
                type: Type.NUMBER,
                description: 'Numeric price offered in GEL by customer, or null if none.',
              },
              intent: {
                type: Type.STRING,
                description: 'Detected customer intent.',
              },
            },
            required: ['intent'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      const serverDurationMs = Math.round(performance.now() - serverStartTime);

      return res.json({
        success: true,
        extractionSource: 'gemini-3.8-flash',
        geminiAvailable: true,
        extracted: {
          productQuery: parsed.productQuery || null,
          size: parsed.size ? parsed.size.toUpperCase() : null,
          customerOffer: typeof parsed.customerOffer === 'number' ? parsed.customerOffer : null,
          intent: parsed.intent || 'INVENTORY_QUERY',
        },
        durationMs: serverDurationMs,
        source: 'gemini-3.8-flash',
      });
    } catch (err: any) {
      // Check if error is permission denied / 403
      const isPermissionDenied =
        err?.status === 403 ||
        err?.status === 'PERMISSION_DENIED' ||
        err?.error?.code === 403 ||
        String(err?.message || '').includes('PERMISSION_DENIED') ||
        String(err?.message || '').includes('403') ||
        String(err).includes('PERMISSION_DENIED');

      if (isPermissionDenied) {
        geminiPermissionDenied = true;
        console.info('[AI Agent] Note: Gemini API permission restricted (HTTP 403: PERMISSION_DENIED). Seamlessly utilizing local deterministic Georgian extraction engine.');
      } else {
        console.warn('[AI Agent] Gemini call failed, utilizing local deterministic extraction:', err?.message || err);
      }

      return res.json(
        parseGeorgianMessage(text, serverStartTime, 'deterministic_georgian_engine')
      );
    }
  });

  // Client SPA serving & Vite middleware
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      if (url.startsWith('/api/')) {
        return next();
      }
      try {
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
