import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance.js";
import PlaylistMultiStepModal from "./PlaylistMultiStepModal";
import "./PlaylistSelectionModal.css";

export default function PlaylistSelectionModal({ isOpen, onClose, videoId, onAdded }) {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get("/playlist/user");
        setPlaylists(response.data?.data || []);
      } catch (error) {
        console.error("Failed fetching playlists", error);
      } finally {
        setLoading(false);
      }
    })();
  }, [isOpen]);

  const addToPlaylist = async (playlistId) => {
    try {
      await axiosInstance.patch(
        `/playlist/add/${videoId}/${playlistId}`,
        {}
      );
      onAdded?.();
      onClose?.();
    } catch (error) {
      console.error("Failed adding to playlist", error);
      alert("Failed adding to playlist");
    }
  };

  const handleQuickCreate = async () => {
    const trimmedName = newPlaylistName.trim();
    if (!trimmedName) {
      alert("Playlist name is required");
      return;
    }

    try {
      setSubmitting(true);
      const createRes = await axiosInstance.post(
        "/playlist/",
        { name: trimmedName, description: "No description" }
      );

      const createdPlaylist =
        createRes.data?.playlist || createRes.data?.data || createRes.data;
      const playlistId = createdPlaylist?._id;

      if (playlistId && videoId) {
        await axiosInstance.patch(
          `/playlist/add/${videoId}/${playlistId}`,
          {}
        );
      }

      setNewPlaylistName("");
      onAdded?.();
      onClose?.();
    } catch (error) {
      console.error("Failed creating playlist", error);
      alert("Failed creating playlist");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="playlist-select-overlay" onClick={onClose}>
      <div className="playlist-select-container" onClick={(event) => event.stopPropagation()}>
        <button className="modal-close-btn" type="button" onClick={onClose}>
          ×
        </button>

        <h3>Select a Playlist</h3>

        <div className="quick-create-row">
          <input
            type="text"
            value={newPlaylistName}
            onChange={(e) => setNewPlaylistName(e.target.value)}
            placeholder="New playlist name"
          />
          <button
            type="button"
            className="btn-primary"
            onClick={handleQuickCreate}
            disabled={submitting}
          >
            {submitting ? "Creating..." : "Create"}
          </button>
        </div>

        {loading ? (
          <p>Loading playlists...</p>
        ) : playlists.length === 0 ? (
          <p>No playlists found.</p>
        ) : (
          <div className="playlist-list">
            {playlists.map((playlist) => (
              <div key={playlist._id} className="playlist-item">
                <div className="playlist-info">
                  <img
                    src={
                      playlist.thumbnail ||
                      playlist.videos?.[0]?.thumbnail ||
                      "/default-thumb.svg"
                    }
                    alt={playlist.name}
                  />
                  <div>
                    <strong>{playlist.name}</strong>
                    <div className="muted">{playlist.videos?.length || 0} videos</div>
                  </div>
                </div>
                <button type="button" onClick={() => addToPlaylist(playlist._id)}>
                  Add
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn-primary" onClick={() => setCreating(true)}>
            Create new playlist
          </button>
        </div>

        {creating && (
          <PlaylistMultiStepModal
            isOpen={creating}
            onClose={() => setCreating(false)}
            onPlaylistCreated={() => setCreating(false)}
            currentUserId={null}
          />
        )}
      </div>
    </div>
  );
}

