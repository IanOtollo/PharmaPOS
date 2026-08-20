import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0A0A0A",
          borderRadius: 7,
        }}
      >
        <div
          style={{
            display: "flex",
            width: 22,
            height: 11,
            borderRadius: 5.5,
            overflow: "hidden",
            transform: "rotate(-45deg)",
          }}
        >
          <div style={{ width: 11, height: 11, background: "#2DD9C4" }} />
          <div style={{ width: 11, height: 11, background: "#F5F5F5" }} />
        </div>
      </div>
    ),
    { ...size }
  );
}
