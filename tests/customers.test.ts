// ============================================================================
// CUSTOMERS & EXCEL SANITIZATION AUTOMATED TESTS
// ============================================================================

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeEthiopianPhone } from '../src/lib/utils/phone';
import { sanitizeCellValue } from '../src/lib/excel/customer-export';

describe('Customer Normalization & Excel Injection Safeguards', () => {
  test('Correctly normalizes Ethio Telecom mobile numbers (09...)', () => {
    const raw = '0911 234 567';
    const res = normalizeEthiopianPhone(raw);

    assert.equal(res.isValid, true);
    assert.equal(res.normalized, '+251911234567');
    assert.equal(res.localFormat, '0911234567');
    assert.equal(res.carrier, 'Ethio Telecom');
  });

  test('Correctly normalizes Safaricom Ethiopia mobile numbers (07...)', () => {
    const raw = '+251 71 234 5678';
    const res = normalizeEthiopianPhone(raw);

    assert.equal(res.isValid, true);
    assert.equal(res.normalized, '+251712345678');
    assert.equal(res.localFormat, '0712345678');
    assert.equal(res.carrier, 'Safaricom Ethiopia');
  });

  test('Rejects invalid phone numbers with wrong digit count or prefix', () => {
    const res1 = normalizeEthiopianPhone('0911'); // Too short
    assert.equal(res1.isValid, false);

    const res2 = normalizeEthiopianPhone('0811234567'); // Invalid carrier prefix 08
    assert.equal(res2.isValid, false);
  });

  test('Preserves leading zero when formatted as local text', () => {
    const res = normalizeEthiopianPhone('0911234567');
    assert.equal(res.localFormat.startsWith('0'), true);
  });

  test('Sanitizes dangerous spreadsheet formula injection prefixes (=, +, -, @)', () => {
    // Formula starting with equals sign
    const valEquals = '=SUM(1+2)';
    assert.equal(sanitizeCellValue(valEquals), "'=SUM(1+2)");

    // Formula starting with plus sign
    const valPlus = '+123456';
    assert.equal(sanitizeCellValue(valPlus), "'+123456");

    // Formula starting with minus sign
    const valMinus = '-2+5';
    assert.equal(sanitizeCellValue(valMinus), "'-2+5");

    // Command starting with @
    const valAt = '@cmd|something';
    assert.equal(sanitizeCellValue(valAt), "'@cmd|something");

    // Safe regular names are left unaltered
    const valSafe = 'Abebe Kebede';
    assert.equal(sanitizeCellValue(valSafe), 'Abebe Kebede');
  });
});
