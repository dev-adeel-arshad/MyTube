import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import PlaylistCreationModal from "../../components/PlaylistCreationModal.jsx";
import PlaylistMultiStepModal from "../../components/PlaylistMultiStepModal.jsx";
import LoginPrompt from "../../components/LoginPrompt.jsx";
import EditVideoModal from "../../components/EditVideoModal.jsx";
import EditPlaylistModal from "../../components/EditPlaylistModal.jsx";
import { useToast } from "../../components/Toast/Toast.jsx";
import "./studioPage.css";

export default function StudioPage() {
  const currentUser = useSelector((s) => s.auth.userData);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState("videos");

  const [videos, setVideos] = useState([]);
  
  const [playlists, setPlaylists] = useState([]);

  const [showPlaylistModeModal, setShowPlaylistModeModal] = useState(false);
  const [showPlaylistWizard, setShowPlaylistWizard] = useState(false);
  const [playlistInitialMode, setPlaylistInitialMode] = useState(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [editVideo, setEditVideo] = useState(null);
  
  const [editPlaylistId, setEditPlaylistId] = useState(null);

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    fetchContent();
  }, [currentUser, navigate, activeTab]);

  useEffect(() => {
    setShowPlaylistModeModal(false);
    setShowPlaylistWizard(false);
    setPlaylistInitialMode(null);
  }, [activeTab]);

  const fetchContent = async () => {
    if (!currentUser?._id) return;
    try {
      if (activeTab === "videos") {
        const res = await axios.get(`/api/v1/videos?owner=${currentUser._id}`, {
          withCredentials: true,
        });
        setVideos(res.data?.videos || []);
      } else if (activeTab === "playlists") {
        const res = await axios.get("/api/v1/playlist/user", {
          withCredentials: true,
        });
        setPlaylists(res.data?.data || res.data?.playlists || []);
      }
    } catch (err) {
      console.error(`Error fetching ${activeTab}:`, err);
    }
  };

  const handleCreateAction = () => {
    if (activeTab === "playlists") {
      if (showPlaylistModeModal || showPlaylistWizard) {
        setShowPlaylistModeModal(false);
        setShowPlaylistWizard(false);
        setPlaylistInitialMode(null);
        return;
      }
      setShowPlaylistModeModal(true);
      return;
    }
    if (activeTab === "videos") { navigate("/create-video"); return; }
  };

  const handleDeleteVideo = async (videoId) => {
    if (!window.confirm("Delete this video?")) return;
    try {
      await axios.delete(`/api/v1/videos/${videoId}`, {
        withCredentials: true,
      });
      showToast("Video deleted!", "success");
      fetchContent();
    } catch (error) {
      showToast("Error deleting video", "error");
    }
  };

  const handleDeleteShort = async (shortId) => {
    if (!window.confirm("Delete this short?")) return;
    try {
      await axios.delete(`/api/v1/shorts/${shortId}`, {
        withCredentials: true,
      });
      showToast("Short deleted!", "success");
      fetchContent();
    } catch (error) {
      showToast("Error deleting short", "error");
    }
  };

  const handleUpdated = (message) => {
    if (message) showToast(message, "success");
    fetchContent();
  };

  const showCreatorGuide =
    (activeTab === "videos" && videos.length === 0) ||
    (activeTab === "shorts" && shorts.length === 0) ||
    (activeTab === "playlists" && playlists.length === 0);

  return (
    <div className="studio-page">
      <LoginPrompt
        isOpen={showLoginPrompt}
        message="You must be logged in to upload content."
        onClose={() => setShowLoginPrompt(false)}
      />
      <div className="studio-header">
        <h1>Your Studio</h1>
        <button className="publish-btn" onClick={handleCreateAction}>
          {activeTab === "videos" && "Create Video"}
          {activeTab === "shorts" && "Create Short"}
          {activeTab === "playlists" &&
            ((showPlaylistModeModal || showPlaylistWizard) ? "Cancel" : "Create Playlist")}
        </button>
      </div>

      {showCreatorGuide && (
        <div className="studio-guide">
          <div>
            <h3>Getting started as a creator</h3>
            <p>
              Learn how MyTube works, then publish your first upload when you are ready.
            </p>
          </div>
          <div className="guide-actions">
            <button type="button" onClick={() => navigate("/about")}>About MyTube</button>
            <button type="button" onClick={() => navigate("/creators")}>Creator Guide</button>
          </div>
        </div>
      )}

      <div className="studio-tabs">
        <button
          className={`tab-btn ${activeTab === "videos" ? "active" : ""}`}
          onClick={() => setActiveTab("videos")}
        >
          Videos
        </button>
        <button
          className={`tab-btn ${activeTab === "shorts" ? "active" : ""}`}
          onClick={() => setActiveTab("shorts")}
        >
          Shorts
        </button>
        <button
          className={`tab-btn ${activeTab === "playlists" ? "active" : ""}`}
          onClick={() => setActiveTab("playlists")}
        >
          Playlists
        </button>
      </div>

      <PlaylistCreationModal
        isOpen={showPlaylistModeModal}
        onClose={() => setShowPlaylistModeModal(false)}
        onSelectMode={(mode) => {
          setPlaylistInitialMode(mode);
          setShowPlaylistModeModal(false);
          setShowPlaylistWizard(true);
        }}
      />

      <PlaylistMultiStepModal
        isOpen={showPlaylistWizard}
        onClose={() => {
          setShowPlaylistWizard(false);
          setPlaylistInitialMode(null);
        }}
        onPlaylistCreated={() => {
          setShowPlaylistWizard(false);
          setPlaylistInitialMode(null);
          fetchContent();
        }}
        currentUserId={currentUser?._id}
        initialMode={playlistInitialMode}
      />

      <EditVideoModal
        isOpen={!!editVideo}
        video={editVideo}
        onClose={() => setEditVideo(null)}
        onUpdated={() => handleUpdated("Video updated")}
      />
      <EditShortModal
        isOpen={!!editShort}
        short={editShort}
        onClose={() => setEditShort(null)}
        onUpdated={() => handleUpdated("Short updated")}
      />
      <EditPlaylistModal
        isOpen={!!editPlaylistId}
        playlistId={editPlaylistId}
        currentUserId={currentUser?._id}
        onClose={() => setEditPlaylistId(null)}
        onUpdated={() => handleUpdated("Playlist updated")}
      />

      <div className="studio-content">
        {activeTab === "videos" && (
          <>
            <h2>Videos ({videos.length})</h2>
            {videos.length === 0 ? (
              <div className="no-content">
                <span style={{fontSize:"40px"}}>🎬</span>
                <strong style={{fontSize:"18px",fontWeight:700,color:"var(--text-primary)"}}>No videos yet</strong>
                <span>Upload your first video to start building your audience!</span>
                <button className="publish-btn" style={{marginTop:"12px"}} onClick={handleCreateAction}>Upload a Video</button>
              </div>
            ) : (
              <div className="studio-grid">
                {videos.map((video) => (
                  <div
                    key={video._id}
                    className="studio-card"
                    onClick={() => navigate(`/video/${video._id}`)}
                  >
                    <img src={video.thumbnail || "/default-thumb.svg"} alt={video.title} />
                    <h3>{video.title}</h3>
                    <div className="card-actions" onClick={(event) => event.stopPropagation()}>
                      <button onClick={() => navigate(`/video/${video._id}`)}>View</button>
                      <button onClick={() => setEditVideo(video)}>Edit</button>
                      <button onClick={() => handleDeleteVideo(video._id)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === "shorts" && (
          <>
            <h2>Shorts ({shorts.length})</h2>
            {shorts.length === 0 ? (
              <div className="no-content">
                <span style={{fontSize:"40px"}}>⚡</span>
                <strong style={{fontSize:"18px",fontWeight:700,color:"var(--text-primary)"}}>No shorts yet</strong>
                <span>Create short-form content to reach new viewers quickly!</span>
                <button className="publish-btn" style={{marginTop:"12px"}} onClick={handleCreateAction}>Create a Short</button>
              </div>
            ) : (
              <div className="studio-grid">
                {shorts.map((short) => (
                  <div
                    key={short._id}
                    className="studio-card"
                    onClick={() => navigate(`/shorts/${short._id}`)}
                  >
                    <img src={short.thumbnail || "/default-thumb.svg"} alt={short.title} />
                    <h3>{short.title}</h3>
                    <div className="card-actions" onClick={(event) => event.stopPropagation()}>
                      <button onClick={() => navigate(`/shorts/${short._id}`)}>View</button>
                      <button onClick={() => setEditShort(short)}>Edit</button>
                      <button onClick={() => handleDeleteShort(short._id)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === "playlists" && (
          <>
            <h2>Playlists ({playlists.length})</h2>
            {playlists.length === 0 ? (
              <div className="no-content">
                <span style={{fontSize:"40px"}}>📂</span>
                <strong style={{fontSize:"18px",fontWeight:700,color:"var(--text-primary)"}}>No playlists yet</strong>
                <span>Group your videos into playlists to help viewers binge your content!</span>
                <button className="publish-btn" style={{marginTop:"12px"}} onClick={handleCreateAction}>Create a Playlist</button>
              </div>
            ) : (
              <div className="studio-grid">
                {playlists.map((playlist) => (
                  <div
                    key={playlist._id}
                    className="studio-card"
                    onClick={() => navigate(`/playlist/${playlist._id}`)}
                  >
                    <div className="playlist-preview">
                      <img
                        src={
                          playlist.thumbnail ||
                          playlist.videos?.[0]?.thumbnail ||
                          "/default-thumb.svg"
                        }
                        alt={playlist.name}
                      />
                      <span className="video-count">{playlist.videos?.length || 0} videos</span>
                    </div>
                    <h3>{playlist.name}</h3>
                    <div className="card-actions" onClick={(event) => event.stopPropagation()}>
                      <button onClick={() => navigate(`/playlist/${playlist._id}`)}>View</button>
                      <button onClick={() => setEditPlaylistId(playlist._id)}>Edit</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

