import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  PageId,
  Product,
  Order,
  Conversation,
  ApprovalRequest,
  AgentReasoningTrace,
  BusinessSettings,
  BenchmarkMetric,
  BenchmarkTestCase,
  Message,
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_CONVERSATIONS,
  INITIAL_APPROVALS,
  INITIAL_TRACES,
  INITIAL_SETTINGS,
  INITIAL_BENCHMARKS,
  BENCHMARK_TEST_CASES,
} from '../data/mockData';

interface AppContextType {
  page: PageId;
  setPage: (p: PageId) => void;
  isAuthenticated: boolean;
  loginWithMeta: () => void;
  logout: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;

  // Conversations & Messaging
  conversations: Conversation[];
  selectedConversationId: string;
  setSelectedConversationId: (id: string) => void;
  selectedConversation: Conversation | undefined;
  sendMessage: (conversationId: string, text: string, sender?: 'customer' | 'ai_agent' | 'human_agent') => void;
  triggerAiResponse: (conversationId: string, userQuery?: string) => void;
  isAiTyping: boolean;

  // Approvals
  approvals: ApprovalRequest[];
  handleApproveRequest: (id: string) => void;
  handleRejectRequest: (id: string) => void;
  handleCounterOffer: (id: string, counterPrice: number) => void;

  // Products
  products: Product[];
  updateProductStock: (productId: string, size: string, delta: number) => void;
  updateProductPrice: (productId: string, price: number, minPrice: number) => void;
  addProduct: (newProd: Omit<Product, 'id'>) => void;

  // Orders
  orders: Order[];
  updateOrderStatus: (orderId: string, status: Order['status']) => void;

  // Settings
  settings: BusinessSettings;
  updateSettings: (newSettings: Partial<BusinessSettings>) => void;

  // AI Activity Traces
  traces: AgentReasoningTrace[];
  runTraceSimulation: (messageText: string) => AgentReasoningTrace;

  // Evaluation & Benchmarks
  benchmarkMetrics: BenchmarkMetric[];
  benchmarkTests: BenchmarkTestCase[];
  runBenchmarkTests: () => Promise<void>;
  isTestingBenchmarks: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [page, setPage] = useState<PageId>('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [selectedConversationId, setSelectedConversationId] = useState<string>('conv-1');
  const [isAiTyping, setIsAiTyping] = useState<boolean>(false);

  const [approvals, setApprovals] = useState<ApprovalRequest[]>(INITIAL_APPROVALS);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [settings, setSettings] = useState<BusinessSettings>(INITIAL_SETTINGS);
  const [traces, setTraces] = useState<AgentReasoningTrace[]>(INITIAL_TRACES);

  const [benchmarkMetrics] = useState<BenchmarkMetric[]>(INITIAL_BENCHMARKS);
  const [benchmarkTests, setBenchmarkTests] = useState<BenchmarkTestCase[]>(BENCHMARK_TEST_CASES);
  const [isTestingBenchmarks, setIsTestingBenchmarks] = useState<boolean>(false);

  // Sync dark mode class on document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  const loginWithMeta = () => {
    setIsAuthenticated(true);
    setPage('dashboard');
  };

  const logout = () => {
    setIsAuthenticated(false);
    setPage('login');
  };

  const selectedConversation = conversations.find((c) => c.id === selectedConversationId);

