import type {
  AgentStep,
  AuditEvent,
  CampaignBrief,
  CampaignBriefInput,
  CutLabRun,
  FinalCut,
  HookVariant,
  InitialVideoConcept,
  Keyframe,
  LearningLoop,
  MonetisationStep,
  SafetyCheck,
  Scene,
  TrendFingerprint,
  VideoComparison,
} from "@/lib/types";

const generatedAt = "2026-06-25T18:00:00.000Z";

function buildBrief(input: CampaignBriefInput = {}): CampaignBrief {
  return {
    id: "repform-compression-top",
    userRequest:
      input.userRequest ??
      "Create a 20-second TikTok/Reel for a gymwear brand launching a new compression top.",
    brand: input.brand ?? "RepForm",
    niche: input.niche ?? "Fitness apparel / gymwear",
    audience:
      input.audience ??
      "18-30 gym-goers who care about comfort, performance, and confidence.",
    businessObjective:
      input.businessObjective ?? "Drive product page clicks and purchases.",
    tone:
      input.tone ??
      "Fast, direct, visual, slightly provocative, but not misleading.",
    product: input.product ?? "New compression top",
    constraints: input.constraints ?? [
      "No login or empty state for the demo.",
      "No real publishing or video rendering.",
      "Human approval required before payment/export.",
    ],
  };
}

const initialVideoConcept: InitialVideoConcept = {
  title: "Meet the RepForm Compression Top",
  durationSeconds: 20,
  structure: [
    "0-3s: Product intro and brand reveal",
    "3-8s: Athlete wearing the top during a heavy set",
    "8-13s: Fabric and fit detail shots",
    "13-17s: Confidence mirror moment",
    "17-20s: Product page click call-to-action",
  ],
  openingHook: "Introducing the new RepForm compression top.",
  scriptDraft: [
    "Introducing the new RepForm compression top.",
    "Designed for gym sessions where comfort and focus matter.",
    "A close fit, sharp silhouette, and movement-ready feel.",
    "RepForm helps you look locked in from warm-up to final set.",
    "Tap to shop the launch drop today.",
  ],
  scenes: [
    {
      id: "initial-scene-1",
      timestamp: "0:00-0:03",
      visual: "Product hero shot on a gym bench with a quick logo flash.",
      overlay: "New RepForm compression top",
      script: "Introducing the new RepForm compression top.",
      cameraNotes: "Clean push-in, but the opener lacks a pattern interrupt.",
    },
    {
      id: "initial-scene-2",
      timestamp: "0:03-0:08",
      visual: "Athlete starts a set while wearing the top.",
      overlay: "Built for training",
      script: "Designed for gym sessions where comfort and focus matter.",
      cameraNotes: "Medium handheld shot, cut after the first rep.",
    },
    {
      id: "initial-scene-3",
      timestamp: "0:08-0:13",
      visual: "Macro shots of shoulder seams, stretch, and fit.",
      overlay: "Stretch. Shape. Comfort.",
      script: "A close fit, sharp silhouette, and movement-ready feel.",
      cameraNotes: "Three detail shots timed to the beat.",
    },
    {
      id: "initial-scene-4",
      timestamp: "0:13-0:17",
      visual: "Mirror confidence moment after a completed set.",
      overlay: "Feel locked in",
      script: "RepForm helps you look locked in from warm-up to final set.",
      cameraNotes: "Short gym mirror pan.",
    },
    {
      id: "initial-scene-5",
      timestamp: "0:17-0:20",
      visual: "Product page mock with colour options and shop button.",
      overlay: "Tap to shop",
      script: "Tap to shop the launch drop today.",
      cameraNotes: "End on product page click target.",
    },
  ],
  keyframes: [
    {
      id: "initial-keyframe-1",
      timestamp: "0:00",
      description: "Compression top folded on a bench beside chalk and straps.",
    },
    {
      id: "initial-keyframe-2",
      timestamp: "0:04",
      description: "Athlete begins a controlled heavy rep in the top.",
    },
    {
      id: "initial-keyframe-3",
      timestamp: "0:10",
      description: "Macro view of fabric stretch under shoulder movement.",
    },
    {
      id: "initial-keyframe-4",
      timestamp: "0:18",
      description: "Mobile product page with RepForm compression top selected.",
    },
  ],
};

