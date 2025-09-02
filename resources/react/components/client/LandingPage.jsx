import React, { useState, useEffect } from 'react';
import { Wifi, Leaf, Utensils, MapPin, Phone, Globe, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LandingPage = ({ onPlaceOrder }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const navigate = useNavigate();

  // Sample images - replace with your actual restaurant images
  const heroImages = [
    'https://images.unsplash.com/photo-1514933651103-005eec06c04b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80',
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1887&q=80',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80'
  ];

  useEffect(() => {
    setIsVisible(true);

    // Auto-slide images
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const [tableNumber, setTableNumber] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const table = urlParams.get("table");
    setTableNumber(table);
  }, []);

  const handlePlaceOrder = () => {
    if (!tableNumber) {
      alert(
        "Table number is required to place an order. Please scan the QR code again."
      );
      return;
    }

    navigate(`/counter-screen?table=${tableNumber}`);
  };


  const scrollToInfo = () => {
    document.getElementById('info-section').scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      {/* Hero Section */}
      <div className="relative h-screen overflow-hidden">
        {/* Background Image Slider */}
        <div className="absolute inset-0">
          {heroImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${index === currentImage ? 'opacity-100' : 'opacity-0'
                }`}
            >
              <img
                src={image}
                alt={`Restaurant view ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            </div>
          ))}
        </div>

        {/* Animated particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-orange-400 rounded-full opacity-20 animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            ></div>
          ))}
        </div>

        {/* Hero Content */}
        <div className="relative z-10 flex flex-col justify-center items-center h-full text-center px-4">
          <div
            className={`transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}
          >
            {/* Logo/Brand */}
            <div className="mb-8">
              <div className="inline-block p-4 bg-white bg-opacity-10 backdrop-blur-sm rounded-full mb-4">
                <Utensils size={60} className="text-orange-400" />
              </div>
              <h1 className="text-6xl md:text-7xl font-bold text-white mb-4 tracking-tight">
                Chai Haute
              </h1>
              {tableNumber && (
                <h5 className="text-2xl md:text-3xl font-semibold text-yellow-300 mt-2">
                  Welcome, Table {tableNumber}
                </h5>
              )}
              <div className="w-24 h-1 bg-gradient-to-r from-orange-400 to-amber-400 mx-auto mb-6 rounded-full"></div>
              <p className="text-xl md:text-2xl text-orange-100 max-w-2xl mx-auto leading-relaxed">
                Experience the finest flavors with our authentic cuisine and exceptional service
              </p>
            </div>

            {/* Service Highlights */}
            <div className="flex flex-wrap justify-center gap-6 mb-12">
              <div className="flex items-center space-x-2 bg-white bg-opacity-10 backdrop-blur-sm px-4 py-2 rounded-full">
                <Utensils size={20} className="text-orange-400" />
                <span className="text-white font-medium">All You Can Eat</span>
              </div>
              <div className="flex items-center space-x-2 bg-white bg-opacity-10 backdrop-blur-sm px-4 py-2 rounded-full">
                <Leaf size={20} className="text-green-400" />
                <span className="text-white font-medium">Vegetarian Options</span>
              </div>
              <div className="flex items-center space-x-2 bg-white bg-opacity-10 backdrop-blur-sm px-4 py-2 rounded-full">
                <Wifi size={20} className="text-blue-400" />
                <span className="text-white font-medium">Free Wi-Fi</span>
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={handlePlaceOrder}
              className="group relative bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-12 py-4 rounded-full text-xl font-bold shadow-2xl hover:shadow-orange-500/50 transform hover:scale-105 transition-all duration-300"
            >
              <span className="relative z-10">Place Your Order</span>
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-amber-400 rounded-full blur opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>

            {/* Scroll Indicator */}
            <button
              onClick={scrollToInfo}
              className="mt-16 flex flex-col items-center text-white animate-bounce cursor-pointer"
            >
              <span className="text-sm mb-2">Learn More</span>
              <ChevronDown size={24} />
            </button>
          </div>
        </div>

        {/* Image indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImage(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentImage ? 'bg-orange-400 scale-125' : 'bg-white bg-opacity-50'
                }`}
            ></button>
          ))}
        </div>
      </div>

      {/* Info Section */}
      <div id="info-section" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Quick Order Section */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-6">Order Like You're Already Here</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12">
              Skip the wait! Browse our menu, place your order, and pay at the counter when you arrive.
              It's dining made simple and seamless.
            </p>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="group">
                <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:scale-105">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-2xl">1</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Browse Menu</h3>
                  <p className="text-gray-600">Explore our delicious offerings and make your selections</p>
                </div>
              </div>

              <div className="group">
                <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:scale-105">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-2xl">2</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Place Order</h3>
                  <p className="text-gray-600">Add items to your cart and confirm your order</p>
                </div>
              </div>

              <div className="group">
                <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:scale-105">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-2xl">3</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Pay at Counter</h3>
                  <p className="text-gray-600">Complete your payment when you arrive at the restaurant</p>
                </div>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-10 py-4 rounded-full text-lg font-bold shadow-xl hover:shadow-orange-500/30 transform hover:scale-105 transition-all duration-300"
            >
              Start Ordering Now
            </button>
          </div>

          {/* Contact Info */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-3xl font-bold text-gray-800 mb-8">Visit Us</h3>
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-amber-400 rounded-full flex items-center justify-center">
                      <MapPin size={20} className="text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800">Address</h4>
                      <p className="text-gray-600">685 Stratford Rd, Birmingham B11 4DX, United Kingdom</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-amber-400 rounded-full flex items-center justify-center">
                      <Phone size={20} className="text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800">Phone</h4>
                      <p className="text-gray-600">+44 121 274 5595</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-amber-400 rounded-full flex items-center justify-center">
                      <Globe size={20} className="text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800">Website</h4>
                      <a href="https://chaihauteonline.co.uk" className="text-orange-600 hover:text-orange-700 transition-colors">
                        chaihauteonline.co.uk
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80"
                    alt="Restaurant Interior"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-orange-400 to-amber-400 rounded-full opacity-20"></div>
                <div className="absolute -top-4 -left-4 w-16 h-16 bg-gradient-to-br from-orange-300 to-amber-300 rounded-full opacity-30"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={handlePlaceOrder}
        className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-full shadow-2xl hover:shadow-orange-500/50 flex items-center justify-center transform hover:scale-110 transition-all duration-300 z-50"
      >
        <Utensils size={24} />
      </button>
    </div>
  );
};

export default LandingPage;