import React from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, AlertCircle } from 'lucide-react';
import amqariLogo from '../../assets/images/amqari logo.png';

export const Header: React.FC = () => {
  const { page, setPage, approvals, settings, isMetaConnected } = useApp();

  const getPageTitle = () => {
    switch (page) {
      case 'demoday':
        return 'Demo Day Live Journey · მომხმარებლის გზა';
      case 'dashboard':
        return 'მართვის პანელი';
      case 'inbox':
        return 'ინსტაგრამ შეტყობინებები';
      case 'activity':
        return 'AI აგენტის აზროვნების ნაკადი';
      case 'approvals':
        return 'ადამიანის თანხმობის ცენტრი';
      case 'products':
        return 'ინვენტარის მართვა';
      case 'orders':
        return 'შეკვეთების რეესტრი';
      case 'analytics':
        return 'გაყიდვების ანალიტიკა';
      case 'evaluation':
        return 'აგენტის ბენჩმარკი და ტესტები';
      case 'settings':
        return 'ბიზნეს წესები და ინტეგრაცია';
      default:
        return 'ამქარი';
    }
  };

  const pendingCount = approvals.filter((a) => a.status === 'pending').length;

  return (
    <header className="h-16 px-6 border-b border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950 flex items-center justify-between gap-4 transition-colors">
      {/* Breadcrumb Trail */}
      <div className="flex items-center gap-2.5 text-sm text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
          <img src={amqariLogo} alt="ამქარი" className="w-5 h-5 object-contain" />
          <span>ამქარი</span>
        </div>
        <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">/</span>
        <span className="text-slate-800 dark:text-slate-200 font-medium">{getPageTitle()}</span>
      </div>

      {/* Center/Right Zone: Status and Primary Action */}
      <div className="flex items-center gap-3">
        {/* Meta API Connection Status Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-xs font-semibold">
          <span className={`w-2 h-2 rounded-full ${isMetaConnected ? 'bg-[#c59d6b]' : 'bg-[#8b293e]'}`} />
          {isMetaConnected ? (
            <span className="text-slate-800 dark:text-slate-200">Meta დაკავშირებულია</span>
          ) : (
            <span className="text-[#8b293e] dark:text-[#f7c2cb]">Meta ხაზგარეშე</span>
          )}
        </div>

        {/* Pending Approval Alert button using secondary color #8b293e */}
        {pendingCount > 0 && (
          <button
            onClick={() => setPage('approvals')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#8b293e]/40 bg-[#8b293e]/10 text-[#8b293e] dark:text-[#f7c2cb] text-xs font-semibold hover:bg-[#8b293e]/20 transition-colors"
          >
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{pendingCount} დასტური მოითხოვება</span>
          </button>
        )}

        {/* Primary Action Button using main color #c59d6b */}
        <button
          onClick={() => setPage('activity')}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-slate-950 bg-[#c59d6b] hover:bg-[#b38a56] rounded-lg shadow-xs transition-colors whitespace-nowrap"
        >
          <Sparkles className="w-3.5 h-3.5 text-slate-900" />
          <span>AI ლოგიკის შემოწმება</span>
        </button>
      </div>
    </header>
  );
};
