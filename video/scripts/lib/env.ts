import "dotenv/config";

export const requireEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable ${name}. Copy .env.example to .env and fill it in.`,
    );
  }
  return value;
};

export const optionalEnv = (name: string): string | undefined => {
  return process.env[name] || undefined;
};
