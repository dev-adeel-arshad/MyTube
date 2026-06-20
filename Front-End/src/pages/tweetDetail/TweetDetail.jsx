import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance.js";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Tweet from "../../components/tweet/Tweet";
import Comment from "../../components/comment/Comment";
import AllVideoComments from "../../components/comment/AllVideoComments";
import "./TweetDetail.css";

export default function TweetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tweet, setTweet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentsRefresh, setCommentsRefresh] = useState(0);
  const currentUser = useSelector((s) => s.auth.userData);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [id]);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await axiosInstance.get(`/tweets/${id}`);
        setTweet(res.data?.tweet || res.data?.data || null);
        try {
          await axiosInstance.post(`/users/history/tweets/${id}`, {});
        } catch (err) {
          // ignore history errors
        }
      } catch (err) {
        console.error("Error fetching tweet:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleCommentAdded = () => {
    setCommentsRefresh((s) => s + 1);
    if (id) {
      (async () => {
        try {
          const res = await axiosInstance.get(`/tweets/${id}`);
          setTweet(res.data?.tweet || res.data?.data || null);
        } catch (err) {
          console.error("Error refetching tweet:", err);
        }
      })();
    }
  };

  if (loading) return <div className="tweet-detail-loading">Loading...</div>;
  if (!tweet) return <div className="tweet-detail-not-found">Tweet not found</div>;

  return (
    <div className="tweet-detail-page">
      <div className="tweet-detail-main">
        <div className="tweet-detail-header">
          <button className="td-back-btn" onClick={() => navigate(-1)} aria-label="Go back">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <h2>Tweet</h2>
        </div>

        <div className="tweet-detail-content">
          <Tweet tweet={tweet} />

          <div className="tweet-comments-section">
            <Comment videoId={tweet._id} refType="tweet" onCommentAdded={handleCommentAdded} />
            <AllVideoComments videoId={tweet._id} refType="tweet" refresh={commentsRefresh} />
          </div>
        </div>
      </div>
    </div>
  );
}

