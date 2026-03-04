import { db } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const storyId = params.id;
    
    const connection = await db.getConnection();
    
    const [songs] = await connection.query(
      `SELECT s.*, u.email as creator_email FROM songs s 
       LEFT JOIN users u ON s.user_id = u.id 
       WHERE s.id = ?`,
      [storyId]
    );

    connection.release();

    if (Array.isArray(songs) && songs.length === 0) {
      return Response.json({ error: 'Story not found' }, { status: 404 });
    }

    const story = (songs as any[])[0];

    return Response.json({
      id: story.id,
      title: story.title,
      description: story.description,
      audioPath: story.audio_path,
      thumbnailPath: story.thumbnail_path,
      creatorEmail: story.creator_email,
      status: story.status,
      views: story.views,
      likes: story.likes,
      createdAt: story.created_at,
    });
  } catch (error) {
    console.error('Error fetching story:', error);
    return Response.json({ error: 'Failed to fetch story' }, { status: 500 });
  }
}
