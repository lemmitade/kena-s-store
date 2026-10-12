'use client';

// ============================================================================
// ADMIN ORDERS TABLE WITH LIVE STATUS UPDATER & FEE OVERRIDE MODAL
// ============================================================================

import React, { useState } from 'react';
import { Order, OrderStatus, PaymentStatus } from '@/types';
import { formatETB, formatDate } from '@/lib/utils/format';
import { updateOrderStatusAction, overrideFeeAction } from '@/app/actions/orders';
import { Edit3, CheckCircle, Truck, Store, ExternalLink } from 'lucide-react';

interface OrdersTableProps {
  orders: Order[];
}

export function OrdersTable({ orders }: OrdersTableProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [newFee, setNewFee] = useState<number>(0);
  const [overrideReason, setOverrideReason] = useState('');
  const [staffName, setStaffName] = useState('Staff Admin');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const deliveryStatuses: OrderStatus[] = [
    'confirmed',
    'preparing',
    'ready_for_dispatch',
    'out_for_delivery',
    'delivered',
    'failed_delivery',
    'cancelled',
  ];

  const pickupStatuses: OrderStatus[] = [
    'confirmed',
    'preparing',
    'ready_for_pickup',
    'picked_up',
    'cancelled',
  ];

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    await updateOrderStatusAction(orderId, newStatus);
  };

  const handlePaymentChange = async (orderId: string, newStatus: PaymentStatus) => {
    const o = orders.find((ord) => ord.id === orderId);
    if (!o) return;
    await updateOrderStatusAction(orderId, o.order_status, newStatus);
  };

  const openOverrideModal = (order: Order) => {
    setSelectedOrder(order);
    setNewFee(order.delivery_fee_etb);
    setOverrideReason('');
    setOverrideModalOpen(true);
  };

  const handleSaveOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setIsSubmitting(true);
    await overrideFeeAction({
      orderId: selectedOrder.id,
      newFeeETB: newFee,
      reason: overrideReason,
      staffName,
    });
    setIsSubmitting(false);
    setOverrideModalOpen(false);
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      <div className="bg-white border border-[#E7E5E4] p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-stone-200 text-stone-400 uppercase tracking-wider text-[11px]">
                <th className="pb-3 font-normal">Order #</th>
                <th className="pb-3 font-normal">Customer</th>
                <th className="pb-3 font-normal">Fulfillment</th>
                <th className="pb-3 font-normal">Order Status</th>
                <th className="pb-3 font-normal">Payment</th>
                <th className="pb-3 font-normal">Delivery Fee</th>
                <th className="pb-3 font-normal text-right">Total (ETB)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {orders.map((o) => {
                const isPickup = o.fulfillment_type === 'store_pickup';
                const availableStatuses = isPickup ? pickupStatuses : deliveryStatuses;

                return (
                  <tr key={o.id} className="hover:bg-stone-50/70">
                    <td className="py-4 font-bold text-stone-900 pr-3">
                      <span>{o.order_number}</span>
                      <span className="text-[10px] text-stone-400 block font-normal">
                        {formatDate(o.created_at)}
                      </span>
                    </td>

                    <td className="py-4 pr-3">
                      <span className="font-semibold text-stone-900 block">{o.customer_name}</span>
                      <span className="text-stone-500 block">{o.customer_phone}</span>
                    </td>

                    <td className="py-4 pr-3">
                      <div className="flex items-center gap-1.5 font-semibold text-stone-800">
                        {isPickup ? <Store className="w-3.5 h-3.5" /> : <Truck className="w-3.5 h-3.5" />}
                        <span>{isPickup ? 'Store Pickup' : 'Home Delivery'}</span>
                      </div>
                      <span className="text-[10px] text-stone-500 block">
                        {isPickup
                          ? `PIN: ${o.fulfillment?.pickup_reference_code || '—'}`
                          : `${o.fulfillment?.delivery_sub_city || 'Addis Ababa'}`}
                      </span>
                    </td>

                    <td className="py-4 pr-3">
                      <select
                        value={o.order_status}
                        onChange={(e) => handleStatusChange(o.id, e.target.value as OrderStatus)}
                        className="bg-stone-50 border border-stone-300 p-1.5 text-xs focus:outline-none font-mono"
                      >
                        {availableStatuses.map((st) => (
                          <option key={st} value={st}>
                            {st.replace(/_/g, ' ')}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="py-4 pr-3">
                      <select
                        value={o.payment_status}
                        onChange={(e) => handlePaymentChange(o.id, e.target.value as PaymentStatus)}
                        className={`border p-1.5 text-xs font-mono font-bold ${
                          o.payment_status === 'paid'
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                            : 'bg-amber-50 border-amber-300 text-amber-800'
                        }`}
                      >
                        <option value="pending">PENDING</option>
                        <option value="paid">PAID (CONFIRMED)</option>
                        <option value="failed">FAILED</option>
                        <option value="refunded">REFUNDED</option>
                      </select>
                      <span className="text-[10px] text-stone-400 block pt-0.5">
                        via {o.payment_method.toUpperCase()}
                      </span>
                    </td>

                    <td className="py-4 pr-3">
                      <div className="flex items-center gap-1.5">
                        <span>{formatETB(o.delivery_fee_etb)}</span>
                        <button
                          type="button"
                          onClick={() => openOverrideModal(o)}
                          className="text-stone-400 hover:text-stone-900"
                          title="Override Delivery Fee with Audit Reason"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>

                    <td className="py-4 text-right font-bold text-stone-900 text-sm">
                      {formatETB(o.total_amount_etb)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Delivery Fee Override Modal */}
      {overrideModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-stone-300 max-w-md w-full p-6 space-y-5 animate-in fade-in duration-200">
            <h3 className="text-base font-serif font-medium text-stone-900">
              Audit-Logged Delivery Fee Override
            </h3>
            <p className="text-stone-500 text-xs">
              Order: <strong>{selectedOrder.order_number}</strong> • Original Fee: {formatETB(selectedOrder.delivery_fee_etb)}
            </p>

            <form onSubmit={handleSaveOverride} className="space-y-4">
              <div className="space-y-1">
                <label className="uppercase text-stone-500 block">New Fee (ETB) *</label>
                <input
                  type="number"
                  min={0}
                  required
                  value={newFee}
                  onChange={(e) => setNewFee(parseInt(e.target.value, 10) || 0)}
                  className="w-full border border-stone-300 p-2 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="uppercase text-stone-500 block">Mandatory Override Reason *</label>
                <textarea
                  required
                  rows={3}
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="e.g. VIP client waiver / Route adjustment / Weather delay compensation"
                  className="w-full border border-stone-300 p-2 font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="uppercase text-stone-500 block">Staff Name / Signature *</label>
                <input
                  type="text"
                  required
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  className="w-full border border-stone-300 p-2"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOverrideModalOpen(false)}
                  className="px-4 py-2 border border-stone-300 text-stone-600 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-stone-900 text-white font-semibold hover:bg-black disabled:opacity-50"
                >
                  {isSubmitting ? 'Recording...' : 'Authorize Override'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
