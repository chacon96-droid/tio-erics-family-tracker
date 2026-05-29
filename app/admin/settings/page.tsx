import { AppShell } from "@/components/AppShell";
import { updateSetting } from "@/lib/actions";
import { requireAdmin } from "@/lib/auth";
import { getAppSettings } from "@/lib/data";

const settings = [
  ["public_leaderboard_enabled", "Public leaderboard visibility"],
  ["limited_family_leaderboard_enabled", "Limited family leaderboard"],
  ["inheritance_simulator_enabled", "Funny inheritance simulator"]
];

export default async function SettingsPage() {
  await requireAdmin();
  const values = await getAppSettings();

  return (
    <AppShell>
      <section className="max-w-2xl">
        <p className="text-xs font-black uppercase text-clay">Admin controls</p>
        <h2 className="mb-4 text-3xl font-black">Settings</h2>
        <div className="grid gap-3">
          {settings.map(([key, label]) => (
            <form key={key} action={updateSetting} className="flex items-center justify-between gap-4 rounded-app border border-line bg-white p-4">
              <input type="hidden" name="key" value={key} />
              <span className="font-black">{label}</span>
              <label className="flex items-center gap-2 font-bold">
                <input type="checkbox" name="value" defaultChecked={values[key] !== false} />
                Enabled
              </label>
              <button className="rounded-app bg-ink px-3 py-2 text-sm font-black text-white">Save</button>
            </form>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
