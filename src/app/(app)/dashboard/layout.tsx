import { Sidebar } from "@/components/dashboard/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 p-6 md:p-6 pt-14 md:pt-6 overflow-y-auto">
        <div className="relative z-10">{children}</div>
      </main>
    </div>
  );
}
