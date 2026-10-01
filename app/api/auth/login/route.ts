import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    const bcrypt = (await import('bcryptjs')).default;
    const { connectDB } = await import('@/lib/mongodb');
    const User = (await import('@/models/User')).default;
    const Company = (await import('@/models/Company')).default; // Ensure Company model is registered
    const { signToken } = await import('@/lib/jwt');

    // Connect to database
    await connectDB();

    // Find user
    const user = await User.findOne({ email }).populate('company');
    if (!user) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    if (!user.isApproved) {
      return NextResponse.json(
        { message: 'Your account is pending approval by an admin.' },
        { status: 403 }
      );
    }

    // Check password
    if (!user.password) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Generate token
    const token = await signToken({
      sub: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    });

    // Create response
    const response = NextResponse.json(
      { message: 'Login successful', user: { _id: user._id, email: user.email, name: user.name } },
      { status: 200 }
    );

    // Set cookie
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: process.env.NODE_ENV === 'development' ? `Error: ${error.message}` : 'Login failed. Please try again.' },
      { status: 500 }
    );
  }
}
