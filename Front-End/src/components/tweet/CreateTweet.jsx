import React, { useState } from "react";
import axiosInstance from "../../api/axiosInstance.js";
import { useDispatch, useSelector } from "react-redux";
import { addTweet } from "../../features/tweetsSlice";
import LoginPrompt from "../LoginPrompt";
import "./CreateTweet.css";

function CreateTweet() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const dispatch = useDispatch();
  const userData = useSelector((s) => s.auth.userData);
  const isLoggedIn = useSelector((s) => !!s.auth?.status);

  const handleTweet = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!content.trim()) {
      setErrorMsg("Tweet cannot be empty.");
      return;
    }

    if (!isLoggedIn) {
      setShowLoginPrompt(true);
      return;
    }

    try {
      setLoading(true);
      const response = await axiosInstance.post(
        "/tweets/create-tweet",
        { content }
      );

      if (response.status === 200 && response.data?.tweet) {
        dispatch(addTweet(response.data.tweet));
        setContent("");
        setSuccessMsg("Tweet posted successfully!");
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch (error) {
      const status = error?.response?.status;
      if (status === 401) {
        setShowLoginPrompt(true);
        return;
      }
      setErrorMsg(error.response?.data?.message || "Failed to post tweet.");
      console.error("Error creating tweet:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-tweet-container">
      <LoginPrompt
        isOpen={showLoginPrompt}
        message="You must be logged in to create a tweet."
        onClose={() => setShowLoginPrompt(false)}
      />
      <div className="create-tweet-header">
        <img
          src={userData?.avatar || "/default-avatar.svg"}
          alt="Avatar"
          className="tweet-avatar"
        />
        <div className="create-tweet-info">
          <h3>{userData?.fullname || "User"}</h3>
          <p>@{userData?.username || "username"}</p>
        </div>
      </div>

      <form onSubmit={handleTweet} className="create-tweet-form">
        <textarea
          value={content}
          onChange={(e) => { setContent(e.target.value); setErrorMsg(""); setSuccessMsg(""); }}
          placeholder="What's on your mind?!"
          className="tweet-textarea"
        />

        {errorMsg && <p className="ct-msg ct-msg--error">{errorMsg}</p>}
        {successMsg && <p className="ct-msg ct-msg--success">{successMsg}</p>}

        <div className="create-tweet-footer">
          <span className="ct-hint">No character limit — express yourself fully</span>
          <button
            type="submit"
            className="tweet-submit-btn"
            disabled={loading || !content.trim()}
          >
            {loading ? "Posting..." : "Tweet"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateTweet;

