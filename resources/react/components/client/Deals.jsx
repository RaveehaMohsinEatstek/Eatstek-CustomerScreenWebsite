import React, { useEffect, useState } from "react";
import { useSGlobalContext } from "../../lib/contexts/useGlobalContext";
import ProductCard from "../common/ProductCard";
import DealDetails from "./DealDetails.";
import CardSkeleton from "../common/CardSkeleton";
import ProductDetailsPopup from "../common/CustomPopoup";
import { ToastContainer } from "react-toastify";

export default function Deals() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [openPopup, setOpenPopup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deals, setDeals] = useState(null);
  const { allData } = useSGlobalContext();

  useEffect(() => {
    if (allData && allData.catalogs && allData.catalogs[0]?.data?.categories) {
      setDeals(allData);
      setLoading(false);
    }
  }, [allData]);

  const handleTitleClick = (product) => {
    setOpenPopup(true);
    setSelectedProduct(product);
  };

  return (
    <div>
      {/* Toast notifications */}
      <ToastContainer />

      {selectedProduct && (
        <ProductDetailsPopup
          open={openPopup}
          onClose={() => setOpenPopup(false)}
          title="Deal Details"
          items={
            <DealDetails
              closeModal={() => setOpenPopup(false)}
              selected_deal={selectedProduct}
              allData={deals}
            />
          }
        />
      )}

      <div className="z-[2] grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[15px] md:gap-[15px] items-stretch w-full">
        {loading ? (
          Array.from({ length: 10 }).map((_, i) => (
            <CardSkeleton height="h-[210px]" key={i} />
          ))
        ) : deals?.catalogs?.[0]?.data?.deals?.length > 0 ? (
          deals?.catalogs?.[0]?.data?.deals?.map((item) => (
            <ProductCard
              key={item?.id}
              imageSrc={item?.image_data[0] || "/dummy-image.webp"}
              title={item?.name}
              handleClick={() =>
                handleTitleClick({ item: item, lines: item?.lines })
              }
            />
          ))
        ) : (
          <p>No category products found</p>
        )}
      </div>
    </div>
  );
}
