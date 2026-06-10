import { Router } from "express";
import {
  getComments,
  addComment,
  updateComment,
  deleteComment,
  getUserComments,
} from "../controllers/comment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/user/me", verifyJWT, getUserComments);
router.get("/:refId", getComments);
router.post("/:refId", verifyJWT, addComment);
router.patch("/c/:commentId", verifyJWT, updateComment);
router.delete("/c/:commentId", verifyJWT, deleteComment);

export default router;
