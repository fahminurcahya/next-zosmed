'use client'
import { useState } from 'react';
import { ChevronDown, ChevronRight, Instagram, AlertCircle, CheckCircle, ExternalLink, ArrowLeft, Search, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import Image from 'next/image';

interface FAQItem {
    question: string;
    answer: string;
    category: 'setup' | 'troubleshooting' | 'requirements';
}

const faqData: FAQItem[] = [
    {
        question: "Mengapa saya tidak bisa menghubungkan akun Instagram Personal?",
        answer: "Zosmed hanya mendukung Instagram Business dan Creator Account karena API Instagram membatasi akses untuk akun personal. Anda perlu mengkonversi akun ke Business Account terlebih dahulu.",
        category: 'requirements'
    },
    {
        question: "Apakah aman menghubungkan akun Instagram saya?",
        answer: "Ya, sangat aman. Kami menggunakan OAuth 2.0 resmi dari Instagram dan hanya meminta permission yang diperlukan. Token akses Anda dienkripsi dan disimpan dengan aman.",
        category: 'setup'
    },
    {
        question: "Berapa lama token Instagram akan bertahan?",
        answer: "Token Instagram bertahan selama 60 hari. Sistem kami akan otomatis memperbarui token sebelum expired, dan Anda akan mendapat notifikasi jika ada masalah.",
        category: 'setup'
    },
    {
        question: "Mengapa muncul error 'Permission denied'?",
        answer: "Pastikan Anda memberikan semua permission yang diminta saat proses OAuth. Jika masih bermasalah, coba disconnect dan connect ulang akun Instagram Anda.",
        category: 'troubleshooting'
    },
    {
        question: "Bisakah saya menghubungkan multiple akun Instagram?",
        answer: "Ya, Anda bisa menghubungkan multiple akun sesuai dengan limit paket subscription Anda. Free: 1 akun, Starter: 3 akun, Pro: 10 akun.",
        category: 'setup'
    }
];

const InstagramConnectionHelpPage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

    const filteredFAQs = faqData.filter(faq => {
        const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center gap-4 mb-4">
                        <Link href="/help" className="text-gray-500 hover:text-gray-700">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                                <Instagram className="w-8 h-8 text-pink-500" />
                                Panduan Menghubungkan Instagram
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Pelajari cara menghubungkan akun Instagram Business Anda dengan Zosmed
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="grid lg:grid-cols-4 gap-8">
                    {/* Sidebar Navigation */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-4">
                            <CardHeader>
                                <CardTitle className="text-lg">Daftar Isi</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <a href="#requirements" className="block text-sm text-blue-600 hover:underline">
                                    Persyaratan Akun
                                </a>
                                <a href="#step-by-step" className="block text-sm text-blue-600 hover:underline">
                                    Langkah-langkah Koneksi
                                </a>
                                <a href="#convert-business" className="block text-sm text-blue-600 hover:underline">
                                    Mengkonversi ke Business Account
                                </a>
                                <a href="#troubleshooting" className="block text-sm text-blue-600 hover:underline">
                                    Troubleshooting
                                </a>
                                <a href="#permissions" className="block text-sm text-blue-600 hover:underline">
                                    Permission yang Diperlukan
                                </a>
                                <a href="#faq" className="block text-sm text-blue-600 hover:underline">
                                    FAQ
                                </a>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3 space-y-8">
                        {/* Requirements Section */}
                        <section id="requirements">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <CheckCircle className="w-6 h-6 text-green-500" />
                                        Persyaratan Akun Instagram
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Alert className="mb-6">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>
                                            <strong>Penting:</strong> Hanya Instagram Business atau Creator Account yang bisa dihubungkan ke Zosmed.
                                        </AlertDescription>
                                    </Alert>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <h3 className="font-semibold text-green-700">✅ Akun yang Didukung</h3>
                                            <ul className="space-y-2 text-sm">
                                                <li className="flex items-start gap-2">
                                                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                    <span>Instagram Business Account</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                    <span>Instagram Creator Account</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                    <span>Akun yang terhubung dengan Facebook Page</span>
                                                </li>
                                            </ul>
                                        </div>

                                        <div className="space-y-4">
                                            <h3 className="font-semibold text-red-700">❌ Akun yang Tidak Didukung</h3>
                                            <ul className="space-y-2 text-sm">
                                                <li className="flex items-start gap-2">
                                                    <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                                                    <span>Instagram Personal Account</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                                                    <span>Akun yang tidak terhubung Facebook</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                                                    <span>Akun yang di-suspend Instagram</span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </section>

                        {/* Step by Step Guide */}
                        <section id="step-by-step">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <BookOpen className="w-6 h-6 text-blue-500" />
                                        Langkah-langkah Menghubungkan Instagram
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-6">
                                        {/* Step 1 */}
                                        <div className="flex gap-4">
                                            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                <span className="text-sm font-semibold text-blue-600">1</span>
                                            </div>
                                            <div>
                                                <h3 className="font-semibold mb-2">Buka Halaman Integrasi</h3>
                                                <p className="text-gray-600 text-sm mb-3">
                                                    Dari dashboard Zosmed, klik menu "Integrasi" atau saat proses onboarding di step Instagram.
                                                </p>
                                                <div className="bg-gray-50 p-3 rounded-lg">
                                                    <code className="text-sm">Dashboard → Integrasi → Hubungkan Instagram</code>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Step 2 */}
                                        <div className="flex gap-4">
                                            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                <span className="text-sm font-semibold text-blue-600">2</span>
                                            </div>
                                            <div>
                                                <h3 className="font-semibold mb-2">Klik "Hubungkan Instagram"</h3>
                                                <p className="text-gray-600 text-sm mb-3">
                                                    Akan muncul popup baru yang mengarah ke halaman login Instagram.
                                                </p>
                                                <Alert className="bg-yellow-50 border-yellow-200">
                                                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                                                    <AlertDescription className="text-yellow-700">
                                                        Pastikan popup blocker tidak aktif untuk domain Instagram.
                                                    </AlertDescription>
                                                </Alert>
                                            </div>
                                        </div>

                                        {/* Step 3 */}
                                        <div className="flex gap-4">
                                            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                <span className="text-sm font-semibold text-blue-600">3</span>
                                            </div>
                                            <div>
                                                <h3 className="font-semibold mb-2">Login ke Instagram</h3>
                                                <p className="text-gray-600 text-sm mb-3">
                                                    Masukkan username dan password Instagram Business/Creator Account Anda.
                                                </p>
                                            </div>
                                        </div>

                                        {/* Step 4 */}
                                        <div className="flex gap-4">
                                            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                <span className="text-sm font-semibold text-blue-600">4</span>
                                            </div>
                                            <div>
                                                <h3 className="font-semibold mb-2">Berikan Permission</h3>
                                                <p className="text-gray-600 text-sm mb-3">
                                                    Instagram akan menampilkan daftar permission yang diminta. Klik "Allow" untuk semua permission.
                                                </p>
                                                <div className="bg-blue-50 p-4 rounded-lg">
                                                    <h4 className="font-medium text-blue-900 mb-2">Permission yang Diminta:</h4>
                                                    <ul className="text-sm text-blue-700 space-y-1">
                                                        <li>• Baca profil dasar</li>
                                                        <li>• Baca dan balas pesan DM</li>
                                                        <li>• Baca dan balas komentar</li>
                                                        <li>• Akses daftar media posts</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Step 5 */}
                                        <div className="flex gap-4">
                                            <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                                <CheckCircle className="w-4 h-4 text-green-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold mb-2">Koneksi Berhasil</h3>
                                                <p className="text-gray-600 text-sm">
                                                    Popup akan tertutup otomatis dan akun Instagram Anda akan muncul di daftar akun terhubung.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </section>

                        {/* Convert to Business Account */}
                        <section id="convert-business">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Instagram className="w-6 h-6 text-pink-500" />
                                        Cara Mengkonversi ke Business Account
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Alert className="mb-6 bg-blue-50 border-blue-200">
                                        <AlertCircle className="h-4 w-4 text-blue-600" />
                                        <AlertDescription className="text-blue-700">
                                            Jika akun Anda masih Personal Account, ikuti langkah berikut untuk mengkonversi ke Business Account.
                                        </AlertDescription>
                                    </Alert>

                                    <div className="space-y-4">
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div>
                                                <h3 className="font-semibold mb-3">Melalui App Instagram:</h3>
                                                <ol className="space-y-2 text-sm">
                                                    <li>1. Buka aplikasi Instagram</li>
                                                    <li>2. Pergi ke Profile → Menu (☰)</li>
                                                    <li>3. Pilih "Settings and Privacy"</li>
                                                    <li>4. Pilih "Account Type and Tools"</li>
                                                    <li>5. Pilih "Switch to Professional Account"</li>
                                                    <li>6. Pilih "Business" → Continue</li>
                                                    <li>7. Lengkapi informasi bisnis</li>
                                                </ol>
                                            </div>
                                            <div>
                                                <h3 className="font-semibold mb-3">Persyaratan Business Account:</h3>
                                                <ul className="space-y-2 text-sm">
                                                    <li className="flex items-start gap-2">
                                                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                                                        <span>Harus memiliki Facebook Page</span>
                                                    </li>
                                                    <li className="flex items-start gap-2">
                                                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                                                        <span>Informasi kontak bisnis lengkap</span>
                                                    </li>
                                                    <li className="flex items-start gap-2">
                                                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                                                        <span>Kategori bisnis yang valid</span>
                                                    </li>
                                                    <li className="flex items-start gap-2">
                                                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                                                        <span>Bio yang menjelaskan bisnis</span>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>

                                        <div className="bg-green-50 p-4 rounded-lg">
                                            <h4 className="font-medium text-green-900 mb-2">💡 Tips:</h4>
                                            <ul className="text-sm text-green-700 space-y-1">
                                                <li>• Konversi gratis dan bisa dikembalikan ke Personal jika diperlukan</li>
                                                <li>• Business Account mendapat akses ke Instagram Insights</li>
                                                <li>• Bisa menambahkan tombol kontak dan informasi bisnis</li>
                                            </ul>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </section>

                        {/* Permissions Section */}
                        <section id="permissions">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Permission yang Diperlukan</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <h3 className="font-semibold mb-3 text-green-700">✅ Permission Wajib</h3>
                                            <div className="space-y-3">
                                                <div className="border-l-4 border-green-400 pl-4">
                                                    <h4 className="font-medium">instagram_basic</h4>
                                                    <p className="text-sm text-gray-600">Akses profil dasar dan informasi akun</p>
                                                </div>
                                                <div className="border-l-4 border-green-400 pl-4">
                                                    <h4 className="font-medium">instagram_manage_messages</h4>
                                                    <p className="text-sm text-gray-600">Baca dan kirim pesan DM</p>
                                                </div>
                                                <div className="border-l-4 border-green-400 pl-4">
                                                    <h4 className="font-medium">instagram_manage_comments</h4>
                                                    <p className="text-sm text-gray-600">Baca dan balas komentar</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="font-semibold mb-3 text-blue-700">ℹ️ Permission Opsional</h3>
                                            <div className="space-y-3">
                                                <div className="border-l-4 border-blue-400 pl-4">
                                                    <h4 className="font-medium">pages_show_list</h4>
                                                    <p className="text-sm text-gray-600">Akses daftar Facebook Pages</p>
                                                </div>
                                                <div className="border-l-4 border-blue-400 pl-4">
                                                    <h4 className="font-medium">instagram_content_publish</h4>
                                                    <p className="text-sm text-gray-600">Publish konten (fitur masa depan)</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <Alert className="mt-6">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>
                                            <strong>Penting:</strong> Jika Anda menolak salah satu permission wajib, koneksi akan gagal.
                                            Anda bisa disconnect dan reconnect untuk memberikan permission yang diperlukan.
                                        </AlertDescription>
                                    </Alert>
                                </CardContent>
                            </Card>
                        </section>

                        {/* Troubleshooting */}
                        <section id="troubleshooting">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <AlertCircle className="w-6 h-6 text-orange-500" />
                                        Troubleshooting
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-6">
                                        <div className="border border-red-200 rounded-lg p-4">
                                            <h3 className="font-semibold text-red-700 mb-2">❌ Error: "Account type not supported"</h3>
                                            <p className="text-sm mb-3">Akun Instagram Anda adalah Personal Account.</p>
                                            <div className="bg-red-50 p-3 rounded">
                                                <strong className="text-sm">Solusi:</strong>
                                                <ul className="text-sm mt-1 space-y-1">
                                                    <li>• Konversi akun ke Business/Creator Account</li>
                                                    <li>• Pastikan terhubung dengan Facebook Page</li>
                                                </ul>
                                            </div>
                                        </div>

                                        <div className="border border-orange-200 rounded-lg p-4">
                                            <h3 className="font-semibold text-orange-700 mb-2">⚠️ Error: "Permission denied"</h3>
                                            <p className="text-sm mb-3">Tidak semua permission diberikan saat OAuth.</p>
                                            <div className="bg-orange-50 p-3 rounded">
                                                <strong className="text-sm">Solusi:</strong>
                                                <ul className="text-sm mt-1 space-y-1">
                                                    <li>• Disconnect akun dari halaman Integrasi</li>
                                                    <li>• Connect ulang dan berikan semua permission</li>
                                                    <li>• Pastikan tidak ada popup blocker</li>
                                                </ul>
                                            </div>
                                        </div>

                                        <div className="border border-yellow-200 rounded-lg p-4">
                                            <h3 className="font-semibold text-yellow-700 mb-2">⚠️ Warning: "Token expiring soon"</h3>
                                            <p className="text-sm mb-3">Token Instagram akan expire dalam 7 hari.</p>
                                            <div className="bg-yellow-50 p-3 rounded">
                                                <strong className="text-sm">Solusi:</strong>
                                                <ul className="text-sm mt-1 space-y-1">
                                                    <li>• Klik tombol "Refresh Token" di halaman Integrasi</li>
                                                    <li>• Sistem akan otomatis memperbarui token</li>
                                                </ul>
                                            </div>
                                        </div>

                                        <div className="border border-blue-200 rounded-lg p-4">
                                            <h3 className="font-semibold text-blue-700 mb-2">ℹ️ Info: "Connection successful but no data"</h3>
                                            <p className="text-sm mb-3">Akun terhubung tapi tidak ada data DM/komentar.</p>
                                            <div className="bg-blue-50 p-3 rounded">
                                                <strong className="text-sm">Penjelasan:</strong>
                                                <ul className="text-sm mt-1 space-y-1">
                                                    <li>• Normal jika akun baru atau tidak ada aktivitas</li>
                                                    <li>• Data akan muncul setelah ada DM/komentar baru</li>
                                                    <li>• Webhook Instagram perlu waktu untuk aktif</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </section>

                        {/* FAQ Section */}
                        <section id="faq">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Search className="w-6 h-6 text-purple-500" />
                                        Frequently Asked Questions
                                    </CardTitle>
                                    <div className="space-y-4">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                            <Input
                                                placeholder="Cari pertanyaan..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="pl-9"
                                            />
                                        </div>
                                        <div className="flex gap-2 flex-wrap">
                                            <Button
                                                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => setSelectedCategory('all')}
                                            >
                                                Semua
                                            </Button>
                                            <Button
                                                variant={selectedCategory === 'setup' ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => setSelectedCategory('setup')}
                                            >
                                                Setup
                                            </Button>
                                            <Button
                                                variant={selectedCategory === 'requirements' ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => setSelectedCategory('requirements')}
                                            >
                                                Requirements
                                            </Button>
                                            <Button
                                                variant={selectedCategory === 'troubleshooting' ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => setSelectedCategory('troubleshooting')}
                                            >
                                                Troubleshooting
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {filteredFAQs.length === 0 ? (
                                            <div className="text-center py-8 text-gray-500">
                                                <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                                <p>Tidak ada FAQ yang cocok dengan pencarian Anda.</p>
                                            </div>
                                        ) : (
                                            filteredFAQs.map((faq, index) => (
                                                <div key={index} className="border border-gray-200 rounded-lg">
                                                    <button
                                                        className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50"
                                                        onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <Badge variant="outline" className="text-xs">
                                                                {faq.category === 'setup' && 'Setup'}
                                                                {faq.category === 'requirements' && 'Requirements'}
                                                                {faq.category === 'troubleshooting' && 'Troubleshooting'}
                                                            </Badge>
                                                            <span className="font-medium">{faq.question}</span>
                                                        </div>
                                                        {expandedFAQ === index ? (
                                                            <ChevronDown className="w-5 h-5 text-gray-400" />
                                                        ) : (
                                                            <ChevronRight className="w-5 h-5 text-gray-400" />
                                                        )}
                                                    </button>
                                                    {expandedFAQ === index && (
                                                        <div className="px-4 pb-3 text-gray-600 text-sm border-t">
                                                            <div className="pt-3">{faq.answer}</div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </section>

                        {/* Contact Support */}
                        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                            <CardContent className="pt-6">
                                <div className="text-center">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                        Masih Butuh Bantuan?
                                    </h3>
                                    <p className="text-gray-600 mb-6">
                                        Tim support kami siap membantu Anda mengatasi masalah koneksi Instagram
                                    </p>
                                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                        <Button asChild className="bg-blue-600 hover:bg-blue-700">
                                            <Link href="/support">
                                                Hubungi Support
                                            </Link>
                                        </Button>
                                        <Button variant="outline" asChild>
                                            <Link href="/help">
                                                <ArrowLeft className="w-4 h-4 mr-2" />
                                                Kembali ke Help Center
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Related Articles */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Artikel Terkait</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <Link href="/help/getting-started" className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                                        <h4 className="font-medium mb-2">Panduan Memulai Zosmed</h4>
                                        <p className="text-sm text-gray-600">Pelajari dasar-dasar menggunakan Zosmed dari awal</p>
                                    </Link>
                                    <Link href="/help/workflows" className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                                        <h4 className="font-medium mb-2">Cara Membuat Workflow</h4>
                                        <p className="text-sm text-gray-600">Tutorial lengkap membuat workflow otomasi DM dan komentar</p>
                                    </Link>
                                    <Link href="/help/automation-rules" className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                                        <h4 className="font-medium mb-2">Aturan Otomasi Instagram</h4>
                                        <p className="text-sm text-gray-600">Pahami batasan dan aturan otomasi Instagram</p>
                                    </Link>
                                    <Link href="/help/subscription-plans" className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                                        <h4 className="font-medium mb-2">Paket Berlangganan</h4>
                                        <p className="text-sm text-gray-600">Informasi lengkap tentang fitur setiap paket</p>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InstagramConnectionHelpPage;