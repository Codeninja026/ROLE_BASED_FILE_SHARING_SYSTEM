import React from "react";
import { Composition } from "remotion";
import { VentoShowcase } from "./VentoShowcase";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="VentoShowcase"
      component={VentoShowcase}
      width={1920}
      height={1080}
      fps={30}
      durationInFrames={1050}
    />
  );
};
