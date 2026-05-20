import { NextRequest, NextResponse } from 'next/server';
import { protect, requireAdmin } from '@/lib/auth';
import Employee from '@/lib/models/Employee';
import ActivityLog from '@/lib/models/ActivityLog';
import User from '@/lib/models/User';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await protect(req);
  if (!auth.authenticated) {
    return auth.response!;
  }

  try {
    const { id } = await params;
    const employee = await Employee.findById(id).populate('createdBy', 'name email');
    if (!employee) {
      return NextResponse.json({ success: false, message: 'Employee not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: { employee } });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Failed to fetch employee', error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await protect(req);
  if (!auth.authenticated) {
    return auth.response!;
  }

  const adminAuth = requireAdmin(auth.user);
  if (!adminAuth.authorized) {
    return adminAuth.response!;
  }

  try {
    const { id } = await params;
    const body = await req.json();
    if (body.joinedDate === '') {
      delete body.joinedDate;
    }
    const employee = await Employee.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    if (!employee) {
      return NextResponse.json({ success: false, message: 'Employee not found' }, { status: 404 });
    }

    await ActivityLog.create({
      action: 'employee_updated',
      description: `${auth.user!.name} updated ${employee.name}'s profile`,
      entityType: 'employee',
      entityId: employee._id,
      entityName: employee.name,
      performedBy: auth.user!._id,
      performedByName: auth.user!.name || '',
    });

    return NextResponse.json({ success: true, message: 'Employee updated successfully', data: { employee } });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Failed to update employee', error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await protect(req);
  if (!auth.authenticated) {
    return auth.response!;
  }

  const adminAuth = requireAdmin(auth.user);
  if (!adminAuth.authorized) {
    return adminAuth.response!;
  }

  try {
    const { id } = await params;
    const employee = await Employee.findByIdAndDelete(id);
    if (!employee) {
      return NextResponse.json({ success: false, message: 'Employee not found' }, { status: 404 });
    }

    await ActivityLog.create({
      action: 'employee_deleted',
      description: `${auth.user!.name} removed ${employee.name} from the team`,
      entityType: 'employee',
      entityId: employee._id,
      entityName: employee.name,
      performedBy: auth.user!._id,
      performedByName: auth.user!.name || '',
    });

    return NextResponse.json({ success: true, message: 'Employee deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Failed to delete employee', error: error.message }, { status: 500 });
  }
}
