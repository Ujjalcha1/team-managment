import { NextRequest, NextResponse } from 'next/server';
import { protect } from '@/lib/auth';
import Employee from '@/lib/models/Employee';

export async function GET(req: NextRequest) {
  const auth = await protect(req);
  if (!auth.authenticated) {
    return auth.response!;
  }

  try {
    const stats = await Employee.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 }, active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } } } },
      { $sort: { count: -1 } },
    ]);

    const departments = stats.map((s) => ({
      name: s._id,
      count: s.count,
      active: s.active,
    }));

    return NextResponse.json({ success: true, data: { departments } });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Failed to fetch department stats', error: error.message }, { status: 500 });
  }
}
