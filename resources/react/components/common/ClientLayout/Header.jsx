import Reac from 'react';
export default function Header() {

    const restaurantName = import.meta.env.VITE_RESTAURANT_NAME;

    return (
        <header>
            <nav className="bg-white dark:bg-gray-900 w-full z-20 top-0 start-0 border-b border-gray-200 dark:border-gray-600">
                <div className="container-fluid flex flex-wrap items-center justify-between mx-auto p-4">
                    <a href="/counter-screen" className="flex items-center space-x-3 rtl:space-x-reverse">
                        <span className="self-center text-2xl font-bold whitespace-nowrap dark:text-white">{restaurantName}</span>
                    </a>
                </div>
            </nav>
        </header>
    );
}
