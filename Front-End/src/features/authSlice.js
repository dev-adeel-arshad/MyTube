import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  status: false,
  userData: null,
  subscribedChannels: [],
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      state.status = true;
      state.userData = action.payload;
    },
    logOut: (state) => {
      state.status = false;
      state.userData = null;
      state.subscribedChannels = [];
    },
    setSubscribedChannels: (state, action) => {
      state.subscribedChannels = action.payload || [];
    },
    toggleSubscribedChannel: (state, action) => {
      const channelId = action.payload;
      const index = state.subscribedChannels.indexOf(channelId);
      if (index > -1) {
        state.subscribedChannels.splice(index, 1);
      } else {
        state.subscribedChannels.push(channelId);
      }
    },
  },
});

export const {
  login,
  logOut,
  setSubscribedChannels,
  toggleSubscribedChannel,
} = authSlice.actions;
export default authSlice.reducer;

