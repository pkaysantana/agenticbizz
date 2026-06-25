import { BrainCircuit } from "lucide-react";
import type { HookVariant, RetentionPrediction } from "@/lib/types";

export function LearningLoop({
  predictions,
  variants,
  selectedVariantId,
}: {
  predictions: RetentionPrediction[];
  variants: HookVariant[];
  selectedVariantId: string;
}) {
  const selectedVariant = variants.find(
    (variant) => variant.id === selectedVariantId,
  );

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-200">
            Learning Loop
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            Simulated retention before publishing
          </h2>
        </div>
        <BrainCircuit className="h-6 w-6 text-amber-200" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {predictions.map((prediction) => {
          const variant = variants.find(
            (item) => item.id === prediction.variantId,
          );
          const selected = prediction.variantId === selectedVariantId;

          return (
            <article
              key={prediction.variantId}
              className={`rounded-2xl border p-4 ${
                selected
                  ? "border-amber-300/70 bg-amber-300/10"
                  : "border-white/10 bg-black/20"
              }`}
            >
              <h3 className="font-semibold text-white">
                {variant?.name ?? prediction.variantId}
              </h3>
              <div className="mt-4 space-y-3">
                <Bar
                  label="3-second hold"
                  value={prediction.threeSecondHoldRate}
                />
                <Bar
                  label="30-second retention"
                  value={prediction.thirtySecondRetention}
                />
                <Bar
                  label="Click intent"
                  value={prediction.clickIntentScore}
                />
                <Bar label="Confidence" value={prediction.confidence} />
              </div>
              <p className="mt-4 text-sm leading-6 text-zinc-300">
                {prediction.reasoning}
              </p>
            </article>
          );
        })}
      </div>

      <div className="mt-5 rounded-2xl border border-amber-300/30 bg-amber-300/10 p-4">
        <p className="text-sm font-semibold text-amber-100">
          Recommendation: {selectedVariant?.name}
        </p>
        <p className="mt-2 text-sm leading-6 text-zinc-300">
          Variant C wins for scroll-stop strength, but Variant B is selected as
          the best business outcome because it balances retention with qualified
          purchase intent.
        </p>
      </div>
    </section>
  );
}

function Bar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs text-zinc-400">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="mt-2 h-2 rounded-full bg-white/10">
        <div
          className="h-2 rounded-full bg-gradient-to-r from-cyan-300 to-amber-300"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
