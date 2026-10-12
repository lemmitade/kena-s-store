'use client';

// ============================================================================
// DYNAMIC SECTIONS MANAGER COMPONENT
// Create new sections, toggle nav visibility, live updates without code deploy
// ============================================================================

import React, { useState } from 'react';
import { StoreSection } from '@/types';
import { createSectionAction, toggleSectionVisibilityAction } from '@/app/actions/catalog';
import { Plus, Eye, EyeOff, Check, AlertCircle } from 'lucide-react';

interface SectionManagerProps {
  sections: StoreSection[];
}

export function SectionManager({ sections }: SectionManagerProps) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [displayOrder, setDisplayOrder] = useState(sections.length + 1);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(
      val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
    );
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) return;
    setLoading(true);

    const res = await createSectionAction({
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim() || undefined,
      thumbnail_image_url: thumbnailUrl.trim() || undefined,
      display_order: displayOrder,
    });

    setLoading(false);
    if (res.success) {
      setName('');
      setSlug('');
      setDescription('');
      setThumbnailUrl('');
      setMsg('Section created! It is immediately live across storefront navigation.');
    }
  };

  const handleToggle = async (id: string, current: boolean) => {
    await toggleSectionVisibilityAction(id, !current);
  };

  return (
    <div className="space-y-8 font-mono text-xs">
      {msg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{msg}</span>
        </div>
      )}

      {/* Add New Section Card */}
      <div className="bg-white border border-[#E7E5E4] p-6 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-900 border-b border-stone-200 pb-2">
          Add Dynamic Store Section
        </h2>

        <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="uppercase text-stone-500 block">Section Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Leather Accessories"
              className="w-full border border-stone-300 p-2.5 bg-[#FAF9F6] font-sans"
            />
          </div>

          <div className="space-y-1">
            <label className="uppercase text-stone-500 block">Slug *</label>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full border border-stone-300 p-2.5 bg-[#FAF9F6]"
            />
          </div>

          <div className="space-y-1">
            <label className="uppercase text-stone-500 block">Display Order</label>
            <input
              type="number"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(parseInt(e.target.value, 10) || 1)}
              className="w-full border border-stone-300 p-2.5 bg-[#FAF9F6]"
            />
          </div>

          <div className="sm:col-span-2 space-y-1">
            <label className="uppercase text-stone-500 block">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Understated luxury calfskin accessories..."
              className="w-full border border-stone-300 p-2.5 bg-[#FAF9F6] font-sans"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#121212] text-white p-2.5 uppercase tracking-wider font-semibold hover:bg-stone-800 disabled:opacity-50"
            >
              {loading ? 'Creating...' : '+ Add Section'}
            </button>
          </div>
        </form>
      </div>

      {/* Sections List */}
      <div className="bg-white border border-[#E7E5E4] p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-900 border-b border-stone-200 pb-3 mb-4">
          Current Sections ({sections.length})
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-stone-200 text-stone-400 uppercase tracking-wider text-[11px]">
                <th className="pb-3 font-normal">Order</th>
                <th className="pb-3 font-normal">Name</th>
                <th className="pb-3 font-normal">Slug</th>
                <th className="pb-3 font-normal">Description</th>
                <th className="pb-3 font-normal">Nav Visibility</th>
                <th className="pb-3 font-normal text-right">Toggle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {sections.map((s) => (
                <tr key={s.id} className="hover:bg-stone-50/70">
                  <td className="py-3 font-bold text-stone-500">{s.display_order}</td>
                  <td className="py-3 font-bold text-stone-900 font-sans">{s.name}</td>
                  <td className="py-3 text-stone-500">/{s.slug}</td>
                  <td className="py-3 text-stone-600 font-sans max-w-xs truncate">{s.description || '—'}</td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-0.5 text-[10px] uppercase font-semibold ${
                        s.is_nav_visible ? 'bg-emerald-50 text-emerald-800' : 'bg-stone-100 text-stone-500'
                      }`}
                    >
                      {s.is_nav_visible ? 'Visible in Nav' : 'Hidden'}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleToggle(s.id, s.is_nav_visible)}
                      className="text-stone-500 hover:text-black p-1"
                      title={s.is_nav_visible ? 'Hide from Nav' : 'Show in Nav'}
                    >
                      {s.is_nav_visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
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
