import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";

/* ─── Folder Sharing Scene ─── */
export const FolderShareScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enterProgress = spring({ frame, fps, config: { damping: 14, stiffness: 70 } });
  const exitOpacity = interpolate(frame, [165, 180], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Share modal appears
  const modalProgress = spring({ frame: Math.max(0, frame - 15), fps, config: { damping: 12, stiffness: 80 } });

  // User avatars
  const users = [
    { name: "Alice Chen", initials: "AC", color: "#6366f1", delay: 35 },
    { name: "Bob Miller", initials: "BM", color: "#ec4899", delay: 45 },
    { name: "Carol Dev", initials: "CD", color: "#f59e0b", delay: 55 },
  ];

  // Search typing
  const searchText = "Alice Chen";
  const searchChars = Math.floor(
    interpolate(frame, [65, 95], [0, searchText.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
  );
  const displaySearch = searchText.slice(0, searchChars);
  const showSearchCursor = frame >= 62 && frame < 100;
  const cursorOn = Math.floor(frame / 12) % 2 === 0;

  // User selected highlight
  const userSelected = frame >= 100;
  const selectedSpring = spring({ frame: Math.max(0, frame - 100), fps, config: { damping: 10, stiffness: 120 } });

  // Permission dropdown
  const dropdownOpen = frame >= 110 && frame < 135;
  const dropdownProgress = spring({ frame: Math.max(0, frame - 110), fps, config: { damping: 12, stiffness: 100 } });
  const permSelected = frame >= 128;

  // Share button
  const shareBtnGlow = interpolate(frame, [138, 148], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const shareClicked = frame >= 150;

  // Success notification
  const successSpring = spring({ frame: Math.max(0, frame - 152), fps, config: { damping: 10, stiffness: 100 } });

  // Connection line animation between users
  const lineProgress = interpolate(frame, [155, 170], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: exitOpacity }}>
      {/* Background */}
      <div style={{
        width: 1400, height: 820,
        background: "linear-gradient(180deg, #0f0f1a 0%, #0a0a14 100%)",
        borderRadius: 24, border: "1px solid rgba(255,255,255,0.06)",
        boxShadow: "0 40px 120px rgba(0,0,0,0.6)",
        overflow: "hidden", position: "relative",
        opacity: interpolate(enterProgress, [0, 1], [0, 1]),
      }}>
        {/* Browser chrome */}
        <div style={{ height: 48, background: "rgba(255,255,255,0.03)", display: "flex", alignItems: "center", padding: "0 20px", gap: 8, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ width: 12, height: 12, borderRadius: 6, background: "#ff5f57" }} />
          <div style={{ width: 12, height: 12, borderRadius: 6, background: "#febc2e" }} />
          <div style={{ width: 12, height: 12, borderRadius: 6, background: "#28c840" }} />
          <div style={{ marginLeft: 40, flex: 1, height: 28, borderRadius: 8, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", padding: "0 14px" }}>
            <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 12, fontWeight: 500 }}>vento.enterprise.io/files/share</span>
          </div>
        </div>

        {/* Split layout: folder card left, share modal right */}
        <div style={{ height: "calc(100% - 48px)", display: "flex", alignItems: "center", justifyContent: "center", gap: 40, padding: 40 }}>
          {/* Left: Folder card */}
          <div style={{
            width: 320, padding: 32,
            background: "rgba(255,255,255,0.03)", borderRadius: 20,
            border: "1px solid rgba(255,255,255,0.06)",
            display: "flex", flexDirection: "column", alignItems: "center",
            opacity: interpolate(enterProgress, [0, 1], [0, 1]),
          }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>📁</div>
            <div style={{ color: "#fff", fontSize: 18, fontWeight: 800, marginBottom: 8 }}>Project Documents</div>
            <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 500, marginBottom: 20 }}>12 files · 45.6 MB</div>

            {/* Share indicator */}
            <div style={{ display: "flex", gap: -8 }}>
              {users.map((u, i) => {
                const avatarProgress = spring({ frame: Math.max(0, frame - u.delay), fps, config: { damping: 10, stiffness: 100 } });
                return (
                  <div key={i} style={{
                    width: 32, height: 32, borderRadius: 16,
                    background: u.color, display: "flex", justifyContent: "center", alignItems: "center",
                    border: "2px solid #14141f",
                    marginLeft: i > 0 ? -8 : 0,
                    opacity: avatarProgress, transform: `scale(${avatarProgress})`,
                    zIndex: 3 - i,
                  }}>
                    <span style={{ color: "#fff", fontSize: 10, fontWeight: 800 }}>{u.initials}</span>
                  </div>
                );
              })}
            </div>

            {/* Connection lines to share modal */}
            {lineProgress > 0 && (
              <div style={{
                position: "absolute", right: -20, top: "50%",
                width: 40, height: 2, background: `rgba(0,212,170,${lineProgress * 0.3})`,
              }} />
            )}
          </div>

          {/* Right: Share modal */}
          <div style={{
            width: 480, padding: "32px 28px",
            background: "#14141f", borderRadius: 20,
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
            transform: `scale(${modalProgress}) translateY(${interpolate(modalProgress, [0, 1], [20, 0])}px)`,
            opacity: modalProgress,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div>
                <div style={{ color: "#fff", fontSize: 18, fontWeight: 800 }}>Share Folder</div>
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 500, marginTop: 4 }}>Invite people to collaborate</div>
              </div>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                <polyline points="16,6 12,2 8,6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
            </div>

            {/* Search field */}
            <div style={{
              height: 48, borderRadius: 12,
              background: "rgba(255,255,255,0.04)",
              border: showSearchCursor ? "1px solid rgba(0,212,170,0.5)" : "1px solid rgba(255,255,255,0.06)",
              display: "flex", alignItems: "center", padding: "0 16px", gap: 10, marginBottom: 20,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <span style={{ color: displaySearch ? "#fff" : "rgba(255,255,255,0.25)", fontSize: 13, fontWeight: 500 }}>
                {displaySearch || "Search users..."}
              </span>
              {showSearchCursor && cursorOn && <span style={{ color: "#00d4aa", fontSize: 14 }}>|</span>}
            </div>

            {/* User results */}
            {users.map((u, i) => {
              const itemOpacity = interpolate(frame, [u.delay + 30, u.delay + 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              const isAlice = u.name === "Alice Chen";
              return (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 14px", borderRadius: 12, marginBottom: 6,
                  background: isAlice && userSelected ? "rgba(0,212,170,0.08)" : "rgba(255,255,255,0.02)",
                  border: isAlice && userSelected ? "1px solid rgba(0,212,170,0.2)" : "1px solid transparent",
                  opacity: itemOpacity,
                  transform: `scale(${isAlice && selectedSpring > 0 ? 1 + selectedSpring * 0.02 : 1})`,
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: u.color, display: "flex", justifyContent: "center", alignItems: "center",
                  }}>
                    <span style={{ color: "#fff", fontSize: 12, fontWeight: 800 }}>{u.initials}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>{u.name}</div>
                    <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, fontWeight: 500 }}>{u.name.toLowerCase().replace(" ", ".")}@vento.ac.in</div>
                  </div>

                  {/* Permission badge */}
                  {isAlice && userSelected && (
                    <div style={{
                      position: "relative",
                      padding: "6px 12px", borderRadius: 8,
                      background: permSelected ? "rgba(0,212,170,0.15)" : "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      display: "flex", alignItems: "center", gap: 6,
                    }}>
                      <span style={{
                        color: permSelected ? "#00d4aa" : "rgba(255,255,255,0.5)",
                        fontSize: 11, fontWeight: 700,
                      }}>{permSelected ? "VIEW" : "Select"}</span>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={permSelected ? "#00d4aa" : "rgba(255,255,255,0.3)"} strokeWidth="2.5" strokeLinecap="round">
                        <polyline points="6,9 12,15 18,9" />
                      </svg>

                      {/* Dropdown */}
                      {dropdownOpen && !permSelected && (
                        <div style={{
                          position: "absolute", top: 40, right: 0, width: 120,
                          background: "#1a1a2e", borderRadius: 10,
                          border: "1px solid rgba(255,255,255,0.08)",
                          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                          overflow: "hidden",
                          transform: `scaleY(${dropdownProgress})`,
                          transformOrigin: "top",
                          opacity: dropdownProgress,
                          zIndex: 10,
                        }}>
                          {["View", "Edit", "Manage"].map((p, pi) => (
                            <div key={p} style={{
                              padding: "10px 14px",
                              background: pi === 0 ? "rgba(0,212,170,0.1)" : "transparent",
                              color: pi === 0 ? "#00d4aa" : "rgba(255,255,255,0.5)",
                              fontSize: 11, fontWeight: pi === 0 ? 700 : 500,
                            }}>{p}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Checkmark for selected */}
                  {isAlice && userSelected && (
                    <div style={{
                      width: 24, height: 24, borderRadius: 6,
                      background: "#00d4aa",
                      display: "flex", justifyContent: "center", alignItems: "center",
                      opacity: selectedSpring,
                      transform: `scale(${selectedSpring})`,
                    }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round">
                        <polyline points="20,6 9,17 4,12" />
                      </svg>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Share button */}
            <div style={{
              height: 48, borderRadius: 12, marginTop: 20,
              background: "linear-gradient(135deg, #00d4aa, #00b894)",
              display: "flex", justifyContent: "center", alignItems: "center", gap: 8,
              opacity: interpolate(shareBtnGlow, [0, 1], [0.35, 1]),
              boxShadow: `0 8px 32px rgba(0,212,170,${shareBtnGlow * 0.4})`,
              transform: `scale(${shareClicked ? 0.95 : 1})`,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                <polyline points="16,6 12,2 8,6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
              <span style={{ color: "#000", fontSize: 14, fontWeight: 800 }}>Share Folder</span>
            </div>
          </div>
        </div>

        {/* Success notification */}
        {successSpring > 0 && (
          <div style={{
            position: "absolute", top: 70, right: 30,
            padding: "14px 22px", borderRadius: 14,
            background: "rgba(0,212,170,0.12)", border: "1px solid rgba(0,212,170,0.25)",
            display: "flex", alignItems: "center", gap: 10,
            opacity: successSpring,
            transform: `translateY(${interpolate(successSpring, [0, 1], [-20, 0])}px)`,
          }}>
            <div style={{ width: 24, height: 24, borderRadius: 12, background: "#00d4aa", display: "flex", justifyContent: "center", alignItems: "center" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round">
                <polyline points="20,6 9,17 4,12" />
              </svg>
            </div>
            <span style={{ color: "#00d4aa", fontSize: 13, fontWeight: 700 }}>Shared with Alice Chen</span>
          </div>
        )}
      </div>

      {/* Scene label */}
      <div style={{
        position: "absolute", bottom: 60, left: 0, right: 0, textAlign: "center",
        opacity: interpolate(frame, [20, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
      }}>
        <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: 4 }}>Secure File Sharing</span>
      </div>
    </AbsoluteFill>
  );
};
