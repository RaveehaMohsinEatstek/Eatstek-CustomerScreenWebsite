import React, { useState, useEffect } from "react";
import { useCart } from "react-use-cart";
import { useSGlobalContext } from "../../lib/contexts/useGlobalContext";
import { productApi } from "../../lib/services";
import { Spinner } from "flowbite-react";
import { IoFastFood } from "react-icons/io5";
import { GiFoodTruck } from "react-icons/gi";
import { BsCashStack } from "react-icons/bs";
import CustomPopoup from "../common/CustomPopoup";
import { ToastContainer, toast, Bounce } from "react-toastify";
import { showToast } from "../../lib/utils/helpers";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import ProductDetails from "./ProductDetails";
import DealDetails from "./DealDetails.";

const Checkout = () => {
  const { toggleCheckoutFunction, allData } = useSGlobalContext();
  const {
    isEmpty,
    totalUniqueItems,
    items,
    updateItemQuantity,
    removeItem,
    cartTotal,
    emptyCart,
    addItem
  } = useCart();
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [loadings, setLoadings] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedOption, setSelectedOption] = useState("Eat In");
  const [paymentMethod, setPaymentMethod] = useState("PaidAtCounter");
  const [openPopup, setOpenPopup] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [day, setDay] = useState("");
  const [date, setDate] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [branchDetails, setBranchDetails] = useState(null);
  const navigate = useNavigate();

  const [macAddress, setMacAddress] = useState("");
  
  // Editing state variables
  const [editingItem, setEditingItem] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const fetchMacAddress = async () => {
    try {
      const response = await productApi.getCustomerScreenWebsiteMacAddress();
      if (response.data.success && response.data.mac_address) {
        setMacAddress(response.data.mac_address);
        return response.data.mac_address;
      }
      return null;
    } catch (error) {
      console.error("Error fetching MAC address:", error);
      return null;
    }
  };

  // Fetch branch details
  const getBranchDetails = async () => {
    try {
      const response = await productApi.getBranchDetails();
      if (response?.data?.length > 0) {
        setBranchDetails(response.data[0]);
      }
    } catch (error) {
      console.error("Error fetching branch details:", error);
    }
  };

  useEffect(() => {
    getBranchDetails();
    updateDateTime();
  }, []);

  const updateDateTime = () => {
    const now = new Date();
    setDay(now.toLocaleString("en-us", { weekday: "long" }));
    setDate(`${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()}`);
    setDateTime(`${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`);
  };

  // Edit item functions
  const handleEditItem = (item) => {
    setEditingItem(item);
    setShowEditModal(true);
  };

  const handleUpdateItem = (updatedItem) => {
    console.log("Updating item without flickering");
    
    // If IDs are the same (no changes made), just update quantity if needed
    if (editingItem.id === updatedItem.id) {
      if (editingItem.quantity !== updatedItem.quantity) {
        updateItemQuantity(editingItem.id, updatedItem.quantity);
      }
      setShowEditModal(false);
      setEditingItem(null);
      return;
    }

    // If IDs are different, use a batched approach to prevent race conditions
    // First, prepare the new item with the same quantity as the old one if not specified
    const itemToAdd = {
      ...updatedItem,
      quantity: updatedItem.quantity || editingItem.quantity
    };

    // Use setTimeout to ensure operations happen in sequence
    setTimeout(() => {
      // Remove old item
      removeItem(editingItem.id);
      
      // Add new item after a brief delay to ensure removal completed
      setTimeout(() => {
        addItem(itemToAdd, itemToAdd.quantity);
      }, 50);
    }, 10);
    
    // Close modal immediately for better UX
    setShowEditModal(false);
    setEditingItem(null);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingItem(null);
  };

  const handleCheckout = () => {
    setShowConfirmation(true);
    setOpenPopup(true);
  };

  const confirmCheckout = async () => {
    setLoadings(true);
    const screenMacAddress = await fetchMacAddress();
    console.log("MAC Address for order:", screenMacAddress);
    
    let singleItems = [];
    let mealItems = [];
    let dealItems = [];

    items.forEach((item) => {
      if (item.side && item.drink) {
        mealItems.push(item);
      } else if (item.deal) {
        dealItems.push(item);
      } else {
        singleItems.push(item);
      }
    });

    const orderData = {
      cart: {
        single: singleItems,
        meal: mealItems,
        deal: dealItems,
      },
      totalBill: cartTotal,
      payMethod: "cash",
      payStatus: "pending",
      tprice: cartTotal,
      sprice: cartTotal,
      orderType: selectedOption,
      macAddress: screenMacAddress || "",
    };

    try {
      const response = await productApi.finalizeOrder(orderData);
      if (response.data) {
        setOrderNumber(response.data.order_no);
        showToast("Order placed successfully!", "success");
        setShowSuccessMessage(true);
        
        setTimeout(() => {
          toggleCheckoutFunction(false);
          emptyCart();
          setShowSuccessMessage(false);
        }, 8000);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      showToast("Failed to place order", "error");
    } finally {
      setLoadings(false);
    }
  };

  const handleOkClick = () => {
    setShowConfirmation(false);
    setOpenPopup(false);
    confirmCheckout();
  };

  if (isEmpty) {
    return (
      <p className="text-center mt-10 text-xl font-semibold">
        Your cart is empty
      </p>
    );
  }

  const dataList = [
    {
      title: "Eat In",
      icon: <IoFastFood className="text-[40px] mx-auto" />,
      handleClick: () => setSelectedOption("Eat In"),
      type: "orderType"
    },
    {
      title: "Take Away",
      icon: <GiFoodTruck className="text-[40px] mx-auto" />,
      handleClick: () => setSelectedOption("Take Away"),
      type: "orderType"
    },
    {
      title: "Pay At Counter",
      icon: <BsCashStack className="text-[40px] mx-auto" />,
      handleClick: () => setPaymentMethod("PaidAtCounter"),
      type: "paymentMethod"
    },
  ];

  return (
    <>
      {loadings ? (
        <div className="screen_loader fixed inset-0 bg-white z-[60] flex flex-col items-center justify-center">
          <Spinner aria-label="Processing order" size="xl" />
          <p className="mt-4 text-lg font-semibold text-gray-700">
            Processing your order...
          </p>
        </div>
      ) : (
        <>
          <ToastContainer />
          <div className="container mx-auto pt-0 p-4">
            <div className="flex flex-col lg:flex-col">
              <div>
                <h2 className="text-xl font-semibold mb-4 text-gray-400">
                  Your Cart ({totalUniqueItems} items)
                </h2>
                <ul>
                  {items?.map((item) => (
                    <li key={item.id} className="mb-6 border-b pb-4">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="font-bold text-lg">
                            {item.name}
                            {item?.meal && (
                              <span className="text-[#d97766] text-sm font-bold">
                                (Meal)
                              </span>
                            )}
                            {item?.deal && (
                              <span className="text-[#d97766] text-sm font-bold">
                                (Deal)
                              </span>
                            )}
                          </h3>
                          <p className="text-gray-600">
                            Price: £{parseFloat(item.price || 0).toFixed(2)}
                          </p>
                          {item.size && (
                            <p className="text-gray-600">Size : {item.size}</p>
                          )}
                          {item.addonss && item.addonss.length > 0 && (
                            <p className="text-gray-600">
                              Addons : {item.addonss.join(", ")}
                            </p>
                          )}
                          {item.choices &&
                            item.choices.map((choice) => {
                              // Grouping choice options by choice_name
                              const groupedChoices = (choice?.choice_options && choice.choice_options.length > 0)
                                ? choice.choice_options.reduce((acc, option) => {
                                  const name = option?.choice_name;
                                  if (!acc[name]) {
                                    acc[name] = [];
                                  }
                                  acc[name].push(option.option_name);
                                  return acc;
                                }, {})
                                : {};  // Return an empty object if no choices are available

                              return (
                                <div key={choice.choice_id} className="mb-4">
                                  {Object.entries(groupedChoices)?.map(([choiceName, options]) => (
                                    <div key={choiceName}>
                                      <p className="text-gray-600">
                                        {choiceName} :{" "}
                                        {options.map((option, index) => (
                                          <span key={index}>
                                            {option}
                                            {index !== options.length - 1 && ", "}
                                          </span>
                                        ))}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              );
                            })}
                          {item.selectedProducts &&
                            item.selectedProducts.map((product) => (
                              <div key={product.category_id}>
                                {product?.selected_products &&
                                  product?.selected_products?.map((selectedProduct) => {
                                    const groupedChoices = (selectedProduct.choices || []).reduce((acc, choice) => {
                                      const choiceName = choice.choice_name;
                                      if (!acc[choiceName]) {
                                        acc[choiceName] = [];
                                      }
                                      acc[choiceName].push(choice.name);
                                      return acc;
                                    }, {});

                                    return (
                                      <div key={selectedProduct.pid} className="mt-1 text-gray-600">
                                        <h3 className="text-md font-semibold">{selectedProduct.product_name}
                                          <span className="text-sm font-normal">
                                            {"  "} ({product.category_name})
                                          </span>
                                        </h3>
                                        {Object.entries(groupedChoices)?.map(([choiceName, options]) => (
                                          <div key={choiceName}>
                                            <p>
                                              {choiceName} : {" "}
                                              {options.map((option, index) => (
                                                <span key={index}>
                                                  {option}
                                                  {index !== options.length - 1 && ", "}
                                                </span>
                                              ))}
                                            </p>
                                          </div>
                                        ))}
                                      </div>
                                    );
                                  })}
                              </div>
                            ))}
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="flex items-center">
                            <button
                              onClick={() =>
                                updateItemQuantity(item.id, item.quantity - 1)
                              }
                              className="px-2 py-1 bg-gray-200 rounded-l"
                            >
                              -
                            </button>
                            <span className="px-3 py-1 bg-gray-100">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateItemQuantity(item.id, item.quantity + 1)
                              }
                              className="px-2 py-1 bg-gray-200 rounded-r"
                            >
                              +
                            </button>
                          </div>
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => handleEditItem(item)}
                              className="text-blue-500 hover:bg-blue-100 px-2 py-1 rounded"
                              title="Edit Item"
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-red-500 hover:bg-red-100 px-2 py-1 rounded"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="bg-gray-100 p-6 rounded-lg shadow-lg">
                  <h2 className="text-xl font-semibold mb-3">Order Summary</h2>
                  <div className="flex justify-between mb-3">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-semibold">£{cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-xl mb-4">
                    <span>Total:</span>
                    <span>£{cartTotal.toFixed(2)}</span>
                  </div>
                  <button
                    onClick={handleCheckout}
                    disabled={loadings}
                    className={`w-full bg-[#D97706] text-white py-2 rounded-md hover:bg-[#B45309] transition ${
                      loadings ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {loadings ? (
                      <>
                        <Spinner aria-label="Loading" size="sm" />
                        <span className="pl-3">Processing...</span>
                      </>
                    ) : (
                      "Complete Checkout"
                    )}
                  </button>
                </div>
              </div>
            </div>

            {showSuccessMessage && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                <div className="bg-white p-6 rounded shadow-lg text-center min-w-[450px] animate-fade-in">
                  <div className="table mx-auto">
                    <img
                      className="rounded-t-lg"
                      src={`https://${import.meta.env.VITE_API_BASE_URL}/check_img.gif`}
                      alt="Order Complete"
                    />
                  </div>
                  <h2 className="text-2xl font-bold mb-4">Order Complete!</h2>
                  <p className="text-xl mb-2">Please pay at the counter.</p>
                  <p className="text-3xl font-bold text-[#D97706] mt-4">
                    Order #: {orderNumber}
                  </p>
                </div>
              </div>
            )}

            {showConfirmation && (
              <CustomPopoup
                open={openPopup}
                title="Select Options"
                size="4xl"
                dismissible={true}
                onClose={() => {
                  setOpenPopup(false);
                  setShowConfirmation(false);
                }}
                items={
                  <div className="flex flex-col items-center justify-center z-50 gap-3">
                    <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
                      {dataList.map((item, index) => {
                        const isActive = 
                          item.type === "orderType" 
                            ? item.title === "Eat In" && selectedOption === "Eat In" ||
                              item.title === "Take Away" && selectedOption === "Take Away"
                            : paymentMethod === "PaidAtCounter";

                        return (
                          <div
                            key={index}
                            className={`flex items-center justify-center p-4 h-[120px] sm:h-[150px] w-full sm:w-[150px] border border-gray-300 rounded-lg shadow text-center cursor-pointer transition-all duration-300 ease-in-out ${
                              isActive ? "bg-[#d97706]" : "bg-white hover:bg-gray-50"
                            }`}
                            onClick={item.handleClick}
                          >
                            <div className="flex items-center justify-center flex-col">
                              <div
                                className={`text-[30px] sm:text-[40px] mx-auto ${
                                  isActive ? "text-white" : "text-[#d97706]"
                                }`}
                              >
                                {item.icon}
                              </div>
                              <h2
                                className={`text-sm sm:text-lg mt-1 ${
                                  isActive ? "text-white" : "text-black"
                                }`}
                              >
                                {item.title}
                              </h2>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-4 text-center">
                      <p className="text-sm text-gray-600 mb-2">
                        Selected: {selectedOption} • {paymentMethod === "PaidAtCounter" ? "Pay at Counter" : "Other"}
                      </p>
                    </div>

                    <button
                      onClick={handleOkClick}
                      className="mt-6 bg-[#d97706] text-white px-6 py-3 rounded-lg text-lg sm:text-xl font-bold shadow hover:bg-[#b56255] transition-all duration-300 ease-in-out w-full sm:w-auto"
                    >
                      Confirm Order
                    </button>
                  </div>
                }
              />
            )}

            {/* Edit Item Modal */}
            {showEditModal && editingItem && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
                <div className="bg-white rounded-lg shadow-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-lg font-bold">
                      Edit {editingItem.deal ? 'Deal' : 'Item'}
                    </h3>
                    <button
                      onClick={closeEditModal}
                      className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                      ×
                    </button>
                  </div>
                  <div className="p-4">
                    {editingItem.deal ? (
                      <DealDetails
                        selected_deal={{
                          item: editingItem.originalDeal || editingItem,
                          lines: editingItem.originalDeal?.lines || [],
                          quantity: editingItem.quantity
                        }}
                        allData={editingItem.allData || allData }
                        isEditMode={true}
                        editingItem={editingItem}
                        onUpdateItem={handleUpdateItem}
                        closeModal={closeEditModal}
                      />
                    ) : (
                      <ProductDetails
                        product_detail={editingItem.originalProduct || editingItem}
                        isEditMode={true}
                        editingItem={editingItem}
                        onUpdateItem={handleUpdateItem}
                        closeModal={closeEditModal}
                      />
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default Checkout;