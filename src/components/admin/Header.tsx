import { useState, useEffect } from 'react';
import {
    MagnifyingGlassIcon,
    BellIcon
} from '@heroicons/react/24/outline';

const Header = () => {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000); // Update every minute

        return () => clearInterval(timer);
    }, []);

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
        }).format(date);
    };

    const formatTime = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        }).format(date);
    };

    return (
        <header className="h-[70px] bg-white border-b border-gray-50 flex items-center justify-between px-8 sticky top-0 z-40">
            {/* Search Bar */}
            <div className="flex-1 max-w-xl">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2.5 border-none rounded-xl bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4F8CFF]/20 focus:bg-white transition-all text-sm"
                        placeholder="Search parents, nurses, or bookings..."
                    />
                </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-6">
                <div className="flex flex-col items-end">
                    <span className="text-sm font-semibold text-gray-800">{formatDate(currentTime)}</span>
                    <span className="text-xs text-gray-500">{formatTime(currentTime)}</span>
                </div>

                <button className="relative p-2 rounded-full hover:bg-gray-50 transition-colors text-gray-500">
                    <BellIcon className="w-6 h-6" />
                    <span className="absolute top-2 right-2.5 block h-2 w-2 rounded-full ring-2 ring-white bg-red-500 transform translate-x-1/2 -translate-y-1/2"></span>
                </button>
            </div>
        </header>
    );
};

export default Header;
