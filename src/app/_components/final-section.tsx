'use client'

import React, { useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { ChevronDown, CheckCircle, Sparkles, Trophy, Star, Instagram, Twitter, Linkedin, ArrowRight, Clock, Shield, Zap, Users, MessageCircle, Target, Gift, Crown, Rocket, Phone, Mail, MapPin, ExternalLink } from 'lucide-react';

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
    }
};

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

// FAQ Section
const FAQSection = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const faqs = [
        {
            question: "Apakah Zosmed aman untuk akun Instagram saya?",
            answer: "Absolut aman! Zosmed menggunakan teknologi keamanan enterprise dengan rate limiting yang ketat, behavior pattern seperti manusia, dan full compliance dengan kebijakan Instagram. Tim kami terus memonitor update kebijakan Instagram untuk memastikan keamanan maksimal."
        },
        {
            question: "Berapa lama setup dan onboarding process?",
            answer: "Setup super cepat hanya 5 menit! Kami menyediakan wizard step-by-step yang mudah diikuti. Untuk beta testers, ada personal onboarding session 1-on-1 dengan tim kami untuk memastikan setup optimal sesuai kebutuhan bisnis Anda."
        },
        {
            question: "Apakah perlu skill teknis untuk menggunakan Zosmed?",
            answer: "Tidak sama sekali! Zosmed dirancang untuk semua orang, dari pemula hingga marketer berpengalaman. Interface drag-and-drop yang intuitif, template siap pakai, dan dokumentasi lengkap membuat siapa pun bisa menggunakan tanpa background teknis."
        },
        {
            question: "Bagaimana cara kerja AI Smart Response?",
            answer: "AI kami menganalisis konteks percakapan, history interaksi, dan profil leads untuk memberikan respon yang personal dan relevan. Semakin lama digunakan, semakin pintar AI dalam memahami tone bisnis dan preferensi customers Anda."
        },
        {
            question: "Apakah data dan conversation saya aman?",
            answer: "Data Anda 100% aman dengan enkripsi end-to-end, server berstandar ISO 27001, dan backup otomatis. Kami tidak pernah menjual atau membagikan data Anda. Semua data disimpan sesuai standar GDPR dan dapat diekspor kapan saja."
        },
        {
            question: "Bagaimana support dan maintenance ke depannya?",
            answer: "Kami menyediakan 24/7 support via chat, email, dan phone. Update rutin setiap bulan dengan fitur baru, bug fixes, dan optimasi. Beta testers mendapat prioritas support dan akses early ke fitur terbaru."
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
                    className="text-center mb-16"
                    animate={undefined}
                    whileHover={undefined}
                >
                    <div className="inline-block bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                        Frequently Asked Questions
                    </div>
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">
                        Pertanyaan yang Sering Diajukan
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Temukan jawaban untuk semua pertanyaan Anda tentang Zosmed
                    </p>
                </motion.div>

                <div className="max-w-4xl mx-auto">
                    {faqs.map((faq, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileinview={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            className="mb-6"
                            animate={undefined}
                            whileHover={undefined}
                        >
                            <div
                                className={`bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 overflow-hidden ${openIndex === index ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
                                    }`}
                            >
                                <button
                                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                    className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                                >
                                    <h3 className="text-lg font-semibold text-gray-900 pr-8">
                                        {faq.question}
                                    </h3>
                                    <motion.div
                                        animate={{ rotate: openIndex === index ? 180 : 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="flex-shrink-0"
                                        initial={undefined}
                                        whileHover={undefined}
                                        whileinview={undefined}
                                        viewport={undefined}
                                    >
                                        <ChevronDown className="w-5 h-5 text-gray-500" />
                                    </motion.div>
                                </button>

                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{
                                        height: openIndex === index ? 'auto' : 0,
                                        opacity: openIndex === index ? 1 : 0
                                    }}
                                    transition={{ duration: 0.3 }}
                                    className="overflow-hidden"
                                    whileHover={undefined}
                                    whileinview={undefined}
                                    viewport={undefined}
                                >
                                    <div className="px-6 pb-6 border-t border-gray-100">
                                        <p className="text-gray-600 leading-relaxed mt-4">
                                            {faq.answer}
                                        </p>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileinview={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="text-center mt-12"
                    animate={undefined}
                    whileHover={undefined}
                >
                    <p className="text-gray-600 mb-4">
                        Masih ada pertanyaan lain?
                    </p>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-300 group"
                        initial={undefined}
                        animate={undefined}
                        transition={undefined}
                        whileinview={undefined}
                        viewport={undefined}
                    >
                        Hubungi Support
                        <ArrowRight className="w-4 h-4 ml-2 inline group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                </motion.div>
            </div>
        </div>
    );
};

// Enhanced CTA Section
const CTASection = () => {
    const benefits = [
        { icon: <Clock className="w-5 h-5" />, text: "Setup dalam 5 menit" },
        { icon: <Shield className="w-5 h-5" />, text: "100% aman & compliant" },
        { icon: <Zap className="w-5 h-5" />, text: "ROI positif dalam 30 hari" },
        { icon: <Users className="w-5 h-5" />, text: "Support 24/7" }
    ];

    return (
        <div className="py-20 bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-500 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-2xl animate-pulse"></div>
                <div className="absolute bottom-10 right-10 w-40 h-40 bg-cyan-300 rounded-full blur-2xl animate-pulse delay-1000"></div>
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileinview={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="text-center"
                    animate={undefined}
                    whileHover={undefined}
                >
                    <div className="inline-block bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold mb-6">
                        Ready to Transform Your Business?
                    </div>

                    <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
                        Siap Mengotomasi <br />
                        <span className="bg-gradient-to-r from-cyan-200 to-white bg-clip-text text-transparent">
                            Bisnis Anda?
                        </span>
                    </h2>

                    <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                        Bergabunglah dengan bisnis-bisnis yang sudah merasakan transformasi
                        dengan automation yang powerful dan AI yang cerdas.
                    </p>

                    {/* Benefits Grid */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileinview={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-3xl mx-auto mb-10"
                        animate={undefined}
                        whileHover={undefined}
                    >
                        {benefits.map((benefit, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileinview={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.1 * index }}
                                className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20"
                                animate={undefined}
                                whileHover={undefined}
                            >
                                <div className="flex items-center space-x-3 text-white">
                                    <div className="flex-shrink-0">
                                        {benefit.icon}
                                    </div>
                                    <span className="text-sm font-medium">{benefit.text}</span>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* CTA Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileinview={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center"
                        animate={undefined}
                        whileHover={undefined}
                    >
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-white text-blue-700 px-8 py-4 rounded-xl font-bold text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 group"
                            initial={undefined}
                            animate={undefined}
                            transition={undefined}
                            whileinview={undefined}
                            viewport={undefined}
                        >
                            <Crown className="w-5 h-5 mr-2 inline" />
                            Mulai Beta Testing
                            <Sparkles className="w-5 h-5 ml-2 inline group-hover:rotate-12 transition-transform" />
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white hover:text-blue-700 transition-all duration-300 group"
                            initial={undefined}
                            animate={undefined}
                            transition={undefined}
                            whileinview={undefined}
                            viewport={undefined}
                        >
                            <Phone className="w-5 h-5 mr-2 inline" />
                            Konsultasi Gratis
                        </motion.button>
                    </motion.div>

                    {/* Trust Indicators */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileinview={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        className="mt-12 text-blue-100 text-sm"
                        animate={undefined}
                        whileHover={undefined}
                    >
                        <p className="mb-4">✅ Tanpa komitmen jangka panjang • ✅ Cancel kapan saja • ✅ Money back guarantee</p>
                        <div className="flex items-center justify-center space-x-6">
                            <div className="flex items-center">
                                <Star className="w-4 h-4 text-yellow-400 mr-1" />
                                <span>Trusted by 1000+ businesses</span>
                            </div>
                            <div className="flex items-center">
                                <Shield className="w-4 h-4 text-green-400 mr-1" />
                                <span>SOC 2 Compliant</span>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

// Enhanced Waitlist Form
const WaitlistForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        businessType: '',
        monthlyBudget: '',
        currentChallenges: ''
    });
    const [submitted, setSubmitted] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = () => {
        if (formData.name && formData.email) {
            setSubmitted(true);
            setTimeout(() => setSubmitted(false), 5000);
        }
    };

    const betaBenefits = [
        {
            icon: <Crown className="w-5 h-5" />,
            title: "Lifetime Access",
            description: "Akses seumur hidup dengan harga beta special"
        },
        {
            icon: <Trophy className="w-5 h-5" />,
            title: "Personal Onboarding",
            description: "Setup 1-on-1 dengan expert kami"
        },
        {
            icon: <Gift className="w-5 h-5" />,
            title: "Premium Features",
            description: "Gratis 6 bulan fitur premium"
        },
        {
            icon: <Rocket className="w-5 h-5" />,
            title: "Priority Support",
            description: "24/7 priority support & feature requests"
        }
    ];

    return (
        <div className="py-20 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-20 left-20 w-64 h-64 bg-cyan-400 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-20 w-80 h-80 bg-blue-400 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileinview={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="max-w-6xl mx-auto"
                    animate={undefined}
                    whileHover={undefined}
                >
                    <div className="text-center mb-16">
                        <div className="inline-block bg-gradient-to-r from-yellow-400 to-orange-400 text-black px-4 py-2 rounded-full text-sm font-bold mb-6">
                            🎉 EXCLUSIVE BETA PROGRAM
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            Jadilah Beta Tester Eksklusif!
                        </h2>
                        <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                            Dapatkan akses pertama ke Zosmed dengan benefit eksklusif yang tidak akan tersedia lagi setelah launch
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Beta Benefits */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileinview={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            animate={undefined}
                            whileHover={undefined}
                        >
                            <h3 className="text-2xl font-bold text-white mb-8">
                                Benefit Eksklusif Beta Tester
                            </h3>
                            <div className="space-y-6">
                                {betaBenefits.map((benefit, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileinview={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.6, delay: 0.1 * index }}
                                        className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
                                        animate={undefined}
                                        whileHover={undefined}
                                    >
                                        <div className="flex items-start space-x-4">
                                            <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-black p-2 rounded-xl">
                                                {benefit.icon}
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-semibold text-white mb-2">{benefit.title}</h4>
                                                <p className="text-blue-100">{benefit.description}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Registration Form */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileinview={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            animate={undefined}
                            whileHover={undefined}
                        >
                            {!submitted ? (
                                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-8">
                                    <h3 className="text-2xl font-bold text-white mb-6 text-center">
                                        Daftar Beta Testing
                                    </h3>

                                    <div className="space-y-4">
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <input
                                                type="text"
                                                placeholder="Nama Lengkap *"
                                                value={formData.name}
                                                onChange={(e) => handleInputChange('name', e.target.value)}
                                                className="w-full px-6 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all duration-300"
                                            />
                                            <input
                                                type="email"
                                                placeholder="Email Address *"
                                                value={formData.email}
                                                onChange={(e) => handleInputChange('email', e.target.value)}
                                                className="w-full px-6 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all duration-300"
                                            />
                                        </div>

                                        <input
                                            type="tel"
                                            placeholder="Nomor WhatsApp (opsional)"
                                            value={formData.phone}
                                            onChange={(e) => handleInputChange('phone', e.target.value)}
                                            className="w-full px-6 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all duration-300"
                                        />

                                        <select
                                            value={formData.businessType}
                                            onChange={(e) => handleInputChange('businessType', e.target.value)}
                                            className="w-full px-6 py-4 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all duration-300"
                                        >
                                            <option value="" className="text-gray-800">Pilih Jenis Bisnis</option>
                                            <option value="fashion" className="text-gray-800">Fashion & Lifestyle</option>
                                            <option value="food" className="text-gray-800">Food & Beverage</option>
                                            <option value="beauty" className="text-gray-800">Beauty & Skincare</option>
                                            <option value="services" className="text-gray-800">Jasa & Konsultasi</option>
                                            <option value="digital" className="text-gray-800">Digital Products</option>
                                            <option value="education" className="text-gray-800">Education & Training</option>
                                            <option value="other" className="text-gray-800">Lainnya</option>
                                        </select>

                                        <select
                                            value={formData.monthlyBudget}
                                            onChange={(e) => handleInputChange('monthlyBudget', e.target.value)}
                                            className="w-full px-6 py-4 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all duration-300"
                                        >
                                            <option value="" className="text-gray-800">Budget Marketing per Bulan</option>
                                            <option value="under-1M" className="text-gray-800">&lt; Rp 1 juta</option>
                                            <option value="1-5M" className="text-gray-800">Rp 1-5 juta</option>
                                            <option value="5-10M" className="text-gray-800">Rp 5-10 juta</option>
                                            <option value="10-25M" className="text-gray-800">Rp 10-25 juta</option>
                                            <option value="above-25M" className="text-gray-800">&gt; Rp 25 juta</option>
                                        </select>

                                        <textarea
                                            placeholder="Ceritakan tantangan terbesar dalam mengelola Instagram bisnis Anda..."
                                            value={formData.currentChallenges}
                                            onChange={(e) => handleInputChange('currentChallenges', e.target.value)}
                                            rows={3}
                                            className="w-full px-6 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all duration-300 resize-none"
                                        />

                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={handleSubmit}
                                            className="w-full bg-gradient-to-r from-yellow-400 to-orange-400 text-black px-8 py-4 rounded-xl font-bold text-lg hover:from-yellow-500 hover:to-orange-500 transition-all duration-300 group"
                                            initial={undefined}
                                            animate={undefined}
                                            transition={undefined}
                                            whileinview={undefined}
                                            viewport={undefined}
                                        >
                                            🚀 Daftar Beta Testing Sekarang
                                            <Trophy className="w-5 h-5 ml-2 inline group-hover:rotate-12 transition-transform" />
                                        </motion.button>
                                    </div>

                                    <p className="text-blue-200 text-sm text-center mt-4">
                                        * Slot terbatas hanya 100 beta tester pertama
                                    </p>
                                </div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.5 }}
                                    className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-8 rounded-3xl text-center"
                                    whileHover={undefined}
                                    whileinview={undefined}
                                    viewport={undefined}
                                >
                                    <CheckCircle className="w-16 h-16 mx-auto mb-4" />
                                    <h3 className="text-2xl font-bold mb-2">🎉 Selamat! Anda Terdaftar</h3>
                                    <p className="text-lg mb-4">
                                        Terima kasih telah mendaftar sebagai beta tester Zosmed!
                                    </p>
                                    <div className="bg-white/20 rounded-2xl p-4 mb-4">
                                        <h4 className="font-semibold mb-2">Langkah Selanjutnya:</h4>
                                        <ul className="text-sm space-y-1">
                                            <li>✅ Tim kami akan menghubungi Anda dalam 24 jam</li>
                                            <li>✅ Personal onboarding session akan dijadwalkan</li>
                                            <li>✅ Akses beta akan diberikan setelah setup</li>
                                        </ul>
                                    </div>
                                    <p className="text-sm">
                                        Cek email Anda untuk informasi lebih lanjut!
                                    </p>
                                </motion.div>
                            )}
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

// Enhanced Footer
const Footer = () => {
    const productLinks = [
        { name: "Fitur", href: "#features" },
        { name: "Harga", href: "#pricing" },
        { name: "Platform", href: "#platforms" },
        { name: "API Documentation", href: "#" },
        { name: "Integrasi", href: "#" }
    ];

    const supportLinks = [
        { name: "Pusat Bantuan", href: "#" },
        { name: "Live Chat", href: "#" },
        { name: "Email Support", href: "#" },
        { name: "Phone Support", href: "#" },
        { name: "Status System", href: "#" }
    ];

    const companyLinks = [
        { name: "Tentang Kami", href: "#" },
        { name: "Blog", href: "#" },
        { name: "Karir", href: "#" },
        { name: "Press Kit", href: "#" },
        { name: "Partner Program", href: "#" }
    ];

    const legalLinks = [
        { name: "Privacy Policy", href: "#" },
        { name: "Terms of Service", href: "#" },
        { name: "Cookie Policy", href: "#" },
        { name: "GDPR Compliance", href: "#" }
    ];

    return (
        <footer className="bg-gray-900 text-white">
            <div className="container mx-auto px-6 py-16">
                <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-8">
                    {/* Company Info */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center space-x-3 mb-4">
                            <ZosmedLogo className="w-8 h-8" />
                            <span className="text-2xl font-bold">Zosmed</span>
                        </div>
                        <p className="text-gray-400 mb-6 max-w-md">
                            Platform otomasi Instagram terdepan yang membantu bisnis mengoptimalkan
                            engagement, meningkatkan konversi, dan menghemat waktu dengan AI yang cerdas.
                        </p>

                        {/* Contact Info */}
                        <div className="space-y-3 mb-6">
                            <div className="flex items-center text-gray-400">
                                <Mail className="w-4 h-4 mr-3" />
                                <span>support@zosmed.com</span>
                            </div>
                            <div className="flex items-center text-gray-400">
                                <Phone className="w-4 h-4 mr-3" />
                                <span>+62 21 1234 5678</span>
                            </div>
                            <div className="flex items-center text-gray-400">
                                <MapPin className="w-4 h-4 mr-3" />
                                <span>Jakarta, Indonesia</span>
                            </div>
                        </div>

                        {/* Social Links */}
                        <div className="flex space-x-4">
                            <a href="#" className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800">
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800">
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800">
                                <Linkedin className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Product Links */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Produk</h4>
                        <ul className="space-y-2">
                            {productLinks.map((link, index) => (
                                <li key={index}>
                                    <a href={link.href} className="text-gray-400 hover:text-white transition-colors flex items-center group">
                                        {link.name}
                                        {link.href === "#" && <ExternalLink className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support Links */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Dukungan</h4>
                        <ul className="space-y-2">
                            {supportLinks.map((link, index) => (
                                <li key={index}>
                                    <a href={link.href} className="text-gray-400 hover:text-white transition-colors flex items-center group">
                                        {link.name}
                                        {link.href === "#" && <ExternalLink className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company Links */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Perusahaan</h4>
                        <ul className="space-y-2">
                            {companyLinks.map((link, index) => (
                                <li key={index}>
                                    <a href={link.href} className="text-gray-400 hover:text-white transition-colors flex items-center group">
                                        {link.name}
                                        {link.href === "#" && <ExternalLink className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal Links */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Legal</h4>
                        <ul className="space-y-2">
                            {legalLinks.map((link, index) => (
                                <li key={index}>
                                    <a href={link.href} className="text-gray-400 hover:text-white transition-colors flex items-center group">
                                        {link.name}
                                        {link.href === "#" && <ExternalLink className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-12 pt-8">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <p className="text-gray-400 text-sm">
                            &copy; 2025 Zosmed. All rights reserved.
                        </p>
                        <div className="flex items-center space-x-4 mt-4 md:mt-0">
                            <div className="flex items-center text-gray-400 text-sm">
                                <Shield className="w-4 h-4 mr-2" />
                                <span>SOC 2 Compliant</span>
                            </div>
                            <div className="flex items-center text-gray-400 text-sm">
                                <Star className="w-4 h-4 mr-2" />
                                <span>ISO 27001 Certified</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

// Combined Final Sections Component
const ZosmedFinalSections = () => {
    return (
        <div>
            <FAQSection />
            <CTASection />
            <WaitlistForm />
            <Footer />
        </div>
    );
};

export default ZosmedFinalSections;