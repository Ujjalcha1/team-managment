import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/db';
import User, { IUser } from '@/lib/models/User';

interface JwtPayload {
  id: string;
  role: string;
}

export async function protect(req: NextRequest): Promise<{ authenticated: boolean; user?: IUser; response?: NextResponse }> {
  try {
    await connectDB();
    let token: string | undefined;

    const authHeader = req.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else {
      token = req.cookies.get('token')?.value;
    }

    if (!token) {
      return {
        authenticated: false,
        response: NextResponse.json(
          { success: false, message: 'Access denied. No token provided.' },
          { status: 401 }
        ),
      };
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    const user = await User.findById(decoded.id).select('-password');

    if (!user || !user.isActive) {
      return {
        authenticated: false,
        response: NextResponse.json(
          { success: false, message: 'Token is invalid or user no longer exists.' },
          { status: 401 }
        ),
      };
    }

    return { authenticated: true, user };
  } catch (error) {
    return {
      authenticated: false,
      response: NextResponse.json(
        { success: false, message: 'Invalid or expired token.' },
        { status: 401 }
      ),
    };
  }
}

export function requireAdmin(user?: IUser): { authorized: boolean; response?: NextResponse } {
  if (user?.role !== 'admin') {
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, message: 'Access denied. Admin privileges required.' },
        { status: 403 }
      ),
    };
  }
  return { authorized: true };
}
