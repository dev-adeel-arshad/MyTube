
import { useState, useEffect } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { toggleSubscribedChannel } from "../../features/authSlice.js";
import "./profilePage.css";
import "../videoPage/videoPage.css";
import Tweet from "../../components/tweet/Tweet";
import VideoMenu from "../../components/VideoMenu/VideoMenu.jsx";
import PlaylistSelectionModal from "../../components/PlaylistSelectionModal.jsx";
import LoginPrompt from "../../components/LoginPrompt.jsx";
import useVideoMenuActions from "../../hooks/useVideoMenuActions.js";
import { useToast } from "../../components/Toast/Toast.jsx";

// Helper: fetch all videos for a user
async function fetchUserVideos(userId) {
    try {
        const res = await axios.get(`/api/v1/videos?owner=${userId}`);
        return res.data?.videos || [];
    } catch {
        return [];
    }
}

function normalizeHistoryItems(payload) {
    if (Array.isArray(payload)) return payload;
    if (payload?.items) return payload.items;
    if (payload?.grouped) {
        return [
            ...(payload.grouped.today || []),
            ...(payload.grouped.yesterday || []),
            ...(payload.grouped.older || []),
        ].map((entry) => entry.video || entry.videoId).filter(Boolean);
    }
    return [];
}

const formatChannelAge = (dateValue) => {
    if (!dateValue) return "";
    const created = new Date(dateValue);
    const now = new Date();
    const years = now.getFullYear() - created.getFullYear();
    const months = now.getMonth() - created.getMonth() + years * 12;
    if (months <= 0) return "Joined this month";
    if (months < 12) return `Joined ${months} month${months > 1 ? "s" : ""} ago`;
    const yrs = Math.floor(months / 12);
    return `Joined ${yrs} year${yrs > 1 ? "s" : ""} ago`;
};

