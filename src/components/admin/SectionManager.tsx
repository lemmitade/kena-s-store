'use client';

// ============================================================================
// DYNAMIC SECTIONS MANAGER COMPONENT
// Create new sections, interactive toggles, Save Changes button & live updates
// ============================================================================

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { StoreSection } from '@/types';
import { createSectionAction, saveSectionsAction } from '@/app/actions/catalog';
import { Plus, Check, AlertCircle, Save, Sparkles } from 'lucide-react';

interface SectionManagerProps {
  sections: StoreSection[];
}

export function SectionManager({ sections }: SectionManagerProps) {
  const router = useRouter();
  const [sectionList, setSectionList] = useState<StoreSection[]>(sections);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // New section form state
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [displayOrder, setDisplayOrder] = useState(sections.length + 1);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Keep sectionList in sync when server props refresh
  useEffect(() => {
    setSectionList(sections);
  }, [sections]);

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
    setMsg('');
    setErrorMsg('');

    const res = await createSectionAction({
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim() || undefined,
      thumbnail_image_url: thumbnailUrl.trim() || undefined,
      display_order: displayOrder,
    });

    setLoading(false);
    if (res.success && res.section) {
      setName('');
      setSlug('');
      setDescription('');
      setThumbnailUrl('');
      setSectionList((prev) => [...prev, res.section!]);
      setMsg('Section created! It is immediately live across storefront navigation.');
      router.refresh();
    } else {
      setErrorMsg(res.error || 'Failed to create section.');
    }
  };

  // Toggle Navigation Visibility
  const handleToggleNav = (id: string) => {
    setSectionList((prev) =>
      prev.map((s) => (s.id === id ? { ...s, is_nav_visible: !s.is_nav_visible } : s))
    );
    setHasUnsavedChanges(true);
    setMsg('');
  };

  // Toggle Active Status
  const handleToggleActive = (id: string) => {
    setSectionList((prev) =>
      prev.map((s) => (s.id === id ? { ...s, is_active: !s.is_active } : s))
    );
    setHasUnsavedChanges(true);
    setMsg('');
  };

  // Save all section changes
  const handleSaveChanges = async () => {
    setIsSaving(true);
    setMsg('');
    setErrorMsg('');

    try {
      const res = await saveSectionsAction(sectionList);
      setIsSaving(false);

      if (res.success) {
        setHasUnsavedChanges(false);
        setMsg('Store section changes saved successfully! Updates are live across storefront navigation.');
        router.refresh();
      } else {
        setErrorMsg(res.error || 'Failed to save section changes.');
      }
    } catch (err) {
      setIsSaving(false);
      setErrorMsg(`Error saving sections: ${(err as Error).message}`);
    }
  };

  return (
    <div className="space-y-8 font-mono text-xs">
      {msg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2">
          <Check className="w-4 h-4 flex-shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Floating or Top Unsaved Changes Warning Banner */}
      {hasUnsavedChanges && (
        <div className="p-4 bg-amber-50 border-2 border-amber-400 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2 font-sans font-medium text-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            <span>You have unsaved changes to your store sections.</span>
          </div>
          <button
            type="button"
            onClick={handleSaveChanges}
            disabled={isSaving}
            className="inline-flex items-center justify-center gap-2 bg-[#121212] text-white px-5 py-2.5 uppercase tracking-wider text-xs font-semibold hover:bg-stone-800 disabled:opacity-50 transition-colors shadow"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Changes Now'}</span>
          </button>
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

      {/* Sections List Card */}
      <div className="bg-white border border-[#E7E5E4] p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-3">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-900">
              Current Sections ({sectionList.length})
            </h2>
            <p className="text-[11px] text-stone-500 mt-0.5">
              Toggle navigation visibility or active status, then click &ldquo;Save Changes&rdquo; to apply.
            </p>
          </div>

          {/* Top Save Changes Action Button */}
          <button
            type="button"
            onClick={handleSaveChanges}
            disabled={isSaving || !hasUnsavedChanges}
            className={`inline-flex items-center gap-2 px-6 py-2.5 uppercase tracking-wider text-xs font-semibold transition-all ${
              hasUnsavedChanges
                ? 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-md ring-2 ring-emerald-500 ring-offset-1'
                : 'bg-stone-100 text-stone-400 cursor-not-allowed border border-stone-200'
            }`}
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving Changes...' : 'Save Changes'}</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-stone-200 text-stone-400 uppercase tracking-wider text-[11px]">
                <th className="pb-3 font-normal">Order</th>
                <th className="pb-3 font-normal">Name</th>
                <th className="pb-3 font-normal">Slug</th>
                <th className="pb-3 font-normal">Description</th>
                <th className="pb-3 font-normal text-center">Nav Visibility</th>
                <th className="pb-3 font-normal text-center">Active Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {sectionList.map((s) => (
                <tr key={s.id} className="hover:bg-stone-50/70 transition-colors">
                  <td className="py-3 font-bold text-stone-500">{s.display_order}</td>
                  <td className="py-3 font-bold text-stone-900 font-sans">{s.name}</td>
                  <td className="py-3 text-stone-500">/{s.slug}</td>
                  <td className="py-3 text-stone-600 font-sans max-w-xs truncate">{s.description || '—'}</td>

                  {/* Nav Visibility Toggle */}
                  <td className="py-3 text-center">
                    <div className="inline-flex items-center gap-2.5">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={s.is_nav_visible}
                        onClick={() => handleToggleNav(s.id)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          s.is_nav_visible ? 'bg-emerald-600' : 'bg-stone-300'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            s.is_nav_visible ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                      <span
                        className={`text-[10px] uppercase font-bold min-w-[70px] text-left ${
                          s.is_nav_visible ? 'text-emerald-700' : 'text-stone-400'
                        }`}
                      >
                        {s.is_nav_visible ? 'Visible' : 'Hidden'}
                      </span>
                    </div>
                  </td>

                  {/* Active Status Toggle */}
                  <td className="py-3 text-center">
                    <div className="inline-flex items-center gap-2.5">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={s.is_active}
                        onClick={() => handleToggleActive(s.id)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          s.is_active ? 'bg-stone-900' : 'bg-stone-300'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            s.is_active ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                      <span
                        className={`text-[10px] uppercase font-bold min-w-[60px] text-left ${
                          s.is_active ? 'text-stone-900' : 'text-stone-400'
                        }`}
                      >
                        {s.is_active ? 'Active' : 'Disabled'}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom Save Changes Bar */}
        <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-[11px] text-stone-500">
            {hasUnsavedChanges ? (
              <span className="text-amber-700 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                Unsaved modifications detected. Remember to save before navigating away.
              </span>
            ) : (
              <span>All store sections are up to date and live.</span>
            )}
          </div>

          <button
            type="button"
            onClick={handleSaveChanges}
            disabled={isSaving || !hasUnsavedChanges}
            className={`inline-flex items-center gap-2 px-8 py-3 uppercase tracking-wider text-xs font-semibold transition-all ${
              hasUnsavedChanges
                ? 'bg-[#121212] hover:bg-stone-800 text-white shadow-md'
                : 'bg-stone-100 text-stone-400 cursor-not-allowed border border-stone-200'
            }`}
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving Changes...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
