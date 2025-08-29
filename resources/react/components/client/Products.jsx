import React, { useEffect, useState } from "react";
import CategoryCard from "../common/CategoryCard";
import { useSGlobalContext } from "../../lib/contexts/useGlobalContext";
import Category from "./Category";
import CardSkeleton from "../common/CardSkeleton";
import { ToastContainer } from "react-toastify";

export default function Products() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const { category_id, allData } = useSGlobalContext();

    useEffect(() => {
        if (allData && allData.catalogs && allData.catalogs[0]?.data?.categories) {
            setData(allData);
            setLoading(false);
        }
    }, [allData]);

    return (
        <>
            <ToastContainer />
            {category_id ? (
                <Category category_id={category_id} />
            ) : (
                <div className="z-[2] grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[15px] md:gap-[15px] items-stretch w-full">
                    {loading ? (
                        Array.from({ length: 10 }).map((_, i) => <CardSkeleton key={i} />)
                    ) : (
                        data?.catalogs?.[0]?.data?.categories?.length > 0 ? (
                            data?.catalogs[0]?.data?.categories?.map(item => {
                                if (item?.name === "Deals") {
                                    return null;
                                }

                                return (
                                    <CategoryCard
                                        key={item?.id}
                                        imageSrc={item?.image_data[0]}
                                        title={item?.name}
                                        productId={item?.id}
                                    />
                                );
                            })
                        ) : (
                            <p>No products found</p>
                        )
                    )}
                </div>
            )}
        </>
    );
}
