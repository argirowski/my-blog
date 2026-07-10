import type { Metadata } from "next";
import { Suspense } from "react";

import { BlogCreatedToast } from "@/components/blog-created-toast";
import { BlogHomePage } from "@/components/blog-home-page";
import { BlogPageGate } from "@/components/blog-page-gate";
import { LoggedInToast } from "@/components/logged-in-toast";
import { PostDeletedToast } from "@/components/post-deleted-toast";
import { PostUpdatedToast } from "@/components/post-updated-toast";

export const metadata: Metadata = {
  title: "Posts",
  description: "Browse all posts.",
};

export default function BlogIndexPage() {
  return (
    <>
      <Suspense fallback={null}>
        <LoggedInToast />
        <BlogCreatedToast />
        <PostUpdatedToast />
        <PostDeletedToast />
      </Suspense>
      <Suspense fallback={null}>
        <BlogPageGate>
          <BlogHomePage />
        </BlogPageGate>
      </Suspense>
    </>
  );
}
