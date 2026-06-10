import React, { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import Header from "./components/Header/Header.jsx";
import Footer from "./components/Footer/Footer.jsx";
import Sidebar from "./components/Sidebar/Sidebar.jsx";
import Miniplayer from "./components/Miniplayer/Miniplayer.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";
import "./Layout.css";

function Layout() {
    const [isScrolling, setIsScrolling] = useState(false);
    const isLoggedIn = useSelector((state) => state.auth?.status || false);
    const location = useLocation();

    useEffect(() => {
        let scrollTimeout;

        const handleScroll = () => {
            if (window.scrollY > 10) {
                setIsScrolling(true);
            } else {
                setIsScrolling(false);
            }

            clearTimeout(scrollTimeout);

            scrollTimeout = setTimeout(() => {
                if (window.scrollY === 0) {
                    setIsScrolling(false);
                }
            }, 150);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => {
            window.removeEventListener("scroll", handleScroll);
            clearTimeout(scrollTimeout);
        };
    }, []);

    return (
        <div className={`app-layout ${isLoggedIn ? "sidebar-expanded" : "sidebar-hidden"} ${isScrolling ? "layout-scrolling" : ""}`}>
            <ScrollToTop />
            <Header isScrolling={isScrolling} />
            <div className="main-content">
                {isLoggedIn && <Sidebar isScrolling={isScrolling} />}
                <div className="page-content">
                    <Outlet />
                </div>
            </div>
            <Footer />
            <Miniplayer />
        </div>
    );
}

export default Layout;
