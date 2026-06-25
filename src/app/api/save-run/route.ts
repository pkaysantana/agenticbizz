import { createClient } from "@supabase/supabase-js";
import { isCompleteCutLabRun } from "@/lib/demo-data";

export async function POST(request: Request) {
  const payload = await readPayload(request);

  if (!payload) {
    return Response.json({
      ok: true,
      persisted: false,
      reason: "No complete CutLab run supplied.",
    });
  }

  const supabaseUrl =
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return Response.json({
      ok: true,
      persisted: false,
      reason: "Supabase is not configured for this demo environment.",
    });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
      },
    });

    const { error } = await supabase.from("cutlab_runs").insert({
      id: payload.id,
      brand_name: payload.brief.brand,
      selected_variant_id:
        payload.hookVariants.find((variant) => variant.recommended)?.id ??
        "variant-b",
      payload,
      audit_log: payload.auditLog,
      created_at: payload.generatedAt,
    });

    if (error) {
      return Response.json({
        ok: true,
        persisted: false,
        reason: error.message,
      });
    }

    return Response.json({ ok: true, persisted: true });
  } catch (error) {
    return Response.json({
      ok: true,
      persisted: false,
      reason: error instanceof Error ? error.message : "Unknown Supabase error",
    });
  }
}

async function readPayload(request: Request) {
  try {
    const payload = (await request.json()) as unknown;
    return isCompleteCutLabRun(payload) ? payload : undefined;
  } catch {
    return undefined;
  }
}
