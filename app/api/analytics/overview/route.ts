import { NextRequest, NextResponse } from 'next/server';
import { protect } from '@/lib/auth';
import Employee from '@/lib/models/Employee';

export async function GET(req: NextRequest) {
  const auth = await protect(req);
  if (!auth.authenticated) {
    return auth.response!;
  }

  try {
    const totalEmployees = await Employee.countDocuments();
    const activeEmployees = await Employee.countDocuments({ status: 'active' });
    const inactiveEmployees = await Employee.countDocuments({ status: 'inactive' });
    const onLeave = await Employee.countDocuments({ status: 'on-leave' });

    const departments = await Employee.distinct('department');
    const totalDepartments = departments.length;

    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);
    const newThisMonth = await Employee.countDocuments({ createdAt: { $gte: thisMonth } });

    const lastMonth = new Date(thisMonth);
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const newLastMonth = await Employee.countDocuments({ createdAt: { $gte: lastMonth, $lt: thisMonth } });

    const growthRate = newLastMonth > 0 ? Math.round(((newThisMonth - newLastMonth) / newLastMonth) * 100) : 0;

    return NextResponse.json({
      success: true,
      data: { totalEmployees, activeEmployees, inactiveEmployees, onLeave, totalDepartments, newThisMonth, growthRate },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Failed to fetch overview', error: error.message }, { status: 500 });
  }
}
