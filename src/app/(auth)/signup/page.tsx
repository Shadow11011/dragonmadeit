import { Suspense } from "react";
import SignupForm from "./SignupForm";

export const metadata = {
  title: "Sign Up | DragonMadeIt",
  description: "Create your DragonMadeIt account and start automating your TikTok content",
};

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold font-heading fire-text">DragonMadeIt</h1>
            <p className="mt-2 text-text-secondary">Loading...</p>
          </div>
          <div className="bg-bg-secondary border border-border rounded-xl p-6 h-80 animate-pulse" />
        </div>
      }
    >
      <SignupForm />
    </Suspense>
  );
}
