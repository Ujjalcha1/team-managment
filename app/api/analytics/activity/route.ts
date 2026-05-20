import { NextRequest, NextResponse } from 'next/server';
import { protect } from '@/lib/auth';
import ActivityLog from '@/lib/models/ActivityLog';

export async function GET(req: NextRequest) {
  const auth = await protect(req);
  if (!auth.authenticated) {
    return auth.response!;
  }

  try {
    const { searchParams } = req.nextUrl;
    const limit = parseInt(searchParams.get('limit') || '10') || 10;

    const activities = await ActivityLog.find()
      .sort({ createdAt: -1 })
      .limit(limit);

    return NextResponse.json({ success: true, data: { activities } });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Failed to fetch activity', error: error.message }, { status: 500 });
  }
}
