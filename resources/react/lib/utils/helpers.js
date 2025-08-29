import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { LIVE_URL } from "../services/api/httpClient";

const baseURL = `${LIVE_URL}/api/v2`;

// ===== Inject Custom CSS for Responsive Positioning =====
const injectResponsiveToastStyles = () => {
  // Check if styles already exist to avoid duplicates
  if (!document.getElementById('responsive-toast-styles')) {
    const style = document.createElement('style');
    style.id = 'responsive-toast-styles';
    style.textContent = `
      .Toastify__toast-container {
        /* Desktop and tablet styles */
        width: 50vw;
        max-width: 500px;
        min-width: 300px;
        top: 50% !important;
        left: 50% !important;
        transform: translate(-50%, -50%) !important;
        padding: 0;
      }
      
      /* Mobile styles */
      @media (max-width: 768px) {
        .Toastify__toast-container {
          width: 90vw !important;
          max-width: 90vw !important;
          min-width: unset !important;
          top: 50% !important;
          left: 50% !important;
          transform: translate(-50%, -50%) !important;
          padding: 0 10px;
        }
      }
      
      /* Extra small mobile devices */
      @media (max-width: 480px) {
        .Toastify__toast-container {
          width: 95vw !important;
          max-width: 95vw !important;
          padding: 0 5px;
        }
      }
      
      .Toastify__toast {
        margin: 0 auto;
        font-size: 18px !important;
        font-weight: bold !important;
        min-width: unset !important;
        max-width: 100% !important;
        width: 100% !important;
        text-align: center;
        padding: 16px 24px;
        border-radius: 8px !important;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
        background: #f0f0f0 !important;
        color: #333 !important;
        word-wrap: break-word;
        overflow-wrap: break-word;
      }
      
      /* Mobile toast styles */
      @media (max-width: 768px) {
        .Toastify__toast {
          font-size: 16px !important;
          padding: 12px 16px;
          min-height: unset;
        }
      }
      
      /* Extra small mobile devices */
      @media (max-width: 480px) {
        .Toastify__toast {
          font-size: 14px !important;
          padding: 10px 12px;
        }
      }
      
      /* Ensure progress bar is visible on mobile */
      .Toastify__progress-bar {
        background: #d97706 !important;
      }
      
      /* Close button adjustments for mobile */
      @media (max-width: 768px) {
        .Toastify__close-button {
          font-size: 16px !important;
          opacity: 0.8;
        }
      }
    `;
    document.head.appendChild(style);
  }
};

// Initialize styles when file loads
injectResponsiveToastStyles();

// ===== Toast Function =====
export const showToast = (message, status, options) => {
  const toastOptions = {
    type: status,
    position: "top-center", // Keep as top-center for react-toastify compatibility
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    draggable: true,
    pauseOnHover: true,
    newestOnTop: true,
    rtl: false,
    pauseOnFocusLoss: true,
    theme: "light",
    style: {
      // Remove conflicting styles that might override CSS
      maxWidth: '100%',
      margin: '0 auto',
      wordBreak: 'break-word',
      overflowWrap: 'break-word',
    },
    // Remove containerStyle as it conflicts with CSS positioning
    ...options,
  };
  
  return toast(message, toastOptions);
};

export const formatDate = (timestamp) => {
  if (!timestamp) return null;
  const date = new Date(timestamp);
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const year = date.getUTCFullYear();
  // Get hours, minutes, and seconds
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');
  // Format the date and time
  return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
};

export const getIpAddress = async () => {
  try {
    const response = await axios.get('https://api64.ipify.org?format=json');
    return response.data.ip;
  } catch (error) {
    console.error('Error fetching IP address:', error);
    return null;
  }
};