import { useEffect, useState } from "react";
import axiosInstance from "@/api/axiosInstance";
import { useNavigate } from "react-router-dom";
import "../libraryPage/LibraryPage.css";
import "./WatchLaterPage.css";
import VideoMenu from "../../components/VideoMenu/VideoMenu.jsx";
import PlaylistSelectionModal from "../../components/PlaylistSelectionModal.jsx";
import LoginPrompt from "../../components/LoginPrompt.jsx";
import useVideoMenuActions from "../../hooks/useVideoMenuActions.js";

export default function WatchLaterPage() {
  const [watchLater, setWatchLater] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const menu = useVideoMenuActions(navigate);

  useEffect(() => {
    fetchWatchLater();
  }, []);

  const fetchWatchLater = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/v1/watch-later`, {
        withCredentials: true,
      });
      const watchLaterData = Array.isArray(res.data?.data) ? res.data.data : [];
      setWatchLater(watchLaterData);
    } catch (err) {
      console.error("Failed to load watch later:", err);
      setWatchLater([]);
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
      <div className="liked-page-header">
        <h1>Watch Later</h1>
        {!loading && watchLater.length > 0 && (
          <span className="liked-count">{watchLater.length} video{watchLater.length !== 1 ? "s" : ""}</span>
        )}
      </div>
      {loading && <p className="loading">Loading...</p>}
      <div className="liked-videos-grid">
        {watchLater.length === 0 && !loading ? (
          <div className="liked-empty">
            <p>No videos in Watch Later.</p>
          </div>
        ) : (
          watchLater.map((video) => (
            <div
              key={video._id}
              className="vc-card"
              onClick={() => navigate(`/video/${video._id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === "Enter") navigate(`/video/${video._id}`); }}
            >
              <div className="vc-thumb-wrap">
                <img src={video.thumbnail || "/default-thumb.svg"} alt={video.title} className="vc-thumb" />
                <div className="vc-menu" onClick={(e) => e.stopPropagation()}>
                  <VideoMenu
                    video={video}
                    onAddToPlaylist={menu.handleAddToPlaylist}
                    onWatchLaterToggle={menu.handleWatchLater}
                    onAboutCreator={menu.handleAboutCreator}
                    onNotInterested={menu.handleNotInterested}
                  />
                </div>
              </div>
              <div className="vc-info">
                <div className="vc-avatar">
                  {(video.ownerDetails?.avatar || video.owner?.avatar) ? (
                    <img src={video.ownerDetails?.avatar || video.owner?.avatar} alt="avatar" />
                  ) : (
                    <span>{(video.ownerDetails?.username || video.owner?.username || "?")[0].toUpperCase()}</span>
                  )}
                </div>
                <div className="vc-meta">
                  <h4 className="vc-title">{video.title}</h4>
                  <p className="vc-channel">{video.ownerDetails?.username || video.owner?.username || "Unknown"}</p>
                  <p className="vc-date">{video.createdAt ? new Date(video.createdAt).toLocaleDateString() : ""}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}




