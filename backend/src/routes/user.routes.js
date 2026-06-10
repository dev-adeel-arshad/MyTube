import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getCurrentUser,
  changeCurrentPassword,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getWatchHistory,
  addToWatchHistory,
  removeFromWatchHistory,
  clearWatchHistory,
  getWatchHistoryStatus,
  setWatchHistoryPaused,
  getTweetHistory,
  addToTweetHistory,
  getUserChannelProfile,
  getUserById,
  verifyEmail,
  resendVerificationCode,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.post(
  "/register",
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUser
);
router.post("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerificationCode);
router.post("/login", loginUser);
router.post("/logout", verifyJWT, logoutUser);
router.post("/refresh-token", refreshAccessToken);
router.post("/change-password", verifyJWT, changeCurrentPassword);
router.get("/current-user", verifyJWT, getCurrentUser);
router.patch("/update-account", verifyJWT, updateAccountDetails);
router.patch("/avatar", verifyJWT, upload.single("avatar"), updateUserAvatar);
router.patch(
  "/cover-image",
  verifyJWT,
  upload.single("coverImage"),
  updateUserCoverImage
);
router.get("/history", verifyJWT, getWatchHistory);
router.get("/history/status", verifyJWT, getWatchHistoryStatus);
router.patch("/history/pause", verifyJWT, setWatchHistoryPaused);
router.get("/history/tweets", verifyJWT, getTweetHistory);
router.post("/history/tweets/:tweetId", verifyJWT, addToTweetHistory);
router.post("/history/:videoId", verifyJWT, addToWatchHistory);
router.delete("/history/:videoId", verifyJWT, removeFromWatchHistory);
router.delete("/history", verifyJWT, clearWatchHistory);
router.get("/c/:username", getUserChannelProfile);
router.get("/:id", getUserById);

export default router;
