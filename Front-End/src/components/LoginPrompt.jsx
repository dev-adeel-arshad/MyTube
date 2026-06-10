import React from "react";
import { useNavigate } from "react-router-dom";
import "./LoginPrompt.css";

export default function LoginPrompt({ isOpen, message, onClose }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleLogin = () => {
    navigate("/login");
    onClose?.();
  };

  const handleCancel = () => {
    onClose?.();
  };

  return (
    <div className="login-prompt-overlay" onClick={handleCancel}>
      <div className="login-prompt-modal" onClick={(e) => e.stopPropagation()}>
        <div className="login-prompt-header">
          <h2>Sign In Required</h2>
          <button className="close-btn" onClick={handleCancel}>x</button>
        </div>

        <div className="login-prompt-body">
          <p>{message || "You need to sign in to continue."}</p>
        </div>

        <div className="login-prompt-footer">
          <button className="btn-cancel" onClick={handleCancel}>Cancel</button>
          <button className="btn-login" onClick={handleLogin}>Go to Login</button>
        </div>
      </div>
    </div>
  );
}

