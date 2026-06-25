export async function POST() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (clientId && clientSecret) {
    const paypalOrder = await createPayPalSandboxOrder(clientId, clientSecret);

    if (paypalOrder.ok) {
      return Response.json({
        ok: true,
        provider: "PayPal Sandbox",
        sandboxMode: true,
        checkoutStatus: "sandbox_order_created",
        exportStatus: "approved_for_sandbox_checkout",
        approvalRequired: false,
        externalActionExecuted: true,
        checkoutUrl: paypalOrder.checkoutUrl,
        orderId: paypalOrder.orderId,
        offer: {
          name: "CutLab 10 optimisation runs",
          price: 19,
          currency: "GBP",
        },
        message:
          "Export approved. PayPal sandbox order created; open the sandbox checkout to complete the demo payment.",
      });
    }

    return Response.json({
      ok: true,
      provider: "PayPal Sandbox",
      sandboxMode: true,
      checkoutStatus: "sandbox_order_failed",
      exportStatus: "approved_for_demo_checkout",
      approvalRequired: false,
      externalActionExecuted: false,
      checkoutUrl: undefined,
      orderId: undefined,
      offer: {
        name: "CutLab 10 optimisation runs",
        price: 19,
        currency: "GBP",
      },
      message:
        "Export approved. PayPal credentials are loaded, but sandbox order creation failed. Restart the dev server after editing .env.local, and confirm the credentials are sandbox (not live).",
    });
  }

  return Response.json({
    ok: true,
    provider: "PayPal Sandbox",
    sandboxMode: true,
    checkoutStatus: "demo_checkout_ready",
    exportStatus: "approved_for_demo_checkout",
    approvalRequired: false,
    externalActionExecuted: false,
    checkoutUrl: undefined,
    orderId: "demo-paypal-order",
    offer: {
      name: "CutLab 10 optimisation runs",
      price: 19,
      currency: "GBP",
    },
    message:
      "Export approved. Demo checkout is ready in sandbox mode; no PayPal credentials are configured, so no money moves.",
  });
}

async function createPayPalSandboxOrder(
  clientId: string,
  clientSecret: string,
): Promise<
  | { ok: true; orderId: string; checkoutUrl: string }
  | { ok: false; step: "token" | "order"; status: number; detail: string }
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
      const detail = await tokenResponse.text();
      return {
        ok: false,
        step: "token",
        status: tokenResponse.status,
        detail: detail.slice(0, 200),
      };
    }

    const tokenPayload = (await tokenResponse.json()) as {
      access_token?: string;
    };

    if (!tokenPayload.access_token) {
      return {
        ok: false,
        step: "token",
        status: tokenResponse.status,
        detail: "No access token returned from PayPal.",
      };
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
            description: "CutLab 10 optimisation runs",
            amount: {
              currency_code: "GBP",
              value: "19.00",
            },
          },
        ],
        application_context: {
          brand_name: "CutLab",
          landing_page: "LOGIN",
          user_action: "PAY_NOW",
          return_url: siteUrl,
          cancel_url: siteUrl,
        },
      }),
    });

    if (!orderResponse.ok) {
      const detail = await orderResponse.text();
      return {
        ok: false,
        step: "order",
        status: orderResponse.status,
        detail: detail.slice(0, 200),
      };
    }

    const orderPayload = (await orderResponse.json()) as {
      id?: string;
      links?: Array<{ href: string; rel: string }>;
    };
    const checkoutUrl = orderPayload.links?.find(
      (link) => link.rel === "approve",
    )?.href;

    if (!orderPayload.id || !checkoutUrl) {
      return {
        ok: false,
        step: "order",
        status: orderResponse.status,
        detail: "PayPal order created without an approval URL.",
      };
    }

    return {
      ok: true,
      orderId: orderPayload.id,
      checkoutUrl,
    };
  } catch {
    return {
      ok: false,
      step: "token",
      status: 0,
      detail: "Network error while contacting PayPal sandbox.",
    };
  }
}
