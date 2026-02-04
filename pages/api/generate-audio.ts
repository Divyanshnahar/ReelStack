import type { NextApiRequest, NextApiResponse } from 'next';
import cloudinary from '@/lib/cloudinary';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';

interface Scene {
  imagePrompt: string;
  contentText: string;
}

interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  resource_type: string;
  format: string;
  version: number;
  type: string;
  created_at: string;
  bytes: number;
  url: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { scenes, voice } = req.body as { scenes: Scene[]; voice: string };

    const combinedText = scenes.map(scene => scene.contentText).join('\n\n');

    const tts = new MsEdgeTTS();
    await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

    const { audioStream } = await tts.toStream(combinedText);
    const chunks: Buffer[] = [];

    await new Promise<void>((resolve, reject) => {
      audioStream.on('data', (chunk: Buffer) => {
        chunks.push(chunk);
      });
      audioStream.on('end', () => resolve());
      audioStream.on('error', reject);
    });

    const audioBuffer = Buffer.concat(chunks);
    const fileName = `audio_${Date.now()}.mp3`;

    const uploadResult = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          folder: 'reelsstack',
          public_id: fileName.replace('.mp3', ''),
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result as CloudinaryUploadResult);
        }
      ).end(audioBuffer);
    });

    return res.status(200).json({
      success: true,
      message: 'Audio file generated and uploaded successfully',
      audioUrl: uploadResult.secure_url,
    });

  } catch (error) {
    console.error('Error generating audio:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
