// ============================================================================
// ADMIN CATALOG SECTIONS: /admin/catalog/sections
// ============================================================================

import React from 'react';
import { getSections } from '@/lib/db/repository';
import { SectionManager } from '@/components/admin/SectionManager';

export const dynamic = 'force-dynamic';

export default async function AdminSectionsPage() {
  const sections = await getSections(true);

  return (
    <div className="space-y-6 font-mono">
      <div>
        <span className="text-xs uppercase tracking-widest text-stone-500">
          Dynamic Architecture
        </span>
        <h1 className="text-2xl sm:text-3xl font-serif font-medium text-stone-900 mt-1">
          Store Sections Management
        </h1>
      </div>

      <SectionManager sections={sections} />
    </div>
  );
}
