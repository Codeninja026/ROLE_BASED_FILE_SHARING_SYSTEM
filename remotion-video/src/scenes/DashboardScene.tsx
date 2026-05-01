import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";

/* ─── Dashboard Scene ─── */
export const DashboardScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enterProgress = spring({ frame, fps, config: { damping: 14, stiffness: 70 } });

  // Stats
  const stats = [
    { label: "Total Files", value: 124, color: "#00d4aa", icon: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" },
    { label: "Shared", value: 8, color: "#6366f1", icon: "M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13" },
    { label: "Storage", value: 2.4, suffix: " GB", color: "#f59e0b", icon: "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8" },
    { label: "Users", value: 12, color: "#ec4899", icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" },
  ];

  // Sidebar slide
  const sidebarX = interpolate(enterProgress, [0, 1], [-260, 0]);

  // Exit
  const exitOpacity = interpolate(frame, [165, 180], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Chart arc animation
  const chartAngle = interpolate(frame, [50, 100], [0, 270], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // File list items
  const files = ["Q4-Report.pdf", "Design-v3.fig", "Budget.xlsx", "Team-Notes.md", "Logo.svg"];

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: exitOpacity }}>
      <div style={{
        width: 1400, height: 820,
        background: "linear-gradient(180deg, #0f0f1a 0%, #0a0a14 100%)",
        borderRadius: 24, border: "1px solid rgba(255,255,255,0.06)",
        boxShadow: "0 40px 120px rgba(0,0,0,0.6)",
        overflow: "hidden", display: "flex",
        opacity: interpolate(enterProgress, [0, 1], [0, 1]),
      }}>
        {/* Sidebar */}
        <div style={{
          width: 240, background: "rgba(255,255,255,0.02)",
          borderRight: "1px solid rgba(255,255,255,0.05)",
          padding: "24px 0", display: "flex", flexDirection: "column",
          transform: `translateX(${sidebarX}px)`,
        }}>
          {/* Logo */}
          <div style={{ padding: "0 24px", marginBottom: 32, display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg, #00d4aa, #00a080)", display: "flex", justifyContent: "center", alignItems: "center" }}>
              <span style={{ color: "#fff", fontSize: 14, fontWeight: 900 }}>V</span>
            </div>
            <span style={{ color: "#fff", fontSize: 16, fontWeight: 800, letterSpacing: -0.5 }}>Vento</span>
          </div>

          {/* Nav items */}
          {["Dashboard", "My Files", "Shared", "Starred", "Storage", "Activity"].map((item, i) => {
            const isActive = i === 0;
            const itemOpacity = interpolate(frame, [10 + i * 5, 20 + i * 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            return (
              <div key={item} style={{
                padding: "10px 24px", margin: "2px 12px", borderRadius: 10,
                background: isActive ? "rgba(0,212,170,0.1)" : "transparent",
                display: "flex", alignItems: "center", gap: 12, opacity: itemOpacity,
              }}>
                <div style={{ width: 18, height: 18, borderRadius: 4, background: isActive ? "#00d4aa" : "rgba(255,255,255,0.15)" }} />
                <span style={{ color: isActive ? "#00d4aa" : "rgba(255,255,255,0.45)", fontSize: 13, fontWeight: isActive ? 700 : 500 }}>{item}</span>
              </div>
            );
          })}
        </div>

        {/* Main content */}
        <div style={{ flex: 1, padding: 32, display: "flex", flexDirection: "column" }}>
          {/* Header */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28,
            opacity: interpolate(frame, [15, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          }}>
            <div>
              <div style={{ color: "#fff", fontSize: 24, fontWeight: 800, letterSpacing: -0.5 }}>Dashboard</div>
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, fontWeight: 500, marginTop: 4 }}>Welcome back, Admin</div>
            </div>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", justifyContent: "center", alignItems: "center" }}>
              <span style={{ color: "#fff", fontSize: 13, fontWeight: 800 }}>A</span>
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: "flex", gap: 16, marginBottom: 28 }}>
            {stats.map((s, i) => {
              const statSpring = spring({ frame: Math.max(0, frame - 25 - i * 8), fps, config: { damping: 12, stiffness: 100 } });
              const countVal = interpolate(frame, [30 + i * 8, 70 + i * 8], [0, s.value], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              return (
                <div key={s.label} style={{
                  flex: 1, padding: "20px 20px",
                  background: "rgba(255,255,255,0.03)", borderRadius: 16,
                  border: "1px solid rgba(255,255,255,0.05)",
                  transform: `scale(${statSpring}) translateY(${interpolate(statSpring, [0, 1], [20, 0])}px)`,
                  opacity: statSpring,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8 }}>{s.label}</span>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: `${s.color}15`, display: "flex", justifyContent: "center", alignItems: "center" }}>
                      <div style={{ width: 14, height: 14, borderRadius: 3, background: s.color }} />
                    </div>
                  </div>
                  <div style={{ color: "#fff", fontSize: 28, fontWeight: 900, letterSpacing: -1 }}>
                    {s.suffix ? countVal.toFixed(1) : Math.floor(countVal)}{s.suffix || ""}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom section: Chart + Recent Files */}
          <div style={{ display: "flex", gap: 20, flex: 1 }}>
            {/* Donut chart */}
            <div style={{
              width: 320, background: "rgba(255,255,255,0.03)",
              borderRadius: 16, border: "1px solid rgba(255,255,255,0.05)",
              padding: 24, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              opacity: interpolate(frame, [50, 65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            }}>
              <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 20, alignSelf: "flex-start" }}>Storage Breakdown</div>
              <svg width="160" height="160" viewBox="0 0 160 160">
                <circle cx="80" cy="80" r="60" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="20" />
                <circle cx="80" cy="80" r="60" fill="none" stroke="#00d4aa" strokeWidth="20"
                  strokeDasharray={`${chartAngle * 0.6} 1000`}
                  strokeLinecap="round"
                  transform="rotate(-90 80 80)" />
                <circle cx="80" cy="80" r="60" fill="none" stroke="#6366f1" strokeWidth="20"
                  strokeDasharray={`${Math.max(0, chartAngle - 162) * 0.4} 1000`}
                  strokeDashoffset={`-${chartAngle * 0.6}`}
                  strokeLinecap="round"
                  transform="rotate(-90 80 80)" />
              </svg>
              <div style={{ display: "flex", gap: 20, marginTop: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: "#00d4aa" }} />
                  <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 600 }}>Documents</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: "#6366f1" }} />
                  <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 600 }}>Media</span>
                </div>
              </div>
            </div>

            {/* Recent files */}
            <div style={{
              flex: 1, background: "rgba(255,255,255,0.03)",
              borderRadius: 16, border: "1px solid rgba(255,255,255,0.05)",
              padding: 24,
            }}>
              <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 16 }}>Recent Files</div>
              {files.map((f, i) => {
                const fileOpacity = interpolate(frame, [70 + i * 10, 82 + i * 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
                const fileX = interpolate(frame, [70 + i * 10, 82 + i * 10], [30, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
                const ext = f.split(".").pop();
                const extColor = ext === "pdf" ? "#ef4444" : ext === "fig" ? "#a855f7" : ext === "xlsx" ? "#22c55e" : ext === "md" ? "#3b82f6" : "#f59e0b";
                return (
                  <div key={f} style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "12px 14px", borderRadius: 10, marginBottom: 4,
                    background: i === 0 ? "rgba(0,212,170,0.04)" : "transparent",
                    opacity: fileOpacity, transform: `translateX(${fileX}px)`,
                  }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: `${extColor}15`, display: "flex", justifyContent: "center", alignItems: "center" }}>
                      <span style={{ color: extColor, fontSize: 10, fontWeight: 800, textTransform: "uppercase" }}>{ext}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>{f}</div>
                      <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, fontWeight: 500 }}>Modified 2h ago</div>
                    </div>
                    <div style={{ color: "rgba(255,255,255,0.2)", fontSize: 11, fontWeight: 600 }}>1.2 MB</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Scene label */}
      <div style={{
        position: "absolute", bottom: 60, left: 0, right: 0, textAlign: "center",
        opacity: interpolate(frame, [20, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
      }}>
        <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: 4 }}>Analytics Dashboard</span>
      </div>
    </AbsoluteFill>
  );
};