const agentSteps: AgentStep[] = [
  {
    id: "agent-intake",
    agentName: "Intake Agent",
    status: "completed",
    summary: "Structured the RepForm request into audience, objective, tone, and constraints.",
    outputType: "brief",
    riskLevel: "low",
  },
  {
    id: "agent-director",
    agentName: "Director Agent",
    status: "completed",
    summary: "Generated the initial 20-second rough concept and storyboard.",
    outputType: "rough_cut",
    riskLevel: "low",
  },
  {
    id: "agent-video-generation",
    agentName: "Video Generation Agent",
    status: "completed",
    summary: "Represented the video as script, scene structure, and keyframes for the MVP.",
    outputType: "rough_cut",
    riskLevel: "low",
  },
  {
    id: "agent-trend-scout",
    agentName: "Trend Scout Agent",
    status: "completed",
    summary: "Loaded seeded gymwear hook/style fingerprints that mimic a trend intelligence layer.",
    outputType: "trend_scan",
    riskLevel: "medium",
  },
  {
    id: "agent-hook-analyst",
    agentName: "Hook Analyst Agent",
    status: "completed",
    summary: "Compared the rough cut against top-performing first-three-second patterns.",
    outputType: "comparison",
    riskLevel: "medium",
  },
  {
    id: "agent-editor",
    agentName: "Editor Agent",
    status: "completed",
    summary: "Generated three improved openings and selected the strongest commercial route.",
    outputType: "hooks",
    riskLevel: "medium",
  },
  {
    id: "agent-learning",
    agentName: "Learning Agent",
    status: "completed",
    summary: "Simulated hold, retention, click intent, and confidence using seeded metrics.",
    outputType: "learning",
    riskLevel: "medium",
  },
  {
    id: "agent-safety",
    agentName: "Safety & Approval Agent",
    status: "needs_approval",
    summary: "Approved internal preview while blocking external publishing and payment without human approval.",
    outputType: "safety",
    riskLevel: "medium",
  },
  {
    id: "agent-monetisation",
    agentName: "Monetisation Agent",
    status: "needs_approval",
    summary: "Prepared a PayPal Sandbox export step with a mock fallback when credentials are missing.",
    outputType: "monetisation",
    riskLevel: "medium",
  },
];

const trendFingerprints: TrendFingerprint[] = [
  {
    id: "pain-point-cold-open",
    name: "Pain-point cold open",
    frameOneVisual: "Close-up of someone adjusting an uncomfortable top mid-set.",
    firstCutTiming: "0.7s",
    textOverlayPattern: "Direct accusation: the viewer's current gear is causing a problem.",
    movementPacing: "Abrupt handheld micro-zoom, hard cut before one second.",
    emotionalTrigger: "Frustration and recognition.",
    relevanceScore: 94,
    whyItWorks: "It creates an immediate pattern interrupt and names a problem the audience has felt.",
  },
  {
    id: "before-after-transformation",
    name: "Before/after transformation",
    frameOneVisual: "Split screen: loose old gym shirt versus fitted compression top.",
    firstCutTiming: "0.6s",
    textOverlayPattern: "Short contrast line that is understandable with sound off.",
    movementPacing: "Side-by-side reveal into synchronized training movement.",
    emotionalTrigger: "Instant upgrade and self-image improvement.",
    relevanceScore: 91,
    whyItWorks: "The benefit is visible before the product needs explanation.",
  },
  {
    id: "fast-product-reveal",
    name: "Fast product reveal",
    frameOneVisual: "The top snaps into frame, then match-cuts onto the athlete.",
    firstCutTiming: "0.8s",
    textOverlayPattern: "Product promise attached to a physical action.",
    movementPacing: "Three rapid proof beats: reveal, wear, detail.",
    emotionalTrigger: "Curiosity and product desire.",
    relevanceScore: 88,
    whyItWorks: "It keeps the product visible early while still feeling dynamic.",
  },
  {
    id: "creator-face-direct-challenge",
    name: "Creator face + direct challenge",
    frameOneVisual: "Creator faces camera from the gym floor and challenges a common fit mistake.",
    firstCutTiming: "1.0s",
    textOverlayPattern: "A direct 'you' statement that provokes without overclaiming.",
    movementPacing: "Face-to-camera setup, then immediate proof cut.",
    emotionalTrigger: "Personal challenge and social pressure.",
    relevanceScore: 83,
    whyItWorks: "Direct address makes the viewer feel called into the scene.",
  },
  {
    id: "micro-proof-demonstration",
    name: "Micro-proof demonstration",
    frameOneVisual: "Fabric stretch and rebound shown beside a rep counter overlay.",
    firstCutTiming: "0.9s",
    textOverlayPattern: "Show the proof in one movement.",
    movementPacing: "Macro pull test, cut to movement, cut to fit detail.",
    emotionalTrigger: "Belief through visible evidence.",
    relevanceScore: 87,
    whyItWorks: "The product benefit is demonstrated visually instead of asserted.",
  },
];

