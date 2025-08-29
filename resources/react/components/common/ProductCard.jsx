import React from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { LIVE_URL } from "../../lib/services/api/httpClient";
import fallbackImage from '../../../../assets/fallback.png'

export default function ProductCard({ imageSrc, title, handleClick }) {
  
  return (
    <div
      className="group relative w-full bg-white border border-gray-200 rounded-lg shadow  hover:border-[#d97706] cursor-pointer flex flex-col"
      onClick={handleClick}
      style={{ 
        aspectRatio: '1/1', // Makes the card square
        maxWidth: '600px',
        width: '100%', // Ensure it takes available width
        margin: '0 auto' // Centers the card
      }}
    >
      {/* Square Image Container */}
      <div 
        className="rounded-t-lg overflow-hidden flex-1 p-4" // Increased padding
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
        className="p-4 text-center flex items-center justify-center bg-slate-300 group-hover:bg-[#d97706] rounded-b-lg" // Increased padding
        style={{ 
          minHeight: '80px', // Increased min height
          maxHeight: '100px', // Increased max height
          overflow: 'hidden'
        }}
      >
        <h6 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white line-clamp-2 leading-tight"> {/* Increased text size */}
          {title}
        </h6>
      </div>
    </div>
  );
}