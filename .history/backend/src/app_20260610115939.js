import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// MAKING EXPRESS APP
const app = express();
app.use(cookieParser());

// CONFIGURING THE JSON DATA IN THE EXPRESS APP
app.use(express.json({ limit: "50kb" }));

// CONFIGURING THE URLENCODED DATA IN THE EXPRESS APP
app.use(express.urlencoded({ extended: true, limit: "50kb" }));

// USING MIDDLEWARES IN THE APP
// Allow multiple frontend origins during local development and respect production setting
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (e.g., mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) return callback(null, true);
      // fallback: allow in development to help local testing
      if (process.env.NODE_ENV !== "production") return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// SETTING UP A FOLDER FOR STATIC FILES
app.use(express.static("public"));

// SETTING UP ROUTES
import userRoutes from "./routes/user.routes.js";
import videoRoutes from "./routes/video.routes.js";
import tweetRoutes from "./routes/tweet.routes.js";
import commentRoutes from "./routes/comment.routes.js";
import channelRoutes from "./routes/subscription.routes.js";
import likedVideosRoutes from "./routes/like.routes.js";
import playlistRoutes from "./routes/playlist.routes.js";
import watchLaterRoutes from "./routes/watchlater.routes.js";

app.use("/api/v1/users/", userRoutes);
app.use("/api/v1/videos/", videoRoutes);
app.use("/api/v1/tweets/", tweetRoutes);
app.use("/api/v1/channel/", channelRoutes);
app.use("/api/v1/like/", likedVideosRoutes);
app.use("/api/v1/comments/", commentRoutes);
app.use("/api/v1/playlist/", playlistRoutes);
app.use("/api/v1/playlists", playlistRoutes);
app.use("/api/v1/watch-later", watchLaterRoutes);

app.use((err, req, res, next) => {
  console.error("ERROR:", err);

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

export { app };