const comparison: VideoComparison = {
  initialHook: "Introducing the new RepForm compression top.",
  problem: "Too generic, low pattern interrupt, and product-led before the viewer feels the need.",
  trendingPattern: "Pain-point cold open + visual discomfort moment.",
  improvement: 'Start with "Your gym top is ruining your workout" or a proof-led performance moment.',
  matchedFingerprints: [
    "Pain-point cold open",
    "Fast product reveal",
    "Micro-proof demonstration",
  ],
};

const hookVariants: HookVariant[] = [
  {
    id: "variant-a",
    name: "Variant A: Pain-point cold open",
    firstThreeSecondsScript: "Your gym top is ruining your workout.",
    frameOneDescription: "Close-up of someone adjusting an uncomfortable top mid-set.",
    textOverlay: "Your gym top is ruining your workout.",
    firstCutTiming: "0.7s",
    shotSequence: [
      "Uncomfortable shirt adjustment",
      "Hard cut to RepForm compression fit",
      "Athlete resets and starts the set",
    ],
    predictedThreeSecondHoldRate: 78,
    predictedThirtySecondRetention: 42,
    predictedPurchaseIntent: 68,
    rationale: "Best for stopping the scroll by naming a familiar gymwear pain point.",
  },
  {
    id: "variant-b",
    name: "Variant B: Performance proof open",
    firstThreeSecondsScript: "Built for the reps where normal tops quit.",
    frameOneDescription: "Athlete starting a heavy set in the compression top.",
    textOverlay: "Built for the reps where normal tops quit.",
    firstCutTiming: "0.9s",
    shotSequence: [
      "Athlete braces for a heavy set",
      "Fabric holds shape through the first rep",
      "Macro proof shot on the compression fit",
    ],
    predictedThreeSecondHoldRate: 71,
    predictedThirtySecondRetention: 48,
    predictedPurchaseIntent: 81,
    rationale: "Recommended winner because it balances retention and purchase intent while showing product proof immediately.",
    recommended: true,
  },
  {
    id: "variant-c",
    name: "Variant C: Before/after visual contrast",
    firstThreeSecondsScript: "Same workout. Different fit.",
    frameOneDescription: "Split screen of loose old gym shirt vs fitted compression top.",
    textOverlay: "Same workout. Different fit.",
    firstCutTiming: "0.6s",
    shotSequence: [
      "Loose shirt side-by-side with RepForm top",
      "Synchronized first rep",
      "Cut to the fitted version taking over the frame",
    ],
    predictedThreeSecondHoldRate: 82,
    predictedThirtySecondRetention: 39,
    predictedPurchaseIntent: 63,
    rationale: "Strongest visual contrast, but weaker purchase intent than the proof-led winner.",
  },
];

const finalCut: FinalCut = {
  title: "RepForm: Built For The Reps Where Normal Tops Quit",
  durationSeconds: 20,
  hook: "Built for the reps where normal tops quit.",
  script: [
    "Built for the reps where normal tops quit.",
    "RepForm stays close through the movement without making the set about your shirt.",
    "Stretch where you need it. Shape where you want it. No distractions between reps.",
    "From first lift to mirror check, the fit stays locked in.",
    "RepForm compression top. Tap to shop the launch.",
  ],
  scenes: [
    {
      id: "final-scene-1",
      timestamp: "0:00-0:03",
      visual: "Athlete braces for a heavy set in the compression top.",
      overlay: "Built for the reps where normal tops quit.",
      script: "Built for the reps where normal tops quit.",
      cameraNotes: "First cut at 0.9s from face/brace to fabric tension.",
    },
    {
      id: "final-scene-2",
      timestamp: "0:03-0:07",
      visual: "Rep starts; the top holds shape through shoulder and chest movement.",
      overlay: "Moves with you",
      script: "RepForm stays close through the movement without making the set about your shirt.",
      cameraNotes: "Low-angle push-in, then detail cut on beat.",
    },
    {
      id: "final-scene-3",
      timestamp: "0:07-0:12",
      visual: "Macro stretch, seam, and fit detail.",
      overlay: "Stretch. Shape. No distractions.",
      script: "Stretch where you need it. Shape where you want it. No distractions between reps.",
      cameraNotes: "Three proof shots, no unsupported performance claims.",
    },
    {
      id: "final-scene-4",
      timestamp: "0:12-0:16",
      visual: "Athlete resets and checks fit in the mirror.",
      overlay: "Look locked in",
      script: "From first lift to mirror check, the fit stays locked in.",
      cameraNotes: "Mirror move with quick focus pull to the top.",
    },
    {
      id: "final-scene-5",
      timestamp: "0:16-0:20",
      visual: "RepForm product page with colour options and checkout CTA.",
      overlay: "Tap to shop",
      script: "RepForm compression top. Tap to shop the launch.",
      cameraNotes: "Clear product page click target, no auto-publish.",
    },
  ],
  keyframes: [
    {
      id: "final-keyframe-1",
      timestamp: "0:00",
      description: "Athlete locked in before a heavy set, top visible in frame one.",
    },
    {
      id: "final-keyframe-2",
      timestamp: "0:04",
      description: "Fabric holds shape during the first rep.",
    },
    {
      id: "final-keyframe-3",
      timestamp: "0:09",
      description: "Macro detail showing stretch and fit without medical-style claims.",
    },
    {
      id: "final-keyframe-4",
      timestamp: "0:17",
      description: "Product page CTA ready for approved export.",
    },
  ],
  selectedBecause:
    "Variant B sacrifices a little scroll-stop shock for stronger qualified intent: viewers see the product, use case, and proof before the CTA.",
};

