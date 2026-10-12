import { NextRequest, NextResponse } from 'next/server';
import { getAllCustomers, getAllOrders, db } from '@/lib/db/repository';
import { generateCustomerExcelWorkbook } from '@/lib/excel/customer-export';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'all';

    let customers = await getAllCustomers();
    const orders = await getAllOrders();

    if (filter === 'with_orders') {
      customers = customers.filter((c) => c.total_orders > 0);
    } else if (filter === 'marketing_consent') {
      customers = customers.filter((c) => c.marketing_consent);
    } else if (filter === 'competition_active') {
      customers = customers.filter((c) => c.competition_count > 0);
    }

    // Record audit log for export
    db.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      staff_name: 'Admin Staff',
      action: 'excel_customer_export',
      resource_type: 'customers',
      details: { filter, count: customers.length },
      created_at: new Date().toISOString(),
    });

    const buffer = await generateCustomerExcelWorkbook({
      customers,
      orders,
      filterLabel: filter,
      generatedByStaffName: 'Authorized Admin',
    });

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="customers_export_${new Date().toISOString().slice(0, 10)}.xlsx"`,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: `Excel generation failed: ${(err as Error).message}` },
      { status: 500 }
    );
  }
}
