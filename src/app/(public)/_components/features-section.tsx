'use client'
import React, { useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { MessageCircle, Bot, Target, BarChart3, Globe, Smartphone, Zap, Shield, Users, Clock, ArrowRight, CheckCircle, Star, TrendingUp } from 'lucide-react';
// Type definitions for motion components
interface MotionProps {
    children: ReactNode;
    initial?: any;
    animate?: any;
    transition?: any;
    whileHover?: any;
    whileinview?: any;
    viewport?: any;
    whileTap?: any;
    style?: React.CSSProperties;
    className?: string;
    [key: string]: any;
}



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
    },
    tr: ({ children, initial, animate, transition, whileHover, whileinview, viewport, ...props }: MotionProps) => {
        const [isInView, setIsInView] = useState(false);
        const [hasAnimated, setHasAnimated] = useState(false);
        const ref = useRef<HTMLTableRowElement>(null);

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
            <tr ref={ref} {...props} style={style} className={`${props.className || ''}`}>
                {children}
            </tr>
        );
    }
};

// Main Features Section
const MainFeaturesSection = () => {
    const mainFeatures = [
        {
            icon: <MessageCircle className="w-12 h-12" />,
            title: "Auto-Reply Komentar → DM",
            description: "Sistem otomatis yang mendeteksi komentar di post Anda dan langsung membalas dengan template yang sudah disesuaikan, kemudian mengarahkan ke DM pribadi untuk percakapan lebih lanjut.",
            benefits: [
                "Respon instan 24/7",
                "Template yang dapat disesuaikan",
                "Filtering komentar spam",
                "Tracking conversion rate"
            ],
            color: "from-blue-500 to-cyan-500",
            highlight: "Fitur Utama"
        },
        {
            icon: <Bot className="w-12 h-12" />,
            title: "AI Smart Response",
            description: "Teknologi AI yang memahami konteks percakapan dan memberikan respon yang natural, personal, dan relevan dengan kebutuhan setiap prospek.",
            benefits: [
                "Pemahaman konteks percakapan",
                "Respon yang natural & personal",
                "Learning dari interaksi sebelumnya",
                "Multi-bahasa support"
            ],
            color: "from-purple-500 to-pink-500",
            highlight: "AI-Powered"
        },
        {
            icon: <Target className="w-12 h-12" />,
            title: "Lead Scoring & Nurturing",
            description: "Sistem pintar yang menilai kualitas leads berdasarkan perilaku dan engagement, kemudian melakukan nurturing otomatis dengan strategi yang tepat.",
            benefits: [
                "Scoring otomatis berdasarkan behavior",
                "Nurturing sequence yang personal",
                "Segmentasi leads berkualitas",
                "ROI tracking yang akurat"
            ],
            color: "from-green-500 to-teal-500",
            highlight: "Smart Analytics"
        }
    ];

    return (
        <div className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
            <div className="container mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileinview={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-20"
                    animate={undefined}
                    whileHover={undefined}
                >
                    <div className="inline-block bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                        Fitur Unggulan
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                        Tiga Pilar Kekuatan Zosmed
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Kombinasi sempurna antara otomasi cerdas, AI yang powerful, dan analytics yang mendalam
                        untuk mengoptimalkan setiap interaksi di Instagram
                    </p>
                </motion.div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {mainFeatures.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileinview={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: index * 0.2 }}
                            className="relative"
                            animate={undefined}
                            whileHover={undefined}
                        >
                            <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 h-full">
                                {/* Highlight Badge */}
                                <div className="absolute -top-3 left-6">
                                    <span className={`bg-gradient-to-r ${feature.color} text-white px-4 py-2 rounded-full text-sm font-semibold`}>
                                        {feature.highlight}
                                    </span>
                                </div>

                                {/* Icon */}
                                <motion.div
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    className={`w-20 h-20 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center text-white mb-6 mx-auto`}
                                    initial={undefined}
                                    animate={undefined}
                                    transition={undefined}
                                    whileinview={undefined}
                                    viewport={undefined}
                                >
                                    {feature.icon}
                                </motion.div>

                                {/* Content */}
                                <div className="text-center mb-6">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                                </div>

                                {/* Benefits */}
                                <div className="space-y-3">
                                    {feature.benefits.map((benefit, idx) => (
                                        <div key={idx} className="flex items-center text-gray-700">
                                            <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                                            <span className="text-sm">{benefit}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* CTA */}
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="w-full mt-6 bg-gray-900 text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition-all duration-300 group"
                                    initial={undefined}
                                    animate={undefined}
                                    transition={undefined}
                                    whileinview={undefined}
                                    viewport={undefined}
                                >
                                    Pelajari Lebih Lanjut
                                    <ArrowRight className="w-4 h-4 ml-2 inline group-hover:translate-x-1 transition-transform" />
                                </motion.button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Additional Features Section
const AdditionalFeaturesSection = () => {
    const additionalFeatures = [
        {
            icon: <BarChart3 className="w-8 h-8" />,
            title: "Advanced Analytics",
            description: "Dashboard komprehensif dengan insights mendalam tentang performa campaigns"
        },
        {
            icon: <Globe className="w-8 h-8" />,
            title: "Multi-Account Management",
            description: "Kelola multiple akun Instagram dari satu dashboard terpusat"
        },
        {
            icon: <Smartphone className="w-8 h-8" />,
            title: "Mobile-First Design",
            description: "Akses penuh dari smartphone dengan interface yang intuitif"
        },
        {
            icon: <Shield className="w-8 h-8" />,
            title: "Enterprise Security",
            description: "Keamanan tingkat enterprise dengan encryption end-to-end"
        },
        {
            icon: <Zap className="w-8 h-8" />,
            title: "Lightning Fast Setup",
            description: "Setup dalam 5 menit dengan wizard yang user-friendly"
        },
        {
            icon: <Users className="w-8 h-8" />,
            title: "Team Collaboration",
            description: "Kerja sama tim dengan role management yang fleksibel"
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
                    animate={undefined}
                    whileHover={undefined}
                >
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">
                        Fitur Pendukung yang Powerful
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Lengkapi strategi automation Anda dengan fitur-fitur canggih yang dirancang
                        untuk memaksimalkan efisiensi dan hasil
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {additionalFeatures.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileinview={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            whileHover={{ y: -5 }}
                            className="bg-gradient-to-br from-gray-50 to-blue-50 p-6 rounded-2xl hover:shadow-lg transition-all duration-300 border border-gray-100 group"
                            animate={undefined}
                        >
                            <motion.div
                                whileHover={{ scale: 1.1 }}
                                className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center text-white mb-4"
                                initial={undefined}
                                animate={undefined}
                                transition={undefined}
                                whileinview={undefined}
                                viewport={undefined}
                            >
                                {feature.icon}
                            </motion.div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                                {feature.title}
                            </h3>
                            <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Benefits Comparison Section
const BenefitsComparisonSection = () => {
    const comparison = [
        {
            metric: "Response Time",
            manual: "2-8 jam",
            automated: "< 30 detik",
            improvement: "95% lebih cepat"
        },
        {
            metric: "Lead Conversion",
            manual: "15-25%",
            automated: "45-65%",
            improvement: "2.5x peningkatan"
        },
        {
            metric: "Operational Cost",
            manual: "Rp 8-15 juta/bulan",
            automated: "Rp 299k/bulan",
            improvement: "95% penghematan"
        },
        {
            metric: "Coverage Time",
            manual: "8-12 jam/hari",
            automated: "24/7 non-stop",
            improvement: "100% uptime"
        }
    ];

    return (
        <div className="py-20 bg-gradient-to-r from-blue-600 to-cyan-500">
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
                    <h2 className="text-4xl font-bold text-white mb-4">
                        Manual vs Automated: Perbandingan Nyata
                    </h2>
                    <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                        Lihat perbedaan dramatik antara pengelolaan manual dan otomasi Zosmed
                    </p>
                </motion.div>

                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/20">
                                    <th className="text-left text-white font-semibold py-4 px-4">Metrics</th>
                                    <th className="text-center text-white font-semibold py-4 px-4">Manual</th>
                                    <th className="text-center text-white font-semibold py-4 px-4">Zosmed</th>
                                    <th className="text-center text-white font-semibold py-4 px-4">Improvement</th>
                                </tr>
                            </thead>
                            <tbody>
                                {comparison.map((item, index) => (
                                    <motion.tr
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        whileinview={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.6, delay: index * 0.1 }}
                                        className="border-b border-white/10 hover:bg-white/5 transition-colors"
                                        animate={undefined}
                                        whileHover={undefined}
                                    >
                                        <td className="text-white font-medium py-4 px-4">{item.metric}</td>
                                        <td className="text-center text-red-200 py-4 px-4">{item.manual}</td>
                                        <td className="text-center text-green-200 py-4 px-4 font-semibold">{item.automated}</td>
                                        <td className="text-center text-yellow-200 py-4 px-4 font-bold">{item.improvement}</td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileinview={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="text-center mt-12"
                    animate={undefined}
                    whileHover={undefined}
                >
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-white text-blue-700 px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all duration-300 group"
                        initial={undefined}
                        animate={undefined}
                        transition={undefined}
                        whileinview={undefined}
                        viewport={undefined}
                    >
                        Mulai Otomasi Sekarang
                        <TrendingUp className="w-5 h-5 ml-2 inline group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                </motion.div>
            </div>
        </div>
    );
};

// Combined Features Section
const FeaturesSection = () => {
    return (
        <div>
            <MainFeaturesSection />
            <AdditionalFeaturesSection />
            <BenefitsComparisonSection />
        </div>
    );
};

export default FeaturesSection;