const learningLoop: LearningLoop = {
  predictedThreeSecondHold: 71,
  predictedThirtySecondRetention: 48,
  predictedClickIntent: 81,
  confidenceScore: 79,
  whatTheSystemLearned:
    "For RepForm, proof-led gym footage is more commercially valuable than a purely provocative discomfort hook.",
  nextGenerationImprovement:
    "Test the same proof-led opening with creator face voiceover versus product-only footage.",
  generationOne:
    "Generation 1 copies trends structurally: it borrows hook timing, proof pacing, and contrast patterns.",
  generationTen:
    "Generation 10 learns what works for this creator's audience by weighting real hold, retention, click, and purchase feedback.",
};

const safetyCheck: SafetyCheck = {
  copyrightSimilarityRisk: "low",
  brandSafetyRisk: "low",
  misleadingClaimsRisk: "medium",
  platformPolicyRisk: "low",
  approvalRequiredBeforePublishing: true,
  approvalRequiredBeforePaymentExport: true,
  status: "approved_for_internal_preview",
  policyLanguage:
    "CutLab copies structural patterns, not creator-specific footage, wording, faces, or protected assets.",
  notes: [
    "Status: approved for internal preview, requires human approval for external publishing.",
    "Approval required before publishing.",
    "Approval required before payment/export.",
    "Avoid misleading claims such as guaranteed strength or medical compression benefits.",
  ],
};

const monetisation: MonetisationStep = {
  product: "10 video optimisation runs",
  price: 19,
  currency: "GBP",
  agencyPlan: "£99/month",
  paymentProvider: "PayPal Sandbox",
  checkoutStatus: "Mock checkout ready if credentials are missing.",
  approvalRequired: true,
  message: "Human approval required before payment execution.",
};

const auditActions = [
  ["User brief received", "Intake Agent"],
  ["Initial rough cut generated", "Director Agent"],
  ["Trend fingerprints retrieved", "Trend Scout Agent"],
  ["Hook variants generated", "Editor Agent"],
  ["Retention simulated", "Learning Agent"],
  ["Winner selected", "Learning Agent"],
  ["Safety checks completed", "Safety & Approval Agent"],
  ["Export/payment prepared", "Monetisation Agent"],
  ["Human approval pending", "Safety & Approval Agent"],
] as const;

const auditLog: AuditEvent[] = auditActions.map(([action, agentName], index) => ({
  id: `audit-${index + 1}`,
  timestamp: `18:${String(index).padStart(2, "0")}`,
  action,
  agentName,
  status: action === "Human approval pending" ? "pending_approval" : "completed",
}));

type UnknownRecord = Record<string, unknown>;

const agentStatuses = new Set(["completed", "running", "needs_approval", "blocked"]);
const outputTypes = new Set([
  "brief",
  "rough_cut",
  "trend_scan",
  "comparison",
  "hooks",
  "final_cut",
  "learning",
  "safety",
  "monetisation",
]);
const riskLevels = new Set(["low", "medium", "high"]);
const safetyStatuses = new Set([
  "approved_for_internal_preview",
  "requires_human_approval",
  "blocked",
]);
const currencies = new Set(["GBP", "USD", "EUR"]);
const auditStatuses = new Set(["completed", "pending_approval"]);

