import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


// TOGGLE LIKE ON THE VIDEO
const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const userId = req.user.id;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const existingLike = await Like.findOne({ video: videoId, likedBy: userId });

    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id);
        return res.status(200).json(new ApiResponse(200, { liked: false }, "Video unliked"));
    }

    await Like.create({ video: videoId, likedBy: userId });

    return res.status(200).json(new ApiResponse(200, { liked: true }, "Video liked"));
});

// TOGGLE LIKE ON THE COMMENT
const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user.id;

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }

    const existingLike = await Like.findOne({ comment: commentId, likedBy: userId });

    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id);
        return res.status(200).json(new ApiResponse(200, { liked: false }, "Comment unliked"));
    }

    await Like.create({ comment: commentId, likedBy: userId });

    return res.status(200).json(new ApiResponse(200, { liked: true }, "Comment liked"));
});

// TOGGLE LIKE ON THE TWEET
const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const userId = req.user.id;

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }

    const existingLike = await Like.findOne({ tweet: tweetId, likedBy: userId });

    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id);
        return res.status(200).json(new ApiResponse(200, { liked: false }, "Tweet unliked"));
    }

    await Like.create({ tweet: tweetId, likedBy: userId });

    return res.status(200).json(new ApiResponse(200, { liked: true }, "Tweet liked"));
});

// TOGGLE LIKE ON THE SHORT
/* Shorts removed */

// GET ALL LIKED VIDEOS
const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const likedVideos = await Like.find({
        likedBy: userId,
        video: { $exists: true }
    }).populate("video");

    return res.status(200).json(new ApiResponse(200, likedVideos, "Fetched liked videos"));
});

// GET likes for a specific video (public)
const getLikesForVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video ID");

    const likes = await Like.find({ video: videoId }).populate('likedBy', 'username avatar fullname');

    return res.status(200).json(new ApiResponse(200, likes, "Likes fetched"));
});

// GET likes for a specific comment (public)
const getLikesForComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    if (!isValidObjectId(commentId)) throw new ApiError(400, "Invalid comment ID");

    const likes = await Like.find({ comment: commentId }).populate('likedBy', 'username avatar fullname');

    return res.status(200).json(new ApiResponse(200, likes, "Likes fetched"));
});

// GET likes for a specific tweet (public)
const getLikesForTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    if (!isValidObjectId(tweetId)) throw new ApiError(400, "Invalid tweet ID");

    const likes = await Like.find({ tweet: tweetId }).populate('likedBy', 'username avatar fullname');

    return res.status(200).json(new ApiResponse(200, likes, "Likes fetched"));
});

/* Shorts removed */

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos,
    getLikesForVideo,
    getLikesForComment,
    getLikesForTweet,
};

