/*
 * Install the Generative AI SDK
 *
 * $ npm install @google/generative-ai
 */

import {
  GoogleGenerativeAI,
} from "@google/generative-ai";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "application/json",
};

/**
 * Create a fresh chat session configured to return only the expected JSON
 * structure. Invoking this on every request prevents stray history (example
 * outputs or notes) from contaminating subsequent responses.
 */
export function createChatSession() {
  return model.startChat({
    generationConfig,
  });
}

// Legacy export kept for backwards compatibility; prefer createChatSession().
export const chatSession = createChatSession();
