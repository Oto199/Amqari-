import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Order, OrderStatus } from '../../types';
import {
  ShoppingBag,
  Search,
  Filter,
  Truck,
  CheckCircle2,
  Clock,
  PackageCheck,
  Send,
  MapPin,
  Phone,
  FileText,
} from 'lucide-react';

export const OrdersView: React.FC = () => {
  const { orders, updateOrderStatus } = useApp();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const statuses: { id: OrderStatus | 'all'; label: string }[] = [
    { id: 'all', label: 'ყველა შეკვეთა' },
    { id: 'pending', label: 'მოლოდინში' },
    { id: 'confirmed', label: 'დადასტურებული' },
    { id: 'packed', label: 'შეფუთული' },
    { id: 'shipped', label: 'გაგზავნილი' },
    { id: 'delivered', label: 'ჩაბარებული' },
  ];

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    const matchesSearch =
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.instagramHandle.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.phone.includes(search);
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300">
            <Clock className="w-3 h-3 text-slate-500" />
            მოლოდინში
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
            <CheckCircle2 className="w-3 h-3 text-blue-500" />
            დადასტურებული
          </span>
        );
      case 'packed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
            <PackageCheck className="w-3 h-3 text-purple-500" />
            შეფუთული
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
            <Truck className="w-3 h-3 text-amber-500" />
            გაგზავნილი (საკურიერო)
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            ჩაბარებული
          </span>
        );
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
              <ShoppingBag className="w-6 h-6 text-emerald-500" />
              <span>შეკვეთების მართვა (Order Pipeline)</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Demo Data
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Instagram და Facebook DM-ებიდან AI-ის მიერ ავტომატურად შეგროვებული და დადასტურებული შეკვეთები
          </p>
        </div>

        <button
          onClick={() => alert('საკურიერო რეესტრი (Excel/CSV) გენერირებულია და გადაცემულია საკურიერო სერვისს!')}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors shadow-xs self-start sm:self-auto"
        >
          <FileText className="w-4 h-4 text-emerald-500" />
          <span>საკურიერო რეესტრის ექსპორტი</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ძებნა ID-ით, კლიენტით ან ტელეფონით..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-emerald-500"
          />
        </div>

        {/* Status Filter Segment */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {statuses.map((st) => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                statusFilter === st.id
                  ? 'bg-slate-900 text-white dark:bg-emerald-600 dark:text-white font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-5 py-3.5">შეკვეთის ID</th>
                <th className="px-5 py-3.5">მყიდველი & კონტაქტი</th>
                <th className="px-5 py-3.5">პროდუქტები</th>
                <th className="px-5 py-3.5">მისამართი & ქალაქი</th>
                <th className="px-5 py-3.5 text-right">ჯამური თანხა</th>
                <th className="px-5 py-3.5">სტატუსი</th>
                <th className="px-5 py-3.5 text-right">მართვა</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredOrders.map((ord) => (
                <tr
                  key={ord.id}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors"
                >
                  {/* Order ID */}
                  <td className="px-5 py-4 font-mono font-bold text-slate-900 dark:text-white">
                    #{ord.id}
                    <span className="block text-[10px] font-normal text-slate-400">
                      {ord.createdAt}
                    </span>
                  </td>

                  {/* Customer & Phone */}
                  <td className="px-5 py-4">
                    <span className="font-semibold text-slate-900 dark:text-white block">
                      {ord.customerName}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {ord.instagramHandle}
                    </span>
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      <Phone className="w-3 h-3" />
                      <span>{ord.phone}</span>
                    </div>
                  </td>

                  {/* Items */}
                  <td className="px-5 py-4">
                    {ord.items.map((it, idx) => (
                      <div key={idx} className="space-y-0.5">
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {it.title}
                        </span>
                        <div className="text-[11px] text-slate-500">
                          ზომა: <strong>{it.size}</strong> · რაოდენობა: {it.quantity} ცალი
                        </div>
                      </div>
                    ))}
                  </td>

                  {/* Address */}
                  <td className="px-5 py-4 max-w-xs">
                    <div className="flex items-start gap-1.5 text-slate-700 dark:text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {ord.city}
                        </span>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {ord.address}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Total */}
                  <td className="px-5 py-4 text-right">
                    <span className="font-bold text-slate-900 dark:text-white text-sm tabular-nums">
                      {ord.total} ₾
                    </span>
                    <span className="block text-[10px] text-slate-400">
                      {ord.paymentMethod === 'courier_cod' ? 'ადგილზე (COD)' : ord.paymentMethod === 'bog_transfer' ? 'BOG ბანკი' : 'TBC Pay'}
                    </span>
                  </td>

                  {/* Status Badge */}
                  <td className="px-5 py-4">
                    {getStatusBadge(ord.status)}
                  </td>

                  {/* Status Change Dropdown */}
                  <td className="px-5 py-4 text-right">
                    <select
                      value={ord.status}
                      onChange={(e) => updateOrderStatus(ord.id, e.target.value as OrderStatus)}
                      className="px-2 py-1 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-200 font-medium focus:outline-hidden"
                    >
                      <option value="pending">მოლოდინში</option>
                      <option value="confirmed">დადასტურებული</option>
                      <option value="packed">შეფუთული</option>
                      <option value="shipped">გაგზავნილი</option>
                      <option value="delivered">ჩაბარებული</option>
                    </select>
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
