import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js"
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken"
import { sendEmail, buildOtpEmail } from "../utils/email.js";


const generateRefreshAndAccessTokens = async (userId) => {
    try {

        const user = await User.findById(userId);

        const AccessToken = user.generateAccessToken()
        const RefreshToken = user.generateRefreshToken()


        user.refreshToken = RefreshToken;
        await user.save({ validateBeforeSave: false })

        return { AccessToken, RefreshToken }

    } catch (error) {
        throw new ApiError(500, "Something went wrong while creating the Access and refresh token!!")
    }


}


// REGISTER USER CONTROLLER

const registerUser = asyncHandler(async (req, res) => {

    const { fullname, email, password, username } = req.body;
   


    if (
        [username, fullname, email, password].some((fields) => fields?.trim() === "")
    ) {
        throw new ApiError(400, " All fields re required!!")
    }

    if (String(password).length < 8) {
        throw new ApiError(400, "Password must be at least 8 characters")
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })
    if (existedUser) {
        throw new ApiError(409, "User with username or email Already Exists!!")

    }

    const avatarLocalPath = req.files?.avatar?.[0]?.path

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    // Default avatar URL for testing when no avatar is provided
    const defaultAvatarUrl = "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&s=100";
    
    let avatar = null;
    if (avatarLocalPath) {
        avatar = await uploadOnCloudinary(avatarLocalPath);
    }
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    // Use default avatar if upload failed or no avatar provided
    const avatarUrl = avatar?.url || defaultAvatarUrl;


    const verificationCode = String(Math.floor(100000 + Math.random() * 900000));
    const verificationExpires = new Date(Date.now() + 2 * 60 * 1000);

    const user = await User.create({
        fullname,
        avatar: avatarUrl,
        coverImage: coverImage?.url || "",
        password,
        username: username.toLowerCase(),
        email,
        isEmailVerified: false,
        emailVerificationCode: verificationCode,
        emailVerificationExpires: verificationExpires,
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if (!createdUser) {
        throw new ApiError(500, " Something went wrong while creating the User plz Try again later!!");
    }

    try {
        await sendEmail({
            to: user.email,
            ...buildOtpEmail({
                code: verificationCode,
                title: "Verify your MyTube email",
                intro: "Use the code below to verify your account.",
                footer: "This code expires in 2 minutes.",
            })
        });
    } catch (error) {
        await User.findByIdAndDelete(user._id);
        throw new ApiError(500, error?.message || "Email service not configured")
    }

    return res.status(201).json(
        new ApiResponse(200, { user: createdUser }, "Verification code sent to email")
    )

})

// LOGIN USER CONTROLLLER

const loginUser = asyncHandler(async (req, res) => {


    const { email, username, password } = req.body

    if (!(username || email) || !password) {
        throw new ApiError(400, "Username or email and password are required!!")
    }



    const user = await User.findOne({
        $or: [{ username }, { email }]
    })


    if (!user) {
        throw new ApiError(404, "User does not exist!!")
    }

    if (!user.isEmailVerified) {
        throw new ApiError(403, "Email not verified")
    }

    const isPasswordValid = await user.isPasswordcorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(404, "Passowrd is not valid!")
    }

    const { RefreshToken, AccessToken } = await generateRefreshAndAccessTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const option = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    }
console.log('cookies are',AccessToken);
console.log('cookies are',RefreshToken);

    return res
        .status(200)
        .cookie("AccessToken", AccessToken, option)
        .cookie("RefreshToken", RefreshToken, option)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser, AccessToken, RefreshToken
                },
                "User LoggedIn Successfully!!"
            )
        )
})

