#!/usr/bin/env node
/**
 * Frontrowly Facebook / Instagram ad videos (~15s, silent MP4).
 * Run: node scripts/generate-facebook-ad-video.mjs
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const FFMPEG = ffmpegInstaller.path;
const OUT_DIR = path.join(ROOT, "public", "brand", "facebook");
const TMP = path.join(OUT_DIR, ".video-tmp");

const W = 1080;
const H = 1920;
const FPS = 30;
const SCENE_SEC = 5;

const FONT_BOLD = "C\\:/Windows/Fonts/arialbd.ttf";
const FONT_REG = "C\\:/Windows/Fonts/arial.ttf";

const scenes = [
  {
    image: "public/images/events/match-104.jpg",
    line1: "WORLD CUP & LIVE SPORTS",
    line2: "Premium seats · Guaranteed together",
  },
  {
    image: "public/images/events/match-91.jpg",
    line1: "PICK YOUR SECTION",
    line2: "Interactive stadium maps",
  },
  {
    image: "public/brand/facebook/cover.png",
    line1: "FRONTROWLY",
    line2: "Book at frontrowly.com",
  },
];

function run(args, label) {
  console.log(`\n→ ${label}`);
  const result = spawnSync(FFMPEG, ["-y", ...args], { stdio: "inherit", cwd: ROOT });
  if (result.status !== 0) {
    console.error(`ffmpeg failed: ${label}`);
    process.exit(result.status ?? 1);
  }
}

function escapeDrawtext(value) {
  return value.replace(/\\/g, "\\\\").replace(/:/g, "\\:").replace(/'/g, "'\\''");
}

function sceneFilter(line1, line2) {
  const t1 = escapeDrawtext(line1);
  const t2 = escapeDrawtext(line2);

  return [
    `scale=${W}:${H}:force_original_aspect_ratio=increase`,
    `crop=${W}:${H}`,
    `drawbox=x=0:y=0:w=iw:h=ih:color=black@0.42:t=fill`,
    `drawtext=fontfile='${FONT_BOLD}':text='${t1}':fontsize=54:fontcolor=white:x=(w-text_w)/2:y=h*0.70:shadowcolor=black@0.65:shadowx=2:shadowy=2`,
    `drawtext=fontfile='${FONT_REG}':text='${t2}':fontsize=34:fontcolor=0xE0F2FE:x=(w-text_w)/2:y=h*0.76:shadowcolor=black@0.5:shadowx=1:shadowy=1`,
    `fps=${FPS}`,
    "format=yuv420p",
  ].join(",");
}

function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.mkdirSync(TMP, { recursive: true });

  for (const scene of scenes) {
    if (!fs.existsSync(path.join(ROOT, scene.image))) {
      console.error(`Missing image: ${scene.image}`);
      process.exit(1);
    }
  }

  const clipPaths = scenes.map((_, i) => path.join(TMP, `scene-${i}.mp4`));

  scenes.forEach((scene, i) => {
    run(
      [
        "-loop",
        "1",
        "-i",
        scene.image,
        "-vf",
        sceneFilter(scene.line1, scene.line2),
        "-t",
        String(SCENE_SEC),
        "-r",
        String(FPS),
        "-c:v",
        "libx264",
        "-preset",
        "fast",
        "-crf",
        "22",
        "-pix_fmt",
        "yuv420p",
        "-an",
        clipPaths[i],
      ],
      `Scene ${i + 1}/${scenes.length}`
    );
  });

  const listFile = path.join(TMP, "concat.txt");
  fs.writeFileSync(
    listFile,
    clipPaths.map((p) => `file '${p.replace(/\\/g, "/")}'`).join("\n")
  );

  const merged = path.join(TMP, "merged.mp4");
  run(["-f", "concat", "-safe", "0", "-i", listFile, "-c", "copy", merged], "Concat scenes");

  const verticalOut = path.join(OUT_DIR, "ad-reels-9x16.mp4");
  const totalSec = SCENE_SEC * scenes.length;
  run(
    [
      "-i",
      merged,
      "-vf",
      `fade=t=in:st=0:d=0.5,fade=t=out:st=${totalSec - 0.5}:d=0.5`,
      "-c:v",
      "libx264",
      "-preset",
      "fast",
      "-crf",
      "22",
      "-pix_fmt",
      "yuv420p",
      "-movflags",
      "+faststart",
      "-an",
      verticalOut,
    ],
    "Fade in/out"
  );

  const squareOut = path.join(OUT_DIR, "ad-feed-1x1.mp4");
  run(
    [
      "-i",
      verticalOut,
      "-vf",
      `scale=${W}:${W}:force_original_aspect_ratio=increase,crop=${W}:${W}`,
      "-c:v",
      "libx264",
      "-preset",
      "fast",
      "-crf",
      "22",
      "-pix_fmt",
      "yuv420p",
      "-movflags",
      "+faststart",
      "-an",
      squareOut,
    ],
    "Crop 1:1 feed version"
  );

  fs.rmSync(TMP, { recursive: true, force: true });

  console.log("\nDone:");
  console.log(`  ${path.relative(ROOT, verticalOut)}  (9:16 — Reels, Stories)`);
  console.log(`  ${path.relative(ROOT, squareOut)}  (1:1 — feed ads)`);
  console.log("\nAdd music in Meta Ads Manager — export is silent on purpose.");
}

main();
