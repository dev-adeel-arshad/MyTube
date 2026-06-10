import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  allVideos: [],
  watchHistory: [],
  likedVideos: [],
  currentVideo: null,
  hiddenVideoIds: [],
};

const videosSlice = createSlice({
  name: "videos",
  initialState,
  reducers: {
    setAllVideos: (state, action) => {
      state.allVideos = action.payload;
    },
    addVideo: (state, action) => {
      const exists = state.allVideos.find((v) => v._id === action.payload._id);
      if (!exists) {
        state.allVideos.push(action.payload);
      }
    },
    addVideos: (state, action) => {
      action.payload.forEach((video) => {
        const exists = state.allVideos.find((v) => v._id === video._id);
        if (!exists) {
          state.allVideos.push(video);
        }
      });
    },
    setCurrentVideo: (state, action) => {
      state.currentVideo = action.payload;
    },
    hideVideo: (state, action) => {
      const videoId = action.payload;
      if (!state.hiddenVideoIds.includes(videoId)) {
        state.hiddenVideoIds.push(videoId);
      }
    },
    unhideVideo: (state, action) => {
      const videoId = action.payload;
      state.hiddenVideoIds = state.hiddenVideoIds.filter((id) => id !== videoId);
    },
    clearHiddenVideos: (state) => {
      state.hiddenVideoIds = [];
    },
    addToWatchHistory: (state, action) => {
      const videoId = action.payload;
      const index = state.watchHistory.indexOf(videoId);
      if (index > -1) {
        state.watchHistory.splice(index, 1);
      }
      state.watchHistory.unshift(videoId);
    },
    setWatchHistory: (state, action) => {
      state.watchHistory = action.payload;
    },
    clearWatchHistory: (state) => {
      state.watchHistory = [];
    },
    toggleLikedVideo: (state, action) => {
      const videoId = action.payload;
      const index = state.likedVideos.indexOf(videoId);
      if (index > -1) {
        state.likedVideos.splice(index, 1);
      } else {
        state.likedVideos.push(videoId);
      }
    },
    setLikedVideos: (state, action) => {
      state.likedVideos = action.payload;
    },
    clearVideos: (state) => {
      state.allVideos = [];
      state.currentVideo = null;
    },
  },
});

export const {
  setAllVideos,
  addVideo,
  addVideos,
  setCurrentVideo,
  hideVideo,
  unhideVideo,
  clearHiddenVideos,
  addToWatchHistory,
  setWatchHistory,
  clearWatchHistory,
  toggleLikedVideo,
  setLikedVideos,
  clearVideos,
} = videosSlice.actions;

export default videosSlice.reducer;
