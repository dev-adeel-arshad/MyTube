import { useState, useEffect, useRef } from "react";
import axiosInstance from "../api/axiosInstance.js";
import "./CreateVideo.css";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import LoginPrompt from "./LoginPrompt.jsx";
import { VIDEO_CATEGORIES } from "../utils/videoCategories.js";

export default function CreateVideo() {
    const isLoggedIn = useSelector((state) => !!state.auth?.status);
    const navigate = useNavigate();

    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "instant" });
    }, []);

    if (!isLoggedIn) {
        return (
            <LoginPrompt
                isOpen={true}
                message="Create an account to start uploading videos and sharing your content with the world!"
                onClose={() => navigate("/")}
            />
        );
    }

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "Other",
        videoFile: null,
        thumbnail: null,
    });
    const [thumbnailPreview, setThumbnailPreview] = useState(null);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [uploading, setUploading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [showCatDropdown, setShowCatDropdown] = useState(false);
    const catRef = useRef(null);

    // Close custom category dropdown on outside click
    useEffect(() => {
        const handler = (e) => {
            if (catRef.current && !catRef.current.contains(e.target)) setShowCatDropdown(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const handleThumbnailChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setFormData({ ...formData, thumbnail: file });
        const reader = new FileReader();
        reader.onloadend = () => setThumbnailPreview(reader.result);
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isLoggedIn) {
            setShowLoginPrompt(true);
            return;
        }

        try {
            setErrorMessage("");
            setUploading(true);
            const data = new FormData();
            data.append("title", formData.title);
            data.append("description", formData.description);
            data.append("category", formData.category || "Other");
            data.append("videoFile", formData.videoFile);
            data.append("thumbnail", formData.thumbnail);

            await axiosInstance.post("/videos/", data, { headers: { "Content-Type": "multipart/form-data" } });

            window.scrollTo({ top: 0, behavior: "smooth" });
            setSuccess(true);
            setTimeout(() => navigate("/studio"), 2000);
        } catch (error) {
            const status = error?.response?.status;
            if (status === 401) {
                setShowLoginPrompt(true);
                return;
            }
            const message = error?.response?.data?.message || "Failed to upload video";
            setErrorMessage(message);
            console.error(error);
        } finally {
            setUploading(false);
        }
    };

    if (success) {
        return (
            <div className="cv-page">
                <div className="cv-success">
                    <div className="cv-success-icon">✓</div>
                    <h2>Video uploaded!</h2>
                    <p>Redirecting to your studio…</p>
                </div>
            </div>
        );
    }

    return (
        <div className="cv-page">
            <LoginPrompt
                isOpen={showLoginPrompt}
                message="You must be logged in to upload a video."
                onClose={() => setShowLoginPrompt(false)}
            />

            <div className="cv-container">
                {/* Header */}
                <div className="cv-header">
                    <div className="cv-header-icon">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                            <polyline points="17 8 12 3 7 8"/>
                            <line x1="12" y1="3" x2="12" y2="15"/>
                        </svg>
                    </div>
                    <div>
                        <h1 className="cv-title">Upload Video</h1>
                        <p className="cv-subtitle">Share your content with the world</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="cv-form">
                    {/* Two-col: file uploads */}
                    <div className="cv-files-grid">
                        {/* Video file */}
                        <div className="cv-field">
                            <label className="cv-label" htmlFor="cv-video">
                                Video File <span className="cv-required">*</span>
                            </label>
                            <label
                                className={`cv-drop-zone ${formData.videoFile ? "cv-drop-zone--filled" : ""}`}
                                htmlFor="cv-video"
                            >
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                                    <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none"/>
                                </svg>
                                <span className="cv-drop-label">
                                    {formData.videoFile ? formData.videoFile.name : "Click to select video"}
                                </span>
                                <small>MP4, MOV, AVI, MKV…</small>
                            </label>
                            <input
                                id="cv-video"
                                type="file"
                                accept="video/*"
                                className="cv-hidden"
                                onChange={(e) => setFormData({ ...formData, videoFile: e.target.files[0] })}
                                required
                            />
                        </div>

                        {/* Thumbnail */}
                        <div className="cv-field">
                            <label className="cv-label" htmlFor="cv-thumb">
                                Thumbnail <span className="cv-required">*</span>
                            </label>
                            <label
                                className={`cv-drop-zone cv-drop-zone--thumb ${thumbnailPreview ? "cv-drop-zone--has-img" : ""}`}
                                htmlFor="cv-thumb"
                            >
                                {thumbnailPreview ? (
                                    <img src={thumbnailPreview} alt="thumbnail preview" className="cv-thumb-preview" />
                                ) : (
                                    <>
                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                                            <rect x="3" y="3" width="18" height="18" rx="2"/>
                                            <circle cx="8.5" cy="8.5" r="1.5"/>
                                            <path d="M21 15l-5-5L5 21"/>
                                        </svg>
                                        <span className="cv-drop-label">Click to select thumbnail</span>
                                        <small>PNG, JPG, WEBP…</small>
                                    </>
                                )}
                            </label>
                            <input
                                id="cv-thumb"
                                type="file"
                                accept="image/*"
                                className="cv-hidden"
                                onChange={handleThumbnailChange}
                                required
                            />
                        </div>
                    </div>

                    {/* Title */}
                    <div className="cv-field">
                        <label className="cv-label" htmlFor="cv-title-inp">
                            Title <span className="cv-required">*</span>
                        </label>
                        <input
                            id="cv-title-inp"
                            type="text"
                            className="cv-input"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Give your video an engaging title…"
                            maxLength={100}
                            required
                        />
                        <span className="cv-char-count">{formData.title.length}/100</span>
                    </div>

                    {/* Description */}
                    <div className="cv-field">
                        <label className="cv-label" htmlFor="cv-desc">Description</label>
                        <textarea
                            id="cv-desc"
                            className="cv-input cv-textarea"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Tell viewers what your video is about…"
                            rows={3}
                            maxLength={1000}
                        />
                        <span className="cv-char-count">{formData.description.length}/1000</span>
                    </div>

                    {/* Category — custom dropdown */}
                    <div className="cv-field" style={{ position: "relative" }} ref={catRef}>
                        <label className="cv-label">Category</label>
                        <button
                            type="button"
                            className={`cv-input cv-cat-trigger ${showCatDropdown ? "cv-cat-trigger--open" : ""}`}
                            onClick={() => setShowCatDropdown((v) => !v)}
                        >
                            <span>{formData.category}</span>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                <polyline points="6 9 12 15 18 9"/>
                            </svg>
                        </button>
                        {showCatDropdown && (
                            <div className="cv-cat-dropdown">
                                {VIDEO_CATEGORIES.filter((c) => c !== "All").map((cat) => (
                                    <button
                                        key={cat}
                                        type="button"
                                        className={`cv-cat-option ${formData.category === cat ? "cv-cat-option--active" : ""}`}
                                        onClick={() => { setFormData({ ...formData, category: cat }); setShowCatDropdown(false); }}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {errorMessage && (
                        <div className="cv-error">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                            </svg>
                            {errorMessage}
                        </div>
                    )}

                    <div className="cv-actions">
                        <button
                            type="button"
                            className="cv-btn cv-btn--ghost"
                            onClick={() => {
                                const hasData = formData.title || formData.description || formData.videoFile || formData.thumbnail;
                                if (hasData && !window.confirm("You have unsaved changes. If you leave, all your progress will be lost.\n\nLeave anyway?")) return;
                                navigate(-1);
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={`cv-btn cv-btn--primary ${uploading ? "cv-btn--loading" : ""}`}
                            disabled={uploading}
                        >
                            {uploading ? (
                                <>
                                    <span className="cv-spinner" />
                                    Uploading…
                                </>
                            ) : (
                                <>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                                        <polyline points="17 8 12 3 7 8"/>
                                        <line x1="12" y1="3" x2="12" y2="15"/>
                                    </svg>
                                    Publish Video
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
