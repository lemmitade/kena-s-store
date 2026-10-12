// ============================================================================
// FORMATTING & ID GENERATION UTILITIES
// ============================================================================

export function formatETB(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '0 ETB';
  }
  return `${new Intl.NumberFormat('en-ET', {
    maximumFractionDigits: 0,
  }).format(amount)} ETB`;
}

export function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(100000 + Math.random() * 900000);
  return `ORD-${year}-${random}`;
}

export function generatePickupCode(): string {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const char = letters[Math.floor(Math.random() * letters.length)];
  const random = Math.floor(1000 + Math.random() * 9000);
  return `PK-${char}${random}`;
}

export function generateTrackingToken(): string {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
  let token = '';
  for (let i = 0; i < 24; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

export function maskPhone(phone: string): string {
  if (!phone) return '';
  const cleaned = phone.replace(/\s+/g, '');
  if (cleaned.length < 7) return phone;
  return `${cleaned.slice(0, 4)} **** ${cleaned.slice(-2)}`;
}

export function formatDate(isoString: string): string {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return isoString;
  }
}
