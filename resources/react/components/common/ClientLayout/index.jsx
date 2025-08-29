import React from "react";
import Header from "./Header";
import TabsLayout from "../TabsLayout";
import { Outlet } from "react-router-dom";
import { useSGlobalContext } from "../../../lib/contexts/useGlobalContext";
import CheckoutPage from "../../client/Checkout";

const ClientLayout = () => {
  const { isCheckout } = useSGlobalContext();

  return (
    <>
      <Header />
      {!isCheckout && <TabsLayout />}
      <div className="container-fluid mx-auto px-4 py-7">
        {isCheckout ? <CheckoutPage /> : <Outlet />}
      </div>
    </>
  );
};

export default ClientLayout;
