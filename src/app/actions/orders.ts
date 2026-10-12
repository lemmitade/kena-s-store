'use server';

// ============================================================================
// SERVER ACTIONS: ORDER MANAGEMENT & AUDITED FEE OVERRIDES
// ============================================================================

import { updateOrderStatus, overrideOrderDeliveryFee } from '@/lib/db/repository';
import { OrderStatus, PaymentStatus } from '@/types';
import { revalidatePath } from 'next/cache';

export async function updateOrderStatusAction(
  orderId: string,
  newStatus: OrderStatus,
  newPaymentStatus?: PaymentStatus
) {
  try {
    const updated = await updateOrderStatus(orderId, newStatus, newPaymentStatus);
    revalidatePath('/admin/orders');
    revalidatePath('/admin/dashboard');
    return { success: true, order: updated };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

export async function overrideFeeAction(formData: {
  orderId: string;
  newFeeETB: number;
  reason: string;
  staffName: string;
}) {
  try {
    if (!formData.reason.trim()) {
      return { success: false, error: 'A valid reason is required for fee overrides.' };
    }

    const updated = await overrideOrderDeliveryFee(
      formData.orderId,
      formData.newFeeETB,
      formData.reason.trim(),
      formData.staffName
    );

    revalidatePath('/admin/orders');
    revalidatePath('/admin/dashboard');
    return { success: true, order: updated };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}
