import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Sidebar.css";

function Sidebar({ isScrolling }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => {
    if (path === "/home" && (location.pathname === "/" || location.pathname === "/home")) return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <aside className={`sidebar-nav ${isScrolling ? "scrolling" : ""}`}>
      <button
        className={`sidebar-nav-btn ${isActive("/home") ? "active" : ""}`}
        onClick={() => navigate("/home")}
        title="Home"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
        </svg>
        <span>Home</span>
      </button>

      

      <button
        className={`sidebar-nav-btn ${isActive("/subscriptions") ? "active" : ""}`}
        onClick={() => navigate("/subscriptions")}
        title="Subscriptions"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v8a1 1 0 001.555.832l5-4-5-4z" />
        </svg>
        <span>Subscriptions</span>
      </button>

      <button
        className={`sidebar-nav-btn ${isActive("/library") ? "active" : ""}`}
        onClick={() => navigate("/library")}
        title="You"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
        </svg>
        <span>You</span>
      </button>
      <button
        className={`sidebar-nav-btn ${isActive("/tweets") ? "active" : ""}`}
        onClick={() => navigate("/tweets")}
        title="Tweets"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M4 4h16v10H5.17L4 15.17V4zm0 12h14v2H4v-2z" />
        </svg>
        <span>Tweets</span>
      </button>

      <button
        className={`sidebar-nav-btn ${isActive("/studio") ? "active" : ""}`}
        onClick={() => navigate("/studio")}
        title="Studio"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M4 6h16v12H4V6zm2 2v8h12V8H6zm3 1h6v2H9V9zm0 3h6v2H9v-2z" />
        </svg>
        <span>Studio</span>
      </button>
    </aside>
  );
}

export default Sidebar;
