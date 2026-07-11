import { ogImageContentType, OG_IMAGE_SIZE, renderOgImage } from "@/lib/og-image";

export const alt = "My Blog";
export const size = OG_IMAGE_SIZE;
export const contentType = ogImageContentType;

export default function Image() {
  return renderOgImage({
    title: "My Blog",
    subtitle: "Read, write, and connect.",
  });
}
