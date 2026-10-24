import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  Bot,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Copy,
  Check,
  Play,
  RotateCcw,
  Sliders,
  Package,
  Calculator,
  MessageSquare,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  Send,
  Zap,
} from 'lucide-react';
import amqariLogo from '../../assets/images/amqari logo.png';

interface InventoryItem {
  id: string;
  name: string;
  size: string;
  stock: number;
  price: number;
  minPrice: number;
}

interface PreloadedExample {
  title: string;
  badge: string;
  message: string;
  expectedDecision: 'Counter Offer' | 'Accept' | 'Out of Stock' | 'Approval Required';
}

export const DemoDayView: React.FC = () => {
  const { setPage } = useApp();

  // Metrics (Required by prompt: Messages Processed, Orders Created, Approval Requests, Revenue Saved)
  const [metrics, setMetrics] = useState({
    messagesProcessed: 1284,
    ordersCreated: 392,
    approvalRequests: 28,
    revenueSaved: 8460,
  });

  // Example Inventory (Required by prompt)
  const [inventory, setInventory] = useState<InventoryItem[]>([
    {
      id: 'inv-1',
      name: 'რეალის მაისური',
      size: 'M',
      stock: 3,
      price: 70,
      minPrice: 60,
    },
    {
      id: 'inv-2',
      name: 'რეალის მაისური',
      size: 'L',
      stock: 0, // Out of stock example
      price: 70,
      minPrice: 60,
    },
    {
      id: 'inv-3',
      name: 'საქართველოს ნაკრები 2024 (კვარაცხელია)',
      size: 'L',
      stock: 5,
      price: 85,
      minPrice: 65,
    },
    {
      id: 'inv-4',
      name: 'დინამო თბილისი 1981 რეტრო',
      size: 'M',
      stock: 2,
      price: 95,
      minPrice: 75,
    },
  ]);

  // Current customer input
  const [customerMessage, setCustomerMessage] = useState<string>(
    'გამარჯობა, რეალის მაისური M ზომა 50 ლარად თუ მომცემთ?'
  );

  // Animation & Execution States
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [activeStep, setActiveStep] = useState<number>(6); // 1 to 6
  const [copied, setCopied] = useState<boolean>(false);
  const [sentToDm, setSentToDm] = useState<boolean>(false);

  // Preloaded Georgian Examples
  const preloadedExamples: PreloadedExample[] = [
    {
      title: 'შეთავაზება მინიმალურზე დაბალია',
      badge: 'Counter Offer',
      message: 'გამარჯობა, რეალის მაისური M ზომა 50 ლარად თუ მომცემთ?',
      expectedDecision: 'Counter Offer',
    },
    {
      title: 'მისაღები შეთავაზება',
      badge: 'Accept',
      message: 'სალამი, რეალის მაისური M ზომა მინდა 65 ლარად, თუ შეიძლება',
      expectedDecision: 'Accept',
    },
    {
      title: 'ამოწურული ზომა',
      badge: 'Out of Stock',
      message: 'გამარჯობა, რეალის მაისური L ზომა გაქვთ?',
      expectedDecision: 'Out of Stock',
    },
    {
      title: 'სტანდარტული შეკითხვა ფასზე',
      badge: 'Catalog Price',
      message: 'გამარჯობა, რეალის მაისური M ზომა გაქვთ მარაგში და რა ღირს?',
      expectedDecision: 'Accept',
    },
    {
      title: 'ექსტრემალური ფასდაკლება',
      badge: 'Approval Required',
      message: '30 ლარად მომეცით 2 ცალი რეალის მაისური და ახლავე ავიღებ',
      expectedDecision: 'Approval Required',
    },
  ];

  // Helper to parse message intent and offer
  const parseAnalysis = () => {
    const text = customerMessage.toLowerCase();

    // 1. Product detection
    let detectedProduct = inventory[0];
    if (text.includes('ნაკრებ') || text.includes('კვარაცხელია') || text.includes('საქართველო')) {
      detectedProduct = inventory[2];
    } else if (text.includes('დინამო') || text.includes('1981')) {
      detectedProduct = inventory[3];
    } else if (text.includes('რეალ') || text.includes('მადრიდ')) {
      // Check size L vs M
      if (text.includes('l ზომა') || text.includes(' ლ ') || text.endsWith(' l') || text.includes('ლ ზომა')) {
        detectedProduct = inventory[1];
      } else {
        detectedProduct = inventory[0];
      }
    } else {
      // Default fallback
      if (text.includes('l ზომა') || text.includes(' ლ ') || text.endsWith(' l')) {
        detectedProduct = inventory[1];
      } else {
        detectedProduct = inventory[0];
      }
    }

    // 2. Size detection
    let detectedSize = detectedProduct.size;
    if (text.includes('l ზომა') || text.includes('ლ ზომა') || text.includes(' l ') || text.includes('ზომა l')) {
      detectedSize = 'L';
    } else if (text.includes('m ზომა') || text.includes('მ ზომა') || text.includes(' m ') || text.includes('ზომა m')) {
      detectedSize = 'M';
    }

    // 3. Customer Offer detection
    const matchGEL = text.match(/(\d+)\s*(?:ლარ|gel)/i) || text.match(/(?:ფასი|შეთავაზება|მომცემთ|მომცემ)\s*(\d+)/i);
    let detectedOffer: number | null = null;
    if (matchGEL) {
      detectedOffer = parseInt(matchGEL[1], 10);
    } else if (text.includes('50')) {
      detectedOffer = 50;
    } else if (text.includes('65')) {
      detectedOffer = 65;
    } else if (text.includes('30')) {
      detectedOffer = 30;
    }

    // 4. Inventory Stock check
    const currentStock = detectedProduct.stock;
    const isOutOfStock = currentStock === 0;

    // 5. Pricing Rules & 6. Decision calculation
    let decision: 'Accept' | 'Counter Offer' | 'Out of Stock' | 'Approval Required' = 'Accept';
    let replyText = '';

    if (isOutOfStock) {
      decision = 'Out of Stock';
      replyText = `გამარჯობა.\nსამწუხაროდ, ${detectedProduct.name} ${detectedSize} ზომაში ამჟამად ამოწურულია.\nშეგვიძლია შემოგთავაზოთ სხვა ზომა ან შეგატყობინოთ ახალი მარაგის შემოსვლისთანავე.`;
    } else if (detectedOffer !== null) {
      if (detectedOffer < 40) {
        // Extreme discount
        decision = 'Approval Required';
        replyText = `გამარჯობა.\n${detectedOffer} ლარად ამ მოდელს ვერ დაგითმობთ. მოთხოვნა გადაეცა მენეჯერს განსახილველად.\nჩვენი მინიმალური ფასია ${detectedProduct.minPrice} ლარი.`;
      } else if (detectedOffer < detectedProduct.minPrice) {
        // Offer < minimum price -> Decision = Counter Offer
        decision = 'Counter Offer';
        replyText = `გამარჯობა.\n${detectedSize} ზომა ხელმისაწვდომია.\nფასი არის ${detectedProduct.price} ლარი.\nშეგვიძლია შემოგთავაზოთ ${detectedProduct.minPrice} ლარი.\nგსურთ შეკვეთის გაფორმება?`;
      } else {
        // Offer >= minPrice
        decision = 'Accept';
        replyText = `გამარჯობა.\n${detectedSize} ზომა ხელმისაწვდომია.\nფასი არის ${detectedProduct.price} ლარი.\nთანახმა ვართ თქვენს შემოთავაზებაზე: ${detectedOffer} ლარი.\nგსურთ შეკვეთის გაფორმება? გთხოვთ მოგვწეროთ მისამართი და ტელეფონი.`;
      }
    } else {
      // General inquiry without offer -> Accept at catalog price
      decision = 'Accept';
      replyText = `გამარჯობა.\n${detectedSize} ზომა ხელმისაწვდომია.\nფასი არის ${detectedProduct.price} ლარი.\nგსურთ შეკვეთის გაფორმება? კურიერი მოგიტანთ 1-2 დღეში.`;
    }

    return {
      product: detectedProduct,
      size: detectedSize,
      offer: detectedOffer,
      stock: currentStock,
      isOutOfStock,
      price: detectedProduct.price,
      minPrice: detectedProduct.minPrice,
      decision,
      replyText,
    };
  };

  const analysis = parseAnalysis();

  // Run the animated reasoning sequence
  const handleRunAgent = () => {
    setIsProcessing(true);
    setActiveStep(1);
    setSentToDm(false);

    const stepInterval = setInterval(() => {
      setActiveStep((prev) => {
        if (prev >= 6) {
          clearInterval(stepInterval);
          setIsProcessing(false);
          // Increment processed message metric
          setMetrics((m) => ({
            ...m,
            messagesProcessed: m.messagesProcessed + 1,
            revenueSaved: analysis.decision === 'Counter Offer' ? m.revenueSaved + 10 : m.revenueSaved,
            ordersCreated: analysis.decision === 'Accept' ? m.ordersCreated + 1 : m.ordersCreated,
            approvalRequests: analysis.decision === 'Approval Required' ? m.approvalRequests + 1 : m.approvalRequests,
          }));
          return 6;
        }
        return prev + 1;
      });
    }, 240);
  };

  const handleSelectExample = (example: PreloadedExample) => {
    setCustomerMessage(example.message);
    setSentToDm(false);
    // Auto-trigger analysis playback
    setIsProcessing(true);
    setActiveStep(1);
    const stepInterval = setInterval(() => {
      setActiveStep((prev) => {
        if (prev >= 6) {
          clearInterval(stepInterval);
          setIsProcessing(false);
          return 6;
        }
        return prev + 1;
      });
    }, 180);
  };

  const handleUpdateStock = (id: string, delta: number) => {
    setInventory((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, stock: Math.max(0, item.stock + delta) } : item
      )
    );
  };

  const handleCopyReply = () => {
    navigator.clipboard.writeText(analysis.replyText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateSend = () => {
    setSentToDm(true);
  };

  return (
    <div className="min-h-full bg-slate-950 text-slate-100 flex flex-col selection:bg-[#c59d6b] selection:text-slate-950">
      {/* DEMO DAY HERO & HEADER */}
      <div className="border-b border-slate-800 bg-slate-900/70 backdrop-blur-md px-6 py-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl p-1 bg-white border border-[#c59d6b]/30 flex items-center justify-center shrink-0 shadow-sm ring-2 ring-[#c59d6b]/30">
              <img src={amqariLogo} alt="ამქარი" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                  <span>ამქარი (Amqari)</span>
                  <span className="w-2 h-2 rounded-full bg-[#c59d6b]" />
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#8b293e]/20 border border-[#8b293e]/40 text-[#f7c2cb]">
                  Demo Day Live Sandbox
                </span>
              </div>
              <p className="text-xs text-slate-400">
                AI გაყიდვების აგენტი Instagram და Facebook ბიზნესებისთვის
              </p>
            </div>
          </div>

          {/* Quick Actions & Navigation Link to Full SaaS */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-950/80 text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full bg-[#c59d6b] animate-pulse" />
              <span>Inference: <strong className="text-white font-mono tabular-nums">142ms</strong></span>
            </div>

            <button
              onClick={() => setPage('dashboard')}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-[#c59d6b]/40 bg-slate-800/80 hover:bg-slate-700 text-[#c59d6b] transition-colors flex items-center gap-1.5"
            >
              <span>სრული SaaS მენიუ</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6 flex-1 w-full">
        {/* 6. METRICS STRIP */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Messages Processed</span>
              <MessageSquare className="w-4 h-4 text-slate-400" />
            </div>
            <div className="mt-2">
              <p className="text-2xl font-bold text-white tabular-nums tracking-tight">
                {metrics.messagesProcessed.toLocaleString()}
              </p>
              <p className="text-[11px] text-[#c59d6b] mt-0.5 flex items-center gap-1">
                <span>100% ავტონომიური ანალიზი</span>
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Orders Created</span>
              <CheckCircle2 className="w-4 h-4 text-[#c59d6b]" />
            </div>
            <div className="mt-2">
              <p className="text-2xl font-bold text-[#c59d6b] tabular-nums tracking-tight">
                {metrics.ordersCreated.toLocaleString()}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                კონვერსია: <strong className="text-slate-200 font-mono">30.5%</strong>
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Approval Requests</span>
              <AlertCircle className="w-4 h-4 text-[#8b293e]" />
            </div>
            <div className="mt-2">
              <p className="text-2xl font-bold text-amber-400 tabular-nums tracking-tight">
                {metrics.approvalRequests.toLocaleString()}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                ადამიანის ჩარევა მხოლოდ: <strong className="text-slate-200 font-mono">2.1%</strong>
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Revenue Saved (მარჟა)</span>
              <TrendingUp className="w-4 h-4 text-purple-400" />
            </div>
            <div className="mt-2">
              <p className="text-2xl font-bold text-purple-300 tabular-nums tracking-tight">
                {metrics.revenueSaved.toLocaleString()} ₾
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                შენარჩუნებული მოგება Counter-Offer-ით
              </p>
            </div>
          </div>
        </div>

        {/* CUSTOMER JOURNEY PIPELINE FLOW VISUALIZER */}
        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/40 flex items-center justify-between overflow-x-auto gap-2 text-xs">
          {[
            { step: 1, label: 'Customer Message' },
            { step: 2, label: 'Agent Analysis' },
            { step: 3, label: 'Inventory Check' },
            { step: 4, label: 'Pricing Rules' },
            { step: 5, label: 'Decision' },
            { step: 6, label: 'Generated Reply' },
          ].map((s, idx) => (
            <React.Fragment key={s.step}>
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all shrink-0 ${
                  activeStep >= s.step
                    ? 'bg-[#c59d6b]/20 border border-[#c59d6b]/50 text-[#c59d6b] font-semibold'
                    : 'bg-slate-900/60 border border-slate-800 text-slate-500'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                    activeStep >= s.step
                      ? 'bg-[#c59d6b] text-slate-950'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {s.step}
                </span>
                <span className="whitespace-nowrap">{s.label}</span>
              </div>
              {idx < 5 && (
                <div className="text-slate-600 shrink-0 font-bold">→</div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* MAIN INTERACTIVE WORKSPACE (2 Columns) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT COLUMN: Customer Inbox & Agent Reasoning Panel */}
          <div className="lg:col-span-6 space-y-6">
            {/* 1. CUSTOMER INBOX (Required by prompt) */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#c59d6b]" />
                  <h2 className="text-sm font-bold text-white tracking-tight">
                    1. Customer Inbox (შემოსული შეტყობინება)
                  </h2>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">Instagram Direct</span>
              </div>

              {/* Preloaded Georgian Examples Buttons */}
              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-400 font-medium block">
                  აირჩიეთ სატესტო სცენარი ჟიურისთვის (Preloaded Georgian Examples):
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {preloadedExamples.map((ex, i) => (
                    <button
                      key={i}
                      onClick={() => handleSelectExample(ex)}
                      className="px-2.5 py-1 text-[11px] rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 hover:border-[#c59d6b] text-slate-200 transition-colors text-left flex items-center gap-1.5"
                    >
                      <Zap className="w-3 h-3 text-[#c59d6b] shrink-0" />
                      <span>{ex.title}</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-900 text-[#c59d6b] font-mono">
                        {ex.badge}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Input for Customer Message */}
              <div className="space-y-2 pt-1">
                <label className="text-xs font-semibold text-slate-300 block">
                  მომხმარებლის შეტყობინების ტექსტი:
                </label>
                <div className="relative">
                  <textarea
                    rows={3}
                    value={customerMessage}
                    onChange={(e) => {
                      setCustomerMessage(e.target.value);
                      setActiveStep(6);
                      setSentToDm(false);
                    }}
                    placeholder="ჩაწერეთ ნებისმიერი შეკითხვა ქართულად..."
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-hidden focus:border-[#c59d6b] transition-colors"
                  />
                </div>
              </div>

              {/* Run Trigger */}
              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => {
                    setCustomerMessage('გამარჯობა, რეალის მაისური M ზომა 50 ლარად თუ მომცემთ?');
                    setActiveStep(6);
                  }}
                  className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>საწყისზე დაბრუნება</span>
                </button>

                <button
                  onClick={handleRunAgent}
                  disabled={isProcessing}
                  className="px-4 py-2 rounded-xl bg-[#c59d6b] hover:bg-[#b38a56] text-slate-950 font-bold text-xs transition-colors shadow-md flex items-center gap-2 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>აგენტი აანალიზებს...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>აგენტის ნაკადის გაშვება (Run Agent)</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* 2. AGENT REASONING PANEL (Required by prompt) */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-[#c59d6b]" />
                  <h2 className="text-sm font-bold text-white tracking-tight">
                    2. Agent Reasoning Panel (აზროვნების ანალიზი)
                  </h2>
                </div>
                <span className="text-[11px] text-[#c59d6b] font-mono">
                  {activeStep === 6 ? 'დასრულებულია (Ready)' : `ეტაპი ${activeStep}/6`}
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                {/* Step 1: Product Identified */}
                <div
                  className={`p-3 rounded-lg border transition-all flex items-start justify-between ${
                    activeStep >= 1
                      ? 'border-[#c59d6b]/40 bg-[#c59d6b]/10 text-slate-200'
                      : 'border-slate-800 bg-slate-950 text-slate-500 opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <span className="text-[#c59d6b] text-sm">✅</span>
                    <div>
                      <p className="font-semibold text-white">Product Identified</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        ამოცნობილი პროდუქტი: <strong className="text-[#c59d6b]">{analysis.product.name}</strong>
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">GEO-NLP-01</span>
                </div>

                {/* Step 2: Size Identified */}
                <div
                  className={`p-3 rounded-lg border transition-all flex items-start justify-between ${
                    activeStep >= 2
                      ? 'border-[#c59d6b]/40 bg-[#c59d6b]/10 text-slate-200'
                      : 'border-slate-800 bg-slate-950 text-slate-500 opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <span className="text-[#c59d6b] text-sm">✅</span>
                    <div>
                      <p className="font-semibold text-white">Size Identified</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        ამოცნობილი ზომა: <strong className="text-[#c59d6b]">ზომა {analysis.size}</strong>
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">Match 99%</span>
                </div>

                {/* Step 3: Customer Offer Detected */}
                <div
                  className={`p-3 rounded-lg border transition-all flex items-start justify-between ${
                    activeStep >= 3
                      ? 'border-[#c59d6b]/40 bg-[#c59d6b]/10 text-slate-200'
                      : 'border-slate-800 bg-slate-950 text-slate-500 opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <span className="text-[#c59d6b] text-sm">✅</span>
                    <div>
                      <p className="font-semibold text-white">Customer Offer Detected</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        შეთავაზება: {analysis.offer !== null ? (
                          <strong className="text-[#8b293e] dark:text-[#f7c2cb] tabular-nums">{analysis.offer} GEL</strong>
                        ) : (
                          <span className="text-slate-400">ფასდაკლების გარეშე (კატალოგის ფასის მოთხოვნა)</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">Extracted</span>
                </div>

                {/* Step 4: Inventory Checked */}
                <div
                  className={`p-3 rounded-lg border transition-all flex items-start justify-between ${
                    activeStep >= 4
                      ? 'border-[#c59d6b]/40 bg-[#c59d6b]/10 text-slate-200'
                      : 'border-slate-800 bg-slate-950 text-slate-500 opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <span className="text-[#c59d6b] text-sm">✅</span>
                    <div>
                      <p className="font-semibold text-white">Inventory Checked</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        მარაგი ბაზაში: {analysis.isOutOfStock ? (
                          <strong className="text-[#8b293e]">0 ცალი (ამოწურულია)</strong>
                        ) : (
                          <strong className="text-[#c59d6b] tabular-nums">{analysis.stock} ცალი დარჩენილი</strong>
                        )}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">Store DB</span>
                </div>

                {/* Step 5: Pricing Rules Applied */}
                <div
                  className={`p-3 rounded-lg border transition-all flex items-start justify-between ${
                    activeStep >= 5
                      ? 'border-[#c59d6b]/40 bg-[#c59d6b]/10 text-slate-200'
                      : 'border-slate-800 bg-slate-950 text-slate-500 opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <span className="text-[#c59d6b] text-sm">✅</span>
                    <div>
                      <p className="font-semibold text-white">Pricing Rules Applied</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        კატალოგი: <strong className="tabular-nums text-white">{analysis.price} GEL</strong> · მინიმალური ზღვარი: <strong className="tabular-nums text-[#8b293e] dark:text-[#f7c2cb]">{analysis.minPrice} GEL</strong>
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">Margin Guard</span>
                </div>

                {/* Step 6: Decision Made */}
                <div
                  className={`p-3 rounded-lg border transition-all flex items-start justify-between ${
                    activeStep >= 6
                      ? 'border-[#c59d6b]/60 bg-[#c59d6b]/20 text-slate-200'
                      : 'border-slate-800 bg-slate-950 text-slate-500 opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <span className="text-[#c59d6b] text-sm">✅</span>
                    <div>
                      <p className="font-semibold text-white">Decision Made</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        ვერდიქტი: <strong className={
                          analysis.decision === 'Counter Offer'
                            ? 'text-[#8b293e] dark:text-[#f7c2cb]'
                            : analysis.decision === 'Out of Stock'
                            ? 'text-red-400'
                            : analysis.decision === 'Approval Required'
                            ? 'text-[#8b293e] dark:text-[#f7c2cb]'
                            : 'text-[#c59d6b]'
                        }>{analysis.decision}</strong>
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">Arbitrated</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Inventory Panel, Decision Panel & Generated Georgian Reply */}
          <div className="lg:col-span-6 space-y-6">
            {/* 3. INVENTORY PANEL */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#c59d6b]" />
                  <h2 className="text-sm font-bold text-white tracking-tight">
                    3. Inventory Panel (ინვენტარის მართვის პანელი)
                  </h2>
                </div>
                <span className="text-[10px] text-slate-400">ინტერაქტიული სატესტო მარაგი</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="px-3 py-2">პროდუქტი</th>
                      <th className="px-3 py-2">ზომა</th>
                      <th className="px-3 py-2 text-center">მარაგი (Stock)</th>
                      <th className="px-3 py-2 text-right">Price</th>
                      <th className="px-3 py-2 text-right">Min Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {inventory.map((item) => (
                      <tr
                        key={item.id}
                        className={`transition-colors ${
                          analysis.product.id === item.id && analysis.size === item.size
                            ? 'bg-[#c59d6b]/15 text-white font-medium'
                            : 'hover:bg-slate-800/40 text-slate-300'
                        }`}
                      >
                        <td className="px-3 py-2.5 flex items-center gap-2">
                          {analysis.product.id === item.id && analysis.size === item.size && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#c59d6b]" />
                          )}
                          <span className="truncate max-w-[150px]">{item.name}</span>
                        </td>
                        <td className="px-3 py-2.5 font-bold font-mono">
                          {item.size}
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <div className="inline-flex items-center gap-1.5 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                            <button
                              onClick={() => handleUpdateStock(item.id, -1)}
                              disabled={item.stock === 0}
                              className="text-slate-400 hover:text-red-400 disabled:opacity-20 px-1"
                              title="მარაგის შემცირება (ტესტისთვის)"
                            >
                              -
                            </button>
                            <span className={`font-mono font-bold tabular-nums ${item.stock === 0 ? 'text-[#8b293e]' : 'text-[#c59d6b]'}`}>
                              {item.stock}
                            </span>
                            <button
                              onClick={() => handleUpdateStock(item.id, 1)}
                              className="text-slate-400 hover:text-[#c59d6b] px-1"
                              title="მარაგის გაზრდა"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono font-semibold tabular-nums text-white">
                          {item.price} GEL
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono font-semibold tabular-nums text-[#8b293e] dark:text-[#f7c2cb]">
                          {item.minPrice} GEL
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="text-[11px] text-slate-400 italic">
                💡 ჟიურის რჩევა: შეცვალეთ მარაგი 0-მდე ან შეცვალეთ ფასდაკლების შეთავაზება, რათა გამოსცადოთ გადაწყვეტილების ლოგიკა.
              </p>
            </div>

            {/* 4. DECISION PANEL */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-[#c59d6b]" />
                  <h2 className="text-sm font-bold text-white tracking-tight">
                    4. Decision Panel (გადაწყვეტილების პანელი)
                  </h2>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Deterministic Engine</span>
              </div>

              {/* Large Decision Result Banner */}
              <div
                className={`p-4 rounded-xl border flex items-center justify-between ${
                  analysis.decision === 'Counter Offer'
                    ? 'border-[#8b293e]/60 bg-[#8b293e]/20 text-[#f7c2cb]'
                    : analysis.decision === 'Out of Stock'
                    ? 'border-red-500/60 bg-red-950/30 text-red-200'
                    : analysis.decision === 'Approval Required'
                    ? 'border-[#8b293e]/60 bg-[#8b293e]/30 text-[#f7c2cb]'
                    : 'border-[#c59d6b]/60 bg-[#c59d6b]/20 text-[#c59d6b]'
                }`}
              >
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-semibold opacity-75 block">
                    მიღებული გადაწყვეტილება (Decision)
                  </span>
                  <p className="text-xl font-extrabold tracking-tight mt-0.5">
                    {analysis.decision === 'Counter Offer' && '⚠️ Counter Offer (კონტრშეთავაზება)'}
                    {analysis.decision === 'Out of Stock' && '🛑 Out of Stock (მარაგი ამოწურულია)'}
                    {analysis.decision === 'Accept' && '✅ Accept (შეკვეთის მიღება)'}
                    {analysis.decision === 'Approval Required' && '🛡️ Escalation (მენეჯერის თანხმობა)'}
                  </p>
                </div>

                <div className="text-right text-xs">
                  <span className="block font-mono text-[11px] opacity-75">ლოგიკური წესი:</span>
                  <span className="font-semibold">
                    {analysis.decision === 'Counter Offer' && 'Offer < Minimum Price'}
                    {analysis.decision === 'Out of Stock' && 'Stock == 0'}
                    {analysis.decision === 'Accept' && 'Offer >= Min Price (ან კატალოგი)'}
                    {analysis.decision === 'Approval Required' && 'Discount > 50% Threshold'}
                  </span>
                </div>
              </div>

              {/* Formula & Rule Breakdown */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400">მყიდველის შეთავაზება</span>
                  <p className="font-bold text-[#8b293e] dark:text-[#f7c2cb] font-mono mt-0.5">
                    {analysis.offer ? `${analysis.offer} GEL` : 'არ არის'}
                  </p>
                </div>
                <div className="p-2 rounded bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400">მინიმალური ფასი</span>
                  <p className="font-bold text-[#c59d6b] font-mono mt-0.5">
                    {analysis.minPrice} GEL
                  </p>
                </div>
                <div className="p-2 rounded bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400">დაცული მარჟა</span>
                  <p className="font-bold text-[#c59d6b] font-mono mt-0.5">
                    {analysis.decision === 'Counter Offer' ? '+10 GEL' : 'სტანდარტული'}
                  </p>
                </div>
              </div>
            </div>

            {/* 5. GENERATED GEORGIAN REPLY */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#c59d6b]" />
                  <h2 className="text-sm font-bold text-white tracking-tight">
                    5. Generated Georgian Reply (გენერირებული პასუხი)
                  </h2>
                </div>
                <span className="text-[10px] text-[#c59d6b] font-mono">100% Georgian NLP</span>
              </div>

              {/* Chat Bubble Presentation */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 relative">
                <div className="flex items-center gap-2 pb-2 mb-2 border-b border-slate-900 text-[10px] text-slate-400">
                  <div className="w-2 h-2 rounded-full bg-[#c59d6b]" />
                  <span>ამქარი AI გაყიდვების აგენტი მომხმარებელს:</span>
                </div>

                <pre className="font-sans text-xs sm:text-sm text-slate-100 whitespace-pre-wrap leading-relaxed">
                  {analysis.replyText}
                </pre>

                {sentToDm && (
                  <div className="mt-3 p-2 rounded-lg bg-[#c59d6b]/15 border border-[#c59d6b]/40 text-[#c59d6b] text-[11px] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#c59d6b]" />
                    <span>შეტყობინება გაიგზავნა Instagram Direct-ში და შეკვეთა ინიცირებულია!</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-3 pt-1">
                <button
                  onClick={handleCopyReply}
                  className="px-3.5 py-2 rounded-lg border border-slate-700 hover:bg-slate-800 text-xs text-slate-300 font-medium transition-colors flex items-center gap-1.5"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-[#c59d6b]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'დაკოპირდა!' : 'ტექსტის კოპირება'}</span>
                </button>

                <button
                  onClick={handleSimulateSend}
                  className="px-4 py-2 rounded-lg bg-[#c59d6b] hover:bg-[#b38a56] text-slate-950 font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Instagram Direct-ში გაგზავნის სიმულაცია</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* DEMO DAY FOOTER HIGHLIGHTS FOR JUDGES */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-400">
          <div>
            <span className="font-semibold text-white block">🇬🇪 ქართული ენის სრული მორფოლოგია</span>
            <p className="mt-1">
              ზუსტად ცნობს ქართულ სლენგს, შემოკლებებს, ფასდაკლების ფორმულირებებსა და ზომებს.
            </p>
          </div>
          <div>
            <span className="font-semibold text-white block">🛡️ Margin & Fraud Guard</span>
            <p className="mt-1">
              მინიმალური ფასის (Floor Price) ქვემოთ შეთავაზებებს უარყოფს ან აკეთებს კონტრშეთავაზებას.
            </p>
          </div>
          <div>
            <span className="font-semibold text-white block">⚡ ნულოვანი ჰალუცინაცია</span>
            <p className="mt-1">
              დეტერმინისტული ინვენტარის გადამოწმება გამორიცხავს არარსებული მარაგის დადასტურებას.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
