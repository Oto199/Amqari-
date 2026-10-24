import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import {
  Package,
  Plus,
  Search,
  AlertCircle,
  CheckCircle2,
  TrendingDown,
  Edit2,
  X,
} from 'lucide-react';

export const ProductsView: React.FC = () => {
  const { products, updateProductStock, updateProductPrice, addProduct } = useApp();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // New product form state
  const [newTitle, setNewTitle] = useState('');
  const [newSku, setNewSku] = useState('');
  const [newCategory, setNewCategory] = useState('საფეხბურთო ფორმები');
  const [newPrice, setNewPrice] = useState(90);
  const [newMinPrice, setNewMinPrice] = useState(70);
  const [newStockM, setNewStockM] = useState(5);
  const [newStockL, setNewStockL] = useState(5);

  const filteredProducts = products.filter((p) => {
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const sizes = [
      { size: 'M' as const, stock: Number(newStockM) },
      { size: 'L' as const, stock: Number(newStockL) },
    ];
    const total = sizes.reduce((acc, s) => acc + s.stock, 0);

    addProduct({
      title: newTitle.trim(),
      sku: newSku.trim() || `GEO-${Date.now().toString().slice(-4)}`,
      category: newCategory,
      sizes,
      price: Number(newPrice),
      minPrice: Number(newMinPrice),
      image: '/src/assets/images/jersey_georgia_kvara_1792697601356.jpg',
      totalStock: total,
      status: total === 0 ? 'out_of_stock' : total <= 5 ? 'low_stock' : 'active',
    });

    setShowAddModal(false);
    setNewTitle('');
    setNewSku('');
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Package className="w-6 h-6 text-[#c59d6b]" />
            <span>ინვენტარის მართვა (Products & Stock)</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            საფეხბურთო ფორმების კატალოგი, ზომები, საწყისი ფასები და AI-ის მინიმალური ზღვრები (Floor Price)
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#c59d6b] hover:bg-[#b38a56] text-slate-950 font-bold text-xs transition-colors shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-slate-950" />
          <span>ახალი პროდუქტის დამატება</span>
        </button>
      </div>

      {/* Search & Categories Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ძებნა მოდელის ან SKU-ს მიხედვით..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-[#c59d6b]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['all', 'საფეხბურთო ფორმები', 'რეტრო კოლექცია', 'სარაგბო ატრიბუტიკა'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                categoryFilter === cat
                  ? 'bg-slate-900 text-white dark:bg-[#c59d6b] dark:text-slate-950 font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {cat === 'all' ? 'ყველა კატეგორია' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table (High-Density Linear Style) */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-5 py-3.5">პროდუქტი</th>
                <th className="px-5 py-3.5">ზომები & მარაგი</th>
                <th className="px-5 py-3.5 text-right">კატალოგის ფასი</th>
                <th className="px-5 py-3.5 text-right">მინ. ფასი (AI Floor)</th>
                <th className="px-5 py-3.5 text-center">სტატუსი</th>
                <th className="px-5 py-3.5 text-right">სწრაფი რედაქტირება</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredProducts.map((p) => (
                <tr
                  key={p.id}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors"
                >
                  {/* Product Info */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.image}
                        alt={p.title}
                        className="w-12 h-12 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <span className="font-semibold text-slate-900 dark:text-white block max-w-sm">
                          {p.title}
                        </span>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono mt-0.5">
                          <span>{p.sku}</span>
                          <span>·</span>
                          <span className="text-slate-500">{p.category}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Sizes & Stock with inline +/- */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      {p.sizes.map((s) => (
                        <div
                          key={s.size}
                          className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-mono border border-slate-200/60 dark:border-slate-700/60"
                        >
                          <span className="font-bold text-slate-700 dark:text-slate-300">
                            {s.size}:
                          </span>
                          <span className={`tabular-nums ${s.stock === 0 ? 'text-red-500 font-bold' : 'text-slate-900 dark:text-white'}`}>
                            {s.stock}
                          </span>
                          <div className="flex items-center gap-0.5 ml-1 border-l border-slate-300 dark:border-slate-600 pl-1">
                            <button
                              onClick={() => updateProductStock(p.id, s.size, -1)}
                              disabled={s.stock === 0}
                              className="text-slate-400 hover:text-red-500 px-0.5 disabled:opacity-30"
                              title="1-ით შემცირება"
                            >
                              -
                            </button>
                            <button
                              onClick={() => updateProductStock(p.id, s.size, 1)}
                              className="text-slate-400 hover:text-[#c59d6b] px-0.5"
                              title="1-ით მომატება"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      ჯამური მარაგი: <strong className="tabular-nums text-slate-700 dark:text-slate-300">{p.totalStock} ცალი</strong>
                    </span>
                  </td>

                  {/* Catalog Price */}
                  <td className="px-5 py-4 text-right">
                    <span className="font-bold text-slate-900 dark:text-white tabular-nums text-sm">
                      {p.price} ₾
                    </span>
                  </td>

                  {/* Minimum Floor Price */}
                  <td className="px-5 py-4 text-right">
                    <div className="inline-flex items-center gap-1 text-[#8b293e] dark:text-[#f7c2cb] font-bold tabular-nums text-sm">
                      <TrendingDown className="w-3.5 h-3.5" />
                      <span>{p.minPrice} ₾</span>
                    </div>
                    <span className="block text-[10px] text-slate-400">
                      მაქს. ფასდაკლება {Math.round(((p.price - p.minPrice) / p.price) * 100)}%
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-5 py-4 text-center">
                    {p.status === 'active' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#c59d6b]/15 text-[#c59d6b] dark:bg-[#c59d6b]/25 dark:text-[#c59d6b]">
                        <CheckCircle2 className="w-3 h-3 text-[#c59d6b]" />
                        მარაგშია
                      </span>
                    )}
                    {p.status === 'low_stock' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#8b293e]/15 text-[#8b293e] dark:bg-[#8b293e]/30 dark:text-[#f7c2cb]">
                        <AlertCircle className="w-3 h-3" />
                        მცირე მარაგი
                      </span>
                    )}
                    {p.status === 'out_of_stock' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-red-100 text-red-800 dark:bg-red-950/80 dark:text-red-300">
                        ამოწურულია
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => {
                        const newP = prompt('შეიყვანეთ ახალი საცალო ფასი (GEL):', p.price.toString());
                        const newMin = prompt('შეიყვანეთ AI მინიმალური ფასი (GEL):', p.minPrice.toString());
                        if (newP && newMin) {
                          updateProductPrice(p.id, Number(newP), Number(newMin));
                        }
                      }}
                      className="px-2.5 py-1 text-xs rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors inline-flex items-center gap-1"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>ფასის შეცვლა</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-500" />
                <span>ახალი პროდუქტის დამატება კატალოგში</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  პროდუქტის დასახელება:
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="მაგ: მანჩესტერ სიტი 2024/25 Home (ჰოლანდი #9)"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    SKU კოდი:
                  </label>
                  <input
                    type="text"
                    value={newSku}
                    onChange={(e) => setNewSku(e.target.value)}
                    placeholder="MCI-25-HLD-09"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    კატეგორია:
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
                  >
                    <option value="საფეხბურთო ფორმები">საფეხბურთო ფორმები</option>
                    <option value="რეტრო კოლექცია">რეტრო კოლექცია</option>
                    <option value="სარაგბო ატრიბუტიკა">სარაგბო ატრიბუტიკა</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    საცალო ფასი (₾):
                  </label>
                  <input
                    type="number"
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    AI მინიმალური ფასი (Floor ₾):
                  </label>
                  <input
                    type="number"
                    value={newMinPrice}
                    onChange={(e) => setNewMinPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-[#c59d6b] font-bold focus:border-[#c59d6b] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    M ზომის მარაგი:
                  </label>
                  <input
                    type="number"
                    value={newStockM}
                    onChange={(e) => setNewStockM(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    L ზომის მარაგი:
                  </label>
                  <input
                    type="number"
                    value={newStockL}
                    onChange={(e) => setNewStockL(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900"
                >
                  გაუქმება
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold rounded-lg bg-[#c59d6b] hover:bg-[#b58c5a] text-slate-950 shadow-sm"
                >
                  პროდუქტის შენახვა
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
