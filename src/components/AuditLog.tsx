import { ClipboardList } from "lucide-react";
import type { AuditEvent } from "@/lib/types";

export function AuditLog({ events }: { events: AuditEvent[] }) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-300">
            Audit Log
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            Traceable agent handoffs
          </h2>
        </div>
        <ClipboardList className="h-6 w-6 text-slate-300" />
      </div>

      <div className="space-y-3">
        {events.map((event) => (
          <article
            key={event.id}
            className="rounded-2xl border border-white/10 bg-black/20 p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-semibold text-white">{event.action}</h3>
              <span className="text-xs text-zinc-500">
                {new Date(event.timestamp).toLocaleTimeString("en-GB", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <p className="mt-1 text-sm text-cyan-100">{event.agentName}</p>
            <p className="mt-3 text-sm leading-6 text-zinc-300">
              <span className="text-zinc-500">Input:</span>{" "}
              {event.inputSummary}
            </p>
            <p className="mt-1 text-sm leading-6 text-zinc-300">
              <span className="text-zinc-500">Output:</span>{" "}
              {event.outputSummary}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-white/10 px-2 py-1 text-xs text-zinc-300">
                {event.riskLevel} risk
              </span>
              {event.requiresApproval ? (
                <span className="rounded-full bg-amber-300/20 px-2 py-1 text-xs text-amber-100">
                  requires approval
                </span>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
