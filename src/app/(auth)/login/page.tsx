import { Suspense } from "react";
import LoginForm from "./LoginForm";

export const metadata = {
  title: "Sign In | DragonMadeIt",
  description: "Sign in to your DragonMadeIt account",
};

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold fire-text">DragonMadeIt</h1>
            <p className="mt-2 text-text-secondary">Loading...</p>
          </div>
          <div className="bg-bg-secondary border border-border rounded-xl p-6 h-64 animate-pulse" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
