import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance.js";
import "./EditMediaModal.css";
import { VIDEO_CATEGORIES } from "../utils/videoCategories.js";

export default function EditVideoModal({ isOpen, onClose, video, onUpdated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Other");
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen || !video) return;
    setTitle(video.title || "");
    setDescription(video.description || "");
    setCategory(video.category || "Other");
    setThumbnailFile(null);
    setError("");
  }, [isOpen, video]);

  const handleClose = () => {
    if (saving) return;
    setError("");
    onClose?.();
  };

  const handleSubmit = async () => {
    if (!video?._id) return;
    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    try {
      setSaving(true);
      setError("");
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("category", category);
      if (thumbnailFile) {
        formData.append("thumbnail", thumbnailFile);
      }

      const res = await axiosInstance.patch(`/videos/${video._id}`, formData);
      const updated = res.data?.video || res.data?.data || res.data;
      if (updated?._id) {
        onUpdated?.(updated, "Video updated");
      }
      handleClose();
    } catch (err) {
      setError("Failed to update video");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !video) return null;

  return (
    <div className="edit-modal-overlay" onClick={handleClose}>
      <div className="edit-modal" onClick={(event) => event.stopPropagation()}>
        <div className="edit-modal-header">
          <h3>Edit Video</h3>
          <button type="button" className="edit-modal-close" onClick={handleClose}>
            x
          </button>
        </div>
        <div className="edit-modal-body">
          {error && <div className="edit-modal-error">{error}</div>}
          <label className="edit-modal-field">
            Title
            <input value={title} onChange={(e) => setTitle(e.target.value)} />
          </label>
          <label className="edit-modal-field">
            Description
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </label>
          <label className="edit-modal-field">
            Category
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {VIDEO_CATEGORIES.filter((item) => item !== "All").map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>
          <label className="edit-modal-field">
            Thumbnail (optional)
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
            />
          </label>
        </div>
        <div className="edit-modal-actions">
          <button type="button" className="btn-secondary" onClick={handleClose} disabled={saving}>
            Cancel
          </button>
          <button type="button" className="btn-primary" onClick={handleSubmit} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
