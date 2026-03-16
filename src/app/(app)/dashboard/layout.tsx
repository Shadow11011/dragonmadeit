import { Sidebar } from "@/components/dashboard/Sidebar";
import { EmberBackground } from "@/components/dashboard/EmberBackground";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 md:p-6 pt-14 md:pt-6 overflow-auto">
        <EmberBackground />
        <div className="relative z-10">{children}</div>
      </main>
    </div>
  );
}
