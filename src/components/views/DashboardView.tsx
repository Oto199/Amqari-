import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  MessageSquare,
  ShoppingBag,
  TrendingUp,
  Clock,
  AlertCircle,
  ArrowUpRight,
  Bot,
  User,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    setPage,
    setSelectedConversationId,
    conversations,
    orders,
    approvals,
    products,
  } = useApp();

  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today');

  const pendingApprovals = approvals.filter((a) => a.status === 'pending');
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);

  // Sample chart data for Orders Over Time
  const chartDays = [
    { label: 'ორშ', orders: 12, revenue: 980 },
    { label: 'სამ', orders: 19, revenue: 1540 },
    { label: 'ოთხ', orders: 15, revenue: 1210 },
    { label: 'ხუთ', orders: 24, revenue: 1890 },
    { label: 'პარ', orders: 32, revenue: 2650 },
    { label: 'შაბ', orders: 41, revenue: 3420 },
    { label: 'კვი', orders: 28, revenue: 2280 },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Page Title & Status Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            მართვის პანელი
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Instagram-ისა და Facebook-ის გაყიდვების რეალურ დროში მონიტორინგი
          </p>
        </div>

        {/* Time range selector */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setTimeRange('today')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              timeRange === 'today'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            დღეს
          </button>
          <button
            onClick={() => setTimeRange('week')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              timeRange === 'week'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            7 დღე
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              timeRange === 'month'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            30 დღე
          </button>
        </div>
      </div>

      {/* 5 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Conversations Today */}
        <div className="p-4 rounded-xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900/60 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">საუბრები დღეს</span>
            <MessageSquare className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
              48
            </span>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+18% გუშინდელთან</span>
            </div>
          </div>
        </div>

        {/* Card 2: Orders Created */}
        <div className="p-4 rounded-xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900/60 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">შექმნილი შეკვეთები</span>
            <ShoppingBag className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
              {orders.length + 9}
            </span>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>კონვერსია: 29.2%</span>
            </div>
          </div>
        </div>

        {/* Card 3: Revenue Generated */}
        <div className="p-4 rounded-xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900/60 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">გენერირებული თანხა</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
              {(totalRevenue + 940).toLocaleString()} ₾
            </span>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              <span>საშ. ჩეკი: 86 ₾</span>
            </div>
          </div>
        </div>

        {/* Card 4: Approval Requests */}
        <div className={`p-4 rounded-xl border shadow-xs flex flex-col justify-between transition-colors ${
          pendingApprovals.length > 0
            ? 'border-amber-300 dark:border-amber-800/80 bg-amber-50/50 dark:bg-amber-950/20'
            : 'border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900/60'
        }`}>
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">დასტურის მოთხოვნები</span>
            <AlertCircle className={`w-4 h-4 ${pendingApprovals.length > 0 ? 'text-amber-500' : 'text-slate-400'}`} />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
              {pendingApprovals.length}
            </span>
            <div className="flex items-center gap-1.5 text-[11px] mt-1">
              {pendingApprovals.length > 0 ? (
                <button
                  onClick={() => setPage('approvals')}
                  className="text-amber-700 dark:text-amber-400 font-semibold hover:underline flex items-center gap-1"
                >
                  გადასვლა დასტურზე <ArrowUpRight className="w-3 h-3" />
                </button>
              ) : (
                <span className="text-emerald-600 dark:text-emerald-400">ყველა დამუშავებულია</span>
              )}
            </div>
          </div>
        </div>

        {/* Card 5: Response Time */}
        <div className="p-4 rounded-xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900/60 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">პასუხის სისწრაფე</span>
            <Clock className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
              1.6 წმ
            </span>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              <span>ადამიანის ბაზისი: 38 წთ</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 1: Orders over time */}
        <div className="lg:col-span-8 p-6 rounded-xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900/60 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                შეკვეთების დინამიკა კვირის ჭრილში
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                ინსტაგრამ ჩათიდან გენერირებული ყოველდღიური შეკვეთები
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                შეკვეთები
              </span>
            </div>
          </div>

          {/* SVG Bar Chart Visualization */}
          <div className="h-56 flex items-end justify-between gap-3 pt-6 border-b border-slate-100 dark:border-slate-800 pb-2">
            {chartDays.map((d, i) => {
              const maxOrders = 45;
              const heightPct = Math.round((d.orders / maxOrders) * 100);
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity tabular-nums">
                    {d.orders} ც
                  </div>
                  <div
                    style={{ height: `${heightPct}%` }}
                    className="w-full max-w-[48px] rounded-t-md bg-emerald-500/80 group-hover:bg-emerald-500 transition-all duration-200 relative"
                  />
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-2">
                    {d.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="pt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>სულ კვირაში: <strong className="text-slate-900 dark:text-white tabular-nums">171 შეკვეთა</strong></span>
            <span>ჯამური შემოსავალი: <strong className="text-emerald-600 dark:text-emerald-400 tabular-nums">13,970 ₾</strong></span>
          </div>
        </div>

        {/* Chart 2: AI vs Human Handled Messages */}
        <div className="lg:col-span-4 p-6 rounded-xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900/60 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              AI vs ადამიანის ჩართულობა
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              შეტყობინებების ავტონომიური დამუშავების წილი
            </p>

            {/* Visual ratio bar */}
            <div className="mt-6 space-y-3">
              <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                <div style={{ width: '91%' }} className="bg-emerald-500 h-full" title="AI ავტონომიური: 91%" />
                <div style={{ width: '9%' }} className="bg-amber-500 h-full" title="ადამიანი: 9%" />
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                    <Bot className="w-4 h-4 text-emerald-500" />
                    <span>AI ავტონომიურად დამუშავებული</span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white tabular-nums">91.4%</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                    <User className="w-4 h-4 text-amber-500" />
                    <span>ადამიანის ჩარევა (ფასდაკლების ლიმიტი)</span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white tabular-nums">8.6%</span>
                </div>
              </div>
            </div>

            <div className="mt-8 p-3.5 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-white">
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                <span>დაზოგილი დრო</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                ამქარმა თქვენს გუნდს დღეს დაუზოგა <strong>6.5 საათი</strong> რუტინული მიმოწერა.
              </p>
            </div>
          </div>

          <button
            onClick={() => setPage('evaluation')}
            className="w-full mt-6 py-2 px-3 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 transition-colors flex items-center justify-center gap-1.5"
          >
            <span>აგენტის ბენჩმარკების ნახვა</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Two-Column Bottom Area: Live Inquiries & Top Inventory Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Conversations */}
        <div className="lg:col-span-7 rounded-xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900/60 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                ბოლო საუბრები Instagram-ზე
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                მომხმარებელთა აქტიური მოთხოვნები და AI რეაქციები
              </p>
            </div>
            <button
              onClick={() => setPage('inbox')}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              სრულ ინბოქსში გადასვლა <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {conversations.slice(0, 4).map((conv) => (
              <div
                key={conv.id}
                onClick={() => {
                  setSelectedConversationId(conv.id);
                  setPage('inbox');
                }}
                className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={conv.customer.avatarUrl}
                    alt={conv.customer.name}
                    className="w-9 h-9 rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                        {conv.customer.name}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {conv.customer.handle}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 truncate mt-0.5 max-w-md">
                      {conv.lastMessage.text}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[11px] text-slate-400 tabular-nums">
                    {conv.lastMessage.timestamp}
                  </span>
                  {conv.status === 'pending_approval' ? (
                    <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                      საჭიროებს დასტურს
                    </span>
                  ) : conv.orderId ? (
                    <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      შეკვეთა #{conv.orderId}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      აქტიური ჩათი
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Inventory Quick Glance */}
        <div className="lg:col-span-5 rounded-xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900/60 shadow-xs overflow-hidden flex flex-col justify-between">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                პოპულარული პროდუქტების მარაგი
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                AI აგენტის მიერ გამოყენებული კატალოგი
              </p>
            </div>
            <button
              onClick={() => setPage('products')}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              მართვა <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          <div className="p-4 space-y-3 flex-1 overflow-y-auto">
            {products.slice(0, 4).map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between gap-3 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={p.image}
                    alt={p.title}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-md object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                      {p.title}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      <span className="tabular-nums font-semibold text-slate-900 dark:text-slate-200">
                        {p.price} ₾
                      </span>
                      <span>·</span>
                      <span>მინ. ფასი: {p.minPrice} ₾</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white tabular-nums">
                    {p.totalStock} ცალი
                  </p>
                  <p className={`text-[10px] font-medium ${
                    p.status === 'out_of_stock'
                      ? 'text-red-500'
                      : p.status === 'low_stock'
                      ? 'text-amber-500'
                      : 'text-emerald-500'
                  }`}>
                    {p.status === 'out_of_stock'
                      ? 'ამოწურულია'
                      : p.status === 'low_stock'
                      ? 'მცირე მარაგი'
                      : 'მარაგშია'}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>სულ კატალოგში: <strong>{products.length} პროდუქტი</strong></span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
              სინქრონიზებული
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
