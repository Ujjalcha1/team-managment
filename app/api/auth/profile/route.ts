import { NextRequest, NextResponse } from 'next/server';
import { protect } from '@/lib/auth';
import User from '@/lib/models/User';
import ActivityLog from '@/lib/models/ActivityLog';

export async function PUT(req: NextRequest) {
  const auth = await protect(req);
  if (!auth.authenticated) {
    return auth.response!;
  }

  try {
    const body = await req.json();
    const { name, department, profileImage } = body;
    const currentUser = auth.user!;

    const user = await User.findByIdAndUpdate(
      currentUser._id,
      { name, department, ...(profileImage && { profileImage }) },
      { new: true, runValidators: true }
    );

    await ActivityLog.create({
      action: 'profile_updated',
      description: `${user?.name} updated their profile`,
      entityType: 'user',
      entityId: user?._id,
      entityName: user?.name || '',
      performedBy: currentUser._id,
      performedByName: currentUser.name || '',
    });

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user?._id,
          name: user?.name,
          email: user?.email,
          role: user?.role,
          department: user?.department,
          profileImage: user?.profileImage,
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Failed to update profile', error: error.message }, { status: 500 });
  }
}
