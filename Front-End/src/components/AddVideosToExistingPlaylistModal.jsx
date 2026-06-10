import { useEffect, useState } from "react";
import axios from "axios";
import "./AddVideosToExistingPlaylistModal.css";
import { VIDEO_CATEGORIES } from "../utils/videoCategories.js";

export default function AddVideosToExistingPlaylistModal({
  isOpen,
  onClose,
  playlistId,
  currentUserId,
  onVideoAdded,
}) {
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState(null);
  const [availableVideos, setAvailableVideos] = useState([]);
  const [selectedVideoIds, setSelectedVideoIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [newVideoTitle, setNewVideoTitle] = useState("");
  const [newVideoDesc, setNewVideoDesc] = useState("");
  const [newVideoCategory, setNewVideoCategory] = useState("Other");
  const [newVideoFile, setNewVideoFile] = useState(null);
  const [newVideoThumbnail, setNewVideoThumbnail] = useState(null);

  useEffect(() => {
    if (!isOpen || mode !== "select" || !currentUserId) return;
    (async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `/api/v1/videos?owner=${currentUserId}`,
          { withCredentials: true }
        );
        setAvailableVideos(response.data?.videos || []);
      } catch (error) {
        console.error("Failed loading videos", error);
      } finally {
        setLoading(false);
      }
    })();
  }, [isOpen, mode, currentUserId]);

  const toggleSelection = (videoId) => {
    setSelectedVideoIds((previous) =>
      previous.includes(videoId)
        ? previous.filter((id) => id !== videoId)
        : [...previous, videoId]
    );
  };

  const handleSubmit = async () => {
    if (!playlistId) {
      alert("Please select a playlist first");
      return;
    }

    try {
      setSubmitting(true);

      if (mode === "upload") {
        if (!newVideoTitle || !newVideoFile || !newVideoThumbnail) {
          alert("Please provide title, video file, and thumbnail");
          return;
        }

        const formData = new FormData();
        formData.append("title", newVideoTitle);
        formData.append("description", newVideoDesc);
        formData.append("category", newVideoCategory);
        formData.append("videoFile", newVideoFile);
        formData.append("thumbnail", newVideoThumbnail);

        const uploadResponse = await axios.post(
          "/api/v1/videos/",
          formData,
          { withCredentials: true }
        );

        const videoId =
          uploadResponse.data?.video?._id ||
          uploadResponse.data?.data?._id ||
          uploadResponse.data?._id;

        if (videoId) {
          await axios.patch(
            `/api/v1/playlist/add/${videoId}/${playlistId}`,
            {},
            { withCredentials: true }
          );
        }
      } else {
        if (selectedVideoIds.length === 0) {
          alert("Please select at least one video");
          return;
        }

        for (const videoId of selectedVideoIds) {
          await axios.patch(
            `/api/v1/playlist/add/${videoId}/${playlistId}`,
            {},
            { withCredentials: true }
          );
        }
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

  const resetAndClose = () => {
    setStep(1);
    setMode(null);
    setSelectedVideoIds([]);
    setNewVideoTitle("");
    setNewVideoDesc("");
    setNewVideoCategory("Other");
    setNewVideoFile(null);
    setNewVideoThumbnail(null);
    onClose?.();
  };

  if (!isOpen) return null;

  return (
    <div className="add-existing-modal-overlay" onClick={resetAndClose}>
      <div className="add-existing-modal-container" onClick={(event) => event.stopPropagation()}>
        <button className="modal-close-btn" type="button" onClick={resetAndClose}>
          ×
        </button>

        {step === 1 && (
          <div className="step-content">
            <h2>Add Videos to Playlist</h2>
            <p>Choose how you want to add videos.</p>
            <div className="mode-options">
              <div className="mode-card" onClick={() => { setMode("upload"); setStep(2); }}>
                <h3>Upload New Video</h3>
              </div>
              <div className="mode-card" onClick={() => { setMode("select"); setStep(2); }}>
                <h3>Select Existing</h3>
              </div>
            </div>
          </div>
        )}

        {step === 2 && mode === "upload" && (
          <div className="step-content upload-step">
            <div className="upload-step-header">
              <div className="upload-step-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
              </div>
              <div>
                <h2>Upload New Video</h2>
                <p className="upload-step-sub">This video will be uploaded and added to your playlist.</p>
              </div>
            </div>

            <div className="upload-form-grid">
              <div className="form-group">
                <label htmlFor="upl-title">Video Title <span className="required">*</span></label>
                <input
                  id="upl-title"
                  type="text"
                  value={newVideoTitle}
                  onChange={(e) => setNewVideoTitle(e.target.value)}
                  placeholder="Give your video a title…"
                />
              </div>

              <div className="form-group">
                <label htmlFor="upl-cat">Category</label>
                <select id="upl-cat" value={newVideoCategory} onChange={(e) => setNewVideoCategory(e.target.value)}>
                  {VIDEO_CATEGORIES.filter((item) => item !== "All").map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="upl-desc">Description</label>
              <textarea
                id="upl-desc"
                value={newVideoDesc}
                onChange={(e) => setNewVideoDesc(e.target.value)}
                placeholder="Describe your video…"
                rows={3}
              />
            </div>

            <div className="upload-file-grid">
              <div className="form-group">
                <label>Video File <span className="required">*</span></label>
                <label className="file-drop-zone" htmlFor="upl-video">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  <span className="file-drop-name">{newVideoFile ? newVideoFile.name : "Click to select video"}</span>
                  <small>MP4, MOV, AVI…</small>
                </label>
                <input id="upl-video" type="file" accept="video/*" onChange={(e) => setNewVideoFile(e.target.files?.[0] || null)} className="hidden-file-input" />
              </div>

              <div className="form-group">
                <label>Thumbnail <span className="required">*</span></label>
                <label className="file-drop-zone" htmlFor="upl-thumb">
                  {newVideoThumbnail ? (
                    <img
                      src={URL.createObjectURL(newVideoThumbnail)}
                      alt="thumbnail preview"
                      className="thumb-preview-img"
                    />
                  ) : (
                    <>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                        <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>
                      </svg>
                      <span className="file-drop-name">Click to select image</span>
                      <small>PNG, JPG, WEBP…</small>
                    </>
                  )}
                </label>
                <input id="upl-thumb" type="file" accept="image/*" onChange={(e) => setNewVideoThumbnail(e.target.files?.[0] || null)} className="hidden-file-input" />
              </div>
            </div>

            <div className="form-actions">
              <button className="btn-secondary" type="button" onClick={() => setStep(1)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                Back
              </button>
              <button className="btn-primary" type="button" onClick={handleSubmit} disabled={submitting}>
                {submitting ? (
                  <><span className="btn-spinner" /> Uploading…</>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    Upload &amp; Add
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {step === 2 && mode === "select" && (
          <div className="step-content">
            <h2>Select Videos</h2>
            {loading ? (
              <p>Loading videos...</p>
            ) : (
              <div className="videos-grid">
                {availableVideos.map((video) => (
                  <div
                    key={video._id}
                    className={`video-card ${selectedVideoIds.includes(video._id) ? "selected" : ""}`}
                    onClick={() => toggleSelection(video._id)}
                  >
                    <img
                      src={video.thumbnail || "/default-thumb.svg"}
                      alt={video.title}
                      className="video-thumbnail"
                    />
                    <div className="video-info">
                      <h4>{video.title}</h4>
                      <p>{video.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="form-actions">
              <button className="btn-secondary" type="button" onClick={() => setStep(1)}>Back</button>
              <button
                className="btn-primary"
                type="button"
                onClick={handleSubmit}
                disabled={submitting || selectedVideoIds.length === 0}
              >
                {submitting ? "Adding..." : `Add ${selectedVideoIds.length} Video(s)`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

