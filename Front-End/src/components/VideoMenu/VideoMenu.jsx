import { useEffect, useRef, useState } from "react";
import "./VideoMenu.css";

export default function VideoMenu({
  video,
  onAddToPlaylist,
  onWatchLaterToggle,
  onAboutCreator,
  onNotInterested,
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const onDocumentClick = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", onDocumentClick);
    return () => document.removeEventListener("click", onDocumentClick);
  }, []);

  return (
    <div
      className="video-menu-wrapper"
      ref={wrapperRef}
      onClick={(event) => event.stopPropagation()}
    >
      <button className="three-dots" type="button" onClick={() => setOpen((v) => !v)} aria-label="More options">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="5"  r="2"/>
          <circle cx="12" cy="12" r="2"/>
          <circle cx="12" cy="19" r="2"/>
        </svg>
      </button>

      {open && (
        <div className="video-menu-dropdown">
          <button type="button" onClick={() => { setOpen(false); onAboutCreator?.(video); }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a5 5 0 110 10A5 5 0 0112 2zm0 12c5.33 0 8 2.67 8 4v2H4v-2c0-1.33 2.67-4 8-4z"/></svg>
            About the creator
          </button>
          <button type="button" onClick={() => { setOpen(false); onWatchLaterToggle?.(video); }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm.5 5v5.25l4.5 2.67-.75 1.23L11 13V7h1.5z"/></svg>
            Add to Watch Later
          </button>
          <button type="button" onClick={() => { setOpen(false); onAddToPlaylist?.(video); }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M3 5h14v2H3V5zm0 4h14v2H3V9zm0 4h8v2H3v-2zm16 0v-3l5 4-5 4v-3h-4v-2h4z"/></svg>
            Save to playlist
          </button>
          <button type="button" className="vm-danger" onClick={() => { setOpen(false); onNotInterested?.(video); }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/></svg>
            Not interested
          </button>
        </div>
      )}
    </div>
  );
}
