// ============================================================================
// ADMIN CUSTOMER CRM: /admin/customers
// Customer registry, normalized phone numbers, consent tags, and ExcelJS exports
// ============================================================================

import React from 'react';
import Link from 'next/link';
import { getAllCustomers } from '@/lib/db/repository';
import { formatETB, formatDate } from '@/lib/utils/format';
import { Download, Users, Mail, Phone, CheckCircle, XCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface CustomersPageProps {
  searchParams: Promise<{
    filter?: string;
  }>;
}

export default async function AdminCustomersPage({ searchParams }: CustomersPageProps) {
  const { filter } = await searchParams;
  let customers = await getAllCustomers();

  if (filter === 'marketing') {
    customers = customers.filter((c) => c.marketing_consent);
  } else if (filter === 'ordered') {
    customers = customers.filter((c) => c.total_orders > 0);
  }

  const exportUrl = `/api/export/customers?filter=${
    filter === 'marketing'
      ? 'marketing_consent'
      : filter === 'ordered'
      ? 'with_orders'
      : 'all'
  }`;

  return (
    <div className="space-y-8 font-mono">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-stone-500">
            Client Relations (CRM)
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-medium text-stone-900 mt-1">
            Customer Directory ({customers.length})
          </h1>
        </div>

        {/* Download Excel Button */}
        <a
          href={exportUrl}
          className="bg-emerald-800 text-white px-5 py-3 text-xs uppercase tracking-wider font-semibold hover:bg-emerald-900 transition-colors inline-flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          <span>Export Excel (.xlsx)</span>
        </a>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 text-xs">
        <Link
          href="/admin/customers"
          className={`px-3 py-2 border transition-colors ${
            !filter ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-600 border-stone-300'
          }`}
        >
          All Profiles
        </Link>
        <Link
          href="/admin/customers?filter=ordered"
          className={`px-3 py-2 border transition-colors ${
            filter === 'ordered'
              ? 'bg-stone-900 text-white border-stone-900'
              : 'bg-white text-stone-600 border-stone-300'
          }`}
        >
          Active Buyers
        </Link>
        <Link
          href="/admin/customers?filter=marketing"
          className={`px-3 py-2 border transition-colors ${
            filter === 'marketing'
              ? 'bg-stone-900 text-white border-stone-900'
              : 'bg-white text-stone-600 border-stone-300'
          }`}
        >
          Marketing Opted-In
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#E7E5E4] p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-200 text-stone-400 uppercase tracking-wider text-[11px]">
                <th className="pb-3 font-normal">Customer Name</th>
                <th className="pb-3 font-normal">Phone (Local / Int'l)</th>
                <th className="pb-3 font-normal">Email</th>
                <th className="pb-3 font-normal">Orders</th>
                <th className="pb-3 font-normal">Total Spend</th>
                <th className="pb-3 font-normal">Marketing Consent</th>
                <th className="pb-3 font-normal text-right">First Seen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-stone-50/70">
                  <td className="py-3.5 font-bold text-stone-900 font-sans text-sm">
                    {c.full_name}
                  </td>
                  <td className="py-3.5 font-mono">
                    <span className="text-stone-900 block font-semibold">{c.phone}</span>
                    <span className="text-[10px] text-stone-400 block">{c.phone_normalized}</span>
                  </td>
                  <td className="py-3.5 text-stone-600 font-sans">{c.email || '—'}</td>
                  <td className="py-3.5 font-semibold text-stone-900">{c.total_orders}</td>
                  <td className="py-3.5 font-bold text-stone-900">{formatETB(c.total_spent_etb)}</td>
                  <td className="py-3.5">
                    {c.marketing_consent ? (
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] uppercase font-bold inline-flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        <span>Opted In</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-stone-100 text-stone-400 text-[10px] uppercase font-medium">
                        No Consent
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 text-right text-stone-400 text-[11px]">
                    {formatDate(c.first_seen_at)}
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
