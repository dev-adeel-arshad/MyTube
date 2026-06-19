import { useState, useEffect } from "react";
import axiosInstance from "@/api/axiosInstance";
import "./PlaylistMultiStepModal.css";
import { VIDEO_CATEGORIES } from "../utils/videoCategories.js";
import { useToast } from "./Toast/Toast.jsx";

/* ─── Step indicator labels ─── */
const STEPS = ["Details", "How to add?", "Videos", "Review"];

export default function PlaylistMultiStepModal({
  isOpen,
  onClose,
  onPlaylistCreated,
  currentUserId,
  initialMode,
}) {
  const { showToast } = useToast();

  const [step, setStep] = useState(1);
  const [playlistName, setPlaylistName] = useState("");
  const [playlistDesc, setPlaylistDesc] = useState("");
  const [playlistThumbnail, setPlaylistThumbnail] = useState(null);
  const [playlistThumbnailPreview, setPlaylistThumbnailPreview] = useState(null);
  const [mode, setMode] = useState(null);

  const [newVideoTitle, setNewVideoTitle] = useState("");
  const [newVideoDesc, setNewVideoDesc] = useState("");
  const [newVideoCategory, setNewVideoCategory] = useState("Other");
  const [newVideoFile, setNewVideoFile] = useState(null);
  const [newVideoThumbnail, setNewVideoThumbnail] = useState(null);
  const [newVideoThumbPreview, setNewVideoThumbPreview] = useState(null);

  const [availableVideos, setAvailableVideos] = useState([]);
  const [selectedVideoIds, setSelectedVideoIds] = useState([]);
  const [loading, setLoading] = useState(false);

  const [collectedVideos, setCollectedVideos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (isOpen && initialMode) {
      setMode(initialMode);
    }
    if (step === 3 && mode === "select" && availableVideos.length === 0) {
      fetchAvailableVideos();
    }
  }, [isOpen, initialMode, step, mode, availableVideos.length]);

  const fetchAvailableVideos = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/v1/videos?owner=${currentUserId}`);
      setAvailableVideos(res.data?.videos || []);
    } catch (err) {
      console.error("Error fetching videos:", err);
      showToast("Failed to load your videos", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPlaylistThumbnail(file);
    const reader = new FileReader();
    reader.onloadend = () => setPlaylistThumbnailPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleVideoThumbChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewVideoThumbnail(file);
    const reader = new FileReader();
    reader.onloadend = () => setNewVideoThumbPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleStep1Submit = (e) => {
    e.preventDefault();
    if (!playlistName.trim()) {
      showToast("Playlist name is required", "error");
      return;
    }
    if (initialMode) {
      setStep(3);
    } else {
      setStep(2);
    }
  };

  const handleModeSelect = (selectedMode) => {
    setMode(selectedMode);
    setStep(3);
  };

  const handleAddVideo = async (e) => {
    e.preventDefault();
    if (mode !== "upload") return;
    if (!newVideoTitle || !newVideoFile || !newVideoThumbnail) {
      showToast("Please fill all required fields", "error");
      return;
    }

    const videoObj = {
      id: `temp_${Date.now()}`,
      title: newVideoTitle,
      description: newVideoDesc,
      category: newVideoCategory,
      file: newVideoFile,
      thumbnail: newVideoThumbnail,
      thumbnailPreview: newVideoThumbPreview,
      isNew: true,
    };
    setCollectedVideos([...collectedVideos, videoObj]);
    showToast(`\"${newVideoTitle}\" added to queue`, "success");
    setNewVideoTitle("");
    setNewVideoDesc("");
    setNewVideoCategory("Other");
    setNewVideoFile(null);
    setNewVideoThumbnail(null);
    setNewVideoThumbPreview(null);
  };

  const handleSelectVideos = (videoId) => {
    if (selectedVideoIds.includes(videoId)) {
      setSelectedVideoIds(selectedVideoIds.filter((id) => id !== videoId));
    } else {
      setSelectedVideoIds([...selectedVideoIds, videoId]);
    }
  };

  const handleMoveToReview = () => {
    if (mode === "select") {
      const selectedVids = availableVideos.filter((v) => selectedVideoIds.includes(v._id));
      if (!selectedVids.length) { showToast("Please select at least one video", "error"); return; }
      setCollectedVideos(selectedVids);
    }
    if (mode !== "select" && !collectedVideos.length) {
      showToast("Please add at least one video", "error"); return;
    }
    setStep(4);
  };

  const handleRemoveVideo = (index) => {
    const removed = collectedVideos[index];
    setCollectedVideos((prev) => prev.filter((_, i) => i !== index));
    showToast(`\"${removed.title}\" removed`, "info");
  };

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    try {
      setUploading(true);
      setUploadProgress(5);

      const safeDescription = playlistDesc.trim() || "No description";
      const createRes = await axiosInstance.post(`/v1/playlist/`,
        { name: playlistName, description: safeDescription });

      const createdPlaylist = createRes.data?.playlist || createRes.data?.data || createRes.data;
      const playlistId = createdPlaylist._id;
      const total = collectedVideos.length;

      for (let i = 0; i < total; i += 1) {
        const video = collectedVideos[i];
        let videoId = video._id || video.id;

        if (video.isNew) {
          try {
            const videoFormData = new FormData();
            videoFormData.append("title", video.title);
            videoFormData.append("description", video.description);
            videoFormData.append("category", video.category);
            videoFormData.append("videoFile", video.file);
            videoFormData.append("thumbnail", video.thumbnail);

            const uploadRes = await axiosInstance.post(`/v1/videos/`, videoFormData);
            videoId = uploadRes.data?.video?._id || uploadRes.data?.data?._id || uploadRes.data?._id;
          } catch (err) {
            console.error("Error uploading video:", err);
            showToast(`Failed to upload \"${video.title}\"`, "error");
            continue;
          }
        }

        if (videoId) {
          try {
            await axiosInstance.patch(`/v1/playlist/add/${videoId}/${playlistId}`, {});
          } catch (err) {
            console.warn("Failed to add video to playlist:", err);
          }
        }
        setUploadProgress(Math.round(((i + 1) / total) * 100));
      }

      showToast(`\"${playlistName}\" created successfully!`, "success");
      onPlaylistCreated?.();
      handleClose();
    } catch (error) {
      console.error("Error creating playlist:", error);
      showToast("Failed to create playlist. Please try again.", "error");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleClose = () => {
    setStep(1);
    setPlaylistName("");
    setPlaylistDesc("");
    setPlaylistThumbnail(null);
    setPlaylistThumbnailPreview(null);
    setMode(null);
    setNewVideoTitle("");
    setNewVideoDesc("");
    setNewVideoCategory("Other");
    setNewVideoFile(null);
    setNewVideoThumbnail(null);
    setNewVideoThumbPreview(null);
    setSelectedVideoIds([]);
    setCollectedVideos([]);
    setUploadProgress(0);
    onClose?.();
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    } else if (step === 3) {
      if (initialMode) {
        setStep(1);
      } else {
        setStep(2);
        setMode(null);
      }
      setSelectedVideoIds([]);
      setNewVideoTitle("");
      setNewVideoDesc("");
      setNewVideoCategory("Other");
      setNewVideoFile(null);
      setNewVideoThumbnail(null);
    } else if (step === 4) {
      setStep(3);
    }
  };

  if (!isOpen) return null;

  const displayStep = initialMode && step >= 3 ? step - 1 : step;
  const stepLabels  = initialMode ? ["Details", "Videos", "Review"] : STEPS;
  const totalDisplaySteps = stepLabels.length;

  return (
    <div className="msm-overlay" onClick={handleClose} role="dialog" aria-modal="true">
      <div className="msm-container" onClick={(e) => e.stopPropagation()}>

        {/* ── Header ── */}
        <div className="msm-header">
          <div className="msm-header-left">
            <span className="msm-yt-icon">▶</span>
            <span className="msm-title-text">
              {step === 1 && "Create Playlist"}
              {step === 2 && "Add Videos"}
              {step === 3 && mode === "upload" && "Upload New Video"}
              {step === 3 && mode === "select" && "Select Your Videos"}
              {step === 4 && "Review & Publish"}
            </span>
          </div>
          <button className="msm-close" type="button" onClick={handleClose} aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* ── Step Progress ── */}
        <div className="msm-progress">
          <div className="msm-progress-line">
            <div className="msm-progress-fill" style={{ width: `${((displayStep - 1) / (totalDisplaySteps - 1)) * 100}%` }} />
          </div>
          {stepLabels.map((label, idx) => {
            const num = idx + 1;
            const active = displayStep === num;
            const done = displayStep > num;
            return (
              <div key={label} className={`msm-step ${active ? "active" : ""} ${done ? "done" : ""}`}>
                <div className="msm-step-dot">
                  {done ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                  ) : num}
                </div>
                <span className="msm-step-label">{label}</span>
              </div>
            );
          })}
        </div>

        {/* ── Body ── */}
        <div className="msm-body">

          {/* STEP 1 – Playlist Details */}
          {step === 1 && (
            <div className="msm-step-content" key="step1">
              <form onSubmit={handleStep1Submit} className="msm-form">
                <div className="msm-field">
                  <label className="msm-label" htmlFor="pl-name">Playlist Name *</label>
                  <input id="pl-name" className="msm-input" type="text" value={playlistName}
                    onChange={(e) => setPlaylistName(e.target.value)} placeholder="Give your playlist a name…" maxLength={100} autoFocus />
                  <span className="msm-char-count">{playlistName.length}/100</span>
                </div>
                <div className="msm-field">
                  <label className="msm-label" htmlFor="pl-desc">Description</label>
                  <textarea id="pl-desc" className="msm-input msm-textarea" value={playlistDesc}
                    onChange={(e) => setPlaylistDesc(e.target.value)} placeholder="Tell viewers what your playlist is about…" rows={3} maxLength={500} />
                  <span className="msm-char-count">{playlistDesc.length}/500</span>
                </div>
                <div className="msm-field">
                  <label className="msm-label">Thumbnail (optional)</label>
                  <label className="msm-file-upload" htmlFor="pl-thumb">
                    {playlistThumbnailPreview ? (
                      <img src={playlistThumbnailPreview} alt="Playlist thumbnail preview" className="msm-thumb-preview" />
                    ) : (
                      <div className="msm-file-placeholder">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>
                        </svg>
                        <span>Click to upload image</span>
                        <small>PNG, JPG up to 10 MB</small>
                      </div>
                    )}
                  </label>
                  <input id="pl-thumb" type="file" accept="image/*" onChange={handleThumbnailChange} className="msm-hidden-input" />
                </div>
                <div className="msm-actions">
                  <button type="button" className="msm-btn msm-btn--ghost" onClick={handleClose}>Cancel</button>
                  <button type="submit" className="msm-btn msm-btn--primary">
                    Continue
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 2 – Mode Selection */}
          {step === 2 && (
            <div className="msm-step-content" key="step2">
              <p className="msm-sub">How would you like to populate this playlist?</p>
              <div className="msm-mode-grid">
                <button type="button" className="msm-mode-card" onClick={() => handleModeSelect("upload")}>
                  <div className="msm-mode-icon msm-mode-icon--upload">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                  </div>
                  <h3>Upload New Videos</h3>
                  <p>Record or upload fresh content directly to this playlist</p>
                </button>
                <button type="button" className="msm-mode-card" onClick={() => handleModeSelect("select")}>
                  <div className="msm-mode-icon msm-mode-icon--select">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                      <rect x="3" y="14" width="7" height="7"/><path d="M14 17h7M17.5 13.5v7"/>
                    </svg>
                  </div>
                  <h3>Select Existing Videos</h3>
                  <p>Pick from videos you&apos;ve already uploaded to your channel</p>
                </button>
              </div>
              <div className="msm-actions">
                <button type="button" className="msm-btn msm-btn--ghost" onClick={handleBack}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                  </svg>
                  Back
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 – Upload Mode */}
          {step === 3 && mode === "upload" && (
            <div className="msm-step-content" key="step3-upload">
              {collectedVideos.length > 0 && (
                <div className="msm-queue">
                  <span className="msm-queue-label">
                    {collectedVideos.length} video{collectedVideos.length !== 1 ? "s" : ""} queued
                  </span>
                  <div className="msm-queue-chips">
                    {collectedVideos.map((v, i) => (
                      <span key={v.id} className="msm-chip">
                        {v.title}
                        <button type="button" onClick={() => handleRemoveVideo(i)} aria-label="Remove">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                          </svg>
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <form onSubmit={handleAddVideo} className="msm-form">
                <div className="msm-two-col">
                  <div className="msm-field">
                    <label className="msm-label" htmlFor="v-title">Video Title *</label>
                    <input id="v-title" className="msm-input" type="text" value={newVideoTitle}
                      onChange={(e) => setNewVideoTitle(e.target.value)} placeholder="Enter title…" />
                  </div>
                  <div className="msm-field">
                    <label className="msm-label" htmlFor="v-cat">Category</label>
                    <select id="v-cat" className="msm-input msm-select" value={newVideoCategory} onChange={(e) => setNewVideoCategory(e.target.value)}>
                      {VIDEO_CATEGORIES.filter((c) => c !== "All").map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="msm-field">
                  <label className="msm-label" htmlFor="v-desc">Description</label>
                  <textarea id="v-desc" className="msm-input msm-textarea" value={newVideoDesc}
                    onChange={(e) => setNewVideoDesc(e.target.value)} placeholder="Describe this video…" rows={2} />
                </div>
                <div className="msm-two-col">
                  <div className="msm-field">
                    <label className="msm-label">Video File *</label>
                    <label className="msm-file-upload msm-file-compact" htmlFor="v-file">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                      </svg>
                      <span>{newVideoFile ? newVideoFile.name : "Choose video…"}</span>
                    </label>
                    <input id="v-file" type="file" accept="video/*" onChange={(e) => setNewVideoFile(e.target.files?.[0] || null)} className="msm-hidden-input" />
                  </div>
                  <div className="msm-field">
                    <label className="msm-label">Thumbnail *</label>
                    <label className="msm-file-upload msm-file-compact" htmlFor="v-thumb">
                      {newVideoThumbPreview ? (
                        <img src={newVideoThumbPreview} alt="thumb" style={{ height: "40px", borderRadius: "6px", objectFit: "cover" }} />
                      ) : (
                        <>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>
                          </svg>
                          <span>Choose image…</span>
                        </>
                      )}
                    </label>
                    <input id="v-thumb" type="file" accept="image/*" onChange={handleVideoThumbChange} className="msm-hidden-input" />
                  </div>
                </div>
                <div className="msm-actions">
                  <button type="button" className="msm-btn msm-btn--ghost" onClick={handleBack}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M19 12H5M12 19l-7-7 7-7"/>
                    </svg>
                    Back
                  </button>
                  <div className="msm-actions-right">
                    <button type="submit" className="msm-btn msm-btn--secondary">Add to Queue</button>
                    {collectedVideos.length > 0 && (
                      <button type="button" className="msm-btn msm-btn--primary" onClick={handleMoveToReview}>
                        Review ({collectedVideos.length})
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                          <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* STEP 3 – Select Mode */}
          {step === 3 && mode === "select" && (
            <div className="msm-step-content" key="step3-select">
              {loading && (
                <div className="msm-loading">
                  <div className="msm-spinner" />
                  <span>Loading your videos…</span>
                </div>
              )}
              {!loading && availableVideos.length === 0 && (
                <div className="msm-empty">
                  <p>No videos found. Upload your first video to get started.</p>
                </div>
              )}
              {!loading && availableVideos.length > 0 && (
                <>
                  <p className="msm-sub">
                    {selectedVideoIds.length > 0
                      ? `${selectedVideoIds.length} video${selectedVideoIds.length !== 1 ? "s" : ""} selected`
                      : "Click videos to select them"}
                  </p>
                  <div className="msm-videos-grid">
                    {availableVideos.map((video) => {
                      const selected = selectedVideoIds.includes(video._id);
                      return (
                        <button type="button" key={video._id}
                          className={`msm-video-card ${selected ? "selected" : ""}`}
                          onClick={() => handleSelectVideos(video._id)} aria-pressed={selected}>
                          <div className="msm-vc-thumb-wrap">
                            <img src={video.thumbnail || "/default-thumb.svg"} alt={video.title} className="msm-vc-thumb" />
                            {selected && <div className="msm-vc-overlay" />}
                            <div className="msm-vc-check">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                                <path d="M20 6L9 17l-5-5"/>
                              </svg>
                            </div>
                          </div>
                          <div className="msm-vc-info">
                            <p className="msm-vc-title">{video.title}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
              <div className="msm-actions">
                <button type="button" className="msm-btn msm-btn--ghost" onClick={handleBack}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                  </svg>
                  Back
                </button>
                <button type="button" className="msm-btn msm-btn--primary" onClick={handleMoveToReview} disabled={selectedVideoIds.length === 0}>
                  Review ({selectedVideoIds.length})
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* STEP 4 – Review */}
          {step === 4 && (
            <div className="msm-step-content" key="step4">
              <div className="msm-review-card">
                <div className="msm-review-thumb-wrap">
                  {playlistThumbnailPreview ? (
                    <img src={playlistThumbnailPreview} alt="Playlist thumbnail" className="msm-review-thumb" />
                  ) : (
                    <div className="msm-review-thumb-placeholder">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                        <path d="M3 18v-6a9 9 0 0118 0v6"/>
                        <path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z"/>
                      </svg>
                    </div>
                  )}
                </div>
                <div className="msm-review-meta">
                  <h3 className="msm-review-name">{playlistName}</h3>
                  {playlistDesc && <p className="msm-review-desc">{playlistDesc}</p>}
                  <span className="msm-review-count">{collectedVideos.length} video{collectedVideos.length !== 1 ? "s" : ""}</span>
                </div>
              </div>

              <div className="msm-review-list">
                {collectedVideos.map((video, index) => (
                  <div key={video._id || video.id} className="msm-review-item">
                    <span className="msm-review-num">{index + 1}</span>
                    <div className="msm-review-item-thumb">
                      {video.thumbnailPreview ? (
                        <img src={video.thumbnailPreview} alt={video.title} />
                      ) : video.thumbnail && typeof video.thumbnail === "string" && !video.thumbnail.startsWith("blob") ? (
                        <img src={video.thumbnail} alt={video.title} />
                      ) : (
                        <div className="msm-review-item-thumb-placeholder">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <polygon points="23 7 16 12 23 17 23 7"/>
                            <rect x="1" y="5" width="15" height="14" rx="2"/>
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="msm-review-item-info">
                      <p className="msm-review-item-title">{video.title}</p>
                      {video.isNew && <span className="msm-badge-new">New upload</span>}
                    </div>
                    <button type="button" className="msm-review-remove" onClick={() => handleRemoveVideo(index)} aria-label="Remove video">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              {uploading && (
                <div className="msm-upload-progress">
                  <div className="msm-upload-bar">
                    <div className="msm-upload-fill" style={{ width: `${uploadProgress}%` }} />
                  </div>
                  <span className="msm-upload-label">Creating playlist… {uploadProgress}%</span>
                </div>
              )}

              <div className="msm-actions">
                <button type="button" className="msm-btn msm-btn--ghost" onClick={handleBack} disabled={uploading}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                  </svg>
                  Back
                </button>
                <button type="button" className="msm-btn msm-btn--primary" onClick={handleCreatePlaylist} disabled={uploading || collectedVideos.length === 0}>
                  {uploading ? (
                    <><span className="msm-spinner-sm" /> Publishing…</>
                  ) : (
                    <>
                      Publish Playlist
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}




