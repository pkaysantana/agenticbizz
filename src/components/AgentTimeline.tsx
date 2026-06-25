import { AlertTriangle, CheckCircle2, CircleDot, Lock } from "lucide-react";
import type { AgentStatus, AgentStep } from "@/lib/types";

const statusCopy: Record<AgentStatus, string> = {
  completed: "Completed",
  running: "Running",
  needs_approval: "Needs approval",
  blocked: "Blocked",
};

function getDisplayStatus(
  step: AgentStep,
  index: number,
  activeStepIndex?: number,
): AgentStatus {
  if (activeStepIndex === undefined) {
    return step.status;
  }

  if (index < activeStepIndex) {
    return step.status === "needs_approval" ? "needs_approval" : "completed";
  }

  if (index === activeStepIndex) {
    return "running";
  }

  return "blocked";
}

function StatusIcon({ status }: { status: AgentStatus }) {
  if (status === "running") {
    return <CircleDot className="h-4 w-4 animate-pulse text-cyan-300" />;
  }

  if (status === "needs_approval") {
    return <Lock className="h-4 w-4 text-amber-300" />;
  }

  if (status === "blocked") {
    return <AlertTriangle className="h-4 w-4 text-zinc-500" />;
  }

  return <CheckCircle2 className="h-4 w-4 text-emerald-300" />;
}

export function AgentTimeline({
  steps,
  activeStepIndex,
}: {
  steps: AgentStep[];
  activeStepIndex?: number;
}) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 shadow-2xl shadow-black/20">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-200">
            Agent Timeline
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            Self-running workflow
          </h2>
        </div>
        <span className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs font-medium text-cyan-100">
          Level 3.5 autonomy
        </span>
      </div>

      <div className="space-y-3">
        {steps.map((step, index) => {
          const status = getDisplayStatus(step, index, activeStepIndex);

          return (
            <div
              key={step.id}
              className="grid gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 sm:grid-cols-[auto_1fr_auto]"
            >
              <div className="mt-1">
                <StatusIcon status={status} />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-white">{step.agentName}</h3>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-zinc-300">
                    {step.outputType}
                  </span>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-zinc-300">
                    {step.riskLevel} risk
                  </span>
                </div>
                <p className="mt-1 text-sm leading-6 text-zinc-300">
                  {step.summary}
                </p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
                  {statusCopy[status]}
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  {new Date(step.startedAt).toLocaleTimeString("en-GB", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
