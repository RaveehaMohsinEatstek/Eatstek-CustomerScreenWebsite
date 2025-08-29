import React from 'react';
import { Spinner } from 'flowbite-react';

const Preloader = ({ href, children, className, ...props }) => {
    return (
        <div className="fixed left-0 right-0 top-0 bottom-0 z-1 bg-white">
            <div className="absolute inset-0 flex items-center justify-center">
            <Spinner size="xl" color="warning" />
            </div>
        </div>
    )
};

export default Preloader;
