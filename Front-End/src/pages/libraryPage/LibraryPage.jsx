import { useEffect, useState } from "react";
import axiosInstance from "@/api/axiosInstance";
import "./LibraryPage.css";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import VideoMenu from "../../components/VideoMenu/VideoMenu.jsx";
import PlaylistSelectionModal from "../../components/PlaylistSelectionModal.jsx";
import LoginPrompt from "../../components/LoginPrompt.jsx";
import useVideoMenuActions from "../../hooks/useVideoMenuActions.js";

export default function LibraryPage() {
  const navigate = useNavigate();
  const currentUser = useSelector((s) => s.auth.userData);
  const menu = useVideoMenuActions(navigate);
  const [watchHistory, setWatchHistory] = useState([]);
  const [watchLater, setWatchLater] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [likedVideos, setLikedVideos] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!currentUser?._id) {
      navigate("/login");
      return;
    }
    fetchLibraryData();
  }, [currentUser?._id, navigate]);

  const fetchLibraryData = async () => {
    try {
      setLoading(true);

      const [historyRes, watchLaterRes, playlistRes, likedRes] = await Promise.all([
        axiosInstance
          .get("/v1/users/history")
          .catch((err) => {
            console.error("History fetch error:", err);
            return { data: { data: [] } };
          }),
        axiosInstance
          .get("/v1/watch-later")
          .catch((err) => {
            console.error("Watch later fetch error:", err);
            return { data: { data: [] } };
          }),
        axiosInstance
          .get("/v1/playlist/user")
          .catch((err) => {
            console.error("Playlists fetch error:", err);
            return { data: { data: [] } };
          }),
        axiosInstance
          .get("/v1/like/videos")
          .catch((err) => {
            console.error("Liked videos fetch error:", err);
            return { data: { data: [] } };
          }),
      ]);

      const historyPayload = historyRes.data?.data;
      let historyData = [];
      if (Array.isArray(historyPayload)) {
        historyData = historyPayload;
      } else if (historyPayload?.items) {
        historyData = historyPayload.items;
      } else if (historyPayload?.grouped) {
        const grouped = historyPayload.grouped;
        historyData = [
          ...(grouped.today || []),
          ...(grouped.yesterday || []),
          ...(grouped.older || []),
        ].map((entry) => entry.video || entry.videoId).filter(Boolean);
      } else if (Array.isArray(historyRes.data)) {
        historyData = historyRes.data;
      }
      const watchLaterData = Array.isArray(watchLaterRes.data?.data)
        ? watchLaterRes.data.data
        : [];
      const playlistsPayload = playlistRes.data?.data || playlistRes.data?.playlists || [];
      const playlistsData = Array.isArray(playlistsPayload) ? playlistsPayload : [];
      let likedData = [];
      if (Array.isArray(likedRes.data?.data)) {
        likedData = likedRes.data.data.map((item) => item.video || item);
      }

      setWatchHistory([...historyData].sort((a, b) =>
        new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0)
      ));
      setWatchLater([...watchLaterData].sort((a, b) =>
        new Date(b.createdAt || b.updatedAt || 0) - new Date(a.createdAt || a.updatedAt || 0)
      ));
      setPlaylists(playlistsData);
      setLikedVideos([...likedData].sort((a, b) =>
        new Date(b.createdAt || b.updatedAt || 0) - new Date(a.createdAt || a.updatedAt || 0)
      ));
    } catch (error) {
      console.error("Error fetching library data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="library-page">
      <LoginPrompt
        isOpen={menu.showLoginPrompt}
        message="You must be logged in to perform this action."
        onClose={() => menu.setShowLoginPrompt(false)}
      />
      <PlaylistSelectionModal
        isOpen={menu.showPlaylistModal}
        onClose={() => menu.setShowPlaylistModal(false)}
        videoId={menu.playlistVideoId}
        onAdded={() => menu.setShowPlaylistModal(false)}
      />
      <div className="library-header">
        <h1>Your Library</h1>
      </div>

      {loading && <p>Loading...</p>}

      <div className="library-section">
        <div className="library-section-header">
          <h3>History</h3>
          {watchHistory.length > 0 && (
            <button className="view-all-btn" onClick={() => navigate("/history")}>
              View all
            </button>
          )}
        </div>
        <div className="library-grid">
          {watchHistory.length === 0 ? (
            <p className="empty-msg">No history yet.</p>
          ) : (
            watchHistory.slice(0, 4).map((video) => (
              <div
                key={video._id}
                className="library-card"
                onClick={() => navigate(`/video/${video._id}`)}
              >
                <VideoMenu
                  video={video}
                  onAddToPlaylist={menu.handleAddToPlaylist}
                  onWatchLaterToggle={menu.handleWatchLater}
                  onAboutCreator={menu.handleAboutCreator}
                  onNotInterested={menu.handleNotInterested}
                />
                <img
                  src={video.thumbnail || "/default-thumb.svg"}
                  alt={video.title}
                />
                <div className="library-card-info">
                  <h4>{video.title}</h4>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="library-section">
        <div className="library-section-header">
          <h3>Liked Videos</h3>
          {likedVideos.length > 0 && (
            <button className="view-all-btn" onClick={() => navigate("/liked-videos")}>
              View all
            </button>
          )}
        </div>
        <div className="library-grid">
          {likedVideos.length === 0 ? (
            <p className="empty-msg">No liked videos yet.</p>
          ) : (
            likedVideos.slice(0, 4).map((video) => (
              <div
                key={video._id}
                className="library-card"
                onClick={() => navigate(`/video/${video._id}`)}
              >
                <VideoMenu
                  video={video}
                  onAddToPlaylist={menu.handleAddToPlaylist}
                  onWatchLaterToggle={menu.handleWatchLater}
                  onAboutCreator={menu.handleAboutCreator}
                  onNotInterested={menu.handleNotInterested}
                />
                <img
                  src={video.thumbnail || "/default-thumb.svg"}
                  alt={video.title}
                />
                <div className="library-card-info">
                  <h4>{video.title}</h4>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="library-section">
        <div className="library-section-header">
          <h3>Playlists</h3>
          {playlists.length > 0 && (
            <button className="view-all-btn" onClick={() => navigate("/playlists")}>
              View all
            </button>
          )}
        </div>
        <div className="library-grid">
          {playlists.length === 0 ? (
            <p className="empty-msg">No playlists yet.</p>
          ) : (
            playlists.slice(0, 4).map((playlist) => (
              <div
                key={playlist._id}
                className="library-card"
                onClick={() => navigate(`/playlist/${playlist._id}`)}
              >
                <img
                  src={
                    playlist.thumbnail ||
                    playlist.videos?.[0]?.thumbnail ||
                    "/default-thumb.svg"
                  }
                  alt={playlist.name}
                />
                <div className="library-card-info">
                  <h4>{playlist.name}</h4>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="library-section">
        <div className="library-section-header">
          <h3>Watch Later</h3>
          {watchLater.length > 0 && (
            <button className="view-all-btn" onClick={() => navigate("/watch-later")}>
              View all
            </button>
          )}
        </div>
        <div className="library-grid">
          {watchLater.length === 0 ? (
            <p className="empty-msg">No videos in Watch Later.</p>
          ) : (
            watchLater.slice(0, 4).map((video) => (
              <div
                key={video._id}
                className="library-card"
                onClick={() => navigate(`/video/${video._id}`)}
              >
                <VideoMenu
                  video={video}
                  onAddToPlaylist={menu.handleAddToPlaylist}
                  onWatchLaterToggle={menu.handleWatchLater}
                  onAboutCreator={menu.handleAboutCreator}
                  onNotInterested={menu.handleNotInterested}
                />
                <img
                  src={video.thumbnail || "/default-thumb.svg"}
                  alt={video.title}
                />
                <div className="library-card-info">
                  <h4>{video.title}</h4>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}



