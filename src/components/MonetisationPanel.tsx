import { CreditCard, PackageCheck } from "lucide-react";
import type { MonetisationStep } from "@/lib/types";

export function MonetisationPanel({
  monetisation,
  approvalStatus,
  checkoutMessage,
  checkoutUrl,
}: {
  monetisation: MonetisationStep;
  approvalStatus: "pending" | "approved" | "rejected";
  checkoutMessage?: string;
  checkoutUrl?: string;
}) {
  const exportStatus =
    approvalStatus === "approved"
      ? "approved_for_sandbox_checkout"
      : approvalStatus === "rejected"
        ? "rejected"
        : monetisation.exportStatus;

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
          {checkoutMessage ??
            "PayPal sandbox checkout prepared. Export status: waiting for approval."}
        </p>
        {approvalStatus === "approved" ? (
          <div className="mt-4">
            {checkoutUrl ? (
              <a
                href={checkoutUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex rounded-full bg-lime-300 px-4 py-2 text-sm font-bold text-zinc-950 transition hover:bg-lime-200"
              >
                Open PayPal sandbox checkout
              </a>
            ) : (
              <span className="inline-flex rounded-full border border-lime-300/40 bg-lime-300/10 px-4 py-2 text-sm font-semibold text-lime-100">
                Demo checkout approved
              </span>
            )}
          </div>
        ) : null}
      </div>

      <dl className="mt-5 grid gap-3 sm:grid-cols-2">
        <Metric label="Price" value={`£${monetisation.price}`} />
        <Metric label="Provider" value={monetisation.paymentProvider} />
        <Metric label="Checkout" value={monetisation.checkoutStatus} />
        <Metric label="Export" value={exportStatus} />
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
