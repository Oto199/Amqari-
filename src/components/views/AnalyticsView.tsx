import React from 'react';
import {
  BarChart3,
  TrendingUp,
  Percent,
  Clock,
  Sparkles,
  AlertTriangle,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  // Hourly distribution of incoming Instagram DMs in Tbilisi time
  const hourlyTraffic = [
    { hour: '09:00', messages: 14, aiHandledPct: 92 },
    { hour: '11:00', messages: 38, aiHandledPct: 94 },
    { hour: '13:00', messages: 52, aiHandledPct: 88 },
    { hour: '15:00', messages: 46, aiHandledPct: 91 },
    { hour: '17:00', messages: 68, aiHandledPct: 90 },
    { hour: '19:00', messages: 84, aiHandledPct: 93 }, // Peak
    { hour: '21:00', messages: 72, aiHandledPct: 95 },
    { hour: '23:00', messages: 41, aiHandledPct: 98 }, // Late night fully autonomous
    { hour: '01:00', messages: 18, aiHandledPct: 100 },
  ];

  const negotiationBuckets = [
    { label: 'სრული ფასი (ფასდაკლების გარეშე)', count: 86, percentage: 48 },
    { label: '5% - 10% ფასდაკლება (ავტონომიური)', count: 54, percentage: 30 },
    { label: '11% - 15% ფასდაკლება (კონტრშეთავაზებით)', count: 26, percentage: 15 },
    { label: '>20% მოთხოვნა (ადამიანის დასტურით)', count: 12, percentage: 7 },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <BarChart3 className="w-6 h-6 text-[#c59d6b]" />
          <span>გაყიდვების და AI აგენტის ანალიტიკა</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Instagram Direct და Facebook Messenger-ის კონვერსიების, მოლაპარაკებების და მარჟის სტატისტიკა
        </p>
      </div>

      {/* 6 Key Analytics Cards (Required by Prompt) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Metric 1: Revenue */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span className="font-medium">ჯამური შემოსავალი (Revenue)</span>
            <TrendingUp className="w-4 h-4 text-[#c59d6b]" />
          </div>
          <div className="mt-3">
            <p className="text-3xl font-bold text-slate-900 dark:text-white tabular-nums tracking-tight">
              14,850 ₾
            </p>
            <div className="flex items-center gap-1.5 text-xs text-[#c59d6b] mt-1.5 font-semibold">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+28.4% წინა თვესთან</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              გენერირებულია 178 დადასტურებული შეკვეთიდან
            </p>
          </div>
        </div>

        {/* Metric 2: Conversion Rate */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span className="font-medium">კონვერსიის კოეფიციენტი (Conversion Rate)</span>
            <Percent className="w-4 h-4 text-[#8b293e]" />
          </div>
          <div className="mt-3">
            <p className="text-3xl font-bold text-slate-900 dark:text-white tabular-nums tracking-tight">
              28.6%
            </p>
            <div className="flex items-center gap-1.5 text-xs text-[#c59d6b] mt-1.5 font-semibold">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+6.2% ავტონომიური პასუხების შემდეგ</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              ინდუსტრიის საშუალო DM კონვერსია: 11-14%
            </p>
          </div>
        </div>

        {/* Metric 3: Average Response Time */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span className="font-medium">საშუალო რეაგირების დრო (Avg Response Time)</span>
            <Clock className="w-4 h-4 text-[#c59d6b]" />
          </div>
          <div className="mt-3">
            <p className="text-3xl font-bold text-slate-900 dark:text-white tabular-nums tracking-tight">
              1.4 წმ
            </p>
            <div className="flex items-center gap-1.5 text-xs text-[#c59d6b] mt-1.5 font-semibold">
              <span>99.8% პასუხი 3 წამზე ნაკლებში</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              ადამიანის საშუალო პასუხი: 42 წუთი
            </p>
          </div>
        </div>

        {/* Metric 4: Successful Negotiations */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span className="font-medium">წარმატებული მოლაპარაკებები (Negotiations)</span>
            <Sparkles className="w-4 h-4 text-[#8b293e]" />
          </div>
          <div className="mt-3">
            <p className="text-3xl font-bold text-slate-900 dark:text-white tabular-nums tracking-tight">
              142 გარიგება
            </p>
            <div className="flex items-center gap-1.5 text-xs text-[#c59d6b] mt-1.5 font-semibold">
              <span>შენარჩუნებული მარჟა: 88.4%</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              მომხმარებელთა 76% დათანხმდა AI კონტრშეთავაზებას
            </p>
          </div>
        </div>

        {/* Metric 5: Human Escalations */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span className="font-medium">ადამიანზე გადამისამართება (Escalations)</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-3">
            <p className="text-3xl font-bold text-slate-900 dark:text-white tabular-nums tracking-tight">
              8.6%
            </p>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1.5">
              <span>მხოლოდ არასტანდარტული მოთხოვნები</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              მაღალი ფასდაკლების მოთხოვნები (&gt;20%)
            </p>
          </div>
        </div>

        {/* Metric 6: AI Success Rate */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span className="font-medium">AI წარმატების კოეფიციენტი (AI Success Rate)</span>
            <ShieldCheck className="w-4 h-4 text-[#c59d6b]" />
          </div>
          <div className="mt-3">
            <p className="text-3xl font-bold text-[#c59d6b] tabular-nums tracking-tight">
              96.8%
            </p>
            <div className="flex items-center gap-1.5 text-xs text-[#c59d6b] mt-1.5 font-semibold">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>0% ჰალუცინაციის მაჩვენებელი</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              ყველა შეკვეთა გადამოწმებულია მარაგით
            </p>
          </div>
        </div>
      </div>

      {/* Hourly Activity & Negotiation Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Hourly Volume */}
        <div className="lg:col-span-7 p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
            Instagram DM შეტყობინებების საათობრივი დატვირთვა
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            განსაკუთრებული პიკი ფიქსირდება საღამოს (18:00 - 23:00) როდესაც ადამიანები ისვენებენ
          </p>

          <div className="mt-8 space-y-3">
            {hourlyTraffic.map((h, i) => (
              <div key={i} className="flex items-center gap-3 text-xs">
                <span className="w-12 text-slate-500 font-mono tabular-nums text-[11px]">
                  {h.hour}
                </span>
                <div className="flex-1 h-3.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                  <div
                    style={{ width: `${(h.messages / 90) * 100}%` }}
                    className="bg-[#c59d6b] rounded-full h-full"
                  />
                </div>
                <span className="w-16 text-right font-bold text-slate-900 dark:text-white tabular-nums">
                  {h.messages} მესიჯი
                </span>
                <span className="w-16 text-right text-[11px] text-[#c59d6b] font-medium tabular-nums">
                  {h.aiHandledPct}% AI
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Negotiation Distribution */}
        <div className="lg:col-span-5 p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              ფასდაკლებისა და ვაჭრობის სტრუქტურა
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              როგორ ნაწილდება მომხმარებელთა მოთხოვნები
            </p>

            <div className="mt-6 space-y-4">
              {negotiationBuckets.map((b, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-700 dark:text-slate-300 font-medium">
                      {b.label}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                      {b.percentage}% ({b.count})
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${b.percentage}%` }}
                      className={`h-full rounded-full ${
                        idx === 0
                          ? 'bg-[#c59d6b]'
                          : idx === 1
                          ? 'bg-[#8b293e]'
                          : idx === 2
                          ? 'bg-[#d8b584]'
                          : 'bg-[#5b1928]'
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 p-4 rounded-lg bg-[#c59d6b]/10 dark:bg-[#c59d6b]/10 border border-[#c59d6b]/30 text-xs text-slate-800 dark:text-[#f3e3ce]">
            <strong>ეკონომიკური ეფექტი:</strong> ამქარმა თავიდან აგარიდათ <strong>1,840 ₾</strong>-ის გაუმართლებელი ფასდაკლებები მინიმალური ზღვრის მკაცრი დაცვით.
          </div>
        </div>
      </div>
    </div>
  );
};
