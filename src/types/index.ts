export type PageId =
  | 'demoday'
  | 'login'
  | 'dashboard'
  | 'inbox'
  | 'activity'
  | 'approvals'
  | 'products'
  | 'orders'
  | 'analytics'
  | 'settings'
  | 'evaluation';

export interface BackendMessage {
  sender_id: string;
  text: string;
  received_at: string;
  event_id?: string;
  instagram_timestamp?: string;
  [key: string]: any;
}

export type ProductStatus = 'active' | 'low_stock' | 'out_of_stock';

export interface Product {
  id: string;
  title: string;
  sku: string;
  category: string;
  sizes: {
    size: 'S' | 'M' | 'L' | 'XL' | 'XXL';
    stock: number;
  }[];
  price: number; // in GEL (₾)
  minPrice: number; // Floor price allowed for AI negotiation
  image: string;
  totalStock: number;
  status: ProductStatus;
}

export type OrderStatus = 'pending' | 'confirmed' | 'packed' | 'shipped' | 'delivered';

export interface OrderItem {
  productId: string;
  title: string;
  size: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  customerName: string;
  instagramHandle: string;
  phone: string;
  address: string;
  city: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
  paymentMethod: 'courier_cod' | 'bog_transfer' | 'tbc_pay';
  trackingNumber?: string;
}

export type RiskLevel = 'low' | 'medium' | 'high';

export interface Customer {
  id: string;
  name: string;
  handle: string;
  avatarUrl: string;
  previousOrdersCount: number;
  lifetimeValue: number; // GEL
  riskLevel: RiskLevel;
  riskReason: string;
  phone: string;
  city: string;
  notes?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  sender: 'customer' | 'ai_agent' | 'human_agent';
  text: string;
  timestamp: string;
  sender_id?: string;
  received_at?: string;
  read?: boolean;
  aiMetadata?: {
    intent: string;
    productMatch?: string;
    inventoryChecked?: boolean;
    discountOffered?: number;
    actionTaken: string;
    confidence: number;
  };
}

export interface AiTimeline {
  productIdentified?: { name: string; timestamp: string };
  inventoryChecked?: { details: string; timestamp: string };
  discountEvaluated?: { details: string; timestamp: string };
  orderCreated?: { orderId: string; timestamp: string };
}

export type AgentProcessingStatus =
  | 'received'
  | 'processing'
  | 'completed'
  | 'failed';

export interface ExtractionResult {
  productQuery: string | null;
  size: string | null;
  customerOffer: number | null;
  intent: string;
  durationMs: number;
  source: string;
  extractionSource?: string;
  geminiAvailable?: boolean;
}

export interface PipelineExecutionResult {
  eventId?: string;
  senderId?: string;
  trace: AgentReasoningTrace;
  matchedProduct: Product;
  selectedSize: string;
  stock: number;
  decisionType: 'Accept' | 'Counter Offer' | 'Out of Stock' | 'Human Approval';
  decisionDetails: string;
  counterOfferPrice: number | null;
  generatedReply: string;
  measuredLatencyMs: number;
  extraction: ExtractionResult;
  repliedToChat?: boolean;
}

export interface Conversation {
  id: string;
  customer: Customer;
  lastMessage: Message;
  messages: Message[];
  unreadCount: number;
  status: 'active' | 'pending_approval' | 'resolved' | 'closed';
  aiHandled: boolean;
  orderId?: string;
  timeline: AiTimeline;
  latestAgentResult?: PipelineExecutionResult;
  lastEventId?: string;
  agentProcessingStatus?: AgentProcessingStatus;
}

export interface ApprovalRequest {
  id: string;
  conversationId: string;
  customer: Customer;
  productTitle: string;
  productImage: string;
  size: string;
  originalPrice: number;
  requestedPrice: number;
  requestedDiscountPct: number;
  recommendedAction: string;
  recommendedCounterOffer: number;
  status: 'pending' | 'approved' | 'rejected' | 'countered';
  reasoning: string;
  createdAt: string;
}

export interface AgentReasoningTrace {
  id: string;
  timestamp: string;
  customerMessage: string;
  intent: string;
  inventoryLookup: {
    product: string;
    size: string;
    inStock: boolean;
    quantity: number;
  };
  pricingRules: {
    basePrice: number;
    minAllowedPrice: number;
    requestedPrice: number;
    allowedDiscount: number;
    actionRecommended: string;
  };
  decision: string;
  finalResponse: string;
  executionTimeMs: number;
  confidenceScore: number;
  toolCalls: string[];
}

export interface BusinessSettings {
  metaConnected: boolean;
  instagramAccount: string;
  facebookPage: string;
  autoReplyEnabled: boolean;
  minDiscountPct: number;
  maxAutoDiscountPct: number;
  requireApprovalAboveDiscountThreshold: number;
  workingHours247: boolean;
  toneOfVoice: 'friendly' | 'formal' | 'concise';
  standardDeliveryFeeTbilisi: number;
  standardDeliveryFeeRegions: number;
  freeDeliveryThreshold: number;
  notifyOnEscalationTelegram: boolean;
}

export interface BenchmarkMetric {
  title: string;
  score: number; // percentage
  target: number;
  trend: string;
  description: string;
}

export interface BenchmarkTestCase {
  id: string;
  category: 'Intent' | 'Inventory' | 'Negotiation' | 'Hallucination' | 'Order';
  prompt: string;
  expectedBehavior: string;
  status: 'passed' | 'failed' | 'running';
  latencyMs: number;
  accuracyScore: number;
  logDetails: string;
}
