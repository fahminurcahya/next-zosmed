'use client'

import React, { useState, useEffect, type ButtonHTMLAttributes, type ReactNode } from 'react';

interface MotionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
}

// Custom Logo Component
const ZosmedLogo = ({ className = "w-10 h-10" }) => (
    <div className={`${className} relative`}>
        <div className="w-full h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-2xl flex items-center justify-center shadow-lg">
            <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center">
                <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
                </div>
            </div>
        </div>
    </div>
);

// Motion Button Component
const MotionButton = ({ children, ...props }: MotionButtonProps) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isPressed, setIsPressed] = useState(false);

    const style = {
        ...props.style,
        transform: isPressed ? 'scale(0.95)' : isHovered ? 'scale(1.05)' : 'scale(1)',
        transition: 'all 0.2s ease'
    };

    return (
        <button
            {...props}
            style={style}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onMouseDown={() => setIsPressed(true)}
            onMouseUp={() => setIsPressed(false)}
        >
            {children}
        </button>
    );
};

// Header Component
const Header = () => {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
            ? 'bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-lg'
            : 'bg-white/10 backdrop-blur-md border-b border-white/20'
            }`}>
            <div className="container mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center space-x-3 cursor-pointer group">
                        <div className="group-hover:scale-105 transition-transform duration-300">
                            <ZosmedLogo className="w-10 h-10" />
                        </div>
                        <span className={`text-2xl font-bold transition-colors duration-300 ${isScrolled ? 'text-gray-900' : 'text-white'
                            }`}>
                            Zosmed
                        </span>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-8">
                        <a
                            href="#features"
                            className={`transition-all duration-300 hover:scale-105 ${isScrolled ? 'text-gray-700 hover:text-blue-600' : 'text-white/80 hover:text-white'
                                }`}
                        >
                            Fitur
                        </a>
                        <a
                            href="#pricing"
                            className={`transition-all duration-300 hover:scale-105 ${isScrolled ? 'text-gray-700 hover:text-blue-600' : 'text-white/80 hover:text-white'
                                }`}
                        >
                            Harga
                        </a>
                        <a
                            href="#platforms"
                            className={`transition-all duration-300 hover:scale-105 ${isScrolled ? 'text-gray-700 hover:text-blue-600' : 'text-white/80 hover:text-white'
                                }`}
                        >
                            Platform
                        </a>
                        <a
                            href="#faq"
                            className={`transition-all duration-300 hover:scale-105 ${isScrolled ? 'text-gray-700 hover:text-blue-600' : 'text-white/80 hover:text-white'
                                }`}
                        >
                            FAQ
                        </a>
                        <MotionButton
                            className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 ${isScrolled
                                ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:from-blue-700 hover:to-cyan-600'
                                : 'bg-white text-blue-700 hover:bg-blue-50'
                                }`}
                        >
                            Beta Testing
                        </MotionButton>
                    </nav>

                    {/* Mobile Menu Button */}
                    <MotionButton
                        className={`md:hidden p-2 rounded-lg transition-colors duration-300 ${isScrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white/10'
                            }`}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </MotionButton>
                </div>
            </div>

            {/* Mobile Navigation (expandable) */}
            <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-lg hidden">
                <div className="container mx-auto px-6 py-4">
                    <nav className="flex flex-col space-y-4">
                        <a href="#features" className="text-gray-700 hover:text-blue-600 transition-colors">
                            Fitur
                        </a>
                        <a href="#pricing" className="text-gray-700 hover:text-blue-600 transition-colors">
                            Harga
                        </a>
                        <a href="#platforms" className="text-gray-700 hover:text-blue-600 transition-colors">
                            Platform
                        </a>
                        <a href="#faq" className="text-gray-700 hover:text-blue-600 transition-colors">
                            FAQ
                        </a>
                        <MotionButton className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-6 py-2 rounded-lg font-semibold text-center">
                            Beta Testing
                        </MotionButton>
                    </nav>
                </div>
            </div>
        </header>
    );
};

export default Header;