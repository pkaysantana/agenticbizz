import { FileText } from "lucide-react";
import type { CampaignBrief } from "@/lib/types";

export function BriefCard({ brief }: { brief: CampaignBrief }) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-200">
            Creator Brief
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            {brief.brandName}
          </h2>
        </div>
        <FileText className="h-6 w-6 text-cyan-200" />
      </div>

      <dl className="space-y-4">
        <BriefRow label="Niche" value={brief.niche} />
        <BriefRow label="Product" value={brief.product} />
        <BriefRow label="Goal" value={brief.goal} />
        <BriefRow label="Audience" value={brief.audience} />
        <BriefRow label="Business objective" value={brief.businessObjective} />
        <BriefRow label="Tone" value={brief.tone} />
      </dl>

      <div className="mt-5 rounded-2xl bg-black/20 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
          Constraints
        </p>
        <ul className="mt-3 space-y-2 text-sm leading-6 text-zinc-300">
          {brief.constraints.map((constraint) => (
            <li key={constraint}>- {constraint}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function BriefRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
        {label}
      </dt>
      <dd className="mt-1 text-sm leading-6 text-zinc-200">{value}</dd>
    </div>
  );
}
