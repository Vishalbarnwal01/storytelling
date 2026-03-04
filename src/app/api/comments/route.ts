import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { songId, userId, userEmail, commentText } = body;

    if (!songId || !userId || !userEmail || !commentText) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const connection = await db.getConnection();

    await connection.query(
      `INSERT INTO comments (song_id, user_id, user_email, comment_text) 
       VALUES (?, ?, ?, ?)`,
      [songId, userId, userEmail, commentText]
    );

    connection.release();

    return Response.json({
      success: true,
      message: 'Comment posted successfully',
    });
  } catch (error) {
    console.error('Error posting comment:', error);
    return Response.json(
      { error: 'Failed to post comment' },
      { status: 500 }
    );
  }
}
