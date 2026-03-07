import { db } from '@/lib/db';

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { songId, userId } = body;

    if (!songId || !userId) {
      return Response.json(
        { error: 'Song ID and User ID are required' },
        { status: 400 }
      );
    }

    const connection = await db.getConnection();

    // Delete the like
    const result = await connection.query(
      `DELETE FROM likes WHERE song_id = ? AND user_id = ?`,
      [songId, userId]
    );

    // Get updated like count
    const [likeCount] = await connection.query(
      `SELECT COUNT(*) as count FROM likes WHERE song_id = ?`,
      [songId]
    );

    connection.release();

    return Response.json({
      success: true,
      message: 'Like removed successfully',
      likeCount: likeCount[0].count,
    });
  } catch (error) {
    console.error('Error removing like:', error);
    return Response.json(
      { error: 'Failed to remove like' },
      { status: 500 }
    );
  }
}
