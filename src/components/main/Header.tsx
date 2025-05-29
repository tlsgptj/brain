"use client";

import React from 'react';
import Image from 'next/image';
import { Settings, Info } from 'lucide-react';

const Header = () => {
    return (
        <header
            className="flex items-center justify-between p-6 border-b border-gray-700"
            style={{ background: '#2C2A42' }}
        >
            <div className="flex items-center gap-6">
                <div className="relative w-[200px] h-[40px]">
                    <Image
                        src={"/images/main_logo.png"}
                        alt="main logo"
                        fill
                        className="object-contain"
                        priority
                    />
                </div>
            </div>
            <div className="flex items-center gap-4">
                <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                    <Settings className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                    <Info className="w-5 h-5" />
                </button>
            </div>
        </header>
    );
};

export default Header;