import { db } from '@/lib/db';

export async function GET() {
  try {
    const connection = await db.getConnection();

    const [stories] = await connection.query(
      `SELECT s.id, s.title, s.category, s.user_id, s.thumbnail_path, s.audio_path, 
              s.description, s.likes, s.views, s.created_at, u.email as creator_name,
              (SELECT COUNT(*) FROM comments c WHERE c.song_id = s.id) as comment_count
       FROM songs s
       LEFT JOIN users u ON s.user_id = u.id
       WHERE s.status = 'approved'
       ORDER BY s.created_at DESC
       LIMIT 20`
    );

    connection.release();

    return Response.json({
      stories: stories || [],
    });
  } catch (error) {
    console.error('Error fetching approved stories:', error);
    return Response.json({ error: 'Failed to fetch stories' }, { status: 500 });
  }
}
