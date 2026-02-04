import { NextResponse } from "next/server";

export const runtime = 'edge';


async function generateSHA1(message: string) {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-1', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

async function uploadToCloudinary(base64Image: string) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const timestamp = Math.round((new Date).getTime() / 1000).toString();

  const params = {
    timestamp: timestamp,
    folder: 'reelsstack'
  };

  // Ensure the base64 string is correctly formatted
  if (!base64Image.startsWith('data:image/jpeg;base64,')) {
    base64Image = `data:image/jpeg;base64,${base64Image}`;
  }

  const paramString = Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('&') + apiSecret;

  const signature = await generateSHA1(paramString);

  const formData = new URLSearchParams({
    file: base64Image,
    api_key: apiKey || '',
    signature: signature,
    ...params
  });

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('[CLOUDINARY_UPLOAD_ERROR]', error);
    throw new Error(`Cloudinary upload failed: ${error}`);
  }

  const data = await response.json();
  return data.secure_url;
}

async function generateImageWithFlux(prompt: string): Promise<string> {
  const maxAttempts = 3;
  let lastError = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      // Construct the Pollinations URL with the prompt
      const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1080&height=1920&seed=27529&model=flux&nologo=true&private=false&enhance=false&safe=false`;
      
      console.log(`Fetching image from: ${pollinationsUrl} (Attempt ${attempt})`);
      
      // Fetch the image directly from Pollinations
      const response = await fetch(pollinationsUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
      }
      
      // Get the image as an ArrayBuffer
      const arrayBuffer = await response.arrayBuffer();
      
      // Convert ArrayBuffer to base64 string
      const base64Image = Buffer.from(arrayBuffer).toString('base64');
      
      // Return the base64 image with the correct prefix
      return `data:image/jpeg;base64,${base64Image}`;
    } catch (error) {
      lastError = error;
      console.error(`[IMAGE_GENERATION_ERROR][Attempt ${attempt}]`, error);
      if (attempt < maxAttempts) {
        // Optionally, add a small delay before retrying
        await new Promise(res => setTimeout(res, 500));
      }
    }
  }
  throw lastError;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt } = body;

    if (!prompt) {
      return new NextResponse("Prompt is required", { status: 400 });
    }

    const imageBase64 = await generateImageWithFlux(prompt);

    if (!imageBase64) {
      return new NextResponse("Failed to generate image", { status: 500 });
    }

    const cloudinaryUrl = await uploadToCloudinary(imageBase64);

    if (!cloudinaryUrl) {
      return new NextResponse("Failed to upload image", { status: 500 });
    }

    return NextResponse.json({
      imageUrl: cloudinaryUrl
    });

  } catch (error) {
    console.error('[API_ERROR]', error);
    return new NextResponse(error instanceof Error ? error.message : "Internal Server Error", { 
      status: 500 
    });
  }
}