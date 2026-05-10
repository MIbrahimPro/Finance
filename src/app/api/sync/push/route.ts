import { auth } from '@/lib/auth';
import { pushRecord } from '@/lib/server/actions';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { operation, tableName, recordData } = body;
    if (!operation || !tableName || !recordData) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }
    await pushRecord(operation, tableName, recordData);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Push failed' }, { status: 500 });
  }
}
