import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { useParams } from "react-router-dom";
import LoginPrompt from "../LoginPrompt";
import "./AllVideoComments.css";

export default function AllVideoComments({ videoId: propVideoId, refType = "video", refresh = 0 }) {
  const [comments, setComments] = useState([]);
  const [likedComments, setLikedComments] = useState({});
  const [commentLikeCounts, setCommentLikeCounts] = useState({});
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const { id: paramVideoId } = useParams();
  const videoId = propVideoId || paramVideoId;
  const currentUser = useSelector((s) => s.auth.userData);

  useEffect(() => {
    if (!videoId) return;

    const fetchComments = async () => {
      try {
        const result = await axios.get(
          `/api/v1/comments/${videoId}?refType=${encodeURIComponent(refType)}`,
          { withCredentials: true }
        );

        // Backend returns ApiResponse with data.comments
        const commentsList = result.data?.data?.comments || result.data?.allComments || [];
        setComments(commentsList);
        // fetch like counts for each comment (parallel)
        const likesMap = {};
        const likedMap = {};
        await Promise.all(
          commentsList.map(async (c) => {
            try {
              const r = await axios.get(`/api/v1/like/c/${c._id}`, { withCredentials: true });
              const likes = r.data?.data || [];
              likesMap[c._id] = likes.length;
              const userId = currentUser?._id;
              likedMap[c._id] = userId ? likes.some(l => (l.likedBy?._id || l.likedBy) === userId) : false;
            } catch (err) {
              likesMap[c._id] = 0;
              likedMap[c._id] = false;
            }
          })
        );
        setCommentLikeCounts(likesMap);
        setLikedComments(likedMap);
      } catch (error) {
        // Error while fetching comments
      }
    };

    fetchComments();
  }, [videoId, refresh]);

  const handleLikeComment = async (commentId) => {
    try {
      const res = await axios.post(
        `/api/v1/like/toggle/c/${commentId}`,
        {},
        { withCredentials: true }
      );

      if (res.data?.data?.liked) {
        setLikedComments((prev) => ({
          ...prev,
          [commentId]: true,
        }));
        setCommentLikeCounts((prev) => ({ ...prev, [commentId]: (prev[commentId] || 0) + 1 }));
      } else {
        setLikedComments((prev) => ({
          ...prev,
          [commentId]: false,
        }));
        setCommentLikeCounts((prev) => ({ ...prev, [commentId]: Math.max(0, (prev[commentId] || 1) - 1) }));
      }
    } catch (error) {
      const status = error?.response?.status;
      if (status === 401) {
        setShowLoginPrompt(true);
        return;
      }
      console.error("Error liking comment:", error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;

    try {
      await axios.delete(
        `/api/v1/comments/c/${commentId}`,
        { withCredentials: true }
      );
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  return (
    <>
      <LoginPrompt isOpen={showLoginPrompt} message="You must be logged in to like comments." onClose={() => setShowLoginPrompt(false)} />
      <div className="comments-wrapper">
        <h3 className="comments-title">Comments</h3>

        {comments.length === 0 ? (
          <p className="no-comments">No comments yet.</p>
        ) : (
          comments.map((comment) => (
            <div key={comment._id} className="comment-item">
              <div className="comment-avatar">
                <img src={comment.user?.avatar || "/default-avatar.png"} alt="avatar" />
              </div>
              <div className="comment-body">
                <div className="comment-user">{comment.user?.username || "Unknown"}</div>
                <div className="comment-time">{comment.createdAt ? new Date(comment.createdAt).toLocaleString() : "Unknown time"}</div>
                <div className="comment-content">{comment.content}</div>
                <div className="comment-actions">
                  <button
                    className={`like-comment-btn ${likedComments[comment._id] ? "liked" : ""}`}
                    onClick={() => handleLikeComment(comment._id)}
                  >
                    Like {commentLikeCounts[comment._id] ? `(${commentLikeCounts[comment._id]})` : ""}
                  </button>
                  {currentUser?._id === comment.user?._id && (
                    <button
                      className="delete-comment-btn"
                      onClick={() => handleDeleteComment(comment._id)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}


