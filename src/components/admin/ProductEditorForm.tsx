'use client';

// ============================================================================
// ADMIN PRODUCT EDITOR FORM
// Supports title, slug auto-generation, pricing in ETB, image URL, variant matrix
// ============================================================================

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { StoreSection, Category } from '@/types';
import { createProductAction } from '@/app/actions/products';
import { Plus, Trash2, Check, AlertCircle } from 'lucide-react';

interface ProductEditorFormProps {
  sections: StoreSection[];
  categories: Category[];
}

export function ProductEditorForm({ sections, categories }: ProductEditorFormProps) {
  const router = useRouter();

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [primarySectionId, setPrimarySectionId] = useState(sections[0]?.id || '');
  const [regularPrice, setRegularPrice] = useState(2500);
  const [salePrice, setSalePrice] = useState<number | undefined>(undefined);
  const [lowStockThreshold, setLowStockThreshold] = useState(3);
  const [isPublished, setIsPublished] = useState(true);
  const [imageUrl, setImageUrl] = useState(
    'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1200&q=85'
  );

  // Variant matrix
  const [variants, setVariants] = useState([
    { sku: 'NEW-S-WHT', size: 'S', color: 'White', stock_quantity: 10 },
    { sku: 'NEW-M-WHT', size: 'M', color: 'White', stock_quantity: 15 },
    { sku: 'NEW-L-WHT', size: 'L', color: 'White', stock_quantity: 8 },
  ]);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Auto-slug generator
  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(
      val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
    );
  };

  const handleAddVariant = () => {
    setVariants((prev) => [
      ...prev,
      { sku: `SKU-${Date.now().toString().slice(-4)}`, size: 'M', color: 'Neutral', stock_quantity: 5 },
    ]);
  };

  const handleRemoveVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleVariantChange = (index: number, field: string, value: string | number) => {
    setVariants((prev) =>
      prev.map((v, idx) => (idx === index ? { ...v, [field]: value } : v))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim() || !slug.trim()) {
      setErrorMsg('Product name and slug are required.');
      return;
    }

    if (variants.length === 0) {
      setErrorMsg('Please configure at least one variant SKU with stock quantity.');
      return;
    }

    setLoading(true);

    try {
      const res = await createProductAction({
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim(),
        primary_section_id: primarySectionId,
        regular_price_etb: regularPrice,
        sale_price_etb: salePrice || undefined,
        low_stock_threshold: lowStockThreshold,
        is_published: isPublished,
        image_url: imageUrl.trim(),
        variants,
      });

      setLoading(false);

      if (!res.success) {
        setErrorMsg(res.error || 'Failed to create product.');
      } else {
        router.push('/admin/products');
      }
    } catch (err) {
      setLoading(false);
      setErrorMsg(`Server error: ${(err as Error).message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 font-mono text-xs">
      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Basic Info Card */}
      <div className="bg-white border border-[#E7E5E4] p-6 sm:p-8 space-y-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-900 border-b border-stone-200 pb-3">
          1. General Product Details
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="uppercase text-stone-500 block">Product Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Pure Linen Overshirt"
              className="w-full bg-[#FAF9F6] border border-stone-300 px-4 py-3 text-sm focus:outline-none focus:border-stone-900 font-sans"
            />
          </div>

          <div className="space-y-1.5">
            <label className="uppercase text-stone-500 block">Unique Slug (URL) *</label>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full bg-[#FAF9F6] border border-stone-300 px-4 py-3 text-sm focus:outline-none focus:border-stone-900"
            />
          </div>

          <div className="space-y-1.5">
            <label className="uppercase text-stone-500 block">Assigned Section *</label>
            <select
              value={primarySectionId}
              onChange={(e) => setPrimarySectionId(e.target.value)}
              className="w-full bg-[#FAF9F6] border border-stone-300 px-4 py-3 text-sm focus:outline-none focus:border-stone-900"
            >
              {sections.map((sec) => (
                <option key={sec.id} value={sec.id}>
                  {sec.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="uppercase text-stone-500 block">Product Image URL *</label>
            <input
              type="url"
              required
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              className="w-full bg-[#FAF9F6] border border-stone-300 px-4 py-3 text-sm focus:outline-none focus:border-stone-900"
            />
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <label className="uppercase text-stone-500 block">Description &amp; Narrative *</label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Artisanal tailoring notes, textile provenance, and fit guidance..."
              className="w-full bg-[#FAF9F6] border border-stone-300 p-4 text-sm focus:outline-none focus:border-stone-900 font-sans font-light"
            />
          </div>
        </div>
      </div>

      {/* Pricing & Stock Thresholds */}
      <div className="bg-white border border-[#E7E5E4] p-6 sm:p-8 space-y-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-900 border-b border-stone-200 pb-3">
          2. Financials in ETB &amp; Inventory Settings
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="space-y-1.5">
            <label className="uppercase text-stone-500 block">Regular Price (ETB) *</label>
            <input
              type="number"
              required
              min={1}
              value={regularPrice}
              onChange={(e) => setRegularPrice(parseInt(e.target.value, 10) || 0)}
              className="w-full bg-[#FAF9F6] border border-stone-300 px-4 py-3 text-sm font-bold focus:outline-none focus:border-stone-900"
            />
          </div>

          <div className="space-y-1.5">
            <label className="uppercase text-stone-500 block">Sale Price (Optional ETB)</label>
            <input
              type="number"
              min={1}
              value={salePrice || ''}
              onChange={(e) => setSalePrice(e.target.value ? parseInt(e.target.value, 10) : undefined)}
              placeholder="Leave blank if no sale"
              className="w-full bg-[#FAF9F6] border border-stone-300 px-4 py-3 text-sm focus:outline-none focus:border-stone-900"
            />
          </div>

          <div className="space-y-1.5">
            <label className="uppercase text-stone-500 block">Low Stock Threshold</label>
            <input
              type="number"
              min={1}
              value={lowStockThreshold}
              onChange={(e) => setLowStockThreshold(parseInt(e.target.value, 10) || 3)}
              className="w-full bg-[#FAF9F6] border border-stone-300 px-4 py-3 text-sm focus:outline-none focus:border-stone-900"
            />
          </div>
        </div>

        <label className="flex items-center gap-3 cursor-pointer pt-2">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
            className="rounded border-stone-300 text-stone-900 focus:ring-0"
          />
          <span className="font-semibold text-stone-900">
            Publish Immediately (Visible in live storefront)
          </span>
        </label>
      </div>

      {/* Variant Matrix Generator */}
      <div className="bg-white border border-[#E7E5E4] p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-stone-200 pb-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-900">
            3. Variant Matrix (Sizes, Colors, SKUs, Stock)
          </h2>
          <button
            type="button"
            onClick={handleAddVariant}
            className="bg-stone-100 hover:bg-stone-200 px-3 py-1.5 text-stone-800 text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Variant Row</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-200 text-stone-400 uppercase tracking-wider text-[11px]">
                <th className="pb-3 font-normal">SKU</th>
                <th className="pb-3 font-normal">Size</th>
                <th className="pb-3 font-normal">Color</th>
                <th className="pb-3 font-normal">Initial Stock Quantity</th>
                <th className="pb-3 font-normal text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {variants.map((v, idx) => (
                <tr key={idx}>
                  <td className="py-2.5 pr-2">
                    <input
                      type="text"
                      required
                      value={v.sku}
                      onChange={(e) => handleVariantChange(idx, 'sku', e.target.value.toUpperCase())}
                      className="w-full bg-[#FAF9F6] border border-stone-300 px-2 py-1.5"
                    />
                  </td>
                  <td className="py-2.5 pr-2">
                    <input
                      type="text"
                      value={v.size}
                      onChange={(e) => handleVariantChange(idx, 'size', e.target.value)}
                      className="w-20 bg-[#FAF9F6] border border-stone-300 px-2 py-1.5"
                    />
                  </td>
                  <td className="py-2.5 pr-2">
                    <input
                      type="text"
                      value={v.color}
                      onChange={(e) => handleVariantChange(idx, 'color', e.target.value)}
                      className="w-28 bg-[#FAF9F6] border border-stone-300 px-2 py-1.5"
                    />
                  </td>
                  <td className="py-2.5 pr-2">
                    <input
                      type="number"
                      min={0}
                      value={v.stock_quantity}
                      onChange={(e) =>
                        handleVariantChange(idx, 'stock_quantity', parseInt(e.target.value, 10) || 0)
                      }
                      className="w-24 bg-[#FAF9F6] border border-stone-300 px-2 py-1.5 font-bold"
                    />
                  </td>
                  <td className="py-2.5 text-right">
                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(idx)}
                      className="text-stone-400 hover:text-rose-600 p-1"
                      title="Remove variant"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="bg-[#121212] text-white px-8 py-4 text-xs font-mono uppercase tracking-widest font-semibold hover:bg-stone-800 transition-colors disabled:opacity-50"
        >
          {loading ? 'Creating Piece...' : 'Save & Publish Product'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="border border-stone-300 px-6 py-4 text-xs font-mono uppercase tracking-wider text-stone-600 hover:bg-stone-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
