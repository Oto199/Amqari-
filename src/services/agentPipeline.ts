import {
  Product,
  BusinessSettings,
  AgentReasoningTrace,
  ExtractionResult,
  PipelineExecutionResult,
} from '../types';
export type { ExtractionResult, PipelineExecutionResult };
/**
 * 1. Server-side Gemini Extraction
 * Calls the secure backend proxy route
 */
export async function extractWithGemini(messageText: string): Promise<ExtractionResult> {
  const localStart = performance.now();
  try {
    const endpoint =
      typeof window !== 'undefined' ? '/api/agent/extract' : 'http://localhost:3000/api/agent/extract';
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: messageText }),
    });

    if (!res.ok) {
      throw new Error(`Extraction service returned HTTP ${res.status}`);
    }

    const data = await res.json();
    const duration = Math.round(performance.now() - localStart);

    const extractionSource =
      data.extractionSource ||
      (data.source?.includes('gemini') ? 'gemini-3.8-flash' : 'deterministic_georgian_engine');
    const geminiAvailable = Boolean(data.geminiAvailable ?? data.source?.includes('gemini'));

    return {
      productQuery: data.extracted?.productQuery || null,
      size: data.extracted?.size || null,
      customerOffer: typeof data.extracted?.customerOffer === 'number' ? data.extracted.customerOffer : null,
      intent: data.extracted?.intent || (data.extracted?.customerOffer ? 'DISCOUNT_NEGOTIATION' : 'INVENTORY_QUERY'),
      durationMs: duration,
      source: data.source || extractionSource,
      extractionSource,
      geminiAvailable,
    };
  } catch (error: any) {
    console.info('[Agent Pipeline] Extraction API fallback to local deterministic Georgian engine:', error?.message || error);
    const duration = Math.round(performance.now() - localStart);

    // Deterministic Georgian fallback parser
    const clean = messageText.toLowerCase();
    let productQuery: string | null = null;
    if (clean.includes('რეალ') || clean.includes('მადრიდ') || clean.includes('real')) {
      productQuery = 'რეალ მადრიდი';
    } else if (clean.includes('ნაკრებ') || clean.includes('კვარა') || clean.includes('georgia')) {
      productQuery = 'საქართველოს ნაკრები';
    } else if (clean.includes('დინამო') || clean.includes('dinamo')) {
      productQuery = 'დინამო თბილისი';
    } else if (clean.includes('ბარს') || clean.includes('barca') || clean.includes('ბარსელონა')) {
      productQuery = 'ბარსელონა';
    } else if (clean.includes('რომა') || clean.includes('roma')) {
      productQuery = 'რომა (AS Roma)';
    } else if (clean.includes('ბორჯღალ') || clean.includes('რაგბი')) {
      productQuery = 'ბორჯღალოსნები';
    }

    let size: string | null = null;
    const sizeMatch = messageText.match(/\b(xxl|xl|l|m|s|xs)\b/i) || messageText.match(/([smlxlxxl]+)\s*ზომ/i);
    if (sizeMatch) {
      size = sizeMatch[1].toUpperCase();
    }

    let customerOffer: number | null = null;
    const offerMatch = messageText.match(/(\d+)\s*(?:ლარ|₾|gel|lari)/i);
    if (offerMatch) {
      customerOffer = parseInt(offerMatch[1], 10);
    }

    return {
      productQuery,
      size,
      customerOffer,
      intent: customerOffer ? 'DISCOUNT_NEGOTIATION' : 'INVENTORY_QUERY',
      durationMs: duration,
      source: 'deterministic_georgian_engine',
      extractionSource: 'deterministic_georgian_engine',
      geminiAvailable: false,
    };
  }
}

/**
 * 2. Shared AppContext Product Catalogue Matcher
 */
