import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Comment from "../../components/comment/Comment";
import { useDispatch, useSelector } from "react-redux";
import { toggleSubscribedChannel } from "../../features/authSlice.js";
import AllVideoComments from "../../components/comment/AllVideoComments";
import LoginPrompt from "../../components/LoginPrompt";
import VideoMenu from "../../components/VideoMenu/VideoMenu.jsx";
import PlaylistSelectionModal from "../../components/PlaylistSelectionModal.jsx";
import useVideoMenuActions from "../../hooks/useVideoMenuActions.js";
import { useToast } from "../../components/Toast/Toast.jsx";
import "./videoPage.css";

function VideoPage() {
  const videoId = useParams().id;
  const[likeAdded,setAddlike]=useState(false);   
  const [video, setVideo] = useState(null);
  const userdata = useSelector((state)=>state.auth.userData)
  const subscribedChannels = useSelector((state) => state.auth.subscribedChannels || []);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [commentsRefresh, setCommentsRefresh] = useState(0);

  const [isLiking, setIsLiking] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [recTab, setRecTab] = useState("recommended");
  const [recommendedVideos, setRecommendedVideos] = useState([]);
  const [channelVideos, setChannelVideos] = useState([]);
  const [trendingVideos, setTrendingVideos] = useState([]);
  const [likeCount, setLikeCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [sequenceIds, setSequenceIds] = useState([]);
  const [sequenceIndex, setSequenceIndex] = useState(0);
  const { showToast } = useToast();
  const menu = useVideoMenuActions(navigate, {
    show: showLoginPrompt,
    set: setShowLoginPrompt,
  });

  const addLike = async () => {
    try {
      setIsLiking(true);
      const res = await axios.post(
        `/api/v1/like/toggle/v/${videoId}`,
        {},
        { withCredentials: true }
      );

      const liked = res?.data?.data?.liked;
      setAddlike(!!liked);
      if (liked) setDisliked(false);
      setLikeCount((prev) => (liked ? prev + 1 : Math.max(0, prev - 1)));
      showToast(liked ? "❤ Liked!" : "Like removed", liked ? "success" : "info", 2000);

    } catch (error) {
      const status = error?.response?.status;
      if (status === 401) {
        setShowLoginPrompt(true);
        return;
      }
      console.log("Error while adding like:", error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleDislike = () => {
    setDisliked((prev) => {
      const newVal = !prev;
      if (newVal) setAddlike(false);
      return newVal;
    });
  };

  const handleShare = async () => {
    try {
      const shareUrl = window.location.href;
      await navigator.clipboard.writeText(shareUrl);
      showToast("Link copied to clipboard!", "info", 2500);
    } catch (error) {
      console.log("Error copying link:", error);
    }
  };

  const handleNextVideo = () => {
    if (sequenceIndex >= sequenceIds.length - 1) return;
    const nextIndex = sequenceIndex + 1;
    const nextId = sequenceIds[nextIndex];
    if (!nextId) return;
    try {
      sessionStorage.setItem("videoSequence", JSON.stringify({ ids: sequenceIds, index: nextIndex }));
    } catch (err) {
      // ignore storage failures
    }
    navigate(`/video/${nextId}`);
  };

  const handlePrevVideo = () => {
    if (sequenceIndex <= 0) return;
    const prevIndex = sequenceIndex - 1;
    const prevId = sequenceIds[prevIndex];
    if (!prevId) return;
    try {
      sessionStorage.setItem("videoSequence", JSON.stringify({ ids: sequenceIds, index: prevIndex }));
    } catch (err) {
      // ignore storage failures
    }
    navigate(`/video/${prevId}`);
  };

  const handleSubscribe = async () => {
    try {
      setIsSubscribing(true);
      const channelId = video?.owner?._id || video?.owner;
      if (!channelId) {
        showToast("No channel id available", "error");
        return;
      }

      const res = await axios.post(
        `/api/v1/channel/c/${channelId}`,
        {},
        { withCredentials: true }
      );

      const subscribedFlag = res?.data?.subscribed;
      setSubscribed(!!subscribedFlag);
      if (channelId) {
        dispatch(toggleSubscribedChannel(String(channelId)));
      }
      showToast(
        res?.data?.message || (subscribedFlag ? "✓ Subscribed!" : "Unsubscribed"),
        subscribedFlag ? "success" : "info"
      );
      console.log("Subscribe response:", res.data);
    } catch (error) {
      const status = error?.response?.status;
      if (status === 401) {
        setShowLoginPrompt(true);
        return;
      }
      console.log("Error while subscribing:", error);
      showToast("Subscription failed", "error");
    } finally {
      setIsSubscribing(false);
    }
  };

  const playVideo = async () => {
    try {
      const result = await axios.get(
        `/api/v1/videos/${videoId}`,
        { withCredentials: true }
      );

      setVideo(result.data.video);
      try {
        await axios.post(`/api/v1/users/history/${videoId}`, {}, { withCredentials: true });
      } catch (err) {
        // Ignore history errors so video playback is not blocked
      }
      // persist currently playing video so other pages (home) can show a miniplayer
      try {
        sessionStorage.setItem(
          "currentVideo",
          JSON.stringify({ _id: result.data.video._id, title: result.data.video.title, videoFile: result.data.video.videoFile })
        );
      } catch (err) {
        console.log("Could not persist current video:", err);
      }

      console.log("The video is set");
      
    } catch (error) {
      // Error fetching video
      console.log('Error while fetching the videos!!');
      
    }
  };

  // Persisted video is saved to sessionStorage and a separate Miniplayer shows on other pages.
  // Keep logic minimal in this component; no scroll-based miniplayer to avoid layout jumps.

  useEffect(() => {
    playVideo();
  }, [videoId]); // runs whenever id changes

  useEffect(() => {
    if (!videoId) return;
    const timeoutId = setTimeout(async () => {
      try {
        const res = await axios.post(`/api/v1/videos/${videoId}/view`, {}, { withCredentials: true });
        const views = res.data?.data?.views;
        if (typeof views === "number") {
          setVideo((prev) => (prev ? { ...prev, views } : prev));
        }
      } catch (err) {
        // ignore view count errors
      }
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [videoId]);

  useEffect(() => {
    if (!videoId) return;
    const loadCounts = async () => {
      try {
        const [likesRes, commentsRes] = await Promise.all([
          axios.get(`/api/v1/like/v/${videoId}`, { withCredentials: true }),
          axios.get(`/api/v1/comments/${videoId}?refType=video`, { withCredentials: true }),
        ]);
        const likes = likesRes.data?.data || [];
        setLikeCount(likes.length || 0);
        const currentUserId = userdata?._id;
        if (currentUserId) {
          setAddlike(likes.some((l) => (l.likedBy?._id || l.likedBy) === currentUserId));
        } else {
          setAddlike(false);
        }
        const total = commentsRes.data?.data?.pagination?.total || 0;
        setCommentCount(total);
      } catch (err) {
        setLikeCount(0);
        setCommentCount(0);
      }
    };

    loadCounts();
  }, [videoId, commentsRefresh, userdata?._id]);

  useEffect(() => {
    const channelId = video?.owner?._id || video?.owner;
    if (!channelId) return;
    setSubscribed(subscribedChannels.includes(String(channelId)));
  }, [video, subscribedChannels]);

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        const res = await axios.get("/api/v1/videos?limit=12");
        const items = res.data?.videos || [];
        const filtered = items.filter((item) => item._id !== videoId);
        setRecommendedVideos(filtered);
        setTrendingVideos(
          [...filtered].sort((a, b) => (b.views || 0) - (a.views || 0))
        );
      } catch (err) {
        setRecommendedVideos([]);
        setTrendingVideos([]);
      }
    };

    const loadChannelVideos = async () => {
      try {
        const channelId = video?.owner?._id || video?.owner;
        if (!channelId) return;
        const res = await axios.get(`/api/v1/videos?owner=${channelId}`);
        const items = res.data?.videos || [];
        setChannelVideos(items.filter((item) => item._id !== videoId));
      } catch (err) {
        setChannelVideos([]);
      }
    };

    loadRecommendations();
    loadChannelVideos();
  }, [videoId, video?.owner]);

  useEffect(() => {
    if (!videoId) return;
    let stored = null;
    try {
      stored = JSON.parse(sessionStorage.getItem("videoSequence") || "null");
    } catch (err) {
      stored = null;
    }

    if (stored?.ids?.length) {
      const idx = stored.ids.indexOf(videoId);
      if (idx >= 0) {
        setSequenceIds(stored.ids);
        setSequenceIndex(Number.isInteger(stored.index) ? stored.index : idx);
        return;
      }
    }

    if (video?.category && recommendedVideos.length) {
      const sameCategory = recommendedVideos
        .filter((item) => item.category === video.category)
        .map((item) => item._id);
      const ids = [videoId, ...sameCategory];
      setSequenceIds(ids);
      setSequenceIndex(0);
      try {
        sessionStorage.setItem("videoSequence", JSON.stringify({ ids, index: 0 }));
      } catch (err) {
        // ignore storage failures
      }
    }
  }, [videoId, video?.category, recommendedVideos]);

  // clear persisted video when we are on the video page (so miniplayer is hidden while on video page)
  useEffect(() => {
    try {
      sessionStorage.removeItem("currentVideo");
    } catch (err) {
      // ignore
    }
  }, []);

  if (!video) return <p>Loading...</p>;

  return (
    <div className="video-page">
      <LoginPrompt
        isOpen={showLoginPrompt}
        message="You must be logged in to perform this action."
        onClose={() => setShowLoginPrompt(false)}
      />
      <PlaylistSelectionModal
        isOpen={menu.showPlaylistModal}
        onClose={() => menu.setShowPlaylistModal(false)}
        videoId={menu.playlistVideoId}
        onAdded={() => menu.setShowPlaylistModal(false)}
      />
      <div className="video-main">
        <div className="video-player">
          <video controls className="video-element">
            <source src={video.videoFile} type="video/mp4" />
          </video>
          <div className="video-nav">
            <button
              type="button"
              className="video-nav-btn video-nav-prev"
              onClick={handlePrevVideo}
              disabled={sequenceIndex <= 0}
              aria-label="Previous video"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><path d="M15 18l-6-6 6-6"/></svg>
              <span>Prev</span>
            </button>
            <button
              type="button"
              className="video-nav-btn video-nav-next"
              onClick={handleNextVideo}
              disabled={sequenceIndex >= sequenceIds.length - 1}
              aria-label="Next video"
            >
              <span>Next</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          </div>
        </div>

        <div className="video-details">
          <h2 className="video-title">{video.title}</h2>
          <div className="video-stats">
            <span>{typeof video.views === "number" ? `${video.views.toLocaleString()} views` : "0 views"}</span>
            <span className="dot">•</span>
            <span>{likeCount.toLocaleString()} likes</span>
            <span className="dot">•</span>
            <span>{video.createdAt ? new Date(video.createdAt).toLocaleDateString() : ""}</span>
          </div>

          <div className="video-actions">
            <div className="left">
              <button className="action-btn" onClick={addLike} disabled={isLiking}>
                {likeAdded ? "Liked" : "Like"} ({likeCount})
              </button>
              <button className={`action-btn ${disliked ? 'active' : ''}`} onClick={handleDislike}>
                {disliked ? "Disliked" : "Dislike"}
              </button>
              <button className="action-btn" onClick={handleShare}>Share</button>
            </div>
            <div className="right">
              <button className="subscribe-btn" onClick={handleSubscribe} disabled={isSubscribing}>
                {subscribed ? "Subscribed" : "Subscribe"}
              </button>
            </div>
          </div>

          <div className="channel-line">
            <img
              src={video?.ownerDetails?.avatar || video?.owner?.avatar || "/default-avatar.png"}
              alt="avatar"
              className="channel-avatar"
            />
            <div>
              <div
                className="channel-name"
                onClick={() =>
                  (video?.ownerDetails?.username || video?.owner?.username) &&
                  navigate(`/profile/${video.ownerDetails?.username || video.owner?.username}`)
                }
                style={{
                  cursor:
                    video?.ownerDetails?.username || video?.owner?.username
                      ? "pointer"
                      : "default",
                }}
              >
                {video?.ownerDetails?.username || video?.owner?.username || "Channel"}
              </div>
              <div className="video-id">Video ID: {video._id}</div>
            </div>
          </div>

          <p className="video-description">{video.description}</p>

          <div className="comments-section">
            <div className="comment-count">Comments ({commentCount})</div>
            <Comment videoId={video._id} onCommentAdded={() => setCommentsRefresh((s) => s + 1)} />
            <AllVideoComments videoId={video._id} refresh={commentsRefresh} />
          </div>
        </div>
      </div>

      <aside className="recommended">
        <div className="rec-header">
          <button
            className={`rec-btn ${recTab === "recommended" ? "active" : ""}`}
            onClick={() => setRecTab("recommended")}
          >
            Recommended
          </button>
          <button
            className={`rec-btn ${recTab === "channel" ? "active" : ""}`}
            onClick={() => setRecTab("channel")}
          >
            From this channel
          </button>
          <button
            className={`rec-btn ${recTab === "trending" ? "active" : ""}`}
            onClick={() => setRecTab("trending")}
          >
            Trending
          </button>
        </div>

        <div className="rec-list">
          {(() => {
            if (recTab === "channel") return channelVideos;
            if (recTab === "trending") return trendingVideos;
            if (video?.category) {
              const sameCategory = recommendedVideos.filter((item) => item.category === video.category);
              return sameCategory.length ? sameCategory : recommendedVideos;
            }
            return recommendedVideos;
          })().map((item) => (
            <div className="rec-item" key={item._id} onClick={() => navigate(`/video/${item._id}`)}>
              <VideoMenu
                video={item}
                onAddToPlaylist={menu.handleAddToPlaylist}
                onWatchLaterToggle={menu.handleWatchLater}
                onAboutCreator={menu.handleAboutCreator}
                onNotInterested={menu.handleNotInterested}
              />
              <img src={item.thumbnail || "/default-thumb.svg"} alt="rec" />
              <div>
                {item.title}
                <br />
                <small style={{ color: "var(--text-secondary)" }}>{item.ownerDetails?.username || "Channel"}</small>
              </div>
            </div>
          ))}
          {recTab === "channel" && channelVideos.length === 0 && <p>No videos from this channel yet.</p>}
          {recTab === "trending" && trendingVideos.length === 0 && <p>No trending videos yet.</p>}
          {recTab === "recommended" && recommendedVideos.length === 0 && <p>No recommendations yet.</p>}
        </div>
      </aside>
    </div>
  );
}

export default VideoPage;


