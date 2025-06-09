"use client";

import React from 'react';
import Image from 'next/image';

const Header = () => {
    return (
        <header
            className="w-full border-b border-gray-700"
            style={{ background: '#2C2A42' }}
        >
            <div className="mx-auto flex items-center justify-start p-6">
                <div className="flex items-center gap-6">
                    <div className="relative w-[900px] h-[250px]">
                        <Image
                            src={"/images/main_logo.png"}
                            alt="main logo"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;