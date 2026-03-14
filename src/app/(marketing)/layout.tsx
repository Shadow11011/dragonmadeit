import { MarketingShell } from "@/components/marketing/MarketingShell";
import { MotionProvider } from "@/components/providers/MotionProvider";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MotionProvider>
      <MarketingShell>{children}</MarketingShell>
    </MotionProvider>
  );
}
