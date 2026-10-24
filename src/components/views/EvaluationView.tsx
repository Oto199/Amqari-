import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  Play,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Database,
  Calculator,
  Terminal,
} from 'lucide-react';

export const EvaluationView: React.FC = () => {
  const {
    benchmarkMetrics,
    benchmarkTests,
    runBenchmarkTests,
    isTestingBenchmarks,
  } = useApp();

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
              <ShieldCheck className="w-6 h-6 text-[#c59d6b]" />
              <span>AI აგენტის შეფასება & ბენჩმარკი (Evaluation & Benchmarks)</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-[#c59d6b]/10 text-[#c59d6b] border border-[#c59d6b]/20">
              Demo Data
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            ჰალუცინაციების პრევენციის, ინვენტარის გადამოწმებისა და ქართული ენის გაგების სატესტო სცენარები
          </p>
        </div>

        <button
          onClick={runBenchmarkTests}
          disabled={isTestingBenchmarks}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#c59d6b] hover:bg-[#b58c5a] text-slate-950 font-bold text-xs transition-colors shadow-xs disabled:opacity-50 self-start sm:self-auto"
        >
          {isTestingBenchmarks ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              <span>ტესტები მიმდინარეობს...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>სრული სატესტო ნაკრების გაშვება</span>
            </>
          )}
        </button>
      </div>

      {/* 5 Core Benchmark Cards (Prompt requirement) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {benchmarkMetrics.map((bm, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {bm.title}
                </span>
                <span className="text-[11px] font-mono text-[#c59d6b] font-bold">
                  {bm.trend}
                </span>
              </div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-3 tabular-nums">
                {bm.score}%
              </p>
              <div className="mt-2 h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  style={{ width: `${bm.score}%` }}
                  className="bg-[#c59d6b] h-full rounded-full"
                />
              </div>
            </div>
            <p className="text-[10px] text-slate-400 mt-3 leading-tight">
              {bm.description}
            </p>
          </div>
        ))}
      </div>

      {/* Test Suites Runner Table */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              ავტომატური ტესტების ბენჩმარკები (Georgian Edge Cases)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              რთული სცენარები: აგრესიული ვაჭრობა, ამოწურული ზომები, არარსებული პროდუქტები
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>სულ: <strong>{benchmarkTests.length} ტესტი</strong></span>
            <span>·</span>
            <span className="text-[#c59d6b] font-bold">100% Passed</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-5 py-3">კატეგორია</th>
                <th className="px-5 py-3">მომხმარებლის მოთხოვნა (Prompt)</th>
                <th className="px-5 py-3">მოსალოდნელი ქცევა & წესი</th>
                <th className="px-5 py-3 text-right">ლატენტობა</th>
                <th className="px-5 py-3 text-center">სტატუსი</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {benchmarkTests.map((tc) => (
                <tr
                  key={tc.id}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <td className="px-5 py-4 font-mono font-semibold text-[#8b293e] dark:text-[#f3c2cb]">
                    {tc.category}
                  </td>
                  <td className="px-5 py-4 font-medium text-slate-900 dark:text-white max-w-xs">
                    "{tc.prompt}"
                  </td>
                  <td className="px-5 py-4 text-slate-600 dark:text-slate-300 max-w-sm">
                    {tc.expectedBehavior}
                    <div className="text-[10px] text-slate-400 font-mono mt-1 bg-slate-50 dark:bg-slate-950 p-1.5 rounded">
                      {tc.logDetails}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right font-mono text-slate-500 tabular-nums">
                    {tc.latencyMs} ms
                  </td>
                  <td className="px-5 py-4 text-center">
                    {tc.status === 'running' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-[#8b293e]/15 text-[#e09ba7] border border-[#8b293e]/30">
                        ტესტირება...
                      </span>
                    ) : tc.status === 'passed' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-[#c59d6b]/15 text-[#c59d6b] border border-[#c59d6b]/30">
                        <CheckCircle2 className="w-3 h-3 text-[#c59d6b]" />
                        ჩაბარდა ({tc.accuracyScore}%)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300">
                        <AlertCircle className="w-3 h-3 text-red-500" />
                        ჩაიჭრა
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
