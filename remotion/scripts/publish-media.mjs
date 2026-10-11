// Copies rendered clips into the web app's public/media folder.
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";

const out = path.resolve("out");
const dest = path.resolve("../public/media");
mkdirSync(dest, { recursive: true });
for (const f of ["intro.mp4", "intro.webm", "intro-mobile.mp4", "intro-poster.jpg", "door.mp4", "rooftop.mp4", "montage.mp4"]) {
  const src = path.join(out, f);
  if (existsSync(src)) {
    copyFileSync(src, path.join(dest, f));
    console.log(`published ${f}`);
  }
}
