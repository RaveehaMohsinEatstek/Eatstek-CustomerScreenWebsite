import React from "react";
import { createContext, useContext, useState, useCallback } from 'react'

const GlobalContext = createContext(undefined)

// Custom hook to access the global context
export function useSGlobalContext() {
  const context = useContext(GlobalContext)
  if (!context) {
    throw new Error('useSGlobalContext must be used within a GlobalProvider')
  }
  return context
}

// Component to provide global context to the app
export function GlobalProvider({ children }) {
  const [category_id, setCategory_id] = useState('');
  const [home_id, setHome_id] = useState('');
  const [isCheckout, setIsCheckout] = useState(false);
  const [allData, setAllData] = useState([]);

  // Toggles for different state values
  const toggleCategoryIdFunction = useCallback(
    (categoryId) => {
      setCategory_id(categoryId);
    },
    [setCategory_id],
  );
  const toggleHomeIdFunction = useCallback(
    (homeId) => {
      setHome_id(homeId);
    },
    [setHome_id],
  );

  const toggleCheckoutFunction = useCallback(
    (checkoutStatus) => {
      setIsCheckout(checkoutStatus);
    },
    [setIsCheckout],
  );

  const getAllDataFunction = useCallback(
    (data) => {
      setAllData(data);
    },
    [setAllData],
  );

  return (
    <GlobalContext.Provider
      value={{
        category_id,
        toggleCategoryIdFunction,
        home_id,
        toggleHomeIdFunction,
        isCheckout,
        toggleCheckoutFunction,
        allData,
        getAllDataFunction
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
}
