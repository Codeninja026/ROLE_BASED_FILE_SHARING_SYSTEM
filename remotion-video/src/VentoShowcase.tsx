import React from "react";
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  interpolate,
} from "remotion";
import { LoginScene } from "./scenes/LoginScene";
import { DashboardScene } from "./scenes/DashboardScene";
import { FileUploadScene } from "./scenes/FileUploadScene";
import { FolderCreateScene } from "./scenes/FolderCreateScene";
import { FolderShareScene } from "./scenes/FolderShareScene";
import { RoleAccessScene } from "./scenes/RoleAccessScene";

const SCENES = [
  { component: LoginScene, from: 0, duration: 165 },
  { component: DashboardScene, from: 165, duration: 180 },
  { component: FileUploadScene, from: 345, duration: 165 },
  { component: FolderCreateScene, from: 510, duration: 165 },
  { component: FolderShareScene, from: 675, duration: 180 },
  { component: RoleAccessScene, from: 855, duration: 195 },
];

export const VentoShowcase: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#07070d",
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
      }}
    >
      {/* Subtle background gradient */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(0,180,140,0.06) 0%, transparent 70%)",
        }}
      />

      {/* Scene sequences */}
      {SCENES.map(({ component: SceneComponent, from, duration }, i) => (
        <Sequence key={i} from={from} durationInFrames={duration}>
          <SceneWrapper>
            <SceneComponent />
          </SceneWrapper>
        </Sequence>
      ))}

      {/* Global vignette overlay */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 70% 70% at 50% 50%, transparent 40%, rgba(7,7,13,0.5) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Intro fade */}
      {frame < 20 && (
        <AbsoluteFill
          style={{
            backgroundColor: "#07070d",
            opacity: interpolate(frame, [0, 20], [1, 0]),
          }}
        />
      )}

      {/* Outro fade */}
      {frame > 1020 && (
        <AbsoluteFill
          style={{
            backgroundColor: "#07070d",
            opacity: interpolate(frame, [1020, 1050], [0, 1]),
          }}
        />
      )}
    </AbsoluteFill>
  );
};

/* Wrapper that adds fade-in/fade-out to each scene */
const SceneWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [0, 12, 1000], [0, 1, 1], {
    extrapolateRight: "clamp",
  });

  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};
