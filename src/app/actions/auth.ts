'use server';

// ============================================================================
// SERVER ACTIONS: ADMIN LOGIN, LOGOUT & SECURITY CREDENTIALS
// ============================================================================

import {
  verifyAdminCredentials,
  setAdminSession,
  clearAdminSession,
} from '@/lib/auth/admin';
import { updateStoreSettings, getStoreSettings } from '@/lib/db/repository';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function loginAdminAction(formData: {
  email: string;
  password: string;
}) {
  try {
    const isValid = await verifyAdminCredentials(formData.email, formData.password);
    if (!isValid) {
      return {
        success: false,
        error: 'Invalid email or password. Default is admin@kenastore.et / admin123.',
      };
    }

    await setAdminSession(formData.email);
    return { success: true };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

export async function logoutAdminAction() {
  await clearAdminSession();
  redirect('/admin/login');
}

export async function updateAdminCredentialsAction(data: {
  email: string;
  password: string;
}) {
  try {
    if (!data.email || !data.email.includes('@')) {
      return { success: false, error: 'Please enter a valid admin email.' };
    }
    if (!data.password || data.password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    await updateStoreSettings({
      admin_credentials: {
        email: data.email.trim(),
        password: data.password,
      },
    });

    await setAdminSession(data.email.trim());
    revalidatePath('/admin');
    return { success: true };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}
