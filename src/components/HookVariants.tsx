import { Target, Trophy } from "lucide-react";
import type { HookVariant, RetentionPrediction } from "@/lib/types";

function findPrediction(
  predictions: RetentionPrediction[],
  variantId: string,
) {
  return predictions.find((prediction) => prediction.variantId === variantId);
}

export function HookVariants({
  variants,
  predictions,
  selectedVariantId,
}: {
  variants: HookVariant[];
  predictions: RetentionPrediction[];
  selectedVariantId: string;
}) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-fuchsia-200">
            Hook Variants
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            Three openings, one business recommendation
          </h2>
        </div>
        <Target className="h-6 w-6 text-fuchsia-200" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {variants.map((variant) => {
          const prediction = findPrediction(predictions, variant.id);
          const selected = variant.id === selectedVariantId;

          return (
            <article
              key={variant.id}
              className={`rounded-2xl border p-4 ${
                selected
                  ? "border-amber-300/70 bg-amber-300/10 shadow-xl shadow-amber-950/30"
                  : "border-white/10 bg-black/20"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-lg font-semibold text-white">
                  {variant.name}
                </h3>
                {selected ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-300 px-2 py-1 text-xs font-semibold text-zinc-950">
                    <Trophy className="h-3 w-3" />
                    Winner
                  </span>
                ) : null}
              </div>
              <p className="mt-3 rounded-xl bg-white/10 p-3 text-sm font-medium text-white">
                &quot;{variant.openingScript}&quot;
              </p>
              <dl className="mt-4 space-y-3 text-sm text-zinc-300">
                <div>
                  <dt className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                    Frame 1
                  </dt>
                  <dd className="mt-1">{variant.frameOne}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                    Overlay
                  </dt>
                  <dd className="mt-1">{variant.textOverlay}</dd>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Metric label="Cut" value={`${variant.firstCutSeconds}s`} />
                  <Metric
                    label="3s hold"
                    value={`${prediction?.threeSecondHoldRate ?? 0}%`}
                  />
                  <Metric
                    label="CTR intent"
                    value={`${prediction?.clickIntentScore ?? 0}%`}
                  />
                </div>
              </dl>
              <p className="mt-4 text-sm leading-6 text-zinc-300">
                {variant.rationale}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/10 p-2">
      <p className="text-[0.65rem] uppercase tracking-[0.16em] text-zinc-500">
        {label}
      </p>
      <p className="mt-1 font-semibold text-white">{value}</p>
    </div>
  );
}
