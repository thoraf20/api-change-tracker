"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const snapShortService_1 = require("../service/snapShortService");
const router = express_1.default.Router();
router.post("/", async (req, res) => {
    const snapshot = req.body;
    console.log("[Backend] Received snapshot:", snapshot);
    await (0, snapShortService_1.storeSnapshot)(snapshot);
    res.status(200).json({ message: "Snapshot received and stored." });
});
exports.default = router;
//# sourceMappingURL=track.route.js.map