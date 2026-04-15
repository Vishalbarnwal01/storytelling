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
      'SELECT id, audio_path, thumbnail_path FROM songs WHERE user_id = ?',
      [userId]
    );

    // Delete files from filesystem and gather song IDs
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    const songIds: number[] = [];

    if (Array.isArray(songs)) {
      for (const song of songs as any[]) {
        songIds.push(song.id);

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

    // Delete related data for the user's stories
    if (songIds.length > 0) {
      const placeholders = songIds.map(() => '?').join(', ');

      await connection.query(
        `DELETE FROM likes WHERE song_id IN (${placeholders})`,
        songIds
      );
      await connection.query(
        `DELETE FROM comments WHERE song_id IN (${placeholders})`,
        songIds
      );
      await connection.query(
        `DELETE FROM song_rejections WHERE song_id IN (${placeholders})`,
        songIds
      );
    }

    // Delete likes and comments created by the user
    await connection.query('DELETE FROM likes WHERE user_id = ?', [userId]);
    await connection.query('DELETE FROM comments WHERE user_id = ?', [userId]);

    // Delete songs from database
    await connection.query('DELETE FROM songs WHERE user_id = ?', [userId]);

    // Delete user from database
    await connection.query('DELETE FROM users WHERE id = ?', [userId]);
    return NextResponse.json(
      { success: true, message: 'User and all their related data deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Delete error:', error);

    if (connection) {
      try {
      } catch (e) {
        console.error('Error releasing connection:', e);
      }
    }

    return NextResponse.json(
      { error: error.message || 'Delete failed' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      try { connection.release(); } catch(e) {}
    }
  }
}
