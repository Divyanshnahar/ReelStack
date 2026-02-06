import { NextResponse } from "next/server";
import { db } from "@/config/db";
import { Videos, Users } from "@/config/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    // Fetch videos joined with user data
    const videosWithCreators = await db
      .select({
        id: Videos.id,
        title: Videos.title,
        description: Videos.description,
        imageUrls: Videos.imageUrls,
        createdAt: Videos.createdAt,
        status: Videos.status,
        creator: {
          id: Users.id,
          name: Users.name,
          username: Users.username,
          imageUrl: Users.imageUrl
        }
      })
      .from(Videos)
      .innerJoin(Users, eq(Videos.createdBy, Users.id))
      .where(eq(Videos.status, 'completed'))
      .orderBy(desc(Videos.createdAt));

    // Safeguard against empty results and format the output
    const formattedVideos = (videosWithCreators || []).map(({ imageUrls, ...video }) => ({
      ...video,
      imageUrls: Array.isArray(imageUrls) ? imageUrls : [],
    }));

    return NextResponse.json(formattedVideos, { status: 200 });
    
  } catch (error) {
    console.error("[COMMUNITY_VIDEOS_GET_ERROR]:", error);
    return NextResponse.json(
      { message: "Internal Server Error" }, 
      { status: 500 }
    );
  }
}