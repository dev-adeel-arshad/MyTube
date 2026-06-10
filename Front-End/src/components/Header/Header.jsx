import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Hamburger from "../hamburger/Hamburger.jsx";
import SearchBar from "../Searchbar/SearchBar.jsx";
import { useTheme } from "../../hooks/useDarkMode.js";
import "./Header.css";

export default function Header({ isScrolling }) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const isLoggedIn = useSelector((state) => state.auth?.status || false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header className={`header ${scrolled ? "scrolled" : ""} ${isScrolling ? "scrolling" : ""}`}>
        {isLoggedIn && (
          <button
            className={`hamburger-btn ${isOpen ? "active" : ""}`}
            onClick={() => setIsOpen((prev) => !prev)}
            aria-label="Menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        )}

        <div
          className="logo"
          onClick={() => {
            navigate("/");
            setIsOpen(false);
          }}
        >
          <img src="/logo.svg" alt="logo" />
          <span>MyTube</span>
        </div>

        <div className="search-bar-container">
          <SearchBar />
        </div>

        <div className="header-actions">
          <button
            className="theme-btn"
            onClick={toggleTheme}
            title={`Switch to ${theme === "day" ? "Night" : "Day"} Mode`}
            aria-label={`Switch to ${theme === "day" ? "Night" : "Day"} Mode`}
          >
            {theme === "day" ? "🌙" : "☀️"}
          </button>

          {isLoggedIn ? (
            <>
              <button
                className="create-btn"
                onClick={() => navigate("/create-video")}
              >
                <span className="plus-icon">+</span>
                Create
              </button>
              <button onClick={() => navigate("/profile")}>Profile</button>
            </>
          ) : (
            <>
              <div className="header-links">
                <button className="link-btn" onClick={() => navigate("/about")}>About</button>
                <button className="link-btn" onClick={() => navigate("/creators")}>Creators</button>
                <button className="link-btn" onClick={() => navigate("/privacy")}>Privacy</button>
              </div>
              <button onClick={() => navigate("/login")}>Login</button>
              <button onClick={() => navigate("/signup")}>Signup</button>
            </>
          )}
        </div>
      </header>

      {isLoggedIn && <Hamburger isOpen={isOpen} setIsOpen={setIsOpen} />}
    </>
  );
}

