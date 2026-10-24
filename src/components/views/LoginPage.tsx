import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  MessageSquare,
  ShieldCheck,
  TrendingUp,
  Zap,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';
import amqariLogo from '../../assets/images/amqari logo.png';

export const LoginPage: React.FC = () => {
  const { loginWithMeta } = useApp();

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between selection:bg-[#c59d6b] selection:text-slate-950">
      {/* Top Bar */}
      <header className="border-b border-slate-800/70 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl p-1 border border-[#c59d6b]/30 bg-white flex items-center justify-center shrink-0 shadow-sm">
            <img src={amqariLogo} alt="ამქარი" className="w-full h-full object-contain" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
            <span>ამქარი</span>
            <span className="w-2 h-2 rounded-full bg-[#c59d6b]" />
          </span>
          <span className="text-xs text-[#c59d6b] font-mono hidden sm:inline ml-2 border-l border-slate-800 pl-3">
            amqari.ge
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={loginWithMeta}
            className="text-xs text-slate-300 hover:text-white transition-colors"
          >
            დემო მაღაზიის დათვალიერება
          </button>
          <button
            onClick={loginWithMeta}
            className="px-4 py-2 text-xs font-bold rounded-lg bg-[#c59d6b] hover:bg-[#b38a56] text-slate-950 transition-all shadow-sm"
          >
            შესვლა
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-12 lg:py-16 grid lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Value Prop */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#8b293e]/20 border border-[#8b293e]/40 text-[#f7c2cb] text-xs font-semibold">
            <Zap className="w-3.5 h-3.5 text-[#c59d6b]" />
            <span>ქართული ონლაინ მაღაზიების ავტონომიური ასისტენტი</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            ამქარი
          </h1>

          <p className="text-xl sm:text-2xl font-semibold text-[#c59d6b] tracking-tight">
            AI გაყიდვების აგენტი მცირე ბიზნესისთვის
          </p>

          <p className="text-base text-slate-300 max-w-2xl leading-relaxed">
            ავტომატურად პასუხობს მომხმარებლის შეტყობინებებს Instagram-სა და Facebook-ზე, ამოწმებს რეალურ მარაგს,
            ჭკვიანურად ევაჭრება დადგენილ მარჟებში და აფორმებს გადამოწმებულ შეკვეთებს 24/7 რეჟიმში.
          </p>

          {/* Login with Meta Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <button
              onClick={loginWithMeta}
              className="flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl bg-[#8b293e] hover:bg-[#752233] text-white font-semibold text-sm transition-all shadow-md group"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
              <span>შესვლა Meta-ს მეშვეობით</span>
              <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
            </button>

            <button
              onClick={loginWithMeta}
              className="px-5 py-3.5 rounded-xl border border-[#c59d6b]/50 hover:border-[#c59d6b] bg-slate-900/60 text-[#c59d6b] hover:text-white text-sm font-semibold transition-colors"
            >
              სატესტო დემოს გაშვება
            </button>
          </div>

          {/* Value Proof Badges */}
          <div className="pt-6 grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-slate-800/80">
            <div>
              <p className="text-2xl font-bold text-white tabular-nums">1.4 წმ</p>
              <p className="text-xs text-slate-400 mt-0.5">პასუხის საშუალო დრო</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-[#c59d6b] tabular-nums">94.7%</p>
              <p className="text-xs text-slate-400 mt-0.5">შეკვეთების წარმატება</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white tabular-nums">0%</p>
              <p className="text-xs text-slate-400 mt-0.5">ჰალუცინაციის რისკი</p>
            </div>
          </div>
        </div>

        {/* Right Column: Visual Preview */}
        <div className="lg:col-span-5 relative">
          <div className="relative rounded-2xl border border-slate-800 bg-slate-900/80 p-2 shadow-2xl overflow-hidden backdrop-blur-sm">
            <img
              src="/src/assets/images/amqari_agent_preview_1792697602663.jpg"
              alt="ამქარი AI გაყიდვების აგენტი ინტერფეისი"
              referrerPolicy="no-referrer"
              className="rounded-xl w-full object-cover h-[440px]"
            />
            
            {/* Live interaction card overlay */}
            <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl border border-[#c59d6b]/40 bg-slate-950/90 shadow-xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#c59d6b] flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-[#c59d6b]" />
                  შეკვეთა #AMQ-4091 დადასტურდა
                </span>
                <span className="text-[#8b293e] font-semibold">Instagram DM</span>
              </div>
              <p className="text-xs text-slate-300">
                საქართველოს ნაკრები (L) · შეთავაზებული: 75₾ (+5₾ მიტანა თბილისში).
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Feature Pillars Strip */}
      <footer className="border-t border-slate-800/80 bg-slate-900/50 py-6 px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 text-xs text-slate-400">
          <div className="flex items-start gap-3">
            <MessageSquare className="w-5 h-5 text-[#c59d6b] shrink-0" />
            <div>
              <p className="font-semibold text-slate-200">Instagram & FB DM</p>
              <p className="mt-0.5">24/7 მყისიერი პასუხი ქართულად ნებისმიერ შეტყობინებაზე</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-[#c59d6b] shrink-0" />
            <div>
              <p className="font-semibold text-slate-200">ჭკვიანი მოლაპარაკება</p>
              <p className="mt-0.5">კონტრშეთავაზებები თქვენი მინიმალური ფასის მკაცრი დაცვით</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-[#8b293e] shrink-0" />
            <div>
              <p className="font-semibold text-slate-200">ადამიანის თანხმობა</p>
              <p className="mt-0.5">მაღალი ფასდაკლების მოთხოვნები მომენტალურად გადმოდის მენეჯერთან</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-[#c59d6b] shrink-0" />
            <div>
              <p className="font-semibold text-slate-200">ავტომატური შეკვეთა</p>
              <p className="mt-0.5">ტელეფონის და მისამართის შეგროვება კურიერისთვის პირდაპირ ჩათიდან</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
