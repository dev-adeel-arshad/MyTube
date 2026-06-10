import { useNavigate } from "react-router-dom";
import "./CreatorsPage.css";

const CREATOR_CATEGORIES = [
  {
    id: 1,
    name: "Tech Creators",
    description: "Technology and coding tutorials",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
      </svg>
    ),
  },
  {
    id: 2,
    name: "Creative Studio",
    description: "Art, design, and creative content",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/>
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>
      </svg>
    ),
  },
  {
    id: 3,
    name: "Music Masters",
    description: "Music production and covers",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
      </svg>
    ),
  },
  {
    id: 4,
    name: "Gaming Hub",
    description: "Gaming reviews and gameplay",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/>
        <rect x="2" y="6" width="20" height="12" rx="2"/>
        <line x1="17" y1="11" x2="17" y2="11"/><line x1="15" y1="13" x2="15" y2="13"/>
      </svg>
    ),
  },
  {
    id: 5,
    name: "Fitness First",
    description: "Fitness and wellness content",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>
      </svg>
    ),
  },
  {
    id: 6,
    name: "Travel Tales",
    description: "Travel vlogs and destination guides",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
    ),
  },
  {
    id: 7,
    name: "Cooking Channel",
    description: "Recipes and cooking tutorials",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
        <line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>
      </svg>
    ),
  },
  {
    id: 8,
    name: "Education Hub",
    description: "Educational and learning content",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
      </svg>
    ),
  },
];

export default function CreatorsPage() {
  const navigate = useNavigate();

  return (
    <div className="creators-page">
      <div className="creators-hero">
        <div className="creators-hero-content">
          <h1>Creator Categories</h1>
          <p className="subtitle">Discover amazing creators and content</p>
        </div>
      </div>

      <div className="creators-container">
        <section className="featured-section">
          <h2>Featured Creator Categories</h2>
          <p className="section-desc">
            Explore content from talented creators across various categories.
            Find your favorite type of content and subscribe to stay updated
            with new videos.
          </p>

          <div className="creators-grid">
            {CREATOR_CATEGORIES.map((creator) => (
              <div key={creator.id} className="creator-card">
                <div className="creator-icon">{creator.icon}</div>
                <h3>{creator.name}</h3>
                <p>{creator.description}</p>
                <button
                  className="explore-btn"
                  onClick={() => navigate("/")}
                >
                  Explore
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="creator-signup-section">
          <h2>Become a Creator</h2>
          <div className="creator-steps">
            <div className="step">
              <div className="step-number">1</div>
              <h4>Create Account</h4>
              <p>Sign up on MyTube with your details</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h4>Upload Videos</h4>
              <p>Use our easy-to-use upload tool</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h4>Grow Audience</h4>
              <p>Connect with viewers and build your fanbase</p>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <h4>Engage Community</h4>
              <p>Respond to comments and stay connected</p>
            </div>
          </div>

          <div className="creator-benefits">
            <h3>Creator Benefits</h3>
            <ul className="benefits-list">
              <li>Upload unlimited videos</li>
              <li>Analytics dashboard to track performance</li>
              <li>Customize your channel profile</li>
              <li>Create playlists for organization</li>
              <li>Interact directly with your audience</li>
              <li>Grow your subscriber base</li>
            </ul>
          </div>

          <div className="creator-cta">
            <h3>Ready to Start Creating?</h3>
            <p>Join thousands of creators on MyTube</p>
            <button
              className="start-creating-btn"
              onClick={() => navigate("/create-video")}
            >
              Start Creating Now
            </button>
          </div>
        </section>

        <section className="tips-section">
          <h2>Creator Tips for Success</h2>
          <div className="tips-grid">
            <div className="tip-card">
              <h4>Consistent Upload Schedule</h4>
              <p>Regular uploads help your audience know when to expect new content</p>
            </div>
            <div className="tip-card">
              <h4>Quality Matters</h4>
              <p>Invest in good equipment and editing for professional-looking videos</p>
            </div>
            <div className="tip-card">
              <h4>Engage Your Audience</h4>
              <p>Reply to comments and build a community around your content</p>
            </div>
            <div className="tip-card">
              <h4>Use Proper Tags</h4>
              <p>Add relevant titles and descriptions to help viewers find your videos</p>
            </div>
            <div className="tip-card">
              <h4>Create Thumbnails</h4>
              <p>Eye-catching thumbnails increase click-through rates significantly</p>
            </div>
            <div className="tip-card">
              <h4>Analyze Performance</h4>
              <p>Use analytics to understand what works and adjust your strategy</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
