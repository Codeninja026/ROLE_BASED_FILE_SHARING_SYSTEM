import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";

/* ─── Login / Signup Scene ─── */
export const LoginScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Card entrance
  const cardProgress = spring({ frame, fps, config: { damping: 14, stiffness: 80, mass: 1 } });
  const cardY = interpolate(cardProgress, [0, 1], [60, 0]);
  const cardOpacity = interpolate(cardProgress, [0, 1], [0, 1]);

  // Scene label
  const labelOpacity = interpolate(frame, [20, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Logo / lock icon
  const lockScale = spring({ frame: Math.max(0, frame - 8), fps, config: { damping: 10, stiffness: 120 } });

  // Email typing: "admin@vento.ac.in"
  const emailText = "admin@vento.ac.in";
  const emailChars = Math.floor(
    interpolate(frame, [35, 90], [0, emailText.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
  );
  const displayEmail = emailText.slice(0, emailChars);

  // Password dots
  const pwdDots = Math.floor(
    interpolate(frame, [95, 115], [0, 8], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
  );

  // Cursor blink
  const cursorOn = Math.floor(frame / 12) % 2 === 0;
  const showEmailCursor = frame >= 30 && frame < 93;
  const showPwdCursor = frame >= 93 && frame < 120;

  // Button glow
  const btnGlow = interpolate(frame, [120, 140], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const btnScale = spring({ frame: Math.max(0, frame - 138), fps, config: { damping: 8, stiffness: 200 } });
  const btnPressScale = frame >= 145 ? 0.95 : 1;

  // Exit
  const exitOpacity = interpolate(frame, [150, 165], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: exitOpacity }}>
      {/* Browser frame */}
      <div style={{
        width: 1400, height: 820,
        background: "linear-gradient(180deg, #0f0f1a 0%, #0a0a14 100%)",
        borderRadius: 24, border: "1px solid rgba(255,255,255,0.06)",
        boxShadow: "0 40px 120px rgba(0,0,0,0.6)",
        overflow: "hidden", position: "relative",
        opacity: cardOpacity, transform: `translateY(${cardY}px)`,
      }}>
        {/* Browser chrome */}
        <div style={{ height: 48, background: "rgba(255,255,255,0.03)", display: "flex", alignItems: "center", padding: "0 20px", gap: 8, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ width: 12, height: 12, borderRadius: 6, background: "#ff5f57" }} />
          <div style={{ width: 12, height: 12, borderRadius: 6, background: "#febc2e" }} />
          <div style={{ width: 12, height: 12, borderRadius: 6, background: "#28c840" }} />
          <div style={{ marginLeft: 40, flex: 1, height: 28, borderRadius: 8, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", padding: "0 14px" }}>
            <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 12, fontWeight: 500 }}>vento.enterprise.io/login</span>
          </div>
        </div>

        {/* Login content */}
        <div style={{
          flex: 1, display: "flex", justifyContent: "center", alignItems: "center",
          height: "calc(100% - 48px)",
          background: "radial-gradient(ellipse 60% 50% at 50% 45%, rgba(0,212,170,0.04) 0%, transparent 70%)",
        }}>
          {/* Login card */}
          <div style={{
            width: 420, padding: "48px 40px",
            background: "rgba(255,255,255,0.03)",
            borderRadius: 20, border: "1px solid rgba(255,255,255,0.07)",
            backdropFilter: "blur(30px)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          }}>
            {/* Lock icon */}
            <div style={{ textAlign: "center", marginBottom: 32, transform: `scale(${lockScale})` }}>
              <div style={{
                width: 56, height: 56, borderRadius: 16,
                background: "linear-gradient(135deg, #00d4aa, #00a080)",
                display: "inline-flex", justifyContent: "center", alignItems: "center",
                boxShadow: "0 8px 32px rgba(0,212,170,0.3)",
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <div style={{ color: "#ffffff", fontSize: 22, fontWeight: 800, marginTop: 16, letterSpacing: -0.5 }}>Welcome Back</div>
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, fontWeight: 500, marginTop: 6 }}>Sign in to Vento Enterprise</div>
            </div>

            {/* Email field */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 700, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Email</div>
              <div style={{
                height: 48, borderRadius: 12, background: "rgba(255,255,255,0.04)",
                border: showEmailCursor ? "1px solid rgba(0,212,170,0.5)" : "1px solid rgba(255,255,255,0.06)",
                display: "flex", alignItems: "center", padding: "0 16px",
                transition: "border-color 0.2s",
              }}>
                <span style={{ color: "#ffffff", fontSize: 14, fontWeight: 500 }}>{displayEmail}</span>
                {showEmailCursor && cursorOn && <span style={{ color: "#00d4aa", fontSize: 14, marginLeft: 1 }}>|</span>}
              </div>
            </div>

            {/* Password field */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 700, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Password</div>
              <div style={{
                height: 48, borderRadius: 12, background: "rgba(255,255,255,0.04)",
                border: showPwdCursor ? "1px solid rgba(0,212,170,0.5)" : "1px solid rgba(255,255,255,0.06)",
                display: "flex", alignItems: "center", padding: "0 16px", gap: 4,
              }}>
                {Array.from({ length: pwdDots }).map((_, i) => (
                  <div key={i} style={{ width: 8, height: 8, borderRadius: 4, background: "#ffffff" }} />
                ))}
                {showPwdCursor && cursorOn && <span style={{ color: "#00d4aa", fontSize: 14, marginLeft: 1 }}>|</span>}
              </div>
            </div>

            {/* Sign in button */}
            <div style={{
              height: 48, borderRadius: 12,
              background: `linear-gradient(135deg, #00d4aa, #00b894)`,
              display: "flex", justifyContent: "center", alignItems: "center",
              opacity: interpolate(btnGlow, [0, 1], [0.4, 1]),
              transform: `scale(${interpolate(btnGlow, [0, 1], [0.97, 1]) * btnPressScale * (btnScale > 0 ? interpolate(btnScale, [0, 1], [1, 1.02]) : 1)})`,
              boxShadow: `0 8px 32px rgba(0,212,170,${btnGlow * 0.4})`,
              cursor: "pointer",
            }}>
              <span style={{ color: "#000", fontSize: 14, fontWeight: 800, letterSpacing: 0.5 }}>Sign In</span>
              <svg style={{ marginLeft: 8 }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Scene label */}
      <div style={{
        position: "absolute", bottom: 60, left: 0, right: 0,
        textAlign: "center", opacity: labelOpacity,
      }}>
        <span style={{
          color: "rgba(255,255,255,0.35)", fontSize: 13, fontWeight: 700,
          textTransform: "uppercase", letterSpacing: 4,
        }}>Secure Authentication</span>
      </div>
    </AbsoluteFill>
  );
};
