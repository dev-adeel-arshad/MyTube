import { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance.js";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setSubscribedChannels } from "../../features/authSlice.js";
import VideoMenu from "../../components/VideoMenu/VideoMenu.jsx";
import PlaylistSelectionModal from "../../components/PlaylistSelectionModal.jsx";
import LoginPrompt from "../../components/LoginPrompt.jsx";
import useVideoMenuActions from "../../hooks/useVideoMenuActions.js";
import "./SubscriptionsPage.css";

export default function SubscriptionsPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const menu = useVideoMenuActions(navigate);
  const currentUser = useSelector((s) => s.auth.userData);
  const subscribedChannelIds = useSelector((s) => s.auth.subscribedChannels || []);
  const [videos, setVideos] = useState([]);
  
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showChannelsModal, setShowChannelsModal] = useState(false);
  const [hasFetchedSubs, setHasFetchedSubs] = useState(false);

  useEffect(() => {
    if (subscribedChannelIds.length > 0) {
      fetchSubscribedChannelsAndVideos(subscribedChannelIds);
      setHasFetchedSubs(true);
      return;
    }

    if (currentUser?._id && !hasFetchedSubs) {
      fetchSubscribedChannelsFromApi(currentUser._id);
      return;
    }

    setVideos([]);
    setChannels([]);
  }, [subscribedChannelIds, currentUser?._id, hasFetchedSubs]);

  const fetchSubscribedChannelsFromApi = async (userId) => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/channel/u/${userId}`);
      const channelsList = res.data?.subscribedChannels || [];
      const ids = channelsList.map((c) => String(c.channelId));
      dispatch(setSubscribedChannels(ids));
      if (ids.length > 0) {
        await fetchSubscribedChannelsAndVideos(ids);
      }
    } catch (error) {
      setVideos([]);
      setChannels([]);
    } finally {
      setHasFetchedSubs(true);
      setLoading(false);
    }
  };

  const fetchSubscribedChannelsAndVideos = async (channelIds) => {
    try {
      setLoading(true);
      const channelsList = [];
      const allVideos = [];

      for (const channelId of channelIds) {
        try {
          const channelRes = await axiosInstance.get(`/users/${channelId}`);
          const channelData = channelRes.data?.data || channelRes.data;
          if (channelData && channelData._id) {
            channelsList.push(channelData);
          }

          const videosRes = await axiosInstance.get(
            `/videos?owner=${channelId}&limit=1000`
          );
          const channelVideos = videosRes.data?.videos || [];
          allVideos.push(...channelVideos);

          
        } catch (err) {
          console.log("Error fetching channel data", channelId, err);
        }
      }

      setChannels(channelsList);
      setVideos(allVideos);
    } catch (error) {
      setVideos([]);
      setChannels([]);
      setChannels([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="subscriptions-page">
      <LoginPrompt
        isOpen={menu.showLoginPrompt}
        message="You must be logged in to perform this action."
        onClose={() => menu.setShowLoginPrompt(false)}
      />
      <div className="subscriptions-header">
        <button
          className="channels-list-btn"
          onClick={() => setShowChannelsModal(true)}
        >
          View Subscribed Channels ({channels.length})
        </button>
        <h1>Subscriptions</h1>
      </div>

      {showChannelsModal && (
        <>
          <div className="modal-overlay" onClick={() => setShowChannelsModal(false)} />
          <div className="channels-modal">
            <div className="modal-header">
              <h2>Subscribed Channels</h2>
              <button className="close-btn" onClick={() => setShowChannelsModal(false)}>
                Close
              </button>
            </div>
            <div className="channels-list">
              {channels.length > 0 ? (
                channels.map((channel) => (
                  <div
                    key={channel._id}
                    className="channel-item"
                    onClick={() => {
                      navigate(`/profile/${channel.username}`);
                      setShowChannelsModal(false);
                    }}
                  >
                    <img
                      src={channel.avatar || "/default-avatar.svg"}
                      alt={channel.fullname}
                      className="channel-avatar-small"
                    />
                    <div className="channel-info">
                      <h4>{channel.fullname || channel.username}</h4>
                      <p>@{channel.username}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ padding: "20px", color: "var(--text-secondary)" }}>
                  No subscriptions
                </p>
              )}
            </div>
          </div>
        </>
      )}

      {loading && <p style={{ textAlign: "center", padding: "40px" }}>Loading...</p>}

      {!loading && videos.length === 0 && channels.length === 0 && (
        <p style={{ textAlign: "center", padding: "40px", color: "var(--text-secondary)" }}>
          No subscriptions yet. Subscribe to channels to see their videos here.
        </p>
      )}

      {!loading && videos.length === 0 && channels.length > 0 && (
        <p style={{ textAlign: "center", padding: "40px", color: "var(--text-secondary)" }}>
          Your subscribed channels have no videos yet.
        </p>
      )}

      {!loading && videos.length > 0 && (
        <div className="subscriptions-grid">
          {videos.map((item) => (
            <div
              key={item._id}
              className="video-card"
              onClick={() => navigate(`/video/${item._id}`)}
            >
              {item.contentType === "video" && (
                <VideoMenu
                  video={item}
                  onAddToPlaylist={menu.handleAddToPlaylist}
                  onWatchLaterToggle={menu.handleWatchLater}
                  onAboutCreator={menu.handleAboutCreator}
                  onNotInterested={menu.handleNotInterested}
                />
              )}
              <img
                src={item.thumbnail || "/default-thumb.svg"}
                alt={item.title}
                className="video-thumbnail"
              />
              <div className="video-info">
                <h3>{item.title}</h3>
                <p className="channel-name">
                  By:{" "}
                  <span
                    className="creator-link"
                    onClick={(e) => {
                      e.stopPropagation();
                      const username =
                        item.ownerDetails?.username || item.owner?.username || "";
                      if (username) navigate(`/profile/${username}`);
                    }}
                  >
                    {item.ownerDetails?.username || item.owner?.username || "Unknown"}
                  </span>
                </p>
                {item.contentType === "video" && typeof item.views === "number" && (
                  <small>{item.views.toLocaleString()} views</small>
                )}
                <small>{new Date(item.createdAt).toLocaleDateString()}</small>
              </div>
            </div>
          ))}
        </div>
      )}

      <PlaylistSelectionModal
        isOpen={menu.showPlaylistModal}
        onClose={() => menu.setShowPlaylistModal(false)}
        videoId={menu.playlistVideoId}
        onAdded={() => menu.setShowPlaylistModal(false)}
      />
    </div>
  );

}
