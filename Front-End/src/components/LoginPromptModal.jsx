import { useNavigate } from "react-router-dom";
import "./LoginPromptModal.css";

export default function LoginPromptModal({
  isOpen,
  onClose,
  message = "You must be logged in to perform this action.",
}) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <h2>Login Required</h2>
          <button className="modal-close" onClick={onClose} type="button">
            ×
          </button>
        </div>
        <div className="modal-body">
          <p>{message}</p>
        </div>
        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose} type="button">
            Cancel
          </button>
          <button
            className="btn-login"
            type="button"
            onClick={() => {
              navigate("/login");
              onClose();
            }}
          >
            Go to Login
          </button>
        </div>
      </div>
    </div>
  );
}
