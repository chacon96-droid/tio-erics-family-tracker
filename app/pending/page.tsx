import { signOut } from "@/lib/actions";

export default function PendingPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-paper p-4">
      <section className="w-full max-w-md rounded-app border border-line bg-white p-5">
        <p className="text-xs font-black uppercase text-clay">Roster review</p>
        <h1 className="mt-1 text-3xl font-black">You are pending approval.</h1>
        <p className="mt-3 text-sm font-semibold text-muted">
          Eric has been notified in spirit. Once he approves you, the leaderboard can begin judging everyone fairly and emotionally.
        </p>
        <form action={signOut}>
          <button className="focus-ring mt-5 w-full rounded-app bg-ink px-4 py-3 font-black text-white">Exit gracefully</button>
        </form>
      </section>
    </main>
  );
}
