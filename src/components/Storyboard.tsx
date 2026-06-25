import { Clapperboard } from "lucide-react";
import type { StoryboardScene } from "@/lib/types";

export function Storyboard({ scenes }: { scenes: StoryboardScene[] }) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-200">
            Storyboard
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            20-second TikTok/Reel plan
          </h2>
        </div>
        <Clapperboard className="h-6 w-6 text-violet-200" />
      </div>

      <div className="space-y-3">
        {scenes.map((scene) => (
          <article
            key={scene.id}
            className="grid gap-4 rounded-2xl border border-white/10 bg-black/20 p-4 md:grid-cols-[6rem_1fr]"
          >
            <div>
              <p className="rounded-full bg-violet-300/15 px-3 py-1 text-center text-sm font-semibold text-violet-100">
                {scene.timestamp}
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-white">{scene.visual}</h3>
              <p className="mt-2 text-sm text-cyan-100">
                Overlay: {scene.overlayText}
              </p>
              <p className="mt-2 text-sm leading-6 text-zinc-300">
                {scene.narration}
              </p>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                Camera: {scene.cameraNotes}
              </p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                {scene.funnelPurpose}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
