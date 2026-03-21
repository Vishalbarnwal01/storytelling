import { db } from '@/lib/db';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  let connection: any = null;
  try {
    const userId = req.nextUrl.searchParams.get('userId');
    connection = await db.getConnection();

    let query = `SELECT s.id, s.title, s.category, s.user_id, s.thumbnail_path, s.audio_path, 
              s.description, s.likes, s.views, s.created_at, u.email as creator_name,
              (SELECT COUNT(*) FROM comments c WHERE c.song_id = s.id) as comment_count`;
    
    if (userId) {
       query += `, (SELECT COUNT(*) FROM likes l WHERE l.song_id = s.id AND l.user_id = ?) > 0 as user_has_liked`;
    }

    query += ` FROM songs s
       LEFT JOIN users u ON s.user_id = u.id
       WHERE s.status = 'approved' OR s.user_id = 0
       ORDER BY s.created_at DESC
       LIMIT 20`;

    const [stories] = await connection.query(
      query,
      userId ? [userId] : []
    );
    
    return Response.json({
      stories: stories || [],
    });
  } catch (error) {
    console.error('Error fetching approved stories:', error);
    return Response.json({ error: 'Failed to fetch stories' }, { status: 500 });
  } finally {
    if (connection) {
      try { connection.release(); } catch(e) {}
    }
  }
}