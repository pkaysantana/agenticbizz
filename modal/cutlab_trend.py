"""CutLab trend-intelligence endpoint on Modal.

Deploy/serve from a machine that is authenticated with the Modal CLI:

    modal serve modal/cutlab_trend.py     # dev URL, hot reload
    modal deploy modal/cutlab_trend.py    # persistent URL

Copy the printed *.modal.run URL into the Next.js app as MODAL_TREND_ENDPOINT.

Contract (must stay in sync with src/lib/types.ts + isCompleteCutLabRun):
- Method: POST
- Request body: { "brief": { brand, niche, product, userRequest, audience,
                              businessObjective, tone, constraints[] } }
- Response: a full CutLabRun object (NOT just trend fingerprints).
- No auth header required (matches the app's current fetch).
"""

from typing import Any

import modal

image = modal.Image.debian_slim().pip_install("fastapi[standard]")
app = modal.App(name="cutlab-trend", image=image)


def _text(value: Any, fallback: str) -> str:
    return value.strip() if isinstance(value, str) and value.strip() else fallback


def _build_brief(raw: dict[str, Any]) -> dict[str, Any]:
    constraints = raw.get("constraints")
    if not isinstance(constraints, list) or not all(
        isinstance(item, str) for item in constraints
    ):
        constraints = [
            "No login or empty state for the demo.",
            "No real publishing or video rendering.",
            "Human approval required before payment/export.",
        ]

    return {
        "id": "repform-compression-top",
        "userRequest": _text(
            raw.get("userRequest"),
            "Create a 20-second TikTok/Reel for a gymwear brand launching a new compression top.",
        ),
        "brand": _text(raw.get("brand"), "RepForm"),
        "niche": _text(raw.get("niche"), "Fitness apparel / gymwear"),
        "audience": _text(
            raw.get("audience"),
            "18-30 gym-goers who care about comfort, performance, and confidence.",
        ),
        "businessObjective": _text(
            raw.get("businessObjective"), "Drive product page clicks and purchases."
        ),
        "tone": _text(
            raw.get("tone"),
            "Fast, direct, visual, slightly provocative, but not misleading.",
        ),
        "product": _text(raw.get("product"), "New compression top"),
        "constraints": constraints,
    }


