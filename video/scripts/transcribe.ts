import { createReadStream } from "node:fs";
import type { Caption } from "@remotion/captions";
import OpenAI from "openai";
import { requireEnv } from "./lib/env";

export const transcribeToCaptions = async (
  audioPath: string,
): Promise<Caption[]> => {
  const client = new OpenAI({ apiKey: requireEnv("OPENAI_API_KEY") });

  const transcription = await client.audio.transcriptions.create({
    file: createReadStream(audioPath),
    model: "whisper-1",
    response_format: "verbose_json",
    timestamp_granularities: ["word"],
  });

  const words = (transcription as unknown as {
    words?: { word: string; start: number; end: number }[];
  }).words;

  if (!words || words.length === 0) {
    throw new Error(
      "Whisper did not return word-level timestamps. Try again or check the audio file.",
    );
  }

  return words.map((word, index) => {
    const startMs = Math.round(word.start * 1000);
    const endMs = Math.round(word.end * 1000);
    return {
      text: word.word,
      startMs,
      endMs,
      timestampMs: Math.round((startMs + endMs) / 2),
      confidence: null,
      pageBreakAfter: index === words.length - 1,
    } satisfies Caption;
  });
};
