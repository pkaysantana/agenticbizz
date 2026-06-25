export type AgentStatus = "completed" | "running" | "needs_approval" | "blocked";

export type RiskLevel = "low" | "medium" | "high";

export type OutputType =
  | "brief"
  | "rough_cut"
  | "trend_scan"
  | "comparison"
  | "hooks"
  | "final_cut"
  | "learning"
  | "safety"
  | "monetisation";

export type SafetyStatus =
  | "approved_for_internal_preview"
  | "requires_human_approval"
  | "blocked";

export interface CampaignBrief {
  id: string;
  userRequest: string;
  brand: string;
  niche: string;
  audience: string;
  businessObjective: string;
  tone: string;
  product: string;
  constraints: string[];
}

export interface Scene {
  id: string;
  timestamp: string;
  visual: string;
  overlay: string;
  script: string;
  cameraNotes: string;
}

export interface Keyframe {
  id: string;
  timestamp: string;
  description: string;
}

export interface InitialVideoConcept {
  title: string;
  durationSeconds: number;
  structure: string[];
  scenes: Scene[];
  openingHook: string;
  scriptDraft: string[];
  keyframes: Keyframe[];
}

export interface TrendFingerprint {
  id: string;
  name: string;
  frameOneVisual: string;
  firstCutTiming: string;
  textOverlayPattern: string;
  movementPacing: string;
  emotionalTrigger: string;
  relevanceScore: number;
  whyItWorks: string;
}

export interface VideoComparison {
  initialHook: string;
  problem: string;
  trendingPattern: string;
  improvement: string;
  matchedFingerprints: string[];
}

export interface HookVariant {
  id: string;
  name: string;
  firstThreeSecondsScript: string;
  frameOneDescription: string;
  textOverlay: string;
  firstCutTiming: string;
  shotSequence: string[];
  predictedThreeSecondHoldRate: number;
  predictedThirtySecondRetention: number;
  predictedPurchaseIntent: number;
  rationale: string;
  recommended?: boolean;
}

export interface FinalCut {
  title: string;
  durationSeconds: number;
  hook: string;
  script: string[];
  scenes: Scene[];
  keyframes: Keyframe[];
  selectedBecause: string;
}

export interface LearningLoop {
  predictedThreeSecondHold: number;
  predictedThirtySecondRetention: number;
  predictedClickIntent: number;
  confidenceScore: number;
  whatTheSystemLearned: string;
  nextGenerationImprovement: string;
  generationOne: string;
  generationTen: string;
}

export interface SafetyCheck {
  copyrightSimilarityRisk: RiskLevel;
  brandSafetyRisk: RiskLevel;
  misleadingClaimsRisk: RiskLevel;
  platformPolicyRisk: RiskLevel;
  approvalRequiredBeforePublishing: boolean;
  approvalRequiredBeforePaymentExport: boolean;
  status: SafetyStatus;
  policyLanguage: string;
  notes: string[];
}

export interface MonetisationStep {
  product: string;
  price: number;
  currency: "GBP" | "USD" | "EUR";
  agencyPlan: string;
  paymentProvider: "PayPal Sandbox";
  checkoutStatus: string;
  approvalRequired: boolean;
  message: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  action: string;
  agentName: string;
  status: "completed" | "pending_approval";
}

export interface AgentStep {
  id: string;
  agentName: string;
  status: AgentStatus;
  summary: string;
  outputType: OutputType;
  riskLevel: RiskLevel;
}

export interface CutLabRun {
  id: string;
  brief: CampaignBrief;
  initialVideoConcept: InitialVideoConcept;
  agentSteps: AgentStep[];
  trendFingerprints: TrendFingerprint[];
  comparison: VideoComparison;
  hookVariants: HookVariant[];
  finalCut: FinalCut;
  learningLoop: LearningLoop;
  safetyCheck: SafetyCheck;
  monetisation: MonetisationStep;
  auditLog: AuditEvent[];
  fallbackUsed: boolean;
  generatedAt: string;
}

export type CampaignBriefInput = Partial<
  Pick<
    CampaignBrief,
    | "userRequest"
    | "brand"
    | "niche"
    | "audience"
    | "businessObjective"
    | "tone"
    | "product"
    | "constraints"
  >
>;
