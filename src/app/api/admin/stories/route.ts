import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  let connection: any = null;
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');

    connection = await db.getConnection();

    let query = `
      SELECT 
        s.id, 
        s.user_id, 
        s.title, 
        s.description, 
        s.audio_path, 
        s.thumbnail_path, 
        s.status, 
        s.views, 
        s.likes,
        s.created_at,
        u.email
      FROM songs s
      LEFT JOIN users u ON s.user_id = u.id
    `;

    const params: any[] = [];

    if (status) {
      query += ` WHERE s.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY s.created_at DESC`;

    const [stories] = await connection.query(query, params);

    connection.release();

    const transformedStories = (stories as any[]).map((story) => ({
      id: story.id,
      userId: story.user_id,
      userEmail: story.email,
      title: story.title,
      description: story.description,
      audioPath: story.audio_path,
      thumbnailPath: story.thumbnail_path,
      status: story.status,
      views: story.views || 0,
      likes: story.likes || 0,
      createdAt: story.created_at,
    }));

    return NextResponse.json({ stories: transformedStories });
  } catch (error: any) {
    console.error('Error fetching stories:', error);

    if (connection) {
      try {
        connection.release();
      } catch (e) {
        console.error('Error releasing connection:', e);
      }
    }

    return NextResponse.json(
      { error: 'Failed to fetch stories' },
      { status: 500 }
    );
  }
}
