// ============================================================================
// ADMIN STAFF ROLES & RBAC: /admin/staff
// Role-based access control matrix and permission boundaries
// ============================================================================

import React from 'react';
import { ShieldCheck, Lock, UserCheck } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function AdminStaffPage() {
  const roles = [
    {
      role: 'Super Admin / Owner',
      description: 'Complete unrestricted access across financials, payment keys, competitions, and exports.',
      access: ['All Modules', 'Customer Excel Export', 'Payment API Keys', 'Publish Winners', 'Staff Roles'],
      color: 'bg-stone-900 text-white',
    },
    {
      role: 'Product Manager',
      description: 'Catalog management, inventory adjustments, sections, categories, and imagery.',
      access: ['Products & Variants', 'Inventory Matrix', 'Sections & Categories'],
      color: 'bg-stone-100 text-stone-800',
    },
    {
      role: 'Order & Fulfillment Manager',
      description: 'Dispatch operations, store pickup PIN verification, order lifecycle, delivery fee overrides.',
      access: ['Orders', 'Status Transitions', 'Audited Fee Overrides', 'Store Pickup PINs'],
      color: 'bg-stone-100 text-stone-800',
    },
    {
      role: 'Read-Only Reporting Analyst',
      description: 'Inspection of anonymized metrics and aggregate volume without personal data exports.',
      access: ['Dashboard Overview', 'Sales Reports'],
      color: 'bg-stone-100 text-stone-800',
    },
  ];

  return (
    <div className="space-y-8 font-mono text-xs">
      <div>
        <span className="text-xs uppercase tracking-widest text-stone-500">
          Access Governance
        </span>
        <h1 className="text-2xl sm:text-3xl font-serif font-medium text-stone-900 mt-1">
          Staff Roles &amp; Role-Based Access Control (RBAC)
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {roles.map((r) => (
          <div key={r.role} className="bg-white border border-[#E7E5E4] p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h2 className="font-serif text-lg font-medium text-stone-900">{r.role}</h2>
              <span className={`px-2.5 py-0.5 uppercase text-[10px] font-bold ${r.color}`}>
                Active Role
              </span>
            </div>
            <p className="text-stone-600 font-sans">{r.description}</p>
            <div className="space-y-1 pt-2">
              <span className="text-[10px] uppercase text-stone-400 block">Permitted Permissions:</span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {r.access.map((perm) => (
                  <span
                    key={perm}
                    className="px-2 py-0.5 bg-stone-50 border border-stone-200 text-stone-800 text-[11px]"
                  >
                    ✓ {perm}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
