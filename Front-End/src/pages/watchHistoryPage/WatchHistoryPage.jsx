import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance.js";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import "../libraryPage/LibraryPage.css";
import "./watchHistoryPage.css";
import VideoMenu from "../../components/VideoMenu/VideoMenu.jsx";
import PlaylistSelectionModal from "../../components/PlaylistSelectionModal.jsx";
import LoginPrompt from "../../components/LoginPrompt.jsx";
import useVideoMenuActions from "../../hooks/useVideoMenuActions.js";

export default function WatchHistoryPage() {
  const [historyGroups, setHistoryGroups] = useState({
    today: [],
    yesterday: [],
    older: [],
  });
  const [loading, setLoading] = useState(false);
  const [tweetHistory, setTweetHistory] = useState([]);
  const [historyPaused, setHistoryPaused] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [activePanel, setActivePanel] = useState("history");
  const [userComments, setUserComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const navigate = useNavigate();
  const menu = useVideoMenuActions(navigate);
  const currentUser = useSelector((s) => s.auth.userData);
  useEffect(() => {
    fetchWatchHistory();
    fetchTweetHistory();
  }, []);

  useEffect(() => {
    fetchWatchHistory();
    fetchTweetHistory();
  }, [currentUser?._id]);

  const fetchWatchHistory = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/users/history");
      const grouped = res.data?.data?.grouped || res.data?.data || {
        today: [],
        yesterday: [],
        older: [],
      };
      const paused = res.data?.data?.paused;
      setHistoryGroups(grouped);
      setHistoryPaused(!!paused);
    } catch (err) {
      setHistoryGroups({ today: [], yesterday: [], older: [] });
    } finally {
      setLoading(false);
    }
  };

  

  const fetchTweetHistory = async () => {
    try {
      const res = await axiosInstance.get("/users/history/tweets");
      const items = res.data?.data?.items || []; 
      setTweetHistory(Array.isArray(items) ? items : []);
    } catch (err) {
      setTweetHistory([]);
    }
  };

  const fetchUserComments = async () => {
    setCommentsLoading(true);
    try {
      const res = await axiosInstance.get("/comments/user/me");
      const items = res.data?.data?.comments || []; 
      setUserComments(Array.isArray(items) ? items : []);
    } catch (err) {
      setUserComments([]);
    } finally {
      setCommentsLoading(false);
    }
  };

  const toggleHistoryPause = async () => {
    const next = !historyPaused;
    setHistoryPaused(next);
    try {
      const res = await axiosInstance.patch("/users/history/pause", { paused: next });
      setHistoryPaused(!!res.data?.data?.paused);
    } catch (err) {
      setHistoryPaused(!next);
      console.error("Failed to update history pause:", err);
    }
  };

  const clearHistory = async () => {
    try {
      await axiosInstance.delete("/users/history");
      setHistoryGroups({ today: [], yesterday: [], older: [] });
      setTweetHistory([]);
    } catch (err) {
      console.error("Failed to clear history:", err);
    }
  };

  const removeFromHistory = async (videoId) => {
    try {
      await axiosInstance.delete(`/users/history/${videoId}`);
      await fetchWatchHistory();
    } catch (err) {
      console.error("Failed to remove from history:", err);
    }
  };

  const totalVideos =
    historyGroups.today.length + historyGroups.yesterday.length + historyGroups.older.length;
  const hasHistory = totalVideos > 0;
  const hasTweetHistory = tweetHistory.length > 0;
  const showVideos = activeFilter === "all" || activeFilter === "videos";
  const showTweets = activeFilter === "all" || activeFilter === "tweets";

  const isSameDay = (dateValue, compareDate = new Date()) => {
    if (!dateValue) return false;
    const d = new Date(dateValue);
    return d.toDateString() === compareDate.toDateString();
  };

  const tweetsToday = tweetHistory.filter((entry) => isSameDay(entry?.visitedAt));

  const formatDateLabel = (dateValue) => {
    if (!dateValue) return "";
    return new Date(dateValue).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  };

  const groupOlderByDate = (items) => {
    const map = new Map();
    items.forEach((entry) => {
      const watchedAt = entry?.watchedAt || entry?.createdAt || Date.now();
      const key = new Date(watchedAt).toISOString().slice(0, 10);
      if (!map.has(key)) {
        map.set(key, { label: formatDateLabel(watchedAt), items: [] });
      }
      map.get(key).items.push(entry);
    });

    return Array.from(map.values()).sort((a, b) => {
      const aKey = new Date(a.items?.[0]?.watchedAt || 0).getTime();
      const bKey = new Date(b.items?.[0]?.watchedAt || 0).getTime();
      return bKey - aKey;
    });
  };

  const renderGroup = (title, videos) => {
    if (videos.length === 0) return null;

    return (
      <div key={title} className="history-group">
        <h3 className="history-group-title">{title}</h3>
        <div className="history-list">
          {videos.map((entry, idx) => {
            const video = entry.video || entry.videoId;
            if (!video) return null;

            return (
              <div
                key={`${title}-${video._id}-${idx}`}
                className="history-list-item"
                onClick={() => navigate(`/video/${video._id}`)}
              >
                <div className="history-list-thumb-wrap">
                  <img
                    src={video.thumbnail || "/default-thumb.svg"}
                    alt={video.title}
                    className="history-list-thumb"
                  />
                </div>
                <div className="history-list-info">
                  <h4 className="history-list-title">{video.title}</h4>
                  <p className="history-list-channel">
                    {video.ownerDetails?.username || video.owner?.username || "Unknown"}
                  </p>
                  <p className="history-list-time">
                    Watched{" "}
                    {new Date(entry.watchedAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {typeof video.views === "number" && (
                      <>
                        <span className="dot">•</span>
                        <span>{video.views.toLocaleString()} views</span>
                      </>
                    )}
                    {typeof video.likesCount === "number" && (
                      <>
                        <span className="dot">•</span>
                        <span>{video.likesCount.toLocaleString()} likes</span>
                      </>
                    )}
                  </p>
                </div>
                <div className="history-list-actions" onClick={(e) => e.stopPropagation()}>
                  <VideoMenu
                    video={video}
                    onAddToPlaylist={menu.handleAddToPlaylist}
                    onWatchLaterToggle={menu.handleWatchLater}
                    onAboutCreator={menu.handleAboutCreator}
                    onNotInterested={menu.handleNotInterested}
                  />
                  <button
                    className="history-list-remove"
                    onClick={(e) => { e.stopPropagation(); removeFromHistory(video._id); }}
                    title="Remove from history"
                    aria-label="Remove from history"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><path d="M18 6L6 18M6 6l12 12"/></svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="watch-history-page">
      <LoginPrompt
        isOpen={menu.showLoginPrompt}
        message="You must be logged in to perform this action."
        onClose={() => menu.setShowLoginPrompt(false)}
      />
      <PlaylistSelectionModal
        isOpen={menu.showPlaylistModal}
        onClose={() => menu.setShowPlaylistModal(false)}
        videoId={menu.playlistVideoId}
        onAdded={() => menu.setShowPlaylistModal(false)}
      />

      <div className="history-layout">
        {/* ── Left: video list ── */}
        <div className="history-main">
          <h1 className="history-page-title">Watch history</h1>

          {activePanel === "history" && (
            <div className="history-tabs" role="tablist" aria-label="History filters">
              <button
                type="button"
                className={`history-tab ${activeFilter === "all" ? "active" : ""}`}
                onClick={() => setActiveFilter("all")}
              >
                All
              </button>
              <button
                type="button"
                className={`history-tab ${activeFilter === "videos" ? "active" : ""}`}
                onClick={() => setActiveFilter("videos")}
              >
                Videos
              </button>
              
              <button
                type="button"
                className={`history-tab ${activeFilter === "tweets" ? "active" : ""}`}
                onClick={() => setActiveFilter("tweets")}
              >
                Tweets
              </button>
            </div>
          )}

          {loading && <p className="loading">Loading...</p>}

          {activePanel === "comments" ? (
            <div className="history-comments">
              <div className="history-comments-header">
                <h2>Your comments</h2>
                <button type="button" onClick={() => setActivePanel("history")}>Back to history</button>
              </div>
              {commentsLoading ? (
                <p className="loading">Loading comments...</p>
              ) : userComments.length === 0 ? (
                <p className="no-history">No comments yet.</p>
              ) : (
                <div className="history-comments-list">
                  {userComments.map((comment) => (
                    <div key={comment._id} className="history-comment-card">
                      <div className="history-comment-content">{comment.content}</div>
                      <div className="history-comment-meta">
                        <span className="history-comment-type">{comment.refType}</span>
                        <span className="dot">•</span>
                        <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                        <button
                          type="button"
                          className="history-comment-link"
                          onClick={() => {
                            if (comment.refType === "video") navigate(`/video/${comment.refId}`);
                            if (comment.refType === "tweet") navigate(`/tweet/${comment.refId}`);
                          }}
                        >
                          View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : !hasHistory && !hasTweetHistory && !loading ? (
            <p className="no-history">No videos in your watch history.</p>
          ) : (
            <div>
              {showVideos && (
                <>
                  {renderGroup("Today", historyGroups.today)}
                  
                  {showTweets && tweetsToday.length > 0 && (
                    <div className="history-group">
                      <div className="history-group-head">
                        <h3 className="history-group-title">Today</h3>
                        <span className="history-group-tag">Tweets</span>
                      </div>
                      <div className="history-tweets-list">
                        {tweetsToday.map((entry) => (
                          <div
                            key={entry?.tweet?._id}
                            className="history-tweet-card"
                            onClick={() => navigate(`/tweet/${entry?.tweet?._id}`)}
                          >
                            <div className="history-tweet-content">
                              {entry?.tweet?.content || "(empty tweet)"}
                            </div>
                            <div className="history-tweet-meta">
                              <span>{entry?.tweet?.owner?.username || "Creator"}</span>
                              <span className="dot">•</span>
                              <span>
                                {entry?.visitedAt ? new Date(entry.visitedAt).toLocaleDateString() : ""}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {renderGroup("Yesterday", historyGroups.yesterday)}
                  {groupOlderByDate(historyGroups.older).map((group) =>
                    renderGroup(group.label, group.items)
                  )}
                </>
              )}

              

              {showTweets && (
                <div className="history-group">
                  <h3 className="history-group-title">Tweets</h3>
                  {hasTweetHistory ? (
                    <div className="history-tweets-list">
                      {tweetHistory.map((entry) => (
                        <div
                          key={entry?.tweet?._id}
                          className="history-tweet-card"
                          onClick={() => navigate(`/tweet/${entry?.tweet?._id}`)}
                        >
                          <div className="history-tweet-content">
                            {entry?.tweet?.content || "(empty tweet)"}
                          </div>
                          <div className="history-tweet-meta">
                            <span>{entry?.tweet?.owner?.username || "Creator"}</span>
                            <span className="dot">•</span>
                            <span>{entry?.visitedAt ? new Date(entry.visitedAt).toLocaleDateString() : ""}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="no-history">No tweet history yet.</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Right: sidebar ── */}
        <aside className="history-sidebar">
          <div className="history-sidebar-section">
            <button className="history-sidebar-action" onClick={clearHistory}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="20" height="20"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
              Clear all watch history
            </button>
            <button className="history-sidebar-action" onClick={toggleHistoryPause}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="20" height="20"><circle cx="12" cy="12" r="10"/><line x1="10" y1="15" x2="10" y2="9"/><line x1="14" y1="15" x2="14" y2="9"/></svg>
              {historyPaused ? "Resume watch history" : "Pause watch history"}
            </button>
            <button className="history-sidebar-action">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="20" height="20"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>
              Manage all history
            </button>
          </div>
          <hr className="history-sidebar-divider" />
          <div className="history-sidebar-section">
            <p className="history-sidebar-label">Other activity you may want to manage</p>
            <button
              className={`history-sidebar-link ${activePanel === "comments" ? "active" : ""}`}
              onClick={() => {
                setActivePanel("comments");
                fetchUserComments();
              }}
            >
              Comments
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
