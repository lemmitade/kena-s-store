// ============================================================================
// ADMIN PRODUCT MANAGEMENT: /admin/products
// Product list, publication toggle, variant SKUs, prices in ETB, create product
// ============================================================================

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getProducts, getSections } from '@/lib/db/repository';
import { formatETB } from '@/lib/utils/format';
import { Plus, Search, Eye, Edit, AlertTriangle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminProductsPage() {
  const products = await getProducts({ includeDrafts: true });
  const sections = await getSections();

  return (
    <div className="space-y-8 font-mono">
      {/* Header & Create Product Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-stone-500">
            Catalog Administration
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-medium text-stone-900 mt-1">
            Products &amp; Variants ({products.length})
          </h1>
        </div>

        <Link
          href="/admin/products/new"
          className="bg-[#121212] text-white px-5 py-3 text-xs uppercase tracking-wider font-semibold hover:bg-stone-800 transition-colors inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Product</span>
        </Link>
      </div>

      {/* Products Table Card */}
      <div className="bg-white border border-[#E7E5E4] p-6 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-200 text-stone-400 uppercase tracking-wider text-[11px]">
                <th className="pb-3 font-normal">Piece / Image</th>
                <th className="pb-3 font-normal">Section</th>
                <th className="pb-3 font-normal">Variants / SKUs</th>
                <th className="pb-3 font-normal">Stock Level</th>
                <th className="pb-3 font-normal">Price (ETB)</th>
                <th className="pb-3 font-normal">Status</th>
                <th className="pb-3 font-normal text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {products.map((p) => {
                const totalStock = p.variants?.reduce((s, v) => s + v.stock_quantity, 0) || 0;
                const isLow = totalStock <= p.low_stock_threshold;
                const img = p.images?.[0]?.image_url;

                return (
                  <tr key={p.id} className="hover:bg-stone-50/70">
                    <td className="py-3.5 pr-4 flex items-center gap-3">
                      <div className="relative w-12 h-14 bg-stone-100 flex-shrink-0 overflow-hidden">
                        {img && (
                          <Image
                            src={img}
                            alt={p.name}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div>
                        <span className="font-bold text-stone-900 block font-serif text-sm">
                          {p.name}
                        </span>
                        <span className="text-[10px] text-stone-400">/{p.slug}</span>
                      </div>
                    </td>

                    <td className="py-3.5 text-stone-600">
                      {p.section?.name || 'Unassigned'}
                    </td>

                    <td className="py-3.5 text-stone-500 text-[11px]">
                      {p.variants?.length || 0} variants
                    </td>

                    <td className="py-3.5">
                      <span
                        className={`font-semibold flex items-center gap-1.5 ${
                          totalStock === 0
                            ? 'text-rose-600'
                            : isLow
                            ? 'text-amber-700'
                            : 'text-stone-900'
                        }`}
                      >
                        {isLow && <AlertTriangle className="w-3.5 h-3.5" />}
                        <span>{totalStock} units</span>
                      </span>
                    </td>

                    <td className="py-3.5 font-bold text-stone-900">
                      {formatETB(p.sale_price_etb || p.regular_price_etb)}
                    </td>

                    <td className="py-3.5">
                      <span
                        className={`px-2 py-0.5 text-[10px] uppercase font-semibold ${
                          p.is_published
                            ? 'bg-emerald-50 text-emerald-800'
                            : 'bg-stone-100 text-stone-500'
                        }`}
                      >
                        {p.is_published ? 'Published' : 'Draft'}
                      </span>
                    </td>

                    <td className="py-3.5 text-right space-x-2">
                      <Link
                        href={`/product/${p.slug}`}
                        target="_blank"
                        className="text-stone-500 hover:text-black inline-block p-1"
                        title="View Live"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
