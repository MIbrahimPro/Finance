import { auth } from '@/lib/auth';
import { pullChanges } from '@/lib/server/actions';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(req.url);
  const since = parseInt(url.searchParams.get('since') ?? '0', 10);

  try {
    const data = await pullChanges(since);
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
  }
}
