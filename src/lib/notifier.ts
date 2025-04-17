import axios from "axios";

export async function notifyWebhook(webhookUrl: string, payload: any) {
  try {
    const res = await axios.post(webhookUrl, payload);
    console.log("[Notifier] Webhook notified successfully", res.status);
  } catch (error) {
    console.error("[Notifier] Failed to notify webhook:", error.message);
  }
}
