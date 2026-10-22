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
  } = useApp();

  const [inputText, setInputText] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending_approval' | 'active' | 'resolved'>('all');
  const [searchQuery, setSearchQuery] = useState('');

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
    sendMessage(selectedConversation.id, inputText.trim(), 'human_agent');
    setInputText('');
  };

  const handleSimulateCustomerMessage = (sampleQuery: string) => {
    if (!selectedConversation) return;
    sendMessage(selectedConversation.id, sampleQuery, 'customer');
    triggerAiResponse(selectedConversation.id, sampleQuery);
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col lg:flex-row overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* LEFT PANEL: Customer List */}
      <div className="w-full lg:w-80 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col h-full">
        {/* Search & Filter Header */}
        <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 space-y-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ძებნა მომხმარებლის ან ჩათის მიხედვით..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-900 border border-transparent dark:border-slate-800 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-emerald-500"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-lg text-[11px] font-medium overflow-x-auto">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap ${
                filter === 'all'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              ყველა ({conversations.length})
            </button>
            <button
              onClick={() => setFilter('pending_approval')}
              className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap ${
                filter === 'pending_approval'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              დასტური
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap ${
                filter === 'active'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              აქტიური
            </button>
            <button
              onClick={() => setFilter('resolved')}
              className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap ${
                filter === 'resolved'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              შეკვეთილი
            </button>
          </div>
        </div>

        {/* Conversation Items */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
          {filteredConversations.map((c) => {
            const isSelected = c.id === selectedConversationId;
            return (
              <div
                key={c.id}
                onClick={() => setSelectedConversationId(c.id)}
                className={`p-3.5 cursor-pointer transition-colors flex items-start gap-3 ${
                  isSelected
                    ? 'bg-emerald-50/70 dark:bg-slate-800/80 border-l-2 border-emerald-500'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-900/50'
                }`}
              >
                <div className="relative shrink-0">
                  <img
                    src={c.customer.avatarUrl}
                    alt={c.customer.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                    referrerPolicy="no-referrer"
                  />
                  {c.unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                      {c.unreadCount}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                      {c.customer.name}
                    </span>
                    <span className="text-[10px] text-slate-400 tabular-nums">
                      {c.lastMessage.timestamp}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 font-mono truncate">
                    {c.customer.handle}
                  </p>

                  <p className="text-xs text-slate-600 dark:text-slate-300 truncate mt-1">
                    {c.lastMessage.sender === 'ai_agent' && (
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">AI: </span>
                    )}
                    {c.lastMessage.text}
                  </p>

                  {/* Status Indicator Tag */}
                  <div className="mt-2 flex items-center gap-1.5">
                    {c.status === 'pending_approval' && (
                      <span className="px-1.5 py-0.5 text-[9px] font-semibold rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                        ფასდაკლების დასტური
                      </span>
                    )}
                    {c.orderId && (
                      <span className="px-1.5 py-0.5 text-[9px] font-semibold rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                        შეკვეთა #{c.orderId}
                      </span>
                    )}
                    {c.aiHandled && (
                      <span className="text-[10px] text-slate-400 flex items-center gap-1 ml-auto">
                        <Bot className="w-3 h-3 text-emerald-500" />
                        ავტონომიური
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CENTER PANEL: Chat Window */}
      {selectedConversation ? (
        <div className="flex-1 flex flex-col h-full bg-white dark:bg-slate-900/40 border-r border-slate-200 dark:border-slate-800">
          {/* Chat Header */}
          <div className="h-16 px-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-950">
            <div className="flex items-center gap-3">
              <img
                src={selectedConversation.customer.avatarUrl}
                alt={selectedConversation.customer.name}
                className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                referrerPolicy="no-referrer"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                    {selectedConversation.customer.name}
                  </h3>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {selectedConversation.customer.handle}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Instagram Direct · AI რეაგირება აქტიურია</span>
                </div>
              </div>
            </div>

            {/* Quick action button */}
            {selectedConversation.status === 'pending_approval' && (
              <button
                onClick={() => setPage('approvals')}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-600 text-white transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>ფასდაკლების დამტკიცება</span>
              </button>
            )}
          </div>

          {/* Quick Simulation Scenarios Bar */}
          <div className="px-6 py-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 flex items-center gap-2 overflow-x-auto text-xs">
            <span className="text-slate-400 shrink-0 font-medium text-[11px]">სატესტო მესიჯი:</span>
            <button
              onClick={() => handleSimulateCustomerMessage('50 ლარად მომცემ?')}
              className="px-2.5 py-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-slate-700 dark:text-slate-300 text-[11px] transition-colors whitespace-nowrap"
            >
              "50 ლარად მომცემ?"
            </button>
            <button
              onClick={() => handleSimulateCustomerMessage('ნაკრების მაისური გაქვთ L ზომა?')}
              className="px-2.5 py-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-slate-700 dark:text-slate-300 text-[11px] transition-colors whitespace-nowrap"
            >
              "მარაგი გაქვთ L ზომა?"
            </button>
            <button
              onClick={() => handleSimulateCustomerMessage('კი, ვყიდულობ, თბილისში მიტანით')}
              className="px-2.5 py-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-slate-700 dark:text-slate-300 text-[11px] transition-colors whitespace-nowrap"
            >
              "ვყიდულობ, მიტანით"
            </button>
          </div>

          {/* Message History */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {selectedConversation.messages.map((msg) => {
              const isCustomer = msg.sender === 'customer';
              const isAi = msg.sender === 'ai_agent';

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isCustomer ? 'items-start' : 'items-end'}`}
                >
                  <div
                    className={`max-w-md rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-xs ${
                      isCustomer
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-xs'
                        : isAi
                        ? 'bg-slate-900 text-white dark:bg-emerald-600 dark:text-white rounded-br-xs'
                        : 'bg-blue-600 text-white rounded-br-xs'
                    }`}
                  >
                    <p>{msg.text}</p>

                    {/* Metadata Footer */}
                    <div className="mt-1 flex items-center justify-end gap-1.5 text-[10px] opacity-75">
                      <span>{msg.timestamp}</span>
                      {isAi && (
                        <span className="flex items-center gap-0.5 text-emerald-300 dark:text-emerald-100">
                          <Bot className="w-2.5 h-2.5" />
                          <span>AI აგენტი</span>
                        </span>
                      )}
                      {msg.sender === 'human_agent' && (
                        <span className="flex items-center gap-0.5">
                          <User className="w-2.5 h-2.5" />
                          <span>ოპერატორი</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* AI Metadata Pill / Reason callout if available */}
                  {msg.aiMetadata && (
                    <div className="mt-1 text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-emerald-500" />
                      <span>{msg.aiMetadata.actionTaken}</span>
                    </div>
                  )}
                </div>
              );
            })}

            {isAiTyping && (
              <div className="flex items-center gap-2 text-xs text-slate-400 italic">
                <Bot className="w-3.5 h-3.5 text-emerald-500 animate-spin" />
                <span>ამქარი აანალიზებს მარაგს და აყალიბებს პასუხს...</span>
              </div>
            )}
          </div>

          {/* Message Input Box */}
          <form
            onSubmit={handleSendHumanMessage}
            className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center gap-3"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="უპასუხეთ როგორც მაღაზიის მენეჯერი..."
              className="flex-1 px-4 py-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-900 border border-transparent dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-emerald-500"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white transition-colors disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center p-8 text-center text-slate-400 text-xs">
          აირჩიეთ საუბარი მარცხენა სიიდან
        </div>
      )}

      {/* RIGHT PANEL: Customer Profile & AI Actions Timeline */}
      {selectedConversation && (
        <div className="w-full lg:w-80 shrink-0 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-5 overflow-y-auto space-y-6">
          {/* Customer Profile Header */}
          <div className="flex flex-col items-center text-center pb-4 border-b border-slate-100 dark:border-slate-800">
            <img
              src={selectedConversation.customer.avatarUrl}
              alt={selectedConversation.customer.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-slate-200 dark:border-slate-700 shadow-sm"
              referrerPolicy="no-referrer"
            />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-2">
              {selectedConversation.customer.name}
            </h4>
            <span className="text-xs text-slate-400 font-mono">
              {selectedConversation.customer.handle}
            </span>

            {/* Risk Flag Badge */}
            <div className="mt-3">
              {selectedConversation.customer.riskLevel === 'low' ? (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-[11px] font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>დაბალი რისკი · სანდო</span>
                </div>
              ) : selectedConversation.customer.riskLevel === 'medium' ? (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-[11px] font-medium">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>საშუალო რისკი</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-[11px] font-medium">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>მაღალი რისკი</span>
                </div>
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
              {selectedConversation.customer.riskReason}
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
              <span className="text-[11px] text-slate-400">შეკვეთები</span>
              <p className="text-base font-bold text-slate-900 dark:text-white tabular-nums mt-0.5">
                {selectedConversation.customer.previousOrdersCount}
              </p>
            </div>
            <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
              <span className="text-[11px] text-slate-400">LTV ჯამი</span>
              <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 tabular-nums mt-0.5">
                {selectedConversation.customer.lifetimeValue} ₾
              </p>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-2 text-xs">
            <h5 className="font-semibold text-slate-900 dark:text-white">საკონტაქტო ინფო</h5>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>{selectedConversation.customer.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{selectedConversation.customer.city}</span>
            </div>
          </div>

          {/* AI ACTIONS TIMELINE (Specific prompt requirement) */}
          <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                <span>AI მოქმედებების ქრონოლოგია</span>
              </h5>
            </div>

            <div className="space-y-4 pl-2 border-l border-emerald-500/40 dark:border-emerald-500/20 text-xs">
              {/* Step 1: Product Identified */}
              <div className="relative pl-4">
                <div className="absolute -left-[17px] top-0 w-3.5 h-3.5 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
                <div className="flex items-center justify-between text-slate-900 dark:text-slate-100 font-semibold">
                  <span>პროდუქტი ამოცნობილია</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    {selectedConversation.timeline.productIdentified?.timestamp || '11:15'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {selectedConversation.timeline.productIdentified?.name ||
                    'საქართველოს ნაკრები 2024'}
                </p>
              </div>

              {/* Step 2: Inventory Checked */}
              <div className="relative pl-4">
                <div className="absolute -left-[17px] top-0 w-3.5 h-3.5 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
                <div className="flex items-center justify-between text-slate-900 dark:text-slate-100 font-semibold">
                  <span>ინვენტარი შემოწმებულია</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    {selectedConversation.timeline.inventoryChecked?.timestamp || '11:16'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {selectedConversation.timeline.inventoryChecked?.details ||
                    'ზომა L: მარაგშია (5 ცალი)'}
                </p>
              </div>

              {/* Step 3: Discount Evaluated */}
              <div className="relative pl-4">
                <div className="absolute -left-[17px] top-0 w-3.5 h-3.5 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
                <div className="flex items-center justify-between text-slate-900 dark:text-slate-100 font-semibold">
                  <span>ფასდაკლება შეფასებულია</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    {selectedConversation.timeline.discountEvaluated?.timestamp || '11:18'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {selectedConversation.timeline.discountEvaluated?.details ||
                    'კონტრშეთავაზება: 75₾ (მარჟა დაცულია)'}
                </p>
              </div>

              {/* Step 4: Order Created */}
              <div className="relative pl-4">
                <div className={`absolute -left-[17px] top-0 w-3.5 h-3.5 rounded-full flex items-center justify-center ${
                  selectedConversation.timeline.orderCreated
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-300 dark:bg-slate-700 text-slate-500'
                }`}>
                  {selectedConversation.timeline.orderCreated ? (
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  ) : (
                    <Clock className="w-2.5 h-2.5" />
                  )}
                </div>
                <div className="flex items-center justify-between text-slate-900 dark:text-slate-100 font-semibold">
                  <span>შეკვეთა შექმნილია</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    {selectedConversation.timeline.orderCreated?.timestamp || 'მოლოდინში'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {selectedConversation.timeline.orderCreated?.orderId ||
                    'მომხმარებლის მისამართის მოლოდინი'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
