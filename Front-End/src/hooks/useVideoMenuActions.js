import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import axiosInstance from "../api/axiosInstance.js";
import { hideVideo } from "../features/videosSlice.js";

export default function useVideoMenuActions(navigate, loginPromptState) {
  const isLoggedIn = useSelector((state) => state.auth.status);
  const dispatch = useDispatch();

  const [playlistVideoId, setPlaylistVideoId] = useState(null);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [internalShowLoginPrompt, setInternalShowLoginPrompt] = useState(false);

  const showLoginPrompt = loginPromptState?.show ?? internalShowLoginPrompt;
  const setShowLoginPrompt = loginPromptState?.set ?? setInternalShowLoginPrompt;

  const handleAddToPlaylist = (video) => {
    if (!isLoggedIn) {
      setShowLoginPrompt(true);
      return;
    }
    setPlaylistVideoId(video?._id || null);
    setShowPlaylistModal(true);
  };

  const handleWatchLater = async (video) => {
    if (!isLoggedIn) {
      setShowLoginPrompt(true);
      return;
    }

    try {
      await axiosInstance.post(`/watch-later/${video._id}`);
    } catch (error) {
      console.error("Failed to add to watch later", error);
    }
  };

  const handleAboutCreator = (video) => {
    const username = video?.ownerDetails?.username || video?.owner?.username;
    if (username) {
      navigate(`/profile/${username}`);
    }
  };

  const handleNotInterested = (video) => {
    if (!video?._id) return;
    dispatch(hideVideo(video._id));
  };

  return {
    playlistVideoId,
    showPlaylistModal,
    setShowPlaylistModal,
    showLoginPrompt,
    setShowLoginPrompt,
    handleAddToPlaylist,
    handleWatchLater,
    handleAboutCreator,
    handleNotInterested,
  };
}
