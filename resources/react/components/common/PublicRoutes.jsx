import React, { lazy, Suspense, useEffect, useRef, useState } from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Preloader from "./Preloader";
import TabsLayout from "./TabsLayout";
import { useSGlobalContext } from "../../lib/contexts/useGlobalContext";
import { productApi } from "../../lib/services";
import ReactPlayer from 'react-player';
import LandingPage from "../client/LandingPage";
import TableNumberGuard from "./TableGuard";


const MenuPage = lazy(() => import("../../pages/client/Products"));
const NotFoundPage = lazy(() => import("../../pages/common/NotFoundPage"));



const PublicRoutes = () => {
    const { getAllDataFunction } = useSGlobalContext();
    const [isInactive, setIsInactive] = useState(false);
    const inactivityTimerRef = useRef(null);


    useEffect(() => {
        getProducts();
        // Prevent Copy
        const disableCopy = (e) => e.preventDefault();
        const disableSelect = (e) => e.preventDefault();

        // Add listeners to prevent copy and selection
        document.addEventListener("copy", disableCopy);
        document.addEventListener("selectstart", disableSelect);

        // Add event listeners to Track activity
        const resetTimer = () => {
            // Check for loading message in localStorage
            const loadingMessage = localStorage.getItem('loadingMessage');

            // Only reset inactivity if there's no loading message
            if (!loadingMessage) {
                if (isInactive) setIsInactive(false);
                clearTimeout(inactivityTimerRef.current);
                inactivityTimerRef.current = setTimeout(() => {
                    setIsInactive(true);
                }, 1 * 60 * 1000);
            }
        };

        // Attach Activity listeners
        window.addEventListener("mousemove", resetTimer);
        window.addEventListener("keydown", resetTimer);
        window.addEventListener("touchstart", resetTimer);

        // Initial check for loading message
        const loadingMessage = localStorage.getItem('loadingMessage');
        if (loadingMessage) {
            clearTimeout(inactivityTimerRef.current);
            setIsInactive(false);
        }

        // Cleanup on Component unmount
        return () => {
            clearTimeout(inactivityTimerRef.current);
            document.removeEventListener("copy", disableCopy);
            document.removeEventListener("selectstart", disableSelect);
            window.removeEventListener("mousemove", resetTimer);
            window.removeEventListener("keydown", resetTimer);
            window.removeEventListener("touchstart", resetTimer);
        };
    }, [isInactive]);

    const getProducts = async () => {
        try {
            const { data } = await productApi.allCatelogs();
            getAllDataFunction(data);
        } catch (error) {
            console.log(error);
        }
    }


    const videoFileName = import.meta.env.VITE_VIDEO_NAME;
    const videoUrl = `https://${import.meta.env.VITE_API_BASE_URL}/${videoFileName}.mp4`;

    return (
        <Router>
            <Suspense fallback={<Preloader />}>
                {/* Only show inactive screen if there's no loading message */}
                {isInactive && !localStorage.getItem('loadingMessage') ? (
                    <div style={{
                        position: "fixed",
                        top: "0",
                        left: "0",
                        width: '100vw',
                        height: '100vh',
                        zIndex: 9999,
                        backgroundColor: 'black'
                    }}>
                        <ReactPlayer
                            url={videoUrl}
                            playing={true}
                            loop={true}
                            controls={false}
                            volume={0}
                            muted={true}
                            className="react-player"
                            width="100%"
                            height="100%"
                            style={{
                                objectFit: "cover",
                                aspectRatio: "16/9",
                                minHeight: "100vh",
                                minWidth: "100vw",
                                position: 'absolute',
                                top: 0,
                                left: 0,
                            }}
                        />
                    </div>
                ) : (
                    <Routes>
                        {/* Landing page as the root */}
                        <Route path="/" element={<LandingPage />} />

                        {/* Protected route for counter screen */}
                        <Route
                            path="/counter-screen"
                            element={
                                <TableNumberGuard>
                                    <TabsLayout>
                                        <MenuPage />
                                    </TabsLayout>
                                </TableNumberGuard>
                            }
                        />
                        <Route path="*" element={<NotFoundPage />} />

                    </Routes>
                )}
            </Suspense>
        </Router>
    );
};

export default PublicRoutes;