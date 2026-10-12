// ============================================================================
// EXCEL CUSTOMER EXPORT (EXCELJS WITH FORMULA INJECTION PREVENTION)
// Preserves leading zeros on Ethiopian phone numbers, freezes headers, formats
// ============================================================================

import ExcelJS from 'exceljs';
import { Customer, Order } from '@/types';

/**
 * Sanitizes cell values against formula injection (CSV/Excel Formula Injection).
 * Any text starting with '=', '+', '-', '@', '\t', or '\r' has an apostrophe prepended.
 */
export function sanitizeCellValue(val: unknown): string | number | boolean | Date {
  if (val === null || val === undefined) return '';
  if (typeof val === 'number' || typeof val === 'boolean' || val instanceof Date) {
    return val;
  }
  const str = String(val);
  const dangerousPrefixes = ['=', '+', '-', '@', '\t', '\r'];
  if (dangerousPrefixes.some((p) => str.startsWith(p))) {
    return `'${str}`;
  }
  return str;
}

export interface CustomerExportData {
  customers: Customer[];
  orders?: Order[];
  filterLabel?: string;
  generatedByStaffName?: string;
}

export async function generateCustomerExcelWorkbook(data: CustomerExportData): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'YOUR BRAND E-Commerce Platform';
  workbook.lastModifiedBy = data.generatedByStaffName || 'Store Admin';
  workbook.created = new Date();
  workbook.modified = new Date();

  // 1. Customers Worksheet
  const sheet = workbook.addWorksheet('Customers', {
    views: [{ state: 'frozen', ySplit: 1 }],
  });

  sheet.columns = [
    { header: 'Customer ID', key: 'id', width: 38 },
    { header: 'Full Name', key: 'full_name', width: 24 },
    { header: 'Phone Number (Local)', key: 'phone_local', width: 18 },
    { header: 'Phone (Intl / Normalized)', key: 'phone_normalized', width: 22 },
    { header: 'Email', key: 'email', width: 28 },
    { header: 'Marketing Consent', key: 'marketing_consent', width: 18 },
    { header: 'Total Orders', key: 'total_orders', width: 14 },
    { header: 'Total Spent (ETB)', key: 'total_spent_etb', width: 18 },
    { header: 'Competitions Entered', key: 'competition_count', width: 20 },
    { header: 'First Seen', key: 'first_seen_at', width: 20 },
    { header: 'Last Activity', key: 'last_activity_at', width: 20 },
  ];

  // Header row styling: Bold, Slate-800 background, white text
  const headerRow = sheet.getRow(1);
  headerRow.height = 28;
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1F2937' }, // Dark charcoal
    };
    cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
  });

  // Populate Customer Rows
  data.customers.forEach((c) => {
    const row = sheet.addRow({
      id: sanitizeCellValue(c.id),
      full_name: sanitizeCellValue(c.full_name),
      // Store phone strictly as string to preserve leading zero e.g. "0911234567"
      phone_local: sanitizeCellValue(c.phone),
      phone_normalized: sanitizeCellValue(c.phone_normalized),
      email: sanitizeCellValue(c.email || '—'),
      marketing_consent: c.marketing_consent ? 'YES (Opted-in)' : 'NO',
      total_orders: c.total_orders,
      total_spent_etb: c.total_spent_etb,
      competition_count: c.competition_count,
      first_seen_at: c.first_seen_at ? new Date(c.first_seen_at).toLocaleDateString('en-GB') : '—',
      last_activity_at: c.last_activity_at ? new Date(c.last_activity_at).toLocaleDateString('en-GB') : '—',
    });

    // Formatting for specific columns
    row.getCell('total_orders').alignment = { horizontal: 'right' };
    row.getCell('total_spent_etb').alignment = { horizontal: 'right' };
    row.getCell('total_spent_etb').numFmt = '#,##0 "ETB"';
    row.getCell('competition_count').alignment = { horizontal: 'right' };
    row.getCell('phone_local').numFmt = '@'; // Force text format
    row.getCell('phone_normalized').numFmt = '@'; // Force text format
  });

  // Enable autofilter on customer headers
  sheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: sheet.columns.length },
  };

  // 2. Orders Summary Worksheet (if orders provided)
  if (data.orders && data.orders.length > 0) {
    const orderSheet = workbook.addWorksheet('Order History', {
      views: [{ state: 'frozen', ySplit: 1 }],
    });

    orderSheet.columns = [
      { header: 'Order Number', key: 'order_number', width: 20 },
      { header: 'Customer Name', key: 'customer_name', width: 24 },
      { header: 'Customer Phone', key: 'customer_phone', width: 18 },
      { header: 'Fulfillment Type', key: 'fulfillment_type', width: 18 },
      { header: 'Order Status', key: 'order_status', width: 18 },
      { header: 'Payment Method', key: 'payment_method', width: 18 },
      { header: 'Payment Status', key: 'payment_status', width: 16 },
      { header: 'Total (ETB)', key: 'total_amount_etb', width: 16 },
      { header: 'Date', key: 'created_at', width: 20 },
    ];

    const orderHeaderRow = orderSheet.getRow(1);
    orderHeaderRow.height = 28;
    orderHeaderRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF374151' },
      };
      cell.alignment = { vertical: 'middle', horizontal: 'left' };
    });

    data.orders.forEach((o) => {
      const oRow = orderSheet.addRow({
        order_number: sanitizeCellValue(o.order_number),
        customer_name: sanitizeCellValue(o.customer_name),
        customer_phone: sanitizeCellValue(o.customer_phone),
        fulfillment_type: o.fulfillment_type === 'home_delivery' ? 'Home Delivery' : 'Store Pickup',
        order_status: o.order_status,
        payment_method: o.payment_method,
        payment_status: o.payment_status,
        total_amount_etb: o.total_amount_etb,
        created_at: new Date(o.created_at).toLocaleDateString('en-GB'),
      });
      oRow.getCell('total_amount_etb').alignment = { horizontal: 'right' };
      oRow.getCell('total_amount_etb').numFmt = '#,##0 "ETB"';
      oRow.getCell('customer_phone').numFmt = '@';
    });

    orderSheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: orderSheet.columns.length },
    };
  }

  const arrayBuffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(arrayBuffer);
}
