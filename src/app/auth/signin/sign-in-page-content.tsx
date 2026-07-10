import { SignInFormShell } from "@/app/auth/signin/sign-in-form-shell";

export function SignInPageContent() {
  return (
    <div className="mx-auto w-full max-w-lg flex-1 px-4 py-12 sm:px-6">
      <SignInFormShell />
    </div>
  );
}
