import path from "node:path";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import type { FactShortProps } from "../src/FactShort";

export const renderFactShort = async ({
  props,
  outPath,
}: {
  props: FactShortProps;
  outPath: string;
}): Promise<void> => {
  const bundleLocation = await bundle({
    entryPoint: path.resolve(process.cwd(), "src/index.ts"),
  });

  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: "FactShort",
    inputProps: props,
  });

  await renderMedia({
    composition,
    serveUrl: bundleLocation,
    codec: "h264",
    outputLocation: outPath,
    inputProps: props,
  });
};
