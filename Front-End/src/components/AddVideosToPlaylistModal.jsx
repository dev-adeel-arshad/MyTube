import "./AddVideosToPlaylistModal.css";

export default function AddVideosToPlaylistModal({ isOpen, onClose, onSelectMode }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="creation-modal" onClick={(event) => event.stopPropagation()}>
        <button className="modal-close" type="button" onClick={onClose}>
          ×
        </button>

        <div className="modal-header">
          <h2>Add Videos to Playlist</h2>
          <p>Choose how you want to add videos.</p>
        </div>

        <div className="modal-options">
          <div className="option-card" onClick={() => onSelectMode?.("upload")}> 
            <h3>Upload New Video</h3>
            <p>Upload and add a new video.</p>
          </div>

          <div className="option-card" onClick={() => onSelectMode?.("select")}> 
            <h3>Select Existing</h3>
            <p>Select from your uploaded videos.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
