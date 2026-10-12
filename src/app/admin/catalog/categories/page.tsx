// ============================================================================
// ADMIN CATALOG CATEGORIES: /admin/catalog/categories
// ============================================================================

import React from 'react';
import { getCategories, getSections } from '@/lib/db/repository';

export const dynamic = 'force-dynamic';

export default async function AdminCategoriesPage() {
  const categories = await getCategories(undefined, true);
  const sections = await getSections();

  return (
    <div className="space-y-6 font-mono text-xs">
      <div>
        <span className="text-xs uppercase tracking-widest text-stone-500">
          Nested Taxonomies
        </span>
        <h1 className="text-2xl sm:text-3xl font-serif font-medium text-stone-900 mt-1">
          Store Categories ({categories.length})
        </h1>
      </div>

      <div className="bg-white border border-[#E7E5E4] p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-stone-200 text-stone-400 uppercase tracking-wider text-[11px]">
                <th className="pb-3 font-normal">Order</th>
                <th className="pb-3 font-normal">Category Name</th>
                <th className="pb-3 font-normal">Assigned Section</th>
                <th className="pb-3 font-normal">Slug</th>
                <th className="pb-3 font-normal">Description</th>
                <th className="pb-3 font-normal text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {categories.map((c) => {
                const section = sections.find((s) => s.id === c.section_id);
                return (
                  <tr key={c.id} className="hover:bg-stone-50/70">
                    <td className="py-3 font-bold text-stone-500">{c.display_order}</td>
                    <td className="py-3 font-bold text-stone-900 font-sans text-sm">{c.name}</td>
                    <td className="py-3 font-semibold text-stone-700">{section?.name || '—'}</td>
                    <td className="py-3 text-stone-400">/{c.slug}</td>
                    <td className="py-3 text-stone-600 font-sans max-w-xs truncate">{c.description || '—'}</td>
                    <td className="py-3 text-right">
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] uppercase font-bold">
                        Active
                      </span>
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
