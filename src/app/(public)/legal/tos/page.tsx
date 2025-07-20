'use client'
import React, { useState } from 'react';
import { FileText, Mail, Phone, MapPin, ArrowLeft, Instagram, Shield, CreditCard, Users, Zap, Crown, AlertTriangle, CheckCircle, X, DollarSign, Clock } from 'lucide-react';
import { AllowedUses, Limitations, OurRights, Plans, ProhibitedUses, Requirements, Responsibilities, Services, TerminationReasons } from '@/data/metadata';

// Motion Div Component (simplified)
const MotionDiv = ({ children, className = "", ...props }: { children: React.ReactNode; className?: string;[key: string]: any }) => {
    return <div className={className} {...props}>{children}</div>;
};

// Header Component
const TermsHeader = () => {
    return (
        <header className="bg-gradient-to-r from-gray-900 via-blue-900 to-blue-800 text-white py-16">
            <div className="container mx-auto px-6">
                <MotionDiv className="flex items-center mb-8">
                    <a href='/' className="flex items-center text-blue-100 hover:text-white transition-colors mr-6">
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Kembali ke Beranda
                    </a>
                </MotionDiv>

                <MotionDiv className="max-w-4xl">
                    <div className="flex items-center mb-6">
                        <FileText className="w-12 h-12 mr-4 text-blue-300" />
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold mb-2">Syarat & Ketentuan</h1>
                            <p className="text-blue-200 text-lg">Terakhir diperbarui: 5 Juli 2025</p>
                        </div>
                    </div>

                    <p className="text-xl text-blue-100 leading-relaxed">
                        Syarat dan ketentuan penggunaan platform otomasi Instagram Zosmed.
                        Dengan menggunakan layanan kami, Anda setuju dengan semua ketentuan di bawah ini.
                    </p>
                </MotionDiv>
            </div>
        </header>
    );
};

