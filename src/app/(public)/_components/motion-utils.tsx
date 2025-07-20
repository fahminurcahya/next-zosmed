import React, { useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import type { MotionProps } from '../page';


// Custom Motion Components
export const motion = {
    div: ({ children, initial, animate, transition, whileHover, whileinview, viewport, ...props }: MotionProps) => {
        const [isInView, setIsInView] = useState(false);
        const [hasAnimated, setHasAnimated] = useState(false);
        const ref = useRef<HTMLDivElement>(null);

        useEffect(() => {
            if (!ref.current || !whileinview) return;

            const observer = new IntersectionObserver(
                (entries) => {
                    const entry = entries[0];
                    if (entry && entry.isIntersecting && !hasAnimated) {
                        setIsInView(true);
                        setHasAnimated(true);
                    }
                },
                { threshold: viewport?.amount || 0.1 }
            );

            observer.observe(ref.current);
            return () => observer.disconnect();
        }, [whileinview, hasAnimated, viewport]);

        const currentAnimate = whileinview && isInView ? whileinview : animate;
        const style = {
            ...props.style,
            transform: currentAnimate?.y ? `translateY(${currentAnimate.y}px)` :
                currentAnimate?.x ? `translateX(${currentAnimate.x}px)` :
                    currentAnimate?.scale ? `scale(${currentAnimate.scale})` : 'none',
            opacity: currentAnimate?.opacity !== undefined ? currentAnimate.opacity : 1,
            transition: `all ${transition?.duration || 0.6}s ${transition?.ease || 'ease-out'} ${transition?.delay || 0}s`
        };

        return (
            <div ref={ref} {...props} style={style} className={`${props.className || ''}`}>
                {children}
            </div>
        );
    },
    button: ({ children, whileHover, whileTap, ...props }: MotionProps) => {
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
    }
};

// Parallax Hook
export const useParallax = () => {
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return scrollY;
};

// Custom Logo Component
export const ZosmedLogo = ({ className = "w-10 h-10" }) => (
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

// Demo Component
const UtilsDemo = () => {
    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                    Zosmed Utils & Motion Components
                </h1>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Logo Demo */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="bg-white p-6 rounded-xl shadow-lg"
                        whileHover={undefined}
                        whileinview={undefined}
                        viewport={undefined}
                    >
                        <h2 className="text-xl font-semibold mb-4">Logo Component</h2>
                        <div className="flex items-center space-x-4">
                            <ZosmedLogo className="w-12 h-12" />
                            <ZosmedLogo className="w-16 h-16" />
                            <ZosmedLogo className="w-20 h-20" />
                        </div>
                    </motion.div>

                    {/* Motion Demo */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="bg-white p-6 rounded-xl shadow-lg"
                        whileHover={undefined}
                        whileinview={undefined}
                        viewport={undefined}
                    >
                        <h2 className="text-xl font-semibold mb-4">Motion Components</h2>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-6 py-3 rounded-lg font-semibold"
                            initial={undefined}
                            animate={undefined}
                            transition={undefined}
                            whileinview={undefined}
                            viewport={undefined}
                        >
                            Hover Me!
                        </motion.button>
                    </motion.div>
                </div>

                <div className="mt-8 bg-white p-6 rounded-xl shadow-lg">
                    <h2 className="text-xl font-semibold mb-4">Available Components</h2>
                    <ul className="space-y-2 text-gray-600">
                        <li>• <code>motion.div</code> - Animated div with IntersectionObserver</li>
                        <li>• <code>motion.button</code> - Interactive button with hover/tap effects</li>
                        <li>• <code>useParallax()</code> - Hook for parallax scroll effects</li>
                        <li>• <code>ZosmedLogo</code> - Branded logo component</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default UtilsDemo;