import { useEffect, useState } from "react";
import { productApi } from "../../lib/services";

export const SubscriptionBlock = () => {
    const [showModal, setShowModal] = useState(false);
    const [message, setMessage] = useState("");
    const [canClose, setCanClose] = useState(false);

    useEffect(() => {
        const handleSubscriptionBlock = async (event) => {
            setMessage(event.detail.message);

            const isLoggedOut = !localStorage.getItem("token");

            if (!isLoggedOut) {
                console.log("here");
                try {
                    const response = await productApi.adminLogout();

                    localStorage.removeItem("user");
                    localStorage.removeItem("token");
                    if (typeof clearRefreshTimer === "function") {
                        clearRefreshTimer();
                    }
                    setShowModal(true);
                    setCanClose(false);
                    //allow close after 5 seconds
                    setTimeout(() => {
                        setCanClose(true);
                        console.log("redirecting");
                        window.location.href = "/admins";
                    }, 5000);
                } catch (error) {
                    console.error(error || "something went wrong");
                    setShowModal(true);
                    setCanClose(false);
                    //allow close after 5 seconds
                    setTimeout(() => {
                        setCanClose(true);
                        console.log("redirecting");
                        window.location.href = "/admins";
                    }, 5000);
                }
            }

            setShowModal(true);
            setCanClose(false);

            setTimeout(() => {
                setCanClose(true);
            }, 5000);
        };

        window.addEventListener(
            "showSubscriptionBlock",
            handleSubscriptionBlock
        );
        return () => {
            window.removeEventListener(
                "showSubscriptionBlock",
                handleSubscriptionBlock
            );
        };
    }, []);

    const handleBackdropClick = (e) => {
        if (canClose && e.target === e.currentTarget) {
            setShowModal(false);
        }
    };

    if (!showModal) return null;

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50"
            onClick={handleBackdropClick}
        >
            <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
                <div className="text-center p-4 border-b bg-red-600 rounded-t-lg">
                    <h3 className="text-lg font-bold text-white">
                        ⚠️ Subscription Blocked
                    </h3>
                </div>
                <div className="p-6 text-center">
                    <p className="text-lg mb-6">{message}</p>
                    <div className="text-center space-x-4">
                        <button
                            onClick={() =>
                                (window.location.href =
                                    "https://eatstek.co.uk/contact")
                            }
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
                        >
                            Contact Support
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
