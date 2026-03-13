import { SessionProvider } from "@/components/providers/SessionProvider";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <div className="min-h-screen bg-bg-primary">
        {children}
      </div>
    </SessionProvider>
  );
}
