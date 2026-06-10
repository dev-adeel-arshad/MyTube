import mongoose, { isValidObjectId } from "mongoose"
import { Videos } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { upload } from "../middlewares/multer.middleware.js"


// GETTING ALL VIDES FROM THE DB ON THE BASE OF SEARCH,SORTING ETC
const getAllVideos = asyncHandler(async (req, res) => {
  // allow filtering by owner (for profile pages)
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 6;
  const ownerFilter = req.query.owner;
  const skip = (page - 1) * limit;

  const pipeline = [];

  if (ownerFilter) {
    try {
      pipeline.push({ $match: { owner: new mongoose.Types.ObjectId(ownerFilter) } });
    } catch (err) {
      // invalid owner id - return empty list
      return res.status(200).json({ success: true, page, limit, videos: [] });
    }
  }

  pipeline.push({ $sort: { createdAt: -1 } });

  // When filtering by owner, allow a larger default limit so profile shows all videos
  const effectiveLimit = ownerFilter ? Number(req.query.limit) || 1000 : limit;

  pipeline.push({ $skip: skip });
  pipeline.push({ $limit: effectiveLimit });
  pipeline.push({
    $lookup: {
      from: "users",
      localField: "owner",
      foreignField: "_id",
      as: "ownerDetails",
    },
  });
  pipeline.push({ $unwind: { path: "$ownerDetails", preserveNullAndEmptyArrays: true } });
  pipeline.push({
    $project: {
      _id: 1,
      title: 1,
      thumbnail: 1,
      description: 1,
      category: 1,
      duration: 1,
      views: 1,
      createdAt: 1,
      "ownerDetails._id": 1,
      "ownerDetails.username": 1,
      "ownerDetails.avatar": 1,
    },
  });

  const videos = await Videos.aggregate(pipeline);

  return res.status(200).json({
    success: true,
    page,
    limit: effectiveLimit,
    videos,
  });
});
//   TO CREATE A VIDEO ------> DONE
const publishAVideo = asyncHandler(async (req, res) => {
  try {
    const { title, description, category } = req.body

    if (!(title && description)) {
      throw new ApiError(404, `Title and description both are required!! ${error}`)
    }

    const thumbnailLocalPath = req.files?.thumbnail[0]?.path;
    const videoFileLocalPath = req.files?.videoFile[0]?.path;

    const UploadedThumnail = await uploadOnCloudinary(thumbnailLocalPath)
    const UploadedVideo = await uploadOnCloudinary(videoFileLocalPath);

    const id=req.user._id;


    let video;
    if (UploadedThumnail && UploadedVideo) {
      video = await Videos.create({
        title,
        description,
        category: category || "Other",
        thumbnail: UploadedThumnail.url,
        videoFile: UploadedVideo.url,
        owner: req.user._id,
        duration: typeof UploadedVideo?.duration === "number" ? UploadedVideo.duration : 0,
        isPublished: true,
      })
    } else {
      throw new ApiError(500, `Error while Uploading Your Video!!`);
    }

    return res.status(200).json(video)

  } catch (error) {
    throw new ApiError(500, `Error in publishAVideo !! ${error}`)
  }
})

// GET THE VIDEO BY ID ---------> DONE
const getVideoById = asyncHandler(async (req, res) => {
  try {
    const videoId = req.params.videoId
    const userId = req.user?._id; // User ID will be available if authenticated

    // Use aggregation to include owner details
    const result = await Videos.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(videoId) } },
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "ownerDetails",
        },
      },
      { $unwind: { path: "$ownerDetails", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          thumbnail: 1,
          videoFile: 1,
          category: 1,
          duration: 1,
          createdAt: 1,
          views: 1,
          owner: "$ownerDetails",
        },
      },
    ]);

    const video = result[0] || null;

    if (!video) {
      throw new ApiError(404, "Video not found");
    }

    // Note: Watch history is now handled by the separate POST /users/history/:videoId endpoint
    // This keeps concerns separated and uses the new timestamped watch history schema

    return res.status(200).json({ video })

  } catch (error) {
    throw new ApiError(500, `Error while fetching the video!! ${error}`)
  }
})

// INCREMENT VIDEO VIEWS
const incrementVideoView = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id")
  }

  const video = await Videos.findByIdAndUpdate(
    videoId,
    { $inc: { views: 1 } },
    { new: true }
  );

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  return res.status(200).json(new ApiResponse(200, { views: video.views }, "View counted"));
})

// UPDATE VIDEO -------> DONE
const updateVideo = asyncHandler(async (req, res) => {
  try {
    const { videoId } = req.params;

    const video = await Videos.findById(videoId);
    if (!video) {
      throw new ApiError(404, `Video not found!! !! ${error}`);
    }

    let thumbnailUrl = video?.thumbnail;

    let uploadedThumbnail;

    if (req.files?.thumbnail?.[0]?.path) {
      uploadedThumbnail = await uploadOnCloudinary(req.files?.thumbnail[0]?.path);

      if (!uploadedThumbnail?.url) {
        throw new ApiError(400, `Thumbnail upload failed! !! ${error}`);
      }

      thumbnailUrl = uploadedThumbnail.url;
    }

    const updatedVideo = await Videos.findByIdAndUpdate(
      videoId,
      {
        title: req.body.title,
        description: req.body.description,
        category: req.body.category || video.category || "Other",
        thumbnail: thumbnailUrl,
      },
      { new: true }
    );

    return res.status(200).json({
      message: "The video has been updated successfully!",
      video: updatedVideo,
    });

  } catch (error) {
    throw new ApiError(500, `Error while updating the video!!!!!! !! ${error}`);
  }

})

//  DELETE VIDEO --------> DONE
const deleteVideo = asyncHandler(async (req, res) => {
  try {
    const { videoId } = req.params

    if (!videoId) {
      throw new ApiError(404, `Video not found !!`)
    }

    await Videos.findByIdAndDelete(videoId);

    return res.status(200).json({
      message: "Video deleted successfully!!!"
    })

  } catch (error) {
    throw new ApiError(500, `Error while deleting the video !! ${error}`)
  }
})

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params
})

// SEARCHING VIDEOS ON BASE OF SEARCH

const searchedVideos = asyncHandler(async (req, res) => {
  const query = req.params.query;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 6;
  const skip = (page - 1) * limit;
  const regex = new RegExp(query, "i");

  const Result = await Videos.aggregate([
    {
      $addFields: {
        titleMatch: { $regexMatch: { input: "$title", regex } },
        descMatch: { $regexMatch: { input: "$description", regex } },
      },
    },
    {
      $match: {
        $or: [
          { titleMatch: true },
          { descMatch: true },
        ],
      },
    },
    {
      $addFields: {
        matchRank: {
          $cond: [{ $eq: ["$titleMatch", true] }, 0, 1],
        },
      },
    },
    { $sort: { matchRank: 1, createdAt: -1 } },
    { $skip: skip },
    { $limit: limit },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "ownerDetails",
      },
    },
    { $unwind: { path: "$ownerDetails", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 1,
        title: 1,
        thumbnail: 1,
        description: 1,
        duration: 1,
        createdAt: 1,
        "ownerDetails._id": 1,
        "ownerDetails.username": 1,
        "ownerDetails.avatar": 1,
      },
    },
  ]);

  return res.status(200).json({
    success: true,
    page,
    limit,
    videos: Result,
  });
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
  searchedVideos,
  incrementVideoView,
}

