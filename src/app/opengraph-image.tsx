import { ImageResponse } from "next/og";

export const alt = "Lotys Mobility – Ihr externer Fuhrparkmanager für KMU";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 96px",
          background: "#fbfbfa",
          borderTop: "24px solid #141414",
          borderBottom: "24px solid #141414",
        }}
      >
        <div style={{ fontSize: 34, letterSpacing: 22, color: "#141414" }}>LOTYS</div>
        <div style={{ fontSize: 26, letterSpacing: 14, color: "#52746a", marginTop: 12 }}>MOBILITY</div>
        <div style={{ fontFamily: "Georgia, serif", fontSize: 56, color: "#141414", marginTop: 36, lineHeight: 1.15 }}>
          Ihr Fuhrparkmanager, ohne dass Sie einen einstellen müssen.
        </div>
        <div style={{ fontSize: 26, color: "#555", marginTop: 24 }}>
          Werkstattkoordination · Fristenmanagement · Persönliche Betreuung
        </div>
      </div>
    ),
    { ...size },
  );
}
