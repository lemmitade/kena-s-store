'use client';

// ============================================================================
// ADMIN SECURITY FORM: UPDATE EMAIL & PASSWORD
// ============================================================================

import React, { useState } from 'react';
import { updateAdminCredentialsAction } from '@/app/actions/auth';
import { Check, AlertCircle, Lock, Mail, Key } from 'lucide-react';

interface AdminSecurityFormProps {
  initialEmail: string;
}

export function AdminSecurityForm({ initialEmail }: AdminSecurityFormProps) {
  const [email, setEmail] = useState(initialEmail);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg('');
    setErrorMsg('');

    if (newPassword && newPassword !== confirmPassword) {
      setErrorMsg('New password and confirmation do not match.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setErrorMsg('Please enter a password with at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      const res = await updateAdminCredentialsAction({
        email: email.trim(),
        password: newPassword,
      });

      setLoading(false);
      if (res.success) {
        setMsg('Admin login credentials updated successfully! Use these next time you sign in.');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setErrorMsg(res.error || 'Failed to update credentials.');
      }
    } catch (err) {
      setLoading(false);
      setErrorMsg(`Server error: ${(err as Error).message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-[#E7E5E4] p-6 sm:p-8 space-y-6 text-xs font-mono">
      {msg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2">
          <Check className="w-4 h-4 flex-shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="uppercase text-stone-500 block">Dashboard Admin Email *</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-stone-300 p-3 pl-10 bg-[#FAF9F6] text-sm focus:outline-none focus:border-stone-900"
            />
          </div>
          <span className="text-[10px] text-stone-400">
            Used as the login username across staff sessions.
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="space-y-1.5">
            <label className="uppercase text-stone-500 block">New Password *</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                <Key className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full border border-stone-300 p-3 pl-10 bg-[#FAF9F6] text-sm focus:outline-none focus:border-stone-900"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="uppercase text-stone-500 block">Confirm New Password *</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                className="w-full border border-stone-300 p-3 pl-10 bg-[#FAF9F6] text-sm focus:outline-none focus:border-stone-900"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={loading}
          className="bg-[#121212] text-white px-8 py-3.5 uppercase tracking-widest font-semibold hover:bg-stone-800 transition-colors disabled:opacity-50"
        >
          {loading ? 'Updating Credentials...' : 'Save Security Credentials'}
        </button>
      </div>
    </form>
  );
}
