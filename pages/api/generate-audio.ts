import type { NextApiRequest, NextApiResponse } from "next";
import cloudinary from "@/lib/cloudinary";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

interface Scene {
  imagePrompt: string;
  contentText: string;
}

interface CloudinaryUploadResult {
  secure_url: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed",
    });
  }

  try {
    const { scenes } = req.body as { scenes: Scene[] };

    if (!scenes || !Array.isArray(scenes)) {
      return res.status(400).json({
        success: false,
        error: "Invalid scenes",
      });
    }

    const combinedText = scenes
      .map((scene) => scene.contentText)
      .join("\n\n");

    const elevenlabs = new ElevenLabsClient({
      apiKey: process.env.ELEVENLABS_API_KEY,
    });

    const voiceId = "JBFqnCBsd6RMkjVDRZzb";

    console.log("[TTS] Generating audio...");

    const audioStream = await elevenlabs.textToSpeech.convert(
      voiceId,
      {
        text: combinedText,
        modelId: "eleven_multilingual_v2",
        outputFormat: "mp3_44100_128",
      }
    );

    // 🔥 Convert ReadableStream → Buffer
    const reader = audioStream.getReader();
    const chunks: Uint8Array[] = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }

    const audioBuffer = Buffer.concat(
      chunks.map((chunk) => Buffer.from(chunk))
    );

    console.log("[TTS] Audio size:", audioBuffer.length, "bytes");

    const fileName = `audio_${Date.now()}`;

    const uploadResult = await new Promise<CloudinaryUploadResult>(
      (resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              resource_type: "auto",
              folder: "reelsstack",
              public_id: fileName,
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result as CloudinaryUploadResult);
            }
          )
          .end(audioBuffer);
      }
    );

    return res.status(200).json({
      success: true,
      audioUrl: uploadResult.secure_url,
    });
  } catch (error) {
    console.error("[AUDIO_ERROR]", error);

    return res.status(500).json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Audio generation failed",
    });
  }
}