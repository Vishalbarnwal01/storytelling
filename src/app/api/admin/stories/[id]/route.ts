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
    const storyId = parseInt(params.id);
    const formData = await request.formData();
    
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const thumbnailFile = formData.get('thumbnail') as File | null;

    if (!title || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    connection = await db.getConnection();

    // Get existing story
    const [existingStory] = await connection.query(
      'SELECT * FROM songs WHERE id = ?',
      [storyId]
    );

    if (!Array.isArray(existingStory) || existingStory.length === 0) {
    return NextResponse.json(
        { error: 'Story not found' },
        { status: 404 }
      );
    }

    const story = existingStory[0] as any;
    let thumbnailPath = story.thumbnail_path;

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
      const oldThumbnailPath = join(uploadDir, story.thumbnail_path);
      try {
        if (existsSync(oldThumbnailPath)) {
          await unlink(oldThumbnailPath);
        }
      } catch (e) {
        console.error('Error deleting old thumbnail:', e);
      }

      // Generate new thumbnail filename
      const timestamp = Date.now();
      const newThumbnailFileName = `${story.user_id}-${timestamp}-thumbnail-${thumbnailFile.name}`;
      
      // Save new thumbnail
      const thumbnailBuffer = await thumbnailFile.arrayBuffer();
      const newThumbnailPath = join(uploadDir, newThumbnailFileName);
      await writeFile(newThumbnailPath, Buffer.from(thumbnailBuffer));

      thumbnailPath = newThumbnailFileName;
    }

    // Update story in database
    await connection.query(
      `UPDATE songs 
       SET title = ?, description = ?, thumbnail_path = ?, updated_at = NOW()
       WHERE id = ?`,
      [title, description, thumbnailPath, storyId]
    );
    return NextResponse.json(
      {
        success: true,
        message: 'Story updated successfully',
        data: {
          storyId,
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
    const storyId = parseInt(params.id);

    if (!storyId) {
      return NextResponse.json(
        { error: 'Story ID required' },
        { status: 400 }
      );
    }

    connection = await db.getConnection();

    // Get story details
    const [existingStory] = await connection.query(
      'SELECT * FROM songs WHERE id = ?',
      [storyId]
    );

    if (!Array.isArray(existingStory) || existingStory.length === 0) {
    return NextResponse.json(
        { error: 'Story not found' },
        { status: 404 }
      );
    }

    const story = existingStory[0] as any;

    // Delete files from filesystem
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    try {
      const audioPath = join(uploadDir, story.audio_path);
      const thumbnailPath = join(uploadDir, story.thumbnail_path);

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
    await connection.query('DELETE FROM songs WHERE id = ?', [storyId]);
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