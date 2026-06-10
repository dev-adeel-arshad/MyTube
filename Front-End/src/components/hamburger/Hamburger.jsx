import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./Hamburger.css";
import { useDispatch, useSelector } from "react-redux";
import { logOut } from "../../features/authSlice.js";
import axios from "axios";

function Hamburger({ isOpen, setIsOpen }) {
  const sidebarRef = useRef(null);
  const [subscribedChannels, setSubscribedChannels] = useState([]);
  const userData = useSelector((s) => s.auth.userData);
  const subscribedChannelsIds = useSelector((s) => s.auth.subscribedChannels || []);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => {
    if (path === "/home" && (location.pathname === "/" || location.pathname === "/home")) return true;
    return path !== "/home" && location.pathname.startsWith(path);
  };

  useEffect(() => {
    if (!userData?._id) {
      setSubscribedChannels([]);
      return;
    }

    if (!subscribedChannelsIds || subscribedChannelsIds.length === 0) {
      setSubscribedChannels([]);
      return;
    }

    const fetchSubscribedChannels = async () => {
      try {
        const channelsList = [];

        for (const channelId of subscribedChannelsIds) {
          try {
            const res = await axios.get(`/api/v1/users/${channelId}`, {
              withCredentials: true,
            });

            const channelData = res.data?.data || res.data;
            if (channelData && (channelData._id || channelData.username)) {
              channelsList.push(channelData);
            }
          } catch (err) {
            console.error("Hamburger channel fetch failed:", channelId, err);
          }
        }

        setSubscribedChannels(channelsList);
      } catch (error) {
        console.error("Hamburger fetch failed:", error);
        setSubscribedChannels([]);
      }
    };

    fetchSubscribedChannels();
  }, [userData?._id, subscribedChannelsIds.length]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.body.style.overflow = isOpen ? "hidden" : "auto";

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, setIsOpen]);

  const handleLogout = async () => {
    try {
      await axios.post("/api/v1/users/logout", {}, { withCredentials: true });
    } catch {
      // ignore logout errors
    } finally {
      dispatch(logOut());
      setIsOpen(false);
      navigate("/login");
    }
  };

  return (
    <>
      {isOpen && <div className="overlay" onClick={() => setIsOpen(false)} />}

      <aside ref={sidebarRef} className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <button
            className={`close-btn ${isOpen ? "active" : ""}`}
            onClick={() => setIsOpen(false)}
            aria-label="Close menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
          <div className="sidebar-logo">
            <img src="/logo.svg" alt="logo" />
            <span>MyTube</span>
          </div>
        </div>

        <hr />

        <div className="section">
          <Link to="/home" className={isActive("/home") ? "ham-active" : ""} onClick={() => setIsOpen(false)}>
            Home
          </Link>
          
          <Link to="/subscriptions" className={isActive("/subscriptions") ? "ham-active" : ""} onClick={() => setIsOpen(false)}>
            Subscriptions
          </Link>
        </div>

        <hr />

        <div className="section">
          <h4>Subscriptions</h4>
          {subscribedChannels.length > 0 ? (
            subscribedChannels.map((ch) => (
              <Link
                key={ch._id || ch.username}
                to={`/profile/${ch.username}`}
                onClick={() => setIsOpen(false)}
              >
                {ch.fullname || ch.username}
              </Link>
            ))
          ) : (
            <span style={{ fontSize: "12px", color: "var(--text-secondary)", padding: "0 16px 8px" }}>
              No subscriptions yet
            </span>
          )}
        </div>

        <hr />

        <div className="section">
          <h4>You</h4>
          <Link to="/library" className={isActive("/library") ? "ham-active" : ""} onClick={() => setIsOpen(false)}>
            Library
          </Link>
          <Link to="/history" className={isActive("/history") ? "ham-active" : ""} onClick={() => setIsOpen(false)}>
            History
          </Link>
          <Link to="/watch-later" className={isActive("/watch-later") ? "ham-active" : ""} onClick={() => setIsOpen(false)}>
            Watch Later
          </Link>
          <Link to="/playlists" className={isActive("/playlists") ? "ham-active" : ""} onClick={() => setIsOpen(false)}>
            Playlists
          </Link>
          <Link to="/liked-videos" className={isActive("/liked-videos") ? "ham-active" : ""} onClick={() => setIsOpen(false)}>
            Liked Videos
          </Link>
          <Link to="/tweets" className={isActive("/tweets") ? "ham-active" : ""} onClick={() => setIsOpen(false)}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" style={{marginRight:"6px",verticalAlign:"middle",flexShrink:0}}>
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.85L1.254 2.25H8.08l4.258 5.613 5.906-5.613z"/>
            </svg>
            Tweets
          </Link>
          <Link to="/studio" className={isActive("/studio") ? "ham-active" : ""} onClick={() => setIsOpen(false)}>
            Studio
          </Link>
        </div>

        <hr />

        <div className="section footer-links">
          <Link to="/about" className={isActive("/about") ? "ham-active" : ""} onClick={() => setIsOpen(false)}>
            About
          </Link>
          <Link to="/creators" className={isActive("/creators") ? "ham-active" : ""} onClick={() => setIsOpen(false)}>
            Creators
          </Link>
          <Link to="/terms" className={isActive("/terms") ? "ham-active" : ""} onClick={() => setIsOpen(false)}>
            Terms
          </Link>
          <Link to="/privacy" className={isActive("/privacy") ? "ham-active" : ""} onClick={() => setIsOpen(false)}>
            Privacy
          </Link>
        </div>

        {userData && (
          <div className="section logout-section">
            <button type="button" className="logout-btn" onClick={handleLogout}>
              Log out
            </button>
          </div>
        )}
      </aside>
    </>
  );
}

export default Hamburger;
