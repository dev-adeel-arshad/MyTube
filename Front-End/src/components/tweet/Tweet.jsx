import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance.js";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { deleteTweet, toggleLikedTweet } from "../../features/tweetsSlice";
import LoginPrompt from "../LoginPrompt";
import { useToast } from "../Toast/Toast.jsx";
import "./Tweet.css";

export default function Tweet({ tweet, onDelete, onUpdate }) {
  const [likeCount, setLikeCount] = useState(tweet?.likeCount || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [liking, setLiking] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentUser = useSelector((s) => s.auth.userData);
  const likedTweets = useSelector((s) => s.tweets.likedTweets);
  const { showToast } = useToast();

  const isCurrentUserTweet = currentUser?._id === tweet?.owner?._id;

  useEffect(() => {
    if (!tweet?._id) return;
    const fetchCounts = async () => {
      try {
        const [likesRes, commentsRes] = await Promise.all([
          axiosInstance.get(`/like/t/${tweet._id}`),
          axiosInstance.get(`/comments/${tweet._id}?refType=tweet`),
        ]);
        const likes = likesRes.data?.data || [];
        setLikeCount(likes.length || 0);
        const userId = currentUser?._id;
        if (userId) {
          setIsLiked(likes.some((l) => (l.likedBy?._id || l.likedBy) === userId));
        } else {
          setIsLiked(false);
        }
        const total = commentsRes.data?.data?.pagination?.total || 0;
        setCommentCount(total);
      } catch (err) {
        setLikeCount((prev) => Math.max(0, prev || 0));
        setCommentCount(0);
      }
    };

    fetchCounts();
  }, [tweet?._id, currentUser?._id]);

  const handleLikeTweet = async () => {
    setLiking(true);
    setTimeout(() => setLiking(false), 500);
    try {
      const res = await axiosInstance.post(
        `/like/toggle/t/${tweet._id}`,
        {}
      );

      if (res.data?.data?.liked) {
        setLikeCount((prev) => (prev || 0) + 1);
        setIsLiked(true);
        dispatch(toggleLikedTweet(tweet._id));
        showToast("❤ Liked!", "success", 2000);
      } else {
        setLikeCount((prev) => Math.max(0, (prev || 0) - 1));
        setIsLiked(false);
        dispatch(toggleLikedTweet(tweet._id));
        showToast("Like removed", "info", 2000);
      }
    } catch (error) {
      const status = error?.response?.status;
      if (status === 401) {
        setShowLoginPrompt(true);
        return;
      }
      console.error("Error liking tweet:", error);
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/tweet/${tweet._id}`;
    if (navigator.share) {
      navigator.share({ title: "Tweet", url }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      showToast("Link copied!", "info", 2000);
    }
  };

  const handleDeleteTweet = async () => {
    if (!window.confirm("Are you sure you want to delete this tweet?")) return;

    try {
      await axiosInstance.delete(
        `/tweets/update-tweet/${tweet._id}`
      );
      dispatch(deleteTweet(tweet._id));
      if (onDelete) onDelete(tweet._id);
    } catch (error) {
      console.error("Error deleting tweet:", error);
      alert("Failed to delete tweet");
    }
  };

  const handleEditTweet = async () => {
    const updated = window.prompt("Edit tweet", tweet?.content || "");
    if (updated === null) return;

    try {
      const res = await axiosInstance.patch(
        `/tweets/update-tweet/${tweet._id}`,
        { content: updated }
      );
      if (res.status === 200) {
        if (onUpdate) onUpdate(tweet._id, updated);
      }
    } catch (error) {
      console.error("Error updating tweet:", error);
      alert("Failed to update tweet");
    }
  };

  return (
    <div className="tweet-card">
      <LoginPrompt
        isOpen={showLoginPrompt}
        message="You must be logged in to like tweets."
        onClose={() => setShowLoginPrompt(false)}
      />
      <div className="tweet-header">
        <img
          src={tweet?.owner?.avatar || "/default-avatar.svg"}
          alt="Avatar"
          className="tweet-avatar"
        />
        <div className="tweet-user-info">
          <div className="tweet-name">
            <strong>{tweet?.owner?.fullname || "User"}</strong>
            <span className="tweet-username">@{tweet?.owner?.username || "username"}</span>
          </div>
          <p className="tweet-time">
            {tweet?.createdAt ? new Date(tweet.createdAt).toLocaleDateString() : ""}
          </p>
        </div>
        {isCurrentUserTweet && (
          <div className="tweet-owner-actions">
            <button className="edit-btn" onClick={handleEditTweet} title="Edit">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Edit
            </button>
            <button className="delete-btn" onClick={handleDeleteTweet} title="Delete">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                <path d="M10 11v6M14 11v6"/>
                <path d="M9 6V4h6v2"/>
              </svg>
              Delete
            </button>
          </div>
        )}
      </div>

      <div className="tweet-content">
        <p>{tweet?.content || ""}</p>
      </div>

      <div className="tweet-actions">
        <button
          className={`action-btn like-btn ${isLiked ? "liked" : ""} ${liking ? "liking" : ""}`}
          onClick={handleLikeTweet}
          title="Like"
        >
          <svg className="action-icon heart-icon" viewBox="0 0 24 24" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          <span className="count">{likeCount}</span>
        </button>
        <button
          className="action-btn comment-btn"
          onClick={() => navigate(`/tweet/${tweet._id}`)}
          title="Comment"
        >
          <svg className="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <span className="count">{commentCount}</span>
        </button>
        <button className="action-btn share-btn" onClick={handleShare} title="Share">
          <svg className="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
          <span>Share</span>
        </button>
      </div>
    </div>
  );
}


