'use client';

// ============================================================================
// ADMIN LOGIN FORM INTERACTION
// ============================================================================

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginAdminAction } from '@/app/actions/auth';
import { Lock, Mail, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';

export function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@kenastore.et');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await loginAdminAction({ email, password });
      if (!res.success) {
        setLoading(false);
        setErrorMsg(res.error || 'Authentication failed.');
      } else {
        router.push('/admin/dashboard');
        router.refresh();
      }
    } catch (err) {
      setLoading(false);
      setErrorMsg(`Server error: ${(err as Error).message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-xs font-mono">
      {errorMsg && (
        <div className="p-3.5 bg-rose-950/40 border border-rose-800 text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Default credentials banner */}
      <div className="bg-stone-900 border border-stone-800 p-3 text-[11px] text-stone-400 space-y-1">
        <span className="text-stone-300 font-semibold block uppercase tracking-wider text-[10px]">
          Demo Admin Credentials:
        </span>
        <div className="flex justify-between">
          <span>Email:</span>
          <code className="text-stone-200">admin@kenastore.et</code>
        </div>
        <div className="flex justify-between">
          <span>Password:</span>
          <code className="text-stone-200">admin123</code>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="uppercase text-stone-400 block tracking-wider text-[11px]">
          Staff Email Address *
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-500">
            <Mail className="w-4 h-4" />
          </div>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@kenastore.et"
            className="w-full bg-[#121212] border border-stone-700 focus:border-white px-4 py-3 pl-10 text-white placeholder-stone-600 focus:outline-none transition-colors"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="uppercase text-stone-400 block tracking-wider text-[11px]">
          Password *
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-500">
            <Lock className="w-4 h-4" />
          </div>
          <input
            type={showPassword ? 'text' : 'password'}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full bg-[#121212] border border-stone-700 focus:border-white px-4 py-3 pl-10 pr-10 text-white placeholder-stone-600 focus:outline-none transition-colors"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-500 hover:text-stone-300"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-white text-black py-3.5 px-4 uppercase tracking-widest font-semibold hover:bg-stone-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
      </button>
    </form>
  );
}
