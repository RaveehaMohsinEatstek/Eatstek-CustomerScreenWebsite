import React from "react";
import { useSGlobalContext } from "../../lib/contexts/useGlobalContext";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { LIVE_URL } from "../../lib/services/api/httpClient";
import fallbackImage from '../../../../assets/fallback.png'

export default function CategoryCard({ imageSrc, title, productId }) {
  const { toggleCategoryIdFunction } = useSGlobalContext();
  
  const handleClick = () => {
    toggleCategoryIdFunction(productId);
  };
  
  return (
    <div
      className="relative w-full bg-white border border-gray-200 rounded-lg shadow  hover:border-[#d97706] cursor-pointer flex flex-col group"
      onClick={handleClick}
      style={{ 
        aspectRatio: '1/1', // Makes the card square
        maxWidth: '600px',
        width: '100%', // Ensure it takes available width
        margin: '0 auto' // Centers the card
      }}
    >
      {/* Image Container */}
      <div 
        className="rounded-t-lg overflow-hidden flex-1 p-4"
        style={{ 
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <LazyLoadImage
          className="max-w-full max-h-full"
          alt={`${title}-image`}
          effect="blur"
          wrapperProps={{
            style: { 
              transitionDelay: ".2s",
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%'
            },
          }}
          src={imageSrc ? `${imageSrc}` : fallbackImage}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain', // Shows full image without cropping
            width: 'auto',
            height: 'auto'
          }}
        />
      </div>
          
      {/* Title Section */}
      <div 
        className="p-4 text-center flex items-center justify-center bg-gray-300  group-hover:bg-[#d97706] rounded-b-lg transition-all duration-300"
        style={{ 
          minHeight: '80px',
          maxHeight: '100px',
          overflow: 'hidden'
        }}
      >
        <h5 className="text-2xl font-bold tracking-tight text-[#d97706] dark:text-white group-hover:text-white line-clamp-2 leading-tight transition-all duration-300">
          {title.toUpperCase()}
        </h5>
      </div>
    </div>
  );
}