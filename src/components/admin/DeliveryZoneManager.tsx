'use client';

// ============================================================================
// ADMIN DELIVERY ZONE MANAGER COMPONENT
// Flat-rate delivery, location matching, fee overrides, free delivery thresholds
// ============================================================================

import React, { useState } from 'react';
import { DeliveryZone } from '@/types';
import { formatETB } from '@/lib/utils/format';
import { saveDeliveryZoneAction } from '@/app/actions/settings';
import { Plus, Truck, Check } from 'lucide-react';

interface DeliveryZoneManagerProps {
  zones: DeliveryZone[];
}

export function DeliveryZoneManager({ zones }: DeliveryZoneManagerProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [feeETB, setFeeETB] = useState<number>(200);
  const [freeThresholdETB, setFreeThresholdETB] = useState<number | undefined>(2500);
  const [estTime, setEstTime] = useState('24-48 Hours');

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    const res = await saveDeliveryZoneAction({
      name: name.trim(),
      description: description.trim() || undefined,
      fee_etb: feeETB,
      free_delivery_threshold_etb: freeThresholdETB,
      estimated_delivery_time: estTime,
    });

    setLoading(false);
    if (res.success) {
      setName('');
      setDescription('');
      setMsg('Delivery zone created and active!');
    }
  };

  return (
    <div className="space-y-8 font-mono text-xs">
      {msg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{msg}</span>
        </div>
      )}

      {/* Add Zone Card */}
      <div className="bg-white border border-[#E7E5E4] p-6 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-900 border-b border-stone-200 pb-2">
          Add New Delivery Zone
        </h2>

        <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="uppercase text-stone-500 block">Zone Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Addis Ababa Sub-City Zone"
              className="w-full border border-stone-300 p-2.5 bg-[#FAF9F6] font-sans"
            />
          </div>

          <div className="space-y-1">
            <label className="uppercase text-stone-500 block">Base Delivery Fee (ETB) *</label>
            <input
              type="number"
              required
              min={0}
              value={feeETB}
              onChange={(e) => setFeeETB(parseInt(e.target.value, 10) || 0)}
              className="w-full border border-stone-300 p-2.5 bg-[#FAF9F6] font-bold"
            />
          </div>

          <div className="space-y-1">
            <label className="uppercase text-stone-500 block">Free Delivery Threshold (ETB)</label>
            <input
              type="number"
              value={freeThresholdETB || ''}
              onChange={(e) =>
                setFreeThresholdETB(e.target.value ? parseInt(e.target.value, 10) : undefined)
              }
              placeholder="e.g. 2500"
              className="w-full border border-stone-300 p-2.5 bg-[#FAF9F6]"
            />
          </div>

          <div className="sm:col-span-2 space-y-1">
            <label className="uppercase text-stone-500 block">Description / Sub-Cities Covered</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Bole, Kirkos, Lideta, Kazanchis..."
              className="w-full border border-stone-300 p-2.5 bg-[#FAF9F6] font-sans"
            />
          </div>

          <div className="space-y-1">
            <label className="uppercase text-stone-500 block">Estimated Time Window</label>
            <input
              type="text"
              value={estTime}
              onChange={(e) => setEstTime(e.target.value)}
              className="w-full border border-stone-300 p-2.5 bg-[#FAF9F6]"
            />
          </div>

          <div className="sm:col-span-3 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-[#121212] text-white px-6 py-2.5 uppercase tracking-wider font-semibold hover:bg-stone-800 disabled:opacity-50"
            >
              {loading ? 'Creating...' : '+ Create Delivery Zone'}
            </button>
          </div>
        </form>
      </div>

      {/* Zones Table */}
      <div className="bg-white border border-[#E7E5E4] p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-900 border-b border-stone-200 pb-3 mb-4">
          Configured Delivery Zones ({zones.length})
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-stone-200 text-stone-400 uppercase tracking-wider text-[11px]">
                <th className="pb-3 font-normal">Zone Name</th>
                <th className="pb-3 font-normal">Locations Covered</th>
                <th className="pb-3 font-normal">Base Fee (ETB)</th>
                <th className="pb-3 font-normal">Free Threshold</th>
                <th className="pb-3 font-normal">Estimated Window</th>
                <th className="pb-3 font-normal text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {zones.map((z) => (
                <tr key={z.id} className="hover:bg-stone-50/70">
                  <td className="py-3 font-bold text-stone-900 font-sans text-sm">{z.name}</td>
                  <td className="py-3 text-stone-600 font-sans max-w-xs truncate">{z.description}</td>
                  <td className="py-3 font-bold text-stone-900">{formatETB(z.fee_etb)}</td>
                  <td className="py-3 text-emerald-700 font-semibold">
                    {z.free_delivery_threshold_etb ? formatETB(z.free_delivery_threshold_etb) : 'None'}
                  </td>
                  <td className="py-3 text-stone-500">{z.estimated_delivery_time}</td>
                  <td className="py-3 text-right">
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] uppercase font-bold">
                      Active
                    </span>
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
