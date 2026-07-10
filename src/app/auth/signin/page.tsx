import type { Metadata } from "next";
import { Suspense } from "react";

import { AccountCreatedToast } from "@/components/account-created-toast";
import { SignInPageContent } from "@/app/auth/signin/sign-in-page-content";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function SignInPage() {
  return (
    <>
      <Suspense fallback={null}>
        <AccountCreatedToast />
      </Suspense>
      <Suspense fallback={null}>
        <SignInPageContent />
      </Suspense>
    </>
  );
}
