import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { songId, adminId, reason } = await request.json();

    if (!songId || !adminId || !reason?.trim()) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    var connection = await db.getConnection();

    // Update song status to rejected
    await connection.query(
      `UPDATE songs SET status = 'rejected', updated_at = NOW() WHERE id = ?`,
      [songId]
    );

    // Insert rejection reason into song_rejections table
    await connection.query(
      `INSERT INTO song_rejections (song_id, admin_id, reason, rejected_at) VALUES (?, ?, ?, NOW())`,
      [songId, adminId, reason.trim()]
    );
    return Response.json({ success: true, message: 'Story rejected and reason stored' });
  } catch (error) {
    console.error('Error rejecting story:', error);
    return Response.json({ error: 'Failed to reject story' }, { status: 500 });
  } finally {
    if (connection) {
      try { connection.release(); } catch(e) {}
    }
  }
}