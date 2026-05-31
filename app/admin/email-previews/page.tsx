import { AppShell } from "@/components/AppShell";
import { sendTestApprovalEmail } from "@/lib/actions";
import { requireAdmin } from "@/lib/auth";
import { getApprovalEmailPreviewSamples, renderApprovalEmailPreview } from "@/lib/email";

export const dynamic = "force-dynamic";

const samplePeople = [
  { name: "Zander", relationship: "nephew" },
  { name: "Briana", relationship: "niece" },
  { name: "Chad Tucker", relationship: "family_friend" },
  { name: "Abuelito German", relationship: "dad" }
];

export default async function EmailPreviewsPage({
  searchParams
}: {
  searchParams?: Promise<{ sample?: string; variant?: string; sent?: string; error?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const variants = getApprovalEmailPreviewSamples();
  const sample = samplePeople.find((person) => person.name === params?.sample) || samplePeople[0];
  const variantId = params?.variant || "0";
  const preview = renderApprovalEmailPreview({
    name: sample.name,
    relationship: sample.relationship,
    variantId
  });

  return (
    <AppShell>
      <section className="grid gap-5">
        <div>
          <p className="text-xs font-black uppercase text-clay">Email lab, now with fewer layout crimes</p>
          <h2 className="text-3xl font-black">Approval email previews</h2>
          <p className="mt-2 max-w-3xl text-sm font-semibold text-champagne">
            This uses the same approval email template that goes out when you approve someone. Preview here, send a test
            to yourself, then approve real people without gambling on iPhone Mail.
          </p>
        </div>

        {params?.sent ? (
          <div className="rounded-app border border-emerald-200 bg-emerald-50 p-4 font-bold text-emerald-900">
            Test approval email sent to {params.sent}. The inbox has been summoned.
          </div>
        ) : null}
        {params?.error ? (
          <div className="rounded-app border border-red-200 bg-red-50 p-4 font-bold text-red-800">{params.error}</div>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
          <aside className="rounded-app border border-white/10 bg-white/[0.08] p-4">
            <form className="grid gap-3" method="get">
              <label className="grid gap-1 text-sm font-black">
                Sample person
                <select name="sample" defaultValue={sample.name} className="rounded-app border border-white/15 bg-ink px-3 py-2 text-ivory">
                  {samplePeople.map((person) => (
                    <option key={person.name} value={person.name}>
                      {person.name} ({person.relationship.replaceAll("_", " ")})
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1 text-sm font-black">
                Email version
                <select name="variant" defaultValue={variantId} className="rounded-app border border-white/15 bg-ink px-3 py-2 text-ivory">
                  {variants.map((variant) => (
                    <option key={variant.id} value={variant.id}>
                      {Number(variant.id) + 1}. {variant.subject}
                    </option>
                  ))}
                </select>
              </label>
              <button className="rounded-app bg-gold px-3 py-2 text-sm font-black text-ink">Preview this version</button>
            </form>

            <form action={sendTestApprovalEmail} className="mt-5 grid gap-3 border-t border-white/10 pt-5">
              <input type="hidden" name="name" value={sample.name} />
              <input type="hidden" name="relationship" value={sample.relationship} />
              <input type="hidden" name="variant_id" value={variantId} />
              <label className="grid gap-1 text-sm font-black">
                Send test to
                <input
                  name="to"
                  type="email"
                  placeholder="your@email.com"
                  className="rounded-app border border-white/15 bg-ink px-3 py-2 text-ivory"
                  required
                />
              </label>
              <button className="rounded-app border border-mint/60 bg-mint/15 px-3 py-2 text-sm font-black text-mint">
                Send test approval email
              </button>
            </form>

            <div className="mt-5 rounded-app border border-gold/30 bg-gold/[0.10] p-3 text-sm font-bold text-champagne">
              <p className="font-black text-gold">Subject</p>
              <p className="mt-1">{preview.subject}</p>
              <p className="mt-3 font-black text-gold">Inbox preview</p>
              <p className="mt-1">{preview.preview}</p>
            </div>
          </aside>

          <div className="overflow-hidden rounded-app border border-white/10 bg-white p-2">
            <iframe title="Approval email preview" srcDoc={preview.html} className="h-[760px] w-full rounded-app bg-white" />
          </div>
        </div>
      </section>
    </AppShell>
  );
}
