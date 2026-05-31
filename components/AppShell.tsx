import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";
import { signOut } from "@/lib/actions";
import { getProfile } from "@/lib/auth";

const nav = [
  ["Dashboard", "/dashboard"],
  ["Leaderboard", "/leaderboard"],
  ["People", "/people"],
  ["New interaction", "/interactions/new"],
  ["Submissions", "/submissions"]
];

const adminNav = [
  ["Approvals", "/admin/approvals"],
  ["Pending stats", "/admin/pending"],
  ["Weights", "/admin/weights"],
  ["Settings", "/admin/settings"]
];

export async function AppShell({ children, previewMode = false }: { children: React.ReactNode; previewMode?: boolean }) {
  const profile = await getProfile();
  const isAdmin = profile?.role === "admin" && !previewMode;
  const navigation = [...nav, ...(isAdmin ? adminNav : [])];

  return (
    <div className="min-h-screen bg-ink text-ivory">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-ink/[0.88] shadow-[0_20px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <BrandMark tone="light" />
            <p className="mt-2 text-xs font-black uppercase tracking-[0.18em] text-gold">Private family intelligence, because vibes need receipts</p>
            {previewMode ? (
              <p className="mt-1 text-sm font-bold text-champagne">Family preview mode. Admin buttons are offstage, where they belong.</p>
            ) : null}
          </div>
          <form action={signOut}>
            <button className="focus-ring rounded-app border border-gold/50 bg-gold px-3 py-2 text-sm font-black text-ink shadow-brand hover:bg-champagne">
              Sign out
            </button>
          </form>
        </div>
        <nav className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 pb-4">
          {navigation.map(([label, href]) => {
            const adminItem = adminNav.some((item) => item[1] === href);
            return (
              <Link
                key={href}
                href={href}
                className={`rounded-app border px-3 py-2 text-sm font-black shadow-sm transition ${
                  adminItem
                    ? "border-gold/60 bg-gold/[0.12] text-gold hover:bg-gold hover:text-ink"
                    : "border-white/10 bg-white/[0.08] text-ivory hover:border-mint/70 hover:bg-white/[0.14]"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
    </div>
  );
}
