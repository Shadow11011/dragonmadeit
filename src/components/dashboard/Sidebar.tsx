"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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

function UserCircleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="9" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4 15.5C4 12.5 6.2 10.5 9 10.5C11.8 10.5 14 12.5 14 15.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="3.5" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2 7.5H16" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6 1.5V4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 1.5V4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function ChartBarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="9" width="3" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="7.5" y="5" width="3" height="11" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="13" y="2" width="3" height="14" rx="1" stroke="currentColor" strokeWidth="1.5" />
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

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: <DashboardIcon /> },
  { href: "/dashboard/accounts", label: "Accounts", icon: <UserCircleIcon /> },
  { href: "/dashboard/schedule", label: "Schedule", icon: <CalendarIcon /> },
  { href: "/dashboard/analytics", label: "Analytics", icon: <ChartBarIcon /> },
  { href: "/dashboard/settings", label: "Settings", icon: <GearIcon /> },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, hasActiveSubscription } = useTypedSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  const fireColor = hasActiveSubscription ? "#ff4500" : "#71717a";

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 md:hidden rounded-lg bg-bg-secondary border border-border p-2 text-text-primary hover:bg-bg-tertiary transition-colors"
        aria-label="Open navigation"
      >
        <MenuIcon />
      </button>

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
            href="/"
            className="flex items-center gap-2"
            onClick={() => setMobileOpen(false)}
          >
            <DragonMascot size={28} tierColor={fireColor} />
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
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border space-y-2">
          {user?.name && (
            <p className="text-sm font-medium text-text-primary truncate">
              {user.name}
            </p>
          )}
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-secondary">
              {hasActiveSubscription ? "Active subscriber" : "Free account"}
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