function isRecord(value: unknown): value is UnknownRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function hasString(record: UnknownRecord, key: string) {
  return typeof record[key] === "string" && record[key].trim().length > 0;
}

function hasNumber(record: UnknownRecord, key: string) {
  return typeof record[key] === "number" && Number.isFinite(record[key]);
}

function hasBoolean(record: UnknownRecord, key: string) {
  return typeof record[key] === "boolean";
}

function isStringArray(value: unknown) {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isNonEmptyStringArray(value: unknown) {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every((item) => typeof item === "string" && item.trim().length > 0)
  );
}

function isNonEmptyArrayOf<T>(
  value: unknown,
  predicate: (item: unknown) => item is T,
): value is T[] {
  return Array.isArray(value) && value.length > 0 && value.every(predicate);
}

function isAllowedString(value: unknown, allowed: Set<string>) {
  return typeof value === "string" && allowed.has(value);
}

function isCampaignBrief(value: unknown): value is CampaignBrief {
  if (!isRecord(value)) {
    return false;
  }

  return (
    hasString(value, "id") &&
    hasString(value, "userRequest") &&
    hasString(value, "brand") &&
    hasString(value, "niche") &&
    hasString(value, "audience") &&
    hasString(value, "businessObjective") &&
    hasString(value, "tone") &&
    hasString(value, "product") &&
    isStringArray(value.constraints)
  );
}

function isScene(value: unknown): value is Scene {
  if (!isRecord(value)) {
    return false;
  }

  return (
    hasString(value, "id") &&
    hasString(value, "timestamp") &&
    hasString(value, "visual") &&
    hasString(value, "overlay") &&
    hasString(value, "script") &&
    hasString(value, "cameraNotes")
  );
}

function isKeyframe(value: unknown): value is Keyframe {
  if (!isRecord(value)) {
    return false;
  }

  return (
    hasString(value, "id") &&
    hasString(value, "timestamp") &&
    hasString(value, "description")
  );
}

function isInitialVideoConcept(value: unknown): value is InitialVideoConcept {
  if (!isRecord(value)) {
    return false;
  }

  return (
    hasString(value, "title") &&
    hasNumber(value, "durationSeconds") &&
    isNonEmptyStringArray(value.structure) &&
    isNonEmptyArrayOf(value.scenes, isScene) &&
    hasString(value, "openingHook") &&
    isNonEmptyStringArray(value.scriptDraft) &&
    isNonEmptyArrayOf(value.keyframes, isKeyframe)
  );
}

function isAgentStep(value: unknown): value is AgentStep {
  if (!isRecord(value)) {
    return false;
  }

  return (
    hasString(value, "id") &&
    hasString(value, "agentName") &&
    isAllowedString(value.status, agentStatuses) &&
    hasString(value, "summary") &&
    isAllowedString(value.outputType, outputTypes) &&
    isAllowedString(value.riskLevel, riskLevels)
  );
}

function isTrendFingerprint(value: unknown): value is TrendFingerprint {
  if (!isRecord(value)) {
    return false;
  }

  return (
    hasString(value, "id") &&
    hasString(value, "name") &&
    hasString(value, "frameOneVisual") &&
    hasString(value, "firstCutTiming") &&
    hasString(value, "textOverlayPattern") &&
    hasString(value, "movementPacing") &&
    hasString(value, "emotionalTrigger") &&
    hasNumber(value, "relevanceScore") &&
    hasString(value, "whyItWorks")
  );
}

function isVideoComparison(value: unknown): value is VideoComparison {
  if (!isRecord(value)) {
    return false;
  }

  return (
    hasString(value, "initialHook") &&
    hasString(value, "problem") &&
    hasString(value, "trendingPattern") &&
    hasString(value, "improvement") &&
    isNonEmptyStringArray(value.matchedFingerprints)
  );
}

function isHookVariant(value: unknown): value is HookVariant {
  if (!isRecord(value)) {
    return false;
  }

  const recommendedIsValid =
    value.recommended === undefined || typeof value.recommended === "boolean";

  return (
    hasString(value, "id") &&
    hasString(value, "name") &&
    hasString(value, "firstThreeSecondsScript") &&
    hasString(value, "frameOneDescription") &&
    hasString(value, "textOverlay") &&
    hasString(value, "firstCutTiming") &&
    isNonEmptyStringArray(value.shotSequence) &&
    hasNumber(value, "predictedThreeSecondHoldRate") &&
    hasNumber(value, "predictedThirtySecondRetention") &&
    hasNumber(value, "predictedPurchaseIntent") &&
    hasString(value, "rationale") &&
    recommendedIsValid
  );
}

