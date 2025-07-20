'use client'
import React, { useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { Timer, Users, TrendingUp, Bot, Zap, Shield, Check } from 'lucide-react';
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

// Problem Section
const ProblemSection = () => {
    const problems = [
        {
            icon: <Timer className="w-8 h-8" />,
            title: "Terlambat Respon",
            description: "Kehilangan leads karena tidak bisa balas komentar 24/7"
        },
        {
            icon: <Users className="w-8 h-8" />,
            title: "Butuh Banyak Admin",
            description: "Biaya admin mahal untuk monitor dan balas komentar manual"
        },
        {
            icon: <TrendingUp className="w-8 h-8" />,
            title: "Konversi Rendah",
            description: "Banyak leads hilang karena proses follow-up yang lambat"
        }
    ];

    return (
        <div className="py-20 bg-red-50">
            <div className="container mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileinview={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16"
                    animate={undefined}
                    whileHover={undefined}
                >
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">
                        Masalah yang Sering Dihadapi
                    </h2>
                    <p className="text-xl text-gray-600">
                        Tantangan bisnis online yang menguras waktu dan biaya
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-8">
                    {problems.map((problem, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileinview={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: index * 0.2 }}
                            className="bg-white p-8 rounded-2xl shadow-lg border border-red-100"
                            animate={undefined}
                            whileHover={undefined}
                        >
                            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 mb-6">
                                {problem.icon}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">{problem.title}</h3>
                            <p className="text-gray-600 leading-relaxed">{problem.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Solution Section
const SolutionSection = () => {
    const solutions = [
        {
            icon: <Bot className="w-8 h-8" />,
            title: "AI-Powered Automation",
            description: "Sistem pintar yang bekerja 24/7 tanpa istirahat",
            features: ["Respon instan", "Konteks percakapan", "Personalisasi otomatis"]
        },
        {
            icon: <Zap className="w-8 h-8" />,
            title: "Setup Super Mudah",
            description: "Aktifkan dalam hitungan menit, bukan hari",
            features: ["No-code setup", "Template siap pakai", "Integrasi 1-klik"]
        },
        {
            icon: <Shield className="w-8 h-8" />,
            title: "Aman & Terpercaya",
            description: "Compliance dengan kebijakan Instagram terbaru",
            features: ["Rate limiting", "Human-like behavior", "Anti-spam protection"]
        }
    ];

    return (
        <div className="py-20 bg-gradient-to-br from-blue-50 to-cyan-50">
            <div className="container mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileinview={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16"
                    animate={undefined}
                    whileHover={undefined}
                >
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">
                        Solusi Cerdas untuk Bisnis Modern
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Teknologi terdepan yang mengatasi semua tantangan bisnis online Anda
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-8">
                    {solutions.map((solution, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileinview={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: index * 0.2 }}
                            whileHover={{ y: -10 }}
                            className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-blue-100"
                            animate={undefined}
                        >
                            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center text-white mb-6">
                                {solution.icon}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">{solution.title}</h3>
                            <p className="text-gray-600 mb-4">{solution.description}</p>
                            <ul className="space-y-2">
                                {solution.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-center text-sm text-gray-700">
                                        <Check className="w-4 h-4 text-green-500 mr-2" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Combined Component
const ProblemSolutionSections = () => {
    return (
        <div>
            <ProblemSection />
            <SolutionSection />
        </div>
    );
};

export default ProblemSolutionSections;