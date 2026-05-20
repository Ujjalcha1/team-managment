import { NextRequest, NextResponse } from 'next/server';
import { protect, requireAdmin } from '@/lib/auth';
import Employee from '@/lib/models/Employee';
import ActivityLog from '@/lib/models/ActivityLog';
import cloudinary from '@/lib/cloudinary';

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

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload buffer stream to Cloudinary
    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'team-management/employees', transformation: [{ width: 400, height: 400, crop: 'fill' }] },
        (error, result) => {
          if (error) reject(error);
          else resolve(result as { secure_url: string });
        }
      );
      uploadStream.end(buffer);
    });

    const employee = await Employee.findByIdAndUpdate(
      id,
      { profileImage: result.secure_url },
      { new: true }
    );

    if (!employee) {
      return NextResponse.json({ success: false, message: 'Employee not found' }, { status: 404 });
    }

    await ActivityLog.create({
      action: 'image_uploaded',
      description: `${auth.user!.name} uploaded a profile image for ${employee.name}`,
      entityType: 'employee',
      entityId: employee._id,
      entityName: employee.name || '',
      performedBy: auth.user!._id,
      performedByName: auth.user!.name || '',
    });

    return NextResponse.json({ success: true, message: 'Image uploaded successfully', data: { profileImage: result.secure_url } });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Failed to upload image', error: error.message }, { status: 500 });
  }
}
