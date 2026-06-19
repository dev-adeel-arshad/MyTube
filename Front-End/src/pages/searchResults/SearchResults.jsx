import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "@/api/axiosInstance";
import "./SearchResults.css";
import VideoMenu from "../../components/VideoMenu/VideoMenu.jsx";
import PlaylistSelectionModal from "../../components/PlaylistSelectionModal.jsx";
import LoginPrompt from "../../components/LoginPrompt.jsx";
import useVideoMenuActions from "../../hooks/useVideoMenuActions.js";

function SearchResults() {
  const { query } = useParams();
  const navigate = useNavigate();
  const menu = useVideoMenuActions(navigate);
  const [videos, setVideos] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [page, setPage] = useState(1);
  const limit = 12;
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [query]);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const [videosRes, playlistsRes] = await Promise.all([
          axiosInstance.get(`/v1/videos/search/${encodeURIComponent(query)}?page=${page}&limit=${limit}`),
          axiosInstance.get(`/v1/playlist/search/${encodeURIComponent(query)}?limit=8`),
        ]);
        setVideos(videosRes.data?.videos || []);
        setPlaylists(playlistsRes.data?.playlists || playlistsRes.data?.data || []);
      } catch (error) {
        console.error("Failed to fetch search results", error);
        setVideos([]);
        setPlaylists([]);
      } finally {
        setLoading(false);
      }
    };

    if (query) fetchResults();
  }, [query, page]);

  return (
    <div className="search-results-page">
      <LoginPrompt
        isOpen={menu.showLoginPrompt}
        message="You must be logged in to perform this action."
        onClose={() => menu.setShowLoginPrompt(false)}
      />
      <div className="inner-container">
        <div className="results-header">
          <h2 className="search-header">Results for "{decodeURIComponent(query)}"</h2>
          <div className="results-meta">
            {loading ? "Searching..." : `${videos.length} videos`}
          </div>
        </div>

        {playlists.length > 0 && (
          <section className="playlists-section">
            <h3>Playlists</h3>
            <div className="playlists-row">
              {playlists.map((playlist) => (
                <div
                  key={playlist._id}
                  className="playlist-card"
                  onClick={() => navigate(`/playlist/${playlist._id}`)}
                >
                  <div className="playlist-thumb-wrap">
                    <img
                      src={playlist.thumbnail || playlist.videos?.[0]?.thumbnail || "/default-thumb.svg"}
                      alt={playlist.name}
                      className="playlist-single-thumb"
                    />
                    <div className="playlist-count-badge">
                      {playlist.videos?.length ?? 0} videos
                    </div>
                  </div>
                  <div className="playlist-meta">
                    <strong>{playlist.name || "Untitled Playlist"}</strong>
                    <div className="playlist-owner">
                      {playlist.owner?.username || ""}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="video-list list-style">
          {loading && (
            <p style={{ textAlign: "center", padding: "40px" }}>Loading results...</p>
          )}

          {!loading && videos.length === 0 && (
            <p style={{ textAlign: "center", padding: "40px" }}>
              No results found
            </p>
          )}

          {!loading &&
            videos.map((video) => (
              <div
                onClick={() => navigate(`/video/${video._id}`)}
                key={video._id}
                className="result-item"
              >
                <img
                  className="result-thumb"
                  src={video.thumbnail || "/default-thumb.svg"}
                  alt={video.title}
                />
                <div className="result-meta">
                  <h3>{video.title}</h3>
                  <div className="meta-small">
                    <span
                      className="video-owner"
                      onClick={(event) => {
                        event.stopPropagation();
                        menu.handleAboutCreator(video);
                      }}
                    >
                      {video.ownerDetails?.username || video.owner?.username || "Unknown"}
                    </span>
                    <span>
                      {video.createdAt
                        ? ` • ${new Date(video.createdAt).toLocaleDateString()}`
                        : ""}
                    </span>
                  </div>
                  <p className="result-desc">{video.description || ""}</p>
                </div>
                <VideoMenu
                  video={video}
                  onAddToPlaylist={menu.handleAddToPlaylist}
                  onWatchLaterToggle={menu.handleWatchLater}
                  onAboutCreator={menu.handleAboutCreator}
                  onNotInterested={menu.handleNotInterested}
                />
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
        <button disabled={videos.length < limit} onClick={() => setPage((prev) => prev + 1)}>
          Next
        </button>
      </div>
    </div>
  );
}

export default SearchResults;




