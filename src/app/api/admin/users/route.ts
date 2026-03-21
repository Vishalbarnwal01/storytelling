import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  let connection: any = null;
  try {
    connection = await db.getConnection();

    const [users] = await connection.query(
      `SELECT id, email, created_at FROM users ORDER BY created_at DESC`
    );
    return NextResponse.json({ users });
  } catch (error: any) {
    console.error('Error fetching users:', error);

    if (connection) {
      try {
      } catch (e) {
        console.error('Error releasing connection:', e);
      }
    }

    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      try { connection.release(); } catch(e) {}
    }
  }
}