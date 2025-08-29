import { useEffect, useState } from "react";

export const SubscriptionModal = () => {
    const [showModal, setShowModal] = useState(false);
    const [message, setMessage] = useState("");
    const [showCloseButton, setShowCloseButton] = useState(false);
    const [timer, setTimer] = useState(null);

    useEffect(() => {
        const handleSubscriptionAlert = (event) => {
            setMessage(event.detail.message);
            setShowModal(true);
            setShowCloseButton(false);

            if (timer) clearTimeout(timer);

            setTimer(setTimeout(() => setShowCloseButton(true), 10000));
        };

        window.addEventListener(
            "showSubscriptionAlert",
            handleSubscriptionAlert
        );
        return () => {
            window.removeEventListener(
                "showSubscriptionAlert",
                handleSubscriptionAlert
            );
            if (timer) clearTimeout(timer);
        };
    }, [timer]);

    // Prevent closing on backdrop click
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget && showCloseButton) {
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
                <div className="text-center p-4 border-b bg-[#d97706] rounded-t-lg">
                    <h3 className="text-lg font-bold">⚠️ Subscription Alert</h3>
                </div>
                <div className="p-6 text-center">
                    <p className="text-lg mb-6">{message}</p>
                    <div className="text-center space-x-4">
                        {/* Close button only shown after 10 seconds */}
                        {showCloseButton && (
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
                            >
                                Close
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
