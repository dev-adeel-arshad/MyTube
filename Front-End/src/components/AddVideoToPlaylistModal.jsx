import { useEffect, useState } from "react";
import axios from "axios";
import "./AddVideoToPlaylistModal.css";

export default function AddVideoToPlaylistModal({
  isOpen,
  onClose,
  playlistId,
  currentUserId,
  onVideoAdded,
}) {
  const [videos, setVideos] = useState([]);
  const [selectedVideoIds, setSelectedVideoIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen || !currentUserId) return;
    (async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `/api/v1/videos?owner=${currentUserId}`,
          { withCredentials: true }
        );
        setVideos(response.data?.videos || []);
      } catch (error) {
        console.error("Failed loading videos", error);
      } finally {
        setLoading(false);
      }
    })();
  }, [isOpen, currentUserId]);

  const toggleSelection = (videoId) => {
    setSelectedVideoIds((previous) =>
      previous.includes(videoId)
        ? previous.filter((id) => id !== videoId)
        : [...previous, videoId]
    );
  };

  const handleSubmit = async () => {
    if (!playlistId || selectedVideoIds.length === 0) return;
    try {
      setSubmitting(true);
      for (const videoId of selectedVideoIds) {
        await axios.patch(
          `/api/v1/playlist/add/${videoId}/${playlistId}`,
          {},
          { withCredentials: true }
        );
      }
      onVideoAdded?.();
      onClose?.();
    } catch (error) {
      console.error("Failed adding videos to playlist", error);
      alert("Failed adding videos to playlist");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="add-video-modal-overlay" onClick={onClose}>
      <div className="add-video-modal-container" onClick={(event) => event.stopPropagation()}>
        <button className="modal-close-btn" type="button" onClick={onClose}>
          ×
        </button>

        <h2>Add Videos to Playlist</h2>

        {loading ? (
          <p>Loading videos...</p>
        ) : videos.length === 0 ? (
          <p>No videos available.</p>
        ) : (
          <div className="add-video-grid">
            {videos.map((video) => (
              <div
                key={video._id}
                className={`add-video-card ${selectedVideoIds.includes(video._id) ? "selected" : ""}`}
                onClick={() => toggleSelection(video._id)}
              >
                <img src={video.thumbnail} alt={video.title} className="video-thumbnail" />
                <div className="video-details">
                  <h4>{video.title}</h4>
                  <p>{video.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="modal-actions">
          <button type="button" className="btn-cancel" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-add"
            onClick={handleSubmit}
            disabled={submitting || selectedVideoIds.length === 0}
          >
            {submitting ? "Adding..." : `Add ${selectedVideoIds.length} Video(s)`}
          </button>
        </div>
      </div>
    </div>
  );
}

