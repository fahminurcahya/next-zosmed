'use client'
import React, { useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { ChevronRight, ArrowRight, Play, ChevronDown, Rocket } from 'lucide-react';
import type { MotionProps } from '../page';



// Motion Components (simplified version)
const motion = {
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
const useParallax = () => {
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return scrollY;
};

// Hero Section Component
const HeroSection = () => {
    const scrollY = useParallax();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 100);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="relative min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-500 overflow-hidden">
            {/* Parallax Background Elements */}
            <div className="absolute inset-0 opacity-10">
                <div
                    className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl"
                    style={{
                        transform: `translateY(${scrollY * 0.5}px) rotate(${scrollY * 0.1}deg)`,
                        transition: 'transform 0.1s ease-out'
                    }}
                />
                <div
                    className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-300 rounded-full blur-3xl"
                    style={{
                        transform: `translateY(${scrollY * -0.3}px) rotate(${scrollY * -0.1}deg)`,
                        transition: 'transform 0.1s ease-out'
                    }}
                />
                <div
                    className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-300 rounded-full blur-3xl"
                    style={{
                        transform: `translate(-50%, -50%) translateY(${scrollY * 0.2}px)`,
                        transition: 'transform 0.1s ease-out'
                    }}
                />
            </div>

            <div className="relative z-10 container mx-auto px-6 pt-28 pb-20">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 50 }}
                    transition={{ duration: 0.8 }}
                    className="text-center"
                    whileHover={undefined}
                    whileinview={undefined}
                    viewport={undefined}
                >
                    {/* Animated Badge */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.8 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="inline-flex items-center bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 rounded-full px-4 py-2 mb-8 hover:bg-blue-500/30 transition-all duration-300"
                        whileHover={undefined}
                        whileinview={undefined}
                        viewport={undefined}
                    >
                        <Rocket className="w-4 h-4 mr-2 text-blue-200" />
                        <span className="text-blue-200 text-sm font-medium">Revolusi Otomasi Instagram</span>
                    </motion.div>

                    {/* Main Headlines */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        whileHover={undefined}
                        whileinview={undefined}
                        viewport={undefined}
                    >
                        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                            Otomasi Instagram<br />
                            <span className="bg-gradient-to-r from-cyan-200 to-white bg-clip-text text-transparent">
                                Closing Otomatis
                            </span>
                        </h1>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        whileHover={undefined}
                        whileinview={undefined}
                        viewport={undefined}
                    >
                        <p className="text-xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed">
                            Transformasi bisnis Anda dengan otomasi pintar. Balas komentar otomatis ke DM,
                            nurturing leads 24/7, dan tingkatkan konversi tanpa perlu tim admin.
                        </p>
                    </motion.div>

                    {/* CTA Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
                        transition={{ duration: 0.8, delay: 0.8 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
                        whileHover={undefined}
                        whileinview={undefined}
                        viewport={undefined}
                    >
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-white text-blue-700 px-8 py-4 rounded-xl font-semibold text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 group"
                            initial={undefined}
                            animate={undefined}
                            transition={undefined}
                            whileinview={undefined}
                            viewport={undefined}
                        >
                            Mulai Gratis Sekarang
                            <ArrowRight className="w-5 h-5 ml-2 inline group-hover:translate-x-1 transition-transform" />
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="border-2 border-white/30 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transition-all duration-300 group"
                            initial={undefined}
                            animate={undefined}
                            transition={undefined}
                            whileinview={undefined}
                            viewport={undefined}
                        >
                            <Play className="w-5 h-5 mr-2 inline" />
                            Lihat Demo
                        </motion.button>
                    </motion.div>

                    {/* Scroll Indicator */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: isVisible ? 1 : 0 }}
                        transition={{ duration: 0.8, delay: 1.2 }}
                        className="flex flex-col items-center"
                        whileHover={undefined}
                        whileinview={undefined}
                        viewport={undefined}
                    >
                        <p className="text-blue-200 text-sm mb-4">Scroll untuk melihat lebih banyak</p>
                        <motion.div
                            animate={{ y: [0, 10, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            initial={undefined}
                            whileHover={undefined}
                            whileinview={undefined}
                            viewport={undefined}
                        >
                            <ChevronDown className="w-6 h-6 text-blue-200" />
                        </motion.div>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

export default HeroSection;