function isFinalCut(value: unknown): value is FinalCut {
  if (!isRecord(value)) {
    return false;
  }

  return (
    hasString(value, "title") &&
    hasNumber(value, "durationSeconds") &&
    hasString(value, "hook") &&
    isNonEmptyStringArray(value.script) &&
    isNonEmptyArrayOf(value.scenes, isScene) &&
    isNonEmptyArrayOf(value.keyframes, isKeyframe) &&
    hasString(value, "selectedBecause")
  );
}

function isLearningLoop(value: unknown): value is LearningLoop {
  if (!isRecord(value)) {
    return false;
  }

  return (
    hasNumber(value, "predictedThreeSecondHold") &&
    hasNumber(value, "predictedThirtySecondRetention") &&
    hasNumber(value, "predictedClickIntent") &&
    hasNumber(value, "confidenceScore") &&
    hasString(value, "whatTheSystemLearned") &&
    hasString(value, "nextGenerationImprovement") &&
    hasString(value, "generationOne") &&
    hasString(value, "generationTen")
  );
}

function isSafetyCheck(value: unknown): value is SafetyCheck {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isAllowedString(value.copyrightSimilarityRisk, riskLevels) &&
    isAllowedString(value.brandSafetyRisk, riskLevels) &&
    isAllowedString(value.misleadingClaimsRisk, riskLevels) &&
    isAllowedString(value.platformPolicyRisk, riskLevels) &&
    hasBoolean(value, "approvalRequiredBeforePublishing") &&
    hasBoolean(value, "approvalRequiredBeforePaymentExport") &&
    isAllowedString(value.status, safetyStatuses) &&
    hasString(value, "policyLanguage") &&
    isNonEmptyStringArray(value.notes)
  );
}

function isMonetisationStep(value: unknown): value is MonetisationStep {
  if (!isRecord(value)) {
    return false;
  }

  return (
    hasString(value, "product") &&
    hasNumber(value, "price") &&
    isAllowedString(value.currency, currencies) &&
    hasString(value, "agencyPlan") &&
    value.paymentProvider === "PayPal Sandbox" &&
    hasString(value, "checkoutStatus") &&
    hasBoolean(value, "approvalRequired") &&
    hasString(value, "message")
  );
}

function isAuditEvent(value: unknown): value is AuditEvent {
  if (!isRecord(value)) {
    return false;
  }

  return (
    hasString(value, "id") &&
    hasString(value, "timestamp") &&
    hasString(value, "action") &&
    hasString(value, "agentName") &&
    isAllowedString(value.status, auditStatuses)
  );
}

export function createSeededCutLabRun(
  input: CampaignBriefInput = {},
  options: { fallbackUsed?: boolean } = {},
): CutLabRun {
  return {
    id: "cutlab-repform-demo-run",
    brief: buildBrief(input),
    initialVideoConcept,
    agentSteps,
    trendFingerprints,
    comparison,
    hookVariants,
    finalCut,
    learningLoop,
    safetyCheck,
    monetisation,
    auditLog,
    fallbackUsed: options.fallbackUsed ?? true,
    generatedAt,
  };
}

export function isCompleteCutLabRun(value: unknown): value is CutLabRun {
  if (!isRecord(value)) {
    return false;
  }

  const hookVariants = value.hookVariants;

  if (!isNonEmptyArrayOf(hookVariants, isHookVariant)) {
    return false;
  }

  return (
    hasString(value, "id") &&
    isCampaignBrief(value.brief) &&
    isInitialVideoConcept(value.initialVideoConcept) &&
    isNonEmptyArrayOf(value.agentSteps, isAgentStep) &&
    isNonEmptyArrayOf(value.trendFingerprints, isTrendFingerprint) &&
    isVideoComparison(value.comparison) &&
    hookVariants.some((variant) => variant.recommended === true) &&
    isFinalCut(value.finalCut) &&
    isLearningLoop(value.learningLoop) &&
    isSafetyCheck(value.safetyCheck) &&
    isMonetisationStep(value.monetisation) &&
    isNonEmptyArrayOf(value.auditLog, isAuditEvent) &&
    hasBoolean(value, "fallbackUsed") &&
    hasString(value, "generatedAt")
  );
}
