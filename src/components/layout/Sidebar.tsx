import React from 'react';
import { useApp } from '../../context/AppContext';
import { PageId } from '../../types';
import {
  LayoutDashboard,
  MessageSquare,
  Cpu,
  CheckCircle2,
  Package,
  ShoppingBag,
  BarChart3,
  Settings,
  ShieldCheck,
  Sun,
  Moon,
  LogOut,
  Sparkles,
} from 'lucide-react';
import amqariLogo from '../../assets/images/amqari logo.png';

interface NavItem {
  id: PageId;
  label: string;
  sublabel: string;
  icon: React.ElementType;
  badge?: number;
}

export const Sidebar: React.FC = () => {
  const {
    page,
    setPage,
    isDarkMode,
    toggleDarkMode,
    logout,
    approvals,
    conversations,
    settings,
    isMetaConnected,
  } = useApp();

  const pendingApprovalsCount = approvals.filter((a) => a.status === 'pending').length;
  const unreadMessagesCount = conversations.reduce((acc, c) => acc + c.unreadCount, 0);

  const navItems: NavItem[] = [
    {
      id: 'demoday',
      label: 'Demo Day Journey',
      sublabel: 'Live Simulation',
      icon: Sparkles,
    },
    {
      id: 'dashboard',
      label: 'დეშბორდი',
      sublabel: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'inbox',
      label: 'ინბოქსი',
      sublabel: 'Instagram DMs',
      icon: MessageSquare,
      badge: unreadMessagesCount > 0 ? unreadMessagesCount : undefined,
    },
    {
      id: 'activity',
      label: 'AI ლოგიკა',
      sublabel: 'Agent Reasoning',
      icon: Cpu,
    },
    {
      id: 'approvals',
      label: 'თანხმობის ცენტრი',
      sublabel: 'Approvals',
      icon: CheckCircle2,
      badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined,
    },
    {
      id: 'products',
      label: 'პროდუქტები',
      sublabel: 'Inventory',
      icon: Package,
    },
    {
      id: 'orders',
      label: 'შეკვეთები',
      sublabel: 'Orders',
      icon: ShoppingBag,
    },
    {
      id: 'analytics',
      label: 'ანალიტიკა',
      sublabel: 'Analytics',
      icon: BarChart3,
    },
    {
      id: 'evaluation',
      label: 'შეფასება',
      sublabel: 'Benchmarks',
      icon: ShieldCheck,
    },
    {
      id: 'settings',
      label: 'პარამეტრები',
      sublabel: 'Rules & Meta',
      icon: Settings,
    },
  ];

  return (
    <aside className="w-64 shrink-0 flex flex-col border-r border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors select-none">
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60">
        <button
          onClick={() => setPage('dashboard')}
          className="flex items-center gap-2.5 text-left group"
        >
          <div className="w-9 h-9 rounded-lg p-1 border border-[#c59d6b]/30 bg-white dark:bg-slate-900 flex items-center justify-center shrink-0 shadow-xs transition-transform group-hover:scale-105">
            <img
              src={amqariLogo}
              alt="ამქარი ლოგო"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white leading-none flex items-center gap-1.5">
              <span>ამქარი</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#c59d6b]" />
            </span>
            <span className="text-[11px] text-[#c59d6b] dark:text-[#c59d6b]/90 mt-1 leading-none font-mono font-medium">
              amqari.ge
            </span>
          </div>
        </button>

        <button
          onClick={toggleDarkMode}
          title={isDarkMode ? 'ღია რეჟიმი' : 'მუქი რეჟიმი'}
          className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
          aria-label="Toggle theme"
        >
          {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      {/* Meta Connection Badge */}
      <div className="px-4 py-3 mx-3 my-2.5 rounded-lg border border-[#c59d6b]/20 dark:border-[#c59d6b]/20 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <div className="truncate">
            <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isMetaConnected ? 'bg-[#c59d6b]' : 'bg-[#8b293e]'}`} />
              <span>{isMetaConnected ? 'Meta დაკავშირებულია' : 'Meta ხაზგარეშე'}</span>
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {isMetaConnected ? 'Polling (3s) · Live' : 'API Connection Lost'}
            </p>
          </div>
        </div>
        <Sparkles className={`w-3.5 h-3.5 shrink-0 ${isMetaConnected ? 'text-[#c59d6b]' : 'text-[#8b293e]'}`} />
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = page === item.id;
          const isApprovals = item.id === 'approvals';

          return (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-all text-left ${
                isActive
                  ? 'bg-slate-900 text-white dark:bg-[#c59d6b]/20 dark:text-[#c59d6b] font-semibold border-l-3 border-[#c59d6b]'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive
                      ? 'text-[#c59d6b] dark:text-[#c59d6b]'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge !== undefined && (
                <span
                  className={`px-1.5 py-0.5 text-[10px] font-bold rounded-md tabular-nums ${
                    isActive
                      ? 'bg-white/20 text-white dark:bg-[#c59d6b]/40 dark:text-white'
                      : isApprovals
                      ? 'bg-[#8b293e]/15 text-[#8b293e] dark:bg-[#8b293e]/30 dark:text-[#f7c2cb]'
                      : 'bg-[#c59d6b]/15 text-[#9e7949] dark:bg-[#c59d6b]/30 dark:text-[#c59d6b]'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Session Footer */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800/60">
        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-900/40">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs font-semibold text-slate-700 dark:text-slate-300 shrink-0">
              OK
            </div>
            <div className="truncate">
              <p className="text-xs font-medium text-slate-900 dark:text-slate-100 truncate">
                Sportswear GE
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                Admin
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            title="გასვლა"
            className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
