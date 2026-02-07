import { NextResponse } from "next/server";
import { db } from "@/config/db";
import { Videos, Users } from "@/config/schema";
import { eq, desc } from "drizzle-orm";

// Get all videos for the community page with creator info
export async function GET() {
  try {
    // Get all videos along with their creator info
    const videosWithCreators = await db
      .select({
        id: Videos.id,
        title: Videos.title,
        description: Videos.description,
        imageUrls: Videos.imageUrls,
        createdAt: Videos.createdAt,
        status: Videos.status,
        createdBy: Videos.createdBy,
        creator: {
          id: Users.id,
          name: Users.name,
          username: Users.username,
          imageUrl: Users.imageUrl
        }
      })
      .from(Videos)
      .innerJoin(Users, eq(Videos.createdBy, Users.id))
      .where(eq(Videos.status, 'completed')) // Only show completed videos
      .orderBy(desc(Videos.createdAt)); // Sort by newest first

    // Format the response with proper typing and add favorite status
    const formattedVideos = videosWithCreators.map(video => ({
      id: video.id,
      title: video.title,
      description: video.description,
      imageUrls: Array.isArray(video.imageUrls) ? video.imageUrls : [],
      createdAt: video.createdAt,
      status: video.status,
      creator: video.creator,
    }));

    return NextResponse.json(formattedVideos);
  } catch (error) {
    console.error("[COMMUNITY_VIDEOS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 