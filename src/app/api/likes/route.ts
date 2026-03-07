import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { songId, userId, userEmail } = body;

    if (!songId || !userId || !userEmail) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const connection = await db.getConnection();

    // Check if user already liked this song
    const [existingLike] = await connection.query(
      `SELECT id FROM likes WHERE song_id = ? AND user_id = ?`,
      [songId, userId]
    );

    if (existingLike && existingLike.length > 0) {
      connection.release();
      return Response.json(
        { error: 'User already liked this song' },
        { status: 409 }
      );
    }

    // Insert the like
    await connection.query(
      `INSERT INTO likes (song_id, user_id, user_email) 
       VALUES (?, ?, ?)`,
      [songId, userId, userEmail]
    );

    // Get updated like count
    const [likeCount] = await connection.query(
      `SELECT COUNT(*) as count FROM likes WHERE song_id = ?`,
      [songId]
    );

    connection.release();

    return Response.json({
      success: true,
      message: 'Like added successfully',
      likeCount: likeCount[0].count,
    });
  } catch (error) {
    console.error('Error adding like:', error);
    return Response.json(
      { error: 'Failed to add like' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const songId = url.searchParams.get('songId');
    const userId = url.searchParams.get('userId');

    if (!songId) {
      return Response.json(
        { error: 'Song ID is required' },
        { status: 400 }
      );
    }

    const connection = await db.getConnection();

    // Get like count for the song
    const [likeCount] = await connection.query(
      `SELECT COUNT(*) as count FROM likes WHERE song_id = ?`,
      [songId]
    );

    // Check if current user liked this song (if userId is provided)
    let userHasLiked = false;
    if (userId) {
      const [userLike] = await connection.query(
        `SELECT id FROM likes WHERE song_id = ? AND user_id = ?`,
        [songId, userId]
      );
      userHasLiked = userLike && userLike.length > 0;
    }

    connection.release();

    return Response.json({
      likeCount: likeCount[0].count,
      userHasLiked,
    });
  } catch (error) {
    console.error('Error fetching likes:', error);
    return Response.json(
      { error: 'Failed to fetch likes' },
      { status: 500 }
    );
  }
}
