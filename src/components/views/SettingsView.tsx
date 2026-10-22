import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Settings,
  Share2,
  Sliders,
  CheckCircle2,
  Shield,
  Truck,
  Bell,
  Sparkles,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings } = useApp();
  const [isSaved, setIsSaved] = useState(false);

  // Form state initialized from context
  const [instagramAccount, setInstagramAccount] = useState(settings.instagramAccount);
  const [facebookPage, setFacebookPage] = useState(settings.facebookPage);
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(settings.autoReplyEnabled);
  const [minDiscountPct, setMinDiscountPct] = useState(settings.minDiscountPct);
  const [maxAutoDiscountPct, setMaxAutoDiscountPct] = useState(settings.maxAutoDiscountPct);
  const [requireApprovalAbove, setRequireApprovalAbove] = useState(
    settings.requireApprovalAboveDiscountThreshold
  );
  const [toneOfVoice, setToneOfVoice] = useState(settings.toneOfVoice);
  const [deliveryTbilisi, setDeliveryTbilisi] = useState(settings.standardDeliveryFeeTbilisi);
  const [deliveryRegions, setDeliveryRegions] = useState(settings.standardDeliveryFeeRegions);
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState(
    settings.freeDeliveryThreshold
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      instagramAccount,
      facebookPage,
      autoReplyEnabled,
      minDiscountPct: Number(minDiscountPct),
      maxAutoDiscountPct: Number(maxAutoDiscountPct),
      requireApprovalAboveDiscountThreshold: Number(requireApprovalAbove),
      toneOfVoice: toneOfVoice as any,
      standardDeliveryFeeTbilisi: Number(deliveryTbilisi),
      standardDeliveryFeeRegions: Number(deliveryRegions),
      freeDeliveryThreshold: Number(freeDeliveryThreshold),
    });

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Settings className="w-6 h-6 text-emerald-500" />
            <span>პარამეტრები და ბიზნეს წესები</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Meta (Instagram/Facebook) ინტეგრაცია, ვაჭრობის ავტომატური წესები და საკურიერო ტარიფები
          </p>
        </div>

        {isSaved && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>პარამეტრები შენახულია!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Meta Integration (Instagram / Facebook) */}
        <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <Share2 className="w-4 h-4 text-blue-500" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Meta (Instagram & Facebook) ინტეგრაცია
              </h2>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              სინქრონიზებულია (Webhook 200 OK)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Instagram Business ანგარიში:
              </label>
              <input
                type="text"
                value={instagramAccount}
                onChange={(e) => setInstagramAccount(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                დაკავშირებული Facebook გვერდი:
              </label>
              <input
                type="text"
                value={facebookPage}
                onChange={(e) => setFacebookPage(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Business Rules & Negotiation Thresholds (Prompt requirement) */}
        <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Sliders className="w-4 h-4 text-emerald-500" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              ბიზნეს წესები & ვაჭრობის ლიმიტები
            </h2>
          </div>

          {/* Auto Reply Enabled Toggle */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                Auto Reply Enabled (ავტომატური პასუხი)
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                თუ გამორთავთ, აგენტი გადავა მხოლოდ მონიტორინგის რეჟიმში და არ გააგზავნის შეტყობინებებს
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoReplyEnabled}
                onChange={(e) => setAutoReplyEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600" />
            </label>
          </div>

          {/* Thresholds Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            {/* Field: Require Approval Above Discount Threshold */}
            <div className="p-4 rounded-lg border border-amber-200/60 dark:border-amber-900/40 bg-amber-50/30 dark:bg-amber-950/20 space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-900 dark:text-white">
                  Require Approval Above Discount Threshold
                </label>
                <span className="font-bold text-amber-600 dark:text-amber-400 tabular-nums text-sm">
                  {requireApprovalAbove}%
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                თუ კლიენტი ითხოვს ამ ზღვარზე მეტ ფასდაკლებას (მაგ. 20%), შეტყობინება გადადის ადამიანის თანხმობის ცენტრში.
              </p>
              <input
                type="range"
                min="5"
                max="40"
                step="1"
                value={requireApprovalAbove}
                onChange={(e) => setRequireApprovalAbove(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>

            {/* Field: Maximum Auto Discount % */}
            <div className="p-4 rounded-lg border border-emerald-200/60 dark:border-emerald-900/40 bg-emerald-50/30 dark:bg-emerald-950/20 space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-900 dark:text-white">
                  Maximum Auto Discount % (AI მაქსიმუმი)
                </label>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums text-sm">
                  {maxAutoDiscountPct}%
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                მაქსიმალური ფასდაკლება, რომელსაც AI აგენტი ავტონომიურად შესთავაზებს ლოიალურ მყიდველს.
              </p>
              <input
                type="range"
                min="5"
                max="25"
                step="1"
                value={maxAutoDiscountPct}
                onChange={(e) => setMaxAutoDiscountPct(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>
          </div>

          {/* Tone of Voice */}
          <div className="text-xs space-y-2">
            <label className="font-bold text-slate-900 dark:text-white block">
              საუბრის ტონი (Tone of Voice ქართულ ენაზე):
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'friendly', title: 'მეგობრული & ენერგიული', desc: 'ემოჯები, თბილი მისალმება' },
                { id: 'formal', title: 'ოფიციალური', desc: 'თავაზიანი, ფორმალური მიმართვა' },
                { id: 'concise', title: 'პირდაპირი & მოკლე', desc: 'მხოლოდ ფაქტები და ფასები' },
              ].map((t) => (
                <div
                  key={t.id}
                  onClick={() => setToneOfVoice(t.id as any)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    toneOfVoice === t.id
                      ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/40'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <p className="font-semibold text-slate-900 dark:text-white">{t.title}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{t.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section 3: Delivery Logistics */}
        <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Truck className="w-4 h-4 text-emerald-500" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              მიტანის ტარიფები და პირობები (Courier Rules)
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                თბილისის მიტანა (₾):
              </label>
              <input
                type="number"
                value={deliveryTbilisi}
                onChange={(e) => setDeliveryTbilisi(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white font-bold tabular-nums"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                რეგიონებში მიტანა (₾):
              </label>
              <input
                type="number"
                value={deliveryRegions}
                onChange={(e) => setDeliveryRegions(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white font-bold tabular-nums"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                უფასო მიტანის ზღვარი (₾):
              </label>
              <input
                type="number"
                value={freeDeliveryThreshold}
                onChange={(e) => setFreeDeliveryThreshold(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white font-bold tabular-nums"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-md flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>ცვლილებების შენახვა</span>
          </button>
        </div>
      </form>
    </div>
  );
};