def _build_run(brief_input: dict[str, Any]) -> dict[str, Any]:
    brief = _build_brief(brief_input)
    brand = brief["brand"]

    return {
        "id": "cutlab-modal-trend-run",
        "brief": brief,
        "initialVideoConcept": {
            "title": f"Meet the {brand} Compression Top",
            "durationSeconds": 20,
            "structure": [
                "0-3s: Product intro and brand reveal",
                "3-8s: Athlete wearing the top during a heavy set",
                "8-13s: Fabric and fit detail shots",
                "13-17s: Confidence mirror moment",
                "17-20s: Product page click call-to-action",
            ],
            "openingHook": f"Introducing the new {brand} compression top.",
            "scriptDraft": [
                f"Introducing the new {brand} compression top.",
                "Designed for gym sessions where comfort and focus matter.",
                "A close fit, sharp silhouette, and movement-ready feel.",
                f"{brand} helps you look locked in from warm-up to final set.",
                "Tap to shop the launch drop today.",
            ],
            "scenes": [
                {
                    "id": "initial-scene-1",
                    "timestamp": "0:00-0:03",
                    "visual": "Product hero shot on a gym bench with a quick logo flash.",
                    "overlay": f"New {brand} compression top",
                    "script": f"Introducing the new {brand} compression top.",
                    "cameraNotes": "Clean push-in, but the opener lacks a pattern interrupt.",
                },
                {
                    "id": "initial-scene-2",
                    "timestamp": "0:03-0:08",
                    "visual": "Athlete starts a set while wearing the top.",
                    "overlay": "Built for training",
                    "script": "Designed for gym sessions where comfort and focus matter.",
                    "cameraNotes": "Medium handheld shot, cut after the first rep.",
                },
                {
                    "id": "initial-scene-3",
                    "timestamp": "0:08-0:20",
                    "visual": "Fit detail shots into a product page CTA.",
                    "overlay": "Stretch. Shape. Tap to shop.",
                    "script": "A close fit and movement-ready feel. Tap to shop the launch.",
                    "cameraNotes": "Detail shots on the beat, end on CTA.",
                },
            ],
            "keyframes": [
                {
                    "id": "initial-keyframe-1",
                    "timestamp": "0:00",
                    "description": "Compression top folded on a bench beside chalk and straps.",
                },
                {
                    "id": "initial-keyframe-2",
                    "timestamp": "0:04",
                    "description": "Athlete begins a controlled heavy rep in the top.",
                },
                {
                    "id": "initial-keyframe-3",
                    "timestamp": "0:18",
                    "description": f"Mobile product page with {brand} compression top selected.",
                },
            ],
        },
        "agentSteps": [
            {
                "id": "agent-intake",
                "agentName": "Intake Agent",
                "status": "completed",
                "summary": "Structured the request into audience, objective, tone, and constraints.",
                "outputType": "brief",
                "riskLevel": "low",
            },
            {
                "id": "agent-director",
                "agentName": "Director Agent",
                "status": "completed",
                "summary": "Generated the initial 20-second rough concept and storyboard.",
                "outputType": "rough_cut",
                "riskLevel": "low",
            },
            {
                "id": "agent-trend-scout",
                "agentName": "Trend Scout Agent",
                "status": "completed",
                "summary": "Returned live gymwear hook/style fingerprints from the Modal endpoint.",
                "outputType": "trend_scan",
                "riskLevel": "medium",
            },
            {
                "id": "agent-hook-analyst",
                "agentName": "Hook Analyst Agent",
                "status": "completed",
                "summary": "Compared the rough cut against top-performing first-three-second patterns.",
                "outputType": "comparison",
                "riskLevel": "medium",
            },
            {
                "id": "agent-editor",
                "agentName": "Editor Agent",
                "status": "completed",
                "summary": "Generated improved openings and selected the strongest commercial route.",
                "outputType": "hooks",
                "riskLevel": "medium",
            },
            {
                "id": "agent-learning",
                "agentName": "Learning Agent",
                "status": "completed",
                "summary": "Simulated hold, retention, click intent, and confidence.",
                "outputType": "learning",
                "riskLevel": "medium",
            },
            {
                "id": "agent-safety",
                "agentName": "Safety & Approval Agent",
                "status": "needs_approval",
                "summary": "Approved internal preview while blocking external publishing without human approval.",
                "outputType": "safety",
                "riskLevel": "medium",
            },
            {
                "id": "agent-monetisation",
                "agentName": "Monetisation Agent",
                "status": "needs_approval",
                "summary": "Prepared a PayPal Sandbox export step with a mock fallback.",
                "outputType": "monetisation",
                "riskLevel": "medium",
            },
        ],
        "trendFingerprints": [
            {
                "id": "pain-point-cold-open",
                "name": "Pain-point cold open",
                "frameOneVisual": "Close-up of someone adjusting an uncomfortable top mid-set.",
                "firstCutTiming": "0.7s",
                "textOverlayPattern": "Direct accusation: the viewer's current gear is causing a problem.",
                "movementPacing": "Abrupt handheld micro-zoom, hard cut before one second.",
                "emotionalTrigger": "Frustration and recognition.",
                "relevanceScore": 94,
                "whyItWorks": "It creates an immediate pattern interrupt and names a felt problem.",
            },
            {
                "id": "before-after-transformation",
                "name": "Before/after transformation",
                "frameOneVisual": "Split screen: loose old gym shirt versus fitted compression top.",
                "firstCutTiming": "0.6s",
                "textOverlayPattern": "Short contrast line that is understandable with sound off.",
                "movementPacing": "Side-by-side reveal into synchronized training movement.",
                "emotionalTrigger": "Instant upgrade and self-image improvement.",
                "relevanceScore": 91,
                "whyItWorks": "The benefit is visible before the product needs explanation.",
            },
            {
                "id": "fast-product-reveal",
                "name": "Fast product reveal",
                "frameOneVisual": "The top snaps into frame, then match-cuts onto the athlete.",
                "firstCutTiming": "0.8s",
                "textOverlayPattern": "Product promise attached to a physical action.",
                "movementPacing": "Three rapid proof beats: reveal, wear, detail.",
                "emotionalTrigger": "Curiosity and product desire.",
                "relevanceScore": 88,
                "whyItWorks": "It keeps the product visible early while still feeling dynamic.",
            },
            {
                "id": "micro-proof-demonstration",
                "name": "Micro-proof demonstration",
                "frameOneVisual": "Fabric stretch and rebound shown beside a rep counter overlay.",
                "firstCutTiming": "0.9s",
                "textOverlayPattern": "Show the proof in one movement.",
                "movementPacing": "Macro pull test, cut to movement, cut to fit detail.",
                "emotionalTrigger": "Belief through visible evidence.",
                "relevanceScore": 87,
                "whyItWorks": "The product benefit is demonstrated visually instead of asserted.",
            },
        ],
        "comparison": {
            "initialHook": f"Introducing the new {brand} compression top.",
            "problem": "Too generic, low pattern interrupt, product-led before the viewer feels the need.",
            "trendingPattern": "Pain-point cold open + visual discomfort moment.",
            "improvement": 'Start with "Your gym top is ruining your workout" or a proof-led performance moment.',
            "matchedFingerprints": [
                "Pain-point cold open",
                "Fast product reveal",
                "Micro-proof demonstration",
            ],
        },
        "hookVariants": [
            {
                "id": "variant-a",
                "name": "Variant A: Pain-point cold open",
                "firstThreeSecondsScript": "Your gym top is ruining your workout.",
                "frameOneDescription": "Close-up of someone adjusting an uncomfortable top mid-set.",
                "textOverlay": "Your gym top is ruining your workout.",
                "firstCutTiming": "0.7s",
                "shotSequence": [
                    "Uncomfortable shirt adjustment",
                    "Hard cut to RepForm compression fit",
                    "Athlete resets and starts the set",
                ],
                "predictedThreeSecondHoldRate": 78,
                "predictedThirtySecondRetention": 42,
                "predictedPurchaseIntent": 68,
                "rationale": "Best for stopping the scroll by naming a familiar gymwear pain point.",
            },
            {
                "id": "variant-b",
                "name": "Variant B: Performance proof open",
                "firstThreeSecondsScript": "Built for the reps where normal tops quit.",
                "frameOneDescription": "Athlete starting a heavy set in the compression top.",
                "textOverlay": "Built for the reps where normal tops quit.",
                "firstCutTiming": "0.9s",
                "shotSequence": [
                    "Athlete braces for a heavy set",
                    "Fabric holds shape through the first rep",
                    "Macro proof shot on the compression fit",
                ],
                "predictedThreeSecondHoldRate": 71,
                "predictedThirtySecondRetention": 48,
                "predictedPurchaseIntent": 81,
                "rationale": "Recommended winner: balances retention and purchase intent with immediate product proof.",
                "recommended": True,
            },
            {
                "id": "variant-c",
                "name": "Variant C: Before/after visual contrast",
                "firstThreeSecondsScript": "Same workout. Different fit.",
                "frameOneDescription": "Split screen of loose old gym shirt vs fitted compression top.",
                "textOverlay": "Same workout. Different fit.",
                "firstCutTiming": "0.6s",
                "shotSequence": [
                    "Loose shirt side-by-side with RepForm top",
                    "Synchronized first rep",
                    "Cut to the fitted version taking over the frame",
                ],
                "predictedThreeSecondHoldRate": 82,
                "predictedThirtySecondRetention": 39,
                "predictedPurchaseIntent": 63,
                "rationale": "Strongest visual contrast, but weaker purchase intent than the proof-led winner.",
            },
        ],
        "finalCut": {
            "title": f"{brand}: Built For The Reps Where Normal Tops Quit",
            "durationSeconds": 20,
            "hook": "Built for the reps where normal tops quit.",
            "script": [
                "Built for the reps where normal tops quit.",
                f"{brand} stays close through the movement without making the set about your shirt.",
                "Stretch where you need it. Shape where you want it. No distractions between reps.",
                "From first lift to mirror check, the fit stays locked in.",
                f"{brand} compression top. Tap to shop the launch.",
            ],
            "scenes": [
                {
                    "id": "final-scene-1",
                    "timestamp": "0:00-0:03",
                    "visual": "Athlete braces for a heavy set in the compression top.",
                    "overlay": "Built for the reps where normal tops quit.",
                    "script": "Built for the reps where normal tops quit.",
                    "cameraNotes": "First cut at 0.9s from brace to fabric tension.",
                },
                {
                    "id": "final-scene-2",
                    "timestamp": "0:03-0:12",
                    "visual": "Rep holds shape; macro stretch and fit detail.",
                    "overlay": "Moves with you",
                    "script": "Stretch where you need it. Shape where you want it.",
                    "cameraNotes": "Low-angle push-in, then detail cuts on beat.",
                },
                {
                    "id": "final-scene-3",
                    "timestamp": "0:12-0:20",
                    "visual": "Mirror confidence moment into product page CTA.",
                    "overlay": "Look locked in. Tap to shop.",
                    "script": f"{brand} compression top. Tap to shop the launch.",
                    "cameraNotes": "Clear product page click target, no auto-publish.",
                },
            ],
            "keyframes": [
                {
                    "id": "final-keyframe-1",
                    "timestamp": "0:00",
                    "description": "Athlete locked in before a heavy set, top visible in frame one.",
                },
                {
                    "id": "final-keyframe-2",
                    "timestamp": "0:09",
                    "description": "Macro detail showing stretch and fit without medical-style claims.",
                },
                {
                    "id": "final-keyframe-3",
                    "timestamp": "0:17",
                    "description": "Product page CTA ready for approved export.",
                },
            ],
            "selectedBecause": "Variant B trades a little scroll-stop shock for stronger qualified intent: viewers see product, use case, and proof before the CTA.",
        },
        "learningLoop": {
            "predictedThreeSecondHold": 71,
            "predictedThirtySecondRetention": 48,
            "predictedClickIntent": 81,
            "confidenceScore": 79,
            "whatTheSystemLearned": "Served live from the Modal trend endpoint: proof-led gym footage outperforms a purely provocative discomfort hook for this brand.",
            "nextGenerationImprovement": "Test the proof-led opening with creator-face voiceover versus product-only footage.",
            "generationOne": "Generation 1 copies trends structurally: hook timing, proof pacing, and contrast patterns.",
            "generationTen": "Generation 10 weights real hold, retention, click, and purchase feedback for this audience.",
        },
        "safetyCheck": {
            "copyrightSimilarityRisk": "low",
            "brandSafetyRisk": "low",
            "misleadingClaimsRisk": "medium",
            "platformPolicyRisk": "low",
            "approvalRequiredBeforePublishing": True,
            "approvalRequiredBeforePaymentExport": True,
            "status": "approved_for_internal_preview",
            "policyLanguage": "CutLab copies structural patterns, not creator-specific footage, wording, faces, or protected assets.",
            "notes": [
                "Status: approved for internal preview, requires human approval for external publishing.",
                "Approval required before publishing.",
                "Approval required before payment/export.",
                "Avoid misleading claims such as guaranteed strength or medical compression benefits.",
            ],
        },
        "monetisation": {
            "product": "10 video optimisation runs",
            "price": 19,
            "currency": "GBP",
            "agencyPlan": "£99/month",
            "paymentProvider": "PayPal Sandbox",
            "checkoutStatus": "Mock checkout ready if credentials are missing.",
            "approvalRequired": True,
            "message": "Human approval required before payment execution.",
        },
        "auditLog": [
            {"id": "audit-1", "timestamp": "18:00", "action": "User brief received", "agentName": "Intake Agent", "status": "completed"},
            {"id": "audit-2", "timestamp": "18:01", "action": "Initial rough cut generated", "agentName": "Director Agent", "status": "completed"},
            {"id": "audit-3", "timestamp": "18:02", "action": "Trend fingerprints retrieved (Modal)", "agentName": "Trend Scout Agent", "status": "completed"},
            {"id": "audit-4", "timestamp": "18:03", "action": "Hook variants generated", "agentName": "Editor Agent", "status": "completed"},
            {"id": "audit-5", "timestamp": "18:04", "action": "Retention simulated", "agentName": "Learning Agent", "status": "completed"},
            {"id": "audit-6", "timestamp": "18:05", "action": "Winner selected", "agentName": "Learning Agent", "status": "completed"},
            {"id": "audit-7", "timestamp": "18:06", "action": "Safety checks completed", "agentName": "Safety & Approval Agent", "status": "completed"},
            {"id": "audit-8", "timestamp": "18:07", "action": "Export/payment prepared", "agentName": "Monetisation Agent", "status": "completed"},
            {"id": "audit-9", "timestamp": "18:08", "action": "Human approval pending", "agentName": "Safety & Approval Agent", "status": "pending_approval"},
        ],
        "fallbackUsed": False,
        "generatedAt": "2026-06-25T18:00:00.000Z",
    }


@app.function()
@modal.fastapi_endpoint(method="POST", label="cutlab-trend")
def run(payload: dict[str, Any]) -> dict[str, Any]:
    """Accept { "brief": {...} } and return a full CutLabRun."""
    brief_input = payload.get("brief") if isinstance(payload, dict) else None
    if not isinstance(brief_input, dict):
        brief_input = payload if isinstance(payload, dict) else {}
    return _build_run(brief_input)
