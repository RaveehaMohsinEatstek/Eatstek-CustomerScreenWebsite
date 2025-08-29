import React, { useEffect, useState, useMemo } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import CounterBox from "../common/CounterBox";
import { useCart } from "react-use-cart";
import DealsPopup from "../common/DealsPopup";
import { FaCirclePlus } from "react-icons/fa6";
import { showToast } from "../../lib/utils/helpers";
import { LIVE_URL } from "../../lib/services/api/httpClient";
import { ToastContainer } from "react-toastify";
import { productApi } from "../../lib/services";

export default function DealDetails(props) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [totalPrice, setTotalPrice] = useState((props.selected_deal?.lines[0]?.pricing_value || "").split(" ")[0]);
  const [fromProducts, setFromProducts] = useState([]);
  const [openPopup, setOpenPopup] = useState(false);
  const [popupTitle, setPopupTitle] = useState("");
  const [indexWise, setIndexWise] = useState("");
  const [choices, setChoices] = useState([]);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [choice_options, setChoice_options] = useState([]);
  const [selectedChoiceOption, setSelectedChoiceOption] = useState([]);
  const [inventoryData, setInventoryData] = useState(null);

  // Add editing props
  const { isEditMode = false, editingItem = null, onUpdateItem } = props;

  // Helper function to parse price from string (e.g., "2.00 GBP" -> 2.00)
  const parsePrice = (priceString) => {
    if (!priceString) return 0;
    const price = parseFloat(priceString.toString().split(" ")[0]);
    return isNaN(price) ? 0 : price;
  };

  // Helper function to get extra charge for a product by finding it in singleItems
  const getExtraChargeFromSingleItems = (categoryId, skuId) => {
    const category = dealItems?.singleItems?.find(item => item.category_id === categoryId);
    if (!category) return 0;
    
    const sku = category.skus?.find(sku => sku.sku_id === skuId);
    return sku ? parsePrice(sku.extra_charge) : 0;
  };

  // Helper function to check if an item is in stock
  const isItemInStock = (skuRef, optionRef = null) => {
    // Check if inventoryData exists and is an array
    if (!inventoryData || !Array.isArray(inventoryData)) {
      return true; // Show if no inventory data or invalid data
    }
    
    // Check by sku_ref first
    if (skuRef) {
      const skuItem = inventoryData.find(item => item && item.sku_ref === skuRef);
      if (skuItem) {
        return skuItem.stock === null || skuItem.stock === undefined || skuItem.stock > 0;
      }
    }
    
    // Check by option_ref if provided
    if (optionRef) {
      const optionItem = inventoryData.find(item => item && item.option_ref === optionRef);
      if (optionItem) {
        return optionItem.stock === null || optionItem.stock === undefined || optionItem.stock > 0;
      }
    }
    
    // If not found in inventory data, show it (assume available)
    return true;
  };

  // Filter available choice options based on stock
  const getAvailableChoiceOptions = (options) => {
    if (!options) return [];
    
    return options.filter(option => {
      const optionRef = option.option_ref || option.ref || option.hubrise_ref;
      return isItemInStock(null, optionRef);
    });
  };

  // Filter available SKUs based on stock
  const getAvailableSKUs = (skus) => {
    if (!skus) return [];
    
    return skus.filter(sku => {
      const skuRef = sku.sku_ref || sku.ref || sku.hubrise_ref;
      return isItemInStock(skuRef);
    });
  };

  const fetchHubriseInventory = async () => {
    try {
      const response = await productApi.getHubriseStock();
      console.log("Hubrise Inventory Response:", response);
      
      // Handle the nested data structure
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        setInventoryData(response.data.data);
        console.log("Inventory data set:", response.data.data);
      } else if (response.data && Array.isArray(response.data)) {
        // Fallback if the structure is different
        setInventoryData(response.data);
      } else {
        console.warn("Inventory data is not in expected format:", response);
        setInventoryData([]);
      }
    } catch (error) {
      console.error("Error fetching Hubrise inventory:", error);
      showToast("Error fetching inventory data", "error");
      setInventoryData([]); // Set empty array on error
    }
  };

  const [dealItems, setDealItems] = useState(() => {
    const selectedDeal = props.selected_deal?.item;
    const totalPrice = props.selected_deal?.item?.lines[0]?.pricing_value || 0;
    const quantity = props.selected_deal?.quantity || 1;

    const generateUniqueId = () => {
      return Date.now().toString(36) + Math.random().toString(36).substring(2);
    };

    return {
      id: `${selectedDeal?.id}_${generateUniqueId()}`,
      name: selectedDeal?.name,
      image: selectedDeal?.image_data[0],
      sprice: (parseFloat(totalPrice) / quantity).toFixed(2),
      tprice: (parseFloat(totalPrice) / quantity).toFixed(2),
      description: selectedDeal?.description,
      product_name: selectedDeal?.name,
      productId: selectedDeal?.category_id,
      deal_id: selectedDeal?.id,
      price: (parseFloat(totalPrice) / quantity).toFixed(2),
      choiceCategory: selectedDeal?.lines?.map((addon) => addon.label),
      quantity: quantity,
      deal: true,
      selectedProducts: selectedDeal?.lines?.map((category) => ({
        category_id: category.id,
        category_name: category.label,
        quantity: 0,
        selected_products: Array.from({ length: 1 }).map(() => ({})),
      })) || [],
      singleItems: selectedDeal?.lines?.map((category) => ({
        category_id: category.id,
        label: category.label,
        skus: category.skus
      })) || []
    };
  });

  // Fetch inventory when component mounts
  useEffect(() => {
    if (props.selected_deal) {
      fetchHubriseInventory();
    }
  }, [props.selected_deal]);

  // Pre-populate data when editing
  useEffect(() => {
    if (isEditMode && editingItem) {
      // Set quantity
      setQuantity(editingItem.quantity || 1);

      // Pre-populate selected products with their choices
      if (editingItem.selectedProducts) {
        setDealItems(prev => ({
          ...prev,
          selectedProducts: editingItem.selectedProducts,
          quantity: editingItem.quantity || 1
        }));

        // Pre-populate all choice options from all selected products
        const allChoiceOptions = editingItem.selectedProducts
          .flatMap(product => product.selected_products)
          .flatMap(selected => selected.choices || []);

        setSelectedChoiceOption(allChoiceOptions);
      }
    }
  }, [isEditMode, editingItem]);

  useEffect(() => {
    if (isEditMode && editingItem) return;
    
    const updatedSelectedProducts = props.selected_deal?.lines?.map((category) => {
      // Check if this category has any available products
      const availableProducts = getAvailableSKUs(category?.skus || []);
      const hasAvailableProducts = availableProducts.length > 0;

      return {
        category_id: category.id,
        category_name: category.label,
        quantity: 0,
        selected_products: [{
          product_name: null,
          pid: null,
          category_id: category.id,
          sku_id: null,
          sku_options: [],
          choices: [],
          extra_charge: 0, // Add extra_charge field
        }],
      };
    });
  
    setDealItems((prev) => ({
      ...prev,
      selectedProducts: updatedSelectedProducts,
    }));
  }, [props.selected_deal, inventoryData, isEditMode, editingItem]);

  useEffect(() => {
    if (isEditMode && editingItem) return;
    
    const allOptions = dealItems?.selectedProducts
      .flatMap(option => option.selected_products)
      .flatMap(product => product.data_options || []);

    setChoices(allOptions);
  }, [dealItems?.selectedProducts, isEditMode, editingItem]);

  const [activeChoiceProduct, setActiveChoiceProduct] = useState(null);

  const handleChoiceClick = (choice, productId) => {
    // Check if the choice is "Make it a Meal" or "Make it a Meal (FC)"
    if (choice?.name === "Make it a Meal" || choice?.name === "Make it a Meal (FC)") {
      choice.min_selections = 0;
    }

    // Check if the same choice is already selected
    if (selectedChoice?.id === choice.id && activeChoiceProduct === productId) {
      setSelectedChoice(null);
      setChoice_options([]);
    } else {
      setActiveChoiceProduct(productId);
      setSelectedChoice(choice);
      
      // Filter and sort options based on stock availability
      const availableOptions = getAvailableChoiceOptions(choice?.options || []);
      const sortedOptions = availableOptions.sort((a, b) => {
        return (a.order || 0) - (b.order || 0);
      }).map((option) => ({
        ...option,
        min_selections: choice?.min_selections,
        max_selections: choice?.max_selections,
      }));

      setChoice_options(sortedOptions);
    }
  };

  const handleChoiceOptionClick = (option, sku_id) => {
    // Check if the option is still in stock before allowing selection
    const optionRef = option.option_ref || option.ref || option.hubrise_ref;
    if (!isItemInStock(null, optionRef)) {
      showToast(`${option.name} is out of stock!`, "error");
      return;
    }

    setSelectedChoiceOption((prev) => {
      const choiceName = selectedChoice?.name;
      const isRequiredChoice = option.min_selections === 1 && option.max_selections === 1;

      const updatedSelectedProducts = dealItems?.selectedProducts.map((product) => {
        const updatedProducts = product?.selected_products?.map((selected) => {
          if (selected.sku_id === sku_id) {
            const currentChoices = selected.choices || [];
            const isAlreadySelected = currentChoices?.some((item) => item.id === option.id);

            if (isRequiredChoice) {
              const filteredChoices = currentChoices?.filter(
                (item) => item.choice_name !== choiceName
              );

              return {
                ...selected,
                choices: isAlreadySelected
                  ? filteredChoices
                  : [...filteredChoices,
                  { ...option, choice_name: choiceName, sku_id }],
              };
            } else {
              return {
                ...selected,
                choices: isAlreadySelected
                  ? currentChoices.filter((item) => item.id !== option.id)
                  : [...currentChoices, { ...option, choice_name: choiceName, sku_id }],
              };
            }
          }
          return selected;
        });

        return { ...product, selected_products: updatedProducts };
      });

      setDealItems((prev) => ({
        ...prev,
        selectedProducts: updatedSelectedProducts,
      }));

      return updatedSelectedProducts.flatMap((product) =>
        product.selected_products.flatMap((p) => p.choices || [])
      );
    });
  };

  const validateSelectedProducts = () => {
    return dealItems?.selectedProducts.every((category) =>
      category.selected_products.some(
        (product) => product.product_name && product.pid
      )
    );
  };

  useEffect(() => {
    if (isEditMode && editingItem) return;
    
    if (dealItems?.selectedProducts) {
      const filteredChoices = dealItems.selectedProducts
        .flatMap((product) => product.selected_products)
        .flatMap((selectedProduct) => selectedProduct.data_options || [])
        .filter(
          (choice) =>
            choice?.name !== "Make it a Meal" && choice?.name !== "Make it a Meal (FC)"
        );

      setChoices(filteredChoices);
    }
  }, [dealItems?.selectedProducts, isEditMode, editingItem]);

  const computedTotalPrice = useMemo(() => {
    setDealItems((prev) => ({
      ...prev,
      quantity: quantity,
    }));

    let basePrice = parseFloat((props.selected_deal?.lines[0]?.pricing_value || "0").split(" ")[0]);

    // Add extra charges from selected products
    const extraChargesPrice = dealItems.selectedProducts
      .flatMap(product => product.selected_products)
      .reduce((total, selected) => {
        const extraCharge = selected.extra_charge || 0;
        return total + extraCharge;
      }, 0);

    // Add choice options price
    const choiceOptionsPrice = dealItems.selectedProducts
      .flatMap(product => product.selected_products)
      .flatMap(selected => selected.choices || [])
      .reduce((total, choice) => {
        const choicePrice = parsePrice(choice.price);
        return total + choicePrice;
      }, 0);

    console.log("Price calculation:", {
      basePrice,
      extraChargesPrice,
      choiceOptionsPrice,
      total: (basePrice + extraChargesPrice + choiceOptionsPrice) * quantity
    });

    return (basePrice + extraChargesPrice + choiceOptionsPrice) * quantity;
  }, [quantity, dealItems.selectedProducts]);

  useEffect(() => {
    setTotalPrice(computedTotalPrice.toFixed(2));
  }, [computedTotalPrice]);

  const handleData = (id, name, index) => {
    setPopupTitle(name);
    setIndexWise(index);
    const getProducts = props.selected_deal?.lines?.find(
      (item) => item.id === id
    );
    
    // Add extra charge information to products for the popup
    const availableProducts = getAvailableSKUs(getProducts?.skus || []).map(sku => ({
      ...sku,
      extra_charge_amount: parsePrice(sku.extra_charge),
      extra_charge_display: sku.extra_charge ? `+£${parsePrice(sku.extra_charge).toFixed(2)}` : null
    }));
    
    setFromProducts(availableProducts);
    setOpenPopup(true);
    setChoices([]);
    setSelectedChoice("");
    setChoice_options([]);
  };

  const addToCart = () => {
    // First check if all categories have at least one product selected
    if (!validateSelectedProducts()) {
      showToast("Please select Products from all Categories", "error");
      return;
    }

    // Check if selected products are still in stock
    const outOfStockProducts = dealItems.selectedProducts.some(category => {
      return category.selected_products.some(product => {
        if (!product.sku_id) return false;
        
        // Check if the main product is in stock
        const skuRef = product.sku_ref || product.ref || product.hubrise_ref;
        if (!isItemInStock(skuRef)) {
          showToast(`${product.product_name} is out of stock!`, "error");
          return true;
        }

        // Check if selected choices are in stock
        return (product.choices || []).some(choice => {
          const optionRef = choice.option_ref || choice.ref || choice.hubrise_ref;
          if (!isItemInStock(null, optionRef)) {
            showToast(`${choice.name} is out of stock!`, "error");
            return true;
          }
          return false;
        });
      });
    });

    if (outOfStockProducts) {
      return;
    }

    // Now check required choices for each selected product
    const missingRequiredChoices = dealItems.selectedProducts.some(category => {
      return category.selected_products.some(product => {
        if (!product.data_options) return false;
        
        // Find required choices for this product (min_selections = 1 and max_selections = 1)
        const requiredChoices = product.data_options.filter(
          choice => choice.min_selections === 1 && choice.max_selections === 1
        );

        // Check if all required choices have at least one option selected
        return requiredChoices.some(requiredChoice => {
          const selectedOptions = (product.choices || []).filter(
            option => option.choice_name === requiredChoice.name
          );
          
          return selectedOptions.length === 0;
        });
      });
    });

    if (missingRequiredChoices) {
      showToast("Please select all required options for each product", "error");
      return;
    }

    // Create a clean deal object without the entire catalog data
    const updatedDealItems = {
      id: dealItems.id,
      name: dealItems.name,
      image: dealItems.image,
      sprice: (computedTotalPrice / quantity).toFixed(2),
      tprice: computedTotalPrice.toFixed(2),
      description: dealItems.description,
      product_name: dealItems.name,
      productId: dealItems.productId,
      deal_id: dealItems.deal_id,
      price: (computedTotalPrice / quantity).toFixed(2),
      choiceCategory: dealItems.choiceCategory,
      quantity: quantity,
      deal: true,
      selectedProducts: dealItems.selectedProducts,
      singleItems: dealItems.singleItems,
      originalDeal: {
        id: props.selected_deal?.item?.id,
        name: props.selected_deal?.item?.name,
        image_data: props.selected_deal?.item?.image_data,
        description: props.selected_deal?.item?.description,
        category_id: props.selected_deal?.item?.category_id,
        lines: props.selected_deal?.item?.lines
      }
    };

    if (isEditMode) {
      // Update existing item
      onUpdateItem && onUpdateItem(updatedDealItems);
    } else {
      // Normal add to cart
      addItem(updatedDealItems, quantity);
      props.closeModal(false);
    }
  };

  const getDealData = (data) => {
  setOpenPopup(false);
  
  // Check if the selected product is still in stock
  const skuRef = data.sku_ref || data.ref || data.hubrise_ref;
  if (!isItemInStock(skuRef)) {
    showToast(`${data.product_name} is out of stock!`, "error");
    return;
  }
  
  // Get allData from the correct source with better fallback handling
  let allData = props.allData;


  let allOptionLists = [];
  
  if (allData?.catalogs?.[0]?.data?.option_lists) {
    allOptionLists = allData.catalogs[0].data.option_lists;
    console.log("Found option_lists in allData.catalogs[0].data.option_lists");
  } else {
    console.warn("No option_lists found in allData structure");
  }


  // Create a map of option_list_ids to their index for sorting
  const orderMap = {};
  data?.sku_options?.forEach((id, index) => {
    orderMap[id] = index;
  });

  const filteredChoices = allOptionLists
    .filter(item => {
      const hasMatch = data?.sku_options?.includes(item.hubrise_id);
      console.log(`Checking option list ${item.hubrise_id} (${item.name}): ${hasMatch}`);
      return hasMatch;
    })
    .sort((a, b) => orderMap[a.hubrise_id] - orderMap[b.hubrise_id])
    .map(choice => ({
      ...choice,
      options: getAvailableChoiceOptions(choice.options || [])
    }))
    .filter(choice => choice.options && choice.options.length > 0);


  const extraCharge = getExtraChargeFromSingleItems(data.category_id, data.sku_id);

  const updatedSelectedProducts = dealItems.selectedProducts.map(
    (product) => {
      if (product.category_id === data.category_id) {
        const updatedSelectedProducts = [...product.selected_products];
        
        const newProductData = {
          product_name: data.product_name,
          pid: data.pid,
          category_id: data.category_id,
          sku_id: data.sku_id,
          sku_options: data?.sku_options || [],
          choices: [],
          data_options: filteredChoices,
          extra_charge: extraCharge,
          sku_ref: data.ref,
        };

        if (indexWise < updatedSelectedProducts.length) {
          updatedSelectedProducts[indexWise] = newProductData;
        } else {
          updatedSelectedProducts.push(newProductData);
        }
        
        return {
          ...product,
          selected_products: updatedSelectedProducts,
        };
      }
      return product;
    }
  );

  setDealItems((prev) => ({
    ...prev,
    selectedProducts: updatedSelectedProducts,
  }));


  setTimeout(() => {
    const allChoices = updatedSelectedProducts
      .flatMap(product => product.selected_products)
      .flatMap(selectedProduct => selectedProduct.data_options || [])
      .filter(choice => choice && choice.name !== "Make it a Meal" && choice.name !== "Make it a Meal (FC)");
    
    setChoices(allChoices);
    console.log("Updated choices state:", allChoices.map(c => c?.name));
  }, 100);
};

  return (
    <>
      <ToastContainer />
      <div className="z-[2] grid grid-cols-1 lg:grid-cols-2 md:grid-cols-2 gap-[20px] md:gap-6 items-stretch w-full">
        <div className="p-4 flex">
          <div>
            <LazyLoadImage
              className="rounded-t-lg"
              alt={`${dealItems?.image}-image`}
              src={
                dealItems?.image
                  ? `${dealItems?.image}`
                  : "/dummy-image.webp"
              }
            />
          </div>
        </div>
        <div className="p-4">
          <div className="p-5 pt-0">
            <h4 className="mb-2 text-2xl font-bold tracking-tight text-[#d97706]  uppercase">
              {dealItems?.name}
            </h4>
            <div className="text-xl font-bold mb-2">
              {" "}
              <span className="text-black">£ {dealItems?.tprice}</span>
            </div>
            {dealItems?.description && (
              <p className="text-black mb-3">{dealItems?.description}</p>
            )}
            {/* Tags */}
            {dealItems?.tags?.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {dealItems.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-block bg-[#d97706] text-white text-xs font-semibold px-3 py-1 rounded-full uppercase"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {dealItems?.selectedProducts?.length > 0 && (
              <>
                <h5 className="text-lg mb-1 font-bold text-[#d97766]">
                  Included:{" "}
                </h5>
                <div className="flex gap-3 flex-col">
                  {dealItems?.selectedProducts?.map((item, index) => {
                    // Check if this category has any available products
                    const categoryProducts = props.selected_deal?.lines?.find(
                      (line) => line.id === item.category_id
                    );
                    const hasAvailableProducts = getAvailableSKUs(categoryProducts?.skus || []).length > 0;

                    return (
                      <div key={index} className="block">
                        <h6 className="text-md mb-1 font-bold">
                          {item?.category_name}
                          {!hasAvailableProducts && (
                            <span className="text-red-600 text-sm font-normal ml-2">
                              (Out of Stock)
                            </span>
                          )}
                        </h6>
                        {item?.selected_products.map((itembox, i) => {
                          return itembox?.product_name ? (
                            <>
                              <div
                                key={i}
                                onClick={() => hasAvailableProducts && handleData(
                                  item?.category_id,
                                  item?.category_name,
                                  i
                                )}
                                className={`mb-1 transition-all flex items-center justify-between ${
                                  hasAvailableProducts 
                                    ? "cursor-pointer text-gray-600 hover:underline hover:text-blue-700" 
                                    : "cursor-not-allowed text-gray-400"
                                }`}
                              >
                                <span>{itembox?.product_name}</span>
                                {itembox?.extra_charge > 0 && (
                                  <span className="text-sm font-semibold text-[#d97706] ml-2">
                                    +£{itembox.extra_charge.toFixed(2)}
                                  </span>
                                )}
                              </div>
                              
                              {
                                itembox?.data_options?.filter(choice => {
                                  const lowerName = choice?.name?.toLowerCase();
                                  return lowerName !== "make it a meal" && lowerName !== "make it a meal (fc)";
                                }).length > 0 && (
                                  <div className="mt-2">
                                    <h5 className="text-lg mb-1">Choices: </h5>
                                    <div className="flex items-center gap-2">
                                      {itembox?.data_options
                                        ?.filter(choice => {
                                          const lowerName = choice?.name?.toLowerCase();
                                          return lowerName !== "make it a meal" && lowerName !== "make it a meal (fc)";
                                        })
                                        .map((choice) => {
                                          // Check if choice has any available options
                                          const availableOptions = getAvailableChoiceOptions(choice.options || []);
                                          const hasAvailableOptions = availableOptions.length > 0;
                                          
                                          return (
                                            <button
                                              key={choice?.id}
                                              onClick={() => hasAvailableOptions && handleChoiceClick(choice, itembox?.pid)}
                                              disabled={!hasAvailableOptions}
                                              className={`min-w-[80px] items-center px-3 py-1 text-md font-medium text-center border border-[#d97706] rounded-lg ${
                                                !hasAvailableOptions
                                                  ? "bg-gray-200 text-gray-400 cursor-not-allowed border-gray-300"
                                                  : selectedChoice?.id === choice?.id && activeChoiceProduct === itembox?.pid
                                                    ? "bg-[#D97706] text-white"
                                                    : "bg-white text-[#d97706] hover:text-white hover:bg-[#D97706]"
                                              }`}
                                            >
                                              {choice?.name}
                                              {!hasAvailableOptions && (
                                                <span className="text-xs block">(Out of Stock)</span>
                                              )}
                                            </button>
                                          );
                                        })}
                                    </div>
                                  </div>
                                )
                              }

                              {
                                selectedChoice && activeChoiceProduct === itembox?.pid && choice_options?.length > 0 && (
                                  <div className="mt-3">
                                    <h5 className="text-lg mb-1">Choice Options: </h5>
                                    {choice_options.some(
                                      (item) =>
                                        item.min_selections === 1 &&
                                        item.max_selections === 1 &&
                                        !selectedChoiceOption.some(
                                          (option) =>
                                            option.choice_name === selectedChoice?.name &&
                                            option.sku_id === itembox?.sku_id
                                        )
                                    ) && (
                                        <p className="text-red-600 text-sm font-semibold mb-2">
                                          Required, You must select one of these Options
                                        </p>
                                      )}
                                    <div className="flex items-center gap-2 flex-wrap">
                                      {choice_options?.map((item) => {
                                        const optionPrice = parsePrice(item?.price);
                                        const isSelected = selectedChoiceOption?.some(
                                          (option) => option.id === item?.id && option.sku_id === itembox?.sku_id
                                        );
                                        
                                        return (
                                          <button
                                            key={item?.id}
                                            onClick={() => handleChoiceOptionClick(item, itembox?.sku_id)}
                                            className={`min-w-[80px] items-center px-3 py-1 text-md font-medium text-center border border-[#d97706] rounded-lg ${
                                              isSelected
                                                ? "bg-[#D97706] text-white"
                                                : "bg-white text-[#d97706]"
                                            } hover:text-white hover:bg-[#D97706]`}
                                          >
                                            <div className="flex flex-col items-center">
                                              <span>{item?.name}</span>
                                              {optionPrice > 0 && (
                                                <span className="text-xs font-semibold">
                                                  +£{optionPrice.toFixed(2)}
                                                </span>
                                              )}
                                            </div>
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )
                              }
                            </>
                          ) : (
                            <button
                              key={i}
                              onClick={() => hasAvailableProducts && handleData(
                                item?.category_id,
                                item?.category_name,
                                i
                              )}
                              disabled={!hasAvailableProducts}
                              className={`min-w-auto h-[35px] mb-1 flex gap-3 items-center px-3 py-1 text-md font-medium text-center border border-[#d97706] rounded-lg ${
                                hasAvailableProducts
                                  ? "hover:text-white hover:bg-[#D97706] bg-white text-[#d97706]"
                                  : "bg-gray-200 text-gray-400 cursor-not-allowed border-gray-300"
                              }`}
                            >
                              <FaCirclePlus /> {item?.category_name} Item{" "}
                              {i + 1}
                            </button>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            <div className="flex justify-between items-center mt-7 gap-4 border-slate-700 border-t pt-7">
              <CounterBox quantity={quantity} setQuantity={setQuantity} />
              <button
                onClick={addToCart}
                className="px-4 py-2 w-full text-white bg-[#D97706] rounded-lg"
              >
                {isEditMode ? "UPDATE DEAL" : "ADD TO CART"}
              </button>
            </div>

            <div className="text-xl font-bold mt-6">
              <span className="text-[#d97706]">Sub total</span> : £ {totalPrice}
            </div>
          </div>
        </div>
      </div>

      <DealsPopup
        open={openPopup}
        onClose={() => setOpenPopup(false)}
        getDealData={getDealData}
        items={fromProducts}
        title={popupTitle}
      />
    </>
  );
}