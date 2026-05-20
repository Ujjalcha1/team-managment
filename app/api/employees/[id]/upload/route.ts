import { NextRequest, NextResponse } from 'next/server';
import { protect, requireAdmin } from '@/lib/auth';
import Employee from '@/lib/models/Employee';
import ActivityLog from '@/lib/models/ActivityLog';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
    const formData = await req.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json({ success: false, message: 'No image file provided' }, { status: 400 });
    }

    // Cloudinary upload is disabled/stubbed. We generate a deterministic Dicebear avatar.
    const mockProfileImage = `https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`;

    const employee = await Employee.findByIdAndUpdate(
      id,
      { profileImage: mockProfileImage },
      { new: true }
    );

    if (!employee) {
      return NextResponse.json({ success: false, message: 'Employee not found' }, { status: 404 });
    }

    await ActivityLog.create({
      action: 'image_uploaded',
      description: `${auth.user!.name} updated profile image (stubbed) for ${employee.name}`,
      entityType: 'employee',
      entityId: employee._id,
      entityName: employee.name || '',
      performedBy: auth.user!._id,
      performedByName: auth.user!.name || '',
    });

    return NextResponse.json({ success: true, message: 'Image uploaded successfully (mocked/stubbed)', data: { profileImage: mockProfileImage } });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Failed to upload image', error: error.message }, { status: 500 });
  }
}
