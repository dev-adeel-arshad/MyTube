import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";

// GET watch later list for current user
const getWatchLater = asyncHandler(async (req, res) => {
    const user = req.user;
    if (!user) throw new ApiError(401, "Unauthorized");

    // populate video details for frontend
    const populated = await User.findById(user._id).select('watchLater').populate({
        path: 'watchLater.videoId',
        select: '_id title thumbnail createdAt owner'
    });

    const list = (populated.watchLater || []).map(entry => entry.videoId).filter(Boolean);

    return res.status(200).json({
        success: true,
        data: list,
    });
});

// Add a video to watch later (idempotent)
const addToWatchLater = asyncHandler(async (req, res) => {
    const user = req.user;
    const { videoId } = req.params;
    if (!user) throw new ApiError(401, "Unauthorized");
    if (!videoId) throw new ApiError(400, "videoId required");

    const u = await User.findById(user._id);
    if (!u) throw new ApiError(404, "User not found");

    const exists = u.watchLater.some(e => String(e.videoId) === String(videoId));
    if (exists) {
        return res.status(200).json({ success: true, message: "Already in Watch Later" });
    }

    u.watchLater.push({ videoId });
    await u.save();

    return res.status(200).json({ success: true, message: 'Added to Watch Later' });
});

// Remove from watch later
const removeFromWatchLater = asyncHandler(async (req, res) => {
    const user = req.user;
    const { videoId } = req.params;
    if (!user) throw new ApiError(401, "Unauthorized");
    if (!videoId) throw new ApiError(400, "videoId required");

    const u = await User.findById(user._id);
    if (!u) throw new ApiError(404, "User not found");

    u.watchLater = u.watchLater.filter(e => String(e.videoId) !== String(videoId));
    await u.save();

    return res.status(200).json({ success: true, message: 'Removed from Watch Later' });
});

export { getWatchLater, addToWatchLater, removeFromWatchLater };

