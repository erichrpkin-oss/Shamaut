/**
 * One-time helper to obtain a YouTube refresh token.
 *
 * IMPORTANT: run this on your own computer (with a real browser), not inside
 * a remote/headless environment — Google needs to redirect your browser back
 * to a "localhost" URL that only makes sense on the machine you're browsing on.
 *
 * Usage:
 *   YOUTUBE_CLIENT_ID=... YOUTUBE_CLIENT_SECRET=... npm run youtube:auth
 */
import { createServer } from "node:http";
import { google } from "googleapis";
import { requireEnv } from "./lib/env";

const PORT = 53_682;
const REDIRECT_URI = `http://localhost:${PORT}/oauth2callback`;

const main = async () => {
  const clientId = requireEnv("YOUTUBE_CLIENT_ID");
  const clientSecret = requireEnv("YOUTUBE_CLIENT_SECRET");

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    REDIRECT_URI,
  );

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: ["https://www.googleapis.com/auth/youtube.upload"],
  });

  console.log("\nOpen this URL in your browser and approve access:\n");
  console.log(authUrl);
  console.log(
    "\nWaiting for you to approve access in the browser (listening on " +
      REDIRECT_URI +
      ")...\n",
  );

  const code = await new Promise<string>((resolve, reject) => {
    const server = createServer((req, res) => {
      if (!req.url) return;
      const url = new URL(req.url, REDIRECT_URI);
      const code = url.searchParams.get("code");
      const error = url.searchParams.get("error");

      if (error) {
        res.end("Authorization failed. You can close this tab.");
        server.close();
        reject(new Error(`OAuth error: ${error}`));
        return;
      }

      if (code) {
        res.end("Authorization complete! You can close this tab.");
        server.close();
        resolve(code);
      }
    });

    server.listen(PORT);
  });

  const { tokens } = await oauth2Client.getToken(code);

  if (!tokens.refresh_token) {
    console.error(
      "\nNo refresh token was returned. Revoke access at https://myaccount.google.com/permissions and run this again (make sure prompt=consent, which is already set).",
    );
    process.exit(1);
  }

  console.log("\nSuccess! Add this to your .env file:\n");
  console.log(`YOUTUBE_REFRESH_TOKEN=${tokens.refresh_token}`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
