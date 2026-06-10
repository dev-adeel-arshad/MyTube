import { Router } from "express";
import {
  createPlaylist,
  getCurrentUserPlaylists,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
  searchPlaylists,
} from "../controllers/playlist.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/", verifyJWT, createPlaylist);
router.get("/", verifyJWT, getCurrentUserPlaylists);
router.get("/user", verifyJWT, getCurrentUserPlaylists);
router.get("/user/:userId", getUserPlaylists);
router.get("/search/:query", searchPlaylists);
router.get("/:playlistId", getPlaylistById);
router.patch("/:playlistId", verifyJWT, updatePlaylist);
router.delete("/:playlistId", verifyJWT, deletePlaylist);
router.patch("/add/:videoId/:playlistId", verifyJWT, addVideoToPlaylist);
router.patch("/remove/:videoId/:playlistId", verifyJWT, removeVideoFromPlaylist);
router.post("/:playlistId/:videoId", verifyJWT, addVideoToPlaylist);
router.delete("/:playlistId/:videoId", verifyJWT, removeVideoFromPlaylist);

export default router;