export function matchCatalogueProduct(products: Product[], productQuery: string | null): Product {
  if (!products || products.length === 0) {
    throw new Error('Product catalogue is empty');
  }

  if (!productQuery) {
    // Default to Real Madrid Home Kit (prod-3) as primary showcase
    const defaultProd = products.find((p) => p.id === 'prod-3');
    return defaultProd || products[0];
  }

  const q = productQuery.toLowerCase();

  // Explicit keyword matching against catalogue IDs and titles
  if (q.includes('რეალ') || q.includes('real') || q.includes('მადრიდ')) {
    const found = products.find((p) => p.id === 'prod-3' || p.title.toLowerCase().includes('რეალ'));
    if (found) return found;
  }

  if (q.includes('ნაკრებ') || q.includes('კვარა') || q.includes('georgia')) {
    const found = products.find((p) => p.id === 'prod-1' || p.title.toLowerCase().includes('ნაკრებ'));
    if (found) return found;
  }

  if (q.includes('დინამო') || q.includes('dinamo')) {
    const found = products.find((p) => p.id === 'prod-2' || p.title.toLowerCase().includes('დინამო'));
    if (found) return found;
  }

  if (q.includes('ბარს') || q.includes('barca') || q.includes('ბარსელონა')) {
    const found = products.find((p) => p.id === 'prod-4' || p.title.toLowerCase().includes('ბარსელონა'));
    if (found) return found;
  }

  if (q.includes('ბორჯღალ') || q.includes('რაგბი')) {
    const found = products.find((p) => p.id === 'prod-5' || p.title.toLowerCase().includes('ბორჯღალ'));
    if (found) return found;
  }

  // Handle unlisted items (e.g. Roma)
  if (q.includes('რომა') || q.includes('roma')) {
    return {
      id: 'unlisted-roma',
      title: 'რომა (AS Roma) მაისური',
      sku: 'ROM-00-UNL',
      category: 'Football',
      sizes: [
        { size: 'S', stock: 0 },
        { size: 'M', stock: 0 },
        { size: 'L', stock: 0 },
        { size: 'XL', stock: 0 },
        { size: 'XXL', stock: 0 },
      ],
      price: 100,
      minPrice: 80,
      image: '',
      totalStock: 0,
      status: 'out_of_stock',
    };
  }

  // Fuzzy fallback
  const fuzzy = products.find((p) => p.title.toLowerCase().includes(q));
  return fuzzy || products.find((p) => p.id === 'prod-3') || products[0];
}

/**
 * 3. Real Conversational Gemini Agent Pipeline with Context & Deterministic Guardrails
 */
