import type {
  AgentStep,
  AuditEvent,
  CampaignBrief,
  CampaignBriefInput,
  CutLabRun,
  HookVariant,
  MonetisationStep,
  RetentionPrediction,
  SafetyCheck,
  StoryboardScene,
  TrendFingerprint,
} from "@/lib/types";

const baseTime = new Date("2026-06-25T18:00:00.000Z");

function minutesAfter(minutes: number) {
  return new Date(baseTime.getTime() + minutes * 60_000).toISOString();
}

function buildBrief(input: CampaignBriefInput = {}): CampaignBrief {
  return {
    id: "brief-repform-compression-top",
    brandName: input.brandName ?? "RepForm",
    niche: input.niche ?? "fitness apparel / gymwear",
    product: input.product ?? "new compression top",
    goal: input.goal ?? "Create a 20-second TikTok/Reel for a new compression top",
    audience:
      input.audience ??
      "18-30 gym-goers who care about comfort, confidence, and performance",
    businessObjective:
      input.businessObjective ?? "Drive product page clicks and purchases",
    tone:
      input.tone ??
      "fast, direct, visual, slightly provocative, not misleading",
    constraints: input.constraints ?? [
      "Do not claim medical or guaranteed performance benefits.",
      "Copy structural hook patterns only, never creator-specific wording or footage.",
      "Require human approval before publishing, export, or payment execution.",
    ],
    createdAt: minutesAfter(0),
  };
}

const agentSteps: AgentStep[] = [
  {
    id: "agent-brief-intake",
    agentName: "Brief Intake Agent",
    status: "completed",
    startedAt: minutesAfter(0),
    completedAt: minutesAfter(1),
    summary:
      "Converted the creator idea into a structured campaign brief with assumptions and guardrails.",
    outputType: "brief",
    riskLevel: "low",
  },
  {
    id: "agent-scout",
    agentName: "Scout Agent",
    status: "completed",
    startedAt: minutesAfter(1),
    completedAt: minutesAfter(2),
    summary:
      "Simulated high-performing gymwear trend patterns using deterministic demo fingerprints.",
    outputType: "fingerprints",
    riskLevel: "low",
  },
  {
    id: "agent-analyst",
    agentName: "Analyst Agent",
    status: "completed",
    startedAt: minutesAfter(2),
    completedAt: minutesAfter(3),
    summary:
      "Extracted first-three-second hook fingerprints without copying creators, words, faces, or footage.",
    outputType: "fingerprints",
    riskLevel: "medium",
  },
  {
    id: "agent-director",
    agentName: "Director Agent",
    status: "completed",
    startedAt: minutesAfter(3),
    completedAt: minutesAfter(4),
    summary:
      "Built a 20-second storyboard from problem identification to product proof and call to action.",
    outputType: "storyboard",
    riskLevel: "low",
  },
  {
    id: "agent-editor",
    agentName: "Editor Agent",
    status: "completed",
    startedAt: minutesAfter(4),
    completedAt: minutesAfter(5),
    summary:
      "Generated three opening-hook variants from the strongest structural fingerprints.",
    outputType: "hooks",
    riskLevel: "medium",
  },
  {
    id: "agent-learning",
    agentName: "Learning Agent",
    status: "completed",
    startedAt: minutesAfter(5),
    completedAt: minutesAfter(6),
    summary:
      "Predicted retention and click intent, selecting Variant B as the best business outcome.",
    outputType: "prediction",
    riskLevel: "medium",
  },
  {
    id: "agent-safety",
    agentName: "Safety & Oversight Agent",
    status: "needs_approval",
    startedAt: minutesAfter(6),
    completedAt: minutesAfter(7),
    summary:
      "Approved internal preview, warned on misleading claims, and blocked autonomous external publishing.",
    outputType: "safety",
    riskLevel: "medium",
  },
  {
    id: "agent-monetisation",
    agentName: "Monetisation Agent",
    status: "needs_approval",
    startedAt: minutesAfter(7),
    completedAt: minutesAfter(8),
    summary:
      "Prepared a PayPal sandbox checkout placeholder for a paid optimisation export.",
    outputType: "monetisation",
    riskLevel: "medium",
  },
];

