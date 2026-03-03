import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/config/db";
import { Videos, Users } from "@/config/schema";
import { eq, and } from "drizzle-orm";

/* -------------------------------------------------- */
/* Utility: Get or Create User in Database */
/* -------------------------------------------------- */

async function getOrCreateDbUser() {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await currentUser();
  const userEmail = user?.emailAddresses?.[0]?.emailAddress;

  if (!userEmail) return null;

  const existing = await db
    .select()
    .from(Users)
    .where(eq(Users.email, userEmail))
    .limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  // 🔥 Auto-create user if not found
  const inserted = await db
    .insert(Users)
    .values({
      email: userEmail,
      name: user?.fullName || "",
      username: user?.username || userEmail.split("@")[0],
      imageUrl: user?.imageUrl || "",
    })
    .returning();

  return inserted[0];
}

/* -------------------------------------------------- */
/* CREATE VIDEO */
/* -------------------------------------------------- */

export async function POST(req: Request) {
  try {
    const dbUser = await getOrCreateDbUser();
    if (!dbUser) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const {
      script,
      audioUrl,
      captions,
      imageUrls,
      voice,
      captionStyle,
      title,
      description,
    } = await req.json();

    const video = await db
      .insert(Videos)
      .values({
        title: title || `Video - ${new Date().toLocaleDateString()}`,
        description: description || "",
        script: JSON.stringify(script),
        audioUrl,
        captions,
        imageUrls,
        voice,
        captionStyle,
        status: "generating",
        createdBy: dbUser.id,
      })
      .returning();

    return NextResponse.json(video[0]);
  } catch (error) {
    console.log("[VIDEOS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

/* -------------------------------------------------- */
/* GET USER VIDEOS */
/* -------------------------------------------------- */

export async function GET() {
  try {
    const dbUser = await getOrCreateDbUser();
    if (!dbUser) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const videos = await db
      .select({
        id: Videos.id,
        title: Videos.title,
        description: Videos.description,
        imageUrls: Videos.imageUrls,
        createdAt: Videos.createdAt,
        status: Videos.status,
      })
      .from(Videos)
      .where(eq(Videos.createdBy, dbUser.id));

    return NextResponse.json(videos);
  } catch (error) {
    console.error("[VIDEOS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

/* -------------------------------------------------- */
/* UPDATE VIDEO */
/* -------------------------------------------------- */

export async function PATCH(req: Request) {
  try {
    const dbUser = await getOrCreateDbUser();
    if (!dbUser) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id, status, title, description, downloadUrl } =
      await req.json();

    if (!id) {
      return new NextResponse("Video ID is required", { status: 400 });
    }

    const updateData: Record<string, string | null> = {};
    if (status) updateData.status = status;
    if (title) updateData.title = title;
    if (description !== undefined)
      updateData.description = description;
    if (downloadUrl !== undefined)
      updateData.downloadUrl = downloadUrl;

    if (Object.keys(updateData).length === 0) {
      return new NextResponse("No fields to update", { status: 400 });
    }

    const updated = await db
      .update(Videos)
      .set(updateData)
      .where(
        and(
          eq(Videos.id, id),
          eq(Videos.createdBy, dbUser.id)
        )
      )
      .returning();

    if (updated.length === 0) {
      return new NextResponse(
        "Video not found or not owned by user",
        { status: 404 }
      );
    }

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.log("[VIDEOS_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

/* -------------------------------------------------- */
/* DELETE VIDEO */
/* -------------------------------------------------- */

export async function DELETE(req: Request) {
  try {
    const dbUser = await getOrCreateDbUser();
    if (!dbUser) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return new NextResponse("Video ID is required", {
        status: 400,
      });
    }

    const deleted = await db
      .delete(Videos)
      .where(
        and(
          eq(Videos.id, id),
          eq(Videos.createdBy, dbUser.id)
        )
      )
      .returning();

    if (deleted.length === 0) {
      return new NextResponse(
        "Video not found or not owned by user",
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Video deleted successfully",
    });
  } catch (error) {
    console.log("[VIDEOS_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}