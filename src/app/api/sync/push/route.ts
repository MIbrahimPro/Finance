import { auth } from '@/lib/auth';
import { pushTransaction, pushLoan, pushDashboardLayout, deleteTransaction, deleteLoan } from '@/lib/server/actions';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { operation, tableName, recordData } = body;

    if (!operation || !tableName || !recordData) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const data = typeof recordData === 'string' ? JSON.parse(recordData) : recordData;

    switch (tableName) {
      case 'transactions':
        if (operation === 'delete') {
          await deleteTransaction(data.id);
        } else {
          await pushTransaction(data);
        }
        break;
      case 'loans':
        if (operation === 'delete') {
          await deleteLoan(data.id);
        } else {
          await pushLoan(data);
        }
        break;
      case 'dashboardLayout':
        await pushDashboardLayout(data);
        break;
      default:
        return NextResponse.json({ error: 'Unknown table' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Push failed' }, { status: 500 });
  }
}