const fingerprints: TrendFingerprint[] = [
  {
    id: "fingerprint-pain-point",
    name: "Pain-point cold open",
    frameOneVisual:
      "Close-up of a lifter tugging at an uncomfortable shirt between reps.",
    firstCutSeconds: 0.7,
    textOverlayPattern: "Direct accusation of a hidden workout problem.",
    motionPattern: "Abrupt micro-zoom into the problem, then hard cut to relief.",
    soundOrPacing: "Fast beat drop with first cut under one second.",
    emotionalTrigger: "I have felt that frustration.",
    whyItWorks:
      "A negative pattern interrupt makes the viewer identify the problem before the product appears.",
    relevanceScore: 92,
    sourceType: "seeded_demo",
    notes: "Use structure only; avoid copying creator wording or footage.",
  },
  {
    id: "fingerprint-product-reveal",
    name: "Fast product reveal",
    frameOneVisual:
      "Compression top pulled into frame, then snapped onto the athlete in a match cut.",
    firstCutSeconds: 0.8,
    textOverlayPattern: "Short product promise anchored in a physical moment.",
    motionPattern: "Handheld reveal, match cut, close fabric detail.",
    soundOrPacing: "Three quick beats, one visual proof per beat.",
    emotionalTrigger: "This looks purpose-built.",
    whyItWorks:
      "The product is not delayed; viewers see what is being sold before curiosity fades.",
    relevanceScore: 88,
    sourceType: "seeded_demo",
    notes: "Best for product-led brands with strong visual assets.",
  },
  {
    id: "fingerprint-before-after",
    name: "Before/after contrast",
    frameOneVisual:
      "Split screen of a loose old gym shirt beside the RepForm compression top.",
    firstCutSeconds: 0.6,
    textOverlayPattern: "Simple comparison: same person, different fit.",
    motionPattern: "Side-by-side cut, then synchronized movement into a set.",
    soundOrPacing: "Quick whoosh transition into the improved version.",
    emotionalTrigger: "Instant transformation and self-image upgrade.",
    whyItWorks:
      "The value proposition is visible even with sound off, creating a strong scroll stop.",
    relevanceScore: 94,
    sourceType: "seeded_demo",
    notes: "High hook strength, but can feel more gimmicky if overused.",
  },
  {
    id: "fingerprint-direct-accusation",
    name: "Creator face + direct accusation",
    frameOneVisual:
      "Creator looks into camera from the gym floor and calls out a common mistake.",
    firstCutSeconds: 1,
    textOverlayPattern: "You are ignoring the one fit detail that changes the set.",
    motionPattern: "Face-to-camera start, then cut to product proof.",
    soundOrPacing: "Spoken line lands before the first camera move.",
    emotionalTrigger: "Personal challenge and curiosity.",
    whyItWorks:
      "Direct address creates social pressure, but requires careful tone to avoid misleading claims.",
    relevanceScore: 81,
    sourceType: "seeded_demo",
    notes: "Use sparingly for brands that can support provocative copy.",
  },
  {
    id: "fingerprint-micro-proof",
    name: "Micro-proof demonstration",
    frameOneVisual:
      "Fabric stretch and rebound shown beside a rep counter overlay.",
    firstCutSeconds: 0.9,
    textOverlayPattern: "Show the proof in one movement.",
    motionPattern: "Macro shot, quick pull test, cut to athlete wearing it.",
    soundOrPacing: "Tactile fabric sound layered under a tight beat.",
    emotionalTrigger: "Belief through visible evidence.",
    whyItWorks:
      "It reduces scepticism by making the product benefit observable rather than claimed.",
    relevanceScore: 86,
    sourceType: "seeded_demo",
    notes: "Avoid scientific language unless the claim is substantiated.",
  },
];

