import { createClient } from "@deepgram/sdk";
import { NextResponse } from "next/server";

const deepgram = createClient(process.env.DEEPGRAM_API_KEY!);

export async function POST(request: Request) {
    try {
        const { audioUrl } = await request.json();

        if (!audioUrl) {
            return NextResponse.json({ error: "Audio URL is required" }, { status: 400 });
        }

        const { result, error } = await deepgram.listen.prerecorded.transcribeUrl(
            { url: audioUrl },
            { 
                model: "nova-2", 
                smart_format: true,
                utterances: true 
            }
        );

        if (error) throw new Error(error.message);

        const words = result.results?.channels[0]?.alternatives[0]?.words || [];
        
        const transcript = words.map(({ word, start, end, confidence, punctuated_word }) => ({
            word,
            start,
            end,
            confidence,
            punctuated_word: punctuated_word ?? word
        }));

        return NextResponse.json({ transcript }, { status: 200 });
        
    } catch (err: any) {
        console.error('[DEEPGRAM_TRANSCRIPTION_ERROR]:', err.message);
        return NextResponse.json(
            { error: err.message || "Failed to generate captions" }, 
            { status: 500 }
        );
    }
}