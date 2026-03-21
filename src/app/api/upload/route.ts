import { db } from '@/lib/db';
import { existsSync } from 'fs';
import { mkdir, writeFile } from 'fs/promises';
import { NextRequest, NextResponse } from 'next/server';
import { join } from 'path';

export async function POST(request: NextRequest) {
  let connection: any = null;
  try {
    const formData = await request.formData();

    const title = formData.get('title') as string;
    const category = formData.get('category') as string;
    const description = formData.get('description') as string;
    const userId = formData.get('userId') as string;
    const audioFile = formData.get('audio') as File;
    const thumbnailFile = formData.get('thumbnail') as File;

    // Validation
    if (!title || !category || !description || !userId || !audioFile || !thumbnailFile) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Max file size: 30MB
    const MAX_FILE_SIZE = 30 * 1024 * 1024; // 30MB in bytes

    // Allowed audio formats
    const ALLOWED_AUDIO_TYPES = [
      'audio/mpeg',        // MP3
      'audio/wav',         // WAV
      'audio/flac',        // FLAC
      'audio/aac',         // AAC
      'audio/ogg',         // OGG
      'audio/mp4',         // M4A
      'audio/x-m4a',       // M4A
      'audio/aiff',        // AIFF
      'audio/x-aiff',      // AIFF
      'audio/x-ms-wma',    // WMA
      'audio/amr',         // AMR
    ];

    // Validate audio file type
    if (!ALLOWED_AUDIO_TYPES.includes(audioFile.type)) {
      return NextResponse.json(
        { error: 'Audio format not supported. Allowed formats: MP3, WAV, FLAC, AAC, OGG, M4A, AIFF, ALAC, WMA, AMR' },
        { status: 400 }
      );
    }

    // Validate audio file size
    if (audioFile.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Audio file size must be less than 30MB' },
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
      `INSERT INTO songs (user_id, title, category, description, audio_path, thumbnail_path, status, views, likes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 'pending', 0, 0, NOW(), NOW())`,
      [
        parseInt(userId),
        title,
        category,
        description,
        audioFileName,
        thumbnailFileName
      ]
    );
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
      } catch (e) {
        console.error('Error releasing connection:', e);
      }
    }

    return NextResponse.json(
      { error: error.message || 'Upload failed' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      try { connection.release(); } catch(e) {}
    }
  }
}