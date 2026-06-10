import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import "./AboutPage.css";

const FEATURES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
      </svg>
    ),
    title: "Video Sharing",
    desc: "Upload and share your videos with the world",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    title: "Connect & Subscribe",
    desc: "Follow creators and build your subscriber base",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    ),
    title: "Engage",
    desc: "Like videos, comment, and interact with content",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
      </svg>
    ),
    title: "Organize",
    desc: "Create playlists to organise your favourite videos",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
    title: "Analytics",
    desc: "Track your video performance in Studio",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    ),
    title: "Fast Streaming",
    desc: "High-quality streaming powered by modern tech",
  },
];

export default function AboutPage() {
  const navigate = useNavigate();
  const isLoggedIn = useSelector((state) => !!state.auth?.status);

  return (
    <div className="about-page">
      <div className="about-hero">
        <div className="about-hero-content">
          <h1>About MyTube</h1>
          <p className="subtitle">Your Premier Video Sharing Platform</p>
          <div className="about-hero-actions">
            {!isLoggedIn && (
              <>
                <button className="cta-btn primary" onClick={() => navigate("/home")}>Continue without account</button>
                <button className="cta-btn secondary" onClick={() => navigate("/login")}>Log in</button>
                <button className="cta-btn ghost" onClick={() => navigate("/signup")}>Create account</button>
              </>
            )}
            {isLoggedIn && (
              <button className="cta-btn primary" onClick={() => navigate("/home")}>Go to Home</button>
            )}
          </div>
        </div>
      </div>

      <div className="about-container">
        <section className="about-section">
          <h2>Our Mission</h2>
          <p>
            MyTube is a video sharing platform designed to empower creators and
            entertain audiences worldwide. We provide tools for content creators
            to share their creativity, connect with their audience, and build
            communities around their passion.
          </p>
        </section>

        <section className="about-section">
          <h2>What We Offer</h2>
          <div className="features-grid">
            {FEATURES.map((f) => (
              <div className="feature-card" key={f.title}>
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="about-section">
          <h2>Our Values</h2>
          <div className="values-list">
            <div className="value-item">
              <h4>Creativity First</h4>
              <p>We believe everyone has a story worth sharing</p>
            </div>
            <div className="value-item">
              <h4>Community Focused</h4>
              <p>Building connections between creators and viewers is at our core</p>
            </div>
            <div className="value-item">
              <h4>Inclusive Platform</h4>
              <p>MyTube welcomes creators of all backgrounds and expertise levels</p>
            </div>
            <div className="value-item">
              <h4>Privacy and Trust</h4>
              <p>Your data and content are always protected and respected</p>
            </div>
          </div>
        </section>

        <section className="about-section stats-section">
          <h2>By The Numbers</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">Many</div>
              <div className="stat-label">Videos Shared</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">Global</div>
              <div className="stat-label">Community</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">24/7</div>
              <div className="stat-label">Always Available</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">Fast</div>
              <div className="stat-label">Streaming</div>
            </div>
          </div>
        </section>

        <section className="about-section cta-section">
          <h2>Ready to Get Started?</h2>
          <p>Join our community of creators and viewers today.</p>
          <div className="cta-buttons">
            <button className="cta-btn primary" onClick={() => navigate("/home")}> 
              Explore Videos
            </button>
            <button
              className="cta-btn secondary"
              onClick={() => navigate("/create-video")}
            >
              Create Your First Video
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
