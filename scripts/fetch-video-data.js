// CommonJS script for fetching video data
const fs = require('fs');
const axios = require('axios');
const dotenv = require('dotenv');

// Load environment variables; prefer .env.local when running locally
dotenv.config({ path: '.env.local' });
dotenv.config();

// Get command line arguments
const videoId = process.argv[2];
const apiUrl = process.env.API_URL || 'http://localhost:3000';
const dbUrl = process.env.DATABASE_URL || process.env.NEXT_PUBLIC_DATABASE_URL;

if (!videoId) {
  console.error('Video ID is required');
  process.exit(1);
}

async function fetchFromDb(id) {
  if (!dbUrl) {
    console.log('No DATABASE_URL or NEXT_PUBLIC_DATABASE_URL provided.');
    return null;
  }
  try {
    const { neon } = require('@neondatabase/serverless');
    console.log(`Connecting to Neon DB to fetch video: ${id}...`);
    const sql = neon(dbUrl);
    const rows = await sql`
      SELECT id, title, description, script, "audioUrl", "imageUrls", captions, voice, "captionStyle", status, "createdBy", "createdAt"
      FROM videos
      WHERE id = ${id}
      LIMIT 1
    `;
    if (rows && rows.length > 0) {
      console.log('Successfully fetched video from Neon DB');
      return rows[0];
    }
    console.warn(`No video found in Neon DB for ID: ${id}`);
    return null;
  } catch (err) {
    console.warn(`Failed to fetch from DB: ${err.message}`);
    return null;
  }
}

async function fetchFromApi(id) {
  try {
    console.log(`Fetching video data for ID: ${id} from ${apiUrl}/api/videos/${id}`);
    const response = await axios.get(`${apiUrl}/api/videos/${id}`, { timeout: 15000 });
    return response.data;
  } catch (err) {
    console.warn(`Failed to fetch from API: ${err.message}`);
    return null;
  }
}

// Use CommonJS async pattern
async function fetchVideoData() {
  let videoData = await fetchFromDb(videoId);
  if (!videoData) {
    videoData = await fetchFromApi(videoId);
  }

  if (!videoData) {
    throw new Error(`Could not fetch video data for ID: ${videoId} from database or API`);
  }

  const normalizedVideo = {
    id: videoData.id,
    videoId: videoData.id,
    title: videoData.title || "Untitled Video",
    description: videoData.description || null,
    imageUrls: Array.isArray(videoData.imageUrls) ? videoData.imageUrls : [],
    audioUrl: videoData.audioUrl || "",
    captions: Array.isArray(videoData.captions) ? videoData.captions : [],
    script: videoData.script || "",
    voice: videoData.voice || "",
    captionStyle: videoData.captionStyle || "default",
    status: videoData.status || "completed",
    createdAt: videoData.createdAt ? new Date(videoData.createdAt).toISOString() : new Date().toISOString(),
    createdBy: videoData.createdBy || ""
  };

  const filePayload = {
    video: normalizedVideo,
    ...normalizedVideo
  };

  fs.writeFileSync('video-data.json', JSON.stringify(filePayload, null, 2));
  console.log('Video data saved to video-data.json');
  return filePayload;
}

// Execute the function
fetchVideoData().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1); 
});