import express from "express";
import { getPreviousSnapshot, getRecentSnapshots, getSnapshots, storeSnapshot } from "../lib/storeSnapshot";
import { generateDiff } from "../lib/diffEngine";
import { notifyWebhook } from "../lib/notifier";
import db from "../config/db";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const snapshot = req.body;
    await storeSnapshot(snapshot);

    const previous = await getPreviousSnapshot({
      url: snapshot.url,
      method: snapshot.method,
      clientId: snapshot.clientId,
    });

    if(previous) {
      const bodyDiff = generateDiff(previous.body, snapshot.body);
      const headersDiff = generateDiff(previous.headers, snapshot.headers);

      let result;
      if (bodyDiff.length > 0 || headersDiff.length > 0) {
        result = await db.query(`SELECT * FROM clients WHERE id = $1;`, [
          snapshot.clientId,
        ]);
      }

      const client = result.rows[0] || null

      if (client.webhook) {
        await notifyWebhook(client.webhook, {
          url: snapshot.url,
          method: snapshot.method,
          differences: {
            body: bodyDiff,
            headers: headersDiff,
          },
        });
      }
    }

    res.status(200).json({ message: "Snapshot received and stored." });
  } catch (error) {
    console.error("[Backend] Snapshot store error:", error);
    res.status(500).json({ message: "Failed to store snapshot" });
  }
});

router.get("/snapshots", async (req, res) => {
  const { url, method } = req.query as any;

  try {
    const snapshots = await getSnapshots({ url, method });

    res.status(200).json({ snapshots });
  } catch (err) {
    console.error("[Backend] Snapshot fetch error:", err);
    res.status(500).json({ message: "Failed to fetch snapshots" });
  }
});

router.get("/diff", async (req, res) => {
  const { url, method } = req.query as any;

  if (!url || !method) {
    res.status(400).json({ message: "URL and method are required" });
  }

  try {
    const [current, previous] = await getRecentSnapshots({
      url,
      method
    });


    if (!current || !previous) {
      res.status(400).json({ message: "Not enough snapshots to compare" });
    }

    const bodyDiff = generateDiff(previous.body, current.body);
    const headersDiff = generateDiff(previous.headers, current.headers);

    res.status(200).json({
      url,
      method,
      differences: {
        body: bodyDiff,
        headers: headersDiff,
      },
    });
  } catch (err) {
    console.error("[Backend] Diff error:", err);
    res.status(500).json({ message: "Failed to generate diff" });
  }
});

export default router;
