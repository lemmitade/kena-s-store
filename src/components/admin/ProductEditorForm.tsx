'use client';

// ============================================================================
// ADMIN PRODUCT & VARIANT EDITOR FORM
// Supports creating and editing title, slug, categories, pricing, images,
// and dynamic variant matrix (SKUs, sizes, colors, live stock quantities).
// ============================================================================

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { StoreSection, Category, Product } from '@/types';
import {
  createProductAction,
  updateProductAction,
  deleteProductAction,
} from '@/app/actions/products';
import { Plus, Trash2, Check, AlertCircle, Eye, ArrowLeft, Loader2 } from 'lucide-react';

interface ProductEditorFormProps {
  sections: StoreSection[];
  categories: Category[];
  initialProduct?: Product;
}

export function ProductEditorForm({
  sections,
  categories,
  initialProduct,
}: ProductEditorFormProps) {
  const router = useRouter();
  const isEditing = Boolean(initialProduct);

  const [name, setName] = useState(initialProduct?.name || '');
  const [slug, setSlug] = useState(initialProduct?.slug || '');
  const [description, setDescription] = useState(initialProduct?.description || '');
  const initialCategory = initialProduct?.primary_category_id
    ? categories.find((c) => c.id === initialProduct.primary_category_id)
    : null;

  const [primarySectionId, setPrimarySectionId] = useState(
    initialProduct?.primary_section_id || initialCategory?.section_id || sections[0]?.id || ''
  );
  const [primaryCategoryId, setPrimaryCategoryId] = useState(
    initialProduct?.primary_category_id || ''
  );
  const [regularPrice, setRegularPrice] = useState(
    initialProduct?.regular_price_etb ?? 2500
  );
  const [salePrice, setSalePrice] = useState<number | undefined>(
    initialProduct?.sale_price_etb
  );
  const [lowStockThreshold, setLowStockThreshold] = useState(
    initialProduct?.low_stock_threshold ?? 3
  );
  const [isPublished, setIsPublished] = useState(
    initialProduct ? initialProduct.is_published : true
  );
  const [isFeatured, setIsFeatured] = useState(
    initialProduct ? initialProduct.is_featured : false
  );
  const [isNewArrival, setIsNewArrival] = useState(
    initialProduct ? initialProduct.is_new_arrival : true
  );
  const [imageUrl, setImageUrl] = useState(
    initialProduct?.images?.[0]?.image_url ||
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1200&q=85'
  );

  // Variant matrix
  const [variants, setVariants] = useState<
    Array<{
      id?: string;
      sku: string;
      size: string;
      color: string;
      stock_quantity: number;
    }>
  >(() => {
    if (initialProduct?.variants && initialProduct.variants.length > 0) {
      return initialProduct.variants.map((v) => ({
        id: v.id,
        sku: v.sku,
        size: v.size || '',
        color: v.color || '',
        stock_quantity: Number(v.stock_quantity) || 0,
      }));
    }
    const cleanPrefix = (initialProduct?.slug || 'PRD')
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 5) || 'SKU';
    return [
      { sku: `${cleanPrefix}-S`, size: 'S', color: 'White', stock_quantity: 1 },
      { sku: `${cleanPrefix}-M`, size: 'M', color: 'White', stock_quantity: 1 },
      { sku: `${cleanPrefix}-L`, size: 'L', color: 'White', stock_quantity: 1 },
    ];
  });

  // Sync state if initialProduct loads/updates
  useEffect(() => {
    if (initialProduct?.variants && initialProduct.variants.length > 0) {
      setVariants(
        initialProduct.variants.map((v) => ({
          id: v.id,
          sku: v.sku,
          size: v.size || '',
          color: v.color || '',
          stock_quantity: Number(v.stock_quantity) || 0,
        }))
      );
    }
  }, [initialProduct]);

  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Auto-slug generator (only when creating or if slug is empty)
  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEditing || !slug) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
      );
    }
  };

  const handleAddVariant = () => {
    const cleanPrefix = (slug || name || 'SKU')
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 5) || 'SKU';
    const randSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const skuCode = `${cleanPrefix}-${randSuffix}`;
    setVariants((prev) => [
      ...prev,
      {
        sku: skuCode,
        size: 'M',
        color: 'Neutral',
        stock_quantity: 5,
      },
    ]);
  };

  const handleRemoveVariant = (index: number) => {
    if (variants.length <= 1) {
      setErrorMsg('Product must retain at least one variant SKU.');
      return;
    }
    setVariants((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleVariantChange = (
    index: number,
    field: 'sku' | 'size' | 'color' | 'stock_quantity',
    value: string | number
  ) => {
    setVariants((prev) =>
      prev.map((v, idx) => (idx === index ? { ...v, [field]: value } : v))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!name.trim() || !slug.trim()) {
      setErrorMsg('Product name and slug are required.');
      return;
    }

    if (variants.length === 0) {
      setErrorMsg('Please configure at least one variant SKU with stock quantity.');
      return;
    }

    // Check for empty SKUs
    for (const v of variants) {
      if (!v.sku.trim()) {
        setErrorMsg('All variants must have a valid SKU code.');
        return;
      }
    }

    setLoading(true);

    try {
      if (isEditing && initialProduct) {
        const res = await updateProductAction(initialProduct.id, {
          name: name.trim(),
          slug: slug.trim(),
          description: description.trim(),
          primary_section_id: primarySectionId || undefined,
          primary_category_id: primaryCategoryId || undefined,
          regular_price_etb: regularPrice,
          sale_price_etb: salePrice || undefined,
          low_stock_threshold: lowStockThreshold,
          is_published: isPublished,
          is_featured: isFeatured,
          is_new_arrival: isNewArrival,
          image_url: imageUrl.trim(),
          variants,
        });

        setLoading(false);

        if (!res.success) {
          setErrorMsg(res.error || 'Failed to update product.');
        } else {
          const updated = res.product;
          setSuccessMsg(`✓ Product "${updated?.name || name}" and variants updated successfully!`);
          if (updated) {
            setName(updated.name);
            setSlug(updated.slug);
            setDescription(updated.description);
            setRegularPrice(updated.regular_price_etb);
            setSalePrice(updated.sale_price_etb);
            setIsPublished(updated.is_published);
            setIsFeatured(updated.is_featured);
            setIsNewArrival(updated.is_new_arrival);
            if (updated.variants && updated.variants.length > 0) {
              setVariants(
                updated.variants.map((v) => ({
                  id: v.id,
                  sku: v.sku,
                  size: v.size || '',
                  color: v.color || '',
                  stock_quantity: Number(v.stock_quantity) || 0,
                }))
              );
            }
            router.replace(`/admin/products/${updated.id}`);
          }
          router.refresh();
        }
      } else {
        const res = await createProductAction({
          name: name.trim(),
          slug: slug.trim(),
          description: description.trim(),
          primary_section_id: primarySectionId,
          primary_category_id: primaryCategoryId || undefined,
          regular_price_etb: regularPrice,
          sale_price_etb: salePrice || undefined,
          low_stock_threshold: lowStockThreshold,
          is_published: isPublished,
          is_featured: isFeatured,
          is_new_arrival: isNewArrival,
          image_url: imageUrl.trim(),
          variants,
        });

        setLoading(false);

        if (!res.success) {
          setErrorMsg(res.error || 'Failed to create product.');
        } else {
          setSuccessMsg(`✓ Product "${res.product?.name || name}" created and published successfully!`);
          router.push('/admin/products');
        }
      }
    } catch (err) {
      setLoading(false);
      setErrorMsg(`Server error: ${(err as Error).message}`);
    }
  };

  const handleDeleteProduct = async () => {
    if (!initialProduct) return;
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${initialProduct.name}" and all associated variants?`
    );
    if (!confirmed) return;

    setDeleting(true);
    setErrorMsg('');
    try {
      const res = await deleteProductAction(initialProduct.id);
      setDeleting(false);
      if (res.success) {
        router.push('/admin/products');
        router.refresh();
      } else {
        setErrorMsg(res.error || 'Failed to delete product.');
      }
    } catch (err) {
      setDeleting(false);
      setErrorMsg(`Server error: ${(err as Error).message}`);
    }
  };

  // Filter categories by selected section
  const filteredCategories = categories.filter(
    (c) => !primarySectionId || c.section_id === primarySectionId
  );

  // When section changes, reset category if it no longer belongs to the new section
  const handleSectionChange = useCallback((newSectionId: string) => {
    setPrimarySectionId(newSectionId);
    // Check if current category belongs to the new section
    if (primaryCategoryId) {
      const currentCat = categories.find((c) => c.id === primaryCategoryId);
      if (!currentCat || currentCat.section_id !== newSectionId) {
        setPrimaryCategoryId('');
      }
    }
  }, [primaryCategoryId, categories]);

  const handleCategoryChange = useCallback((newCategoryId: string) => {
    setPrimaryCategoryId(newCategoryId);
    if (newCategoryId) {
      const cat = categories.find((c) => c.id === newCategoryId);
      if (cat && cat.section_id && cat.section_id !== primarySectionId) {
        setPrimarySectionId(cat.section_id);
      }
    }
  }, [primarySectionId, categories]);

  // If a category is selected, ensure the section matches that category
  useEffect(() => {
    if (primaryCategoryId) {
      const cat = categories.find((c) => c.id === primaryCategoryId);
      if (cat && cat.section_id && cat.section_id !== primarySectionId) {
        setPrimarySectionId(cat.section_id);
      }
    }
  }, [primaryCategoryId, primarySectionId, categories]);

  return (
    <form onSubmit={handleSubmit} className="space-y-8 font-mono text-xs">
      {/* Notifications */}
      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
          {isEditing && (
            <Link
              href={`/product/${slug}`}
              target="_blank"
              className="underline font-bold hover:text-emerald-950 inline-flex items-center gap-1"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview Live Storefront</span>
            </Link>
          )}
        </div>
      )}

      {/* Top Action Bar when Editing */}
      {isEditing && (
        <div className="flex flex-wrap items-center justify-between gap-4 bg-stone-100 p-4 border border-stone-200">
          <div className="flex items-center gap-2 text-stone-700">
            <span className="font-bold text-stone-900 uppercase">
              Editing Product: {initialProduct?.name}
            </span>
            <span className="text-stone-400">({initialProduct?.id})</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/product/${slug}`}
              target="_blank"
              className="bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 px-3 py-1.5 inline-flex items-center gap-1 text-[11px]"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>View Live</span>
            </Link>
            <button
              type="button"
              onClick={handleDeleteProduct}
              disabled={deleting}
              className="bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 px-3 py-1.5 inline-flex items-center gap-1 text-[11px] disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{deleting ? 'Deleting...' : 'Delete Product'}</span>
            </button>
          </div>
        </div>
      )}

      {/* 1. Basic Info Card */}
      <div className="bg-white border border-[#E7E5E4] p-6 sm:p-8 space-y-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-900 border-b border-stone-200 pb-3 flex items-center justify-between">
          <span>1. General Product Details</span>
          <span className="text-[10px] text-stone-400 font-normal">
            Editable title, URL slug, catalog placement
          </span>
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
            <span className="text-[10px] text-stone-400">
              Live link: /product/{slug || '...'}
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="uppercase text-stone-500 block">Assigned Section *</label>
            <select
              value={primarySectionId}
              onChange={(e) => handleSectionChange(e.target.value)}
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
            <label className="uppercase text-stone-500 block">Category (Optional)</label>
            <select
              value={primaryCategoryId}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full bg-[#FAF9F6] border border-stone-300 px-4 py-3 text-sm focus:outline-none focus:border-stone-900"
            >
              <option value="">-- No Specific Category --</option>
              {filteredCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2 space-y-2">
            <label className="uppercase text-stone-500 block">Product Image URL *</label>
            <div className="flex gap-4 items-start">
              <input
                type="url"
                required
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="flex-1 bg-[#FAF9F6] border border-stone-300 px-4 py-3 text-sm focus:outline-none focus:border-stone-900"
              />
              {imageUrl && (
                <div className="relative w-16 h-16 bg-stone-100 border border-stone-200 overflow-hidden flex-shrink-0">
                  <Image
                    src={imageUrl}
                    alt="Preview"
                    fill
                    sizes="64px"
                    className="object-cover"
                    onError={() => {}}
                  />
                </div>
              )}
            </div>
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

      {/* 2. Pricing & Stock Thresholds */}
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
              onChange={(e) =>
                setSalePrice(e.target.value ? parseInt(e.target.value, 10) : undefined)
              }
              placeholder="Leave blank if no sale"
              className="w-full bg-[#FAF9F6] border border-stone-300 px-4 py-3 text-sm focus:outline-none focus:border-stone-900"
            />
          </div>

          <div className="space-y-1.5">
            <label className="uppercase text-stone-500 block">Low Stock Alert Threshold</label>
            <input
              type="number"
              min={1}
              value={lowStockThreshold}
              onChange={(e) => setLowStockThreshold(parseInt(e.target.value, 10) || 3)}
              className="w-full bg-[#FAF9F6] border border-stone-300 px-4 py-3 text-sm focus:outline-none focus:border-stone-900"
            />
          </div>
        </div>

        <div className="pt-2 flex flex-wrap gap-6 border-t border-stone-100">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="rounded border-stone-300 text-stone-900 focus:ring-0"
            />
            <span className="font-semibold text-stone-900">
              Published (Visible on live storefront)
            </span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="rounded border-stone-300 text-stone-900 focus:ring-0"
            />
            <span className="font-semibold text-stone-900">Featured Piece</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isNewArrival}
              onChange={(e) => setIsNewArrival(e.target.checked)}
              className="rounded border-stone-300 text-stone-900 focus:ring-0"
            />
            <span className="font-semibold text-stone-900">New Arrival Badge</span>
          </label>
        </div>
      </div>

      {/* 3. Variant Matrix Generator */}
      <div className="bg-white border border-[#E7E5E4] p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-stone-200 pb-3">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-900">
              3. Variant Matrix (Editable Sizes, Colors, SKUs, Stock)
            </h2>
            <p className="text-[11px] text-stone-400 mt-0.5">
              Edit any SKU code, size, color, or current stock quantity in real-time.
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddVariant}
            className="bg-stone-900 hover:bg-stone-800 text-white px-3 py-1.5 text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Variant Row</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-200 text-stone-400 uppercase tracking-wider text-[11px]">
                <th className="pb-3 font-normal">SKU Code *</th>
                <th className="pb-3 font-normal">Size / Fit</th>
                <th className="pb-3 font-normal">Color</th>
                <th className="pb-3 font-normal">Stock Units *</th>
                <th className="pb-3 font-normal text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {variants.map((v, idx) => (
                <tr key={idx} className="hover:bg-stone-50/50">
                  <td className="py-2.5 pr-2">
                    <input
                      type="text"
                      required
                      value={v.sku}
                      onChange={(e) =>
                        handleVariantChange(idx, 'sku', e.target.value.toUpperCase())
                      }
                      placeholder="e.g. TIB-S-WHT"
                      className="w-full bg-[#FAF9F6] border border-stone-300 px-2.5 py-1.5 font-bold text-stone-900 uppercase"
                    />
                  </td>
                  <td className="py-2.5 pr-2">
                    <input
                      type="text"
                      value={v.size}
                      onChange={(e) => handleVariantChange(idx, 'size', e.target.value)}
                      placeholder="e.g. S, M, 42"
                      className="w-24 bg-[#FAF9F6] border border-stone-300 px-2.5 py-1.5"
                    />
                  </td>
                  <td className="py-2.5 pr-2">
                    <input
                      type="text"
                      value={v.color}
                      onChange={(e) => handleVariantChange(idx, 'color', e.target.value)}
                      placeholder="e.g. Ivory / Red"
                      className="w-32 bg-[#FAF9F6] border border-stone-300 px-2.5 py-1.5"
                    />
                  </td>
                  <td className="py-2.5 pr-2">
                    <input
                      type="number"
                      min={0}
                      required
                      value={v.stock_quantity}
                      onChange={(e) =>
                        handleVariantChange(
                          idx,
                          'stock_quantity',
                          parseInt(e.target.value, 10) || 0
                        )
                      }
                      className="w-28 bg-[#FAF9F6] border border-stone-300 px-2.5 py-1.5 font-bold text-stone-900"
                    />
                  </td>
                  <td className="py-2.5 text-right">
                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(idx)}
                      className="text-stone-400 hover:text-rose-600 p-1.5 transition-colors"
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

      {/* Bottom Status Notifications (always visible to user saving at bottom of page) */}
      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span className="font-semibold">{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 flex-shrink-0" />
            <span className="font-semibold">{successMsg}</span>
          </div>
          {isEditing && (
            <Link
              href={`/product/${slug}`}
              target="_blank"
              className="underline font-bold hover:text-emerald-950 inline-flex items-center gap-1 text-[11px]"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview Live Storefront</span>
            </Link>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-stone-200">
        <button
          type="submit"
          disabled={loading}
          className="bg-[#121212] text-white px-8 py-4 text-xs font-mono uppercase tracking-widest font-semibold hover:bg-stone-800 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          <span>
            {loading
              ? isEditing
                ? 'Updating Piece...'
                : 'Creating Piece...'
              : isEditing
              ? 'Save Changes to Piece & Variants'
              : 'Save & Publish Product'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => router.push('/admin/products')}
          className="border border-stone-300 px-6 py-4 text-xs font-mono uppercase tracking-wider text-stone-600 hover:bg-stone-50 transition-colors"
        >
          Return to Catalog
        </button>

        {isEditing && (
          <Link
            href={`/product/${slug}`}
            target="_blank"
            className="border border-stone-300 px-6 py-4 text-xs font-mono uppercase tracking-wider text-stone-600 hover:bg-stone-50 transition-colors inline-flex items-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview in Store</span>
          </Link>
        )}
      </div>
    </form>
  );
}
