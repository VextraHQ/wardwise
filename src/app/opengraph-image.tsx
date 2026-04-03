import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import { join } from "path";

export const alt = "WardWise | Civic Intelligence Platform";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  // Read the local PNG to base64 to ensure perfect quality rendering in the OG image
  const logoPath = join(process.cwd(), "public/brand/logotype-lagoon.png");
  const logoData = await readFile(logoPath);
  const base64Logo = `data:image/png;base64,${logoData.toString("base64")}`;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#F5F5ED",
        position: "relative",
      }}
    >
      {/* Center Logo */}
      <img
        src={base64Logo}
        alt="WardWise"
        width={700}
        height="125"
        style={{
          objectFit: "contain",
          transform: "translateY(-30px)",
        }}
      />

      {/* Separator Line */}
      <div
        style={{
          height: "1px",
          width: "120px",
          backgroundColor: "#09282A",
          opacity: 0.2,
          marginTop: "16px",
          marginBottom: "32px",
        }}
      />

      {/* Subtitle */}
      <div
        style={{
          display: "flex",
          color: "#09282A",
          fontSize: 32,
          letterSpacing: "0.1em",
          fontWeight: 500,
          textTransform: "uppercase",
          opacity: 0.9,
        }}
      >
        From Ward to Victory
      </div>
    </div>,
    {
      ...size,
    },
  );
}
