import React from "react";
import { useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import LoginPrompt from "../LoginPrompt";
import { useToast } from "../Toast/Toast.jsx";
import "./Comment.css";

export default function Comment({ videoId: propVideoId, refType = "video", onCommentAdded }){
  const [content,setContent]=useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const videoId = propVideoId || useParams().id;
  const navigate = useNavigate();
  const isLoggedIn = useSelector((s) => !!s.auth?.status);
  const { showToast } = useToast();

  const commentHandler = async()=>{
    if (!content || content.trim() === "") return setError("Comment cannot be empty");
    if (!isLoggedIn) {
      setShowLoginPrompt(true);
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const result = await axios.post(
        `/api/v1/comments/${videoId}`,
        { content, refType },
        { withCredentials: true }
      );

      setContent("");
      if (onCommentAdded) onCommentAdded();
      showToast("✓ Comment added!", "success", 2500);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401) {
        setShowLoginPrompt(true);
        return;
      }
      const message = err.response?.data?.message || err.response?.data?.error || err.message;
      setError(message || "Failed to add comment");
    } finally {
      setLoading(false);
    }
  }

  return(
    <div className="comment-form">
      <LoginPrompt
        isOpen={showLoginPrompt}
        message="You must be logged in to comment."
        onClose={() => setShowLoginPrompt(false)}
      />
      <label htmlFor="comment">Add Comment</label>
      <textarea
        id="comment"
        value={content}
        onChange={(e)=>setContent(e.target.value)}
        placeholder="Share your thoughts..."
        className="comment-input"
        rows={3}
      />
      <div className="comment-actions">
        <button onClick={commentHandler} disabled={loading} className="comment-btn">
          {loading ? "Posting..." : "Add comment"}
        </button>
      </div>
      {error && <p className="comment-error">{error}</p>}
    </div>
  )
} 

