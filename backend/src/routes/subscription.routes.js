import { Router } from "express";
import {
  toggleSubscription,
  getUserChannelSubscribers,
  getSubscribedChannels,
} from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/c/:channelId", verifyJWT, toggleSubscription);
router.get("/c/:channelId", getUserChannelSubscribers);
router.get("/u/:subscriberId", getSubscribedChannels);

export default router;
