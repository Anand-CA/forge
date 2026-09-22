import { getStore } from "@netlify/blobs";
import webpush from "web-push";

const store = getStore("forge-push-subscriptions");

export const config = {
  schedule: "0 * * * *"
};

export default async () => {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;

  if (!publicKey || !privateKey) {
    console.error("Missing VAPID environment variables");
    return;
  }

  webpush.setVapidDetails("https://forge.app", publicKey, privateKey);

  const { blobs } = await store.list();
  const now = Date.now();

  for (const blob of blobs) {
    try {
      const record = await store.get(blob.key, { type: "json" });
      if (!record?.subscription) continue;

      if (now < Number(record.nextDueAt || 0)) continue;

      await webpush.sendNotification(
        record.subscription,
        JSON.stringify({
          title: "FORGE · Water",
          body: "💧 Time for some water.",
          url: "./"
        })
      );

      const interval = Math.min(3, Math.max(1, Number(record.interval) || 2));
      await store.setJSON(blob.key, {
        ...record,
        interval,
        nextDueAt: now + interval * 60 * 60 * 1000
      });
    } catch (error) {
      console.error("Push failed for", blob.key, error?.statusCode || error?.message || error);

      if (error?.statusCode === 404 || error?.statusCode === 410) {
        await store.delete(blob.key);
      }
    }
  }
};
