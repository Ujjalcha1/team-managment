import { NextRequest, NextResponse } from 'next/server';
import { protect } from '@/lib/auth';
import User from '@/lib/models/User';

export async function PUT(req: NextRequest) {
  const auth = await protect(req);
  if (!auth.authenticated) {
    return auth.response!;
  }

  try {
    const body = await req.json();
    const { currentPassword, newPassword } = body;
    const currentUser = auth.user!;

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ success: false, message: 'Current password and new password are required' }, { status: 400 });
    }

    const user = await User.findById(currentUser._id).select('+password');
    if (!user || !(await user.comparePassword(currentPassword))) {
      return NextResponse.json({ success: false, message: 'Current password is incorrect' }, { status: 401 });
    }

    user.password = newPassword;
    await user.save();

    return NextResponse.json({ success: true, message: 'Password changed successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Failed to change password', error: error.message }, { status: 500 });
  }
}
