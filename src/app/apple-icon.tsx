import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#141414",
          borderRadius: 40,
        }}
      >
        <div style={{ fontFamily: "Georgia, serif", fontSize: 84, color: "#ffffff" }}>LM</div>
      </div>
    ),
    { ...size },
  );
}
