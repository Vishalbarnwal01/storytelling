import { db } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const storyId = params.id;
    
    var connection = await db.getConnection();
    
    const [comments] = await connection.query(
      `SELECT id, user_id, user_email, comment_text, created_at 
       FROM comments 
       WHERE song_id = ? 
       ORDER BY created_at DESC`,
      [storyId]
    );
    return Response.json({
      comments: comments || [],
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return Response.json({ error: 'Failed to fetch comments' }, { status: 500 });
  } finally {
    if (connection) {
      try { connection.release(); } catch(e) {}
    }
  }
}