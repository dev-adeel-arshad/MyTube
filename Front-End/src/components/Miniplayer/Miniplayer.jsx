import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./miniplayer.css";

export default function Miniplayer() {
  const [video, setVideo] = useState(null);
  const [visible, setVisible] = useState(false);
  const [closed, setClosed] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueue] = useState({ ids: [], index: 0, items: [] });
  const loc = useLocation();
  const navigate = useNavigate();
  const videoRef = useRef(null);

  useEffect(() => {
    try {
      const closedFlag = sessionStorage.getItem("miniplayerClosed");
      setClosed(!!closedFlag);
      const data = JSON.parse(sessionStorage.getItem("currentVideo"));
      setVideo(data);
      const queueData = JSON.parse(sessionStorage.getItem("miniplayerQueue"));
      if (queueData?.ids?.length) {
        const index = queueData.ids.indexOf(data?._id);
        setQueue({
          ids: queueData.ids,
          items: queueData.items || [],
          index: index >= 0 ? index : queueData.index || 0,
        });
      } else {
        setQueue({ ids: [], index: 0, items: [] });
      }
      // small mount animation
      setTimeout(() => setVisible(true), 60);
    } catch (err) {
      setVideo(null);
      setQueue({ ids: [], index: 0, items: [] });
    }
  }, [loc.pathname]);

  // Show miniplayer only when we are NOT on a video page, we have a persisted video, and it's not closed
  if (!video || loc.pathname.startsWith("/video/") || closed) return null;

  const openVideo = () => {
    navigate(`/video/${video._id}`);
  };

  const handleClose = (e) => {
    e.stopPropagation();
    setVisible(false);
    sessionStorage.setItem("miniplayerClosed", "1");
    // allow animation then hide
    setTimeout(() => setClosed(true), 250);
  };

  const togglePlay = () => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) {
      el.play();
      setIsPlaying(true);
    } else {
      el.pause();
      setIsPlaying(false);
    }
  };

  const handleNext = () => {
    if (!queue.ids.length || queue.index >= queue.ids.length - 1) return;
    const nextIndex = queue.index + 1;
    const nextId = queue.ids[nextIndex];
    if (!nextId) return;
    setQueue((prev) => ({ ...prev, index: nextIndex }));
    sessionStorage.setItem("miniplayerQueue", JSON.stringify({ ...queue, index: nextIndex }));
    navigate(`/video/${nextId}`);
  };

  const handlePrev = () => {
    if (!queue.ids.length || queue.index <= 0) return;
    const prevIndex = queue.index - 1;
    const prevId = queue.ids[prevIndex];
    if (!prevId) return;
    setQueue((prev) => ({ ...prev, index: prevIndex }));
    sessionStorage.setItem("miniplayerQueue", JSON.stringify({ ...queue, index: prevIndex }));
    navigate(`/video/${prevId}`);
  };

  return (
    <div className={`miniplayer ${visible ? "visible" : ""}`} onClick={openVideo} role="button">
      <div className="mini-top-controls" onClick={(event) => event.stopPropagation()}>
        <button
          className="mini-more"
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            setShowMenu((prev) => !prev);
          }}
          aria-label="More options"
        >
          ⋮
        </button>
        <button
          className="mini-close"
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            handleClose(event);
          }}
          aria-label="Close mini player"
        >
          ×
        </button>
        {showMenu && (
          <div className="mini-menu">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setShowMenu(false);
                openVideo();
              }}
            >
              Open
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setShowMenu(false);
                handleClose(event);
              }}
            >
              Close
            </button>
          </div>
        )}
      </div>
      <video
        ref={videoRef}
        className="mini-video"
        src={video.videoFile}
        muted
        playsInline
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
      <div className="mini-meta">
        <div className="mini-title">{video.title}</div>
        <div className="mini-actions" onClick={(event) => event.stopPropagation()}>
          {/* Previous */}
          <button
            className="mini-icon-btn"
            type="button"
            onClick={handlePrev}
            disabled={queue.index === 0}
            aria-label="Previous video"
            title="Previous"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/>
            </svg>
          </button>
          {/* Play / Pause */}
          <button
            className="mini-icon-btn mini-play-btn"
            type="button"
            onClick={togglePlay}
            aria-label={isPlaying ? "Pause" : "Play"}
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M6 19h4V5H6zm8-14v14h4V5z"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
            )}
          </button>
          {/* Next */}
          <button
            className="mini-icon-btn"
            type="button"
            onClick={handleNext}
            disabled={queue.index >= queue.ids.length - 1}
            aria-label="Next video"
            title="Next"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M6 18l8.5-6L6 6v12zm2-8.14L11.03 12 8 14.14V9.86zM16 6h2v12h-2z"/>
            </svg>
          </button>
          {/* Open full player */}
          <button
            className="mini-icon-btn mini-expand-btn"
            type="button"
            onClick={openVideo}
            aria-label="Open video page"
            title="Open"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M19 19H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

