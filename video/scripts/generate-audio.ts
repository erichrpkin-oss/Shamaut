import { writeFile } from "node:fs/promises";
import OpenAI from "openai";
import { requireEnv } from "./lib/env";

export type TtsVoice =
  | "alloy"
  | "echo"
  | "fable"
  | "onyx"
  | "nova"
  | "shimmer";

export const generateNarrationAudio = async ({
  text,
  outPath,
  voice = "onyx",
}: {
  text: string;
  outPath: string;
  voice?: TtsVoice;
}): Promise<void> => {
  const client = new OpenAI({ apiKey: requireEnv("OPENAI_API_KEY") });

  const response = await client.audio.speech.create({
    model: "tts-1",
    voice,
    input: text,
    response_format: "mp3",
  });

  const buffer = Buffer.from(await response.arrayBuffer());
  await writeFile(outPath, buffer);
};
