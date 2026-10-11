import { Composition } from "remotion";
import { CampusReveal, DoorTransition, Intro, IntroMobile, LogoTitle, Montage, RooftopFinale } from "./compositions/Cinematics";

const FPS = 30;

export function Root() {
  return (
    <>
      <Composition id="Intro" component={Intro} durationInFrames={270} fps={FPS} width={1920} height={1080} />
      <Composition id="IntroMobile" component={IntroMobile} durationInFrames={270} fps={FPS} width={1080} height={1920} />
      <Composition id="CampusReveal" component={CampusReveal} durationInFrames={180} fps={FPS} width={1920} height={1080} />
      <Composition id="DoorTransition" component={DoorTransition} durationInFrames={120} fps={FPS} width={1920} height={1080} />
      <Composition id="RooftopFinale" component={RooftopFinale} durationInFrames={180} fps={FPS} width={1920} height={1080} />
      <Composition id="LogoTitle" component={LogoTitle} durationInFrames={120} fps={FPS} width={1920} height={1080} />
      <Composition id="Montage" component={Montage} durationInFrames={690} fps={FPS} width={1920} height={1080} />
    </>
  );
}
