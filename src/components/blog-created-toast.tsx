"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { FlashToast } from "@/components/flash-toast";

export function BlogCreatedToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(searchParams.get("postCreated") === "1");
  }, [searchParams]);

  const dismiss = useCallback(() => {
    setVisible(false);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("postCreated");
    const qs = params.toString();
    router.replace(qs ? `/blog?${qs}` : "/blog", { scroll: false });
  }, [router, searchParams]);

  return (
    <FlashToast message="Blog Created" visible={visible} onDismiss={dismiss} />
  );
}
