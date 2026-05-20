import { NextRequest, NextResponse } from 'next/server';
import { protect } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const auth = await protect(req);
  if (!auth.authenticated) {
    return auth.response!;
  }

  const user = auth.user!;
  return NextResponse.json({
    success: true,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        profileImage: user.profileImage,
      },
    },
  });
}
