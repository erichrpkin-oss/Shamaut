import { createReadStream } from "node:fs";
import { google } from "googleapis";
import { requireEnv } from "./lib/env";

export const uploadToYouTube = async ({
  filePath,
  title,
  description,
  tags,
}: {
  filePath: string;
  title: string;
  description: string;
  tags: string[];
}): Promise<{ videoId: string; url: string }> => {
  const oauth2Client = new google.auth.OAuth2(
    requireEnv("YOUTUBE_CLIENT_ID"),
    requireEnv("YOUTUBE_CLIENT_SECRET"),
  );

  oauth2Client.setCredentials({
    refresh_token: requireEnv("YOUTUBE_REFRESH_TOKEN"),
  });

  const youtube = google.youtube({ version: "v3", auth: oauth2Client });

  const response = await youtube.videos.insert({
    part: ["snippet", "status"],
    requestBody: {
      snippet: {
        title,
        description,
        tags,
        categoryId: "27", // Education
      },
      status: {
        privacyStatus: "public",
        selfDeclaredMadeForKids: false,
      },
    },
    media: {
      body: createReadStream(filePath),
    },
  });

  const videoId = response.data.id;
  if (!videoId) {
    throw new Error("YouTube upload did not return a video id.");
  }

  return {
    videoId,
    url: `https://www.youtube.com/watch?v=${videoId}`,
  };
};
