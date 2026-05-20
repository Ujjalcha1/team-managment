import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import ActivityLog from '@/lib/models/ActivityLog';

const generateToken = (id: string, role: string): string => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET as string, {
    expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any,
  });
};

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { name, email, password, role, department } = body;

    // Simple validation
    if (!name || !email || !password) {
      return NextResponse.json({ success: false, message: 'Name, email and password are required' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ success: false, message: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ success: false, message: 'Email already registered' }, { status: 400 });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'user',
      department: department || 'General',
    });

    await ActivityLog.create({
      action: 'user_registered',
      description: `${user.name} registered an account`,
      entityType: 'user',
      entityId: user._id,
      entityName: user.name,
      performedBy: user._id,
      performedByName: user.name,
    });

    const token = generateToken((user._id as any).toString(), user.role);

    const response = NextResponse.json({
      success: true,
      message: 'Registration successful',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          profileImage: user.profileImage,
        },
      },
    }, { status: 201 });

    // Set cookie for middleware route protection
    response.cookies.set('token', token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Registration failed', error: error.message }, { status: 500 });
  }
}
