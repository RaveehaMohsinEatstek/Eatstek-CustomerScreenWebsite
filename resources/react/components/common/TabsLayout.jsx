import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ShoppingCart, Trash2 } from 'lucide-react';
import { FaTags, FaFire , FaMugHot } from "react-icons/fa";

import Products from '../client/Products';
import { getIpAddress } from '../../lib/utils/helpers';
import Deals from '../client/Deals'
import { useSGlobalContext } from '../../lib/contexts/useGlobalContext';

import Checkout from '../client/Checkout';
import CheckoutPopup from './CustomPopoup';
import { setCookie } from 'cookies-next';

import { useCart } from "react-use-cart";
import ConfirmModal from "./StartOverModal"

const TabsLayout = () => {
    const { allData } = useSGlobalContext();
    const [activeTab, setActiveTab] = useState('menu');
    const { toggleCategoryIdFunction, toggleHomeIdFunction, home_id, isCheckout, toggleCheckoutFunction } = useSGlobalContext();
    const [data, setData] = useState(null);
    const [activeCategory, setActiveCategory] = useState("");
    const [openPopup, setOpenPopup] = useState(false);
    const { emptyCart, cartTotal, totalItems } = useCart();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [hasDeals, setHasDeals] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const restaurantName = import.meta.env.VITE_RESTAURANT_NAME;

    useEffect(() => {
        if (allData && allData.catalogs && allData.catalogs[0]?.data?.categories) {
            setData(allData);
            checkForDeals(allData);
        }
        const getApiAddress = async () => {
            try {
                const ipAddress = await getIpAddress();
                setCookie("ip_address", ipAddress);
            } catch (error) {
                console.log(error);
            }
        }
        getApiAddress();
    }, [allData]);

    const checkForDeals = (data) => {
        if (data?.catalogs?.[0]?.data?.deals?.length > 0) {
            setHasDeals(true);
        } else {
            setHasDeals(false);
        }
    };

    useEffect(() => {
        if (home_id) {
            setActiveTab("menu");
            toggleCategoryIdFunction("");
            toggleHomeIdFunction("");
        }
        if (isCheckout) {
            setOpenPopup(true);
        } else {
            setOpenPopup(false);
        }
    }, [home_id, isCheckout])

    const renderContent = () => {
        switch (activeTab) {
            case 'menu':
                return <Products />;
            case 'deals':
                return <Deals />;
            default:
                return <Products />;
        }
    };

    const handleStartOver = () => {
        emptyCart();
        window.location.reload();
    }

    const handleClick = (id) => {
        setActiveTab(id);
        toggleCategoryIdFunction("");
        setActiveCategory("");
        setIsMobileMenuOpen(false); // Close mobile menu
    }

    const handleClickCategory = (catId) => {
        toggleCategoryIdFunction(catId);
        setActiveCategory(catId);
        setActiveTab("");
        setIsMobileMenuOpen(false); // Close mobile menu
    }

    const handleClosePop = () => {
        setOpenPopup(false);
        toggleCheckoutFunction(false);
    }
    
    const formattedTotal = new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP',
    }).format(cartTotal);

    const MenuButton = ({ onClick, isActive, children, className = "" }) => (
        <button
            onClick={onClick}
            className={`
                w-full px-4 py-3 text-left font-medium rounded-xl transition-all duration-300 transform hover:scale-105
                ${isActive 
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg' 
                    : 'bg-white hover:bg-orange-50 text-gray-700 hover:text-orange-600 shadow-sm hover:shadow-md border border-gray-200'
                }
                ${className}
            `}
        >
            {children}
        </button>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-lg border-b border-orange-100">
                <div className="flex items-center justify-between px-4 py-3 max-w-7xl mx-auto">
                    {/* Logo */}
                    <Link to="/counter-screen" className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                            <FaMugHot className="text-white text-sm" />
                        </div>
                        <span className="text-xl font-bold text-gray-800 truncate max-w-40 sm:max-w-none">
                            {restaurantName}
                        </span>
                    </Link>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="lg:hidden p-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors"
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>

                    {/* Desktop Cart Info */}
                    <div className="hidden lg:flex items-center space-x-4">
                        <div className="text-right">
                            <div className="text-sm text-gray-600">
                                {totalItems} {totalItems === 1 ? 'item' : 'items'}
                            </div>
                            <div className="font-bold text-lg text-gray-800">{formattedTotal}</div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar Navigation */}
            <aside className={`
                fixed left-0 top-16 bottom-0 w-80 bg-white/95 backdrop-blur-md z-40 transform transition-transform duration-300 ease-in-out shadow-xl
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:translate-x-0 lg:w-72
            `}>
                <div className="h-full flex flex-col p-6">
                    {/* Primary Navigation */}
                    <div className="space-y-3 mb-6">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Navigation</h3>
                        
                        <MenuButton
                            onClick={() => handleClick('menu')}
                            isActive={activeTab === 'menu'}
                        >
                            <div className="flex items-center space-x-3">
                                <FaTags className="text-lg" />
                                <span>All Categories</span>
                            </div>
                        </MenuButton>

                        {hasDeals && (
                            <MenuButton
                                onClick={() => handleClick('deals')}
                                isActive={activeTab === 'deals'}
                            >
                                <div className="flex items-center space-x-3">
                                    <FaFire className="text-lg" />
                                    <span>Special Deals</span>
                                </div>
                            </MenuButton>
                        )}
                    </div>

                    {/* Categories */}
                    <div className="flex-1 overflow-hidden">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Categories</h3>
                        <div className="h-full overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                            {data?.catalogs[0]?.data?.categories?.map((item, index) => {
                                if (item?.name === "Deals") return null;
                                return (
                                    <MenuButton
                                        key={index}
                                        onClick={() => handleClickCategory(item?.id)}
                                        isActive={activeCategory === item?.id}
                                        className="text-sm"
                                    >
                                        {item?.name}
                                    </MenuButton>
                                );
                            })}
                        </div>
                    </div>

                    {/* Mobile Cart Summary */}
                    <div className="lg:hidden mt-4 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-200">
                        <div className="text-center">
                            <div className="text-sm text-gray-600 mb-1">
                                {totalItems} {totalItems === 1 ? 'item' : 'items'} in cart
                            </div>
                            <div className="font-bold text-xl text-gray-800">{formattedTotal}</div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="lg:ml-72 pt-16 min-h-screen">
                <div className="p-4 sm:p-6 pb-32">
                    <div className="max-w-7xl mx-auto">
                        {renderContent()}
                    </div>
                </div>
            </main>

            {/* Bottom Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 lg:left-72 z-30">
                <div className="bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-2xl">
                    <div className="px-4 py-4">
                        <div className="max-w-7xl mx-auto">
                            {/* Mobile Layout */}
                            <div className="lg:hidden space-y-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-sm text-gray-600">
                                            {totalItems} {totalItems === 1 ? 'item' : 'items'}
                                        </div>
                                        <div className="font-bold text-lg">{formattedTotal}</div>
                                    </div>
                                    <button
                                        onClick={() => setIsModalOpen(true)}
                                        className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                                        disabled={totalItems === 0}
                                    >
                                        <Trash2 size={20} className="text-gray-600" />
                                    </button>
                                </div>
                                <button
                                    onClick={() => setOpenPopup(true)}
                                    disabled={totalItems === 0}
                                    className={`
                                        w-full py-3 px-6 rounded-xl font-bold text-lg transition-all duration-300 transform
                                        ${totalItems > 0
                                            ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95'
                                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        }
                                    `}
                                >
                                    <div className="flex items-center justify-center space-x-2">
                                        <ShoppingCart size={20} />
                                        <span>Order Now</span>
                                    </div>
                                </button>
                            </div>

                            {/* Desktop Layout */}
                            <div className="hidden lg:flex items-center justify-between">
                                <div className="flex items-center space-x-6">
                                    <div>
                                        <div className="text-sm text-gray-600">Total</div>
                                        <div className="font-bold text-2xl">{formattedTotal}</div>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        {totalItems} {totalItems === 1 ? 'item' : 'items'} in cart
                                    </div>
                                </div>

                                <div className="flex items-center space-x-4">
                                    <button
                                        onClick={() => setIsModalOpen(true)}
                                        disabled={totalItems === 0}
                                        className={`
                                            px-6 py-3 rounded-xl font-medium transition-all duration-300
                                            ${totalItems > 0
                                                ? 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900'
                                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            }
                                        `}
                                    >
                                        Clear Cart
                                    </button>

                                    <button
                                        onClick={() => setOpenPopup(true)}
                                        disabled={totalItems === 0}
                                        className={`
                                            px-8 py-3 rounded-xl font-bold text-lg transition-all duration-300 transform
                                            ${totalItems > 0
                                                ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95'
                                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            }
                                        `}
                                    >
                                        <div className="flex items-center space-x-2">
                                            <ShoppingCart size={20} />
                                            <span>Order Now</span>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <CheckoutPopup 
                open={openPopup} 
                onClose={handleClosePop} 
                title="Checkout" 
                items={<Checkout />} 
            />

            <ConfirmModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={() => {
                    setIsModalOpen(false);
                    handleStartOver();
                }}
            />

            {/* Custom Styles */}
            <style jsx>{`
                .custom-scrollbar {
                    scrollbar-width: thin;
                    scrollbar-color: #f97316 #f1f5f9;
                }
                
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f5f9;
                    border-radius: 3px;
                }
                
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #f97316;
                    border-radius: 3px;
                }
                
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #ea580c;
                }
            `}</style>
        </div>
    );
};

export default TabsLayout;