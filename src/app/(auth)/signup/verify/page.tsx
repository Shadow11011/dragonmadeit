import { Suspense } from "react";
import VerifyCodeForm from "./VerifyCodeForm";

export const metadata = {
  title: "Verify Email | DragonMadeIt",
  description: "Enter the verification code sent to your email",
};

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold fire-text">DragonMadeIt</h1>
            <p className="mt-2 text-text-secondary">Loading...</p>
          </div>
          <div className="bg-bg-secondary border border-border rounded-xl p-6 h-80 animate-pulse" />
        </div>
      }
    >
      <VerifyCodeForm />
    </Suspense>
  );
}
