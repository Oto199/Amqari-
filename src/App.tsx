import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { LoginPage } from './components/views/LoginPage';
import { DemoDayView } from './components/views/DemoDayView';
import { DashboardView } from './components/views/DashboardView';
import { InboxView } from './components/views/InboxView';
import { AgentActivityView } from './components/views/AgentActivityView';
import { ApprovalsView } from './components/views/ApprovalsView';
import { ProductsView } from './components/views/ProductsView';
import { OrdersView } from './components/views/OrdersView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { SettingsView } from './components/views/SettingsView';
import { EvaluationView } from './components/views/EvaluationView';
import { Menu, X } from 'lucide-react';
import amqariLogo from './assets/images/amqari logo.png';

const AppLayout: React.FC = () => {
  const { page, isAuthenticated } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // If on login page or not authenticated, render LoginPage
  if (!isAuthenticated || page === 'login') {
    return <LoginPage />;
  }

  const renderActiveView = () => {
    switch (page) {
      case 'demoday':
        return <DemoDayView />;
      case 'dashboard':
        return <DashboardView />;
      case 'inbox':
        return <InboxView />;
      case 'activity':
        return <AgentActivityView />;
      case 'approvals':
        return <ApprovalsView />;
      case 'products':
        return <ProductsView />;
      case 'orders':
        return <OrdersView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'settings':
        return <SettingsView />;
      case 'evaluation':
        return <EvaluationView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col md:flex-row bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased font-sans">
      {/* Mobile Header Bar */}
      <div className="md:hidden h-14 px-4 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md p-0.5 border border-[#c59d6b]/30 bg-white dark:bg-slate-900 flex items-center justify-center shrink-0">
            <img src={amqariLogo} alt="ამქარი" className="w-full h-full object-contain" />
          </div>
          <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white">
            ამქარი
          </span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-md text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex h-full">
        <Sidebar />
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/50 flex">
          <div className="w-64 h-full bg-white dark:bg-slate-950 shadow-xl">
            <Sidebar />
          </div>
          <div
            className="flex-1"
            onClick={() => setMobileMenuOpen(false)}
          />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppLayout />
    </AppProvider>
  );
}
