import mongoose from "mongoose"
import { Comment } from "../models/comment.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


// GET ALL COMMENTS ON A RESOURCE (video or tweet)
const getComments = asyncHandler(async (req, res) => {
  const { refId } = req.params;
  let { refType = "video", page = 1, limit = 15 } = req.query;

  if (!mongoose.isValidObjectId(refId)) {
    throw new ApiError(400, "Invalid resource ID");
  }
  if (!["video", "tweet"].includes(refType)) {
    throw new ApiError(400, "Invalid refType");
  }

  page = Number(page) || 1;
  limit = Number(limit) || 15;
  const skip = (page - 1) * limit;

  // Count
  const totalComments = await Comment.countDocuments({ refType, refId: new mongoose.Types.ObjectId(refId) });

  // Aggregate
  const comments = await Comment.aggregate([
    { $match: { refType, refId: new mongoose.Types.ObjectId(refId) } },
    { $sort: { createdAt: -1 } },
    { $skip: skip },
    { $limit: limit },
    { $lookup: { from: "users", localField: "owner", foreignField: "_id", as: "commentatorDetail" } },
    { $unwind: { path: "$commentatorDetail", preserveNullAndEmptyArrays: true } },
    { $project: { _id: 1, content: 1, createdAt: 1, user: { _id: "$commentatorDetail._id", username: "$commentatorDetail.username", avatar: "$commentatorDetail.avatar" } } },
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        comments,
        pagination: {
          total: totalComments,
          page,
          limit,
          totalPages: Math.ceil(totalComments / limit),
        },
      },
      "Comments fetched successfully"
    )
  );
});



// ADD COMMENT (for video or tweet)
const addComment = asyncHandler(async (req, res) => {
  const { content, refType = "video" } = req.body;
  const userId = req.user?._id;
  const refId = req.params.refId;

  if (!content) {
    throw new ApiError(400, "Comment content is required");
  }
  if (!userId) {
    throw new ApiError(401, "User must be logged in to comment");
  }
  if (!mongoose.isValidObjectId(refId)) {
    throw new ApiError(400, "Invalid resource ID");
  }
  if (!["video", "tweet"].includes(refType)) {
    throw new ApiError(400, "Invalid refType");
  }

  // Check resource exists (video or tweet)
  let Model;
  if (refType === "video") {
    const { Videos } = await import("../models/video.model.js");
    Model = Videos;
  } else if (refType === "tweet") {
    const { Tweet } = await import("../models/tweets.model.js");
    Model = Tweet;
  }
  const exists = await Model.findById(refId);
  if (!exists) {
    throw new ApiError(404, `${refType.charAt(0).toUpperCase() + refType.slice(1)} not found`);
  }

  const createdComment = await Comment.create({
    content,
    refType,
    refId,
    owner: userId
  });

  // populate owner for response
  const populated = await Comment.findById(createdComment._id).populate({ path: 'owner', select: 'username avatar' });

  return res
    .status(201)
    .json(new ApiResponse(201, populated, "Comment added successfully"));
});

// UPDATE COMMENT
const updateComment = asyncHandler(async (req, res) => {

    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user?._id;

    if (!mongoose.isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid Comment ID");
    }
    if (!content) {
        throw new ApiError(400, "Updated content is required");
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    // Security check
    if (comment.owner.toString() !== userId.toString()) {
        throw new ApiError(403, "You cannot update someone else's comment");
    }

    comment.content = content;
    await comment.save();

    return res
        .status(200)
        .json(new ApiResponse(200, comment, "Comment updated successfully"));
});

// DELETE COMMENT
const deleteComment = asyncHandler(async (req, res) => {

    const { commentId } = req.params;
    const userId = req.user?._id;

    if (!mongoose.isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid Comment ID");
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    // Security check
    if (comment.owner.toString() !== userId.toString()) {
        throw new ApiError(403, "You cannot delete someone else's comment");
    }

    await comment.deleteOne();

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Comment deleted successfully"));
});

// GET COMMENTS BY CURRENT USER
const getUserComments = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  let { page = 1, limit = 30 } = req.query;

  if (!userId) {
    throw new ApiError(401, "User must be logged in");
  }

  page = Number(page) || 1;
  limit = Number(limit) || 30;
  const skip = (page - 1) * limit;

  const total = await Comment.countDocuments({ owner: userId });
  const comments = await Comment.find({ owner: userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        comments,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      "User comments fetched successfully"
    )
  );
});

export {
  getComments,
  addComment,
  updateComment,
  deleteComment,
  getUserComments
}