  const sendMessage = (
    conversationId: string,
    text: string,
    sender: 'customer' | 'ai_agent' | 'human_agent' = 'human_agent'
  ) => {
    if (!text.trim()) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      conversationId,
      sender,
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString('ka-GE', { hour: '2-digit', minute: '2-digit' }),
      read: true,
    };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === conversationId) {
          return {
            ...c,
            lastMessage: newMessage,
            messages: [...c.messages, newMessage],
            unreadCount: sender === 'customer' ? c.unreadCount + 1 : 0,
          };
        }
        return c;
      })
    );
  };

  const triggerAiResponse = (conversationId: string, userQuery?: string) => {
    setIsAiTyping(true);

    const conv = conversations.find((c) => c.id === conversationId);
    const lastCustomerMsg = userQuery || conv?.lastMessage.text || 'გამარჯობა';

    setTimeout(() => {
      let reply = 'გამარჯობა! რით შემიძლია დაგეხმაროთ? გვაქვს საქართველოს ნაკრებისა და რეტრო საფეხბურთო ფორმების უახლესი კოლექცია.';
      let intent = 'general_inquiry';
      let action = 'Answered customer inquiry with active catalog highlights';

      const lower = lastCustomerMsg.toLowerCase();
      if (lower.includes('ფასდაკლებ') || lower.includes('ლარად') || lower.includes('დამიკელი') || lower.includes('50') || lower.includes('60')) {
        intent = 'price_negotiation';
        reply = 'გასაგებია თქვენი შემოთავაზება! ჩვენი მინიმალური ზღვარი 65-75 ლარის ფარგლებშია. შემიძლია სპეციალური ფასი 70 ლარი დაგიდასტუროთ + უფასო მიტანა თბილისში 120₾-ზე ზემოთ!';
        action = 'Applied negotiation policy within margin constraints';
      } else if (lower.includes('ზომა') || lower.includes('მარაგ') || lower.includes('გაქვთ') || lower.includes('ნაკრებ')) {
        intent = 'inventory_check';
        reply = 'დიახ, საქართველოს ნაკრების 2024 წლის თეთრი მაისური კვარაცხელიას ნომრით გვაქვს L და S ზომებში. ფასი 85 ლარია.';
        action = 'Queried database: stock available, active status';
      } else if (lower.includes('მისამართი') || lower.includes('ვიყიდი') || lower.includes('ავიღებ') || lower.includes('მინდა')) {
        intent = 'order_collection';
        reply = 'შესანიშნავია! გთხოვთ მომწეროთ თქვენი მობილურის ნომერი და ზუსტი მისამართი, რათა შეკვეთა კურიერს გადავცეთ.';
        action = 'Initiated order intake checklist';
      }

      const aiMsg: Message = {
        id: `msg-${Date.now()}`,
        conversationId,
        sender: 'ai_agent',
        text: reply,
        timestamp: new Date().toLocaleTimeString('ka-GE', { hour: '2-digit', minute: '2-digit' }),
        read: true,
        aiMetadata: {
          intent,
          actionTaken: action,
          confidence: 0.98,
        },
      };

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === conversationId) {
            return {
              ...c,
              lastMessage: aiMsg,
              messages: [...c.messages, aiMsg],
              unreadCount: 0,
            };
          }
          return c;
        })
      );

      setIsAiTyping(false);
    }, 1200);
  };

  const handleApproveRequest = (approvalId: string) => {
    const appr = approvals.find((a) => a.id === approvalId);
    if (!appr) return;

    setApprovals((prev) =>
      prev.map((a) => (a.id === approvalId ? { ...a, status: 'approved' } : a))
    );

    // Send confirmation message to customer chat
    sendMessage(
      appr.conversationId,
      `დადებითი სიახლე! 🎉 თქვენი მოთხოვნა ფასდაკლებაზე (${appr.requestedPrice}₾) დამტკიცდა მენეჯერის მიერ. გთხოვთ მოგვაწოდოთ მიტანის მისამართი და ტელეფონის ნომერი.`,
      'human_agent'
    );

    // Update conversation status to active
    setConversations((prev) =>
      prev.map((c) =>
        c.id === appr.conversationId
          ? {
              ...c,
              status: 'active',
              timeline: {
                ...c.timeline,
                discountEvaluated: {
                  details: `მენეჯერმა დაამტკიცა მოთხოვნილი ფასი: ${appr.requestedPrice}₾`,
                  timestamp: new Date().toLocaleTimeString('ka-GE', { hour: '2-digit', minute: '2-digit' }),
                },
              },
            }
          : c
      )
    );
  };

  const handleRejectRequest = (approvalId: string) => {
    const appr = approvals.find((a) => a.id === approvalId);
    if (!appr) return;

    setApprovals((prev) =>
      prev.map((a) => (a.id === approvalId ? { ...a, status: 'rejected' } : a))
    );

    sendMessage(
      appr.conversationId,
      `მოგესალმებით. სამწუხაროდ, ${appr.requestedPrice} ლარად ამ მოდელს ვერ დაგითმობთ თვითღირებულებიდან გამომდინარე. შეგვიძლია შემოგთავაზოთ საწყისი ფასიდან 10% ფასდაკლება (${Math.round(appr.originalPrice * 0.9)}₾).`,
      'human_agent'
    );
  };

  const handleCounterOffer = (approvalId: string, counterPrice: number) => {
    const appr = approvals.find((a) => a.id === approvalId);
    if (!appr) return;

    setApprovals((prev) =>
      prev.map((a) =>
        a.id === approvalId ? { ...a, status: 'countered', recommendedCounterOffer: counterPrice } : a
      )
    );

    sendMessage(
      appr.conversationId,
      `გამარჯობა! თქვენს მოთხოვნასთან დაკავშირებით შევათანხმეთ მაქსიმალური კომპრომისი: მზად ვართ მოგცეთ ${counterPrice} ლარად. შეგინახოთ ეს ეგზემპლარი?`,
      'human_agent'
    );

    setConversations((prev) =>
      prev.map((c) =>
        c.id === appr.conversationId
          ? {
              ...c,
              status: 'active',
              timeline: {
                ...c.timeline,
                discountEvaluated: {
                  details: `კონტრშეთავაზება გაიგზავნა: ${counterPrice}₾`,
                  timestamp: new Date().toLocaleTimeString('ka-GE', { hour: '2-digit', minute: '2-digit' }),
                },
              },
            }
          : c
      )
    );
  };

  const updateProductStock = (productId: string, sizeName: string, delta: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const newSizes = p.sizes.map((s) =>
            s.size === sizeName ? { ...s, stock: Math.max(0, s.stock + delta) } : s
          );
          const total = newSizes.reduce((sum, item) => sum + item.stock, 0);
          const status = total === 0 ? 'out_of_stock' : total <= 5 ? 'low_stock' : 'active';
          return { ...p, sizes: newSizes, totalStock: total, status };
        }
        return p;
      })
    );
  };

  const updateProductPrice = (productId: string, price: number, minPrice: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, price, minPrice } : p))
    );
  };

  const addProduct = (newProd: Omit<Product, 'id'>) => {
    const created: Product = {
      ...newProd,
      id: `prod-${Date.now()}`,
    };
    setProducts((prev) => [created, ...prev]);
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
  };

  const updateSettings = (newSettings: Partial<BusinessSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const runTraceSimulation = (messageText: string): AgentReasoningTrace => {
    const isDiscount = messageText.includes('ლარ') || messageText.includes('ფას') || messageText.includes('50');
    const newTrace: AgentReasoningTrace = {
      id: `trc-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('ka-GE', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      customerMessage: messageText,
      intent: isDiscount ? 'DISCOUNT_NEGOTIATION' : 'PRODUCT_INQUIRY',
      inventoryLookup: {
        product: 'საქართველოს ნაკრები 2024 (კვარაცხელია #7)',
        size: 'L',
        inStock: true,
        quantity: 5,
      },
      pricingRules: {
        basePrice: 85,
        minAllowedPrice: 65,
        requestedPrice: isDiscount ? 55 : 85,
        allowedDiscount: 20,
        actionRecommended: isDiscount ? 'COUNTER_OFFER_OR_ESCALATE' : 'PROVIDE_INFO',
      },
      decision: isDiscount
        ? 'PROPOSE_COUNTER_OFFER (Offer 70₾ with high confidence, protect 25% margin)'
        : 'AUTONOMOUS_CONFIRMATION (Catalog product matched)',
      finalResponse: isDiscount
        ? 'შეგვიძლია შემოგთავაზოთ 70 ლარად და უფასო მიტანა თბილისში.'
        : 'დიახ, გვაქვს L ზომაში, ფასი 85 ლარია.',
      executionTimeMs: Math.floor(Math.random() * 120) + 180,
      confidenceScore: 0.985,
      toolCalls: ['query_product_db()', 'evaluate_pricing_engine()', 'synthesize_georgian_dm()'],
    };

    setTraces((prev) => [newTrace, ...prev]);
    return newTrace;
  };

  const runBenchmarkTests = async () => {
    setIsTestingBenchmarks(true);
    setBenchmarkTests((prev) => prev.map((tc) => ({ ...tc, status: 'running' })));

    for (let i = 0; i < benchmarkTests.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 350));
      setBenchmarkTests((prev) =>
        prev.map((tc, index) => (index === i ? { ...tc, status: 'passed' } : tc))
      );
    }

    setIsTestingBenchmarks(false);
  };

  return (
    <AppContext.Provider
      value={{
        page,
        setPage,
        isAuthenticated,
        loginWithMeta,
        logout,
        isDarkMode,
        toggleDarkMode,
        conversations,
        selectedConversationId,
        setSelectedConversationId,
        selectedConversation,
        sendMessage,
        triggerAiResponse,
        isAiTyping,
        approvals,
        handleApproveRequest,
        handleRejectRequest,
        handleCounterOffer,
        products,
        updateProductStock,
        updateProductPrice,
        addProduct,
        orders,
        updateOrderStatus,
        settings,
        updateSettings,
        traces,
        runTraceSimulation,
        benchmarkMetrics,
        benchmarkTests,
        runBenchmarkTests,
        isTestingBenchmarks,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
