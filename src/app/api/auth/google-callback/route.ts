import { signupUserWithGoogle } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, name, googleId } = await request.json();

    if (!email || !googleId) {
      return NextResponse.json(
        { error: 'Email and Google ID are required' },
        { status: 400 }
      );
    }

    // Sign up or get existing user with Google
    const result = await signupUserWithGoogle(email, googleId, name);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Google authentication successful',
        user: {
          id: result.userId,
          email: email,
          name: name,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Google auth error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred during Google authentication' },
      { status: 500 }
    );
  }
}
