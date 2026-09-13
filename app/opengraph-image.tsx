import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Eka — Web Development & AI Automation Agency in Zimbabwe";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "80px",
          backgroundColor: "#0b0a12",
          backgroundImage:
            "radial-gradient(circle at 15% 20%, rgba(124,58,237,0.55), transparent 45%), radial-gradient(circle at 85% 85%, rgba(203,172,249,0.35), transparent 50%)",
        }}
      >
        <div
          style={{
            fontSize: 96,
            fontWeight: 700,
            color: "#ffffff",
            letterSpacing: "-0.03em",
          }}
        >
          Eka
        </div>
        <div
          style={{
            marginTop: 24,
            fontSize: 40,
            fontWeight: 600,
            color: "#CBACF9",
            maxWidth: 900,
          }}
        >
          Web Development &amp; AI Automation
        </div>
        <div
          style={{
            marginTop: 16,
            fontSize: 30,
            color: "#e6e1f5",
            maxWidth: 900,
          }}
        >
          Building Africa&apos;s digital future — you only pay when you love it.
        </div>
      </div>
    ),
    { ...size }
  );
}
