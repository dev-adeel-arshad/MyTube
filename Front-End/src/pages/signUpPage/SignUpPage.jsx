import axiosInstance from "@/api/axiosInstance";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../components/Toast/Toast.jsx";
import "./SignUpPage.css";

function SignupPage() {
  const [step, setStep] = useState("register");
  const [verificationCode, setVerificationCode] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");
  const { showToast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullname: "",
    username: "",
    email: "",
    password: "",
  });

  const [avatar, setAvatar] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const data = new FormData();

      data.append("fullname", formData.fullname);
      data.append("username", formData.username);
      data.append("email", formData.email);
      data.append("password", formData.password);
      data.append("avatar", avatar);
      if (coverImage) data.append("coverImage", coverImage);

      const response = await axiosInstance.post(`/v1/users/register`,
        data,
        { headers: { "Content-Type": "multipart/form-data" }, withCredentials: true }
      );

      if (response.data?.data?.user) {
        setPendingEmail(formData.email);
        setStep("verify");
        showToast("We sent a 6-digit code to your email.", "info");
      }

    } catch (error) {
      let message = error.response?.data?.message || "Registration failed. Please try again.";
      const lowerMessage = String(message).toLowerCase();
      if (
        lowerMessage.includes("already exists") ||
        lowerMessage.includes("duplicate") ||
        lowerMessage.includes("taken") ||
        lowerMessage.includes("username") ||
        lowerMessage.includes("email")
      ) {
        message = "That username or email is already in use. Please choose another one.";
      }
      showToast(message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post(`/v1/users/verify-email`,
        { email: pendingEmail, code: verificationCode });
      showToast("Email verified! You can now log in.", "success");
      setTimeout(() => navigate("/login"), 150);
    } catch (error) {
      showToast(error.response?.data?.message || "Verification failed", "error");
    }
  };

  const handleResend = async () => {
    try {
      await axiosInstance.post(`/v1/users/resend-verification`,
        { email: pendingEmail });
      showToast("Verification code resent.", "info");
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to resend code", "error");
    }
  };

  return (
    <div className="auth-page">
      <div className="signup-container">
        <div className="auth-logo">
          <span className="auth-logo-icon">▶</span>
          <span className="auth-logo-text">MyTube</span>
        </div>
        <h3>Create your account</h3>
        <p className="auth-subtitle">Join the community. Share your world.</p>

      {step === "register" && (
        <form onSubmit={handleSignup} className="signup-form">
          <div className="form-row">
            <label>Full name</label>
            <input type="text" placeholder="Full Name" onChange={(e)=>setFormData({...formData, fullname:e.target.value})} required />
          </div>
          <div className="form-row">
            <label>Email</label>
            <input type="email" placeholder="yourname@example.com" onChange={(e)=>setFormData({...formData, email:e.target.value})} required />
          </div>
          <div className="form-row">
            <label>Username</label>
            <input type="text" placeholder="Choose a username" onChange={(e)=>setFormData({...formData, username:e.target.value})} required />
          </div>
          <div className="form-row">
            <label>Password</label>
            <div className="password-field-wrap">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Create a strong password"
                onChange={(e)=>setFormData({...formData, password:e.target.value})}
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                className="pw-toggle"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="signup-file-row">
            <div className="form-row">
              <label>Avatar <span className="required-star">*</span></label>
              <label className="file-upload-label" htmlFor="su-avatar">
                {avatar ? (
                  <img src={URL.createObjectURL(avatar)} alt="avatar preview" className="file-img-preview" />
                ) : (
                  <span>Click to upload avatar</span>
                )}
              </label>
              <input id="su-avatar" type="file" accept="image/*" className="hidden-file-input" onChange={(e)=>setAvatar(e.target.files[0])} required />
              <span className="file-hint">Shown as your profile picture.</span>
            </div>
            <div className="form-row">
              <label>Cover Image</label>
              <label className="file-upload-label" htmlFor="su-cover">
                {coverImage ? (
                  <img src={URL.createObjectURL(coverImage)} alt="cover preview" className="file-img-preview" />
                ) : (
                  <span>Click to upload cover</span>
                )}
              </label>
              <input id="su-cover" type="file" accept="image/*" className="hidden-file-input" onChange={(e)=>setCoverImage(e.target.files[0])} />
              <span className="file-hint">Shown at the top of your channel.</span>
            </div>
          </div>

          <button type="submit" className="signup-btn primary" disabled={isSubmitting}>
            {isSubmitting ? "Registering..." : "Create Account"}
          </button>
        </form>
      )}

      {step === "verify" && (
        <form onSubmit={handleVerify} className="signup-form">
          <div className="verify-icon">✉️</div>
          <p className="verify-msg">We sent a 6-digit code to <strong>{pendingEmail}</strong></p>
          <div className="form-row">
            <label>Verification code</label>
            <input
              type="text"
              placeholder="Enter 6-digit code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              maxLength={6}
              required
            />
          </div>
          <button type="submit" className="signup-btn primary">Verify Email</button>
          <button type="button" className="signup-btn secondary" onClick={handleResend}>
            Resend code
          </button>
        </form>
      )}

      {step === "register" && (
        <div className="signup-footer">
          <div className="auth-divider"><span>or</span></div>
          <p className="auth-footer-text">Already have an account?</p>
          <button
            type="button"
            className="signup-btn secondary"
            onClick={() => navigate("/login")}
          >
            Sign in
          </button>
        </div>
      )}
    </div>
    </div>
  );
}

export default SignupPage;




