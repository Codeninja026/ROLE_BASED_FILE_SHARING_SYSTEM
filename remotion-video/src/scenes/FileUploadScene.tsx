import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";

/* ─── File Upload Scene ─── */
export const FileUploadScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enterProgress = spring({ frame, fps, config: { damping: 14, stiffness: 70 } });
  const exitOpacity = interpolate(frame, [150, 165], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Upload zone pulse
  const zonePulse = Math.sin(frame * 0.08) * 0.3 + 0.7;

  // Files flying in
  const flyingFiles = [
    { name: "Report.pdf", delay: 30, x: -200, y: -150, color: "#ef4444" },
    { name: "Photo.png", delay: 45, x: 180, y: -120, color: "#3b82f6" },
    { name: "Data.xlsx", delay: 58, x: -150, y: 100, color: "#22c55e" },
  ];

  // Progress bar
  const progressPercent = interpolate(frame, [75, 120], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Checkmark
  const checkSpring = spring({ frame: Math.max(0, frame - 122), fps, config: { damping: 8, stiffness: 150 } });

  // Success text
  const successOpacity = interpolate(frame, [128, 140], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: exitOpacity }}>
      <div style={{
        width: 1400, height: 820,
        background: "linear-gradient(180deg, #0f0f1a 0%, #0a0a14 100%)",
        borderRadius: 24, border: "1px solid rgba(255,255,255,0.06)",
        boxShadow: "0 40px 120px rgba(0,0,0,0.6)",
        overflow: "hidden", position: "relative",
        opacity: interpolate(enterProgress, [0, 1], [0, 1]),
        transform: `translateY(${interpolate(enterProgress, [0, 1], [40, 0])}px)`,
      }}>
        {/* Browser chrome */}
        <div style={{ height: 48, background: "rgba(255,255,255,0.03)", display: "flex", alignItems: "center", padding: "0 20px", gap: 8, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ width: 12, height: 12, borderRadius: 6, background: "#ff5f57" }} />
          <div style={{ width: 12, height: 12, borderRadius: 6, background: "#febc2e" }} />
          <div style={{ width: 12, height: 12, borderRadius: 6, background: "#28c840" }} />
          <div style={{ marginLeft: 40, flex: 1, height: 28, borderRadius: 8, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", padding: "0 14px" }}>
            <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 12, fontWeight: 500 }}>vento.enterprise.io/files</span>
          </div>
        </div>

        {/* Content */}
        <div style={{
          height: "calc(100% - 48px)", display: "flex", justifyContent: "center", alignItems: "center",
          background: "radial-gradient(ellipse 60% 50% at 50% 45%, rgba(99,102,241,0.04) 0%, transparent 70%)",
        }}>
          <div style={{ textAlign: "center", position: "relative", width: 600 }}>
            {/* Upload zone */}
            <div style={{
              width: 500, height: 280, margin: "0 auto",
              borderRadius: 24,
              border: `2px dashed rgba(0,212,170,${0.15 + zonePulse * 0.15})`,
              background: `rgba(0,212,170,${0.02 + zonePulse * 0.02})`,
              display: "flex", flexDirection: "column",
              justifyContent: "center", alignItems: "center",
              position: "relative", overflow: "hidden",
            }}>
              {/* Cloud icon */}
              <div style={{
                opacity: progressPercent > 0 ? 0.3 : 0.8,
                marginBottom: 16,
                transition: "opacity 0.3s",
              }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(0,212,170,0.6)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17,8 12,3 7,8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>

              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, fontWeight: 600 }}>
                {progressPercent >= 100 ? "" : progressPercent > 0 ? "Uploading..." : "Drop files here or click to upload"}
              </div>

              {/* Flying file icons */}
              {flyingFiles.map((f, i) => {
                const fileProgress = spring({ frame: Math.max(0, frame - f.delay), fps, config: { damping: 12, stiffness: 80 } });
                const isLanded = frame > f.delay + 20;
                return (
                  <div key={i} style={{
                    position: "absolute",
                    left: `calc(50% + ${interpolate(fileProgress, [0, 1], [f.x, (i - 1) * 80])}px)`,
                    top: `calc(50% + ${interpolate(fileProgress, [0, 1], [f.y, 60])}px)`,
                    transform: `translate(-50%, -50%) scale(${interpolate(fileProgress, [0, 1], [0.5, 1])}) rotate(${interpolate(fileProgress, [0, 1], [15, 0])}deg)`,
                    opacity: fileProgress,
                  }}>
                    <div style={{
                      width: 56, height: 68, borderRadius: 10,
                      background: `${f.color}15`, border: `1px solid ${f.color}30`,
                      display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 4,
                    }}>
                      <div style={{ width: 20, height: 4, borderRadius: 2, background: f.color, opacity: 0.6 }} />
                      <div style={{ width: 28, height: 3, borderRadius: 2, background: f.color, opacity: 0.3 }} />
                      <span style={{ color: f.color, fontSize: 8, fontWeight: 800, marginTop: 4 }}>{f.name.split(".")[1]?.toUpperCase()}</span>
                    </div>
                  </div>
                );
              })}

              {/* Progress bar */}
              {progressPercent > 0 && progressPercent < 100 && (
                <div style={{
                  position: "absolute", bottom: 40, left: 60, right: 60,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 600 }}>Uploading 3 files...</span>
                    <span style={{ color: "#00d4aa", fontSize: 11, fontWeight: 700 }}>{Math.floor(progressPercent)}%</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                    <div style={{
                      width: `${progressPercent}%`, height: "100%", borderRadius: 3,
                      background: "linear-gradient(90deg, #00d4aa, #00b894)",
                      boxShadow: "0 0 16px rgba(0,212,170,0.4)",
                    }} />
                  </div>
                </div>
              )}

              {/* Success checkmark */}
              {checkSpring > 0 && (
                <div style={{
                  position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
                  display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
                  background: "rgba(10,10,20,0.85)",
                  opacity: checkSpring,
                  transform: `scale(${checkSpring})`,
                }}>
                  <div style={{
                    width: 64, height: 64, borderRadius: 32,
                    background: "linear-gradient(135deg, #00d4aa, #10b981)",
                    display: "flex", justifyContent: "center", alignItems: "center",
                    boxShadow: "0 8px 32px rgba(0,212,170,0.4)",
                    marginBottom: 16,
                  }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20,6 9,17 4,12" />
                    </svg>
                  </div>
                  <span style={{ color: "#fff", fontSize: 16, fontWeight: 700, opacity: successOpacity }}>Upload Complete!</span>
                  <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 500, marginTop: 4, opacity: successOpacity }}>3 files uploaded successfully</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Scene label */}
      <div style={{
        position: "absolute", bottom: 60, left: 0, right: 0, textAlign: "center",
        opacity: interpolate(frame, [20, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
      }}>
        <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: 4 }}>Smart File Upload</span>
      </div>
    </AbsoluteFill>
  );
};
