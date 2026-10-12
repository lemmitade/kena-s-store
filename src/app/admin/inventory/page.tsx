// ============================================================================
// ADMIN INVENTORY MATRIX: /admin/inventory
// Real-time SKU stock levels, low-stock threshold triggers, inventory movement
// ============================================================================

import React from 'react';
import Link from 'next/link';
import { getProducts } from '@/lib/db/repository';
import { formatETB } from '@/lib/utils/format';
import { AlertTriangle, CheckCircle2, ArrowUpDown } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface InventoryPageProps {
  searchParams: Promise<{
    filter?: string;
  }>;
}

export default async function AdminInventoryPage({ searchParams }: InventoryPageProps) {
  const { filter } = await searchParams;
  const products = await getProducts({ includeDrafts: true });

  // Flatten all variants across products
  const allVariants = products.flatMap((p) =>
    (p.variants || []).map((v) => ({
      product: p,
      variant: v,
      isLow: v.stock_quantity <= p.low_stock_threshold,
    }))
  );

  const displayed =
    filter === 'low'
      ? allVariants.filter((item) => item.isLow)
      : allVariants;

  return (
    <div className="space-y-8 font-mono">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-stone-500">
            Stock Management
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-medium text-stone-900 mt-1">
            Inventory Matrix ({allVariants.length} Active SKUs)
          </h1>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 text-xs">
          <Link
            href="/admin/inventory"
            className={`px-3 py-2 border transition-colors ${
              !filter ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-600 border-stone-300'
            }`}
          >
            All SKUs ({allVariants.length})
          </Link>
          <Link
            href="/admin/inventory?filter=low"
            className={`px-3 py-2 border transition-colors flex items-center gap-1.5 ${
              filter === 'low'
                ? 'bg-amber-600 text-white border-amber-600'
                : 'bg-white text-stone-600 border-stone-300 hover:border-amber-600'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Low Stock ({allVariants.filter((i) => i.isLow).length})</span>
          </Link>
        </div>
      </div>

      <div className="bg-white border border-[#E7E5E4] p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-200 text-stone-400 uppercase tracking-wider text-[11px]">
                <th className="pb-3 font-normal">SKU</th>
                <th className="pb-3 font-normal">Product Name</th>
                <th className="pb-3 font-normal">Size / Fit</th>
                <th className="pb-3 font-normal">Color</th>
                <th className="pb-3 font-normal">Current Quantity</th>
                <th className="pb-3 font-normal">Alert Threshold</th>
                <th className="pb-3 font-normal text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {displayed.map(({ product, variant, isLow }) => (
                <tr key={variant.id} className="hover:bg-stone-50/70">
                  <td className="py-3 font-bold text-stone-900">{variant.sku}</td>
                  <td className="py-3 text-stone-900 font-sans">{product.name}</td>
                  <td className="py-3 text-stone-600">{variant.size || 'STD'}</td>
                  <td className="py-3 text-stone-600">{variant.color || 'STD'}</td>
                  <td className="py-3">
                    <span
                      className={`font-bold ${
                        variant.stock_quantity === 0
                          ? 'text-rose-600'
                          : isLow
                          ? 'text-amber-700'
                          : 'text-stone-900'
                      }`}
                    >
                      {variant.stock_quantity} units
                    </span>
                  </td>
                  <td className="py-3 text-stone-400">{product.low_stock_threshold} units</td>
                  <td className="py-3 text-right">
                    {variant.stock_quantity === 0 ? (
                      <span className="px-2 py-0.5 bg-rose-50 text-rose-700 uppercase font-bold text-[10px]">
                        Sold Out
                      </span>
                    ) : isLow ? (
                      <span className="px-2 py-0.5 bg-amber-50 text-amber-700 uppercase font-bold text-[10px] inline-flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Low Stock</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 uppercase font-medium text-[10px]">
                        Adequate
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
}
