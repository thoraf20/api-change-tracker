import express from "express";
import { storeSnapshot } from "../service/snapShortService";

const router = express.Router();

router.post("/", async (req, res) => {
  const snapshot = req.body;
  console.log("[Backend] Received snapshot:", snapshot);

  await storeSnapshot(snapshot);

  res.status(200).json({ message: "Snapshot received and stored." });
});

export default router;
