import express from "express";
import { storeSnapshot } from "../lib/storeSnapshot";

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

export default router;
