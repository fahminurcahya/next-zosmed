'use client'
import React, { useState, useEffect, useRef } from 'react';
import {
    ChevronRight, MessageCircle, Users, Zap, Clock, TrendingUp, ArrowRight,
    CheckCircle, Instagram, Bot, Target, Twitter, Facebook, Youtube, Linkedin,
    Timer, Shield, BarChart3, Globe, Smartphone, ChevronDown, Sparkles,
    Trophy, Star, Play, Rocket, Check, X, Crown, Gift, Phone, Mail, MapPin
} from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence, useInView } from "framer-motion";
import { SiWhatsapp, SiTelegram } from "react-icons/si";
import { AdditionalFeatures, Benefits, BetaBenefits, Faqs, LegalLinks, MainFeatures, Plans, Platforms, Problems, ProductLinks, Solutions, SupportLinks } from '@/data/metadata';



const useParallax = () => {
    const [scrollY, setScrollY] = useState(0);
    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);
    return scrollY;
};

const CountdownTimer = () => {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });

    useEffect(() => {
        // Set target date (30 days from now)
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + 30);

        const timer = setInterval(() => {
            const now = new Date().getTime();
            const distance = targetDate.getTime() - now;

            if (distance > 0) {
                setTimeLeft({
                    days: Math.floor(distance / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                    seconds: Math.floor((distance % (1000 * 60)) / 1000)
                });
            }
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="flex justify-center space-x-4 mb-8">
            {Object.entries(timeLeft).map(([unit, value]) => (
                <motion.div
                    key={unit}
                    className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center min-w-[80px]"
                    whileHover={{ scale: 1.05 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="text-3xl font-bold text-white mb-1">{value.toString().padStart(2, '0')}</div>
                    <div className="text-sm text-blue-200 capitalize">{unit}</div>
                </motion.div>
            ))}
        </div>
    );
};

// Header Component
const Header = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <motion.header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-white/10 backdrop-blur-md'
                }`}
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
        >
            <div className="container mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        {isScrolled && (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.4 }}
                            >
                                <Image src={"/logo.png"} width={40} height={30} alt='' />
                            </motion.div>
                        )}
                        <motion.span
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: 0.1 }}
                            className={`text-2xl font-bold ${isScrolled ? 'bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent' : 'bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent'}`}
                        >
                            Zosmed
                        </motion.span>
                    </div>

                    <nav className="hidden md:flex items-center space-x-8">
                        <motion.a
                            href="#features"
                            className={`hover:scale-105 transition-all ${isScrolled ? 'text-gray-700 hover:text-blue-600' : 'text-white/80 hover:text-white'}`}
                            whileHover={{ scale: 1.08 }}
                        >Fitur</motion.a>
                        <motion.a
                            href="#faq"
                            className={`hover:scale-105 transition-all ${isScrolled ? 'text-gray-700 hover:text-blue-600' : 'text-white/80 hover:text-white'}`}
                            whileHover={{ scale: 1.08 }}
                        >FAQ</motion.a>
                        <motion.div
                            className={`px-6 py-2 rounded-lg font-semibold transition-all ${isScrolled ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white' : 'bg-white text-blue-700'}`}
                        >
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                <span>Coming Soon</span>
                            </div>
                        </motion.div>
                    </nav>
                </div>
            </div>
        </motion.header>
    );
};

// Hero Section
const HeroSection = () => {
    const scrollY = useParallax();
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.3 });

    return (
        <div className="relative min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-500 overflow-hidden">
            {/* Parallax Background */}
            <div className="absolute inset-0 opacity-10">
                <motion.div
                    className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl"
                    style={{ y: scrollY * 0.5 }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1 }}
                />
                <motion.div
                    className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-300 rounded-full blur-3xl"
                    style={{ y: scrollY * -0.3 }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, delay: 0.2 }}
                />
            </div>

            <div className="relative z-10 container mx-auto px-6 pt-28 pb-20">
                <motion.div
                    ref={ref}
                    initial={{ opacity: 0, y: 50 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 1 }}
                    className="text-center"
                >
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        className="inline-flex items-center bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 rounded-full px-4 py-2 mb-8"
                    >
                        <Rocket className="w-4 h-4 mr-2 text-blue-200" />
                        <span className="text-blue-200 text-sm font-medium">Revolusi Otomasi Zosmed</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
                    >
                        Otomasi Sosial Media<br />
                        <span className="bg-gradient-to-r from-cyan-200 to-white bg-clip-text text-transparent">
                            Closing Otomatis
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.7, delay: 0.5 }}
                        className="text-xl text-blue-100 mb-12 max-w-3xl mx-auto"
                    >
                        Transformasi bisnis dengan smart automation. Balas komentar otomatis ke DM,
                        nurturing leads 24/7, dan tingkatkan konversi tanpa tim admin.
                    </motion.p>

                    {/* Countdown Timer */}
                    {/* <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.7, delay: 0.6 }}
                        className="mb-8"
                    >
                        <div className="text-center mb-4">
                            <p className="text-blue-200 text-lg font-semibold mb-2">🚀 Launch dalam:</p>
                        </div>
                        <CountdownTimer />
                    </motion.div> */}

                    <motion.div
                        className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.6, delay: 0.8 }}
                    >
                        <motion.div
                            className="bg-white/20 backdrop-blur-sm border border-white/30 text-white px-8 py-4 rounded-xl font-semibold text-lg"
                        >
                            <div className="flex items-center justify-center space-x-2">
                                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                <span>Coming Soon - Join Waiting List</span>
                            </div>
                        </motion.div>
                    </motion.div>

                    <motion.div
                        className="flex flex-col items-center"
                        animate={{ y: [0, 10, 0] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                    >
                        <p className="text-blue-200 text-sm mb-4">Scroll untuk melihat lebih banyak</p>
                        <ChevronDown className="w-6 h-6 text-blue-200" />
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i = 1) => ({
        opacity: 1,
        y: 0,
        transition: {
            delay: i * 0.2,
            duration: 0.6
        }
    })
};

