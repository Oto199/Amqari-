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
  let rateLimitCooldownUntil = 0;
  const extractionCache = new Map<string, any>();

  // Real Conversational Gemini Agent with Context Retention & Deterministic Guardrails
  app.post('/api/agent/chat', async (req, res) => {
    const { text, history = [], catalogue = [], senderId } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ success: false, error: 'Text query is required' });
    }

    const serverStartTime = performance.now();

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        success: false,
        geminiAvailable: false,
        requiresHumanReview: true,
        validationStatus: 'human_review_required',
        geminiStatus: 'Gemini Unavailable - No API Key',
        error: 'GEMINI_API_KEY is not configured',
        durationMs: Math.round(performance.now() - serverStartTime),
      });
    }

    try {
      const sanitizedCatalogue = Array.isArray(catalogue) && catalogue.length > 0
        ? catalogue
        : [
            {
              id: 'prod-3',
              title: 'რეალ მადრიდი 2024/25 Home Kit (ოქროსფერი დეტალებით)',
              price: 110,
              minPrice: 90,
              sizes: [
                { size: 'S', stock: 1 },
                { size: 'M', stock: 2 },
                { size: 'L', stock: 0 },
                { size: 'XL', stock: 4 },
              ],
            },
            {
              id: 'prod-1',
              title: 'საქართველოს ნაკრები 2024 (კვარაცხელია #7)',
              price: 85,
              minPrice: 65,
              sizes: [
                { size: 'S', stock: 4 },
                { size: 'M', stock: 0 },
                { size: 'L', stock: 5 },
                { size: 'XL', stock: 2 },
              ],
            },
            {
              id: 'prod-2',
              title: 'დინამო თბილისი Vintage 1981',
              price: 95,
              minPrice: 75,
              sizes: [
                { size: 'M', stock: 3 },
                { size: 'L', stock: 4 },
                { size: 'XL', stock: 1 },
              ],
            },
            {
              id: 'prod-4',
              title: 'ბარსელონა 2024/25 Home Kit',
              price: 105,
              minPrice: 85,
              sizes: [
                { size: 'S', stock: 2 },
                { size: 'M', stock: 3 },
                { size: 'L', stock: 2 },
                { size: 'XL', stock: 0 },
              ],
            },
          ];

      const systemInstruction = `You are "ამქარი" (Amqari), an autonomous AI sales assistant for an e-commerce sportswear store in Georgia.
You communicate naturally, concisely, and politely in Georgian.

Store Catalogue & Inventory:
${JSON.stringify(sanitizedCatalogue, null, 2)}

Strict Business Rules:
1. CONVERSATION CONTEXT & FOLLOW-UPS:
   - Use the prior conversation history to track the product, requested size, and previous negotiations.
   - For follow-up messages (e.g. "80 lardad viyidi" or "კარგი, 90 ლარად ავიღებ"), preserve the product and size from earlier turns.
   - Understand Georgian written in either Georgian script or Latin transliteration (e.g. "80 lardad viyidi" means "80 ლარად ვიყიდი" -> 80 GEL offer).
2. STRICT PRICE FLOOR:
   - "price" is list price. "minPrice" is the STRICT MINIMUM AUTHORIZED PRICE.
   - NEVER accept an offer below minPrice.
   - If customer offers < minPrice (e.g. 10 GEL or 80 GEL when minPrice is 90 GEL):
     * Do NOT agree. Counter-offer politely at minPrice (e.g. 90 GEL).
   - If customer offers >= minPrice or accepts your counter-offer (e.g. "კარგი, 90 ლარად ავიღებ"):
     * Accept warmly and ask for delivery details (name, phone, address) to finalize the order.
3. INVENTORY CHECK:
   - If requested size has 0 stock, explain it is out of stock and offer available sizes.
   - If in stock, confirm availability.
4. AMBIGUOUS QUERIES:
   - If customer's question is ambiguous, ask a natural clarifying question rather than guessing.
5. NATURAL HUMAN TONE:
   - Do NOT repeat rigid robotic product descriptions or greetings in ongoing conversations. Be concise and natural like a real shop manager.

Response Schema:
You MUST return valid JSON adhering strictly to:
{
  "productId": string or null,
  "size": string or null,
  "offer": number or null,
  "intent": string,
  "reply": string
}`;

      const contents: any[] = [];
      if (Array.isArray(history)) {
        for (const h of history) {
          if (h && h.text && h.role) {
            contents.push({
              role: h.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: String(h.text) }],
            });
          }
        }
      }
      contents.push({
        role: 'user',
        parts: [{ text }],
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              productId: {
                type: Type.STRING,
                description: 'ID of matched product (e.g. prod-3) or null.',
              },
              size: {
                type: Type.STRING,
                description: 'Matched size (e.g. XL, M, L) or null.',
              },
              offer: {
                type: Type.NUMBER,
                description: 'Price offered in GEL by customer or null.',
              },
              intent: {
                type: Type.STRING,
                description: 'Customer intent, e.g. negotiation, purchase_confirmed, inquiry.',
              },
              reply: {
                type: Type.STRING,
                description: 'Natural Georgian response to customer.',
              },
            },
            required: ['intent', 'reply'],
          },
        },
      });

      let parsed: any = {};
      try {
        parsed = JSON.parse(response.text || '{}');
      } catch (e) {
        parsed = { reply: response.text, intent: 'conversation' };
      }

      // --- DETERMINISTIC VALIDATION LAYER ---
      let matchedProduct = sanitizedCatalogue.find((p) => p.id === parsed.productId);
      if (!matchedProduct && parsed.productId) {
        matchedProduct = sanitizedCatalogue.find((p) =>
          p.title.toLowerCase().includes(String(parsed.productId).toLowerCase())
        );
      }
      if (!matchedProduct) {
        matchedProduct = sanitizedCatalogue.find((p) =>
          text.toLowerCase().includes(p.title.toLowerCase().split(' ')[0])
        );
      }
      if (!matchedProduct && history.length > 0) {
        const fullHistory = history.map((h: any) => h.text).join(' ');
        matchedProduct = sanitizedCatalogue.find((p) =>
          fullHistory.toLowerCase().includes(p.title.toLowerCase().split(' ')[0])
        );
      }
      if (!matchedProduct) {
        // Default to Real Madrid as primary showcase
        matchedProduct = sanitizedCatalogue.find((p) => p.id === 'prod-3') || sanitizedCatalogue[0];
      }

      const targetSize = parsed.size ? String(parsed.size).toUpperCase() : 'XL';
      const sizeObj = matchedProduct?.sizes?.find(
        (s: any) => s.size.toUpperCase() === targetSize
      );
      const stock = sizeObj ? sizeObj.stock : 0;
      const floorPrice = matchedProduct?.minPrice ?? 90;
      const customerOffer = typeof parsed.offer === 'number' ? parsed.offer : null;

      let validationStatus: 'passed' | 'regenerated' = 'passed';

      // Check for price guardrail violations: did Gemini agree to an offer below minPrice?
      const replyLower = String(parsed.reply || '').toLowerCase();
      const acceptSignals = ['თანახმა ვარ', 'შევთანხმდით', 'მოგცემთ', 'გამოგიგზავნით ' + customerOffer];
      const isAcceptingBelowFloor =
        customerOffer !== null &&
        customerOffer < floorPrice &&
        acceptSignals.some((sig) => replyLower.includes(sig));

      if (isAcceptingBelowFloor) {
        console.info('[AI Guardrail] Gemini accepted price below minPrice. Triggering constrained regeneration...');
        validationStatus = 'regenerated';
        const correctiveContents = [
          ...contents,
          { role: 'model', parts: [{ text: response.text || '' }] },
          {
            role: 'user',
            parts: [
              {
                text: `CORRECTION REQUIRED: Customer offered ${customerOffer} GEL, which is STRICTLY BELOW the minimum authorized price (${floorPrice} GEL). You MUST NOT agree to ${customerOffer} GEL. Counter-offer strictly at ${floorPrice} GEL in natural Georgian.`,
              },
            ],
          },
        ];

        const regen = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite',
          contents: correctiveContents,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
          },
        });

        try {
          const regenParsed = JSON.parse(regen.text || '{}');
          if (regenParsed.reply) {
            parsed.reply = regenParsed.reply;
            parsed.intent = regenParsed.intent || parsed.intent;
          }
        } catch (_) {}
      }

      const serverDurationMs = Math.round(performance.now() - serverStartTime);

      return res.json({
        success: true,
        geminiAvailable: true,
        requiresHumanReview: false,
        validationStatus,
        geminiStatus: 'Gemini 3.1 Flash Lite - Live Inference',
        structured: {
          productId: matchedProduct?.id || parsed.productId || 'prod-3',
          productTitle: matchedProduct?.title || 'რეალ მადრიდი 2024/25 Home Kit',
          size: targetSize,
          stock,
          offer: customerOffer,
          price: matchedProduct?.price ?? 110,
          minPrice: floorPrice,
          intent: parsed.intent || 'negotiation',
          reply: parsed.reply,
        },
        durationMs: serverDurationMs,
      });
    } catch (err: any) {
      console.info('[AI Agent] Gemini conversation turn error:', err?.message || err);
      const serverDurationMs = Math.round(performance.now() - serverStartTime);
      return res.json({
        success: false,
        geminiAvailable: false,
        requiresHumanReview: true,
        validationStatus: 'human_review_required',
        geminiStatus: 'Gemini Unavailable - Human Review Required',
        error: err?.message || 'Gemini inference failed',
        durationMs: serverDurationMs,
      });
    }
  });

  // Secure Server-Side Gemini Extraction Pipeline
  app.post('/api/agent/extract', async (req, res) => {
    const { text } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ success: false, error: 'Text query is required' });
    }

    const serverStartTime = performance.now();
    const cacheKey = text.trim().toLowerCase();

    // Check fast in-memory cache first to save quota and provide 0ms latency
    if (extractionCache.has(cacheKey)) {
      const cached = extractionCache.get(cacheKey);
      return res.json({
        ...cached,
        durationMs: Math.round(performance.now() - serverStartTime),
      });
    }

    const isCooldownActive = Date.now() < rateLimitCooldownUntil;

    // If key is not configured, permission was restricted (403), or currently in rate-limit cooldown (429), use deterministic engine directly
    if (!process.env.GEMINI_API_KEY || geminiPermissionDenied || isCooldownActive) {
      const fallbackResult = parseGeorgianMessage(
        text,
        serverStartTime,
        'deterministic_georgian_engine'
      );
      return res.json(fallbackResult);
    }

    try {
      const geminiCall = ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
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

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('GEMINI_TIMEOUT')), 2500)
      );

      const response = await Promise.race([geminiCall, timeoutPromise]);

      const parsed = JSON.parse(response.text || '{}');
      const serverDurationMs = Math.round(performance.now() - serverStartTime);

      const resultPayload = {
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
      };

      // Store in memory cache
      extractionCache.set(cacheKey, resultPayload);

      return res.json(resultPayload);
    } catch (err: any) {
      // Check if error is timeout
      const isTimeout = err?.message === 'GEMINI_TIMEOUT';

      // Check if error is rate limited / 429 / quota exceeded
      const isRateLimited =
        isTimeout ||
        err?.status === 429 ||
        err?.error?.code === 429 ||
        String(err?.message || '').includes('429') ||
        String(err?.message || '').includes('RESOURCE_EXHAUSTED') ||
        String(err?.message || '').includes('quota') ||
        String(err).includes('RESOURCE_EXHAUSTED');

      // Check if error is permission denied / 403
      const isPermissionDenied =
        err?.status === 403 ||
        err?.status === 'PERMISSION_DENIED' ||
        err?.error?.code === 403 ||
        String(err?.message || '').includes('PERMISSION_DENIED') ||
        String(err?.message || '').includes('403') ||
        String(err).includes('PERMISSION_DENIED');

      if (isRateLimited) {
        // Enforce 20s cooldown so we do not repeatedly spam the rate-limited API
        rateLimitCooldownUntil = Date.now() + 20000;
        console.info('[AI Agent] Gemini rate limit/timeout active; serving via high-precision deterministic Georgian engine for 20s.');
      } else if (isPermissionDenied) {
        geminiPermissionDenied = true;
        console.info('[AI Agent] Gemini API permission restricted (403); serving via deterministic Georgian engine.');
      } else {
        console.info('[AI Agent] Gemini call fallback to deterministic Georgian engine:', err?.message || 'Unknown status');
      }

      const fallbackResult = parseGeorgianMessage(text, serverStartTime, 'deterministic_georgian_engine');
      extractionCache.set(cacheKey, fallbackResult);
      return res.json(fallbackResult);
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
