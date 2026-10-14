'use client';

// ============================================================================
// ADMIN ORDERS & DISPATCH TABLE WITH LIVE STATUS UPDATER & DETAILS MODAL
// ============================================================================

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Order, OrderStatus, PaymentStatus } from '@/types';
import { formatETB, formatDate } from '@/lib/utils/format';
import { updateOrderStatusAction, overrideFeeAction, fetchOrdersAction } from '@/app/actions/orders';
import {
  Edit3,
  Truck,
  Store,
  ExternalLink,
  Search,
  RefreshCw,
  Eye,
  CheckCircle2,
  Clock,
  Package,
  X,
  Phone,
  MapPin,
  Calendar,
} from 'lucide-react';

interface OrdersTableProps {
  orders: Order[];
}

export function OrdersTable({ orders }: OrdersTableProps) {
  const router = useRouter();
  const [orderList, setOrderList] = useState<Order[]>(orders);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'ready_for_dispatch' | 'out_for_delivery' | 'store_pickup' | 'confirmed' | 'delivered'>('all');

  // Modals
  const [inspectOrder, setInspectOrder] = useState<Order | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [newFee, setNewFee] = useState<number>(0);
  const [overrideReason, setOverrideReason] = useState('');
  const [staffName, setStaffName] = useState('Staff Admin');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state whenever props update
  useEffect(() => {
    setOrderList(orders);
  }, [orders]);

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

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetchOrdersAction();
      if (res.success && res.orders) {
        setOrderList(res.orders);
      }
      router.refresh();
    } catch (err) {
      console.error('Failed to refresh orders:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    // Optimistic local state update
    setOrderList((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, order_status: newStatus, updated_at: new Date().toISOString() } : o))
    );
    if (inspectOrder && inspectOrder.id === orderId) {
      setInspectOrder((prev) => (prev ? { ...prev, order_status: newStatus } : null));
    }

    await updateOrderStatusAction(orderId, newStatus);
    router.refresh();
  };

  const handlePaymentChange = async (orderId: string, newStatus: PaymentStatus) => {
    // Optimistic local state update
    setOrderList((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, payment_status: newStatus, updated_at: new Date().toISOString() } : o))
    );
    if (inspectOrder && inspectOrder.id === orderId) {
      setInspectOrder((prev) => (prev ? { ...prev, payment_status: newStatus } : null));
    }

    const o = orderList.find((ord) => ord.id === orderId);
    if (!o) return;
    await updateOrderStatusAction(orderId, o.order_status, newStatus);
    router.refresh();
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

    const updatedTotal = Math.max(0, selectedOrder.subtotal_etb - selectedOrder.discount_amount_etb + newFee);

    // Optimistic update
    setOrderList((prev) =>
      prev.map((o) =>
        o.id === selectedOrder.id
          ? {
              ...o,
              delivery_fee_etb: newFee,
              total_amount_etb: updatedTotal,
              updated_at: new Date().toISOString(),
            }
          : o
      )
    );
    if (inspectOrder && inspectOrder.id === selectedOrder.id) {
      setInspectOrder((prev) =>
        prev
          ? {
              ...prev,
              delivery_fee_etb: newFee,
              total_amount_etb: updatedTotal,
            }
          : null
      );
    }

    await overrideFeeAction({
      orderId: selectedOrder.id,
      newFeeETB: newFee,
      reason: overrideReason,
      staffName,
    });

    setIsSubmitting(false);
    setOverrideModalOpen(false);
    router.refresh();
  };

  // Filter & Search Logic
  const filteredOrders = orderList.filter((o) => {
    // Filter tab match
    if (activeFilter === 'ready_for_dispatch' && o.order_status !== 'ready_for_dispatch') return false;
    if (activeFilter === 'out_for_delivery' && o.order_status !== 'out_for_delivery') return false;
    if (activeFilter === 'store_pickup' && o.fulfillment_type !== 'store_pickup') return false;
    if (activeFilter === 'confirmed' && o.order_status !== 'confirmed') return false;
    if (activeFilter === 'delivered' && o.order_status !== 'delivered' && o.order_status !== 'picked_up') return false;

    // Search query match
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      o.order_number.toLowerCase().includes(q) ||
      o.customer_name.toLowerCase().includes(q) ||
      o.customer_phone.includes(q) ||
      (o.fulfillment?.delivery_sub_city && o.fulfillment.delivery_sub_city.toLowerCase().includes(q)) ||
      (o.fulfillment?.pickup_reference_code && o.fulfillment.pickup_reference_code.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white border border-[#E7E5E4] p-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Order #, Customer, Phone, or Sub-City..."
            className="w-full pl-9 pr-4 py-2 border border-stone-200 text-xs font-mono focus:outline-none focus:border-stone-900 bg-[#FAF9F6]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 text-xs"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-2 border border-stone-300 text-stone-700 hover:bg-stone-50 font-semibold disabled:opacity-50 transition-colors"
            title="Reload latest orders from server storage"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Syncing...' : 'Sync Orders'}</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-1.5 border uppercase tracking-wider font-semibold transition-colors ${
            activeFilter === 'all'
              ? 'bg-stone-900 text-white border-stone-900'
              : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
          }`}
        >
          All ({orderList.length})
        </button>
        <button
          onClick={() => setActiveFilter('ready_for_dispatch')}
          className={`px-3 py-1.5 border uppercase tracking-wider font-semibold transition-colors ${
            activeFilter === 'ready_for_dispatch'
              ? 'bg-stone-900 text-white border-stone-900'
              : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
          }`}
        >
          Ready for Dispatch ({orderList.filter((o) => o.order_status === 'ready_for_dispatch').length})
        </button>
        <button
          onClick={() => setActiveFilter('out_for_delivery')}
          className={`px-3 py-1.5 border uppercase tracking-wider font-semibold transition-colors ${
            activeFilter === 'out_for_delivery'
              ? 'bg-stone-900 text-white border-stone-900'
              : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
          }`}
        >
          In Transit ({orderList.filter((o) => o.order_status === 'out_for_delivery').length})
        </button>
        <button
          onClick={() => setActiveFilter('store_pickup')}
          className={`px-3 py-1.5 border uppercase tracking-wider font-semibold transition-colors ${
            activeFilter === 'store_pickup'
              ? 'bg-stone-900 text-white border-stone-900'
              : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
          }`}
        >
          Store Pickup ({orderList.filter((o) => o.fulfillment_type === 'store_pickup').length})
        </button>
        <button
          onClick={() => setActiveFilter('confirmed')}
          className={`px-3 py-1.5 border uppercase tracking-wider font-semibold transition-colors ${
            activeFilter === 'confirmed'
              ? 'bg-stone-900 text-white border-stone-900'
              : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
          }`}
        >
          Confirmed ({orderList.filter((o) => o.order_status === 'confirmed').length})
        </button>
        <button
          onClick={() => setActiveFilter('delivered')}
          className={`px-3 py-1.5 border uppercase tracking-wider font-semibold transition-colors ${
            activeFilter === 'delivered'
              ? 'bg-stone-900 text-white border-stone-900'
              : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
          }`}
        >
          Delivered ({orderList.filter((o) => o.order_status === 'delivered' || o.order_status === 'picked_up').length})
        </button>
      </div>

      {/* Orders Table */}
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
                <th className="pb-3 font-normal text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-stone-400">
                    No orders match the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => {
                  const isPickup = o.fulfillment_type === 'store_pickup';
                  const availableStatuses = isPickup ? pickupStatuses : deliveryStatuses;

                  return (
                    <tr key={o.id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="py-4 font-bold text-stone-900 pr-3">
                        <button
                          type="button"
                          onClick={() => setInspectOrder(o)}
                          className="hover:underline flex items-center gap-1.5 text-stone-900 font-bold"
                          title="Click to inspect order items and dispatch notes"
                        >
                          <span>{o.order_number}</span>
                          <Eye className="w-3.5 h-3.5 text-stone-400" />
                        </button>
                        <span className="text-[10px] text-stone-400 block font-normal">
                          {formatDate(o.created_at)}
                        </span>
                      </td>

                      <td className="py-4 pr-3">
                        <span className="font-semibold text-stone-900 block">{o.customer_name}</span>
                        <a
                          href={`tel:${o.customer_phone}`}
                          className="text-stone-500 hover:text-stone-900 block"
                        >
                          {o.customer_phone}
                        </a>
                      </td>

                      <td className="py-4 pr-3">
                        <div className="flex items-center gap-1.5 font-semibold text-stone-800">
                          {isPickup ? <Store className="w-3.5 h-3.5 text-amber-700" /> : <Truck className="w-3.5 h-3.5 text-blue-700" />}
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
                          className={`border p-1.5 text-xs focus:outline-none font-mono font-semibold ${
                            o.order_status === 'ready_for_dispatch'
                              ? 'bg-sky-50 border-sky-300 text-sky-800'
                              : o.order_status === 'out_for_delivery'
                              ? 'bg-indigo-50 border-indigo-300 text-indigo-800'
                              : o.order_status === 'delivered' || o.order_status === 'picked_up'
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                              : 'bg-stone-50 border-stone-300 text-stone-800'
                          }`}
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

                      <td className="py-4 text-center">
                        <button
                          type="button"
                          onClick={() => setInspectOrder(o)}
                          className="px-2.5 py-1.5 border border-stone-200 text-stone-700 hover:bg-stone-900 hover:text-white transition-colors"
                          title="Inspect Order Details & Items"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect & Dispatch Order Modal */}
      {inspectOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-stone-300 max-w-2xl w-full p-6 sm:p-8 space-y-6 animate-in fade-in duration-200 my-8">
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-stone-400">
                  Fulfillment Inspection
                </span>
                <h2 className="text-xl font-serif font-bold text-stone-900">
                  {inspectOrder.order_number}
                </h2>
                <p className="text-xs text-stone-500">Placed {formatDate(inspectOrder.created_at)}</p>
              </div>
              <button
                type="button"
                onClick={() => setInspectOrder(null)}
                className="text-stone-400 hover:text-stone-900 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer & Fulfillment Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#FAF9F6] p-4 border border-stone-200 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-widest text-stone-400 block">Customer</span>
                <p className="font-bold text-stone-900">{inspectOrder.customer_name}</p>
                <p className="flex items-center gap-1.5 text-stone-700">
                  <Phone className="w-3.5 h-3.5" />
                  <a href={`tel:${inspectOrder.customer_phone}`} className="underline font-mono">
                    {inspectOrder.customer_phone}
                  </a>
                </p>
                {inspectOrder.customer_email && (
                  <p className="text-stone-500">{inspectOrder.customer_email}</p>
                )}
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-widest text-stone-400 block">Fulfillment Method</span>
                <div className="flex items-center gap-1.5 font-bold text-stone-900">
                  {inspectOrder.fulfillment_type === 'store_pickup' ? (
                    <>
                      <Store className="w-3.5 h-3.5" />
                      <span>Store Pickup (PIN: {inspectOrder.fulfillment?.pickup_reference_code || 'Pending'})</span>
                    </>
                  ) : (
                    <>
                      <Truck className="w-3.5 h-3.5" />
                      <span>Doorstep Delivery ({inspectOrder.fulfillment?.delivery_sub_city || 'Addis Ababa'})</span>
                    </>
                  )}
                </div>
                {inspectOrder.fulfillment_type === 'home_delivery' ? (
                  <p className="text-stone-600">
                    {inspectOrder.fulfillment?.delivery_address || 'No specific address'}
                  </p>
                ) : (
                  <p className="text-stone-600">
                    Location: {inspectOrder.fulfillment?.pickup_location_name || 'Flagship Store'}
                  </p>
                )}
                {inspectOrder.fulfillment?.delivery_instructions && (
                  <p className="text-stone-500 italic pt-1">
                    Note: &ldquo;{inspectOrder.fulfillment.delivery_instructions}&rdquo;
                  </p>
                )}
              </div>
            </div>

            {/* Ordered Pieces Breakdown */}
            <div className="space-y-3">
              <h3 className="text-xs uppercase tracking-widest text-stone-500 font-semibold">
                Ordered Pieces ({inspectOrder.items?.length || 0})
              </h3>
              <div className="border border-stone-200 divide-y divide-stone-100 max-h-60 overflow-y-auto">
                {inspectOrder.items?.map((item) => (
                  <div key={item.id} className="p-3 flex items-center justify-between text-xs hover:bg-stone-50">
                    <div>
                      <p className="font-bold text-stone-900">{item.product_name}</p>
                      <p className="text-[11px] text-stone-500 font-mono">
                        {item.size ? `Size: ${item.size} • ` : ''}
                        {item.color ? `Color: ${item.color} • ` : ''}
                        {item.sku ? `SKU: ${item.sku} • ` : ''}
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <span className="font-mono font-bold text-stone-900">
                      {formatETB(item.line_total_etb)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Dispatch Actions */}
            <div className="space-y-2 border-t border-stone-200 pt-4">
              <span className="text-[10px] uppercase tracking-widest text-stone-400 block font-semibold">
                Quick Dispatch Workflow
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleStatusChange(inspectOrder.id, 'ready_for_dispatch')}
                  className="px-3 py-1.5 bg-sky-100 border border-sky-300 text-sky-800 font-semibold hover:bg-sky-200 transition-colors"
                >
                  ✓ Mark Ready for Dispatch
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusChange(inspectOrder.id, 'out_for_delivery')}
                  className="px-3 py-1.5 bg-indigo-100 border border-indigo-300 text-indigo-800 font-semibold hover:bg-indigo-200 transition-colors"
                >
                  🚚 Out for Delivery
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusChange(inspectOrder.id, inspectOrder.fulfillment_type === 'store_pickup' ? 'picked_up' : 'delivered')}
                  className="px-3 py-1.5 bg-emerald-100 border border-emerald-300 text-emerald-800 font-semibold hover:bg-emerald-200 transition-colors"
                >
                  ✓ Mark {inspectOrder.fulfillment_type === 'store_pickup' ? 'Collected' : 'Delivered'}
                </button>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="flex justify-between items-center bg-[#FAF9F6] p-3 border border-stone-200">
              <div className="space-y-0.5 text-stone-500 text-[11px]">
                <p>Subtotal: {formatETB(inspectOrder.subtotal_etb)}</p>
                <p>Fulfillment Fee: {formatETB(inspectOrder.delivery_fee_etb)}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase tracking-wider text-stone-400 block">Total Payable</span>
                <span className="text-base font-bold text-stone-900">
                  {formatETB(inspectOrder.total_amount_etb)}
                </span>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between border-t border-stone-200 pt-4">
              <a
                href={`/order-confirmation/${inspectOrder.order_number}?token=${inspectOrder.tracking_token}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-xs text-stone-600 hover:text-stone-900 hover:underline"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Customer Digital Receipt</span>
              </a>

              <button
                type="button"
                onClick={() => setInspectOrder(null)}
                className="px-4 py-2 bg-stone-900 text-white font-semibold hover:bg-black transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

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
                  className="w-full border border-stone-300 p-2 font-bold font-mono"
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
                  className="w-full border border-stone-300 p-2 font-mono"
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
