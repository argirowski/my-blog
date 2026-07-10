import type { Metadata } from "next";
import { Suspense } from "react";

import { RegisterPageContent } from "@/app/auth/register/register-page-content";

export const metadata: Metadata = {
  title: "Register",
};

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterPageContent />
    </Suspense>
  );
}
