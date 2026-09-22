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
    const existing = await store.get(key, { type: "json" });
    const todo = body?.todo && body.todo.id && body.todo.text && body.todo.dueAt
      ? { id: String(body.todo.id), text: String(body.todo.text).slice(0, 300), date: String(body.todo.date || ""), dueAt: Number(body.todo.dueAt) }
      : null;

    const todoReminders = Array.isArray(existing?.todoReminders) ? existing.todoReminders.filter(t => t && t.id) : [];
    if (todo) {
      const withoutDuplicate = todoReminders.filter(t => t.id !== todo.id);
      withoutDuplicate.push(todo);
      todoReminders.splice(0, todoReminders.length, ...withoutDuplicate);
    }

    await store.setJSON(key, {
      ...(existing || {}),
      subscription,
      interval: existing?.interval ?? interval,
      nextDueAt: existing?.nextDueAt ?? (Date.now() + interval * 60 * 60 * 1000),
      todoReminders
    });

    return Response.json({ ok: true });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Could not save subscription" }, { status: 500 });
  }
};
