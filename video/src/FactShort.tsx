import type { Caption } from "@remotion/captions";
import { createTikTokStyleCaptions } from "@remotion/captions";
import React, { useMemo } from "react";
import {
  AbsoluteFill,
  Audio,
  CalculateMetadataFunction,
  Composition,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export type FactShortProps = {
  topic: string;
  factText: string;
  audioFileName: string;
  captions: Caption[];
};

export const FACT_SHORT_FPS = 30;
export const FACT_SHORT_WIDTH = 1080;
export const FACT_SHORT_HEIGHT = 1920;

const OUTRO_BUFFER_MS = 900;
const MIN_DURATION_IN_FRAMES = FACT_SHORT_FPS * 3;

export const calculateFactShortMetadata: CalculateMetadataFunction<
  FactShortProps
> = ({ props }) => {
  const lastCaption = props.captions[props.captions.length - 1];
  const endMs = lastCaption ? lastCaption.endMs : 3000;
  const durationInFrames = Math.max(
    Math.round(((endMs + OUTRO_BUFFER_MS) / 1000) * FACT_SHORT_FPS),
    MIN_DURATION_IN_FRAMES,
  );

  return {
    durationInFrames,
    fps: FACT_SHORT_FPS,
    width: FACT_SHORT_WIDTH,
    height: FACT_SHORT_HEIGHT,
  };
};

const AnimatedBackground: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const angle = interpolate(frame, [0, durationInFrames], [0, 60]);

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(${angle}deg, #0f0c29, #302b63, #24243e)`,
      }}
    />
  );
};

const KaraokeCaptions: React.FC<{ captions: Caption[] }> = ({ captions }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTimeMs = (frame / fps) * 1000;

  const pages = useMemo(
    () =>
      createTikTokStyleCaptions({
        captions,
        combineTokensWithinMilliseconds: 1200,
      }).pages,
    [captions],
  );

  const page = pages.find(
    (candidate) =>
      currentTimeMs >= candidate.startMs &&
      currentTimeMs < candidate.startMs + candidate.durationMs,
  );

  if (!page) {
    return null;
  }

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "0 14px",
        maxWidth: 880,
        fontFamily: "Arial, Helvetica, sans-serif",
        fontSize: 64,
        fontWeight: 800,
        textAlign: "center",
        lineHeight: 1.3,
      }}
    >
      {page.tokens.map((token, i) => {
        const isActive =
          currentTimeMs >= token.fromMs && currentTimeMs < token.toMs;
        const isPast = currentTimeMs >= token.toMs;

        return (
          <span
            key={`${token.fromMs}-${i}`}
            style={{
              color: isActive ? "#ffe45e" : "#ffffff",
              opacity: isPast || isActive ? 1 : 0.7,
              WebkitTextStroke: "3px black",
              paintOrder: "stroke fill",
              transform: isActive ? "scale(1.08)" : "scale(1)",
              display: "inline-block",
            }}
          >
            {token.text.trim()}
          </span>
        );
      })}
    </div>
  );
};

export const FactShort: React.FC<FactShortProps> = ({
  topic,
  audioFileName,
  captions,
}) => {
  return (
    <AbsoluteFill>
      <AnimatedBackground />
      <AbsoluteFill
        style={{
          justifyContent: "flex-start",
          alignItems: "center",
          paddingTop: 120,
        }}
      >
        <div
          style={{
            fontFamily: "Arial, Helvetica, sans-serif",
            fontSize: 48,
            fontWeight: 900,
            color: "#ffffff",
            textTransform: "uppercase",
            letterSpacing: 2,
            WebkitTextStroke: "2px black",
            paintOrder: "stroke fill",
          }}
        >
          {topic}
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <KaraokeCaptions captions={captions} />
      </AbsoluteFill>
      {audioFileName ? <Audio src={staticFile(audioFileName)} /> : null}
    </AbsoluteFill>
  );
};

const sampleCaptions: Caption[] = [
  {
    text: "Honey",
    startMs: 0,
    endMs: 400,
    timestampMs: 200,
    confidence: null,
  },
  {
    text: "never",
    startMs: 400,
    endMs: 700,
    timestampMs: 550,
    confidence: null,
  },
  {
    text: "spoils.",
    startMs: 700,
    endMs: 1200,
    timestampMs: 950,
    confidence: null,
  },
  {
    text: "Archaeologists",
    startMs: 1400,
    endMs: 2200,
    timestampMs: 1800,
    confidence: null,
  },
  {
    text: "found",
    startMs: 2200,
    endMs: 2600,
    timestampMs: 2400,
    confidence: null,
  },
  {
    text: "3000-year-old",
    startMs: 2600,
    endMs: 3400,
    timestampMs: 3000,
    confidence: null,
  },
  {
    text: "honey",
    startMs: 3400,
    endMs: 3800,
    timestampMs: 3600,
    confidence: null,
  },
  {
    text: "in",
    startMs: 3800,
    endMs: 3900,
    timestampMs: 3850,
    confidence: null,
  },
  {
    text: "Egyptian",
    startMs: 3900,
    endMs: 4400,
    timestampMs: 4150,
    confidence: null,
  },
  {
    text: "tombs",
    startMs: 4400,
    endMs: 4900,
    timestampMs: 4650,
    confidence: null,
  },
  {
    text: "that",
    startMs: 5000,
    endMs: 5200,
    timestampMs: 5100,
    confidence: null,
  },
  {
    text: "is",
    startMs: 5200,
    endMs: 5350,
    timestampMs: 5275,
    confidence: null,
  },
  {
    text: "still",
    startMs: 5350,
    endMs: 5650,
    timestampMs: 5500,
    confidence: null,
  },
  {
    text: "edible.",
    startMs: 5650,
    endMs: 6200,
    timestampMs: 5925,
    confidence: null,
  },
];

export const FactShortComposition: React.FC = () => {
  return (
    <Composition
      id="FactShort"
      component={FactShort}
      durationInFrames={FACT_SHORT_FPS * 15}
      fps={FACT_SHORT_FPS}
      width={FACT_SHORT_WIDTH}
      height={FACT_SHORT_HEIGHT}
      calculateMetadata={calculateFactShortMetadata}
      defaultProps={
        {
          topic: "Did You Know?",
          factText:
            "Honey never spoils. Archaeologists have found 3000-year-old honey in Egyptian tombs that is still edible.",
          audioFileName: "",
          captions: sampleCaptions,
        } satisfies FactShortProps
      }
    />
  );
};
