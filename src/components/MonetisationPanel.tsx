import { CreditCard, PackageCheck } from "lucide-react";
import type { MonetisationStep } from "@/lib/types";

export function MonetisationPanel({
  monetisation,
}: {
  monetisation: MonetisationStep;
}) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-lime-200">
            Approval / Export / Payment
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            Monetisable workflow step
          </h2>
        </div>
        <CreditCard className="h-6 w-6 text-lime-200" />
      </div>

      <div className="rounded-2xl border border-lime-300/30 bg-lime-300/10 p-4">
        <div className="flex items-center gap-3">
          <PackageCheck className="h-5 w-5 text-lime-200" />
          <p className="font-semibold text-white">{monetisation.offer}</p>
        </div>
        <p className="mt-3 text-sm leading-6 text-zinc-300">
          PayPal sandbox checkout prepared. Export status: waiting for approval.
        </p>
      </div>

      <dl className="mt-5 grid gap-3 sm:grid-cols-2">
        <Metric label="Price" value={`£${monetisation.price}`} />
        <Metric label="Provider" value={monetisation.paymentProvider} />
        <Metric label="Checkout" value={monetisation.checkoutStatus} />
        <Metric label="Export" value={monetisation.exportStatus} />
      </dl>

      <div className="mt-5 rounded-2xl bg-black/20 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
          Business model
        </p>
        <p className="mt-2 text-sm leading-6 text-zinc-300">
          {monetisation.businessModel}
        </p>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-black/20 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}