const ProblemSolutionSection = () => {


    return (
        <div>
            {/* Problem Section */}
            <div className="py-20 bg-red-50">
                <div className="container mx-auto px-6">
                    <motion.div
                        className="text-center mb-16"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                    >
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Masalah yang Sering Dihadapi</h2>
                        <p className="text-xl text-gray-600">Tantangan bisnis online yang menguras waktu dan biaya</p>
                    </motion.div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {Problems.map((problem, index) => (
                            <motion.div
                                key={index}
                                className="bg-white p-8 rounded-2xl shadow-lg border border-red-100 hover:shadow-xl transition-all"
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                custom={index}
                                variants={fadeInUp}
                            >
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    whileInView={{ scale: 1, opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: 0.1 * index }}
                                    className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 mb-6"
                                >
                                    {problem.icon}
                                </motion.div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{problem.title}</h3>
                                <p className="text-gray-600">{problem.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Solution Section */}
            <div className="py-20 bg-gradient-to-br from-blue-50 to-cyan-50">
                <div className="container mx-auto px-6">
                    <motion.div
                        className="text-center mb-16"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                    >
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Solusi Cerdas untuk Bisnis Modern</h2>
                        <p className="text-xl text-gray-600">Teknologi terdepan yang mengatasi semua tantangan bisnis online</p>
                    </motion.div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {Solutions.map((solution, index) => (
                            <motion.div
                                key={index}
                                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2"
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                custom={index}
                                variants={fadeInUp}
                            >
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    whileInView={{ scale: 1, opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: 0.1 * index }}
                                    className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center text-white mb-6"
                                >
                                    {solution.icon}
                                </motion.div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{solution.title}</h3>
                                <p className="text-gray-600 mb-4">{solution.desc}</p>
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
        </div>
    );
};


// Features Section
const FeaturesSection = () => {

    return (
        <div id="features">
            {/* Main Features */}
            <div className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
                <div className="container mx-auto px-6">
                    <motion.div
                        className="text-center mb-20"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                    >
                        <div className="inline-block bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                            Fitur Unggulan
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Tiga Pilar Kekuatan Zosmed</h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Kombinasi sempurna antara otomasi cerdas, AI yang powerful, dan analytics yang mendalam
                        </p>
                    </motion.div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {MainFeatures.map((feature, index) => (
                            <motion.div
                                key={index}
                                className="relative bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all border border-gray-100"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.7, delay: 0.1 * index }}
                            >
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    whileInView={{ scale: 1, opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: 0.1 * index }}
                                    className={`w-20 h-20 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center text-white mb-6 mx-auto hover:scale-110 transition-transform`}
                                >
                                    {feature.icon}
                                </motion.div>
                                <div className="absolute -top-3 left-6">
                                    <span className={`bg-gradient-to-r ${feature.color} text-white px-4 py-2 rounded-full text-sm font-semibold`}>
                                        Fitur Utama
                                    </span>
                                </div>

                                <div className="text-center mb-6">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                                    <p className="text-gray-600">{feature.desc}</p>
                                </div>

                                <div className="space-y-3 mb-6">
                                    {feature.benefits.map((benefit, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, x: -20 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 0.5, delay: 0.2 + 0.05 * idx }}
                                            className="flex items-center text-gray-700"
                                        >
                                            <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                                            <span className="text-sm">{benefit}</span>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* <motion.button
                                    className="w-full bg-gray-900 text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition-all group"
                                    whileHover={{ scale: 1.05 }}
                                >
                                    Pelajari Lebih Lanjut
                                    <ArrowRight className="w-4 h-4 ml-2 inline group-hover:translate-x-1 transition-transform" />
                                </motion.button> */}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Additional Features */}
            <div className="py-20 bg-white">
                <div className="container mx-auto px-6">
                    <motion.div
                        className="text-center mb-16"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                    >
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Fitur Pendukung yang Powerful</h2>
                        <p className="text-xl text-gray-600">Lengkapi strategi automation dengan fitur-fitur canggih</p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
                        {AdditionalFeatures.map((feature, index) => (
                            <motion.div
                                key={index}
                                className="bg-gradient-to-br from-gray-50 to-blue-50 p-6 rounded-2xl hover:shadow-lg transition-all hover:-translate-y-1"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: 0.1 * index }}
                            >
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    whileInView={{ scale: 1, opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: 0.1 * index }}
                                    className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center text-white mb-4 hover:scale-110 transition-transform"
                                >
                                    {feature.icon}
                                </motion.div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                                <p className="text-gray-600">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Pricing Section
const PricingSection = () => {
    return (
        <div id="pricing" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
            <div className="container mx-auto px-6">
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                >
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">Pilihan Paket untuk Setiap Kebutuhan</h2>
                    <p className="text-xl text-gray-600">Mulai gratis, upgrade kapan saja. Tidak ada kontrak, tidak ada biaya tersembunyi.</p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {Plans.map((plan, index) => (
                        <motion.div
                            key={index}
                            className={`relative bg-white rounded-2xl shadow-lg p-8 border transition-all hover:-translate-y-2 ${plan.popular ? 'border-blue-500 ring-2 ring-blue-500 ring-opacity-50' : 'border-gray-200'
                                }`}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7, delay: 0.1 * index }}
                        >
                            {plan.popular && (
                                <motion.div
                                    className="absolute -top-4 left-1/2 transform -translate-x-1/2"
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    whileInView={{ scale: 1, opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: 0.2 }}
                                >
                                    <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                                        Paling Populer
                                    </div>
                                </motion.div>
                            )}

                            <div className="text-center mb-8">
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                                <div className="mb-4">
                                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                                    <span className="text-gray-600 ml-2">{plan.period}</span>
                                </div>
                            </div>

                            <ul className="space-y-3 mb-8">
                                {plan.features.map((feature, idx) => (
                                    <motion.li
                                        key={idx}
                                        className="flex items-center text-gray-700"
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.4, delay: 0.1 * idx }}
                                    >
                                        <Check className="w-5 h-5 text-green-500 mr-3" />
                                        {feature}
                                    </motion.li>
                                ))}
                                {plan.notIncluded.map((feature, idx) => (
                                    <motion.li
                                        key={idx}
                                        className="flex items-center text-gray-400"
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.4, delay: 0.1 * (plan.features.length + idx) }}
                                    >
                                        <X className="w-5 h-5 text-gray-400 mr-3" />
                                        {feature}
                                    </motion.li>
                                ))}
                            </ul>

                            {/* <motion.button
                                className={`w-full py-3 rounded-xl font-semibold transition-all hover:scale-105 ${plan.popular
                                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600'
                                    : 'bg-gray-900 text-white hover:bg-gray-800'
                                    }`}
                                whileHover={{ scale: 1.05 }}
                            >
                                {plan.cta}
                            </motion.button> */}
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Social Media Platforms Section
const PlatformsSection = () => {


    return (
        <div id='platforms' className="py-20 bg-white">
            <div className="container mx-auto px-6">
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                >
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">Ekspansi Multi-Platform</h2>
                    <p className="text-xl text-gray-600">Mulai dengan Instagram, kami akan terus menambahkan platform lainnya</p>
                </motion.div>

                <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
                    {Platforms.map((platform, index) => (
                        <motion.div
                            key={index}
                            className="bg-gray-50 p-6 rounded-2xl hover:shadow-lg transition-all hover:-translate-y-1 text-center"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.1 * index }}
                        >
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                whileInView={{ scale: 1, opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.1 * index }}
                                className={`w-16 h-16 bg-gradient-to-r ${platform.color} rounded-2xl flex items-center justify-center text-white mx-auto mb-4 hover:scale-110 transition-transform`}
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
            </div>
        </div>
    );
};

// FAQ Section
const FAQSection = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);



    return (
        <div id="faq" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
            <div className="container mx-auto px-6">
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                >
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">Pertanyaan yang Sering Diajukan</h2>
                    <p className="text-xl text-gray-600">Temukan jawaban untuk semua pertanyaan Anda tentang Zosmed</p>
                </motion.div>

                <div className="max-w-4xl mx-auto">
                    {Faqs.map((faq, index) => (
                        <motion.div
                            key={index}
                            className="mb-6"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.1 * index }}
                        >
                            <div className={`bg-white rounded-2xl shadow-sm hover:shadow-md transition-all border overflow-hidden ${openIndex === index ? 'ring-2 ring-blue-500 ring-opacity-50' : 'border-gray-200'
                                }`}>
                                <button
                                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                    className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                                >
                                    <h3 className="text-lg font-semibold text-gray-900 pr-8">{faq.question}</h3>
                                    <motion.div
                                        initial={false}
                                        animate={{ rotate: openIndex === index ? 180 : 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform`} />
                                    </motion.div>
                                </button>

                                <AnimatePresence initial={false}>
                                    {openIndex === index && (
                                        <motion.div
                                            key="faq-answer"
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.4 }}
                                            className="px-6 pb-6 border-t border-gray-100 overflow-hidden"
                                        >
                                            <p className="text-gray-600 leading-relaxed mt-4">{faq.answer}</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// CTA Section
const CTASection = () => {

    return (
        <div className="py-20 bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-500 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <motion.div
                    className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-2xl animate-pulse"
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1 }}
                ></motion.div>
                <motion.div
                    className="absolute bottom-10 right-10 w-40 h-40 bg-cyan-300 rounded-full blur-2xl animate-pulse"
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.2 }}
                ></motion.div>
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <motion.div
                    className="text-center"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
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
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-3xl mx-auto mb-10">
                        {Benefits.map((benefit, index) => (
                            <motion.div
                                key={index}
                                className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.1 * index }}
                            >
                                <div className="flex items-center space-x-3 text-white">
                                    <div className="flex-shrink-0">{benefit.icon}</div>
                                    <span className="text-sm font-medium">{benefit.text}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <motion.div
                            className="bg-white/20 backdrop-blur-sm border border-white/30 text-white px-8 py-4 rounded-xl font-bold text-lg"
                        >
                            <div className="flex items-center justify-center space-x-2">
                                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                <span>Coming Soon - Join Waiting List</span>
                                <Sparkles className="w-5 h-5" />
                            </div>
                        </motion.div>
                    </div>

                    {/* Trust Indicators */}
                    <motion.div
                        className="mt-12 text-blue-100 text-sm"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                    >
                        <p className="mb-4">✅ Tanpa komitmen jangka panjang • ✅ Cancel kapan saja • ✅ Money back guarantee</p>
                        <div className="flex items-center justify-center space-x-6">
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

// Waitlist Form
const WaitlistForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        businessType: '',
        monthlyBudget: ''
    });
    const [submitted, setSubmitted] = useState(false);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = () => {
        if (formData.name && formData.email) {
            setSubmitted(true);
            setTimeout(() => setSubmitted(false), 5000);
        }
    };



    return (
        <div id="waitinglist" className="py-20 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 opacity-10">
                <motion.div
                    className="absolute top-20 left-20 w-64 h-64 bg-cyan-400 rounded-full blur-3xl animate-pulse"
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1 }}
                ></motion.div>
                <motion.div
                    className="absolute bottom-20 right-20 w-80 h-80 bg-blue-400 rounded-full blur-3xl animate-pulse"
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.2 }}
                ></motion.div>
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        className="text-center mb-16"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                    >
                        <div className="inline-block bg-gradient-to-r from-yellow-400 to-orange-400 text-black px-4 py-2 rounded-full text-sm font-bold mb-6">
                            🎉 EXCLUSIVE BETA PROGRAM
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            Join Waiting List Eksklusif!
                        </h2>
                        <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                            Dapatkan akses pertama ke Zosmed dengan benefit eksklusif yang tidak akan tersedia lagi setelah launch
                        </p>
                    </motion.div>

                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Beta Benefits */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7 }}
                        >
                            <h3 className="text-2xl font-bold text-white mb-8">Benefit Eksklusif</h3>
                            <div className="space-y-6">
                                {BetaBenefits.map((benefit, index) => (
                                    <motion.div
                                        key={index}
                                        className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.5, delay: 0.1 * index }}
                                    >
                                        <div className="flex items-start space-x-4">
                                            <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-black p-2 rounded-xl">
                                                {benefit.icon}
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-semibold text-white mb-2">{benefit.title}</h4>
                                                <p className="text-blue-100">{benefit.desc}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Form */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7 }}
                        >
                            {!submitted ? (
                                <motion.div
                                    className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-8"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.7 }}
                                >
                                    <h3 className="text-2xl font-bold text-white mb-6 text-center">Daftar Eksklusif</h3>

                                    <div className="space-y-4">
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <input
                                                type="text"
                                                placeholder="Nama Lengkap *"
                                                value={formData.name}
                                                onChange={(e) => handleInputChange('name', e.target.value)}
                                                className="w-full px-6 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                            />
                                            <input
                                                type="email"
                                                placeholder="Email Address *"
                                                value={formData.email}
                                                onChange={(e) => handleInputChange('email', e.target.value)}
                                                className="w-full px-6 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                            />
                                        </div>

                                        <input
                                            type="tel"
                                            placeholder="Nomor WhatsApp (opsional)"
                                            value={formData.phone}
                                            onChange={(e) => handleInputChange('phone', e.target.value)}
                                            className="w-full px-6 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                        />

                                        <select
                                            value={formData.businessType}
                                            onChange={(e) => handleInputChange('businessType', e.target.value)}
                                            className="w-full px-6 py-4 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                        >
                                            <option value="" className="text-gray-800">Pilih Jenis Bisnis</option>
                                            <option value="fashion" className="text-gray-800">Fashion & Lifestyle</option>
                                            <option value="food" className="text-gray-800">Food & Beverage</option>
                                            <option value="beauty" className="text-gray-800">Beauty & Skincare</option>
                                            <option value="services" className="text-gray-800">Jasa & Konsultasi</option>
                                            <option value="digital" className="text-gray-800">Digital Products</option>
                                            <option value="other" className="text-gray-800">Lainnya</option>
                                        </select>

                                        <motion.button
                                            onClick={handleSubmit}
                                            className="w-full bg-gradient-to-r from-yellow-400 to-orange-400 text-black px-8 py-4 rounded-xl font-bold text-lg hover:from-yellow-500 hover:to-orange-500 transition-all hover:scale-105 group"
                                            whileHover={{ scale: 1.05 }}

                                        >
                                            🚀 Daftar Waiting List Sekarang
                                            <Trophy className="w-5 h-5 ml-2 inline group-hover:rotate-12 transition-transform" />
                                        </motion.button>
                                    </div>

                                    <p className="text-blue-200 text-sm text-center mt-4">
                                        * Slot terbatas hanya 100 beta tester pertama
                                    </p>
                                </motion.div>
                            ) : (
                                <motion.div
                                    className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-8 rounded-3xl text-center"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.6 }}
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
                                    <p className="text-sm">Cek email Anda untuk informasi lebih lanjut!</p>
                                </motion.div>
                            )}
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Footer
const Footer = () => {


    return (
        <footer className="bg-gray-900 text-white">
            <div className="container mx-auto px-6 py-16">
                <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8">
                    {/* Company Info */}
                    <motion.div
                        className="lg:col-span-2"
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                    >
                        <div className="flex items-center space-x-3 mb-4">
                            <Image src={"/logo.png"} width={40} height={30} alt='' />
                            <span className="text-2xl font-bold">Zosmed</span>
                        </div>
                        <p className="text-gray-400 mb-6 max-w-md">
                            Platform otomasi terdepan yang membantu bisnis mengoptimalkan
                            engagement, meningkatkan konversi, dan menghemat waktu dengan AI yang cerdas.
                        </p>

                        {/* Contact Info */}
                        <div className="space-y-3 mb-6">
                            <div className="flex items-center text-gray-400">
                                <Mail className="w-4 h-4 mr-3" />
                                <span>support@zosmed.com</span>
                            </div>
                            <div className="flex items-center text-gray-400">
                                <MapPin className="w-4 h-4 mr-3" />
                                <span>Karawang, Indonesia</span>
                            </div>
                        </div>

                        {/* Social Links */}
                        <div className="flex space-x-4">
                            <motion.a
                                href="https://www.instagram.com/getzosmed/"
                                className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800"
                                whileHover={{ scale: 1.15, rotate: 10 }}
                            >
                                <Instagram className="w-5 h-5" />
                            </motion.a>
                            <motion.a
                                href="#"
                                className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800"
                                whileHover={{ scale: 1.15, rotate: 10 }}
                            >
                                <Twitter className="w-5 h-5" />
                            </motion.a>
                            <motion.a
                                href="#"
                                className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800"
                                whileHover={{ scale: 1.15, rotate: 10 }}
                            >
                                <Linkedin className="w-5 h-5" />
                            </motion.a>
                        </div>
                    </motion.div>

                    {/* Product Links */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                    >
                        <h4 className="text-lg font-semibold mb-4">Produk</h4>
                        <ul className="space-y-2">
                            {ProductLinks.map((link, index) => (
                                <li key={index}>
                                    <a href={link.href} className="text-gray-400 hover:text-white transition-colors">
                                        {link.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Legal Links */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                    >
                        <h4 className="text-lg font-semibold mb-4">Legal</h4>
                        <ul className="space-y-2">
                            {LegalLinks.map((link, index) => (
                                <li key={index}>
                                    <a href={link.href} className="text-gray-400 hover:text-white transition-colors">
                                        {link.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Support Links */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <h4 className="text-lg font-semibold mb-4">Dukungan</h4>
                        <ul className="space-y-2">
                            {SupportLinks.map((link, index) => (
                                <li key={index}>
                                    <a href={link.href} className="text-gray-400 hover:text-white transition-colors">
                                        {link.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </motion.div>



                </div>

                <div className="border-t border-gray-800 mt-12 pt-8">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <p className="text-gray-400 text-sm">
                            &copy; 2025 Zosmed. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

// Main Landing Page Component
const ZosmedLanding = () => {
    return (
        <div className="min-h-screen">
            <Header />
            <HeroSection />
            <ProblemSolutionSection />
            <FeaturesSection />
            <PricingSection />
            <PlatformsSection />
            <FAQSection />
            <CTASection />
            <WaitlistForm />
            <Footer />
        </div>
    );
};

export default ZosmedLanding;