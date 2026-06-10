import mongoose, { isValidObjectId } from "mongoose"
import { Playlist } from "../models/playlist.model.js"
import { Videos } from "../models/video.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body
    //TODO: create playlist
    const user = req.user._id;

    if (!user) {
        throw new ApiError(400, "You are not authorized to create playlist")
    }

    if (!(name || description)) {
        throw new ApiError(400, "Name and Description both are compulsory")
    }

    const playlist = await Playlist.create({
        name,
        description,
        videos: [],
        owner: user,
    })

    return res.status(200).json({
        message: "Playlist created Successfully!!",
        playlist,
    })
})

// GET USER PLAYLISTS 
const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params

    if (!userId) {
        throw new ApiError(400, "User not found!!!!!")
    }

    const allPlaylists = await Playlist.find({ owner: userId })
        .select("_id name description videos thumbnail owner")
        .populate({ path: "videos", select: "thumbnail" });

    if (!allPlaylists) {

        throw new ApiError(500, `Error while fetching all the playlists!!`)
    }

    return res.status(200).json({
        message: "All playlist are fetched successfully!!",
        data: allPlaylists,
        playlists: allPlaylists,
    })
})

// GET CURRENT USER PLAYLISTS
const getCurrentUserPlaylists = asyncHandler(async (req, res) => {
    const userId = req.user?._id;

    if (!userId) {
        throw new ApiError(400, "User not found")
    }

    const allPlaylists = await Playlist.find({ owner: userId })
        .select("_id name description videos thumbnail owner")
        .populate({ path: "videos", select: "thumbnail" });

    if (!allPlaylists) {
        throw new ApiError(500, "Error while fetching your playlists")
    }

    return res.status(200).json({
        message: "Your playlists fetched successfully!!",
        data: allPlaylists,
        playlists: allPlaylists,
    })
})

// SEARCH PLAYLISTS BY NAME
const searchPlaylists = asyncHandler(async (req, res) => {
    const { query } = req.params;
    const limit = Number(req.query.limit) || 12;

    if (!query) {
        return res.status(200).json({ playlists: [], data: [] });
    }

    const regex = new RegExp(query, "i");

    const playlists = await Playlist.find({ name: { $regex: regex } })
        .select("_id name description videos thumbnail owner")
        .populate({ path: "videos", select: "thumbnail" })
        .populate({ path: "owner", select: "username avatar" })
        .sort({ createdAt: -1 })
        .limit(limit);

    return res.status(200).json({
        message: "Playlists fetched successfully",
        playlists,
        data: playlists,
    });
});

// GET PLAYLIST BY ID
const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params

    if (!playlistId) {
        throw new ApiError(404, `playlist not found!! `)
    }

    const playlist = await Playlist.findById(playlistId).populate({
        path: "videos",
        select: "title thumbnail owner",
        populate: { path: "owner", select: "username avatar" }
    });

    if (!playlist) {
        throw new ApiError(404, `playlist not found!! `)
    }

    return res.status(200).json({
        message: "Playlitst is fetched successfully!!",
        playlist,
    })

})

// ADDING VIDEO TO THE PLAYLIST

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params

    if (!(playlistId && videoId)) {
        throw new ApiError(400, `Cannot find the playlist or the video`);
    }

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new ApiError(404, "Cannot find the playlist")
    }
    if (playlist.videos.includes(videoId)) {
        return res.status(200).json({
            message: "Video already exists in the playlist",
            playlist,
        });
    }
    playlist.videos.push(videoId);
    if (!playlist.thumbnail) {
        const videoDoc = await Videos.findById(videoId).select("thumbnail");
        if (videoDoc?.thumbnail) {
            playlist.thumbnail = videoDoc.thumbnail;
        }
    }
    await playlist.save();

    return res.status(200).json({
        message: "Video has been added to the playlist!!",
        playlist,
    })

})

// DELETING A VIDEO FROM THE PLAYLIST
const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    // TODO: remove video from playlist

    if (!(playlistId && videoId)) {
        throw new ApiError(404, `playlist or video not found!!`)
    }

    let originalPlaylist = await Playlist.findById(playlistId);
    let newVideos = originalPlaylist.videos.filter((id)=> id.toString()!==videoId)
    originalPlaylist.videos = newVideos;
    await originalPlaylist.save();

    return res.status(200).json({
        message: "Video is deleted successfully!!",
        newPlayList: originalPlaylist,
    })

})


// DELETE A PLAYLIST
const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    if (!playlistId) {
        throw new ApiError(404, "Playlist not found")
    }
    
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    if (req.user._id.toString() !== playlist.owner.toString()) {
        throw new ApiError(403, "You are not authorized to delete the playlist!!")
    }

    await Playlist.findByIdAndDelete(playlistId);

    return res.status(200).json({
        message: "Play list has been deleted successfully!!",
        Success: true,
    })
})

// UPDATE A PLAYLIST
const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const { name, description } = req.body
    //TODO: update playlist

    const updatedFields={};

    if(name){
        updatedFields.name=name;
    }

    if(description){

        updatedFields.description=description;
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(playlistId, {
       $set:updatedFields

    }, {
        new: true
    })

    return res.status(200).json({
        message: "The playlist is updated successfully!!",
        playlist: updatedPlaylist,
    })

})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist,
    getCurrentUserPlaylists,
    searchPlaylists
}

