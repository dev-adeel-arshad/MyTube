import { useEffect, useState, useRef } from "react";
import axiosInstance from "@/api/axiosInstance";
import "./HomePage.css";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import VideoMenu from "../../components/VideoMenu/VideoMenu.jsx";
import PlaylistSelectionModal from "../../components/PlaylistSelectionModal.jsx";
import LoginPrompt from "../../components/LoginPrompt.jsx";
import useVideoMenuActions from "../../hooks/useVideoMenuActions.js";
import { VIDEO_CATEGORIES } from "../../utils/videoCategories.js";

function HomePage() {
  const navigate = useNavigate();
  const hiddenVideoIds = useSelector((state) => state.videos.hiddenVideoIds || []);
  const [videos, setVideos] = useState([]);
  const [page, setPage] = useState(1);
  const limit = 16;
  const [loading, setLoading] = useState(false);
  
  const [activeCategory, setActiveCategory] = useState("All");
  const menu = useVideoMenuActions(navigate);
  const filterRef = useRef(null);
  const scrollCats = (dir) => filterRef.current?.scrollBy({ left: dir * 200, behavior: "smooth" });

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);

        const res = await axiosInstance.get(`/v1/videos?page=${page}&limit=${limit}`);

        setVideos(res.data.videos);
      } catch (error) {
        console.error("Failed to fetch videos", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [page, limit]);

  

  const visibleVideos = videos.filter((video) => !hiddenVideoIds.includes(video._id));
  const filteredVideos = visibleVideos.filter((video) => {
    if (activeCategory === "All") return true;
    return (video.category || "Other") === activeCategory;
  });

  const handleVideoClick = (videoId, index) => {
    try {
      const queue = filteredVideos.map((item) => ({
        _id: item._id,
        title: item.title,
        videoFile: item.videoFile,
      }));
      sessionStorage.setItem(
        "miniplayerQueue",
        JSON.stringify({ ids: queue.map((item) => item._id), items: queue, index })
      );
    } catch (err) {
      // ignore storage failures
    }
    navigate(`/video/${videoId}`);
  };

  return (
    <>
      <LoginPrompt
        isOpen={menu.showLoginPrompt}
        message="You must be logged in to perform this action."
        onClose={() => menu.setShowLoginPrompt(false)}
      />

      <div className="home-feed">
        <div className="filter-bar-wrap">
          <button
            className="filter-scroll-btn filter-scroll-left"
            onClick={() => scrollCats(-1)}
            aria-label="Scroll categories left"
            type="button"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <div className="filter-bar" ref={filterRef} role="tablist" aria-label="Video categories">
            {VIDEO_CATEGORIES.map((category) => (
              <button
                key={category}
                type="button"
                className={`filter-btn ${activeCategory === category ? "active" : ""}`}
                onClick={() => setActiveCategory(category)}
                role="tab"
                aria-selected={activeCategory === category}
              >
                {category}
              </button>
            ))}
          </div>
          <button
            className="filter-scroll-btn filter-scroll-right"
            onClick={() => scrollCats(1)}
            aria-label="Scroll categories right"
            type="button"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>

        <div className="video-list">
        
        {loading && <p>Loading videos...</p>}

        {!loading &&
          filteredVideos.map((video, index) => (
            <div
              key={video._id}
              className="video-card"
              onClick={() => handleVideoClick(video._id, index)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleVideoClick(video._id, index);
              }}
            >
              <VideoMenu
                video={video}
                onAddToPlaylist={menu.handleAddToPlaylist}
                onWatchLaterToggle={menu.handleWatchLater}
                onAboutCreator={menu.handleAboutCreator}
                onNotInterested={menu.handleNotInterested}
              />
              <div className="video-thumb-wrap">
                <img src={video.thumbnail || "/default-thumb.svg"} alt={video.title} />
              </div>
              <div className="video-card-row">
                <div className="video-card-avatar">
                  {(video.ownerDetails?.avatar || video.owner?.avatar) ? (
                    <img src={video.ownerDetails?.avatar || video.owner?.avatar} alt="avatar" />
                  ) : (
                    (video.ownerDetails?.username || video.owner?.username || "?")[0]
                  )}
                </div>
                <div>
                  <h3>{video.title}</h3>
                  <div
                    className="video-meta"
                    onClick={(event) => { event.stopPropagation(); menu.handleAboutCreator(video); }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => { if (event.key === "Enter") menu.handleAboutCreator(video); }}
                  >
                    <span>{video.ownerDetails?.username || video.owner?.username || "Unknown"}</span>
                    {typeof video.views === "number" && (
                      <>
                        <span className="dot">•</span>
                        <span>{video.views.toLocaleString()} views</span>
                      </>
                    )}
                    <span className="dot">•</span>
                    <span>
                      {video.createdAt ? new Date(video.createdAt).toLocaleDateString() : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <PlaylistSelectionModal
        isOpen={menu.showPlaylistModal}
        onClose={() => menu.setShowPlaylistModal(false)}
        videoId={menu.playlistVideoId}
        onAdded={() => menu.setShowPlaylistModal(false)}
      />
      <div className="pagination">
        <button disabled={page === 1} onClick={() => setPage((prev) => prev - 1)}>
          Prev
        </button>
        <span>Page {page}</span>
        <button
          disabled={filteredVideos.length < limit}
          onClick={() => setPage((prev) => prev + 1)}
        >
          Next
        </button>
      </div>
    </>
  );
}

export default HomePage;