// VERIFY EMAIL
const verifyEmail = asyncHandler(async (req, res) => {
    const { email, code } = req.body;

    if (!email || !code) {
        throw new ApiError(400, "Email and code are required")
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
        throw new ApiError(404, "User not found")
    }

    if (user.isEmailVerified) {
        return res.status(200).json(new ApiResponse(200, {}, "Email already verified"))
    }

    const isExpired = !user.emailVerificationExpires || user.emailVerificationExpires.getTime() < Date.now();
    const isMismatch = String(user.emailVerificationCode) !== String(code);

    if (isExpired || isMismatch) {
        const newCode = String(Math.floor(100000 + Math.random() * 900000));
        const newExpires = new Date(Date.now() + 2 * 60 * 1000);
        user.emailVerificationCode = newCode;
        user.emailVerificationExpires = newExpires;
        await user.save({ validateBeforeSave: false });

        await sendEmail({
            to: user.email,
            ...buildOtpEmail({
                code: newCode,
                title: "Verify your MyTube email",
                intro: "Use the code below to verify your account.",
                footer: "This code expires in 2 minutes.",
            })
        });

        throw new ApiError(400, "Invalid or expired code. A new code has been sent.")
    }

    user.isEmailVerified = true;
    user.emailVerificationCode = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json(new ApiResponse(200, {}, "Email verified successfully"))
})

// RESEND EMAIL VERIFICATION CODE
const resendVerificationCode = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        throw new ApiError(400, "Email is required")
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
        throw new ApiError(404, "User not found")
    }

    if (user.isEmailVerified) {
        return res.status(200).json(new ApiResponse(200, {}, "Email already verified"))
    }

    const verificationCode = String(Math.floor(100000 + Math.random() * 900000));
    const verificationExpires = new Date(Date.now() + 2 * 60 * 1000);
    user.emailVerificationCode = verificationCode;
    user.emailVerificationExpires = verificationExpires;
    await user.save({ validateBeforeSave: false });

    await sendEmail({
        to: user.email,
        ...buildOtpEmail({
            code: verificationCode,
            title: "Verify your MyTube email",
            intro: "Use the code below to verify your account.",
            footer: "This code expires in 2 minutes.",
        })
    });

    return res.status(200).json(new ApiResponse(200, {}, "Verification code resent"))
})


// LOG OUT USER

const logoutUser = asyncHandler(async (req, res) => {



    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {

                refreshToken: undefined,
            }
        },
        {
            new: true,
        }
    )

    const option = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    }


    return res
        .status(200)
        .clearCookie("AccessToken", option)
        .clearCookie("RefreshToken", option)
        .json(new ApiResponse(200, {}, "User  Logged Out Successfully!!")
        )

})

// REFRESH ACCESS TOKEN

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingrefreshToken = req.cookies.RefreshToken || req.body.refreshToken

    try {
        if (!incomingrefreshToken) {
            throw new ApiError(401, "Unauthorized acccess!!")
        }


        const decodedToken = jwt.verify(incomingrefreshToken, process.env.REFRESH_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id)

        if (!user) {
            throw new ApiError(401, "Invalid refresh token!!")
        }

        if (incomingrefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used!!")
        }


        const option = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        }

        const { AccessToken, RefreshToken } = await generateRefreshAndAccessTokens(user._id)

        return res
            .status(200)
            .cookie("AccessToken", AccessToken, option)
            .cookie("RefreshToken", RefreshToken, option)
            .json(
                new ApiResponse(200, { AccessToken, RefreshToken }, "Access token refreshed!!")
            )

    } catch (error) {

        throw new ApiError(401, error?.message, "Invalid refresh token!!")

    }

})

// CHANGE THE CURRENT PASSWORD

const changeCurrentPassword = asyncHandler(async (req, res) => {

    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user?._id)

    const isPasswordcorrect = await user.isPasswordcorrect(oldPassword);

    if (!isPasswordcorrect) {

        throw new ApiError(400, "Invalid Old Password!!");

    }
    user.password = newPassword;
    await user.save({ validateBeforeSave: false })


    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "password Changed Successfully")
        )


})

// GET CURRENT USER

const getCurrentUser = asyncHandler(async (req, res) => {
   const user = req.user;


    return res.status(200).json(user);

})

//USERNAME CHANGEING

const updateAccountDetails = asyncHandler(async (req, res) => {

    const { fullname, email } = req.body;

    if (!(fullname || email)) {

        throw new ApiError(400, "All Fields are compulsory");

    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                fullname,
                email
            }
        },
        {
            new: true,
        }
    ).select("-password -refreshToken")

    return res
        .status(200)
        .json(
            new ApiResponse(200, user, "Account details updated successfully!!!")
        )


})

