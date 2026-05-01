import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";

/* ─── Folder Creation Scene ─── */
export const FolderCreateScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enterProgress = spring({ frame, fps, config: { damping: 14, stiffness: 70 } });
  const exitOpacity = interpolate(frame, [150, 165], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Plus button
  const plusScale = spring({ frame: Math.max(0, frame - 15), fps, config: { damping: 10, stiffness: 120 } });
  const plusClick = frame >= 28 && frame < 35;

  // Modal appears
  const modalProgress = spring({ frame: Math.max(0, frame - 32), fps, config: { damping: 12, stiffness: 90 } });

  // Folder name typing
  const folderName = "Project Documents";
  const nameChars = Math.floor(
    interpolate(frame, [50, 95], [0, folderName.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
  );
  const displayName = folderName.slice(0, nameChars);
  const cursorOn = Math.floor(frame / 12) % 2 === 0;
  const showCursor = frame >= 48 && frame < 100;

  // Create button
  const createBtnGlow = interpolate(frame, [98, 108], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Folder tree animation after creation
  const treeStart = 112;
  const folders = [
    { name: "Project Documents", depth: 0, delay: 0, icon: "📁" },
    { name: "Design Assets", depth: 1, delay: 6, icon: "📂" },
    { name: "Meeting Notes", depth: 1, delay: 12, icon: "📂" },
    { name: "Wireframes", depth: 2, delay: 18, icon: "📄" },
    { name: "Final Report.pdf", depth: 1, delay: 24, icon: "📄" },
  ];

  // Modal exit after tree shows
  const modalExit = interpolate(frame, [108, 115], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

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

        {/* Content area with file grid */}
        <div style={{
          height: "calc(100% - 48px)", padding: 40, position: "relative",
          background: "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(245,158,11,0.03) 0%, transparent 70%)",
        }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
            <div style={{ color: "#fff", fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>My Files</div>

            {/* Plus button */}
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: plusClick ? "rgba(0,212,170,0.3)" : "linear-gradient(135deg, #00d4aa, #00b894)",
              display: "flex", justifyContent: "center", alignItems: "center",
              transform: `scale(${plusScale * (plusClick ? 0.9 : 1)})`,
              boxShadow: "0 4px 16px rgba(0,212,170,0.3)",
              cursor: "pointer",
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </div>
          </div>

          {/* Existing folders grid */}
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {["Documents", "Images", "Archives"].map((name, i) => (
              <div key={name} style={{
                width: 160, height: 140, borderRadius: 16,
                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)",
                display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 10,
                opacity: interpolate(enterProgress, [0, 1], [0, 0.6]),
              }}>
                <div style={{ fontSize: 36 }}>📁</div>
                <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: 600 }}>{name}</span>
              </div>
            ))}

            {/* New folder appearing */}
            {frame >= treeStart && (
              <div style={{
                width: 160, height: 140, borderRadius: 16,
                background: "rgba(0,212,170,0.06)", border: "1px solid rgba(0,212,170,0.2)",
                display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 10,
                opacity: spring({ frame: Math.max(0, frame - treeStart), fps, config: { damping: 10, stiffness: 100 } }),
                transform: `scale(${spring({ frame: Math.max(0, frame - treeStart), fps, config: { damping: 10, stiffness: 100 } })})`,
                boxShadow: "0 8px 24px rgba(0,212,170,0.15)",
              }}>
                <div style={{ fontSize: 36 }}>📁</div>
                <span style={{ color: "#00d4aa", fontSize: 12, fontWeight: 700 }}>Project Documents</span>
              </div>
            )}
          </div>

          {/* Folder tree (bottom right) */}
          {frame >= treeStart + 10 && (
            <div style={{
              position: "absolute", right: 60, bottom: 60,
              background: "rgba(255,255,255,0.03)", borderRadius: 16,
              border: "1px solid rgba(255,255,255,0.06)", padding: 24,
              width: 320,
            }}>
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>Folder Structure</div>
              {folders.map((f, i) => {
                const itemProgress = spring({ frame: Math.max(0, frame - treeStart - 10 - f.delay), fps, config: { damping: 10, stiffness: 100 } });
                return (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 8,
                    paddingLeft: f.depth * 24, marginBottom: 8,
                    opacity: itemProgress,
                    transform: `translateX(${interpolate(itemProgress, [0, 1], [20, 0])}px)`,
                  }}>
                    <span style={{ fontSize: 14 }}>{f.icon}</span>
                    <span style={{
                      color: i === 0 ? "#00d4aa" : "rgba(255,255,255,0.6)",
                      fontSize: 12, fontWeight: i === 0 ? 700 : 500,
                    }}>{f.name}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Create Folder Modal (overlay) */}
          {modalProgress > 0 && modalExit > 0 && (
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
              display: "flex", justifyContent: "center", alignItems: "center",
              background: `rgba(7,7,13,${0.7 * modalExit})`,
            }}>
              <div style={{
                width: 440, padding: "36px 32px",
                background: "#14141f", borderRadius: 20,
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
                transform: `scale(${modalProgress * modalExit}) translateY(${interpolate(modalProgress, [0, 1], [30, 0])}px)`,
                opacity: modalProgress * modalExit,
              }}>
                <div style={{ color: "#fff", fontSize: 18, fontWeight: 800, marginBottom: 4 }}>Create New Folder</div>
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 500, marginBottom: 24 }}>Organize your files into folders</div>

                <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 700, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Folder Name</div>
                <div style={{
                  height: 48, borderRadius: 12,
                  background: "rgba(255,255,255,0.04)",
                  border: showCursor ? "1px solid rgba(0,212,170,0.5)" : "1px solid rgba(255,255,255,0.06)",
                  display: "flex", alignItems: "center", padding: "0 16px", marginBottom: 24,
                }}>
                  <span style={{ color: "#fff", fontSize: 14, fontWeight: 500 }}>{displayName}</span>
                  {showCursor && cursorOn && <span style={{ color: "#00d4aa", fontSize: 14, marginLeft: 1 }}>|</span>}
                </div>

                <div style={{ display: "flex", gap: 12 }}>
                  <div style={{
                    flex: 1, height: 44, borderRadius: 10,
                    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)",
                    display: "flex", justifyContent: "center", alignItems: "center",
                  }}>
                    <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: 600 }}>Cancel</span>
                  </div>
                  <div style={{
                    flex: 1, height: 44, borderRadius: 10,
                    background: `linear-gradient(135deg, #00d4aa, #00b894)`,
                    display: "flex", justifyContent: "center", alignItems: "center",
                    opacity: interpolate(createBtnGlow, [0, 1], [0.4, 1]),
                    boxShadow: `0 4px 20px rgba(0,212,170,${createBtnGlow * 0.3})`,
                    transform: `scale(${frame >= 108 && frame < 112 ? 0.95 : 1})`,
                  }}>
                    <span style={{ color: "#000", fontSize: 13, fontWeight: 800 }}>Create</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Scene label */}
      <div style={{
        position: "absolute", bottom: 60, left: 0, right: 0, textAlign: "center",
        opacity: interpolate(frame, [20, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
      }}>
        <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: 4 }}>Folder Management</span>
      </div>
    </AbsoluteFill>
  );
};
