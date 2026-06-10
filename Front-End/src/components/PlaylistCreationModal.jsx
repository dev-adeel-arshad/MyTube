import "./PlaylistCreationModal.css";

export default function PlaylistCreationModal({ isOpen, onClose, onSelectMode }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="creation-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" type="button" onClick={onClose}>
          x
        </button>

        <div className="modal-header">
          <h2>Create Playlist</h2>
          <p>Choose what to add to your playlist</p>
        </div>

        <div className="modal-options">
          <div className="option-card" onClick={() => onSelectMode?.("upload")}>
            <div className="option-icon">Upload</div>
            <h3>Upload New Video</h3>
            <p>Record and upload a new video to your playlist</p>
          </div>

          <div className="option-card" onClick={() => onSelectMode?.("select")}>
            <div className="option-icon">Select</div>
            <h3>Select From Uploaded</h3>
            <p>Choose from your already uploaded videos</p>
          </div>
        </div>
      </div>
    </div>
  );
}
