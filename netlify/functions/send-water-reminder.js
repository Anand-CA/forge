import { getStore } from "@netlify/blobs";
import webpush from "web-push";

const store = getStore("forge-push-subscriptions");

export const config = {
  schedule: "0 */2 * * *"
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

  for (const blob of blobs) {
    try {
      const subscription = await store.get(blob.key, { type: "json" });
      if (!subscription) continue;

      await webpush.sendNotification(
        subscription,
        JSON.stringify({
          title: "FORGE · Water",
          body: "💧 Time for some water.",
          url: "./"
        })
      );
    } catch (error) {
      console.error("Push failed for", blob.key, error?.statusCode || error?.message || error);

      if (error?.statusCode === 404 || error?.statusCode === 410) {
        await store.delete(blob.key);
      }
    }
  }
};
