import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  let connection: any = null;
  try {
    const formData = await request.formData();
    
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const userId = formData.get('userId') as string;
    const audioFile = formData.get('audio') as File;
    const thumbnailFile = formData.get('thumbnail') as File;

    // Validation
    if (!title || !description || !userId || !audioFile || !thumbnailFile) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate file types
    if (!audioFile.type.startsWith('audio/')) {
      return NextResponse.json(
        { error: 'Invalid audio file type' },
        { status: 400 }
      );
    }

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

    // Generate unique filenames
    const timestamp = Date.now();
    const audioFileName = `${userId}-${timestamp}-audio-${audioFile.name}`;
    const thumbnailFileName = `${userId}-${timestamp}-thumbnail-${thumbnailFile.name}`;

    // Save audio file
    const audioBuffer = await audioFile.arrayBuffer();
    const audioPath = join(uploadDir, audioFileName);
    await writeFile(audioPath, Buffer.from(audioBuffer));

    // Save thumbnail file
    const thumbnailBuffer = await thumbnailFile.arrayBuffer();
    const thumbnailPath = join(uploadDir, thumbnailFileName);
    await writeFile(thumbnailPath, Buffer.from(thumbnailBuffer));

    // Save to database
    connection = await db.getConnection();
    
    const [result] = await connection.query(
      `INSERT INTO songs (user_id, title, description, audio_path, thumbnail_path, status, views, likes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 'pending', 0, 0, NOW(), NOW())`,
      [
        parseInt(userId),
        title,
        description,
        audioFileName,
        thumbnailFileName
      ]
    );

    connection.release();

    return NextResponse.json(
      {
        success: true,
        message: 'Story uploaded successfully and pending approval',
        data: {
          songId: (result as any).insertId,
          audioPath: `/uploads/${audioFileName}`,
          thumbnailPath: `/uploads/${thumbnailFileName}`,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Upload error:', error);
    
    if (connection) {
      try {
        connection.release();
      } catch (e) {
        console.error('Error releasing connection:', e);
      }
    }

    return NextResponse.json(
      { error: error.message || 'Upload failed' },
      { status: 500 }
    );
  }
}
