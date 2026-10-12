'use client';

// ============================================================================
// ADMIN PICKUP LOCATION MANAGER COMPONENT
// Create and manage boutique pickup locations in Addis Ababa
// ============================================================================

import React, { useState } from 'react';
import { PickupLocation } from '@/types';
import { savePickupLocationAction } from '@/app/actions/settings';
import { Store, Plus, Check } from 'lucide-react';

interface PickupLocationManagerProps {
  locations: PickupLocation[];
}

export function PickupLocationManager({ locations }: PickupLocationManagerProps) {
  const [name, setName] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [contactPhone, setContactPhone] = useState('+251 91 123 4567');
  const [openingHours, setOpeningHours] = useState('Mon - Sat: 9:00 AM - 8:00 PM');
  const [instructions, setInstructions] = useState('Present your Pickup PIN code to store staff.');

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !addressLine.trim()) return;

    setLoading(true);
    const res = await savePickupLocationAction({
      name: name.trim(),
      address_line: addressLine.trim(),
      contact_phone: contactPhone.trim(),
      opening_hours: openingHours.trim(),
      instructions: instructions.trim() || undefined,
    });

    setLoading(false);
    if (res.success) {
      setName('');
      setAddressLine('');
      setMsg('Pickup boutique location saved!');
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

      {/* Add New Location Card */}
      <div className="bg-white border border-[#E7E5E4] p-6 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-900 border-b border-stone-200 pb-2">
          Add New Store Pickup Boutique
        </h2>

        <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="uppercase text-stone-500 block">Location Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Piazza Heritage Boutique"
              className="w-full border border-stone-300 p-2.5 bg-[#FAF9F6] font-sans"
            />
          </div>

          <div className="space-y-1">
            <label className="uppercase text-stone-500 block">Phone *</label>
            <input
              type="text"
              required
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className="w-full border border-stone-300 p-2.5 bg-[#FAF9F6]"
            />
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label className="uppercase text-stone-500 block">Full Physical Address *</label>
            <input
              type="text"
              required
              value={addressLine}
              onChange={(e) => setAddressLine(e.target.value)}
              placeholder="Street name, landmark, Addis Ababa..."
              className="w-full border border-stone-300 p-2.5 bg-[#FAF9F6] font-sans"
            />
          </div>

          <div className="space-y-1">
            <label className="uppercase text-stone-500 block">Opening Hours *</label>
            <input
              type="text"
              required
              value={openingHours}
              onChange={(e) => setOpeningHours(e.target.value)}
              className="w-full border border-stone-300 p-2.5 bg-[#FAF9F6]"
            />
          </div>

          <div className="space-y-1">
            <label className="uppercase text-stone-500 block">Collection Instructions</label>
            <input
              type="text"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full border border-stone-300 p-2.5 bg-[#FAF9F6] font-sans"
            />
          </div>

          <div className="sm:col-span-2 flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-[#121212] text-white px-6 py-2.5 uppercase tracking-wider font-semibold hover:bg-stone-800 disabled:opacity-50"
            >
              {loading ? 'Creating...' : '+ Add Pickup Point'}
            </button>
          </div>
        </form>
      </div>

      {/* Locations Table */}
      <div className="bg-white border border-[#E7E5E4] p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-900 border-b border-stone-200 pb-3 mb-4">
          Current Pickup Boutiques ({locations.length})
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-stone-200 text-stone-400 uppercase tracking-wider text-[11px]">
                <th className="pb-3 font-normal">Boutique Name</th>
                <th className="pb-3 font-normal">Address</th>
                <th className="pb-3 font-normal">Opening Hours</th>
                <th className="pb-3 font-normal">Contact</th>
                <th className="pb-3 font-normal text-right">Fee</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {locations.map((l) => (
                <tr key={l.id} className="hover:bg-stone-50/70">
                  <td className="py-3 font-bold text-stone-900 font-sans text-sm">{l.name}</td>
                  <td className="py-3 text-stone-600 font-sans max-w-xs truncate">{l.address_line}</td>
                  <td className="py-3 text-stone-500">{l.opening_hours}</td>
                  <td className="py-3 text-stone-500">{l.contact_phone}</td>
                  <td className="py-3 text-right font-bold text-emerald-700">FREE</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
