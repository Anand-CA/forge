import { getStore } from "@netlify/blobs";
import crypto from "node:crypto";

const store = getStore("forge-push-subscriptions");

export default async (req) => {
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

  try {
    const body = await req.json();
    const subscription = body?.endpoint ? body : body?.subscription;
    const interval = Math.min(3, Math.max(1, Number(body?.interval) || 2));

    if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      return Response.json({ error: "Invalid push subscription" }, { status: 400 });
    }

    const key = crypto.createHash("sha256").update(subscription.endpoint).digest("hex");
    await store.setJSON(key, {
      subscription,
      interval,
      nextDueAt: Date.now() + interval * 60 * 60 * 1000
    });

    return Response.json({ ok: true });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Could not save subscription" }, { status: 500 });
  }
};
