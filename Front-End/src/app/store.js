import { configureStore } from "@reduxjs/toolkit";
import authSlice from "../features/authSlice.js";
import tweetsSlice from "../features/tweetsSlice.js";
import videosSlice from "../features/videosSlice.js";

export const store = configureStore({
  reducer: {
    auth: authSlice,
    tweets: tweetsSlice,
    videos: videosSlice,
  },
});

export default store;

