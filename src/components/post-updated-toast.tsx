"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { FlashToast } from "@/components/flash-toast";

export function PostUpdatedToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(searchParams.get("postUpdated") === "1");
  }, [searchParams]);

  const dismiss = useCallback(() => {
    setVisible(false);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("postUpdated");
    const qs = params.toString();
    router.replace(qs ? `/blog?${qs}` : "/blog", { scroll: false });
  }, [router, searchParams]);

  return (
    <FlashToast message="Post Updated" visible={visible} onDismiss={dismiss} />
  );
}
