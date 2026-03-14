import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  let connection: any = null;
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    connection = await db.getConnection();

    const [songs] = await connection.query(
      `SELECT 
        id, 
        title, 
        description, 
        thumbnail_path, 
        audio_path,
        status, 
        views, 
        likes,
        created_at 
       FROM songs 
       WHERE user_id = ? 
       ORDER BY created_at DESC`,
      [parseInt(userId)]
    );

    connection.release();

    // Transform data to match frontend interface
    const transformedSongs = (songs as any[]).map((song) => ({
      id: song.id,
      title: song.title,
      status: song.status as 'approved' | 'pending' | 'rejected',
      uploadedAt: new Date(song.created_at).toISOString().split('T')[0],
      views: song.views || 0,
      description: song.description,
      thumbnail: song.thumbnail_path,
      audio: song.audio_path,
    }));

    return NextResponse.json({ songs: transformedSongs });
  } catch (error: any) {
    console.error('Error fetching user songs:', error);

    if (connection) {
      try {
        connection.release();
      } catch (e) {
        console.error('Error releasing connection:', e);
      }
    }

    return NextResponse.json(
      { error: 'Failed to fetch songs' },
      { status: 500 }
    );
  }
}
