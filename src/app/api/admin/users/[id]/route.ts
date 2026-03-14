import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let connection: any = null;
  try {
    const userId = parseInt(params.id);

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    connection = await db.getConnection();

    // Get all songs for this user
    const [songs] = await connection.query(
      'SELECT audio_path, thumbnail_path FROM songs WHERE user_id = ?',
      [userId]
    );

    // Delete files from filesystem
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    if (Array.isArray(songs)) {
      for (const song of songs as any[]) {
        try {
          const audioPath = join(uploadDir, song.audio_path);
          const thumbnailPath = join(uploadDir, song.thumbnail_path);

          if (existsSync(audioPath)) {
            await unlink(audioPath);
          }
          if (existsSync(thumbnailPath)) {
            await unlink(thumbnailPath);
          }
        } catch (e) {
          console.error('Error deleting files:', e);
        }
      }
    }

    // Delete songs from database
    await connection.query('DELETE FROM songs WHERE user_id = ?', [userId]);

    // Delete user from database
    await connection.query('DELETE FROM users WHERE id = ?', [userId]);

    connection.release();

    return NextResponse.json(
      { success: true, message: 'User and all their stories deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Delete error:', error);

    if (connection) {
      try {
        connection.release();
      } catch (e) {
        console.error('Error releasing connection:', e);
      }
    }

    return NextResponse.json(
      { error: error.message || 'Delete failed' },
      { status: 500 }
    );
  }
}
