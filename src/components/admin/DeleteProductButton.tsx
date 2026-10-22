'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Loader2 } from 'lucide-react';
import { deleteProductAction } from '@/app/actions/products';

interface DeleteProductButtonProps {
  productId: string;
  productName: string;
}

export function DeleteProductButton({ productId, productName }: DeleteProductButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${productName}" and all associated variants?\n\nThis cannot be undone.`
    );
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const res = await deleteProductAction(productId);
      if (res.success) {
        router.refresh();
      } else {
        alert(res.error || 'Failed to delete product. Please try again.');
        setIsDeleting(false);
      }
    } catch (err) {
      alert(`Error deleting product: ${(err as Error).message}`);
      setIsDeleting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-stone-400 hover:text-rose-600 inline-block p-1 bg-stone-100 hover:bg-rose-50 transition-colors disabled:opacity-50"
      title={`Delete "${productName}"`}
      aria-label={`Delete product ${productName}`}
    >
      {isDeleting ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-600" />
      ) : (
        <Trash2 className="w-3.5 h-3.5" />
      )}
    </button>
  );
}
