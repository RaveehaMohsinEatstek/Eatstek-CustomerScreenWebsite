import React from 'react';
import './app.css';
import 'react-lazy-load-image-component/src/effects/blur.css';
import PublicRoutes from './components/common/PublicRoutes';
import { ToastContainer } from 'react-toastify';
import { CartProvider } from "react-use-cart";
import { GlobalProvider } from './lib/contexts/useGlobalContext';
import { SubscriptionModal } from './components/common/SubscriptionAlert';
import { SubscriptionBlock } from './components/common/SubscriptionBlock';

function Main() {

    return (
        <CartProvider>
            <GlobalProvider>
                
                    <ToastContainer />
                    <PublicRoutes />
                    <SubscriptionModal/>
                    <SubscriptionBlock />
                
            </GlobalProvider>
        </CartProvider>
    );
}

export default Main;
