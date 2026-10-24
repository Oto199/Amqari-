import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  Sparkles,
  MessageSquare,
  Check,
} from 'lucide-react';

export const ApprovalsView: React.FC = () => {
  const {
    approvals,
    handleApproveRequest,
    handleRejectRequest,
    handleCounterOffer,
    setPage,
    setSelectedConversationId,
  } = useApp();

  const [counterModalId, setCounterModalId] = useState<string | null>(null);
  const [customCounterPrice, setCustomCounterPrice] = useState<number>(60);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'resolved'>('all');

  const filteredApprovals = approvals.filter((a) => {
    if (statusFilter === 'pending') return a.status === 'pending';
    if (statusFilter === 'resolved') return a.status !== 'pending';
    return true;
  });

  const openCounterModal = (approvalId: string, defaultCounter: number) => {
    setCounterModalId(approvalId);
    setCustomCounterPrice(defaultCounter);
  };

  const submitCounterOffer = () => {
    if (!counterModalId) return;
    handleCounterOffer(counterModalId, customCounterPrice);
    setCounterModalId(null);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              <span>ადამიანის თანხმობის ცენტრი (Human Approval Center)</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Demo Data
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            ფასდაკლების მოთხოვნები, რომლებიც სცდება AI-ის ავტომატურ ლიმიტს (მაქს. 15-20%) და მოითხოვს მენეჯერის გადაწყვეტილებას
          </p>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-800 self-start sm:self-auto text-xs font-medium">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              statusFilter === 'all'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            ყველა ({approvals.length})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              statusFilter === 'pending'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            განსახილველი ({approvals.filter((a) => a.status === 'pending').length})
          </button>
          <button
            onClick={() => setStatusFilter('resolved')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              statusFilter === 'resolved'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            დასრულებული
          </button>
        </div>
      </div>

      {/* Main Approval Table Container */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-5 py-3.5">მომხმარებელი</th>
                <th className="px-5 py-3.5">პროდუქტი & ფასი</th>
                <th className="px-5 py-3.5">მოთხოვნილი ფასდაკლება</th>
                <th className="px-5 py-3.5">აგენტის რეკომენდაცია</th>
                <th className="px-5 py-3.5">სტატუსი</th>
                <th className="px-5 py-3.5 text-right">მოქმედება</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredApprovals.map((req) => {
                const isPending = req.status === 'pending';

                return (
                  <tr
                    key={req.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    {/* Customer Column */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={req.customer.avatarUrl}
                          alt={req.customer.name}
                          className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {req.customer.name}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {req.customer.handle}
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                            {req.createdAt}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Product & Price */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={req.productImage}
                          alt={req.productTitle}
                          className="w-10 h-10 rounded-md object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <span className="font-medium text-slate-900 dark:text-slate-100 truncate block max-w-xs">
                            {req.productTitle}
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            ზომა: {req.size} · საწყისი: <strong className="tabular-nums text-slate-700 dark:text-slate-300">{req.originalPrice} ₾</strong>
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Requested Discount (e.g. "50 ლარად მომცემ?") */}
                    <td className="px-5 py-4">
                      <div className="space-y-1">
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 font-bold tabular-nums">
                          <TrendingDown className="w-3.5 h-3.5" />
                          <span>{req.requestedPrice} ₾ (-{req.requestedDiscountPct}%)</span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 italic">
                          "50 ლარად მომცემ?"
                        </p>
                      </div>
                    </td>

                    {/* Agent Recommended Action */}
                    <td className="px-5 py-4">
                      <div className="space-y-1 max-w-sm">
                        <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-semibold text-xs">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>{req.recommendedAction}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                          {req.reasoning}
                        </p>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      {req.status === 'pending' && (
                        <span className="px-2 py-1 text-[11px] font-semibold rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
                          განსახილველი
                        </span>
                      )}
                      {req.status === 'approved' && (
                        <span className="px-2 py-1 text-[11px] font-semibold rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                          დამტკიცებული
                        </span>
                      )}
                      {req.status === 'countered' && (
                        <span className="px-2 py-1 text-[11px] font-semibold rounded-md bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300">
                          კონტრშეთავაზება ({req.recommendedCounterOffer} ₾)
                        </span>
                      )}
                      {req.status === 'rejected' && (
                        <span className="px-2 py-1 text-[11px] font-semibold rounded-md bg-red-100 text-red-800 dark:bg-red-950/80 dark:text-red-300">
                          უარყოფილი
                        </span>
                      )}
                    </td>

                    {/* Action Buttons */}
                    <td className="px-5 py-4 text-right">
                      {isPending ? (
                        <div className="flex items-center justify-end gap-2">
                          {/* Approve Button */}
                          <button
                            onClick={() => handleApproveRequest(req.id)}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center gap-1 shadow-xs"
                            title="დადასტურება მოთხოვნილ ფასზე"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>დადასტურება</span>
                          </button>

                          {/* Counter Offer Button */}
                          <button
                            onClick={() => openCounterModal(req.id, req.recommendedCounterOffer)}
                            className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs transition-colors"
                          >
                            <span>კონტრშეთავაზება</span>
                          </button>

                          {/* Reject Button */}
                          <button
                            onClick={() => handleRejectRequest(req.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                            title="უარყოფა"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedConversationId(req.conversationId);
                            setPage('inbox');
                          }}
                          className="text-xs text-slate-500 dark:text-slate-400 hover:text-emerald-500 flex items-center gap-1 justify-end ml-auto"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>ჩათის ნახვა</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Counter Offer Modal */}
      {counterModalId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <span>კონტრშეთავაზების გაგზავნა</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              აგენტის რეკომენდაციაა 60 GEL, რაც ინარჩუნებს მინიმუმ 25% მარჟას და ზრდის კონვერსიის შანსს.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                შეთავაზებული ფასი (ლარი ₾):
              </label>
              <input
                type="number"
                value={customCounterPrice}
                onChange={(e) => setCustomCounterPrice(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white tabular-nums font-bold"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setCounterModalId(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900"
              >
                გაუქმება
              </button>
              <button
                onClick={submitCounterOffer}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
              >
                კონტრშეთავაზების გაგზავნა ჩათში
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
