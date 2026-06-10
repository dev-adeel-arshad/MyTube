import mongoose, { isValidObjectId } from "mongoose"
import { Tweet } from "../models/tweets.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

// A CONTROLLER FOR CREATING THE TWEET
const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    try {


        const content = req.body.content;


        const user = req.user;

        const tweet = await Tweet.create({
            content,
            owner: user,
        })

        const populatedTweet = await Tweet.findById(tweet._id).populate("owner", "username fullname avatar");

        return res.status(200).json({
            message: 'Tweeit is created successfully!!',
            tweet: populatedTweet,
        })
    } catch (error) {
        throw new ApiError(500, "Something went wrong while creating the tweet! Plz try again later!!")
    }


})

// A CONTROLLER FOR GETTING ALL TWEETS OF THE USERS
const getUserTweets = asyncHandler(async (req, res) => {
    try {
        const userId = req.params.userId || req.user?._id;

        if (!userId) {
            throw new ApiError(400, "User id is required")
        }

        const tweets = await Tweet.find({
            owner: userId,
        }).populate("owner", "username fullname avatar");

        return res.status(200).json({
            message: "Tweets are fetched successfully!!",
            tweets,
        })
    } catch (error) {
        throw new ApiError(500, "Error while fetching tweets!!")
    }
})

// GET A SINGLE TWEET BY ID
const getTweetById = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID")
    }

    const tweet = await Tweet.findById(tweetId).populate("owner", "username fullname avatar");

    if (!tweet) {
        throw new ApiError(404, "Tweet not found")
    }

    return res.status(200).json({
        message: "Tweet fetched successfully",
        tweet,
    });
})


// A CONTROLLER FOR UPDATING A TWEET
const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    try {
        const newContent = req.body.content;
        console.log('new content is:', newContent);

        if (newContent) {
            // we can also fetch the id like that
            // const {tweetId} = req.params;
            const id = req.params.tweetId


            await Tweet.findByIdAndUpdate(id, { content: newContent }, { new: true })

            return res.status(200).json({
                message: "Tweet is updated successfully!!",

            })

        } else {
            const oldTweet = await Tweet.findById(req.params._id);

            return res.status(200).json({
                message: "Tweet is not updated!!Showing the previous one...",
                tweetIs: oldTweet,
            })
        }

    } catch (error) {
        throw new ApiError(500, "error while updating the tweet!!",error)
    }

})


// A CONTROLLER FOR DELETING A TWEET
const deleteTweet = asyncHandler(async (req, res) => {
   
    try {
   
    const {tweetId} = req.params;

    await Tweet.findByIdAndDelete(tweetId);

    return res.status(200).json({
        message:"The tweet is deleted Successfully!!",
    })

    } catch (error) {
        throw new ApiError(500,"Something went wrong while deleting the tweet!!",error)
    }
})

export {
    createTweet,
    getUserTweets,
    getTweetById,
    updateTweet,
    deleteTweet
}

