import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Searchbar.css";

function SearchBar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    navigate(`/search/${encodeURIComponent(q)}`);
  };

  const handleSearchButton = (e) => {
    const q = searchQuery.trim();
    if (q) {
      handleSearch(e);
      return;
    }
    e.preventDefault();
    setIsFocused(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  return (
    <form
      className={`search-bar ${isFocused ? "focused" : ""}`}
      onSubmit={handleSearch}
    >
      <input
        ref={inputRef}
        type="text"
        placeholder="Search"
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      <button type="submit" aria-label="Search" onClick={handleSearchButton}>
        🔍
      </button>
    </form>
  );
}

export default SearchBar;
