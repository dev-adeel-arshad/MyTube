import { useState } from "react";
import axiosInstance from "@/api/axiosInstance";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { login, logOut } from "../../features/authSlice.js";
import { useToast } from "../../components/Toast/Toast.jsx";
import "./LoginPage.css";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState("login");
  const [email, setEmail] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (username.includes("@") && !email) {
      setEmail(username);
    }

    try {
      const payloadBody = username.includes("@")
        ? { email: username, password }
        : { username, password };
      const response = await axiosInstance.post(`/v1/users/login`,
        payloadBody);

      // server returns ApiResponse: { statusCode, data: { user, AccessToken, RefreshToken }, message }
      const payload = response.data?.data || response.data;

      if (payload?.user) {
        dispatch(login(payload.user));
        showToast("Logged in successfully. Welcome back.", "success");
        setTimeout(() => navigate("/"), 150);
      } else {
        dispatch(logOut());
        showToast("Login failed", "error");
      }
    } catch (error) {
      console.error("Login failed:", error.response?.data || error.message);
      dispatch(logOut());
      const status = error.response?.status;
      const message = error.response?.data?.message || "Login failed";
      if (status === 403 && message.toLowerCase().includes("not verified")) {
        setStep("verify");
        showToast("Enter the 6-digit code we sent to your email.", "info");
      } else {
        showToast(message, "error");
      }
    }
  };

  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    if (!email) {
      showToast("Email is required", "error");
      return;
    }
    try {
      await axiosInstance.post(`/v1/users/verify-email`,
        { email, code: verifyCode });
      showToast("Email verified. Please log in.", "success");
      setStep("login");
      setVerifyCode("");
    } catch (error) {
      showToast(error.response?.data?.message || "Verification failed", "error");
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      showToast("Email is required", "error");
      return;
    }
    try {
      await axiosInstance.post(`/v1/users/resend-verification`,
        { email });
      showToast("Verification code resent.", "info");
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to resend code", "error");
    }
  };

  return (
    <div className="auth-page">
      <div className="login-container">
        <div className="auth-logo">
          <span className="auth-logo-icon">▶</span>
          <span className="auth-logo-text">MyTube</span>
        </div>
        <h2>Welcome back</h2>
        <p className="auth-subtitle">Sign in to continue watching</p>

      {step === "login" && (
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-row">
            <label htmlFor="username">Username or email</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username or email"
              required
              autoComplete="username"
            />
          </div>

          <div className="form-row">
            <label htmlFor="password">Password</label>
            <div className="password-field-wrap">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
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

          <button type="submit" className="login-btn primary">
            Sign In
          </button>
        </form>
      )}

      {step === "verify" && (
        <form onSubmit={handleVerifyEmail} className="login-form">
          <div className="form-row">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="form-row">
            <label>Verification code</label>
            <input
              type="text"
              value={verifyCode}
              onChange={(e) => setVerifyCode(e.target.value)}
              placeholder="Enter 6-digit code"
              required
            />
            <span className="login-hint">Code expires in 2 minutes.</span>
          </div>
          <button type="submit" className="login-btn primary">Verify email</button>
          <button type="button" className="login-btn secondary" onClick={handleResendVerification}>
            Resend code
          </button>
          <button type="button" className="login-btn secondary" onClick={() => setStep("login")}>
            Back to login
          </button>
        </form>
      )}

      <div className="auth-divider"><span>or</span></div>

      <div className="login-footer">
        <p className="auth-footer-text">Don&apos;t have an account?</p>
        <button type="button" className="login-btn secondary" onClick={() => navigate("/signup")}>
          Create account
        </button>
      </div>
    </div>
    </div>
  );
}

export default LoginPage;




