import { notFound } from "next/navigation";

import { ogImageContentType, OG_IMAGE_SIZE, renderOgImage } from "@/lib/og-image";
import { getPostById } from "@/lib/posts";

export const alt = "Blog post preview";
export const size = OG_IMAGE_SIZE;
export const contentType = ogImageContentType;

type Props = {
  params: Promise<{ id: string }>;
};

function parsePostId(idParam: string): number | null {
  const id = Number(idParam);
  if (!Number.isInteger(id) || id < 1) return null;
  return id;
}

export default async function Image({ params }: Props) {
  const { id: idParam } = await params;
  const id = parsePostId(idParam);
  if (id == null) notFound();

  const post = await getPostById(id);
  if (!post) notFound();

  return renderOgImage({
    title: post.title,
    subtitle: post.excerpt,
  });
}
