import { useEffect, useState } from "react";
import axios from "axios";
import AddVideosToExistingPlaylistModal from "./AddVideosToExistingPlaylistModal.jsx";
import "./EditMediaModal.css";

export default function EditPlaylistModal({
  isOpen,
  onClose,
  playlistId,
  currentUserId,
  onUpdated,
}) {
  const [playlist, setPlaylist] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchPlaylist = async () => {
    if (!playlistId) return;
    setLoading(true);
    try {
      const res = await axios.get(`/api/v1/playlist/${playlistId}`, {
        withCredentials: true,
      });
      const data = res.data?.data || res.data?.playlist || res.data;
      setPlaylist(data);
      setName(data?.name || "");
      setDescription(data?.description || "");
    } catch (err) {
      setError("Failed to load playlist");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    setError("");
    fetchPlaylist();
  }, [isOpen, playlistId]);

  const handleClose = () => {
    if (saving) return;
    setError("");
    onClose?.();
  };

  const handleSave = async () => {
    if (!playlistId) return;
    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    try {
      setSaving(true);
      setError("");
      const res = await axios.patch(
        `/api/v1/playlist/${playlistId}`,
        { name: name.trim(), description: description.trim() },
        { withCredentials: true }
      );
      const updated = res.data?.playlist || res.data?.data || res.data;
      if (updated?._id) {
        setPlaylist((prev) => ({ ...prev, ...updated }));
        onUpdated?.(null, "Playlist updated");
        handleClose();
      }
    } catch (err) {
      setError("Failed to update playlist");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveVideo = async (videoId) => {
    if (!playlistId || !videoId) return;
    try {
      setSaving(true);
      await axios.patch(
        `/api/v1/playlist/remove/${videoId}/${playlistId}`,
        {},
        { withCredentials: true }
      );
      await fetchPlaylist();
      onUpdated?.(null, "Video removed");
    } catch (err) {
      setError("Failed to remove video");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="edit-modal-overlay" onClick={handleClose}>
      <div className="edit-modal edit-modal-wide" onClick={(event) => event.stopPropagation()}>
        <div className="edit-modal-header">
          <h3>Edit Playlist</h3>
          <button type="button" className="edit-modal-close" onClick={handleClose}>
            x
          </button>
        </div>
        <div className="edit-modal-body">
          {error && <div className="edit-modal-error">{error}</div>}
          {loading ? (
            <div className="edit-modal-loading">Loading playlist...</div>
          ) : (
            <>
              <label className="edit-modal-field">
                Name
                <input value={name} onChange={(e) => setName(e.target.value)} />
              </label>
              <label className="edit-modal-field">
                Description
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
              </label>
              <div className="edit-modal-section">
                <div className="edit-modal-section-header">
                  <h4>Videos</h4>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setShowAddModal(true)}
                  >
                    Add videos
                  </button>
                </div>
                {playlist?.videos?.length ? (
                  <div className="edit-modal-video-list">
                    {playlist.videos.map((video) => (
                      <div key={video._id || video} className="edit-modal-video-item">
                        <img
                          src={video.thumbnail || "/default-thumb.svg"}
                          alt={video.title || "Video"}
                        />
                        <div className="edit-modal-video-meta">
                          <div className="title">{video.title || "Untitled"}</div>
                        </div>
                        <button
                          type="button"
                          className="btn-danger"
                          onClick={() => handleRemoveVideo(video._id || video)}
                          disabled={saving}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="edit-modal-empty">No videos in this playlist.</div>
                )}
              </div>
            </>
          )}
        </div>
        <div className="edit-modal-actions">
          <button type="button" className="btn-secondary" onClick={handleClose} disabled={saving}>
            Close
          </button>
          <button type="button" className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      <AddVideosToExistingPlaylistModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        playlistId={playlistId}
        currentUserId={currentUserId}
        onVideoAdded={() => {
          setShowAddModal(false);
          fetchPlaylist();
          onUpdated?.(null, "Videos added");
        }}
      />
    </div>
  );
}
