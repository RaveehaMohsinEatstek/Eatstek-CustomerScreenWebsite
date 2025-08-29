import React, { useEffect, useState } from "react";
import ProductCard from "../common/ProductCard";
import ProductDetails from "./ProductDetails";
import DealDetails from "./DealDetails.";
import CardSkeleton from "../common/CardSkeleton";
import ProductDetailsPopup from "../common/CustomPopoup";
import { useSGlobalContext } from "../../lib/contexts/useGlobalContext";

export default function Category(props) {
    const { allData } = useSGlobalContext();
    const [products, setProducts] = useState([]);
    const [deals, setDeals] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [isDeal, setIsDeal] = useState(false);
    const [openPopup, setOpenPopup] = useState(false);
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    
    useEffect(() => {
        if (allData && allData.catalogs && allData.catalogs[0]?.data?.categories) {
            setData(allData); 
        }
    }, [allData]);

    useEffect(() => {
        if (data) {
            getProductsById(props?.category_id);
        }
    }, [props?.category_id, data]);

    const getProductsById = async (id) => {
        setLoading(true);
        try {
            const result = data?.catalogs[0]?.data?.categories.find(item => item?.id === id);
            
            if (result) {
                // First check if category has products
                const nonDealProducts = result.products?.filter(product => {
                    return !product.tags || 
                          (!product.tags.includes("DEAL") && 
                           !product.tags.includes("deal_only"));
                }) || [];
                
                if (nonDealProducts.length > 0) {
                    // Category has regular products
                    setProducts(nonDealProducts);
                    setDeals([]);
                } else {
                    // No products, check for deals with matching category_id
                    const categoryDeals = data?.catalogs[0]?.data?.deals?.filter(
                        deal => deal.category_id == id
                    ) || [];
                    
                    if (categoryDeals.length > 0) {
                        // Format deals
                        const formattedDeals = categoryDeals.map(deal => ({
                            item: deal,
                            lines: deal.lines
                        }));
                        
                        setDeals(formattedDeals);
                        setProducts([]);
                    } else {
                        // No products or deals for this category
                        setProducts([]);
                        setDeals([]);
                    }
                }
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const handleItemClick = (item) => {
        setSelectedItem(item);
        setIsDeal(item.lines ? true : false); // Check if it's a deal by presence of lines
        setOpenPopup(true);
    };

    return (
        <div>
            {selectedItem && (
                <ProductDetailsPopup
                    open={openPopup}
                    onClose={() => setOpenPopup(false)}
                    title={isDeal ? "Deal Details" : "Product Detail"}
                    items={
                        isDeal ? (
                            <DealDetails
                                closeModal={() => setOpenPopup(false)}
                                selected_deal={selectedItem}
                                allData={data}
                            />
                        ) : (
                            <ProductDetails 
                                closeModal={() => setOpenPopup(false)} 
                                product_detail={selectedItem} 
                            />
                        )
                    }
                />
            )}

            {/* Original CSS kept intact */}
            <div className="z-[2] grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[15px] md:gap-[15px] items-stretch w-full">
                {loading ? (
                    Array.from({ length: 10 }).map((_, i) => (
                        <CardSkeleton height="h-[210px]" key={i} />
                    ))
                ) : (
                    <>
                        {/* Render regular products */}
                        {products?.length > 0 && products.map((item) => (
                            <ProductCard
                                key={item?.id}
                                imageSrc={item?.image_data?.[0]}
                                title={item?.name}
                                handleClick={() => handleItemClick(item)}
                            />
                        ))}
                        
                        {/* Render deals (if no regular products) */}
                        {deals?.length > 0 && deals.map((deal) => (
                            <ProductCard
                                key={deal.item?.id}
                                imageSrc={deal.item?.image_data?.[0] || "/dummy-image.webp"}
                                title={deal.item?.name}
                                handleClick={() => handleItemClick(deal)}
                                isDeal={true}
                            />
                        ))}
                        
                        {/* Show message if no products or deals */}
                        {products?.length === 0 && deals?.length === 0 && !loading && (
                            <p>No items found in this category</p>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}