"use client";

import { useState, useEffect, FormEvent } from "react";
import { signOut } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { useTypedSession } from "@/hooks/useSession";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { user, isLoading } = useTypedSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  // Danger Zone state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteEmailInput, setDeleteEmailInput] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name ?? "");
      setEmail(user.email ?? "");
    }
  }, [user]);

  async function handleSaveProfile(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveMessage(null);

    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name || undefined, email: email || undefined }),
      });

      const data: unknown = await res.json();
      if (res.ok) {
        setSaveMessage({ type: "success", text: "Profile updated successfully." });
      } else {
        const errorData = data as { error?: string };
        setSaveMessage({ type: "error", text: errorData.error ?? "Failed to update profile." });
      }
    } catch {
      setSaveMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setSaving(false);
    }
  }

  async function handleManageBilling() {
    setPortalLoading(true);
    setSaveMessage(null);
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
      });

      const data: unknown = await res.json();
      const urlData = data as { url?: string; error?: string };

      if (res.ok && urlData.url) {
        window.location.href = urlData.url;
      } else {
        setSaveMessage({ type: "error", text: urlData.error ?? "Failed to open billing portal." });
      }
    } catch {
      setSaveMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setPortalLoading(false);
    }
  }

  async function handleDeleteAccount() {
    if (!user?.email || deleteEmailInput !== user.email) return;

    setDeleting(true);
    setSaveMessage(null);

    try {
      const res = await fetch("/api/user", {
        method: "DELETE",
      });

      if (res.ok) {
        await signOut({ callbackUrl: "/" });
      } else {
        const data: unknown = await res.json();
        const errorData = data as { error?: string };
        setSaveMessage({
          type: "error",
          text: errorData.error ?? "Failed to delete account. The endpoint may not be available yet.",
        });
      }
    } catch {
      setSaveMessage({
        type: "error",
        text: "Failed to delete account. The endpoint may not be available yet.",
      });
    } finally {
      setDeleting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <div className="animate-pulse space-y-4">
          <div className="h-64 bg-bg-secondary rounded-xl" />
          <div className="h-32 bg-bg-secondary rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-sm text-text-secondary mt-1">
          Manage your profile, billing, and account.
        </p>
      </div>

      {/* Save/error message */}
      {saveMessage && (
        <div
          className={cn(
            "rounded-lg px-4 py-3 text-sm",
            saveMessage.type === "success"
              ? "bg-success/10 text-success border border-success/20"
              : "bg-error/10 text-error border border-error/20"
          )}
        >
          {saveMessage.text}
        </div>
      )}

      {/* Profile section */}
      <section className="rounded-xl bg-bg-secondary border border-border p-6">
        <h2 className="text-lg font-semibold mb-4">Profile</h2>
        <form onSubmit={handleSaveProfile} className="space-y-4 max-w-md">
          <div>
            <label htmlFor="settings-name" className="block text-sm text-text-secondary mb-1.5">
              Name
            </label>
            <input
              id="settings-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg bg-bg-primary border border-border px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-fire/50 transition-colors"
              placeholder="Your name"
            />
          </div>
          <div>
            <label htmlFor="settings-email" className="block text-sm text-text-secondary mb-1.5">
              Email
            </label>
            <input
              id="settings-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg bg-bg-primary border border-border px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-fire/50 transition-colors"
              placeholder="your@email.com"
            />
          </div>
          <Button type="submit" disabled={saving} size="md">
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </section>

      {/* Billing section */}
      <section className="rounded-xl bg-bg-secondary border border-border p-6">
        <h2 className="text-lg font-semibold mb-2">Billing</h2>
        <p className="text-sm text-text-secondary mb-4">
          Manage your payment methods and view invoices through the Stripe billing portal.
          Subscription plans are managed per TikTok account on the{" "}
          <a href="/dashboard/accounts" className="text-accent-fire hover:underline">
            Accounts page
          </a>
          .
        </p>
        <Button
          variant="secondary"
          onClick={handleManageBilling}
          disabled={portalLoading}
        >
          {portalLoading ? "Opening..." : "Manage Billing"}
        </Button>
      </section>

      {/* Session section */}
      <section className="rounded-xl bg-bg-secondary border border-border p-6">
        <h2 className="text-lg font-semibold mb-2">Session</h2>
        <p className="text-sm text-text-secondary mb-4">
          Sign out of your current session on this device.
        </p>
        <Button
          variant="secondary"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          Sign Out
        </Button>
      </section>

      {/* Danger Zone */}
      <section className="border border-red-500/30 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-red-400 mb-2">Danger Zone</h2>
        <p className="text-sm text-text-secondary mb-4">
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>

        {!showDeleteConfirm && (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/20 transition-colors"
          >
            Delete Account
          </button>
        )}

        <AnimatePresence>
          {showDeleteConfirm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="space-y-3 rounded-lg border border-red-500/20 bg-red-500/5 p-4">
                <p className="text-sm text-text-primary">
                  Type your email to confirm:{" "}
                  <span className="font-mono text-red-400">{user?.email}</span>
                </p>
                <input
                  type="email"
                  value={deleteEmailInput}
                  onChange={(e) => setDeleteEmailInput(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full max-w-md rounded-lg bg-bg-primary border border-red-500/30 px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-red-500/60 transition-colors"
                />
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleting || deleteEmailInput !== (user?.email ?? "")}
                    className={cn(
                      "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                      deleteEmailInput === (user?.email ?? "")
                        ? "bg-red-600 text-white hover:bg-red-700"
                        : "bg-red-600/30 text-red-400/50 cursor-not-allowed"
                    )}
                  >
                    {deleting ? "Deleting..." : "Confirm Delete"}
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeleteEmailInput("");
                    }}
                    className="rounded-lg px-4 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}
