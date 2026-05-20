import { NextRequest, NextResponse } from 'next/server';
import { protect } from '@/lib/auth';
import Employee from '@/lib/models/Employee';

export async function GET(req: NextRequest) {
  const auth = await protect(req);
  if (!auth.authenticated) {
    return auth.response!;
  }

  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const stats = await Employee.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const growth = stats.map((s) => ({
      month: months[s._id.month - 1],
      year: s._id.year,
      count: s.count,
    }));

    return NextResponse.json({ success: true, data: { growth } });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Failed to fetch growth stats', error: error.message }, { status: 500 });
  }
}
