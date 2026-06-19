import { useEffect, useState } from "react";
import axiosInstance from "@/api/axiosInstance";
import "./AllPlaylistsPage.css";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

export default function AllPlaylistsPage() {
  const navigate = useNavigate();
  const currentUser = useSelector((s) => s.auth.userData);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const mode = params.get("mode") || "created";

  useEffect(() => {
    if (!currentUser?._id) {
      navigate("/login");
      return;
    }
    fetchAllPlaylists();
  }, [currentUser?._id, navigate]);

  const fetchAllPlaylists = async () => {
    try {
      setLoading(true);

      const res = await axiosInstance
        .get("/v1/playlist/user")
        .catch((err) => {
          console.error("Playlists fetch error:", err);
          return { data: { data: [] } };
        });

      const playlistsData = Array.isArray(res.data?.data) ? res.data.data : [];
      setPlaylists(playlistsData);
    } catch (error) {
      console.error("Error fetching playlists:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="all-playlists-page">
      <div className="playlists-header">
        <h1>{mode === "curated" ? "Playlists You Assembled" : "Your Playlists"}</h1>
        <p className="playlist-count">{playlists.length} playlists</p>
      </div>

      {loading && <p className="loading-msg">Loading playlists...</p>}

      <div className="playlists-grid">
        {playlists.length === 0 ? (
          <div className="empty-state">
            <p>No playlists created yet.</p>
            <button className="create-btn" onClick={() => navigate("/create-video")}>
              Create Your First Playlist
            </button>
          </div>
        ) : (
          playlists.map((playlist) => (
            <div
              key={playlist._id}
              className="playlist-card"
              onClick={() => navigate(`/playlist/${playlist._id}`)}
            >
              <div className="playlist-thumbnail">
                {(playlist.thumbnail || playlist.videos?.[0]?.thumbnail) ? (
                  <img
                    src={playlist.thumbnail || playlist.videos?.[0]?.thumbnail}
                    alt={playlist.name}
                  />
                ) : (
                  <div className="placeholder-thumbnail">
                    <span>PL</span>
                  </div>
                )}
                <div className="video-count">{playlist.videos?.length || 0} videos</div>
              </div>
              <div className="playlist-info">
                <h3>{playlist.name}</h3>
                <p className="playlist-desc">
                  {playlist.description || "No description"}
                </p>

              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}



