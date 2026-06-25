import { ScanSearch } from "lucide-react";
import type { TrendFingerprint } from "@/lib/types";

export function TrendFingerprints({
  fingerprints,
}: {
  fingerprints: TrendFingerprint[];
}) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-200">
            Trend Fingerprints
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            Structural patterns, not copied content
          </h2>
        </div>
        <ScanSearch className="h-6 w-6 text-emerald-200" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {fingerprints.map((fingerprint) => (
          <article
            key={fingerprint.id}
            className="rounded-2xl border border-white/10 bg-black/20 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-semibold text-white">{fingerprint.name}</h3>
              <span className="rounded-full bg-emerald-300/15 px-2 py-1 text-xs font-semibold text-emerald-100">
                {fingerprint.relevanceScore}% relevance
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-zinc-300">
              {fingerprint.whyItWorks}
            </p>
            <dl className="mt-4 grid gap-3 text-sm text-zinc-300">
              <FingerprintRow
                label="Frame 1"
                value={fingerprint.frameOneVisual}
              />
              <FingerprintRow
                label="Overlay"
                value={fingerprint.textOverlayPattern}
              />
              <FingerprintRow
                label="Motion"
                value={fingerprint.motionPattern}
              />
              <FingerprintRow
                label="Pacing"
                value={fingerprint.soundOrPacing}
              />
              <FingerprintRow
                label="Trigger"
                value={fingerprint.emotionalTrigger}
              />
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}

function FingerprintRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-[0.2em] text-zinc-500">
        {label}
      </dt>
      <dd className="mt-1 leading-6">{value}</dd>
    </div>
  );
}