export default function ProfilePage() {
    const { username } = useParams();
    const dispatch = useDispatch();
    const currentUser = useSelector((s) => s.auth.userData);
    const subscribedChannels = useSelector((s) => s.auth.subscribedChannels || []);
    const [channel, setChannel] = useState(currentUser || null);
    const [activeTab, setActiveTab] = useState("home");
    const [subscribed, setSubscribed] = useState(false);
    const [watchHistory, setWatchHistory] = useState([]);
    const { showToast } = useToast();
    const [likedVideos, setLikedVideos] = useState([]);
    const [userTweets, setUserTweets] = useState([]);
    const [userVideos, setUserVideos] = useState([]);
    
    const [userPlaylists, setUserPlaylists] = useState([]);
    const [videoSort, setVideoSort] = useState("newest");
    const navigate = useNavigate();
    const menu = useVideoMenuActions(navigate);

    useEffect(() => {
        setChannel(null);
        setUserVideos([]);
        setUserPlaylists([]);
        setUserTweets([]);
    }, [username]);

    
    
    useEffect(() => {
        // if route has a username, try to fetch channel profile
        const load = async () => {
            const targetUsername = username || currentUser?.username;
            if (targetUsername) {
                try {
                    const res = await axios.get(`/api/v1/users/c/${targetUsername}`, {
                        withCredentials: true,
                    });
                    // API response format may vary
                    setChannel(res.data?.data || res.data);
                } catch (err) {
                    console.log("Error fetching channel:", err);
                }
            } else {
                setChannel(currentUser);
            }
        };

        load();
    }, [username, currentUser]);

    // Fetch watch history and liked videos
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await axios.get(`/api/v1/users/history`, { withCredentials: true });
                setWatchHistory(normalizeHistoryItems(res.data?.data));
            } catch (err) {
                console.log("Error fetching watch history:", err);
            }
        };

        const fetchLikedVideos = async () => {
            try {
                const res = await axios.get(`/api/v1/like/videos`, { withCredentials: true });
                const items = Array.isArray(res.data?.data)
                    ? res.data.data.map((item) => item.video || item)
                    : [];
                setLikedVideos(items);
            } catch (err) {
                console.log("Error fetching liked videos:", err);
            }
        };

        const fetchUserTweets = async () => {
            try {
                const userId = channel?._id;
                if (!userId) return;
                const res = await axios.get(`/api/v1/tweets/user/${userId}`, { 
                    withCredentials: true 
                });
                setUserTweets(res.data?.tweets || res.data?.data || []);
            } catch (err) {
                setUserTweets([]);
            }
        };

        const fetchUserVideosLocal = async () => {
            try {
                const userId = channel?._id;
                if (!userId) return;
                // Try backend API for user videos
                const res = await axios.get(`/api/v1/videos?owner=${userId}`);
                setUserVideos(res.data?.videos || []);
            } catch (err) {
                setUserVideos([]);
            }
        };


        const fetchUserPlaylists = async () => {
            try {
                const userId = channel?._id;
                if (!userId) return;
                const url = isOwn
                    ? "/api/v1/playlists"
                    : `/api/v1/playlists/user/${userId}`;
                const res = await axios.get(url, { withCredentials: true });
                setUserPlaylists(res.data?.data || res.data?.playlists || []);
            } catch (err) {
                setUserPlaylists([]);
            }
        };

        const isOwn = currentUser && channel && (String(currentUser._id) === String(channel._id));
        if (isOwn) {
            fetchHistory();
            fetchLikedVideos();
        }
        
        // Fetch tweets for both own and other users' profiles
        if (channel?._id) {
            fetchUserTweets();
            fetchUserVideosLocal();
            fetchUserPlaylists();
        }
    }, [currentUser, channel]);

    const location = useLocation();
    const isOwn = currentUser && channel && (String(currentUser._id) === String(channel._id));

    const renderEmptyState = (title, description, ctaLabel, ctaAction) => (
        <div className="empty-state">
            <div className="empty-card">
                <h4>{title}</h4>
                <p>{description}</p>
                {ctaLabel && (
                    <button type="button" className="empty-cta" onClick={ctaAction}>
                        {ctaLabel}
                    </button>
                )}
            </div>
        </div>
    );

    useEffect(() => {
        // set subscribed state based on global subscriptions
        const channelId = channel?._id || channel?.id;
        if (channelId) {
            const fromList = subscribedChannels.includes(String(channelId));
            const fromChannel = channel?.isSubscribed;
            setSubscribed(fromChannel === true ? true : fromList);
        }

        // if navigated here with a preferred tab, set it
        if (location?.state?.tab) {
            setActiveTab(location.state.tab);
        }
    }, [channel, subscribedChannels, location]);

    const sortedVideos = [...userVideos].sort((a, b) => {
        const aDate = new Date(a.createdAt || 0).getTime();
        const bDate = new Date(b.createdAt || 0).getTime();
        return videoSort === "oldest" ? aDate - bDate : bDate - aDate;
    });

    const combinedItems = [
        ...userVideos.map((item) => ({ ...item, itemType: "video" })),
    ].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    const handleSubscribe = async () => {
        if (!channel) return;
        try {
            const channelId = channel._id || channel.id;
            const res = await axios.post(`/api/v1/channel/c/${channelId}`, {}, { withCredentials: true });
            setSubscribed(!!res?.data?.subscribed);
            // update redux subscribed list
            // dispatch via action string to avoid import changes here
            dispatch(toggleSubscribedChannel(String(channelId)));
            showToast(res?.data?.message || (res?.data?.subscribed ? "✓ Subscribed!" : "Unsubscribed"), res?.data?.subscribed ? "success" : "info");
        } catch (err) {
            console.log("Subscribe error:", err);
            showToast("Subscription failed", "error");
        }
    };

    const creatorCta = isOwn
        ? {
            label: "Open Studio",
            action: () => navigate("/studio"),
          }
        : null;

    const totalUploads = userVideos.length;
    const channelAge = formatChannelAge(channel?.createdAt);
    const totalViews = userVideos.reduce((sum, item) => sum + (item?.views || 0), 0);

    return (
        <div className="profile-page">
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
            <div className="profile-banner">
                <img className="cover" src={channel?.coverImage || "/default-cover.svg"} alt="cover" />
            </div>

            <div className="profile-top">
                <img className="profile-avatar" src={channel?.avatar || "/default-avatar.svg"} alt="avatar" />

                <div className="profile-info">
                    <div className="profile-name">{channel?.fullname || channel?.username || "Channel"}</div>
                    <div className="profile-meta">
                        {channel?.username ? `@${channel.username}` : ""} • {channel?.subscribersCount || 0} subscribers
                    </div>
                    <div className="profile-stats">
                        <span>{totalUploads} uploads</span>
                        <span>{totalViews.toLocaleString()} views</span>
                        <span>{channelAge || "Channel active"}</span>
                    </div>
                </div>

                <div className="subscribe-group">
                    {isOwn ? (
                        <>
                            <button className="subscribe-btn primary" onClick={() => navigate(`/profile/${currentUser?.username}`)}>
                                See Your Channel
                            </button>
                            <button className="subscribe-btn" onClick={() => navigate("/studio")}>
                                Customize Your Channel
                            </button>
                            <button className="subscribe-btn" onClick={() => navigate('/create-tweet')}>
                                See Your Tweets
                            </button>
                        </>
                    ) : (
                        <>
                            <button className={`subscribe-btn${subscribed ? " subscribed" : ""}`} onClick={handleSubscribe}>
                                {subscribed ? "Subscribed" : "Subscribe"}
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="channel-tabs">
                <button className={`tab-btn ${activeTab === "home" ? "active" : ""}`} onClick={() => setActiveTab("home")}>Home</button>
                <button className={`tab-btn ${activeTab === "videos" ? "active" : ""}`} onClick={() => setActiveTab("videos")}>Videos</button>
                
                <button className={`tab-btn ${activeTab === "tweets" ? "active" : ""}`} onClick={() => setActiveTab("tweets")}>Tweets</button>
                <button className={`tab-btn ${activeTab === "playlists" ? "active" : ""}`} onClick={() => setActiveTab("playlists")}>Playlists</button>
                <button className={`tab-btn ${activeTab === "about" ? "active" : ""}`} onClick={() => setActiveTab("about")}>About</button>
            </div>

            <div className="channel-content">
                {isOwn && activeTab === "history" && (
                    <div>
                        <h3>Watch History</h3>
                        {watchHistory.length === 0 ? (
                            <p>No watch history yet</p>
                        ) : (
                            <div className="channel-grid">
                                {watchHistory.map((item) => (
                                    <div className="video-card" key={item._id} onClick={() => navigate(`/video/${item._id}`)}>
                                        <VideoMenu
                                            video={item}
                                            onAddToPlaylist={menu.handleAddToPlaylist}
                                            onWatchLaterToggle={menu.handleWatchLater}
                                            onAboutCreator={menu.handleAboutCreator}
                                            onNotInterested={menu.handleNotInterested}
                                        />
                                        <img className="video-thumb" src={item.thumbnail || "/default-thumb.svg"} alt="thumb" />
                                        <div className="video-title">{item.title}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {isOwn && activeTab === "liked" && (
                    <div>
                        <h3>Liked Videos</h3>
                        {likedVideos.length === 0 ? (
                            <p>No liked videos yet</p>
                        ) : (
                            <div className="channel-grid">
                                {likedVideos.map((item) => (
                                    <div className="video-card" key={item._id} onClick={() => navigate(`/video/${item._id}`)}>
                                        <VideoMenu
                                            video={item}
                                            onAddToPlaylist={menu.handleAddToPlaylist}
                                            onWatchLaterToggle={menu.handleWatchLater}
                                            onAboutCreator={menu.handleAboutCreator}
                                            onNotInterested={menu.handleNotInterested}
                                        />
                                        <img className="video-thumb" src={item.thumbnail || "/default-thumb.svg"} alt="thumb" />
                                        <div className="video-title">{item.title}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {!isOwn && activeTab === "home" && (
                    <div>
                        <h3>All Videos</h3>
                                {combinedItems.length === 0 ? (
                                    renderEmptyState(
                                        "No uploads yet",
                                        "This creator has not uploaded any videos so far.",
                                        null,
                                        null
                                    )
                        ) : (
                            <div className="channel-grid">
                                {combinedItems.map((item) => (
                                    <div
                                        className="video-card"
                                        key={item._id}
                                        onClick={() =>
                                            item.itemType === "video"
                                                ? navigate(`/video/${item._id}`)
                                                : navigate(`/video/${item._id}`)
                                        }
                                    >
                                        {item.itemType === "video" && (
                                            <VideoMenu
                                                video={item}
                                                onAddToPlaylist={menu.handleAddToPlaylist}
                                                onWatchLaterToggle={menu.handleWatchLater}
                                                onAboutCreator={menu.handleAboutCreator}
                                                onNotInterested={menu.handleNotInterested}
                                            />
                                        )}
                                        <img
                                            className="video-thumb"
                                            src={item.thumbnail || "/default-thumb.svg"}
                                            alt="thumb"
                                        />
                                        <div className="video-title">
                                            {item.title || "Untitled"}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "home" && isOwn && (
                    <div className="profile-home-sections">
                        {/* ── Section 1: Featured / Most Recent ── */}
                        <section className="profile-home-section">
                            <div className="profile-section-header">
                                <h3>Featured</h3>
                            </div>
                            {sortedVideos.length === 0 ? (
                                renderEmptyState(
                                    "No uploads yet",
                                    "Start your creator journey by uploading your first video.",
                                    creatorCta?.label,
                                    creatorCta?.action
                                )
                            ) : (
                                <div className="channel-grid">
                                    {sortedVideos.slice(0, 6).map((video) => (
                                        <div className="video-card" key={video._id} onClick={() => navigate(`/video/${video._id}`)}>
                                            <VideoMenu
                                                video={video}
                                                onAddToPlaylist={menu.handleAddToPlaylist}
                                                onWatchLaterToggle={menu.handleWatchLater}
                                                onAboutCreator={menu.handleAboutCreator}
                                                onNotInterested={menu.handleNotInterested}
                                            />
                                            <div className="video-thumb-wrap">
                                                <img className="video-thumb" src={video.thumbnail || "/default-thumb.svg"} alt="thumb" />
                                            </div>
                                            <div className="video-title">{video.title}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        

                        {/* ── Section 3: All Videos ── */}
                        <section className="profile-home-section">
                            <div className="profile-section-header">
                                <h3>Videos</h3>
                                <button className="view-all-sm" onClick={() => setActiveTab("videos")}>View all</button>
                            </div>
                            {sortedVideos.length === 0 ? (
                                <p className="empty-inline">No videos yet.</p>
                            ) : (
                                <div className="channel-grid">
                                    {sortedVideos.map((video) => (
                                        <div className="video-card" key={video._id} onClick={() => navigate(`/video/${video._id}`)}>
                                            <VideoMenu
                                                video={video}
                                                onAddToPlaylist={menu.handleAddToPlaylist}
                                                onWatchLaterToggle={menu.handleWatchLater}
                                                onAboutCreator={menu.handleAboutCreator}
                                                onNotInterested={menu.handleNotInterested}
                                            />
                                            <div className="video-thumb-wrap">
                                                <img className="video-thumb" src={video.thumbnail || "/default-thumb.svg"} alt="thumb" />
                                            </div>
                                            <div className="video-title">{video.title}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>
                )}

                {activeTab === "videos" && (
                    <div>
                        <div className="profile-videos-header">
                            <h3>All Videos</h3>
                            <div className="sort-toggle">
                                <button
                                    className={`sort-btn${videoSort === "newest" ? " active" : ""}`}
                                    onClick={() => setVideoSort("newest")}
                                >
                                    Newest
                                </button>
                                <button
                                    className={`sort-btn${videoSort === "oldest" ? " active" : ""}`}
                                    onClick={() => setVideoSort("oldest")}
                                >
                                    Oldest
                                </button>
                            </div>
                        </div>
                        {sortedVideos.length === 0 ? (
                            renderEmptyState(
                                "No videos uploaded",
                                "Upload your first video to start building your channel.",
                                creatorCta?.label,
                                creatorCta?.action
                            )
                        ) : (
                            <div className="channel-grid">
                                {sortedVideos.map((video) => (
                                    <div className="video-card" key={video._id} onClick={() => navigate(`/video/${video._id}`)}>
                                        <VideoMenu
                                            video={video}
                                            onAddToPlaylist={menu.handleAddToPlaylist}
                                            onWatchLaterToggle={menu.handleWatchLater}
                                            onAboutCreator={menu.handleAboutCreator}
                                            onNotInterested={menu.handleNotInterested}
                                        />
                                        <img className="video-thumb" src={video.thumbnail || "/default-thumb.svg"} alt="thumb" />
                                        <div className="video-title">{video.title}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                

                {activeTab === "tweets" && (
                    <div>
                        <h3>Tweets</h3>
                        {userTweets.length === 0 ? (
                            renderEmptyState(
                                "No tweets yet",
                                "Share updates with your audience by posting a tweet.",
                                isOwn ? "Create a Tweet" : null,
                                isOwn ? () => navigate("/create-tweet") : null
                            )
                        ) : (
                            <div className="tweets-section">
                                {userTweets.map((tweet) => (
                                    <div 
                                        key={tweet._id} 
                                        onClick={() => navigate(`/tweet/${tweet._id}`)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <Tweet 
                                            tweet={tweet}
                                            onDelete={() => setUserTweets(userTweets.filter(t => t._id !== tweet._id))}
                                            onUpdate={(id, content) =>
                                                setUserTweets(userTweets.map(t => t._id === id ? { ...t, content } : t))
                                            }
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "playlists" && (
                    <div>
                        <h3>Playlists</h3>
                        {userPlaylists.length === 0 ? (
                            renderEmptyState(
                                "No playlists yet",
                                "Group your videos into playlists to help viewers binge your content.",
                                creatorCta?.label,
                                creatorCta?.action
                            )
                        ) : (
                            <div className="channel-grid">
                                {userPlaylists.map((playlist) => (
                                    <div className="video-card" key={playlist._id} onClick={() => navigate(`/playlist/${playlist._id}`)}>
                                        <img
                                            className="video-thumb"
                                            src={
                                                playlist.thumbnail ||
                                                playlist.videos?.[0]?.thumbnail ||
                                                "/default-thumb.svg"
                                            }
                                            alt="thumb"
                                        />
                                        <div className="video-title">
                                            {playlist.name}
                                            <div className="video-meta">{playlist.videos?.length || 0} videos</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "about" && (
                    <div>
                        <h3>About</h3>
                        <p>{channel?.bio || "This user has not added an about section yet."}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

