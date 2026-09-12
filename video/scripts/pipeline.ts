import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { FactShortProps } from "../src/FactShort";
import { generateNarrationAudio } from "./generate-audio";
import { renderFactShort } from "./render-video";
import { transcribeToCaptions } from "./transcribe";
import { uploadToYouTube } from "./upload-youtube";

type Fact = {
  id: string;
  topic: string;
  text: string;
  used: boolean;
};

const FACTS_PATH = path.resolve(process.cwd(), "scripts/facts.json");
const AUDIO_DIR = path.resolve(process.cwd(), "public/audio");
const OUT_DIR = path.resolve(process.cwd(), "out");

const skipUpload = process.argv.includes("--no-upload");

const loadFacts = async (): Promise<Fact[]> => {
  const raw = await readFile(FACTS_PATH, "utf-8");
  return JSON.parse(raw) as Fact[];
};

const saveFacts = async (facts: Fact[]): Promise<void> => {
  await writeFile(FACTS_PATH, `${JSON.stringify(facts, null, 2)}\n`);
};

const main = async () => {
  const facts = await loadFacts();
  const fact = facts.find((f) => !f.used);

  if (!fact) {
    console.log(
      "All facts have been used! Add more entries to scripts/facts.json.",
    );
    return;
  }

  console.log(`Producing short for fact: ${fact.id}`);

  await mkdir(AUDIO_DIR, { recursive: true });
  await mkdir(OUT_DIR, { recursive: true });

  const audioFileName = `audio/${fact.id}.mp3`;
  const audioPath = path.join(AUDIO_DIR, `${fact.id}.mp3`);

  console.log("1/4 Generating narration audio...");
  await generateNarrationAudio({ text: fact.text, outPath: audioPath });

  console.log("2/4 Transcribing narration for synced captions...");
  const captions = await transcribeToCaptions(audioPath);

  const props: FactShortProps = {
    topic: fact.topic,
    factText: fact.text,
    audioFileName,
    captions,
  };

  const outPath = path.join(OUT_DIR, `${fact.id}.mp4`);
  console.log("3/4 Rendering video...");
  await renderFactShort({ props, outPath });
  console.log(`Rendered to ${outPath}`);

  if (skipUpload) {
    console.log("4/4 Skipping YouTube upload (--no-upload passed).");
  } else {
    console.log("4/4 Uploading to YouTube...");
    const result = await uploadToYouTube({
      filePath: outPath,
      title: `${fact.topic} #shorts`,
      description: `${fact.text}\n\n#shorts #didyouknow #facts`,
      tags: ["shorts", "facts", "did you know", "trivia"],
    });
    console.log(`Uploaded: ${result.url}`);
  }

  fact.used = true;
  await saveFacts(facts);
  console.log("Marked fact as used in scripts/facts.json.");
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
