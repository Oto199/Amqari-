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
    console.warn('Extraction API network error, utilizing local deterministic Georgian engine:', error);
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
 * 3. Deterministic Inventory & Pricing Rules Decision Engine
 */
export async function executeAgentPipeline(
  messageText: string,
  products: Product[],
  settings: BusinessSettings,
  context?: { eventId?: string; senderId?: string }
): Promise<PipelineExecutionResult> {
  const startTime = performance.now();

  // Step 1: Server-Side Extraction
  const extraction = await extractWithGemini(messageText);

  // Step 2: Shared Catalogue Lookup
  const product = matchCatalogueProduct(products, extraction.productQuery);

  // Step 3: Size & Variant Inventory Verification
  const targetSize = (extraction.size || 'M').toUpperCase();
  const variant = product.sizes.find((s) => s.size.toUpperCase() === targetSize);
  const stock = variant ? variant.stock : 0;

  // Step 4: Deterministic Pricing Decision Rules
  const catalogPrice = product.price;
  const floorPrice = product.minPrice; // Strict Floor Price (e.g. 90 GEL for Real Madrid)
  const offer = extraction.customerOffer;

  let decisionType: 'Accept' | 'Counter Offer' | 'Out of Stock' | 'Human Approval' = 'Accept';
  let decisionDetails = '';
  let counterOfferPrice: number | null = null;
  let generatedReply = '';

  const isUnlisted = product.id.startsWith('unlisted');

  if (isUnlisted) {
    decisionType = 'Out of Stock';
    decisionDetails = `პროდუქტი (${product.title}) ამჟამად არ არის კატალოგში.`;
    generatedReply = `გამარჯობა.\nსამწუხაროდ, ${product.title} ამჟამად არ გვაქვს კატალოგში.\nხელმისაწვდომია რეალ მადრიდის, ბარსელონას და საქართველოს ნაკრების ფორმები.\nშეგირჩიოთ ალტერნატიული მოდელი?`;
  } else if (stock === 0) {
    decisionType = 'Out of Stock';
    decisionDetails = `მარაგი ამოწურულია: ${targetSize} ზომა არის 0 ცალი.`;
    const available = product.sizes.filter((s) => s.stock > 0).map((s) => `${s.size} (${s.stock} ც)`).join(', ');
    generatedReply = `გამარჯობა.\nსამწუხაროდ, ${product.title} ${targetSize} ზომაში ამოწურულია.\n${
      available ? `ხელმისაწვდომია სხვა ზომები: ${available}.` : 'მალე შევავსებთ მარაგს.'
    }\nშეგირჩიოთ ალტერნატიული მოდელი?`;
  } else if (offer !== null) {
    // Customer proposed a price (e.g. 50 GEL)
    if (offer < floorPrice) {
      // VIOLATION of floor price: MUST NOT ACCEPT!
      // In accordance with policy, recommend counter-offer at floor price
      counterOfferPrice = floorPrice; // Minimum allowed price (e.g. 90 GEL)
      decisionType = 'Counter Offer';
      decisionDetails = `შემოთავაზება (${offer}₾) მინიმალურ ზღვარზე (${floorPrice}₾) ნაკლებია. მიღება აკრძალულია. კონტრშეთავაზება: ${counterOfferPrice}₾.`;

      // Georgian reply without exposing internal "floor-price" or "თვითღირებულება" jargon
      generatedReply = `გამარჯობა.\n${product.title} ${targetSize} ზომაში გვაქვს მარაგში (${stock} ცალი).\nფასი არის ${catalogPrice} ლარი.\nშეგვიძლია შემოგთავაზოთ საუკეთესო ფასი ${counterOfferPrice} ლარი.\nგსურთ შეკვეთის გაფორმება?`;
    } else if (offer >= floorPrice && offer < catalogPrice) {
      const discountPct = Math.round(((catalogPrice - offer) / catalogPrice) * 100);
      if (discountPct > settings.requireApprovalAboveDiscountThreshold) {
        // High discount requiring supervisor approval
        decisionType = 'Human Approval';
        counterOfferPrice = Math.max(floorPrice, Math.round(catalogPrice * (1 - settings.maxAutoDiscountPct / 100)));
        decisionDetails = `მოთხოვნილი ფასდაკლება (${discountPct}%) აღემატება ავტომატურ ზღვარს (${settings.requireApprovalAboveDiscountThreshold}%). გადამისამართდა მენეჯერთან.`;
        generatedReply = `გამარჯობა.\n${product.title} ${targetSize} ზომაში გვაქვს (${stock} ცალი).\nთქვენს შემოთავაზებას (${offer} ლარი) განვიხილავთ მენეჯერთან და 2 წუთში დაგიბრუნდებით.`;
      } else {
        // Within acceptable discount
        decisionType = 'Accept';
        decisionDetails = `შემოთავაზება (${offer}₾) დასაშვებ ფარგლებშია (ფასდაკლება: ${discountPct}%). მიღებულია.`;
        generatedReply = `გამარჯობა.\n${product.title} ${targetSize} ზომაში ხელმისაწვდომია (${stock} ცალი).\nთანახმა ვართ თქვენს შემოთავაზებაზე — ${offer} ლარი.\nგსურთ შეკვეთის გაფორმება?`;
      }
    } else {
      // Offer >= Catalog Price
      decisionType = 'Accept';
      decisionDetails = `სტანდარტული კატალოგის ფასი: ${catalogPrice}₾. მიღებულია.`;
      generatedReply = `გამარჯობა.\n${product.title} ${targetSize} ზომაში ხელმისაწვდომია მარაგში (${stock} ცალი).\nფასი არის ${catalogPrice} ლარი.\nგსურთ შეკვეთის გაფორმება?`;
    }
  } else {
    // Pure inventory/price inquiry
    decisionType = 'Accept';
    decisionDetails = `მარაგის დადასტურება: ${targetSize} ზომა ხელმისაწვდომია (${stock} ცალი). ფასი: ${catalogPrice}₾.`;
    generatedReply = `გამარჯობა.\n${product.title} ${targetSize} ზომა ხელმისაწვდომია (${stock} ცალი).\nფასი არის ${catalogPrice} ლარი.\nგსურთ შეკვეთის გაფორმება?`;
  }

  // Measure latency with high precision
  const measuredLatencyMs = Math.round(performance.now() - startTime);

  const engineName = extraction.geminiAvailable ? 'gemini-3.8-flash' : 'deterministic_georgian_engine';

  const trace: AgentReasoningTrace = {
    id: `trc-${Date.now()}`,
    timestamp: new Date().toLocaleTimeString('ka-GE', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    customerMessage: messageText,
    intent: extraction.intent,
    inventoryLookup: {
      product: product.title,
      size: targetSize,
      inStock: stock > 0,
      quantity: stock,
    },
    pricingRules: {
      basePrice: catalogPrice,
      minAllowedPrice: floorPrice,
      requestedPrice: offer ?? catalogPrice,
      allowedDiscount: catalogPrice - floorPrice,
      actionRecommended:
        decisionType === 'Counter Offer'
          ? 'COUNTER_OFFER'
          : decisionType === 'Human Approval'
          ? 'ESCALATE_TO_HUMAN'
          : 'ACCEPT_OFFER',
    },
    decision: `${decisionType.toUpperCase()}: ${decisionDetails}`,
    finalResponse: generatedReply,
    executionTimeMs: measuredLatencyMs,
    confidenceScore: 0, // 0 indicates no artificial confidence was fabricated
    toolCalls: [
      `extract_entities(engine="${engineName}", geminiAvailable=${extraction.geminiAvailable}, latency=${extraction.durationMs}ms)`,
      `lookup_catalogue(sku="${product.id}", size="${targetSize}") -> stock=${stock}`,
      `evaluate_pricing(base=${catalogPrice}, floor=${floorPrice}, offer=${offer ?? 'none'}) -> ${decisionType}`,
    ],
  };

  return {
    eventId: context?.eventId,
    senderId: context?.senderId,
    trace,
    matchedProduct: product,
    selectedSize: targetSize,
    stock,
    decisionType,
    decisionDetails,
    counterOfferPrice,
    generatedReply,
    measuredLatencyMs,
    extraction,
  };
}
