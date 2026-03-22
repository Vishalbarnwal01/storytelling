import { getUserById, updateUserProfile } from '@/lib/db';
import bcrypt from 'bcrypt';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(request: NextRequest) {
  try {
    const { userId, email, name, currentPassword, newPassword } = await request.json();

    // Validate input
    if (!userId || !email) {
      return NextResponse.json(
        { error: 'User ID and email are required' },
        { status: 400 }
      );
    }

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Name cannot be empty' },
        { status: 400 }
      );
    }

    // Get current user
    const getUserResult = await getUserById(userId);
    if (!getUserResult.success || !getUserResult.user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const user = getUserResult.user;

    // If password change is requested
    if (newPassword) {
      // Verify current password (only for non-Google auth users)
      if (!user.isGoogleAuth) {
        if (!currentPassword) {
          return NextResponse.json(
            { error: 'Current password is required to change password' },
            { status: 400 }
          );
        }

        const passwordMatch = await bcrypt.compare(currentPassword, user.password);
        if (!passwordMatch) {
          return NextResponse.json(
            { error: 'Current password is incorrect' },
            { status: 401 }
          );
        }
      }

      // Validate new password
      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: 'New password must be at least 6 characters' },
          { status: 400 }
        );
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      // Update both name and password
      const result = await updateUserProfile(userId, name.trim(), hashedPassword);
      if (!result.success) {
        return NextResponse.json(
          { error: result.error || 'Failed to update profile' },
          { status: 500 }
        );
      }
    } else {
      // Update only name
      const result = await updateUserProfile(userId, name.trim());
      if (!result.success) {
        return NextResponse.json(
          { error: result.error || 'Failed to update profile' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Profile updated successfully',
        user: {
          id: user.id,
          email: user.email,
          name: name.trim(),
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred during profile update' },
      { status: 500 }
    );
  }
}
