"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { DragonMascot } from "@/components/dashboard/DragonMascot";
import { useTypedSession } from "@/hooks/useSession";

function DashboardIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="10" y="1" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="1" y="10" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="10" y="10" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.5 1.5V10.5C12.5 13 10.5 15 8 15C5.5 15 3.5 13 3.5 10.5C3.5 8 5.5 6 8 6V8.5C6.9 8.5 6 9.4 6 10.5C6 11.6 6.9 12.5 8 12.5C9.1 12.5 10 11.6 10 10.5V1.5H12.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12.5 4C13.5 4.5 14.5 5 15.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function ScheduleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="3" width="14" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2 7H16" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6 1.5V4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 1.5V4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function AnalyticsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 14L6 9L10 11L16 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13 4H16V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="9" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M9 1.5L10 3.5L12.5 2.5L12.5 5L15 5.5L14 7.5L16.5 9L14 10.5L15 12.5L12.5 13L12.5 15.5L10 14.5L9 16.5L8 14.5L5.5 15.5L5.5 13L3 12.5L4 10.5L1.5 9L4 7.5L3 5.5L5.5 5L5.5 2.5L8 3.5L9 1.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 6H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M4 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M4 18H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function LogOutIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6.5 16H3.5C2.95 16 2.5 15.55 2.5 15V3C2.5 2.45 2.95 2 3.5 2H6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 13L15.5 9.5L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15.5 9.5H6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 3.5V14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M3.5 9H14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useTypedSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountCount, setAccountCount] = useState<number>(0);

  useEffect(() => {
    async function fetchAccountCount() {
      try {
        const res = await fetch("/api/user/accounts/count");
        if (res.ok) {
          const data: unknown = await res.json();
          const countData = data as { count: number };
          setAccountCount(countData.count);
        }
      } catch {
        // Silently fail — badge will show 0
      }
    }
    fetchAccountCount();
  }, []);

  const navItems: NavItem[] = [
    { href: "/dashboard", label: "Overview", icon: <DashboardIcon /> },
    { href: "/dashboard/accounts", label: "TikTok Accounts", icon: <TikTokIcon />, badge: accountCount },
    { href: "/dashboard/schedule", label: "Schedule", icon: <ScheduleIcon /> },
    { href: "/dashboard/analytics", label: "Analytics", icon: <AnalyticsIcon /> },
    { href: "/dashboard/settings", label: "Settings", icon: <GearIcon /> },
  ];

  return (
    <>
      {/* Mobile header bar */}
      <div className="fixed top-0 left-0 right-0 z-50 md:hidden flex items-center justify-between h-14 px-4 bg-bg-secondary/80 backdrop-blur-md border-b border-border">
        <button
          onClick={() => setMobileOpen(true)}
          className="rounded-lg p-2 text-text-primary hover:bg-bg-tertiary transition-colors"
          aria-label="Open navigation"
        >
          <MenuIcon />
        </button>
        <span className="text-lg font-bold fire-text">DragonMadeIt</span>
        <div className="w-10" />
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed md:sticky top-0 left-0 z-50 md:z-auto w-64 h-screen bg-bg-secondary border-r border-border flex flex-col",
          "transition-transform duration-300 ease-in-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="p-5 border-b border-border flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-2"
            onClick={() => setMobileOpen(false)}
          >
            <DragonMascot size={28} />
            <span className="text-lg font-bold fire-text">DragonMadeIt</span>
          </Link>
          {/* Mobile close button */}
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden text-text-secondary hover:text-text-primary transition-colors"
            aria-label="Close navigation"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                  isActive
                    ? "bg-bg-tertiary text-accent-fire"
                    : "text-text-secondary hover:text-text-primary hover:bg-bg-tertiary/50"
                )}
              >
                <span className="shrink-0">{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-accent-fire/15 px-1.5 text-xs font-medium text-accent-fire">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Add Account CTA */}
        <div className="px-3 pb-3">
          <Link
            href="/dashboard/accounts/add"
            onClick={() => setMobileOpen(false)}
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-[#ff4500] to-[#ff8c00] hover:brightness-110 transition-all"
          >
            <PlusIcon />
            <span>Add Account</span>
          </Link>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border space-y-3">
          <div>
            {user?.name && (
              <p className="text-sm font-medium text-text-primary truncate">
                {user.name}
              </p>
            )}
            {user?.email && (
              <p className="text-xs text-text-secondary truncate mt-0.5">
                {user.email}
              </p>
            )}
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            <LogOutIcon />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
