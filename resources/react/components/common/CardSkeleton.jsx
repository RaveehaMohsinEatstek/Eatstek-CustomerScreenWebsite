import React from 'react';

export default function CardSkeleton({height="h-[234px]", heightIn="h-[40px]"}) {
    return (
        <div className="w-full flex items-stretch group rounded-lg">
            <div className=" relative w-full bg-white border border-gray-200 rounded-lg shadow  transition-all duration-300">
                <div className={`${height} skeleton-loader w-full rounded-t-lg  animate-pulse`}>
                    <div className={`${height} pb-[45px]  flex items-center justify-center  rounded `}>
                        <svg className="w-10 h-10 text-gray-200 dark:text-gray-600" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 20">
                            <path d="M14.066 0H7v5a2 2 0 0 1-2 2H0v11a1.97 1.97 0 0 0 1.934 2h12.132A1.97 1.97 0 0 0 16 18V2a1.97 1.97 0 0 0-1.934-2ZM10.5 6a1.5 1.5 0 1 1 0 2.999A1.5 1.5 0 0 1 10.5 6Zm2.221 10.515a1 1 0 0 1-.858.485h-8a1 1 0 0 1-.9-1.43L5.6 10.039a.978.978 0 0 1 .936-.57 1 1 0 0 1 .9.632l1.181 2.981.541-1a.945.945 0 0 1 .883-.522 1 1 0 0 1 .879.529l1.832 3.438a1 1 0 0 1-.031.988Z" />
                            <path d="M5 5V.13a2.96 2.96 0 0 0-1.293.749L.879 3.707A2.98 2.98 0 0 0 .13 5H5Z" />
                        </svg>
                    </div>
                </div>
                <div className={` ${heightIn} absolute left-0 right-0 bottom-0 rounded-b-lg transition-all duration-300`}>
                </div>
            </div>
        </div>
    );
}
