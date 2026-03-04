import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return Response.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const connection = await db.getConnection();

    // Query admins table for admin with given email
    const [admins] = await connection.query(
      'SELECT id, email, password FROM admins WHERE email = ? AND is_active = 1',
      [email]
    );

    connection.release();

    const adminArray = admins as any[];

    if (adminArray.length === 0) {
      return Response.json(
        { error: 'Invalid admin credentials' },
        { status: 401 }
      );
    }

    const admin = adminArray[0];

    // Simple password validation (in production, use bcrypt)
    // For now, we'll do a simple comparison
    if (admin.password !== password) {
      return Response.json(
        { error: 'Invalid admin credentials' },
        { status: 401 }
      );
    }

    return Response.json({
      success: true,
      admin: {
        id: admin.id,
        email: admin.email,
      },
    });
  } catch (error) {
    console.error('Error during admin login:', error);
    return Response.json(
      { error: 'Failed to log in' },
      { status: 500 }
    );
  }
}
