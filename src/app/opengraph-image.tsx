import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "CryptoFlowCheck - Professional On-Chain Intelligence";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #07090F 0%, #0d1117 50%, #07090F 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "16px",
              background: "linear-gradient(135deg, #00F2FF, #0066FF)",
            }}
          />
          <span
            style={{
              fontSize: "64px",
              fontWeight: 900,
              color: "white",
              letterSpacing: "-2px",
            }}
          >
            CRYPTO
            <span style={{ color: "#00F2FF" }}>FLOWCHECK</span>
          </span>
        </div>
        <p
          style={{
            fontSize: "28px",
            color: "rgba(255,255,255,0.6)",
            fontWeight: 700,
            letterSpacing: "4px",
            textTransform: "uppercase",
          }}
        >
          Professional On-Chain Intelligence
        </p>
        <div
          style={{
            display: "flex",
            gap: "24px",
            marginTop: "48px",
          }}
        >
          {["Real-time Data", "Whale Tracking", "AI Analysis"].map((label) => (
            <div
              key={label}
              style={{
                padding: "12px 24px",
                border: "1px solid rgba(0,242,255,0.3)",
                borderRadius: "12px",
                color: "#00F2FF",
                fontSize: "16px",
                fontWeight: 700,
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