//UPDATING THE AVATAR

const updateUserAvatar = asyncHandler(async (req, res) => {

    const localFilePath = req.file?.path;
    if (!localFilePath) {
        throw new ApiError(400, "Avatar File is missing!!")
    }

    const avatar = await uploadOnCloudinary(localFilePath);

    if (!avatar.url) {
        throw new ApiError(400, "Error while Uploading avatar !!");

    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                avatarv: avatar.url,
            }
        },

    ).select("-password")


    return res
        .status(200)
        .json(
            new ApiResponse(200, user, "User avatar updated successfully!")
        )
})

// UPDATING USER COVERIMAGE

const updateUserCoverImage = asyncHandler(async (req, res) => {

    const coverImagepath = req.file?.path;
    if (!coverImagepath) {
        throw new ApiError(400, "coverImage is missing!!")
    }

    const coverImage = await uploadOnCloudinary(coverImagepath);

    if (!coverImage.url) {
        throw new ApiError(400, "Error while Uploading coverImage !!");

    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                coverImage: coverImage.url,
            }
        },
        {
            new: true,
        }

    ).select("-password")


    return res
        .status(200)
        .json(
            new ApiResponse(200, user, "User avatar updated successfully!")
        )
})

//GETTING USE CHANNEL INFO

const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username, } = req.params
    if (!username?.trim()) { throw new ApiError(400, "Username is missing!!") } // User.find({username}) 

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase(),
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                channelSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: {
                            $in: [req.user?._id, "$subscribers.subscriber"]
                        },
                        then: true,
                        else: false
                    }
                },
            }
        },
        {
            $project: {
                fullname: 1,
                username: 1,
                subscribersCount: 1,
                channelSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1,
            }
        }
    ])
    console.log('Channel After aggregation is:', channel);
    if (!channel.length) {
        throw new ApiError(404, "channel does not exist!!")

    }
    return res
        .status(200)
        .json(new ApiResponse(200, channel[0], "User Channel fetched successfully!!"))
})


// GET WATCH HISTORY

const getWatchHistory = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id)
        .select("watchHistory watchHistoryPaused")
        .populate({
            path: "watchHistory.videoId",
            select: "title thumbnail createdAt owner views",
            populate: { path: "owner", select: "username avatar" },
        });

    if (!user) {
        throw new ApiError(404, "User not found")
    }

    const entries = Array.isArray(user.watchHistory) ? user.watchHistory : [];
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfToday.getDate() - 1);

    const grouped = { today: [], yesterday: [], older: [] };
    const flat = [];

    const videoIds = entries
        .map((entry) => entry?.videoId?._id || entry?.videoId)
        .filter(Boolean)
        .map((id) => new mongoose.Types.ObjectId(id));

    const likesMap = new Map();
    if (videoIds.length) {
        const likesAgg = await Like.aggregate([
            { $match: { video: { $in: videoIds } } },
            { $group: { _id: "$video", count: { $sum: 1 } } }
        ]);
        likesAgg.forEach((row) => likesMap.set(String(row._id), row.count));
    }

    for (const entry of entries) {
        const video = entry?.videoId || null;
        if (!video) continue;
        const watchedAt = entry?.watchedAt ? new Date(entry.watchedAt) : new Date(0);
        const likesCount = likesMap.get(String(video._id)) || 0;
        const videoObj = typeof video.toObject === "function" ? video.toObject() : video;
        videoObj.likesCount = likesCount;
        const payload = { video: videoObj, watchedAt };
        flat.push(videoObj);

        if (watchedAt >= startOfToday) {
            grouped.today.push(payload);
        } else if (watchedAt >= startOfYesterday) {
            grouped.yesterday.push(payload);
        } else {
            grouped.older.push(payload);
        }
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { grouped, items: flat, paused: !!user.watchHistoryPaused },
                "Watch history fetched successfully"
            )
        )
})