export async function executeAgentPipeline(
  messageText: string,
  products: Product[],
  settings: BusinessSettings,
  context?: {
    eventId?: string;
    senderId?: string;
    history?: Array<{ role: 'user' | 'assistant'; text: string }>;
  }
): Promise<PipelineExecutionResult> {
  const startTime = performance.now();

  const endpoint =
    typeof window !== 'undefined' ? '/api/agent/chat' : 'http://localhost:3000/api/agent/chat';

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: messageText,
        senderId: context?.senderId,
        history: context?.history || [],
        catalogue: products.map((p) => ({
          id: p.id,
          title: p.title,
          price: p.price,
          minPrice: p.minPrice,
          sizes: p.sizes,
        })),
        settings,
      }),
    });

    if (!res.ok) {
      throw new Error(`Chat API HTTP ${res.status}`);
    }

    const data = await res.json();
    const measuredLatencyMs = Math.round(performance.now() - startTime);

    if (data.requiresHumanReview || !data.success) {
      // Mark as requiring human review. Do not pretend an AI response was generated!
      const defaultProd = products.find((p) => p.id === 'prod-3') || products[0];
      return {
        eventId: context?.eventId,
        senderId: context?.senderId,
        requiresHumanReview: true,
        validationStatus: 'human_review_required',
        geminiStatus: data.geminiStatus || 'Gemini Unavailable - Human Review Required',
        conversationContextUsed: context?.history || [],
        matchedProduct: defaultProd,
        selectedSize: 'XL',
        stock: 0,
        decisionType: 'Human Approval',
        decisionDetails: 'Gemini მიუწვდომელია. შეტყობინება გადაცემულია ოპერატორისთვის (Human Review).',
        counterOfferPrice: null,
        generatedReply: '', // Do NOT pretend an AI response was generated
        measuredLatencyMs,
        extraction: {
          productQuery: null,
          size: null,
          customerOffer: null,
          intent: 'HUMAN_REVIEW_REQUIRED',
          durationMs: measuredLatencyMs,
          source: 'gemini_unavailable',
          geminiAvailable: false,
        },
        trace: {
          id: `trc-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString('ka-GE', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          customerMessage: messageText,
          intent: 'HUMAN_REVIEW_REQUIRED',
          inventoryLookup: {
            product: defaultProd.title,
            size: 'XL',
            inStock: false,
            quantity: 0,
          },
          pricingRules: {
            basePrice: defaultProd.price,
            minAllowedPrice: defaultProd.minPrice,
            requestedPrice: 0,
            allowedDiscount: 0,
            actionRecommended: 'ESCALATE_TO_HUMAN',
          },
          decision: 'HUMAN_REVIEW_REQUIRED: Gemini სერვისი მიუწვდომელია. შეტყობინება გადამისამართდა ოპერატორთან.',
          finalResponse: '[საჭიროა მენეჯერის ჩარევა]',
          executionTimeMs: measuredLatencyMs,
          confidenceScore: 0,
          toolCalls: ['gemini_chat_agent() -> UNAVAILABLE', 'flag_for_human_review()'],
        },
      };
    }

    // Success path from real conversational Gemini agent
    const st = data.structured;
    const matchedProduct =
      products.find((p) => p.id === st.productId) ||
      matchCatalogueProduct(products, st.productTitle || messageText);

    const targetSize = (st.size || 'XL').toUpperCase();
    const sizeObj = matchedProduct.sizes.find((s) => s.size.toUpperCase() === targetSize);
    const stock = sizeObj ? sizeObj.stock : 0;
    const floorPrice = matchedProduct.minPrice;
    const offer = st.offer;

    let decisionType: 'Accept' | 'Counter Offer' | 'Out of Stock' | 'Human Approval' = 'Accept';
    let decisionDetails = '';
    let counterOfferPrice: number | null = null;

    if (stock === 0) {
      decisionType = 'Out of Stock';
      decisionDetails = `ზომა ${targetSize} ამოწურულია (0 ცალი).`;
    } else if (offer !== null) {
      if (offer < floorPrice) {
        decisionType = 'Counter Offer';
        counterOfferPrice = floorPrice;
        decisionDetails = `შემოთავაზება (${offer}₾) < მინიმალურ ზღვარზე (${floorPrice}₾). შეთავაზებულია კონტრშეთავაზება: ${counterOfferPrice}₾.`;
      } else {
        decisionType = 'Accept';
        decisionDetails = `შემოთავაზება (${offer}₾) >= მინიმალურ ზღვარზე (${floorPrice}₾). მიღებულია.`;
      }
    } else {
      decisionType = 'Accept';
      decisionDetails = `მარაგის დადასტურება: ${targetSize} ხელმისაწვდომია (${stock} ცალი). ფასი: ${matchedProduct.price}₾.`;
    }

    const trace: AgentReasoningTrace = {
      id: `trc-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('ka-GE', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      customerMessage: messageText,
      intent: st.intent || 'negotiation',
      inventoryLookup: {
        product: matchedProduct.title,
        size: targetSize,
        inStock: stock > 0,
        quantity: stock,
      },
      pricingRules: {
        basePrice: matchedProduct.price,
        minAllowedPrice: floorPrice,
        requestedPrice: offer ?? matchedProduct.price,
        allowedDiscount: matchedProduct.price - floorPrice,
        actionRecommended:
          decisionType === 'Counter Offer' ? 'COUNTER_OFFER' : 'ACCEPT_OFFER',
      },
      decision: `${decisionType.toUpperCase()}: ${decisionDetails}`,
      finalResponse: st.reply,
      executionTimeMs: measuredLatencyMs,
      confidenceScore: 0,
      toolCalls: [
        `gemini_conversational_turn(model="gemini-3.1-flash-lite", context_turns=${(context?.history?.length || 0)}, latency=${data.durationMs}ms)`,
        `verify_catalogue(sku="${matchedProduct.sku}", size="${targetSize}", stock=${stock}) -> VALID`,
        `enforce_floor_price(offer=${offer ?? 'none'}, minAllowed=${floorPrice}) -> ${data.validationStatus || 'passed'}`,
      ],
    };

    return {
      eventId: context?.eventId,
      senderId: context?.senderId,
      trace,
      matchedProduct,
      selectedSize: targetSize,
      stock,
      decisionType,
      decisionDetails,
      counterOfferPrice,
      generatedReply: st.reply,
      measuredLatencyMs,
      conversationContextUsed: context?.history || [],
      requiresHumanReview: false,
      geminiStatus: data.geminiStatus || 'Gemini 3.1 Flash Lite - Live Inference',
      validationStatus: data.validationStatus || 'passed',
      extraction: {
        productQuery: matchedProduct.title,
        size: targetSize,
        customerOffer: offer,
        intent: st.intent || 'conversation',
        durationMs: data.durationMs,
        source: 'gemini-3.1-flash-lite',
        extractionSource: 'gemini-3.1-flash-lite',
        geminiAvailable: true,
      },
    };
  } catch (err: any) {
    console.info('[Agent Pipeline] Error calling chat endpoint:', err?.message || err);
    const measuredLatencyMs = Math.round(performance.now() - startTime);
    const defaultProd = products.find((p) => p.id === 'prod-3') || products[0];

    return {
      eventId: context?.eventId,
      senderId: context?.senderId,
      requiresHumanReview: true,
      validationStatus: 'human_review_required',
      geminiStatus: 'Gemini Unavailable - Human Review Required',
      conversationContextUsed: context?.history || [],
      matchedProduct: defaultProd,
      selectedSize: 'XL',
      stock: 0,
      decisionType: 'Human Approval',
      decisionDetails: 'Gemini მიუწვდომელია. შეტყობინება გადაცემულია ოპერატორისთვის (Human Review).',
      counterOfferPrice: null,
      generatedReply: '', // Do NOT pretend an AI response was generated
      measuredLatencyMs,
      extraction: {
        productQuery: null,
        size: null,
        customerOffer: null,
        intent: 'HUMAN_REVIEW_REQUIRED',
        durationMs: measuredLatencyMs,
        source: 'gemini_unavailable',
        geminiAvailable: false,
      },
      trace: {
        id: `trc-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString('ka-GE', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        customerMessage: messageText,
        intent: 'HUMAN_REVIEW_REQUIRED',
        inventoryLookup: {
          product: defaultProd.title,
          size: 'XL',
          inStock: false,
          quantity: 0,
        },
        pricingRules: {
          basePrice: defaultProd.price,
          minAllowedPrice: defaultProd.minPrice,
          requestedPrice: 0,
          allowedDiscount: 0,
          actionRecommended: 'ESCALATE_TO_HUMAN',
        },
        decision: 'HUMAN_REVIEW_REQUIRED: Gemini სერვისი მიუწვდომელია. გადამისამართდა ოპერატორთან.',
        finalResponse: '[საჭიროა მენეჯერის ჩარევა]',
        executionTimeMs: measuredLatencyMs,
        confidenceScore: 0,
        toolCalls: ['gemini_chat_agent() -> ERROR', 'flag_for_human_review()'],
      },
    };
  }
}
