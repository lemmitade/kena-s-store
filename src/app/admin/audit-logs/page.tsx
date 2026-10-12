// ============================================================================
// ADMIN AUDIT LOGS: /admin/audit-logs
// Immutable record of fee overrides, exports, status changes, and winner publications
// ============================================================================

import React from 'react';
import { getAuditLogs } from '@/lib/db/repository';
import { formatDate } from '@/lib/utils/format';
import { History, Shield } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminAuditLogsPage() {
  const logs = await getAuditLogs();

  return (
    <div className="space-y-6 font-mono text-xs">
      <div>
        <span className="text-xs uppercase tracking-widest text-stone-500">
          Security Trail
        </span>
        <h1 className="text-2xl sm:text-3xl font-serif font-medium text-stone-900 mt-1">
          System Audit Logs ({logs.length})
        </h1>
      </div>

      <div className="bg-white border border-[#E7E5E4] p-6">
        {logs.length === 0 ? (
          <div className="py-12 text-center text-stone-400">
            <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No audited administrative actions recorded yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-stone-200 text-stone-400 uppercase tracking-wider text-[11px]">
                  <th className="pb-3 font-normal">Timestamp</th>
                  <th className="pb-3 font-normal">Staff Member</th>
                  <th className="pb-3 font-normal">Action Performed</th>
                  <th className="pb-3 font-normal">Resource</th>
                  <th className="pb-3 font-normal text-right">Audit Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-stone-50/70">
                    <td className="py-3 text-stone-500">{formatDate(log.created_at)}</td>
                    <td className="py-3 font-bold text-stone-900">{log.staff_name || 'System Admin'}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 bg-stone-100 text-stone-800 uppercase font-semibold text-[10px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 text-stone-600">{log.resource_type}</td>
                    <td className="py-3 text-right text-stone-500 max-w-xs truncate">
                      {log.details ? JSON.stringify(log.details) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
