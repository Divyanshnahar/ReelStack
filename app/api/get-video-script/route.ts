import { createChatSession } from "@/config/model";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { prompt } = await req.json();
        console.log('[get-video-script] prompt:', prompt);

        // create a fresh session to avoid history/notes from previous calls
        const session = createChatSession();
        const result = await session.sendMessage(`
You are an assistant that responds with a JSON array only.
Each item must be an object with:
- "imagePrompt": string
- "contentText": string

Do NOT include explanation.
Do NOT include markdown.
Do NOT wrap in backticks.
Return valid JSON only.

${prompt}
`);
        // const text = await result.response.text();
        const rawText = await result.response.text();

        const text = rawText
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

        console.log('[get-video-script] cleaned response:', text);
        console.log('[get-video-script] raw response:', text);

        let parsed;
        try {
            parsed = JSON.parse(text);
        } catch (err) {
            console.error('[get-video-script] JSON parse error', err);
            return NextResponse.json({
                error: 'invalid_json',
                message: 'Unable to parse JSON from model response',
                raw: text,
            }, { status: 500 });
        }

        if (!Array.isArray(parsed)) {
            console.error('[get-video-script] response not an array');
            return NextResponse.json({
                error: 'unexpected_format',
                message: 'Model returned something other than an array',
                raw: parsed,
            }, { status: 500 });
        }

        return NextResponse.json({ result: parsed });
    } catch (error) {
        console.error('[get-video-script] error', error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}