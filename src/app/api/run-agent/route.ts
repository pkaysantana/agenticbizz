import { z } from "zod";
import {
  createSeededCutLabRun,
  isCompleteCutLabRun,
} from "@/lib/demo-data";
import type { CampaignBriefInput, CutLabRun } from "@/lib/types";

const briefSchema = z.object({
  userRequest: z.string().min(1).optional(),
  brand: z.string().min(1).optional(),
  niche: z.string().min(1).optional(),
  product: z.string().min(1).optional(),
  audience: z.string().min(1).optional(),
  businessObjective: z.string().min(1).optional(),
  tone: z.string().min(1).optional(),
  constraints: z.array(z.string()).optional(),
});

export async function POST(request: Request) {
  const input = await parseBriefInput(request);
  const modalRun = await getModalRun(input);

  if (modalRun) {
    return Response.json({
      ...modalRun,
      fallbackUsed: false,
    });
  }

  return Response.json(createSeededCutLabRun(input, { fallbackUsed: true }));
}

async function parseBriefInput(request: Request): Promise<CampaignBriefInput> {
  try {
    const body = (await request.json()) as unknown;
    const parsed = briefSchema.safeParse(body);

    if (!parsed.success) {
      return {};
    }

    return parsed.data;
  } catch {
    return {};
  }
}

async function getModalRun(
  input: CampaignBriefInput,
): Promise<CutLabRun | undefined> {
  const endpoint = process.env.MODAL_TREND_ENDPOINT;

  if (!endpoint) {
    return undefined;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ brief: input }),
      signal: controller.signal,
    });

    if (!response.ok) {
      return undefined;
    }

    const payload = (await response.json()) as unknown;
    const candidate =
      payload && typeof payload === "object" && "run" in payload
        ? (payload as { run: unknown }).run
        : payload;

    if (!isCompleteCutLabRun(candidate)) {
      return undefined;
    }

    return candidate;
  } catch {
    return undefined;
  } finally {
    clearTimeout(timeout);
  }
}
