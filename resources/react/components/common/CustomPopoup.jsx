import React, { useEffect } from "react";

const CustomPopoup = ({
  open,
  onClose,
  items,
  title,
  size = "6xl",
  dismissible = true,
  bodyClass,
}) => {
  // Handle escape key and body scroll lock
  useEffect(() => {
    if (open) {
      const handleEscape = (e) => {
        if (e.key === 'Escape' && dismissible) {
          onClose();
        }
      };
      
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = '';
      };
    }
  }, [open, dismissible, onClose]);

  if (!open) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && dismissible) {
      onClose();
    }
  };

  // Size mapping
  const sizeMapping = {
    'sm': '384px',
    'md': '448px', 
    'lg': '512px',
    'xl': '576px',
    '2xl': '672px',
    '3xl': '768px',
    '4xl': '896px',
    '5xl': '1024px',
    '6xl': '1152px',
    '7xl': '1280px'
  };

  const modalWidth = sizeMapping[size] || '1152px';

  return (
    <div 
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          width: '100%',
          maxWidth: modalWidth,
          maxHeight: '90vh',
          overflow: 'hidden',
          margin: 'auto'
        }}
      >
        {/* Header */}
        {title && (
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px',
              borderBottom: '1px solid #e5e7eb',
              backgroundColor: 'white'
            }}
          >
            <h3 
              style={{
                fontSize: '20px',
                fontWeight: '600',
                color: 'black',
                margin: 0
              }}
            >
              {title}
            </h3>
            {dismissible && (
              <button
                onClick={onClose}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#9ca3af',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginLeft: 'auto'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#f3f4f6';
                  e.target.style.color = '#111827';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = '#9ca3af';
                }}
              >
                <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            )}
          </div>
        )}
        
        {/* Body */}
        <div 
          className={bodyClass}
          style={{
            padding: '24px',
            backgroundColor: 'white',
            color: 'black',
            overflowY: 'auto',
            maxHeight: title ? 'calc(90vh - 80px)' : '90vh'
          }}
        >
          {items}
        </div>
      </div>
    </div>
  );
};

export default CustomPopoup;