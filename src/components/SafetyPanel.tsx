import { ShieldCheck } from "lucide-react";
import type { SafetyCheck } from "@/lib/types";

export function SafetyPanel({ safetyCheck }: { safetyCheck: SafetyCheck }) {
  return (
    <section className="rounded-3xl border border-amber-300/30 bg-amber-300/10 p-5">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-100">
            Simulation & Oversight
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            Predict-before-publish layer
          </h2>
        </div>
        <ShieldCheck className="h-6 w-6 text-amber-100" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Risk label="Copyright similarity" value={safetyCheck.copyrightSimilarityRisk} />
        <Risk label="Brand safety" value={safetyCheck.brandSafetyRisk} />
        <Risk label="Misleading claims" value={safetyCheck.misleadingClaimRisk} />
        <Risk label="Platform policy" value={safetyCheck.platformPolicyRisk} />
        <Risk label="Reputation" value={safetyCheck.reputationalRisk} />
        <div className="rounded-2xl bg-black/20 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
            Risk score
          </p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {safetyCheck.riskScore}/100
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
        <p className="font-semibold text-white">
          Human approval required before publishing
        </p>
        <p className="mt-2 text-sm leading-6 text-zinc-300">
          Autonomy where risk is low, approval where risk is high. External
          actions are disabled in this MVP until the creator approves export or
          publishing.
        </p>
        <ul className="mt-3 space-y-2 text-sm leading-6 text-zinc-300">
          {safetyCheck.notes.map((note) => (
            <li key={note}>- {note}</li>
          ))}
        </ul>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button className="rounded-full bg-emerald-300 px-4 py-2 text-sm font-semibold text-zinc-950">
          Approve export
        </button>
        <button className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white">
          Reject
        </button>
      </div>
    </section>
  );
}

function Risk({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-black/20 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
        {label}
      </p>
      <p className="mt-2 text-lg font-semibold capitalize text-white">
        {value}
      </p>
    </div>
  );
}
