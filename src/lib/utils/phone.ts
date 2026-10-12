// ============================================================================
// ETHIOPIAN PHONE NUMBER NORMALIZER & VALIDATOR
// Handles Ethio Telecom (09...) and Safaricom Ethiopia (07...)
// ============================================================================

export interface PhoneValidationResult {
  isValid: boolean;
  normalized: string; // e.g. "+251911234567"
  localFormat: string; // e.g. "0911234567"
  displayFormat: string; // e.g. "0911 234 567"
  carrier?: 'Ethio Telecom' | 'Safaricom Ethiopia';
  error?: string;
}

export function normalizeEthiopianPhone(input: string): PhoneValidationResult {
  if (!input || typeof input !== 'string') {
    return {
      isValid: false,
      normalized: '',
      localFormat: '',
      displayFormat: '',
      error: 'Phone number is required.',
    };
  }

  // Strip spaces, dashes, parentheses, dots
  let cleaned = input.trim().replace(/[\s\-\(\)\.]/g, '');

  // Handle leading "+" or "00"
  if (cleaned.startsWith('00251')) {
    cleaned = '+251' + cleaned.slice(5);
  }

  let nationalNumber = '';

  if (cleaned.startsWith('+251')) {
    nationalNumber = cleaned.slice(4);
  } else if (cleaned.startsWith('251')) {
    nationalNumber = cleaned.slice(3);
  } else if (cleaned.startsWith('0')) {
    nationalNumber = cleaned.slice(1);
  } else {
    nationalNumber = cleaned;
  }

  // Validate that nationalNumber starts with 9 (Ethio Telecom) or 7 (Safaricom)
  // and has exactly 9 digits total (e.g. 911234567 or 712345678)
  const isMatch = /^[79]\d{8}$/.test(nationalNumber);

  if (!isMatch) {
    return {
      isValid: false,
      normalized: cleaned,
      localFormat: cleaned,
      displayFormat: cleaned,
      error: 'Please enter a valid 10-digit Ethiopian mobile number (09... or 07...).',
    };
  }

  const carrier = nationalNumber.startsWith('9') ? 'Ethio Telecom' : 'Safaricom Ethiopia';
  const normalized = `+251${nationalNumber}`;
  const localFormat = `0${nationalNumber}`;
  const displayFormat = `0${nationalNumber.slice(0, 3)} ${nationalNumber.slice(3, 6)} ${nationalNumber.slice(6)}`;

  return {
    isValid: true,
    normalized,
    localFormat,
    displayFormat,
    carrier,
  };
}
