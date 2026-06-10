import { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setUserTweets } from "../../features/tweetsSlice";
import CreateTweet from "../../components/tweet/CreateTweet";
import Tweet from "../../components/tweet/Tweet";
import "./tweetsPage.css";

export default function TweetsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userTweets = useSelector((s) => s.tweets.userTweets);
  const currentUser = useSelector((s) => s.auth.userData);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUserTweets = async () => {
      if (!currentUser?._id) return;

      try {
        setLoading(true);
        const res = await axios.get(
          `/api/v1/tweets/user/${currentUser._id}`,
          { withCredentials: true }
        );

        if (res.data?.tweets) {
          dispatch(setUserTweets(res.data.tweets));
        }
      } catch (error) {
        console.error("Error fetching tweets:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserTweets();
  }, [currentUser, dispatch]);

  const handleTweetDeleted = (tweetId) => {
    if (!tweetId) return;
    dispatch(setUserTweets(userTweets.filter((t) => t._id !== tweetId)));
  };

  const handleTweetUpdated = (tweetId, content) => {
    if (!tweetId) return;
    dispatch(setUserTweets(
      userTweets.map((t) => (t._id === tweetId ? { ...t, content } : t))
    ));
  };

  return (
    <div className="tweets-page">
      <div className="tweets-container">
        <div className="tweets-header">
          <div className="tweets-hero-icon">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.85L1.254 2.25H8.08l4.258 5.613 5.906-5.613zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </div>
          <h1>Your Tweets</h1>
          <p className="tweets-subtitle">Share your thoughts with your followers</p>
          <div className="tweets-header-stats">
            <span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              {userTweets?.length || 0} tweets
            </span>
            <span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              Be the first to like
            </span>
          </div>
        </div>

        <div className="tweets-section">
          <CreateTweet />

          {loading ? (
            <div className="loading">Loading tweets...</div>
          ) : userTweets && userTweets.length > 0 ? (
            <div className="tweets-list">
              {userTweets.map((tweet) => (
                <div
                  key={tweet._id}
                  className="tweet-list-item"
                  onClick={() => navigate(`/tweet/${tweet._id}`)}
                >
                  <Tweet
                    tweet={tweet}
                    onDelete={handleTweetDeleted}
                    onUpdate={handleTweetUpdated}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="no-tweets">
              <p>No tweets yet. Create your first tweet above!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

