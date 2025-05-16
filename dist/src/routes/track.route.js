"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const storeSnapshot_1 = require("../lib/storeSnapshot");
const diffEngine_1 = require("../lib/diffEngine");
const notifier_1 = require("../lib/notifier");
const db_1 = __importDefault(require("../config/db"));
const router = express_1.default.Router();
router.post("/snapshots", async (req, res) => {
    try {
        const snapshot = req.body;
        console.log(snapshot, 'snapshot');
        await (0, storeSnapshot_1.storeSnapshot)(snapshot);
        const previous = await (0, storeSnapshot_1.getPreviousSnapshot)({
            url: snapshot.url,
            method: snapshot.method,
            clientId: snapshot.clientId,
        });
        if (previous) {
            const bodyDiff = (0, diffEngine_1.generateDiff)(previous.body, snapshot.body);
            const headersDiff = (0, diffEngine_1.generateDiff)(previous.headers, snapshot.headers);
            let result;
            if (bodyDiff.length > 0 || headersDiff.length > 0) {
                result = await db_1.default.query(`SELECT * FROM clients WHERE id = $1;`, [
                    snapshot.clientId,
                ]);
            }
            const client = result.rows[0] || null;
            if (client.webhook) {
                await (0, notifier_1.notifyWebhook)(client.webhook, {
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
    }
    catch (error) {
        console.error("[Backend] Snapshot store error:", error);
        res.status(500).json({ message: "Failed to store snapshot" });
    }
});
router.get("/snapshots", async (req, res) => {
    const { url, method } = req.query;
    try {
        const snapshots = await (0, storeSnapshot_1.getSnapshots)({ url, method });
        res.status(200).json({ snapshots });
    }
    catch (err) {
        console.error("[Backend] Snapshot fetch error:", err);
        res.status(500).json({ message: "Failed to fetch snapshots" });
    }
});
router.get("/snapshots/diff", async (req, res) => {
    const { url, method, clientId } = req.query;
    if (!url || !method) {
        res.status(400).json({ message: "URL and method are required" });
    }
    try {
        const [current, previous] = await (0, storeSnapshot_1.getRecentSnapshots)({
            url,
            method,
            clientId
        });
        if (!current || !previous) {
            res.status(400).json({ message: "Not enough snapshots to compare" });
        }
        const bodyDiff = (0, diffEngine_1.generateDiff)(previous.body, current.body);
        const headersDiff = (0, diffEngine_1.generateDiff)(previous.headers, current.headers);
        res.status(200).json({
            url,
            method,
            differences: {
                body: bodyDiff,
                headers: headersDiff,
            },
        });
    }
    catch (err) {
        console.error("[Backend] Diff error:", err);
        res.status(500).json({ message: "Failed to generate diff" });
    }
});
exports.default = router;
