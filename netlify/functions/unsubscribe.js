import { getStore } from "@netlify/blobs";
import crypto from "node:crypto";

const store = getStore("forge-push-subscriptions");

export default async (req) => {
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });
  try {
    const { endpoint } = await req.json();
    if (!endpoint) return Response.json({ error: "Missing endpoint" }, { status: 400 });
    const key = crypto.createHash("sha256").update(endpoint).digest("hex");
    await store.delete(key);
    return Response.json({ ok: true });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Could not remove subscription" }, { status: 500 });
  }
};
