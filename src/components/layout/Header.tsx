import React from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, Bot, AlertCircle } from 'lucide-react';

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
      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        <span className="font-semibold text-slate-900 dark:text-white">ამქარი</span>
        <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">/</span>
        <span className="text-slate-800 dark:text-slate-200 font-medium">{getPageTitle()}</span>
      </div>

      {/* Center/Right Zone: Status and Primary Action */}
      <div className="flex items-center gap-3">
        {/* Meta API Connection Status Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-xs font-semibold">
          {isMetaConnected ? (
            <span className="text-emerald-600 dark:text-emerald-400">🟢 Meta Connected</span>
          ) : (
            <span className="text-red-600 dark:text-red-400">🔴 Meta Offline</span>
          )}
        </div>

        {/* Pending Approval Alert button */}
        {pendingCount > 0 && (
          <button
            onClick={() => setPage('approvals')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-300/60 dark:border-amber-700/60 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 text-xs font-semibold hover:bg-amber-100 transition-colors"
          >
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{pendingCount} დასტური მოითხოვება</span>
          </button>
        )}

        {/* Primary Action Button */}
        <button
          onClick={() => setPage('activity')}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-lg shadow-sm transition-colors whitespace-nowrap"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI ლოგიკის შემოწმება</span>
        </button>
      </div>
    </header>
  );
};
