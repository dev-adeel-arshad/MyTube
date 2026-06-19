import { useEffect, useState } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axiosInstance from "@/api/axiosInstance";

import { login, logOut, setSubscribedChannels } from "./features/authSlice.js";
import { setLikedVideos } from "./features/videosSlice.js";
import { ToastProvider } from "./components/Toast/Toast.jsx";
import Layout from "./Layout.jsx";
import LoginPage from "./pages/loginPage/LoginPage.jsx";
import HomePage from "./pages/homepage/HomePage.jsx";
import CreateVideo from "./components/CreateVideo.jsx";
import SignUpPage from "./pages/signUpPage/SignUpPage.jsx";
import CreateTweet from "./components/tweet/CreateTweet.jsx";
import VideoPage from "./pages/videoPage/VideoPage.jsx";
import ProfilePage from "./pages/profilePage/ProfilePage.jsx";
import SearchResults from "./pages/searchResults/SearchResults.jsx";
import LibraryPage from "./pages/libraryPage/LibraryPage.jsx";
import SubscriptionsPage from "./pages/subscriptionsPage/SubscriptionsPage.jsx";
import TweetsPage from "./pages/tweetsPage/TweetsPage.jsx";
import TweetDetail from "./pages/tweetDetail/TweetDetail.jsx";
import WatchHistoryPage from "./pages/watchHistoryPage/WatchHistoryPage.jsx";
import LikedVideosPage from "./pages/likedVideosPage/LikedVideosPage.jsx";
import WatchLaterPage from "./pages/watchLaterPage/WatchLaterPage.jsx";
import StudioPage from "./pages/studioPage/StudioPage.jsx";
import PlaylistPage from "./pages/playlistPage/PlaylistPage.jsx";
import AllPlaylistsPage from "./pages/playlistsPage/AllPlaylistsPage.jsx";
import AboutPage from "./pages/aboutPage/AboutPage.jsx";
import CreatorsPage from "./pages/creatorsPage/CreatorsPage.jsx";
import TermsPage from "./pages/termsPage/TermsPage.jsx";
import PrivacyPage from "./pages/privacyPage/PrivacyPage.jsx";
function LandingGate() {
  const isLoggedIn = useSelector((state) => state.auth?.status || false);
  return isLoggedIn ? <HomePage /> : <AboutPage />;
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "",
        element: <LandingGate />,
      },
      {
        path: "home",
        element: <HomePage />,
      },
      {
        path: "create-video",
        element: <CreateVideo />,
      },
      
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "signup",
        element: <SignUpPage />,
      },
      {
        path: "create-tweet",
        element: <CreateTweet />,
      },
      {
        path: "profile",
        element: <ProfilePage />,
      },
      {
        path: "profile/:username",
        element: <ProfilePage />,
      },
      {
        path: "search/:query",
        element: <SearchResults />,
      },
      {
        path: "video/:id",
        element: <VideoPage />,
      },
      {
        path: "library",
        element: <LibraryPage />,
      },
      {
        path: "subscriptions",
        element: <SubscriptionsPage />,
      },
      {
        path: "tweets",
        element: <TweetsPage />,
      },
      {
        path: "tweet/:id",
        element: <TweetDetail />,
      },
      {
        path: "history",
        element: <WatchHistoryPage />,
      },
      {
        path: "liked-videos",
        element: <LikedVideosPage />,
      },
      {
        path: "watch-later",
        element: <WatchLaterPage />,
      },
      {
        path: "studio",
        element: <StudioPage />,
      },
      {
        path: "playlist/:id",
        element: <PlaylistPage />,
      },
      {
        path: "playlists",
        element: <AllPlaylistsPage />,
      },
      {
        path: "about",
        element: <AboutPage />,
      },
      {
        path: "creators",
        element: <CreatorsPage />,
      },
      {
        path: "terms",
        element: <TermsPage />,
      },
      {
        path: "privacy",
        element: <PrivacyPage />,
      },
    ],
  },
]);

function App() {
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      try {
        const res = await axiosInstance.get(`/v1/users/current-user`);
        // Handle both response formats: { data: user } or just { user }
        const userData = res.data?.data || res.data;
        if (userData) {
          dispatch(login(userData));
          try {
            // fetch list of channels the user has subscribed to
            const subsRes = await axiosInstance.get(`/v1/channel/u/${userData._id}`);
            const channels = (subsRes.data?.subscribedChannels || []).map((c) => String(c.channelId));
            dispatch(setSubscribedChannels(channels));
          } catch (err) {
            console.log('Failed to fetch subscribed channels', err);
          }
          try {
            const likedRes = await axiosInstance.get(`/v1/like/videos`, {
              withCredentials: true,
            });
            const likedList = likedRes.data?.data || likedRes.data || [];
            const likedIds = likedList
              .map((item) => item.video?._id || item.video || item._id)
              .filter(Boolean);
            dispatch(setLikedVideos(likedIds));
          } catch (err) {
            console.log("Failed to fetch liked videos", err);
          }
        }
      } catch {
        dispatch(logOut());
      } finally {
        setLoading(false);
      }
    })();
  }, [dispatch]);

  if (loading) return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'var(--bg-primary)'
    }}>
      <span className="app-loading-spinner" />
      <span style={{ marginTop: 16, fontSize: 13, color: 'var(--text-secondary)', letterSpacing: '0.04em' }}>MyTube</span>
    </div>
  );

  return (
    <ToastProvider>
      <RouterProvider router={router} />
    </ToastProvider>
  );
}

export default App;



