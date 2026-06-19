import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "@/api/axiosInstance";
import "./playlistPage.css";
import { useSelector } from "react-redux";
import AddVideosToExistingPlaylistModal from "../../components/AddVideosToExistingPlaylistModal.jsx";
import VideoMenu from "../../components/VideoMenu/VideoMenu.jsx";
import PlaylistSelectionModal from "../../components/PlaylistSelectionModal.jsx";
import LoginPrompt from "../../components/LoginPrompt.jsx";
import useVideoMenuActions from "../../hooks/useVideoMenuActions.js";
import EditPlaylistModal from "../../components/EditPlaylistModal.jsx";
import { useToast } from "../../components/Toast/Toast.jsx";

export default function PlaylistPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = useSelector((s) => s.auth.userData);
  const menu = useVideoMenuActions(navigate);
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        const res = await axiosInstance.get(`/v1/playlist/${id}`, {
          withCredentials: true,
        });
        const data = res.data?.data || res.data?.playlist || res.data;
        setPlaylist(data);
      } catch (err) {
        console.error("Failed to load playlist:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylist();
  }, [id]);

  const refreshPlaylist = async () => {
    try {
      const res = await axiosInstance.get(`/v1/playlist/${id}`, {
        withCredentials: true,
      });
      const data = res.data?.data || res.data?.playlist || res.data;
      setPlaylist(data);
    } catch (err) {
      console.error("Failed to refresh playlist:", err);
    }
  };


  if (loading) return <div className="playlist-page"><h3>Loading playlist...</h3></div>;
  if (!playlist) return <div className="playlist-page"><h3>Playlist not found.</h3></div>;

  return (
    <div className="playlist-page">
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
      <div className="playlist-header">
        <h1>{playlist.name || "Untitled Playlist"}</h1>
        <p className="playlist-desc">{playlist.description || ""}</p>
        {currentUser?._id && playlist?.owner && String(currentUser._id) === String(playlist.owner) && (
          <div className="playlist-owner-actions">
            <button type="button" onClick={() => setShowAddModal(true)}>
              Add videos
            </button>
            <button type="button" onClick={() => setShowEditModal(true)}>
              Edit playlist
            </button>
          </div>
        )}
      </div>

      <div className="playlist-videos">
        {Array.isArray(playlist.videos) && playlist.videos.length > 0 ? (
          playlist.videos.map((v) => (
            <div key={v._id || v} className="playlist-video-card">
              <VideoMenu
                video={v}
                onAddToPlaylist={menu.handleAddToPlaylist}
                onWatchLaterToggle={menu.handleWatchLater}
                onAboutCreator={menu.handleAboutCreator}
                onNotInterested={menu.handleNotInterested}
              />
              <img src={v.thumbnail || "/default-thumb.svg"} alt={v.title} />
              <div className="meta">
                <div className="title">{v.title || "Untitled"}</div>
                <button onClick={() => navigate(`/video/${v._id || v}`)}>View</button>
              </div>
            </div>
          ))
        ) : (
          <p>No videos in this playlist.</p>
        )}
      </div>

      <AddVideosToExistingPlaylistModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        playlistId={playlist?._id}
        currentUserId={currentUser?._id}
        onVideoAdded={refreshPlaylist}
      />
      <EditPlaylistModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        playlistId={playlist?._id}
        currentUserId={currentUser?._id}
        onUpdated={(updated, message) => {
          if (updated?._id) {
            setPlaylist((prev) => ({ ...prev, ...updated }));
          } else {
            refreshPlaylist();
          }
          showToast(message || "Playlist updated");
        }}
      />
    </div>
  );
}



