import Link from "next/link";
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

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-line bg-paper/95">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase text-clay">Private family tracker, because vibes need receipts</p>
            <h1 className="text-2xl font-black text-ink">Eric Family Tracker</h1>
            {previewMode ? (
              <p className="mt-1 text-sm font-bold text-muted">Family preview mode. Admin buttons are offstage, where they belong.</p>
            ) : null}
          </div>
          <form action={signOut}>
            <button className="focus-ring rounded-app border border-line bg-white px-3 py-2 text-sm font-bold">
              Sign out
            </button>
          </form>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 pb-4">
          {nav.map(([label, href]) => (
            <Link key={href} href={href} className="rounded-app border border-line bg-white px-3 py-2 text-sm font-bold">
              {label}
            </Link>
          ))}
          {isAdmin &&
            adminNav.map(([label, href]) => (
              <Link key={href} href={href} className="rounded-app bg-ink px-3 py-2 text-sm font-bold text-white">
                {label}
              </Link>
            ))}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
