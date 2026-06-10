import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import "./Footer.css";

const GitHubIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.341-3.369-1.341-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836a9.59 9.59 0 012.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
  </svg>
);

const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.741l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const LinkedInIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

export default function Footer() {
  const isLoggedIn = useSelector((state) => state.auth?.status || false);

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          {/* Brand */}
          <div className="footer-section footer-brand">
            <div className="footer-logo">
              <div className="footer-logo-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7L8 5z"/>
                </svg>
              </div>
              <span className="footer-logo-text">MyTube</span>
            </div>
            <p>A video platform built for creators and viewers. Share, discover, and connect with communities you love.</p>
            <div className="social-links">
              <a href="https://github.com/dev-adeel-arshad" aria-label="GitHub" target="_blank" rel="noreferrer">
                <GitHubIcon />
              </a>
              <span className="social-icon" aria-label="X / Twitter">
                <XIcon />
              </span>
              <a href="https://www.linkedin.com/in/adeel-arshad-dev" aria-label="LinkedIn" target="_blank" rel="noreferrer">
                <LinkedInIcon />
              </a>
            </div>
          </div>

          {/* Explore */}
          <div className="footer-section">
            <h4>Explore</h4>
            <ul>
              <li><Link to="/home">Home</Link></li>
              <li><Link to="/tweets">Tweets</Link></li>
              {isLoggedIn && <li><Link to="/subscriptions">Subscriptions</Link></li>}
            </ul>
          </div>

          {/* About */}
          <div className="footer-section">
            <h4>About</h4>
            <ul>
              <li><Link to="/about">About MyTube</Link></li>
              <li><Link to="/creators">Creators</Link></li>
              <li><Link to="/terms">Terms</Link></li>
              <li><Link to="/privacy">Privacy</Link></li>
            </ul>
          </div>

          {/* Library */}
          {isLoggedIn && (
            <div className="footer-section">
              <h4>Your Library</h4>
              <ul>
                <li><Link to="/history">History</Link></li>
                <li><Link to="/liked-videos">Liked Videos</Link></li>
                <li><Link to="/watch-later">Watch Later</Link></li>
                <li><Link to="/studio">Studio</Link></li>
              </ul>
            </div>
          )}
        </div>

        <div className="footer-bottom">
          <p className="footer-copy">© {new Date().getFullYear()} MyTube. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
