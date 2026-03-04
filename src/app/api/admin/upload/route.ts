import { db } from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const adminId = formData.get('adminId') as string;
    const audioFile = formData.get('audioFile') as File;
    const thumbnailFile = formData.get('thumbnailFile') as File;

    if (!title || !description || !adminId || !audioFile) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Save audio file
    const audioBuffer = await audioFile.arrayBuffer();
    const audioFileName = `audio_${Date.now()}_${Math.random().toString(36).substring(7)}.mp3`;
    const audioPath = join(uploadsDir, audioFileName);
    await writeFile(audioPath, Buffer.from(audioBuffer));

    // Save thumbnail if provided
    let thumbnailFileName = null;
    if (thumbnailFile && thumbnailFile.size > 0) {
      const thumbnailBuffer = await thumbnailFile.arrayBuffer();
      thumbnailFileName = `thumbnail_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
      const thumbnailPath = join(uploadsDir, thumbnailFileName);
      await writeFile(thumbnailPath, Buffer.from(thumbnailBuffer));
    }

    const connection = await db.getConnection();

    // Insert song record with approved status for admin uploads
    await connection.query(
      `INSERT INTO songs (user_id, title, description, audio_path, thumbnail_path, status, views, likes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [adminId, title, description, audioFileName, thumbnailFileName, 'approved', 0, 0]
    );

    connection.release();

    return Response.json({
      success: true,
      message: 'Story uploaded successfully and is now live',
    });
  } catch (error) {
    console.error('Error uploading admin story:', error);
    return Response.json(
      { error: 'Failed to upload story' },
      { status: 500 }
    );
  }
}
