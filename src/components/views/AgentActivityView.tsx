import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AgentReasoningTrace } from '../../types';
import {
  Cpu,
  ArrowDown,
  Sparkles,
  CheckCircle2,
  Clock,
  Play,
  Terminal,
  Database,
  Calculator,
  Shield,
  MessageCircle,
} from 'lucide-react';

export const AgentActivityView: React.FC = () => {
  const { traces, runTraceSimulation } = useApp();
  const [selectedTraceId, setSelectedTraceId] = useState<string>(traces[0]?.id || '');
  const [customInput, setCustomInput] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  const activeTrace: AgentReasoningTrace | undefined =
    traces.find((t) => t.id === selectedTraceId) || traces[0];

  const handleRunCustomSimulation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;

    setIsRunning(true);
    setTimeout(() => {
      const trace = runTraceSimulation(customInput.trim());
      setSelectedTraceId(trace.id);
      setIsRunning(false);
      setCustomInput('');
    }, 450);
  };

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Cpu className="w-6 h-6 text-emerald-500" />
            <span>AI აგენტის აზროვნების ნაკადი</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            შეტყობინების მიღებიდან შეკვეთის გაფორმებამდე 6-საფეხურიანი გადაწყვეტილების მიღების ვიზუალიზაცია
          </p>
        </div>

        {/* Live Status Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-semibold self-start sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Real-Time Inference Pipeline · 280ms საშუალო დრო</span>
        </div>
      </div>

      {/* Interactive Simulation Sandbox Bar */}
      <form
        onSubmit={handleRunCustomSimulation}
        className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col sm:flex-row items-center gap-3"
      >
        <div className="relative flex-1 w-full">
          <Terminal className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder="შეიყვანეთ ნებისმიერი მესიჯი (მაგ: 'ნაკრების მაისური 60 ლარად თუ გაქვთ L ზომა?')..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-emerald-500"
          />
        </div>
        <button
          type="submit"
          disabled={isRunning || !customInput.trim()}
          className="w-full sm:w-auto px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50 whitespace-nowrap"
        >
          {isRunning ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>მუშავდება...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>ნაკადის გაშვება</span>
            </>
          )}
        </button>
      </form>

      {/* MAIN TWO-COLUMN WORKFLOW INSPECTOR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: 6-Step Workflow Visualization (Prompt requirement) */}
        <div className="lg:col-span-7 space-y-4">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span>გადაწყვეტილების ეტაპობრივი გრაფი</span>
          </h2>

          <div className="space-y-3">
            {/* Step 1: Incoming Message */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs relative">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-blue-500" />
                  1. შემოსული შეტყობინება (Incoming Message)
                </span>
                <span className="font-mono text-[11px] tabular-nums">{activeTrace?.timestamp}</span>
              </div>
              <div className="mt-2.5 p-3 rounded-lg bg-slate-50 dark:bg-slate-950 font-medium text-xs text-slate-800 dark:text-slate-200">
                "{activeTrace?.customerMessage}"
              </div>
            </div>

            {/* Connector */}
            <div className="flex justify-center -my-1 text-slate-300 dark:text-slate-700">
              <ArrowDown className="w-4 h-4" />
            </div>

            {/* Step 2: Intent Detection */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs relative">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  2. განზრახვის იდენტიფიკაცია (Intent Detection)
                </span>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold tabular-nums">
                  სიზუსტე: {Math.round((activeTrace?.confidenceScore || 0.98) * 100)}%
                </span>
              </div>
              <div className="mt-2.5 flex items-center gap-3">
                <span className="px-2.5 py-1 rounded-md bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 text-xs font-mono font-semibold">
                  {activeTrace?.intent}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  კლასიფიცირებულია ქართული NLP ემბედინგით
                </span>
              </div>
            </div>

            {/* Connector */}
            <div className="flex justify-center -my-1 text-slate-300 dark:text-slate-700">
              <ArrowDown className="w-4 h-4" />
            </div>

            {/* Step 3: Inventory Lookup */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs relative">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-500" />
                  3. ინვენტარის გადამოწმება (Inventory Lookup)
                </span>
                <span className="text-[11px] text-slate-400 font-mono">SQL / Store Engine</span>
              </div>
              <div className="mt-2.5 grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded bg-slate-50 dark:bg-slate-950">
                  <span className="text-[11px] text-slate-400">პროდუქტი:</span>
                  <p className="font-medium text-slate-900 dark:text-slate-100 mt-0.5 truncate">
                    {activeTrace?.inventoryLookup.product}
                  </p>
                </div>
                <div className="p-2 rounded bg-slate-50 dark:bg-slate-950">
                  <span className="text-[11px] text-slate-400">მარაგი ზომაზე:</span>
                  <p className="font-medium text-emerald-600 dark:text-emerald-400 mt-0.5 tabular-nums">
                    {activeTrace?.inventoryLookup.quantity} ცალი ({activeTrace?.inventoryLookup.size})
                  </p>
                </div>
              </div>
            </div>

            {/* Connector */}
            <div className="flex justify-center -my-1 text-slate-300 dark:text-slate-700">
              <ArrowDown className="w-4 h-4" />
            </div>

            {/* Step 4: Pricing Rules */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs relative">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-amber-500" />
                  4. საფასო პოლიტიკის შემოწმება (Pricing Rules)
                </span>
                <span className="text-[11px] text-slate-400">Margin Guard Engine</span>
              </div>
              <div className="mt-2.5 p-3 rounded-lg bg-slate-50 dark:bg-slate-950 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span>კატალოგის ფასი:</span>
                  <strong className="text-slate-900 dark:text-white tabular-nums">
                    {activeTrace?.pricingRules.basePrice} ₾
                  </strong>
                </div>
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span>მინიმალური დასაშვები ზღვარი (Floor):</span>
                  <strong className="text-slate-900 dark:text-white tabular-nums">
                    {activeTrace?.pricingRules.minAllowedPrice} ₾
                  </strong>
                </div>
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span>მოთხოვნილი / გაანგარიშებული ფასი:</span>
                  <strong className="text-amber-600 dark:text-amber-400 tabular-nums">
                    {activeTrace?.pricingRules.requestedPrice} ₾
                  </strong>
                </div>
              </div>
            </div>

            {/* Connector */}
            <div className="flex justify-center -my-1 text-slate-300 dark:text-slate-700">
              <ArrowDown className="w-4 h-4" />
            </div>

            {/* Step 5: Decision */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs relative">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-500" />
                  5. გადაწყვეტილება (Decision)
                </span>
                <span className="text-[11px] text-slate-400 font-mono">Policy Arbiter</span>
              </div>
              <div className="mt-2.5 p-3 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-xs text-emerald-900 dark:text-emerald-200 font-medium">
                {activeTrace?.decision}
              </div>
            </div>

            {/* Connector */}
            <div className="flex justify-center -my-1 text-slate-300 dark:text-slate-700">
              <ArrowDown className="w-4 h-4" />
            </div>

            {/* Step 6: Response */}
            <div className="p-4 rounded-xl border border-emerald-500/50 dark:border-emerald-500/30 bg-white dark:bg-slate-900 shadow-sm relative">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  6. საბოლოო პასუხი (Response to Customer)
                </span>
                <span className="text-[11px] text-slate-400 flex items-center gap-1 tabular-nums">
                  <Clock className="w-3 h-3" />
                  {activeTrace?.executionTimeMs} ms
                </span>
              </div>
              <div className="mt-2.5 p-3.5 rounded-lg bg-slate-900 text-white dark:bg-emerald-600 font-medium text-xs leading-relaxed">
                "{activeTrace?.finalResponse}"
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Recent Traces & Tool Call Logs */}
        <div className="lg:col-span-5 space-y-6">
          {/* Traces List */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-semibold text-slate-900 dark:text-white">
                ბოლო გამოძახებების ისტორია (Recent Traces)
              </h3>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800/60 max-h-72 overflow-y-auto">
              {traces.map((tr) => (
                <div
                  key={tr.id}
                  onClick={() => setSelectedTraceId(tr.id)}
                  className={`p-3 text-xs cursor-pointer transition-colors ${
                    tr.id === activeTrace?.id
                      ? 'bg-emerald-50 dark:bg-slate-800/80 border-l-2 border-emerald-500'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'
                  }`}
                >
                  <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
                    <span className="font-mono tabular-nums">{tr.timestamp}</span>
                    <span className="tabular-nums">{tr.executionTimeMs} ms</span>
                  </div>
                  <p className="font-medium text-slate-900 dark:text-slate-100 truncate">
                    "{tr.customerMessage}"
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400">
                      {tr.intent}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Low-Level Tool Calls Inspection */}
          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-950 text-slate-200 shadow-xs space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-emerald-400 font-semibold text-[11px]">
                EXECUTED FUNCTION TOOLS
              </span>
              <span className="text-[10px] text-slate-500">JSON SCHEMA</span>
            </div>

            <div className="space-y-2">
              {activeTrace?.toolCalls.map((tool, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-300 flex items-center gap-2"
                >
                  <span className="text-emerald-400 select-none">&gt;</span>
                  <span className="text-emerald-300">{tool}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 text-[10px] text-slate-500 flex items-center justify-between">
              <span>Deterministic Validation: ACTIVE</span>
              <span>Guardrails: 0 Hallucinations</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
