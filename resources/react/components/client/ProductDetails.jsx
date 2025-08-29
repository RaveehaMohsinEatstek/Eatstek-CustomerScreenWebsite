import React, { useEffect, useState, useMemo } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import Category from "./Category";
import CounterBox from "../common/CounterBox";
import { useCart } from "react-use-cart";
import MealsPopoup from "../common/MealsPopup";
import { LIVE_URL } from "../../lib/services/api/httpClient";
import { useSGlobalContext } from "../../lib/contexts/useGlobalContext";
import { toast, Bounce, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import fallbackImage from '../../../../assets/fallback.png';
import { productApi } from "../../lib/services";
import { showToast } from "../../lib/utils/helpers";

export default function ProductDetails(props) {
  const { addItem } = useCart();
  const { allData } = useSGlobalContext();
  const [data, setData] = useState(null);
  const [product_detail, setProduct_detail] = useState(null);
  const [cat_id, setCat_id] = useState("");
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [choices, setChoices] = useState([]);
  const [choice_options, setChoice_options] = useState([]);
  const [selectedChoiceOption, setSelectedChoiceOption] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);
  const [openPopup, setOpenPopup] = useState(false);
  const [popupItems, setPopupItems] = useState([]);
  const [popupTitle, setPopupTitle] = useState("");
  const [selectedSideItems, setSelectedSideItems] = useState("");
  const [selectedDrinkItems, setSelectedDrinkItems] = useState("");
  const [errorTrigger, setErrorTrigger] = useState(false);
  const [inventoryData, setInventoryData] = useState(null);

  // ADDED: Editing mode props
  const { isEditMode = false, editingItem = null, onUpdateItem } = props;

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

  // Filter available sizes based on stock
  const availableSizes = useMemo(() => {
    if (!product_detail?.skus) return [];

    return product_detail.skus.filter(size => {
      const skuRef = size.sku_ref || size.ref || size.hubrise_ref;
      return isItemInStock(skuRef);
    });
  }, [product_detail, inventoryData]);

  // Filter available choice options based on stock
  const availableChoiceOptions = useMemo(() => {
    if (!choice_options) return [];

    return choice_options.filter(option => {
      // Check stock using option_ref
      const optionRef = option.option_ref || option.ref || option.hubrise_ref;
      return isItemInStock(null, optionRef);
    });
  }, [choice_options, inventoryData]);

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

  // Reset states when component unmounts
  useEffect(() => {
    return () => {
      setSelectedSize(null);
      setSelectedChoice(null);
      setChoices([]);
      setChoice_options([]);
      setSelectedChoiceOption([]);
      setErrorTrigger(false);
      toast.dismiss(); // Clear all toasts
      toast.clearWaitingQueue();
    };
  }, []);

  useEffect(() => {
    setProduct_detail(props?.product_detail);
    if (props?.product_detail) {
      fetchHubriseInventory();
    }
  }, [props?.product_detail]);

  useEffect(() => {
    if (allData && allData.catalogs && allData.catalogs[0]?.data?.categories) {
      setData(allData);
    }
  }, [allData]);

  useEffect(() => {
    if (!product_detail) return;

    // ADDED: Skip auto-selection if in edit mode
    if (isEditMode && editingItem) return;

    // Use available sizes instead of all sizes
    if (!selectedSize && availableSizes.length > 0) {
      setSelectedSize(availableSizes[0]);
    }

    const optionsListIds = selectedSize?.option_list_ids;

    if (Array.isArray(optionsListIds) && optionsListIds?.length > 0) {
      const orderMap = {};
      optionsListIds.forEach((id, index) => {
        orderMap[id] = index;
      });

      const filteredData = data?.catalogs[0]?.data?.option_lists
        .filter(item => {
          return item.hubrise_id && optionsListIds.includes(item.hubrise_id);
        })
        .sort((a, b) => orderMap[a.hubrise_id] - orderMap[b.hubrise_id]);

      setChoices(filteredData || []);
    } else {
      setChoices([]);
      setChoice_options([]);
    }
  }, [product_detail, selectedSize, selectedChoice, data, availableSizes, isEditMode, editingItem]);

  useEffect(() => {
    if (!product_detail) return;

    // ADDED: Skip auto-selection if in edit mode
    if (isEditMode && editingItem) return;

    if (availableSizes.length > 0) {
      const defaultSize = availableSizes[0];
      setSelectedSize(defaultSize);

      if (defaultSize?.option_list_ids?.length > 0) {
        const orderMap = {};
        defaultSize.option_list_ids.forEach((id, index) => {
          orderMap[id] = index;
        });

        const filteredChoices = data?.catalogs[0]?.data?.option_lists
          .filter(item => defaultSize.option_list_ids.includes(item.hubrise_id))
          .sort((a, b) => orderMap[a.hubrise_id] - orderMap[b.hubrise_id]);

        // REMOVE THE AUTOMATIC SELECTION OF OPTIONS HERE
        setSelectedChoiceOption([]);
        setChoices(filteredChoices);
      }
    }
  }, [product_detail, data, inventoryData, isEditMode, editingItem]);

  // ADDED: Effect to handle edit mode initialization
  useEffect(() => {
    if (isEditMode && editingItem && product_detail) {
      // Set quantity
      setQuantity(editingItem.quantity || 1);

      // Find and set selected size
      if (editingItem.selectedSize && product_detail?.skus) {
        const matchingSize = product_detail.skus.find(size =>
          size.id === editingItem.selectedSize.id ||
          size.name === editingItem.selectedSize.size
        );

        if (matchingSize) {
          setSelectedSize(matchingSize);

          // Set up choices based on the selected size
          if (matchingSize?.option_list_ids?.length > 0) {
            const orderMap = {};
            matchingSize.option_list_ids.forEach((id, index) => {
              orderMap[id] = index;
            });

            const filteredChoices = data?.catalogs[0]?.data?.option_lists
              ?.filter(item => matchingSize.option_list_ids.includes(item.hubrise_id))
              .sort((a, b) => orderMap[a.hubrise_id] - orderMap[b.hubrise_id]);

            setChoices(filteredChoices || []);

            // Pre-populate choice options from editing item
            if (editingItem.choices && editingItem.choices.length > 0) {
              const preSelectedOptions = [];
              const choicesWithSelections = new Set(); // Track which choices have selections

              editingItem.choices.forEach(choice => {
                if (choice.choice_options && choice.choice_options.length > 0) {
                  choice.choice_options.forEach(option => {
                    // Find the matching option in the available options
                    const allAvailableOptions = filteredChoices?.flatMap(choice => choice.options || []);

                    const matchingOption = allAvailableOptions?.find(availOption =>
                      availOption.id === option.id ||
                      availOption.name === option.option_name
                    );

                    if (matchingOption) {
                      // Find which choice this option belongs to
                      const parentChoice = filteredChoices?.find(c =>
                        c.options?.some(opt => opt.id === matchingOption.id)
                      );

                      if (parentChoice) {
                        preSelectedOptions.push({
                          ...matchingOption,
                          choice_name: parentChoice.name // Use the actual choice name, not "Combined Choices"
                        });
                        choicesWithSelections.add(parentChoice.name);
                      }
                    }
                  });
                }
              });

              setSelectedChoiceOption(preSelectedOptions);

              // Set selectedChoice to the first choice that has selections
              const firstChoiceWithSelection = filteredChoices?.find(choice =>
                choicesWithSelections.has(choice.name)
              );

              if (firstChoiceWithSelection) {
                setSelectedChoice(firstChoiceWithSelection);

                // Set choice_options for the selected choice
                const selectedChoiceOptions = firstChoiceWithSelection?.options?.filter(option => {
                  const optionRef = option.option_ref || option.ref || option.hubrise_ref;
                  return isItemInStock(null, optionRef);
                }) || [];

                setChoice_options(selectedChoiceOptions.map((option) => ({
                  ...option,
                  min_selections: firstChoiceWithSelection?.min_selections,
                  max_selections: firstChoiceWithSelection?.max_selections
                })));
              }
            }
          }
        }
      }
    }
  }, [isEditMode, editingItem, product_detail, data, inventoryData]);

   const handleSizeClick = (size) => {
  setSelectedSize(size);
  setSelectedChoice(null);
  setSelectedChoiceOption([]);

  if (size?.option_list_ids?.length > 0) {
    const orderMap = {};
    size.option_list_ids.forEach((id, index) => {
      orderMap[id] = index;
    });

    const filteredChoices = data?.catalogs[0]?.data?.option_lists
      .filter(item => size.option_list_ids.includes(item.hubrise_id))
      .sort((a, b) => orderMap[a.hubrise_id] - orderMap[b.hubrise_id]);

    setChoices(filteredChoices);
  } else {
    setChoices([]);
  }
  setChoice_options([]);
}

  const handleChoiceClick = (choice) => {
    setSelectedChoice(choice);

    // Filter choice options based on stock
    const filteredOptions = choice?.options?.filter(option => {
      const optionRef = option.option_ref || option.ref || option.hubrise_ref;
      return isItemInStock(null, optionRef);
    }) || [];

    setChoice_options(filteredOptions.map((option) => ({
      ...option,
      min_selections: choice?.min_selections,
      max_selections: choice?.max_selections
    })));
  };

  const handleChoiceOptionClick = (option) => {
    setSelectedChoiceOption((prev) => {
      const choiceName = selectedChoice?.name;
      const isRequiredChoice = option.min_selections === 1 && option.max_selections === 1;
      const isSingleChoice = option.min_selections === 0 && option.max_selections === 1;

      const isAlreadySelected = prev.some((item) => item.id === option.id);

      if (isRequiredChoice) {
        if (isAlreadySelected) {
          return prev.filter((item) => item.id !== option.id);
        }
        const filteredPrev = prev.filter((item) => item.choice_name !== choiceName);
        return [...filteredPrev, { ...option, choice_name: choiceName }];
      }

      if (isSingleChoice) {
        if (isAlreadySelected) {
          return prev.filter((item) => item.id !== option.id);
        }
        const filteredPrev = prev.filter((item) => item.choice_name !== choiceName);
        return [...filteredPrev, { ...option, choice_name: choiceName }];
      }

      if (isAlreadySelected) {
        return prev.filter((item) => item.id !== option.id);
      }
      return [...prev, { ...option, choice_name: choiceName }];
    });
  };

  const computedTotalPrice = useMemo(() => {
    const sizePrice = selectedSize && selectedSize.price
      ? parseFloat(selectedSize.price.match(/\d+(\.\d+)?/)?.[0] || "0")
      : 0;

    const choiceOptionPrice = Array.isArray(selectedChoiceOption) && selectedChoiceOption.length > 0
      ? selectedChoiceOption.reduce((total, option) => {
        const price = parseFloat(option?.price?.match(/\d+(\.\d+)?/)?.[0] || "0");
        return total + price;
      }, 0)
      : 0; // Return 0 if selectedChoiceOption is not an array or is empty

    return (sizePrice + choiceOptionPrice) * quantity;
  }, [selectedSize, selectedChoiceOption, quantity]);

  useEffect(() => {
    setTotalPrice(computedTotalPrice.toFixed(2));
  }, [computedTotalPrice]);

  const addToCart = () => {
    setErrorTrigger(false);
    const requiredChoices = choices.filter(choice =>
      choice.min_selections === 1 && choice.max_selections === 1
    );

    const isMissingRequiredOption = requiredChoices.some(choice =>
      !selectedChoiceOption.some(option => option.choice_name === choice.name)
    );

    if (isMissingRequiredOption) {
      setErrorTrigger(true);
      toast.dismiss(); // Remove old toasts
      setTimeout(() => {
        toast.error("Please select at least one option from the required choices!", {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
          transition: Bounce,
        });
      }, 100); // Small delay to ensure toast triggers
      return;
    }

    // Check if selected items are still in stock before adding to cart
    const selectedSizeRef = selectedSize?.sku_ref || selectedSize?.ref || selectedSize?.hubrise_ref;
    if (!isItemInStock(selectedSizeRef)) {
      toast.error("Selected size is out of stock!", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });
      return;
    }

    for (const option of selectedChoiceOption) {
      const optionRef = option.option_ref || option.ref || option.hubrise_ref;
      if (!isItemInStock(null, optionRef)) {
        toast.error(`${option.name} is out of stock!`, {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
          transition: Bounce,
        });
        return;
      }
    }

    // ADDED: Combined choices format for editing
    const allChoicesData = {
      id: "combined_choices",
      choice_name: "Combined Choices",
      pivot: {
        choice_id: "combined_choices",
        product_id: product_detail?.id,
      },
      choice_options: selectedChoiceOption?.map(option => ({
        id: option.id,
        choice_id: option.choice_id || "combined_choices",
        option_name: option.name,
        price: (parseFloat((option.price || "").split(" ")[0])).toFixed(2),
        status: 1,
        choice_name: option?.choice_name,
      })),
    };

    const item = {
      id: `${product_detail?.id}_${selectedSize?.id || ""}_${selectedChoiceOption?.map(option => option.id).join("_")}`,
      product_id: product_detail?.id,
      product_name: product_detail?.name,
      quantity: quantity,
      productId: product_detail?.id,
      name: product_detail?.name,
      price: (parseFloat(totalPrice) / quantity).toFixed(2),
      size: selectedSize?.name,
      choice: selectedChoice?.name,
      choiceOption: selectedChoiceOption?.map(option => option.name).join(", "),
      // ADDED: Use combined choices format for editing
      choices: selectedChoiceOption?.length > 0 ? [allChoicesData] : [],
      originalProduct: product_detail,
      sizes: selectedSize
        ? [
          {
            id: selectedSize.id,
            size_name: selectedSize.name,
            pivot: {
              product_id: selectedSize.product_id,
              size_id: selectedSize.name,
              product_price: (parseFloat((selectedSize.price || "").split(" ")[0])).toFixed(2)
            },
            status: 1,
          },
        ]
        : [],
      selectedSize: {
        id: selectedSize.id,
        size: selectedSize.name,
        price: selectedSize.price,
      },
    };

    // ADDED: Check if in edit mode
    if (isEditMode) {
      // Update existing item
      onUpdateItem && onUpdateItem(item);
    } else {
      // Normal add to cart
      addItem(item, quantity);
      props.closeModal(false);
    }
  };

  const getMealIdFun = (id) => {
    const itembox = popupItems.find((item) => item.id === id);
    if (!itembox) return;
    const {
      id: pid,
      product_name: name,
      product_image: image,
      product_price: price,
    } = itembox;
    const commonData = {
      pid,
      name,
      image,
      price,
      status: popupTitle === "Drinks" ? "drinks" : "side",
    };
    if (popupTitle === "Drinks") {
      setSelectedDrinkItems(commonData);
    } else {
      setSelectedSideItems(commonData);
    }
    setOpenPopup(false);
  };

  const removeMealItem = (status) => {
    if (status == "drinks") {
      setSelectedDrinkItems(null);
    } else {
      setSelectedSideItems(null);
    }
  };

  return (
    <>
      {cat_id ? (
        <Category category_id={cat_id} />
      ) : (
        <>
          <div className="z-[2] grid grid-cols-1 lg:grid-cols-2 md:grid-cols-2 gap-[20px] md:gap-6 items-stretch w-full">
            <div className="p-4 flex items-center justify-center">
              <LazyLoadImage
                className="rounded-t-lg"
                alt={`${product_detail?.product_slug}-image`}
                src={
                  product_detail?.image_data?.length > 0
                    ? `${product_detail?.image_data[0]}`
                    : fallbackImage
                }
              />
            </div>
            <div className="p-4">
              <div className="p-5 pt-0">
                <h4 className="mb-2 text-2xl font-bold tracking-tight text-[#d97706] uppercase">
                  {product_detail?.name}
                </h4>

                <div className="text-xl font-bold">
                  <span className="text-black">
                    £ {selectedSize?.price}
                  </span>
                </div>

                <p className="mt-2 text-base text-gray-700 ">
                  {product_detail?.description}
                </p>

                {/* Tags */}
                {product_detail?.tags?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {product_detail.tags
                      .filter(tag => tag.toLowerCase() !== "dirty_kitchen") 
                      .map((tag, index) => (
                        <span
                          key={index}
                          className="inline-block bg-[#d97706] text-white text-xs font-semibold px-3 py-1 rounded-full uppercase"
                        >
                          {tag}
                        </span>
                      ))}
                  </div>
                )}


                {availableSizes.length > 0 && availableSizes.some(size => size?.name) && (
                  <div className="mt-5">
                    <h5 className="text-lg mb-1">Sizes:</h5>
                    <div className="flex items-center gap-2 flex-wrap">
                      {availableSizes
                        .filter(size => size?.name) // Only show sizes with names
                        .map((size) => (
                          <button
                            key={size?.id}
                            onClick={() => handleSizeClick(size)}
                            className={`min-w-[80px] items-center px-3 py-1 text-md font-medium text-center border border-[#d97706] rounded-lg capitalize ${selectedSize === size
                              ? "bg-[#D97706] text-white"
                              : "bg-white text-[#d97706]"
                              } hover:text-white hover:bg-[#D97706]`}
                          >
                            {size?.name}
                          </button>
                        ))}
                    </div>
                  </div>
                )}

                {/* Show out of stock message if no sizes available - UPDATED condition */}
                {availableSizes.length === 0 && product_detail?.skus?.length > 0 && (
                  <div className="mt-5">
                    <p className="text-red-600 font-semibold">This item is currently out of stock.</p>
                  </div>
                )}

                {choices?.length > 0 && (
                  <div className="mt-4">
                    <h5 className="text-lg mb-1">Choices: </h5>
                    <div className="flex items-center gap-2">
                      {choices?.map((choice) => (
                        <button
                          key={choice?.id}
                          onClick={() => handleChoiceClick(choice)}
                          className={`min-w-[80px] items-center px-3 py-1 text-md font-medium text-center border border-[#d97706] rounded-lg ${selectedChoice?.id === choice?.id
                            ? "bg-[#D97706] text-white"
                            : "bg-white text-[#d97706]"
                            } hover:text-white hover:bg-[#D97706]`}
                        >
                          {choice?.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Show only available choice options */}
                {availableChoiceOptions?.length > 0 && (
                  <div className="mt-4">
                    <h5 className="text-lg mb-1">Choice Options: </h5>

                    {availableChoiceOptions.some(
                      (item) =>
                        item.min_selections === 1 &&
                        item.max_selections === 1 &&
                        !selectedChoiceOption.some(
                          (option) => option.choice_name === selectedChoice?.name
                        )
                    ) && (
                        <p className="text-red-600 text-sm font-semibold mb-2">
                          Required: You must select one option from this choice.
                        </p>
                      )}

                    <div className="flex items-center gap-2 flex-wrap">
                      {availableChoiceOptions?.map((item) => (
                        <button
                          key={item?.id}
                          onClick={() => handleChoiceOptionClick(item)}
                          className={`min-w-[80px] items-center px-3 py-1 text-md font-medium text-center border border-[#d97706] rounded-lg ${selectedChoiceOption?.some(option => option.id === item?.id)
                            ? "bg-[#D97706] text-white"
                            : "bg-white text-[#d97706]"
                            } hover:text-white hover:bg-[#D97706]`}
                        >
                          <span>{item?.name}</span>
                          {item?.price && parseFloat(item.price) !== 0 && (
                            <span className="text-sm font-semibold">
                              (£ {parseFloat(item.price).toFixed(2)})
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center mt-7 gap-4 border-slate-700 border-t pt-7">
                  <CounterBox quantity={quantity} setQuantity={setQuantity} />

                  <button
                    onClick={addToCart}
                    disabled={availableSizes.length === 0}
                    className={`px-4 py-2 w-full text-white rounded-lg ${availableSizes.length === 0
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-[#D97706] hover:bg-[#b8640a]"
                      }`}
                  >
                    {/* ADDED: Show different text for edit mode */}
                    {availableSizes.length === 0
                      ? "OUT OF STOCK"
                      : isEditMode
                        ? "UPDATE ITEM"
                        : "ADD TO CART"
                    }
                  </button>
                </div>

                <div className="text-xl font-bold mt-6">
                  <span className="text-[#d97706]">Sub total</span> :{" "}
                  £ {totalPrice}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <MealsPopoup
        getMealId={getMealIdFun}
        open={openPopup}
        onClose={() => setOpenPopup(false)}
        items={popupItems}
        title={popupTitle}
      />
      <ToastContainer />
    </>
  );
}