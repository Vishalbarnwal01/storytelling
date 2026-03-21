import { db } from '@/lib/db';

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { commentId } = body;

    if (!commentId) {
      return Response.json(
        { error: 'Comment ID is required' },
        { status: 400 }
      );
    }

    var connection = await db.getConnection();

    const result = await connection.query(
      `DELETE FROM comments WHERE id = ?`,
      [commentId]
    );
    return Response.json({
      success: true,
      message: 'Comment deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return Response.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      try { connection.release(); } catch(e) {}
    }
  }
}