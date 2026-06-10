import { Router } from "express";
import {
  toggleCommentLike,
  toggleTweetLike,
  toggleVideoLike,
  getLikedVideos,
  getLikesForVideo,
  getLikesForComment,
  getLikesForTweet,
} from "../controllers/like.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/toggle/v/:videoId", verifyJWT, toggleVideoLike);
router.post("/toggle/c/:commentId", verifyJWT, toggleCommentLike);
router.post("/toggle/t/:tweetId", verifyJWT, toggleTweetLike);

router.get("/videos", verifyJWT, getLikedVideos);
router.get("/v/:videoId", getLikesForVideo);
 
router.get("/c/:commentId", getLikesForComment);
router.get("/t/:tweetId", getLikesForTweet);

export default router;
