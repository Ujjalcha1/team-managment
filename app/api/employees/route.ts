import { NextRequest, NextResponse } from 'next/server';
import { protect, requireAdmin } from '@/lib/auth';
import Employee from '@/lib/models/Employee';
import ActivityLog from '@/lib/models/ActivityLog';
import User from '@/lib/models/User'; // Explicitly import User so Mongoose registers it for population references

export async function GET(req: NextRequest) {
  const auth = await protect(req);
  if (!auth.authenticated) {
    return auth.response!;
  }

  try {
    const { searchParams } = req.nextUrl;
    const page = parseInt(searchParams.get('page') || '1') || 1;
    const limit = parseInt(searchParams.get('limit') || '10') || 10;
    const skip = (page - 1) * limit;
    const search = searchParams.get('search');
    const role = searchParams.get('role');
    const status = searchParams.get('status');
    const department = searchParams.get('department');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;

    const query: Record<string, any> = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
      ];
    }
    if (role) query.role = role;
    if (status) query.status = status;
    if (department) query.department = { $regex: department, $options: 'i' };

    const total = await Employee.countDocuments(query);
    const employees = await Employee.find(query)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'name email');

    return NextResponse.json({
      success: true,
      data: {
        employees,
        pagination: { total, page, limit, pages: Math.ceil(total / limit) },
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Failed to fetch employees', error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await protect(req);
  if (!auth.authenticated) {
    return auth.response!;
  }

  const adminAuth = requireAdmin(auth.user);
  if (!adminAuth.authorized) {
    return adminAuth.response!;
  }

  try {
    const body = await req.json();
    if (body.joinedDate === '') {
      delete body.joinedDate;
    }
    const employee = await Employee.create({ ...body, createdBy: auth.user!._id });

    await ActivityLog.create({
      action: 'employee_created',
      description: `${auth.user!.name} added ${employee.name} as a new employee`,
      entityType: 'employee',
      entityId: employee._id,
      entityName: employee.name,
      performedBy: auth.user!._id,
      performedByName: auth.user!.name || '',
    });

    return NextResponse.json({ success: true, message: 'Employee created successfully', data: { employee } }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Failed to create employee', error: error.message }, { status: 500 });
  }
}
