"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { FlashToast } from "@/components/flash-toast";

export function AccountCreatedToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(searchParams.get("registered") === "1");
  }, [searchParams]);

  const dismiss = useCallback(() => {
    setVisible(false);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("registered");
    const qs = params.toString();
    router.replace(qs ? `/auth/signin?${qs}` : "/auth/signin", { scroll: false });
  }, [router, searchParams]);

  return (
    <FlashToast message="Account Created" visible={visible} onDismiss={dismiss} />
  );
}
