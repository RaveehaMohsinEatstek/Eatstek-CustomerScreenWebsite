import React from 'react';
import { Link } from 'react-router-dom';

const CustomButton = ({ href, children, className, ...props }) => {
  const baseClass =
    'focus:outline-none bg-yellow-400 border text-white border-yellow-400 hover:bg-white hover:text-yellow-400 font-medium rounded-lg text-sm px-5 py-2.5';

  return href ? (
    <Link to={href} className={`${baseClass} ${className}`} {...props}>
      {children}
    </Link>
  ) : (
    <button type="button" className={`${baseClass} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default CustomButton;