// ADD TO WATCH HISTORY
const addToWatchHistory = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!videoId || !mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id")
    }

    const user = await User.findById(req.user._id);
    if (!user) {
        throw new ApiError(404, "User not found")
    }

    if (user.watchHistoryPaused) {
        return res.status(200).json(new ApiResponse(200, { added: false, paused: true }, "History is paused"));
    }

    const lastEntry = user.watchHistory?.[user.watchHistory.length - 1];
    if (lastEntry && String(lastEntry.videoId) === String(videoId)) {
        return res.status(200).json(new ApiResponse(200, { added: false }, "Already in history"));
    }

    user.watchHistory.push({ videoId, watchedAt: new Date() });
    await user.save({ validateBeforeSave: false });

    return res.status(200).json(new ApiResponse(200, { added: true }, "Added to history"));
})

// GET WATCH HISTORY STATUS
const getWatchHistoryStatus = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select("watchHistoryPaused");
    if (!user) {
        throw new ApiError(404, "User not found")
    }
    return res.status(200).json(new ApiResponse(200, { paused: !!user.watchHistoryPaused }, "History status fetched"));
})

// UPDATE WATCH HISTORY PAUSE
const setWatchHistoryPaused = asyncHandler(async (req, res) => {
    const { paused } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
        throw new ApiError(404, "User not found")
    }

    user.watchHistoryPaused = !!paused;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json(new ApiResponse(200, { paused: !!user.watchHistoryPaused }, "History pause updated"));
})

// REMOVE FROM WATCH HISTORY
const removeFromWatchHistory = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!videoId || !mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id")
    }

    const user = await User.findById(req.user._id);
    if (!user) {
        throw new ApiError(404, "User not found")
    }

    user.watchHistory = (user.watchHistory || []).filter(
        (entry) => String(entry.videoId) !== String(videoId)
    );
    await user.save({ validateBeforeSave: false });

    return res.status(200).json(new ApiResponse(200, {}, "Removed from history"));
})

// CLEAR WATCH HISTORY
const clearWatchHistory = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) {
        throw new ApiError(404, "User not found")
    }

    user.watchHistory = [];
    user.tweetHistory = [];
    await user.save({ validateBeforeSave: false });

    return res.status(200).json(new ApiResponse(200, {}, "History cleared"));
})

// GET TWEET HISTORY
const getTweetHistory = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id)
        .select("tweetHistory watchHistoryPaused")
        .populate({
            path: "tweetHistory.tweetId",
            select: "content owner createdAt",
            populate: { path: "owner", select: "username avatar" },
        });

    if (!user) {
        throw new ApiError(404, "User not found")
    }

    const entries = Array.isArray(user.tweetHistory) ? user.tweetHistory : [];
    const items = entries.map((entry) => ({
        tweet: entry.tweetId,
        visitedAt: entry.visitedAt,
    })).filter((entry) => entry.tweet);

    return res
        .status(200)
        .json(new ApiResponse(200, { items, paused: !!user.watchHistoryPaused }, "Tweet history fetched"));
})

// ADD TO TWEET HISTORY
const addToTweetHistory = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    if (!tweetId || !mongoose.isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet id")
    }

    const user = await User.findById(req.user._id);
    if (!user) {
        throw new ApiError(404, "User not found")
    }

    if (user.watchHistoryPaused) {
        return res.status(200).json(new ApiResponse(200, { added: false, paused: true }, "History is paused"));
    }

    const lastEntry = user.tweetHistory?.[user.tweetHistory.length - 1];
    if (lastEntry && String(lastEntry.tweetId) === String(tweetId)) {
        return res.status(200).json(new ApiResponse(200, { added: false }, "Already in history"));
    }

    user.tweetHistory.push({ tweetId, visitedAt: new Date() });
    await user.save({ validateBeforeSave: false });

    return res.status(200).json(new ApiResponse(200, { added: true }, "Added to tweet history"));
})

// GET USER BY ID (public)
const getUserById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!id) {
        throw new ApiError(400, "User id is missing")
    }

    const user = await User.findById(id).select("fullname username avatar coverImage");
    if (!user) {
        throw new ApiError(404, "User not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, user, "User fetched successfully"))
})


export {

    logoutUser,
    registerUser,
    loginUser,
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
}
