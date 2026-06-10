import mongoose, { isValidObjectId } from "mongoose"
import { User } from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const userId = req.user._id;

    if (!userId) {
        throw new ApiError(401, "You are not authorized. Please login.");
    }

    // Validate channel id
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel id");
    }

    // Check if subscription exists
    const existing = await Subscription.findOne({ channel: channelId, subscriber: userId });

    if (existing) {
        // Unsubscribe
        await Subscription.findByIdAndDelete(existing._id);
        return res.status(200).json({ success: true, subscribed: false, message: "Unsubscribed successfully" });
    }

    // Create subscription
    await Subscription.create({ channel: channelId, subscriber: userId });

    return res.status(200).json({ success: true, subscribed: true, message: "Subscribed successfully" });
})

// Controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    let { page = 1, limit = 50 } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    const skip = (page - 1) * limit;

    const subscribers = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $skip: skip
        },
        {
            $limit: limit
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriberDetails"
            }
        },
        {
            $unwind: "$subscriberDetails"
        },
        {
            $project: {
                _id: 0,
                subscriberId: "$subscriberDetails._id",
                username: "$subscriberDetails.username",
                email: "$subscriberDetails.email",
                avatar: "$subscriberDetails.avatar"
            }
        }
    ]);

    return res.status(200).json({
        success: true,
        page,
        limit,
        totalSubscribers: subscribers.length,
        message: `These are ${subscribers.length} users from the subscriber list`,
        subscribers
    });
});


// controller to return channel list to which user has subscribed


const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;

    let { page = 1, limit = 50 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    const skip = (page - 1) * limit;

    const result = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $sort: { createdAt: -1 }
        },
        {
            $skip: skip
        },
        {
            $limit: limit
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "channelSubscribed"
            }
        },
        {
            $unwind: "$channelSubscribed"
        },
        {
            $project: {
                _id: 0,
                channelId: "$channelSubscribed._id",
                fullName: "$channelSubscribed.fullname",
                username: "$channelSubscribed.username",
                email: "$channelSubscribed.email",
                avatar: "$channelSubscribed.avatar"
            }
        }
    ]);

    return res.status(200).json({
        success: true,
        message: `List of channels you are subscribed to (page ${page}, limit ${limit})`,
        page,
        limit,
        totalSubscribedChannels: result.length,
        subscribedChannels: result
    });
});



export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}