const storyboard: StoryboardScene[] = [
  {
    id: "scene-1",
    timestamp: "0:00-0:03",
    visual: "Split-screen: old loose gym shirt vs RepForm compression top.",
    overlayText: "Same workout. Different fit.",
    narration: "Your top should not be the thing breaking your focus.",
    cameraNotes: "Start with a tight crop, first cut at 0.6s, keep motion high.",
    funnelPurpose: "Scroll stop and instant problem framing.",
  },
  {
    id: "scene-2",
    timestamp: "0:03-0:07",
    visual: "Athlete begins a heavy set wearing the compression top.",
    overlayText: "Built for the reps where normal tops quit.",
    narration: "RepForm stays close without fighting the movement.",
    cameraNotes: "Low-angle push-in during the first rep.",
    funnelPurpose: "Product credibility and aspiration.",
  },
  {
    id: "scene-3",
    timestamp: "0:07-0:11",
    visual: "Macro fabric stretch, shoulder seam, and breathability detail.",
    overlayText: "Stretch. Shape. No distractions.",
    narration: "Compression where it helps, comfort where it matters.",
    cameraNotes: "Three proof shots on beat, no lab-style claims.",
    funnelPurpose: "Evidence and objection handling.",
  },
  {
    id: "scene-4",
    timestamp: "0:11-0:16",
    visual: "Mirror confidence moment after the set.",
    overlayText: "Look locked in before the first rep.",
    narration: "When the fit feels right, the set starts stronger.",
    cameraNotes: "Handheld mirror shot, fast but stable.",
    funnelPurpose: "Emotional conversion and identity.",
  },
  {
    id: "scene-5",
    timestamp: "0:16-0:20",
    visual: "Product page mock with colour options and checkout CTA.",
    overlayText: "RepForm compression top. Tap to shop.",
    narration: "Try the fit built for your next session.",
    cameraNotes: "End on clear CTA and product detail.",
    funnelPurpose: "Click-through and purchase intent.",
  },
];

const hookVariants: HookVariant[] = [
  {
    id: "variant-a",
    name: "Variant A: Pain-point cold open",
    basedOnFingerprintId: "fingerprint-pain-point",
    openingScript: "Your gym top is ruining your workout.",
    frameOne:
      "Close-up of someone adjusting an uncomfortable top mid-set.",
    textOverlay: "Your gym top is ruining your workout.",
    firstCutSeconds: 0.7,
    shotSequence: [
      "Uncomfortable shirt adjustment",
      "Hard cut to RepForm fit",
      "Athlete resets and starts the set",
    ],
    predictedReaction:
      "Strong negative pattern interrupt; viewers who know the pain keep watching.",
    rationale:
      "Immediate problem identification creates relevance before the product reveal.",
  },
  {
    id: "variant-b",
    name: "Variant B: Performance proof open",
    basedOnFingerprintId: "fingerprint-product-reveal",
    openingScript: "Built for the reps where normal tops quit.",
    frameOne:
      "Athlete starting a heavy set in the compression top.",
    textOverlay: "Built for the reps where normal tops quit.",
    firstCutSeconds: 0.9,
    shotSequence: [
      "Athlete braces for a heavy set",
      "Fabric holds shape through the rep",
      "Macro proof shot on the compression fit",
    ],
    predictedReaction:
      "Viewers understand the product promise and can picture using it.",
    rationale:
      "Balances retention with purchase intent by showing credible product proof quickly.",
  },
  {
    id: "variant-c",
    name: "Variant C: Before/after visual contrast",
    basedOnFingerprintId: "fingerprint-before-after",
    openingScript: "Same workout. Different fit.",
    frameOne:
      "Split screen of loose old gym shirt vs fitted compression top.",
    textOverlay: "Same workout. Different fit.",
    firstCutSeconds: 0.6,
    shotSequence: [
      "Before/after split screen",
      "Cut into synchronized set movement",
      "CTA flash: choose the fitted side",
    ],
    predictedReaction:
      "Excellent scroll stop because the transformation is visible instantly.",
    rationale:
      "Visually clear transformation may drive clicks, though long retention is slightly lower.",
  },
];

const predictions: RetentionPrediction[] = [
  {
    variantId: "variant-a",
    threeSecondHoldRate: 78,
    thirtySecondRetention: 42,
    clickIntentScore: 68,
    confidence: 74,
    reasoning:
      "The pain-point hook should stop gymwear viewers, but purchase intent depends on how quickly proof appears.",
  },
  {
    variantId: "variant-b",
    threeSecondHoldRate: 71,
    thirtySecondRetention: 48,
    clickIntentScore: 83,
    confidence: 79,
    reasoning:
      "Lower initial shock than Variant C, but stronger qualified intent because product proof appears immediately.",
  },
  {
    variantId: "variant-c",
    threeSecondHoldRate: 82,
    thirtySecondRetention: 39,
    clickIntentScore: 74,
    confidence: 76,
    reasoning:
      "Best scroll stop from instant contrast, but some viewers may leave once the transformation is understood.",
  },
];

