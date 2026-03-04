import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  let connection: any = null;
  try {
    const body = await request.json();
    const { songId, status } = body;

    if (!songId || !status) {
      return NextResponse.json(
        { error: 'Missing songId or status' },
        { status: 400 }
      );
    }

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be approved, rejected, or pending' },
        { status: 400 }
      );
    }

    connection = await db.getConnection();

    const [result] = await connection.query(
      `UPDATE songs SET status = ?, updated_at = NOW() WHERE id = ?`,
      [status, songId]
    );

    connection.release();

    if ((result as any).affectedRows === 0) {
      return NextResponse.json(
        { error: 'Song not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Song ${status} successfully`,
    });
  } catch (error: any) {
    console.error('Error updating story status:', error);

    if (connection) {
      try {
        connection.release();
      } catch (e) {
        console.error('Error releasing connection:', e);
      }
    }

    return NextResponse.json(
      { error: error.message || 'Failed to update story' },
      { status: 500 }
    );
  }
}
