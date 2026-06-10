import { Router } from "express";
import {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  searchedVideos,
  incrementVideoView,
} from "../controllers/video.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.get("/", getAllVideos);
router.post(
  "/",
  verifyJWT,
  upload.fields([
    { name: "videoFile", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  publishAVideo
);
router.get("/search/:query", searchedVideos);
router.get("/:videoId", getVideoById);
router.post("/:videoId/view", incrementVideoView);
router.patch(
  "/:videoId",
  verifyJWT,
  upload.fields([{ name: "thumbnail", maxCount: 1 }]),
  updateVideo
);
router.delete("/:videoId", verifyJWT, deleteVideo);

export default router;