// Service Overview Component
const ServiceOverview = () => {

    return (
        <div className="py-16 bg-blue-50">
            <div className="container mx-auto px-6">
                <MotionDiv className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Tentang Layanan Zosmed</h2>
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                        Platform otomasi Instagram yang membantu bisnis menghemat waktu dan meningkatkan engagement
                    </p>
                </MotionDiv>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {Services.map((service, index) => (
                        <MotionDiv key={index} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-4">
                                {service.icon}
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{service.title}</h3>
                            <p className="text-gray-600 text-sm">{service.desc}</p>
                        </MotionDiv>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Eligibility & Account Section
const EligibilitySection = () => {

    return (
        <div className="py-16 bg-white">
            <div className="container mx-auto px-6">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Akun dan Keamanan</h2>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Eligibility */}
                        <div className="bg-green-50 rounded-2xl p-6 border border-green-200">
                            <h3 className="text-xl font-semibold text-green-900 mb-4">Siapa yang Boleh Menggunakan</h3>
                            <ul className="space-y-3">
                                {Requirements.map((req, index) => (
                                    <li key={index} className="flex items-start">
                                        {req.icon}
                                        <span className="text-green-800 ml-2 text-sm">{req.text}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* User Responsibilities */}
                        <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
                            <h3 className="text-xl font-semibold text-blue-900 mb-4">Tanggung Jawab Anda</h3>
                            <ul className="space-y-3">
                                {Responsibilities.map((resp, index) => (
                                    <li key={index} className="flex items-start">
                                        {resp.icon}
                                        <span className="text-blue-800 ml-2 text-sm">{resp.text}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Platform Rights */}
                        <div className="bg-purple-50 rounded-2xl p-6 border border-purple-200">
                            <h3 className="text-xl font-semibold text-purple-900 mb-4">Hak Kami</h3>
                            <ul className="space-y-3">
                                {OurRights.map((right, index) => (
                                    <li key={index} className="flex items-start">
                                        {right.icon}
                                        <span className="text-purple-800 ml-2 text-sm">{right.text}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Pricing Plans Section
const PricingPlansSection = () => {

    return (
        <div className="py-16 bg-gray-50">
            <div className="container mx-auto px-6">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Paket Berlangganan</h2>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {Plans.map((plan, index) => (
                            <MotionDiv key={index} className={`relative ${plan.bgColor} rounded-2xl p-6 border ${plan.borderColor} ${plan.popular ? 'ring-2 ring-blue-500' : ''}`}>
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                        <span className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                                            Paling Populer
                                        </span>
                                    </div>
                                )}

                                <div className="text-center mb-6">
                                    <div className={`w-16 h-16 bg-gradient-to-r ${plan.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                                        <Crown className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                                    <div className="text-2xl font-bold text-gray-900">{plan.price}</div>
                                    <div className="text-gray-600">{plan.period}</div>
                                </div>

                                <ul className="space-y-3">
                                    {plan.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-center text-gray-700">
                                            <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                                            <span className="text-sm">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </MotionDiv>
                        ))}
                    </div>

                    {/* Billing Terms */}
                    <div className="mt-12 bg-white rounded-2xl p-8 shadow-lg">
                        <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                            <CreditCard className="w-6 h-6 mr-2 text-blue-600" />
                            Ketentuan Pembayaran
                        </h3>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-3">Pembayaran</h4>
                                <ul className="space-y-2 text-gray-700 text-sm">
                                    <li>• Tagihan dibayar di muka setiap bulan</li>
                                    <li>• Auto-renewal kecuali dibatalkan</li>
                                    <li>• Payment via kartu kredit, transfer bank, e-wallet</li>
                                    <li>• Bisa batal kapan saja (berlaku akhir periode)</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-3">Kebijakan Refund</h4>
                                <ul className="space-y-2 text-gray-700 text-sm">
                                    <li>• Tidak ada refund untuk bulan berjalan</li>
                                    <li>• Cancellation berlaku di akhir periode</li>
                                    <li>• Data tetap dapat diakses hingga periode berakhir</li>
                                    <li>• Upgrade/downgrade berlaku periode berikutnya</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Usage Rules Section  
const UsageRulesSection = () => {
    return (
        <div className="py-16 bg-white">
            <div className="container mx-auto px-6">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Aturan Penggunaan</h2>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Allowed Uses */}
                        <div className="bg-green-50 rounded-2xl p-8 border border-green-200">
                            <div className="flex items-center mb-6">
                                <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
                                <h3 className="text-xl font-semibold text-green-900">Yang Boleh Dilakukan</h3>
                            </div>
                            <ul className="space-y-4">
                                {AllowedUses.map((use, index) => (
                                    <li key={index} className="flex items-start">
                                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                                        <span className="text-green-800">{use}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Prohibited Uses */}
                        <div className="bg-red-50 rounded-2xl p-8 border border-red-200">
                            <div className="flex items-center mb-6">
                                <X className="w-8 h-8 text-red-600 mr-3" />
                                <h3 className="text-xl font-semibold text-red-900">Yang Tidak Boleh Dilakukan</h3>
                            </div>
                            <ul className="space-y-4">
                                {ProhibitedUses.map((use, index) => (
                                    <li key={index} className="flex items-start">
                                        <X className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                                        <span className="text-red-800">{use}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Instagram Compliance */}
                    <div className="mt-12 bg-blue-50 rounded-2xl p-8 border border-blue-200">
                        <div className="flex items-center mb-6">
                            <Instagram className="w-8 h-8 text-blue-600 mr-3" />
                            <h3 className="text-xl font-semibold text-blue-900">Instagram dan Keamanan</h3>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-semibold text-blue-900 mb-3">Compliance</h4>
                                <ul className="space-y-2 text-blue-800 text-sm">
                                    <li>• Kami mengikuti aturan Instagram API dengan ketat</li>
                                    <li>• Rate limiting diterapkan untuk keamanan akun</li>
                                    <li>• Anda bertanggung jawab atas konten yang diposting</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold text-blue-900 mb-3">Disclaimer</h4>
                                <ul className="space-y-2 text-blue-800 text-sm">
                                    <li>• Jika akun Instagram dibanned, bukan tanggung jawab kami</li>
                                    <li>• Perubahan Instagram API dapat mempengaruhi fitur</li>
                                    <li>• Pastikan mematuhi Instagram Community Guidelines</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Liability & Termination Section
const LiabilitySection = () => {
    return (
        <div className="py-16 bg-gray-50">
            <div className="container mx-auto px-6">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Batasan Tanggung Jawab</h2>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Liability Limitations */}
                        <div className="bg-white rounded-2xl p-8 shadow-lg">
                            <div className="flex items-center mb-6">
                                <AlertTriangle className="w-8 h-8 text-orange-600 mr-3" />
                                <h3 className="text-xl font-semibold text-gray-900">Kami TIDAK Bertanggung Jawab Atas</h3>
                            </div>
                            <ul className="space-y-4">
                                {Limitations.map((limitation, index) => (
                                    <li key={index} className="flex items-start">
                                        <AlertTriangle className="w-5 h-5 text-orange-500 mr-3 mt-0.5 flex-shrink-0" />
                                        <span className="text-gray-700">{limitation}</span>
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
                                <p className="text-orange-800 text-sm">
                                    <strong>Maksimal Tanggung Jawab:</strong> Jumlah yang Anda bayar dalam 12 bulan terakhir.
                                </p>
                            </div>
                        </div>

                        {/* Termination */}
                        <div className="bg-white rounded-2xl p-8 shadow-lg">
                            <div className="flex items-center mb-6">
                                <Clock className="w-8 h-8 text-red-600 mr-3" />
                                <h3 className="text-xl font-semibold text-gray-900">Penghentian Layanan</h3>
                            </div>
                            <ul className="space-y-4">
                                {TerminationReasons.map((reason, index) => (
                                    <li key={index} className="flex items-start">
                                        <Clock className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                                        <span className="text-gray-700">{reason}</span>
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200">
                                <p className="text-red-800 text-sm">
                                    <strong>Efek Penghentian:</strong> Akses dihentikan, data dihapus sesuai kebijakan, tagihan outstanding tetap berlaku.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Contact Section
const ContactSection = () => {
    return (
        <div className="py-16 bg-gradient-to-r from-gray-900 to-blue-900">
            <div className="container mx-auto px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl font-bold text-white mb-4">Butuh Bantuan atau Ada Pertanyaan?</h2>
                    <p className="text-blue-100 text-lg mb-8">
                        Tim customer support kami siap membantu Anda memahami syarat dan ketentuan ini.
                    </p>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                            <Mail className="w-8 h-8 text-blue-300 mx-auto mb-3" />
                            <h3 className="text-white font-semibold mb-2">Customer Support</h3>
                            <p className="text-blue-100 text-sm">support@zosmed.com</p>
                        </div>

                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                            <FileText className="w-8 h-8 text-blue-300 mx-auto mb-3" />
                            <h3 className="text-white font-semibold mb-2">Legal</h3>
                            <p className="text-blue-100 text-sm">legal@zosmed.com</p>
                        </div>

                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                            <Phone className="w-8 h-8 text-blue-300 mx-auto mb-3" />
                            <h3 className="text-white font-semibold mb-2">WhatsApp</h3>
                            <p className="text-blue-100 text-sm">+62 878 8784 3622</p>
                        </div>

                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                            <MapPin className="w-8 h-8 text-blue-300 mx-auto mb-3" />
                            <h3 className="text-white font-semibold mb-2">Alamat</h3>
                            <p className="text-blue-100 text-sm">Karawang, Indonesia</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Main Terms Page Component
const TermsConditionsPage = () => {
    return (
        <div className="min-h-screen bg-white">
            <TermsHeader />
            <ServiceOverview />
            <EligibilitySection />
            <PricingPlansSection />
            <UsageRulesSection />
            <LiabilitySection />
            <ContactSection />

            {/* Footer Agreement */}
            <div className="bg-gray-900 py-8">
                <div className="container mx-auto px-6 text-center">
                    <div className="max-w-4xl mx-auto">
                        <p className="text-gray-300 text-sm mb-4">
                            <strong>Perubahan Syarat:</strong> Syarat dan ketentuan ini dapat berubah sewaktu-waktu.
                            Perubahan material akan diberitahu 30 hari sebelumnya melalui email atau notifikasi platform.
                        </p>
                        <p className="text-gray-400 text-sm">
                            Dengan mendaftar dan menggunakan Zosmed, Anda acknowledge bahwa telah membaca,
                            memahami, dan setuju untuk terikat dengan syarat dan ketentuan ini.
                        </p>
                        <div className="mt-4 pt-4 border-t border-gray-700">
                            <p className="text-gray-500 text-xs">
                                Syarat ini diatur oleh hukum Indonesia dan yurisdiksi Pengadilan Jakarta.
                                Effective Date: 5 Juli 2025
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TermsConditionsPage;