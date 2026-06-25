export async function POST() {
  const paypalConfigured = Boolean(
    process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET,
  );

  return Response.json({
    ok: true,
    provider: "PayPal Sandbox",
    sandboxMode: true,
    checkoutStatus: paypalConfigured ? "configured" : "sandbox_prepared",
    exportStatus: "waiting_for_approval",
    approvalRequired: true,
    externalActionExecuted: false,
    offer: {
      name: "CutLab 10 optimisation runs",
      price: 19,
      currency: "GBP",
    },
    message: paypalConfigured
      ? "PayPal sandbox credentials detected. Checkout is prepared but not executed until approval."
      : "PayPal is not configured. Returning a sandbox placeholder so the demo does not block.",
  });
}
