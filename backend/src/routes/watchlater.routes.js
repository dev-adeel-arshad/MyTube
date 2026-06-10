import { Router } from "express";
import {
  getWatchLater,
  addToWatchLater,
  removeFromWatchLater,
} from "../controllers/watchlater.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", verifyJWT, getWatchLater);
router.post("/:videoId", verifyJWT, addToWatchLater);
router.delete("/:videoId", verifyJWT, removeFromWatchLater);

export default router;
