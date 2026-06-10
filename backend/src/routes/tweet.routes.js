import { Router } from "express";
import {
  createTweet,
  getUserTweets,
  getTweetById,
  updateTweet,
  deleteTweet,
} from "../controllers/tweet.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/create-tweet", verifyJWT, createTweet);
router.get("/user", verifyJWT, getUserTweets);
router.get("/user/:userId", getUserTweets);
router.get("/:tweetId", getTweetById);
router.patch("/update-tweet/:tweetId", verifyJWT, updateTweet);
router.delete("/update-tweet/:tweetId", verifyJWT, deleteTweet);

export default router;
