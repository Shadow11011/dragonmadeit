import { Suspense } from "react";
import ForgotPasswordFlow from "./ForgotPasswordFlow";

export const metadata = {
  title: "Forgot Password | DragonMadeIt",
  description: "Reset your DragonMadeIt account password",
};

export default function ForgotPasswordPage() {
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
      <ForgotPasswordFlow />
    </Suspense>
  );
}
