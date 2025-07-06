'use client'

import React, { useState, useEffect, useRef, type ReactNode } from 'react';
import { Instagram, Twitter, Facebook, Youtube, Linkedin } from 'lucide-react';
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
    }
};

// Social Media Platforms Section
const SocialMediaSection = () => {
    const platforms = [
        {
            icon: <Instagram className="w-8 h-8" />,
            name: "Instagram",
            status: "Available Now",
            color: "from-pink-500 to-purple-500",
            statusColor: "bg-green-100 text-green-800"
        },
        {
            icon: <Twitter className="w-8 h-8" />,
            name: "Twitter/X",
            status: "Q2 2025",
            color: "from-blue-400 to-blue-600",
            statusColor: "bg-blue-100 text-blue-800"
        },
        {
            icon: <Facebook className="w-8 h-8" />,
            name: "Facebook",
            status: "Q3 2025",
            color: "from-blue-600 to-blue-800",
            statusColor: "bg-blue-100 text-blue-800"
        },
        {
            icon: <Youtube className="w-8 h-8" />,
            name: "YouTube",
            status: "Q4 2025",
            color: "from-red-500 to-red-600",
            statusColor: "bg-red-100 text-red-800"
        },
        {
            icon: <Linkedin className="w-8 h-8" />,
            name: "LinkedIn",
            status: "2026",
            color: "from-blue-700 to-blue-900",
            statusColor: "bg-gray-100 text-gray-800"
        }
    ];

    return (
        <div className="py-20 bg-white">
            <div className="container mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileinview={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">
                        Ekspansi Multi-Platform
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Mulai dengan Instagram, kami akan terus menambahkan platform media sosial lainnya
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
                    {platforms.map((platform, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileinview={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            whileHover={{ y: -5 }}
                            className="bg-gray-50 p-6 rounded-2xl hover:shadow-lg transition-all duration-300 border border-gray-100 text-center"
                        >
                            <motion.div
                                whileHover={{ scale: 1.1 }}
                                className={`w-16 h-16 bg-gradient-to-r ${platform.color} rounded-2xl flex items-center justify-center text-white mx-auto mb-4`}
                            >
                                {platform.icon}
                            </motion.div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">{platform.name}</h3>
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${platform.statusColor}`}>
                                {platform.status}
                            </span>
                        </motion.div>
                    ))}
                </div>

                {/* Roadmap Timeline */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileinview={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="mt-16 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-8"
                >
                    <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
                        Roadmap Pengembangan
                    </h3>

                    <div className="relative">
                        {/* Timeline Line */}
                        <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full"></div>

                        <div className="space-y-12">
                            {/* Current */}
                            <div className="flex items-center">
                                <div className="w-1/2 text-right pr-8">
                                    <h4 className="text-xl font-bold text-gray-900">Instagram</h4>
                                    <p className="text-gray-600">Platform pertama dengan fitur lengkap</p>
                                </div>
                                <div className="w-8 h-8 bg-green-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center relative z-10">
                                    <div className="w-3 h-3 bg-white rounded-full"></div>
                                </div>
                                <div className="w-1/2 pl-8">
                                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                                        Live Now
                                    </span>
                                </div>
                            </div>

                            {/* Q2 2025 */}
                            <div className="flex items-center">
                                <div className="w-1/2 text-right pr-8">
                                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                        Q2 2025
                                    </span>
                                </div>
                                <div className="w-8 h-8 bg-blue-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center relative z-10">
                                    <div className="w-3 h-3 bg-white rounded-full"></div>
                                </div>
                                <div className="w-1/2 pl-8">
                                    <h4 className="text-xl font-bold text-gray-900">Twitter/X</h4>
                                    <p className="text-gray-600">Auto-reply tweets dan DM management</p>
                                </div>
                            </div>

                            {/* Q3 2025 */}
                            <div className="flex items-center">
                                <div className="w-1/2 text-right pr-8">
                                    <h4 className="text-xl font-bold text-gray-900">Facebook</h4>
                                    <p className="text-gray-600">Comments & Messenger automation</p>
                                </div>
                                <div className="w-8 h-8 bg-blue-600 rounded-full border-4 border-white shadow-lg flex items-center justify-center relative z-10">
                                    <div className="w-3 h-3 bg-white rounded-full"></div>
                                </div>
                                <div className="w-1/2 pl-8">
                                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                        Q3 2025
                                    </span>
                                </div>
                            </div>

                            {/* Q4 2025 */}
                            <div className="flex items-center">
                                <div className="w-1/2 text-right pr-8">
                                    <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                                        Q4 2025
                                    </span>
                                </div>
                                <div className="w-8 h-8 bg-red-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center relative z-10">
                                    <div className="w-3 h-3 bg-white rounded-full"></div>
                                </div>
                                <div className="w-1/2 pl-8">
                                    <h4 className="text-xl font-bold text-gray-900">YouTube</h4>
                                    <p className="text-gray-600">Comments management & analytics</p>
                                </div>
                            </div>

                            {/* 2026 */}
                            <div className="flex items-center">
                                <div className="w-1/2 text-right pr-8">
                                    <h4 className="text-xl font-bold text-gray-900">LinkedIn</h4>
                                    <p className="text-gray-600">Professional network automation</p>
                                </div>
                                <div className="w-8 h-8 bg-blue-800 rounded-full border-4 border-white shadow-lg flex items-center justify-center relative z-10">
                                    <div className="w-3 h-3 bg-white rounded-full"></div>
                                </div>
                                <div className="w-1/2 pl-8">
                                    <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                                        2026
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default SocialMediaSection;