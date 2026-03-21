import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { db } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let connection: any = null;
  try {
    const songId = parseInt(params.id);
    const formData = await request.formData();
    
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const userId = formData.get('userId') as string;
    const thumbnailFile = formData.get('thumbnail') as File | null;

    if (!title || !description || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    connection = await db.getConnection();

    // Get existing song
    const [existingSong] = await connection.query(
      'SELECT * FROM songs WHERE id = ? AND user_id = ?',
      [songId, parseInt(userId)]
    );

    if (!Array.isArray(existingSong) || existingSong.length === 0) {
    return NextResponse.json(
        { error: 'Song not found or unauthorized' },
        { status: 404 }
      );
    }

    const song = existingSong[0] as any;
    let thumbnailPath = song.thumbnail_path;

    // Handle new thumbnail if provided
    if (thumbnailFile && thumbnailFile.size > 0) {
      if (!thumbnailFile.type.startsWith('image/')) {
    return NextResponse.json(
          { error: 'Invalid image file type' },
          { status: 400 }
        );
      }

      // Create uploads directory if it doesn't exist
      const uploadDir = join(process.cwd(), 'public', 'uploads');
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true });
      }

      // Delete old thumbnail
      const oldThumbnailPath = join(uploadDir, song.thumbnail_path);
      try {
        if (existsSync(oldThumbnailPath)) {
          await unlink(oldThumbnailPath);
        }
      } catch (e) {
        console.error('Error deleting old thumbnail:', e);
      }

      // Generate new thumbnail filename
      const timestamp = Date.now();
      const newThumbnailFileName = `${userId}-${timestamp}-thumbnail-${thumbnailFile.name}`;
      
      // Save new thumbnail
      const thumbnailBuffer = await thumbnailFile.arrayBuffer();
      const newThumbnailPath = join(uploadDir, newThumbnailFileName);
      await writeFile(newThumbnailPath, Buffer.from(thumbnailBuffer));

      thumbnailPath = newThumbnailFileName;
    }

    // Update song in database
    await connection.query(
      `UPDATE songs 
       SET title = ?, description = ?, thumbnail_path = ?, updated_at = NOW()
       WHERE id = ?`,
      [title, description, thumbnailPath, songId]
    );
    return NextResponse.json(
      {
        success: true,
        message: 'Story updated successfully',
        data: {
          songId,
          thumbnailPath: `/uploads/${thumbnailPath}`,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Update error:', error);

    if (connection) {
      try {
      } catch (e) {
        console.error('Error releasing connection:', e);
      }
    }

    return NextResponse.json(
      { error: error.message || 'Update failed' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let connection: any = null;
  try {
    const songId = parseInt(params.id);
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    connection = await db.getConnection();

    // Get song details
    const [existingSong] = await connection.query(
      'SELECT * FROM songs WHERE id = ? AND user_id = ?',
      [songId, parseInt(userId)]
    );

    if (!Array.isArray(existingSong) || existingSong.length === 0) {
    return NextResponse.json(
        { error: 'Song not found or unauthorized' },
        { status: 404 }
      );
    }

    const song = existingSong[0] as any;

    // Delete files from filesystem
    const uploadDir = join(process.cwd(), 'public', 'uploads');
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

    // Delete from database
    await connection.query('DELETE FROM songs WHERE id = ?', [songId]);
    return NextResponse.json(
      { success: true, message: 'Story deleted successfully' },
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