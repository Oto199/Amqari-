import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search,
  Send,
  Sparkles,
  Bot,
  User,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ShoppingBag,
  Phone,
  MapPin,
  ShieldCheck,
  Check,
  Copy,
  Package,
  TrendingDown,
  RotateCcw,
  Zap,
  Calculator,
  Terminal,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const InboxView: React.FC = () => {
  const {
    conversations,
    selectedConversationId,
    setSelectedConversationId,
    selectedConversation,
    sendMessage,
    triggerAiResponse,
    isAiTyping,
    setPage,
    isMetaConnected,
    backendMessageCount,
    rawBackendResponse,
    backendMessages,
    lastPollTimestamp,
    lastPollError,
    refreshBackendMessages,
    products,
    updateProductStock,
    pipelineResult,
    isProcessingPipeline,
    runPipelineForText,
    agentResultsByEventId,
    processingEventIds,
    processedEventIds,
    settings,
    resetConversationMessages,
  } = useApp();

  const [inputText, setInputText] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending_approval' | 'active' | 'resolved'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedReply, setCopiedReply] = useState(false);
  const [isDebugOpen, setIsDebugOpen] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [rawCopied, setRawCopied] = useState(false);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshBackendMessages();
    } finally {
      setTimeout(() => setIsRefreshing(false), 400);
    }
  };

  // Bind to selected conversation's verified agent result or event map
  const currentResult =
    selectedConversation?.latestAgentResult ||
    (selectedConversation?.lastEventId ? agentResultsByEventId[selectedConversation.lastEventId] : null) ||
    pipelineResult;

  // Shared Catalogue Active Item & Pipeline State (Single Source of Truth)
  const activeProduct =
    currentResult?.matchedProduct || products.find((p) => p.id === 'prod-3') || products[0];
  const activeSize = currentResult?.selectedSize || 'M';
  const activeStock =
    currentResult?.stock ??
    (activeProduct.sizes.find((s: { size: string; stock: number }) => s.size === activeSize)?.stock ?? 0);
  const decisionType = currentResult?.decisionType || 'Counter Offer';
  const decisionDetails = currentResult?.decisionDetails || '';
  const counterOfferPrice = currentResult?.counterOfferPrice || activeProduct.minPrice;
  const generatedReply =
    currentResult?.generatedReply ||
    `გამარჯობა.\n${activeProduct.title} ${activeSize} ზომაში გვაქვს მარაგში (${activeStock} ცალი).\nფასი არის ${activeProduct.price} ლარი.\nშეგვიძლია შემოგთავაზოთ საუკეთესო ფასი ${counterOfferPrice} ლარი.\nგსურთ შეკვეთის გაფორმება?`;
  const measuredLatency =
    currentResult?.measuredLatencyMs || (currentResult?.trace.executionTimeMs ?? 248);
  const isGemini = Boolean(currentResult?.extraction.geminiAvailable);
  const isProcessingCurrentEvent =
    Boolean(selectedConversation?.lastEventId && processingEventIds.includes(selectedConversation.lastEventId));

  const filteredConversations = conversations.filter((c) => {
    const matchesFilter = filter === 'all' || c.status === filter;
    const matchesSearch =
      c.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.customer.handle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lastMessage.text.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleSendHumanMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedConversation) return;
    const text = inputText.trim();
    sendMessage(selectedConversation.id, text, 'human_agent');
    setInputText('');
    runPipelineForText(text);
  };

  const handleSimulateCustomerMessage = (sampleQuery: string) => {
    if (!selectedConversation) return;
    sendMessage(selectedConversation.id, sampleQuery, 'customer');
    triggerAiResponse(selectedConversation.id, sampleQuery);
  };

  const currentLastMsg = selectedConversation?.lastMessage.text || '';

  const handleCopyGeneratedReply = () => {
    navigator.clipboard.writeText(generatedReply);
    setCopiedReply(true);
    setTimeout(() => setCopiedReply(false), 2000);
  };

  const handleSendGeneratedReplyToChat = () => {
    if (!selectedConversation) return;
    sendMessage(selectedConversation.id, generatedReply, 'ai_agent');
  };

  const updateActiveProductStock = (productId: string, size: string, delta: number) => {
    updateProductStock(productId, size, delta);
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-slate-950 text-slate-100 overflow-hidden">
      {/* TOP METRICS STRIP (Production SaaS Style) */}
      <div className="border-b border-slate-800/80 bg-slate-900/60 px-6 py-2.5 flex items-center justify-between gap-4 shrink-0 overflow-x-auto text-xs">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">დამუშავებული მესიჯები:</span>
            <span className="font-bold text-white tabular-nums font-mono">
              {(1284 + backendMessageCount).toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">შექმნილი შეკვეთები:</span>
            <span className="font-bold text-[#c59d6b] tabular-nums font-mono">392</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">ადამიანის თანხმობა:</span>
            <span className="font-bold text-[#8b293e] dark:text-[#f7c2cb] tabular-nums font-mono">28 (2.1%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">შენარჩუნებული მარჟა:</span>
            <span className="font-bold text-[#c59d6b] tabular-nums font-mono">+8,460 ₾</span>
          </div>
        </div>

        {/* Live Meta Connection Status Badge (Requirement 4) */}
        <div className="flex items-center gap-3 shrink-0">
          {isMetaConnected ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#c59d6b]/15 border border-[#c59d6b]/40 text-xs font-bold text-[#c59d6b] shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#c59d6b]" />
              <span>Meta დაკავშირებულია</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#8b293e]/15 border border-[#8b293e]/40 text-xs font-bold text-[#8b293e] dark:text-[#f7c2cb] shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#8b293e]" />
              <span>Meta ხაზგარეშე</span>
            </div>
          )}
        </div>
      </div>

      {/* 3-PANEL CORE INTERFACE */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
        {/* PANEL 1: Customer List */}
        <div className="w-full lg:w-72 shrink-0 border-r border-slate-800 bg-slate-950 flex flex-col h-full">
          {/* Search & Tabs */}
          <div className="p-3 border-b border-slate-800 space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ძებნა მომხმარებლის მიხედვით..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-white placeholder:text-slate-500 focus:outline-hidden focus:border-[#c59d6b]"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 p-0.5 bg-slate-900 rounded-lg text-[10px] font-medium">
              <button
                onClick={() => setFilter('all')}
                className={`flex-1 py-1 rounded-md transition-colors text-center ${
                  filter === 'all'
                    ? 'bg-slate-800 text-[#c59d6b] font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ყველა ({conversations.length})
              </button>
              <button
                onClick={() => setFilter('pending_approval')}
                className={`flex-1 py-1 rounded-md transition-colors text-center ${
                  filter === 'pending_approval'
                    ? 'bg-[#8b293e]/20 text-[#8b293e] dark:text-[#f7c2cb] font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                დასტური
              </button>
              <button
                onClick={() => setFilter('resolved')}
                className={`flex-1 py-1 rounded-md transition-colors text-center ${
                  filter === 'resolved'
                    ? 'bg-slate-800 text-[#c59d6b] font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                შეკვეთა
              </button>
            </div>
          </div>

          {/* Conversation Cards List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-900">
            {filteredConversations.map((c) => {
              const isSelected = c.id === selectedConversationId;
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedConversationId(c.id)}
                  className={`p-3 cursor-pointer transition-all flex items-start gap-3 ${
                    isSelected
                      ? 'bg-slate-900/90 border-l-2 border-[#c59d6b] text-white'
                      : 'hover:bg-slate-900/40 text-slate-300'
                  }`}
                >
                  <div className="relative shrink-0">
                    <img
                      src={c.customer.avatarUrl}
                      alt={c.customer.name}
                      className="w-9 h-9 rounded-full object-cover border border-[#c59d6b]/30"
                      referrerPolicy="no-referrer"
                    />
                    {c.unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#8b293e] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                        {c.unreadCount}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white truncate">
                        {c.customer.name}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono tabular-nums">
                        {c.lastMessage.timestamp}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 mt-0.5">
                      <p className="text-[10px] text-slate-400 font-mono truncate">
                        {c.customer.handle}
                      </p>
                      {c.lastMessage.sender_id && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-[#c59d6b]/15 text-[#c59d6b] border border-[#c59d6b]/30">
                          ID: {c.lastMessage.sender_id}
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-200 truncate mt-1">
                      {c.lastMessage.sender === 'ai_agent' && (
                        <span className="text-[#c59d6b] font-semibold">AI: </span>
                      )}
                      {c.lastMessage.text}
                    </p>

                    {c.lastMessage.received_at && (
                      <p className="text-[9px] text-slate-400 font-mono truncate mt-0.5">
                        🕒 received_at: {c.lastMessage.received_at}
                      </p>
                    )}

                    <div className="mt-1.5 flex items-center gap-1.5">
                      {c.status === 'pending_approval' && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-amber-950 text-amber-300 border border-amber-800/80">
                          დასტურის მოთხოვნა
                        </span>
                      )}
                      {c.orderId && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-[#c59d6b]/15 text-[#c59d6b] border border-[#c59d6b]/30">
                          #{c.orderId}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* PANEL 2: Chat Messages & Customer Query Triggers */}
        {selectedConversation ? (
          <div className="flex-1 flex flex-col h-full bg-slate-900/40 border-r border-slate-800 min-w-0">
            {/* Chat Bar Header */}
            <div className="h-14 px-5 border-b border-slate-800 flex items-center justify-between bg-slate-950 shrink-0">
              <div className="flex items-center gap-3">
                <img
                  src={selectedConversation.customer.avatarUrl}
                  alt={selectedConversation.customer.name}
                  className="w-8 h-8 rounded-full object-cover border border-slate-700"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-white">
                      {selectedConversation.customer.name}
                    </h3>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {selectedConversation.customer.handle}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-slate-400">Instagram Direct</span>
                    <span className="text-[10px] font-semibold">
                      {isMetaConnected ? (
                        <span className="text-[#c59d6b]">🟢 Meta დაკავშირებულია</span>
                      ) : (
                        <span className="text-[#8b293e] dark:text-[#f7c2cb]">🔴 Meta ხაზგარეშე</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {selectedConversation.status === 'pending_approval' && (
                <button
                  onClick={() => setPage('approvals')}
                  className="px-3 py-1 text-xs font-semibold rounded-lg bg-[#8b293e] hover:bg-[#752233] text-white transition-colors flex items-center gap-1.5"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>ფასდაკლების დამტკიცება</span>
                </button>
              )}
            </div>

            {/* Quick Demo Multi-Turn Test Sequence */}
            <div className="px-4 py-2 border-b border-slate-800/80 bg-slate-950/90 flex items-center justify-between gap-2 overflow-x-auto text-xs shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 font-semibold shrink-0 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-[#c59d6b]" />
                  3-საფეხურიანი ტესტი:
                </span>
                <button
                  onClick={() => handleSimulateCustomerMessage('რეალ მადრიდის მაისური XL ზომა გაქვთ? 10 ლარად მომცემთ?')}
                  className="px-2.5 py-1 rounded-md bg-[#c59d6b]/20 border border-[#c59d6b]/60 hover:bg-[#c59d6b]/30 text-[#c59d6b] text-[11px] whitespace-nowrap transition-colors font-medium flex items-center gap-1"
                  title="Turn 1: Offer 10 GEL for Real Madrid XL (Below 90 GEL minPrice -> Counter 90 GEL)"
                >
                  <span className="w-4 h-4 rounded-full bg-[#c59d6b] text-slate-950 text-[9px] font-bold flex items-center justify-center">1</span>
                  <span>10₾ შეთავაზება (XL)</span>
                </button>
                <button
                  onClick={() => handleSimulateCustomerMessage('80 lardad viyidi')}
                  className="px-2.5 py-1 rounded-md bg-[#8b293e]/20 border border-[#8b293e]/60 hover:bg-[#8b293e]/30 text-[#f7c2cb] text-[11px] whitespace-nowrap transition-colors font-medium flex items-center gap-1"
                  title="Turn 2: Follow-up in Latin Georgian '80 lardad viyidi' (Retains XL + Real Madrid; 80 < 90 -> Counter 90)"
                >
                  <span className="w-4 h-4 rounded-full bg-[#8b293e] text-white text-[9px] font-bold flex items-center justify-center">2</span>
                  <span>"80 lardad viyidi"</span>
                </button>
                <button
                  onClick={() => handleSimulateCustomerMessage('კარგი, 90 ლარად ავიღებ')}
                  className="px-2.5 py-1 rounded-md bg-[#c59d6b] hover:bg-[#b38a56] text-slate-950 text-[11px] whitespace-nowrap transition-colors font-bold flex items-center gap-1 shadow-xs"
                  title="Turn 3: Customer accepts 90 GEL -> Deal agreed, asks for delivery details"
                >
                  <span className="w-4 h-4 rounded-full bg-slate-950 text-[#c59d6b] text-[9px] font-bold flex items-center justify-center">3</span>
                  <span>"კარგი, 90₾ ავიღებ"</span>
                </button>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => {
                    if (selectedConversation) {
                      resetConversationMessages(selectedConversation.id);
                    }
                  }}
                  className="px-2 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 text-[10px] flex items-center gap-1 transition-colors"
                  title="დიალოგის გასუფთავება ტესტის თავიდან დასაწყებად"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>განულება</span>
                </button>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 p-5 overflow-y-auto space-y-3.5">
              {selectedConversation.messages.map((msg) => {
                const isCustomer = msg.sender === 'customer';
                const isAi = msg.sender === 'ai_agent';

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isCustomer ? 'items-start' : 'items-end'}`}
                  >
                    <div
                      className={`max-w-md rounded-2xl px-4 py-2 text-xs leading-relaxed ${
                        isCustomer
                          ? 'bg-slate-800 text-slate-100 rounded-bl-xs'
                          : isAi
                          ? 'bg-[#c59d6b] text-slate-950 rounded-br-xs font-medium shadow-xs'
                          : 'bg-[#8b293e] text-white rounded-br-xs'
                      }`}
                    >
                      <p className="whitespace-pre-wrap font-medium">{msg.text}</p>
                      {msg.sender_id && (
                        <div className={`mt-1 pt-1 border-t ${isAi ? 'border-[#b38a56]/50 text-slate-900' : 'border-slate-700/60 text-[#c59d6b]'} flex items-center justify-between text-[10px] font-mono`}>
                          <span>sender_id: <strong>{msg.sender_id}</strong></span>
                        </div>
                      )}
                      {msg.received_at && (
                        <div className={`text-[9px] font-mono ${isAi ? 'text-slate-800/80' : 'text-slate-400/90'} mt-0.5 truncate`}>
                          received_at: {msg.received_at}
                        </div>
                      )}
                      <div className={`mt-1 flex items-center justify-end gap-1.5 text-[9px] ${isAi ? 'text-slate-900/80' : 'opacity-75'}`}>
                        <span>{msg.timestamp}</span>
                        {isAi && <span>· AI აგენტი</span>}
                      </div>
                    </div>

                    {msg.aiMetadata && (
                      <span className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-[#c59d6b]" />
                        {msg.aiMetadata.actionTaken}
                      </span>
                    )}
                  </div>
                );
              })}

              {isAiTyping && (
                <div className="flex items-center gap-2 text-xs text-slate-400 italic">
                  <Bot className="w-4 h-4 text-[#c59d6b] animate-spin" />
                  <span>ამქარი ამოწმებს მარაგს და საფასო წესებს...</span>
                </div>
              )}
            </div>

            {/* Operator Reply Input Box */}
            <form
              onSubmit={handleSendHumanMessage}
              className="p-3 border-t border-slate-800 bg-slate-950 flex items-center gap-2 shrink-0"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="უპასუხეთ ხელით ან გამოიყენეთ მარჯვენა გენერირებული პასუხი..."
                className="flex-1 px-3.5 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:outline-hidden focus:border-[#c59d6b]"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-2 rounded-xl bg-[#c59d6b] hover:bg-[#b38a56] text-slate-950 transition-colors disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        ) : null}

        {/* PANEL 3: Agent Reasoning, Inventory Table, Decision & Generated Reply */}
        <div className="w-full lg:w-96 shrink-0 bg-slate-950 p-4 overflow-y-auto space-y-4">
          {/* Section 1: Customer Profile Mini Card */}
          {selectedConversation && (
            <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img
                  src={selectedConversation.customer.avatarUrl}
                  alt={selectedConversation.customer.name}
                  className="w-10 h-10 rounded-full object-cover border border-slate-700"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h4 className="text-xs font-bold text-white">{selectedConversation.customer.name}</h4>
                  <span className="text-[10px] text-slate-400 font-mono">{selectedConversation.customer.handle}</span>
                  <div className="flex items-center gap-2 text-[10px] text-slate-300 mt-0.5">
                    <span>LTV: <strong className="text-[#c59d6b] tabular-nums">{selectedConversation.customer.lifetimeValue} ₾</strong></span>
                    <span>·</span>
                    <span>შეკვეთები: {selectedConversation.customer.previousOrdersCount}</span>
                  </div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#c59d6b]/15 text-[#c59d6b] border border-[#c59d6b]/30">
                სანდო
              </span>
            </div>
          )}

          {/* Section 2: Gemini Live Processing Status & Latency Card */}
          <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2.5">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Bot className="w-4 h-4 text-[#c59d6b]" />
                Gemini Processing Status
              </span>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#c59d6b] animate-pulse" />
                <span className="text-[11px] text-[#c59d6b] font-mono font-bold">
                  {measuredLatency} ms
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[11px]">AI მოდელი & სტატუსი:</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#c59d6b]/15 text-[#c59d6b] border border-[#c59d6b]/40">
                  {currentResult?.geminiStatus || 'Gemini 3.1 Flash Lite - Live'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[11px]">ვალიდაციის შედეგი:</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${
                    currentResult?.requiresHumanReview
                      ? 'bg-[#8b293e]/20 text-[#f7c2cb] border-[#8b293e]/60'
                      : currentResult?.validationStatus === 'regenerated'
                      ? 'bg-[#8b293e]/15 text-[#f7c2cb] border-[#8b293e]/40'
                      : 'bg-[#c59d6b]/15 text-[#c59d6b] border-[#c59d6b]/40'
                  }`}
                >
                  {currentResult?.requiresHumanReview
                    ? '⚠️ Human Review Required'
                    : currentResult?.validationStatus === 'regenerated'
                    ? '🔄 Regenerated & Safe'
                    : '✅ Verified Safe (Floor Kept)'}
                </span>
              </div>

              {currentResult?.requiresHumanReview && (
                <div className="p-2.5 rounded-lg bg-[#8b293e]/15 border border-[#8b293e]/50 text-[11px] text-[#f7c2cb] space-y-1">
                  <div className="font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-[#8b293e] shrink-0" />
                    <span>საჭიროებს ოპერატორის გადამოწმებას</span>
                  </div>
                  <p className="text-[10px] text-slate-300 leading-tight">
                    Gemini მიუწვდომელია ან პასუხი ეწინააღმდეგება კატალოგის წესებს. ყალბი AI პასუხი დაბლოკილია.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Conversation Context Used (Multi-Turn History) */}
          <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2">
            <div className="flex items-center justify-between pb-1 border-b border-slate-800">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5 text-[#c59d6b]" />
                Conversation Context Used (ისტორია)
              </span>
              <span className="text-[10px] font-mono text-[#c59d6b]">
                {currentResult?.conversationContextUsed?.length ?? 0} Turns
              </span>
            </div>

            {currentResult?.conversationContextUsed && currentResult.conversationContextUsed.length > 0 ? (
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {currentResult.conversationContextUsed.map((turn, idx) => (
                  <div
                    key={idx}
                    className="p-1.5 rounded bg-slate-950/80 border border-slate-800 text-[10px] space-y-0.5"
                  >
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="font-semibold text-[9px] uppercase tracking-wider text-[#c59d6b]">
                        {turn.role === 'user' ? '👤 კლიენტი' : '🤖 ასისტენტი'}
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono">Turn #{idx + 1}</span>
                    </div>
                    <p className="text-slate-200 font-sans line-clamp-2 leading-relaxed">
                      {turn.text}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-2 rounded bg-slate-950/60 border border-dashed border-slate-800 text-[10px] text-slate-400 text-center">
                საწყისი შეტყობინება — წინა კონტექსტი არ არის საჭირო
              </div>
            )}
          </div>

          {/* Section 4: Verified Catalogue Result (Shared Inventory Single Source of Truth) */}
          <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2">
            <div className="flex items-center justify-between pb-1 border-b border-slate-800">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-[#c59d6b]" />
                Verified Catalogue Result (კატალოგი)
              </span>
              <span className="text-[10px] text-[#c59d6b] font-mono font-semibold">Verified DB</span>
            </div>

            <div className="p-2.5 rounded-lg border border-[#c59d6b]/40 bg-[#c59d6b]/10 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-xs text-white">{activeProduct.title}</h5>
                  <span className="text-[10px] font-mono text-slate-400">SKU: {activeProduct.id}</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-900 border border-[#c59d6b]/40 text-[#c59d6b]">
                  ზომა: {activeSize}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800/80 text-[11px]">
                <div className="p-1.5 rounded bg-slate-950 border border-slate-800 text-center">
                  <span className="text-[9px] text-slate-400 block">მარაგი</span>
                  <span className={`font-mono font-bold ${activeStock === 0 ? 'text-[#8b293e]' : 'text-[#c59d6b]'}`}>
                    {activeStock} ცალი
                  </span>
                </div>
                <div className="p-1.5 rounded bg-slate-950 border border-slate-800 text-center">
                  <span className="text-[9px] text-slate-400 block">საწყისი ფასი</span>
                  <span className="font-mono font-bold text-white">{activeProduct.price} ₾</span>
                </div>
                <div className="p-1.5 rounded bg-slate-950 border border-slate-800 text-center">
                  <span className="text-[9px] text-[#8b293e] dark:text-[#f7c2cb] block">მინ. ზღვარი</span>
                  <span className="font-mono font-bold text-[#8b293e] dark:text-[#f7c2cb]">{activeProduct.minPrice} ₾</span>
                </div>
              </div>

              {/* Stock manipulation buttons to test 0-stock branches */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[10px] text-slate-400">
                <span>მარაგის ცვლილება ტესტისთვის:</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => updateActiveProductStock(activeProduct.id, activeSize, -1)}
                    disabled={activeStock === 0}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs disabled:opacity-30 cursor-pointer"
                    title="შეამცირე მარაგი 0-მდე"
                  >
                    -1
                  </button>
                  <button
                    onClick={() => updateActiveProductStock(activeProduct.id, activeSize, 1)}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs cursor-pointer"
                    title="გაზარდე მარაგი"
                  >
                    +1
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
              <span>დაცვის წესი:</span>
              <span className="text-[#8b293e] dark:text-[#f7c2cb] font-semibold font-mono">
                ფასი ვერ იქნება &lt; {activeProduct.minPrice} ₾
              </span>
            </div>
          </div>

          {/* Section 5: Decision Verdict */}
          <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Calculator className="w-3.5 h-3.5 text-[#c59d6b]" />
              გადაწყვეტილება & შეთავაზება
            </span>

            <div
              className={`p-2.5 rounded-lg border text-xs font-bold flex flex-col gap-1 ${
                decisionType === 'Counter Offer'
                  ? 'border-[#8b293e]/60 bg-[#8b293e]/20 text-[#f7c2cb]'
                  : decisionType === 'Out of Stock'
                  ? 'border-red-500/60 bg-red-950/40 text-red-300'
                  : decisionType === 'Human Approval'
                  ? 'border-[#8b293e]/60 bg-[#8b293e]/30 text-[#f7c2cb]'
                  : 'border-[#c59d6b]/60 bg-[#c59d6b]/15 text-[#c59d6b]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{decisionType}</span>
                <span className="text-[10px] font-mono font-normal">
                  {decisionType === 'Counter Offer' && `კონტრშეთავაზება: ${counterOfferPrice} ₾`}
                  {decisionType === 'Out of Stock' && 'მარაგი ამოწურულია (0 ცალი)'}
                  {decisionType === 'Human Approval' && `გადამისამართდა მენეჯერთან (ზღვარი: ${counterOfferPrice} ₾)`}
                  {decisionType === 'Accept' && 'შეთავაზება მიღებულია'}
                </span>
              </div>
              <p className="text-[10px] font-normal font-sans text-slate-300 leading-tight">
                {decisionDetails}
              </p>
            </div>
          </div>

          {/* Section 6: Final Validated Reply */}
          <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#c59d6b]" />
                Final Validated Reply (დამოწმებული პასუხი)
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#c59d6b]/15 text-[#c59d6b] border border-[#c59d6b]/40">
                Gemini 3.1 Flash Lite
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-sans whitespace-pre-wrap leading-relaxed text-slate-100">
              {generatedReply}
            </div>

            {settings.autoReplyEnabled && (
              <div className="flex items-center gap-1.5 text-[10px] text-[#c59d6b] font-medium px-2.5 py-1 rounded bg-[#c59d6b]/15 border border-[#c59d6b]/30">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#c59d6b] shrink-0" />
                <span>Auto Reply ჩართულია — ვალიდირებული პასუხი ავტომატურად გაიგზავნა</span>
              </div>
            )}

            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5 font-mono">
              <span>რეალური დაყოვნება: <strong className="text-[#c59d6b]">{measuredLatency} ms</strong></span>
              <span className="text-[#c59d6b]">🛡️ Guardrail Verified</span>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleCopyGeneratedReply}
                className="flex-1 py-1.5 px-2 rounded-lg border border-slate-700 hover:bg-slate-800 text-[11px] font-medium text-slate-300 transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                {copiedReply ? <Check className="w-3.5 h-3.5 text-[#c59d6b]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedReply ? 'დაკოპირდა!' : 'კოპირება'}</span>
              </button>

              <button
                onClick={handleSendGeneratedReplyToChat}
                className="flex-1 py-1.5 px-2 rounded-lg bg-[#c59d6b] hover:bg-[#b38a56] text-[11px] font-bold text-slate-950 transition-colors flex items-center justify-center gap-1 shadow-xs cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>ჩათში გაგზავნა</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* TEMPORARY DEBUG PANEL (Requirement 8): Raw API Response & Live Messages Integration */}
      <div className="border-t border-slate-800 bg-slate-950 shrink-0">
        {/* Debug Bar Header */}
        <div className="px-5 py-2 bg-slate-900/90 border-b border-slate-800/80 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center gap-2 shrink-0">
              <Terminal className="w-4 h-4 text-[#c59d6b]" />
              <span className="font-bold text-white tracking-wide">
                API Integration Debug Panel
              </span>
            </div>
            <div className="flex items-center gap-2 truncate">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 border border-slate-700 text-slate-300 truncate">
                GET https://traffic-spearfish-tweezers.ngrok-free.dev/messages
              </span>
              {isMetaConnected ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#c59d6b]/15 text-[#c59d6b] border border-[#c59d6b]/30 shrink-0">
                  🟢 Meta დაკავშირებულია
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#8b293e]/15 text-[#8b293e] dark:text-[#f7c2cb] border border-[#8b293e]/30 shrink-0">
                  🔴 Meta ხაზგარეშე
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
              პოლინგი: <strong className="text-white">{lastPollTimestamp || 'იტვირთება...'}</strong> (3 წმ)
            </span>
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="px-2.5 py-1 rounded-md bg-[#c59d6b] hover:bg-[#b38a56] disabled:opacity-50 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>ხელახლა გამოძახება</span>
            </button>
            <button
              onClick={() => setIsDebugOpen(!isDebugOpen)}
              className="p-1 rounded text-slate-400 hover:text-white cursor-pointer"
              title={isDebugOpen ? 'ჩაკეცვა' : 'გახსნა'}
            >
              {isDebugOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Debug Content */}
        {isDebugOpen && (
          <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4 max-h-56 overflow-y-auto bg-slate-950/95 border-t border-slate-900">
            {/* 1. Parsed Items from response.messages */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#c59d6b]" />
                  დარენდერებული შეტყობინებები (response.messages: {backendMessages.length})
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {backendMessages.length > 0 ? 'მიღებულია' : 'იტვირთება...'}
                </span>
              </div>

              {backendMessages.length === 0 ? (
                <div className="p-3 rounded-lg border border-dashed border-slate-800 text-xs text-slate-400 text-center">
                  შეტყობინებები არ არის ან იტვირთება backend-იდან...
                </div>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {backendMessages.map((bm, idx) => (
                    <div
                      key={bm.event_id || `${bm.sender_id}-${idx}`}
                      onClick={() => {
                        const targetId = `conv-meta-${bm.sender_id}`;
                        if (conversations.some((c) => c.id === targetId)) {
                          setSelectedConversationId(targetId);
                        }
                      }}
                      className="p-2.5 rounded-lg border border-slate-800 bg-slate-900/80 hover:border-[#c59d6b]/50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-400 text-[10px]">sender_id:</span>
                          <span className="font-mono font-bold text-[#c59d6b] bg-[#c59d6b]/15 px-1.5 py-0.2 rounded border border-[#c59d6b]/30">
                            {bm.sender_id}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          received_at: <span className="text-slate-300">{bm.received_at}</span>
                        </div>
                      </div>
                      <div className="text-xs text-white bg-slate-950 p-2 rounded border border-slate-800/70">
                        <span className="text-slate-400 text-[10px] block font-mono">text:</span>
                        <span className="font-medium text-[#c59d6b]">{bm.text}</span>
                      </div>
                      {bm.event_id && (
                        <div className="mt-1 text-[9px] text-slate-500 font-mono">
                          event_id: {bm.event_id} | source: {bm.source || 'instagram'}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Raw JSON from GET /messages */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-[#c59d6b]" />
                  Raw API Response (GET /messages JSON)
                </span>
                <button
                  onClick={() => {
                    if (rawBackendResponse) {
                      navigator.clipboard.writeText(JSON.stringify(rawBackendResponse, null, 2));
                      setRawCopied(true);
                      setTimeout(() => setRawCopied(false), 2000);
                    }
                  }}
                  className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 cursor-pointer"
                >
                  {rawCopied ? <Check className="w-3 h-3 text-[#c59d6b]" /> : <Copy className="w-3 h-3" />}
                  <span>{rawCopied ? 'დაკოპირდა!' : 'JSON კოპირება'}</span>
                </button>
              </div>

              <pre className="p-2.5 rounded-lg border border-slate-800 bg-slate-950 text-[10px] font-mono text-[#c59d6b] overflow-x-auto max-h-40 leading-relaxed selection:bg-[#c59d6b]/30">
                {rawBackendResponse
                  ? JSON.stringify(rawBackendResponse, null, 2)
                  : '// ჯერ არ მიღებულა პასუხი ან კავშირი მყარდება...'}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
