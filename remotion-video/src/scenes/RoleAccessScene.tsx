import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";

/* ─── Role-Based Access Scene ─── */
export const RoleAccessScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enterProgress = spring({ frame, fps, config: { damping: 14, stiffness: 70 } });
  const exitOpacity = interpolate(frame, [180, 195], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Title animation
  const titleOpacity = interpolate(frame, [5, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Shield icon
  const shieldScale = spring({ frame: Math.max(0, frame - 10), fps, config: { damping: 8, stiffness: 120 } });

  // Left panel (Admin) slide in
  const adminSlide = spring({ frame: Math.max(0, frame - 25), fps, config: { damping: 12, stiffness: 70 } });

  // Right panel (User) slide in
  const userSlide = spring({ frame: Math.max(0, frame - 35), fps, config: { damping: 12, stiffness: 70 } });

  // Admin features reveal
  const adminFeatures = [
    { label: "All Users", icon: "👥", enabled: true, delay: 50 },
    { label: "All Files", icon: "📁", enabled: true, delay: 58 },
    { label: "Audit Logs", icon: "📋", enabled: true, delay: 66 },
    { label: "Analytics", icon: "📊", enabled: true, delay: 74 },
    { label: "Manage Roles", icon: "🛡️", enabled: true, delay: 82 },
    { label: "System Settings", icon: "⚙️", enabled: true, delay: 90 },
  ];

  const userFeatures = [
    { label: "Own Files", icon: "📁", enabled: true, delay: 55 },
    { label: "Upload", icon: "⬆️", enabled: true, delay: 63 },
    { label: "Shared Files", icon: "🤝", enabled: true, delay: 71 },
    { label: "Audit Logs", icon: "📋", enabled: false, delay: 79 },
    { label: "All Users", icon: "👥", enabled: false, delay: 87 },
    { label: "System Settings", icon: "⚙️", enabled: false, delay: 95 },
  ];

  // Lock animations on restricted features
  const lockPulse = Math.sin(frame * 0.1) * 0.15 + 0.85;

  // Divider line
  const dividerHeight = interpolate(frame, [40, 70], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Bottom comparison bar
  const barProgress = interpolate(frame, [110, 140], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // "Access Control" badge
  const badgeSpring = spring({ frame: Math.max(0, frame - 145), fps, config: { damping: 10, stiffness: 100 } });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: exitOpacity }}>
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
            <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 12, fontWeight: 500 }}>vento.enterprise.io/admin</span>
          </div>
        </div>

        {/* Main content */}
        <div style={{ height: "calc(100% - 48px)", padding: "40px 50px", display: "flex", flexDirection: "column" }}>
          {/* Title */}
          <div style={{
            textAlign: "center", marginBottom: 36,
            opacity: titleOpacity,
          }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 14,
              background: "rgba(255,255,255,0.03)", borderRadius: 16,
              padding: "12px 28px", border: "1px solid rgba(255,255,255,0.06)",
            }}>
              <div style={{
                transform: `scale(${shieldScale})`,
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00d4aa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <span style={{ color: "#fff", fontSize: 20, fontWeight: 800, letterSpacing: -0.5 }}>Role-Based Access Control</span>
            </div>
          </div>

          {/* Split panels */}
          <div style={{ display: "flex", gap: 24, flex: 1 }}>
            {/* Admin Panel */}
            <div style={{
              flex: 1, borderRadius: 20,
              background: "rgba(0,212,170,0.03)", border: "1px solid rgba(0,212,170,0.12)",
              padding: 28, display: "flex", flexDirection: "column",
              transform: `translateX(${interpolate(adminSlide, [0, 1], [-60, 0])}px)`,
              opacity: adminSlide,
            }}>
              {/* Admin header */}
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: "linear-gradient(135deg, #00d4aa, #00a080)",
                  display: "flex", justifyContent: "center", alignItems: "center",
                  boxShadow: "0 8px 24px rgba(0,212,170,0.25)",
                }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <div>
                  <div style={{ color: "#00d4aa", fontSize: 18, fontWeight: 800 }}>Administrator</div>
                  <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, fontWeight: 600 }}>Full system access</div>
                </div>
              </div>

              {/* Admin features */}
              {adminFeatures.map((f, i) => {
                const itemProgress = spring({ frame: Math.max(0, frame - f.delay), fps, config: { damping: 10, stiffness: 100 } });
                return (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "12px 16px", borderRadius: 12, marginBottom: 6,
                    background: "rgba(0,212,170,0.04)",
                    opacity: itemProgress,
                    transform: `translateX(${interpolate(itemProgress, [0, 1], [20, 0])}px)`,
                  }}>
                    <span style={{ fontSize: 18 }}>{f.icon}</span>
                    <span style={{ color: "#fff", fontSize: 13, fontWeight: 600, flex: 1 }}>{f.label}</span>
                    <div style={{
                      width: 22, height: 22, borderRadius: 6,
                      background: "#00d4aa", display: "flex", justifyContent: "center", alignItems: "center",
                    }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round">
                        <polyline points="20,6 9,17 4,12" />
                      </svg>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Center divider */}
            <div style={{
              width: 1, background: `linear-gradient(180deg, transparent, rgba(255,255,255,0.1) 50%, transparent)`,
              alignSelf: "center", height: `${dividerHeight}%`,
              position: "relative",
            }}>
              <div style={{
                position: "absolute", top: "50%", left: "50%",
                transform: "translate(-50%, -50%)",
                width: 36, height: 36, borderRadius: 10,
                background: "#14141f", border: "1px solid rgba(255,255,255,0.08)",
                display: "flex", justifyContent: "center", alignItems: "center",
              }}>
                <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 14, fontWeight: 800 }}>VS</span>
              </div>
            </div>

            {/* User Panel */}
            <div style={{
              flex: 1, borderRadius: 20,
              background: "rgba(99,102,241,0.03)", border: "1px solid rgba(99,102,241,0.12)",
              padding: 28, display: "flex", flexDirection: "column",
              transform: `translateX(${interpolate(userSlide, [0, 1], [60, 0])}px)`,
              opacity: userSlide,
            }}>
              {/* User header */}
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  display: "flex", justifyContent: "center", alignItems: "center",
                  boxShadow: "0 8px 24px rgba(99,102,241,0.25)",
                }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <div>
                  <div style={{ color: "#818cf8", fontSize: 18, fontWeight: 800 }}>Standard User</div>
                  <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, fontWeight: 600 }}>Limited access</div>
                </div>
              </div>

              {/* User features */}
              {userFeatures.map((f, i) => {
                const itemProgress = spring({ frame: Math.max(0, frame - f.delay), fps, config: { damping: 10, stiffness: 100 } });
                return (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "12px 16px", borderRadius: 12, marginBottom: 6,
                    background: f.enabled ? "rgba(99,102,241,0.04)" : "rgba(255,255,255,0.01)",
                    opacity: itemProgress * (f.enabled ? 1 : 0.5 * lockPulse),
                    transform: `translateX(${interpolate(itemProgress, [0, 1], [20, 0])}px)`,
                  }}>
                    <span style={{ fontSize: 18, opacity: f.enabled ? 1 : 0.4 }}>{f.icon}</span>
                    <span style={{
                      color: f.enabled ? "#fff" : "rgba(255,255,255,0.3)",
                      fontSize: 13, fontWeight: 600, flex: 1,
                      textDecoration: f.enabled ? "none" : "line-through",
                    }}>{f.label}</span>

                    {f.enabled ? (
                      <div style={{
                        width: 22, height: 22, borderRadius: 6,
                        background: "#6366f1", display: "flex", justifyContent: "center", alignItems: "center",
                      }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                          <polyline points="20,6 9,17 4,12" />
                        </svg>
                      </div>
                    ) : (
                      <div style={{
                        width: 22, height: 22, borderRadius: 6,
                        background: "rgba(239,68,68,0.15)",
                        display: "flex", justifyContent: "center", alignItems: "center",
                      }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Access Control badge */}
          {badgeSpring > 0 && (
            <div style={{
              position: "absolute", bottom: 35, left: "50%",
              transform: `translateX(-50%) scale(${badgeSpring})`,
              opacity: badgeSpring,
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 24px", borderRadius: 12,
              background: "rgba(0,212,170,0.08)", border: "1px solid rgba(0,212,170,0.2)",
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00d4aa" strokeWidth="2.5" strokeLinecap="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span style={{ color: "#00d4aa", fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1 }}>Strict Data Isolation</span>
            </div>
          )}
        </div>
      </div>

      {/* Scene label */}
      <div style={{
        position: "absolute", bottom: 60, left: 0, right: 0, textAlign: "center",
        opacity: interpolate(frame, [20, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
      }}>
        <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: 4 }}>Role-Based Access Control</span>
      </div>
    </AbsoluteFill>
  );
};
