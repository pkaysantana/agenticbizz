export type AgentStatus = "completed" | "running" | "needs_approval" | "blocked";

export type RiskLevel = "low" | "medium" | "high";

export type OutputType =
  | "brief"
  | "fingerprints"
  | "storyboard"
  | "hooks"
  | "prediction"
  | "safety"
  | "monetisation";

export type SafetyStatus = "approved_for_preview" | "warn" | "block";

export type CheckoutStatus = "sandbox_prepared" | "configured" | "not_configured";

export type ExportStatus = "waiting_for_approval" | "ready" | "blocked";

export interface CampaignBrief {
  id: string;
  brandName: string;
  niche: string;
  product: string;
  goal: string;
  audience: string;
  businessObjective: string;
  tone: string;
  constraints: string[];
  createdAt: string;
}

export interface AgentStep {
  id: string;
  agentName: string;
  status: AgentStatus;
  startedAt: string;
  completedAt?: string;
  summary: string;
  outputType: OutputType;
  riskLevel: RiskLevel;
}

export interface TrendFingerprint {
  id: string;
  name: string;
  frameOneVisual: string;
  firstCutSeconds: number;
  textOverlayPattern: string;
  motionPattern: string;
  soundOrPacing: string;
  emotionalTrigger: string;
  whyItWorks: string;
  relevanceScore: number;
  sourceType: "seeded_demo" | "modal_endpoint" | "user_feedback";
  notes: string;
}

export interface StoryboardScene {
  id: string;
  timestamp: string;
  visual: string;
  overlayText: string;
  narration: string;
  cameraNotes: string;
  funnelPurpose: string;
}

export interface HookVariant {
  id: string;
  name: string;
  basedOnFingerprintId: string;
  openingScript: string;
  frameOne: string;
  textOverlay: string;
  firstCutSeconds: number;
  shotSequence: string[];
  predictedReaction: string;
  rationale: string;
}

export interface RetentionPrediction {
  variantId: string;
  threeSecondHoldRate: number;
  thirtySecondRetention: number;
  clickIntentScore: number;
  confidence: number;
  reasoning: string;
}

export interface SafetyCheck {
  copyrightSimilarityRisk: RiskLevel;
  brandSafetyRisk: RiskLevel;
  misleadingClaimRisk: RiskLevel;
  platformPolicyRisk: RiskLevel;
  reputationalRisk: RiskLevel;
  riskScore: number;
  approvalRequired: boolean;
  status: SafetyStatus;
  notes: string[];
  externalActionsAllowed: boolean;
}

export interface MonetisationStep {
  price: number;
  currency: "GBP" | "USD" | "EUR";
  paymentProvider: "PayPal Sandbox" | "PayPal" | "Not configured";
  sandboxMode: boolean;
  checkoutStatus: CheckoutStatus;
  exportStatus: ExportStatus;
  businessModel: string;
  offer: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  agentName: string;
  action: string;
  inputSummary: string;
  outputSummary: string;
  riskLevel: RiskLevel;
  requiresApproval: boolean;
}

export interface CutLabRun {
  id: string;
  brief: CampaignBrief;
  agentSteps: AgentStep[];
  fingerprints: TrendFingerprint[];
  storyboard: StoryboardScene[];
  hookVariants: HookVariant[];
  predictions: RetentionPrediction[];
  safetyCheck: SafetyCheck;
  monetisation: MonetisationStep;
  auditLog: AuditEvent[];
  selectedVariantId: string;
  autonomyLevel: string;
  fallbackUsed: boolean;
  generatedAt: string;
}

export type CampaignBriefInput = Partial<
  Pick<
    CampaignBrief,
    | "brandName"
    | "niche"
    | "product"
    | "goal"
    | "audience"
    | "businessObjective"
    | "tone"
    | "constraints"
  >
>;