const safetyCheck: SafetyCheck = {
  copyrightSimilarityRisk: "low",
  brandSafetyRisk: "low",
  misleadingClaimRisk: "medium",
  platformPolicyRisk: "low",
  reputationalRisk: "low",
  riskScore: 24,
  approvalRequired: true,
  status: "approved_for_preview",
  externalActionsAllowed: false,
  notes: [
    "CutLab copies structural patterns, not creator-specific wording, faces, music, or footage.",
    "Avoid phrases like 'scientifically proven' or 'guaranteed performance' unless evidence is uploaded.",
    "Approved for internal preview; external publishing, export, and payment execution require human approval.",
  ],
};

const monetisation: MonetisationStep = {
  price: 19,
  currency: "GBP",
  paymentProvider: "PayPal Sandbox",
  sandboxMode: true,
  checkoutStatus: "sandbox_prepared",
  exportStatus: "waiting_for_approval",
  businessModel:
    "CutLab can charge creators and agencies per optimisation run, monthly for automated hook testing, or as a white-label workflow for brands producing high-volume short-form content.",
  offer: "10 optimisation runs: GBP 19. Agency plan: GBP 99/month.",
};

const auditLog: AuditEvent[] = [
  {
    id: "audit-1",
    timestamp: minutesAfter(1),
    agentName: "Brief Intake Agent",
    action: "Structured campaign brief",
    inputSummary: "Raw RepForm gymwear objective and audience.",
    outputSummary: "Campaign brief, assumptions, constraints, and initial risks.",
    riskLevel: "low",
    requiresApproval: false,
  },
  {
    id: "audit-2",
    timestamp: minutesAfter(3),
    agentName: "Analyst Agent",
    action: "Extracted hook fingerprints",
    inputSummary: "Seeded trend categories for gymwear short-form videos.",
    outputSummary: "Five structural fingerprints with relevance scores.",
    riskLevel: "medium",
    requiresApproval: false,
  },
  {
    id: "audit-3",
    timestamp: minutesAfter(4),
    agentName: "Director Agent",
    action: "Generated storyboard",
    inputSummary: "Structured brief and top fingerprints.",
    outputSummary: "Five-scene 20-second TikTok/Reel storyboard.",
    riskLevel: "low",
    requiresApproval: false,
  },
  {
    id: "audit-4",
    timestamp: minutesAfter(5),
    agentName: "Editor Agent",
    action: "Generated hook variants",
    inputSummary: "Storyboard and strongest hook fingerprints.",
    outputSummary: "Three hook openings with frame one, text overlay, and shot sequence.",
    riskLevel: "medium",
    requiresApproval: false,
  },
  {
    id: "audit-5",
    timestamp: minutesAfter(6),
    agentName: "Learning Agent",
    action: "Simulated retention",
    inputSummary: "Hook variants A, B, and C.",
    outputSummary: "Variant B recommended as best business outcome.",
    riskLevel: "medium",
    requiresApproval: false,
  },
  {
    id: "audit-6",
    timestamp: minutesAfter(7),
    agentName: "Safety & Oversight Agent",
    action: "Gated external action",
    inputSummary: "Recommended hook, storyboard, claims, and monetisation step.",
    outputSummary: "Internal preview approved; publishing/export/payment require approval.",
    riskLevel: "medium",
    requiresApproval: true,
  },
];

export const demoBrief = buildBrief();

export function createSeededCutLabRun(
  input: CampaignBriefInput = {},
  options: { fallbackUsed?: boolean } = {},
): CutLabRun {
  return {
    id: "run-repform-seeded-001",
    brief: buildBrief(input),
    agentSteps,
    fingerprints,
    storyboard,
    hookVariants,
    predictions,
    safetyCheck,
    monetisation,
    auditLog,
    selectedVariantId: "variant-b",
    autonomyLevel:
      "3.5 - agents independently generate, analyse, score, and recommend; human approval required before publishing or payment execution.",
    fallbackUsed: options.fallbackUsed ?? true,
    generatedAt: minutesAfter(8),
  };
}

export function isCompleteCutLabRun(value: unknown): value is CutLabRun {
  if (!value || typeof value !== "object") {
    return false;
  }

  const run = value as Partial<CutLabRun>;

  return Boolean(
    run.id &&
      run.brief &&
      Array.isArray(run.agentSteps) &&
      Array.isArray(run.fingerprints) &&
      Array.isArray(run.storyboard) &&
      Array.isArray(run.hookVariants) &&
      Array.isArray(run.predictions) &&
      run.safetyCheck &&
      run.monetisation &&
      Array.isArray(run.auditLog) &&
      run.selectedVariantId,
  );
}
