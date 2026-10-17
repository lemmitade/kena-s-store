// ============================================================================
// ADMIN AUTHENTICATION UTILITY (SESSION & CREDENTIALS VERIFICATION)
// ============================================================================

import { cookies } from 'next/headers';
import { getStoreSettings } from '@/lib/db/repository';

export const ADMIN_COOKIE_NAME = 'kena_admin_token';
const ADMIN_DEFAULT_EMAIL = 'admin@kenastore.et';
const ADMIN_DEFAULT_PASSWORD = 'admin123';

export async function getAdminSession(): Promise<{
  isAuthenticated: boolean;
  email: string | null;
}> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  if (!token) {
    return { isAuthenticated: false, email: null };
  }

  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [email, timestamp] = decoded.split(':');

    // 7-day session validity check
    const sessionTime = parseInt(timestamp, 10);
    const now = Date.now();
    if (isNaN(sessionTime) || now - sessionTime > 7 * 24 * 60 * 60 * 1000) {
      return { isAuthenticated: false, email: null };
    }

    return { isAuthenticated: true, email: email || ADMIN_DEFAULT_EMAIL };
  } catch {
    return { isAuthenticated: false, email: null };
  }
}

export async function verifyAdminCredentials(
  email: string,
  password: string
): Promise<boolean> {
  const settings = await getStoreSettings();
  const configuredEmail = settings.admin_credentials?.email || ADMIN_DEFAULT_EMAIL;
  const configuredPassword = settings.admin_credentials?.password || ADMIN_DEFAULT_PASSWORD;

  const emailMatch =
    email.trim().toLowerCase() === configuredEmail.trim().toLowerCase() ||
    (!settings.admin_credentials?.email && email.trim().toLowerCase() === 'admin@kenasstore.com');
  const passwordMatch = password === configuredPassword;

  return emailMatch && passwordMatch;
}

export async function setAdminSession(email: string): Promise<void> {
  const cookieStore = await cookies();
  const token = Buffer.from(`${email.trim().toLowerCase()}:${Date.now()}`).toString('base64');

  cookieStore.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
}

export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
}
