type CheckoutResponse = {
  provider: "PayPal Sandbox";
  sandboxMode: true;
  checkoutStatus: string;
  amount: number;
  currency: "GBP";
  approvalRequired: boolean;
  message: string;
  approvalUrl?: string;
};

const baseCheckout: Omit<CheckoutResponse, "checkoutStatus" | "message"> = {
  provider: "PayPal Sandbox",
  sandboxMode: true,
  amount: 19,
  currency: "GBP",
  approvalRequired: true,
};

export async function POST() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return Response.json({
      ...baseCheckout,
      checkoutStatus: "mock_checkout_ready",
      message:
        "Mock checkout ready. PayPal credentials are missing, so no payment is executed.",
    } satisfies CheckoutResponse);
  }

  const paypalOrder = await createPayPalSandboxOrder(clientId, clientSecret);

  if (!paypalOrder.ok) {
    return Response.json({
      ...baseCheckout,
      checkoutStatus: "mock_checkout_ready_after_sandbox_failure",
      message:
        "PayPal Sandbox credentials are configured, but order creation failed. The demo falls back to mock checkout and no payment is executed.",
    } satisfies CheckoutResponse);
  }

  return Response.json({
    ...baseCheckout,
    checkoutStatus: "sandbox_approval_url_prepared",
    message:
      "PayPal Sandbox approval URL prepared. A human must approve before any payment execution.",
    approvalUrl: paypalOrder.approvalUrl,
  } satisfies CheckoutResponse);
}

async function createPayPalSandboxOrder(
  clientId: string,
  clientSecret: string,
): Promise<
  | { ok: true; orderId: string; approvalUrl: string }
  | { ok: false; reason: string }
> {
  const baseUrl =
    process.env.PAYPAL_API_BASE_URL ?? "https://api-m.sandbox.paypal.com";

  try {
    const tokenResponse = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${clientId}:${clientSecret}`,
        ).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    if (!tokenResponse.ok) {
      return { ok: false, reason: "token_request_failed" };
    }

    const tokenPayload = (await tokenResponse.json()) as {
      access_token?: string;
    };

    if (!tokenPayload.access_token) {
      return { ok: false, reason: "missing_access_token" };
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const orderResponse = await fetch(`${baseUrl}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokenPayload.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            description: "CutLab 10 video optimisation runs",
            amount: {
              currency_code: "GBP",
              value: "19.00",
            },
          },
        ],
        application_context: {
          brand_name: "CutLab",
          landing_page: "NO_PREFERENCE",
          user_action: "CONTINUE",
          return_url: siteUrl,
          cancel_url: siteUrl,
        },
      }),
    });

    if (!orderResponse.ok) {
      return { ok: false, reason: "order_request_failed" };
    }

    const orderPayload = (await orderResponse.json()) as {
      id?: string;
      links?: Array<{ href: string; rel: string }>;
    };
    const approvalUrl = orderPayload.links?.find(
      (link) => link.rel === "approve",
    )?.href;

    if (!orderPayload.id || !approvalUrl) {
      return { ok: false, reason: "missing_approval_url" };
    }

    return { ok: true, orderId: orderPayload.id, approvalUrl };
  } catch {
    return { ok: false, reason: "paypal_network_error" };
  }
}
