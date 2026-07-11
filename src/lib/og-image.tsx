import { ImageResponse } from "next/og";

export const OG_IMAGE_SIZE = { width: 1200, height: 630 } as const;

export const ogImageContentType = "image/png";

type OgImageProps = {
  title: string;
  subtitle?: string;
};

/** Shared 1200×630 Open Graph card layout for site and post previews. */
export function renderOgImage({ title, subtitle }: OgImageProps) {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          padding: "72px",
          background: "linear-gradient(145deg, #18181b 0%, #27272a 100%)",
          color: "#fafafa",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 28,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#a1a1aa",
          }}
        >
          My Blog
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: 64,
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
            }}
          >
            {title}
          </div>
          {subtitle ? (
            <div
              style={{
                fontSize: 32,
                lineHeight: 1.35,
                color: "#d4d4d8",
                maxWidth: 960,
              }}
            >
              {subtitle}
            </div>
          ) : null}
        </div>
      </div>
    ),
    { ...OG_IMAGE_SIZE },
  );
}
