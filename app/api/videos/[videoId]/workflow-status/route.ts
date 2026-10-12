import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import axios from "axios";
import { Videos, Users } from "@/config/schema";
import { db } from "@/config/db";
import { eq, and } from "drizzle-orm";

// Define types for GitHub API responses
interface GitHubWorkflowRun {
  id: number;
  name: string;
  status: string;
  conclusion: string;
  event: string;
  created_at: string;
  updated_at: string;
  url: string;
  inputs?: {
    videoId?: string;
    [key: string]: string | undefined;
  };
}

interface GitHubWorkflowRunDetails {
  workflow_run: GitHubWorkflowRun;
}

interface GitHubArtifact {
  id: number;
  name: string;
  size_in_bytes: number;
  archive_download_url: string;
}

interface GitHubRunsResponse {
  workflow_runs: GitHubWorkflowRun[];
}

interface GitHubArtifactsResponse {
  artifacts: GitHubArtifact[];
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
) {
  try {
    const { userId } = await auth();
    const resolvedParams = await params;
    const videoId = resolvedParams.videoId;

    // Check if user is authenticated
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get GitHub PAT from environment variables
    const githubToken = process.env.PAT_TOKEN;
    const githubRepo = process.env.REPO_NAME || "username/repo-name";

    if (!githubToken) {
      return NextResponse.json(
        { error: "GitHub token not configured" },
        { status: 500 }
      );
    }

    const authHeader = githubToken.startsWith("Bearer ") || githubToken.startsWith("token ")
      ? githubToken
      : `Bearer ${githubToken}`;

    // First try to list all runs for the repository
    const runsResponse = await axios.get<GitHubRunsResponse>(
      `https://api.github.com/repos/${githubRepo}/actions/runs`,
      {
        headers: {
          Authorization: authHeader,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );
    
    // First, get all render video workflow runs
    const allWorkflowRuns = runsResponse.data.workflow_runs.filter(
      (run: any) =>
        (run.name?.includes("Render Video") ||
         run.display_title?.includes("Render Video") ||
         run.path?.includes("render-video.yml")) &&
        run.event === "workflow_dispatch"
    );

    // Sort runs by created_at, most recent first
    allWorkflowRuns.sort((a: GitHubWorkflowRun, b: GitHubWorkflowRun) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    // Try to find a run specifically for this videoId by checking display_title, name, or fall back to most recent
    let videoRun: GitHubWorkflowRun | null = 
      allWorkflowRuns.find((run: any) => 
        (run.display_title && run.display_title.includes(videoId)) ||
        (run.name && run.name.includes(videoId))
      ) || (allWorkflowRuns.length > 0 ? allWorkflowRuns[0] : null);

    let progressPercentage = 0;

    if (videoRun) {
      if (videoRun.status === "in_progress" || videoRun.status === "queued") {
        const startTime = new Date(videoRun.created_at).getTime();
        const currentTime = new Date().getTime();
        
        // Assume the workflow takes around 3 minutes (180000ms) to complete
        const estimatedTotalTime = 180000;
        const elapsedTime = currentTime - startTime;
        
        // Calculate percentage with a maximum of 95% (to avoid showing 100% before it's actually done)
        progressPercentage = Math.min(Math.floor((elapsedTime / estimatedTotalTime) * 100), 95);
      } else if (videoRun.status === "completed" && videoRun.conclusion === "success") {
        progressPercentage = 100;
      }
    }

    // If no runs are found
    if (!videoRun) {
      return NextResponse.json(
        { 
          message: "No render workflows found",
          progressPercentage: 0
        }, 
        { status: 200 }
      );
    }

    // Get artifacts for this run
    const artifactsResponse = await axios.get<GitHubArtifactsResponse>(
      `https://api.github.com/repos/${githubRepo}/actions/runs/${videoRun.id}/artifacts`,
      {
        headers: {
          Authorization: authHeader,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

    const artifacts = artifactsResponse.data.artifacts;
    
    // Find the artifact that contains our video ID
    const videoArtifact = artifacts.find(
      (artifact: GitHubArtifact) => artifact.name.includes(videoId) || artifact.name.includes("rendered-video")
    );

    let downloadUrl = null;
    
    if (videoArtifact) {
      // Create a direct download URL
      downloadUrl = videoArtifact.archive_download_url;
      progressPercentage = 100; // If we have an artifact, the render is complete
    }

    // Update the video in the database with the downloadUrl
    if (downloadUrl) {
      try {
        await db.update(Videos)
          .set({ downloadUrl })
          .where(eq(Videos.id, videoId));
      } catch (error) {
        console.error("Error updating video with downloadUrl in DB:", error);
      }
    }

    return NextResponse.json({
      status: videoRun.status,
      conclusion: videoRun.conclusion,
      created_at: videoRun.created_at,
      updated_at: videoRun.updated_at,
      downloadUrl,
      workflow_id: videoRun.id,
      artifacts_count: artifacts.length,
      progressPercentage // Include the progress percentage in the response
    });

  } catch (error) {
    console.error("Error checking workflow status:", error);
    
    return NextResponse.json(
      { 
        error: "Failed to check workflow status",
        details: error instanceof Error ? error.message : "Unknown error",
        progressPercentage: 0
      }, 
      { status: 500 }
    );
  }
} 