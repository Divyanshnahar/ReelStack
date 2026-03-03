import { NextResponse } from "next/server";
import { HfInference } from "@huggingface/inference";

// export const runtime = 'edge';


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

// generate using Pollinations Flux model, which is free and previously
// documented in the README.  This is the default generator used by the
// original project.
async function generateImageWithFlux(prompt: string): Promise<string> {
  const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1080&height=1920&seed=27529&model=flux&nologo=true&private=false&enhance=false&safe=false`;
  console.log('[FLUX] fetching', pollinationsUrl);
  const response = await fetch(pollinationsUrl);
  if (!response.ok) {
    throw new Error(`Flux image generation failed: ${response.status}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  const base64Image = Buffer.from(arrayBuffer).toString("base64");
  return `data:image/jpeg;base64,${base64Image}`;
}

// Optional HuggingFace image generation using the official inference client.
// This is more reliable than raw fetch calls.
async function generateImageWithHF(prompt: string): Promise<string> {
  const hfToken = process.env.HUGGING_FACE_API_KEY;
  if (!hfToken) {
    throw new Error('HuggingFace API key not configured');
  }

  try {
    const client = new HfInference(hfToken);
    console.log('[HF] calling text_to_image with prompt:', prompt);

    const blob = await client.textToImage({
      inputs: prompt,
      model: "stabilityai/stable-diffusion-xl-base-1.0",
    }) as unknown as Blob;

    // blob is already a Blob, convert to base64
    const arrayBuffer = await blob.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString("base64");
    console.log('[HF] image generated successfully');

    return `data:image/jpeg;base64,${base64Image}`;
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[HF_ERROR]', msg);
    throw new Error(`HuggingFace API failed: ${msg}`);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt } = body;

    if (!prompt) {
      return new NextResponse("Prompt is required", { status: 400 });
    }

    // try flux first, fall back to HF if available
    let imageBase64: string;
    try {
      imageBase64 = await generateImageWithHF(prompt);
    } catch (err) {
      console.warn('[IMG] HF failed, attempting HF fallback', err);
      imageBase64 = await generateImageWithFlux(prompt);
    }

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