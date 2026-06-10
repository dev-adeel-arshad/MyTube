import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  tweets: [],
  userTweets: [],
  currentTweet: null,
  likedTweets: [],
};

const tweetsSlice = createSlice({
  name: "tweets",
  initialState,
  reducers: {
    // Set all tweets
    setTweets: (state, action) => {
      state.tweets = action.payload;
    },

    // Set user's tweets
    setUserTweets: (state, action) => {
      state.userTweets = action.payload;
    },

    // Add new tweet
    addTweet: (state, action) => {
      state.userTweets.unshift(action.payload);
      state.tweets.unshift(action.payload);
    },

    // Update tweet
    updateTweet: (state, action) => {
      const index = state.userTweets.findIndex(t => t._id === action.payload._id);
      if (index !== -1) {
        state.userTweets[index] = action.payload;
      }
      const tweetIndex = state.tweets.findIndex(t => t._id === action.payload._id);
      if (tweetIndex !== -1) {
        state.tweets[tweetIndex] = action.payload;
      }
    },

    // Delete tweet
    deleteTweet: (state, action) => {
      state.userTweets = state.userTweets.filter(t => t._id !== action.payload);
      state.tweets = state.tweets.filter(t => t._id !== action.payload);
    },

    // Set current tweet
    setCurrentTweet: (state, action) => {
      state.currentTweet = action.payload;
    },

    // Toggle liked tweets
    toggleLikedTweet: (state, action) => {
      const tweetId = action.payload;
      const index = state.likedTweets.indexOf(tweetId);
      if (index > -1) {
        state.likedTweets.splice(index, 1);
      } else {
        state.likedTweets.push(tweetId);
      }
    },

    // Set liked tweets
    setLikedTweets: (state, action) => {
      state.likedTweets = action.payload;
    },

    // Clear tweets on logout
    clearTweets: (state) => {
      state.tweets = [];
      state.userTweets = [];
      state.currentTweet = null;
      state.likedTweets = [];
    },
  },
});

export const {
  setTweets,
  setUserTweets,
  addTweet,
  updateTweet,
  deleteTweet,
  setCurrentTweet,
  toggleLikedTweet,
  setLikedTweets,
  clearTweets,
} = tweetsSlice.actions;

export default tweetsSlice.reducer;

