import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Preloader from "./Preloader"; 

const TableNumberGuard = ({ children }) => {
  const [hasTableNumber, setHasTableNumber] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkTableNumber = () => {
      // Check URL parameters first
      const urlParams = new URLSearchParams(window.location.search);
      const tableFromUrl = urlParams.get("table");

      // Check localStorage as fallback
      const tableFromStorage = localStorage.getItem("tableNumber");

      if (tableFromUrl || tableFromStorage) {
        setHasTableNumber(true);
        // Ensure table number is stored in localStorage
        if (tableFromUrl) {
          localStorage.setItem("tableNumber", tableFromUrl);
        }
      } else {
        setHasTableNumber(false);
        // Redirect to landing page if no table number
        navigate("/");
      }
      setIsLoading(false);
    };

    checkTableNumber();
  }, [navigate]);

  if (isLoading) {
    return <Preloader />;
  }

  return hasTableNumber ? children : null;
};

export default TableNumberGuard;
