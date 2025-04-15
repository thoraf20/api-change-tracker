import express from "express";
import { storeSnapshot } from "../lib/storeSnapshot";
import prisma from "config/db";
import { generateDiff } from "../lib/diffEngine";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const snapshot = req.body;
    await storeSnapshot(snapshot);

    res.status(200).json({ message: "Snapshot received and stored." });
  } catch (error) {
    console.error("[Backend] Snapshot store error:", error);
    res.status(500).json({ message: "Failed to store snapshot" });
  }
});

router.get("/snapshots", async (req, res) => {
  const { url, method } = req.query;

  try {
    const snapshots = await prisma.snapshot.findMany({
      where: {
        ...(url && { url: String(url) }),
        ...(method && { method: String(method).toUpperCase() }),
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ snapshots });
  } catch (err) {
    console.error("[Backend] Snapshot fetch error:", err);
    res.status(500).json({ message: "Failed to fetch snapshots" });
  }
});

router.get("/diff", async (req, res) => {
  const { url, method } = req.query;

  if (!url || !method) {
    return res.status(400).json({ message: "URL and method are required" });
  }

  try {
    const snapshots = await prisma.snapshot.findMany({
      where: {
        url: String(url),
        method: String(method).toUpperCase(),
      },
      orderBy: { createdAt: "desc" },
      take: 2,
    });

    if (snapshots.length < 2) {
      return res
        .status(400)
        .json({ message: "Not enough snapshots to compare" });
    }

    const prev = snapshots[1];
    const current = snapshots[0];

    const bodyDiff = generateDiff(prev.body, current.body);
    const headersDiff = generateDiff(prev.headers, current.headers);

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
