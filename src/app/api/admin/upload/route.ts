import { db } from '@/lib/db';
import { existsSync } from 'fs';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const category = formData.get('category') as string;
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
      return Response.json(
        { error: 'Audio format not supported. Allowed formats: MP3, WAV, FLAC, AAC, OGG, M4A, AIFF, ALAC, WMA, AMR' },
        { status: 400 }
      );
    }

    // Validate audio file size
    if (audioFile.size > MAX_FILE_SIZE) {
      return Response.json(
        { error: 'Audio file size must be less than 30MB' },
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
      `INSERT INTO songs (user_id, title, category, description, audio_path, thumbnail_path, status, views, likes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [adminId, title, category, description, audioFileName, thumbnailFileName, 'approved', 0, 0]
    );

    connection.release();

    return Response.json({
      success: true,
      message: 'Story uploaded successfully and is now live',
    });
  } catch (error) {
    console.log(JSON.stringify(error), 'error');
    console.error('Error uploading admin story:', JSON.stringify(error));
    return Response.json(
      { error: JSON.stringify(error) },
      { status: 500 }
    );
  }
}
