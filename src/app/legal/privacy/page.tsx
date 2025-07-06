import React from 'react';
import { Shield, Mail, Phone, MapPin, ArrowLeft, Eye, Lock, Database, Users, FileText, CheckCircle } from 'lucide-react';
import { Highlights } from '@/data/metadata';

// Motion Div Component (simplified)
const MotionDiv = ({ children, className = "", ...props }: { children: React.ReactNode; className?: string;[key: string]: any }) => {
    return <div className={className} {...props}>{children}</div>;
};

// Header Component
const PrivacyHeader = () => {
    return (
        <header className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-16">
            <div className="container mx-auto px-6">
                <MotionDiv className="flex items-center mb-8">
                    <a href='/' className="flex items-center text-blue-100 hover:text-white transition-colors mr-6">
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Kembali ke Beranda
                    </a>
                </MotionDiv>

                <MotionDiv className="max-w-4xl">
                    <div className="flex items-center mb-6">
                        <Shield className="w-12 h-12 mr-4 text-cyan-200" />
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold mb-2">Kebijakan Privasi</h1>
                            <p className="text-blue-100 text-lg">Terakhir diperbarui: 5 Juli 2025</p>
                        </div>
                    </div>

                    <p className="text-xl text-blue-100 leading-relaxed">
                        Kami berkomitmen melindungi privasi dan keamanan data Anda.
                        Kebijakan ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi Anda.
                    </p>
                </MotionDiv>
            </div>
        </header>
    );
};

// Quick Summary Component
const QuickSummary = () => {

    return (
        <div className="py-16 bg-gray-50">
            <div className="container mx-auto px-6">
                <MotionDiv className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Ringkasan Singkat</h2>
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                        Prinsip utama kami dalam menangani data pribadi Anda
                    </p>
                </MotionDiv>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {Highlights.map((item, index) => (
                        <MotionDiv key={index} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                            <div className={`w-12 h-12 bg-gradient-to-r ${item.color} rounded-xl flex items-center justify-center text-white mb-4`}>
                                {item.icon}
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                            <p className="text-gray-600 text-sm">{item.desc}</p>
                        </MotionDiv>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Main Content Component
const PrivacyContent = () => {
    const sections = [
        {
            id: "data-collection",
            title: "Data yang Kami Kumpulkan",
            icon: <Database className="w-6 h-6" />,
            content: (
                <div className="space-y-6">
                    <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">Informasi Akun</h4>
                        <ul className="space-y-2 text-gray-700">
                            <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" />Nama, email, nomor telepon</li>
                            <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" />Password (dienkripsi)</li>
                            <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" />Foto profil</li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">Data Instagram</h4>
                        <ul className="space-y-2 text-gray-700">
                            <li className="flex items-center"><CheckCircle className="w-4 h-4 text-blue-500 mr-2" />Username dan info profil Instagram</li>
                            <li className="flex items-center"><CheckCircle className="w-4 h-4 text-blue-500 mr-2" />Komentar dan direct messages yang diproses</li>
                            <li className="flex items-center"><CheckCircle className="w-4 h-4 text-blue-500 mr-2" />Data interaksi dan engagement</li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">Data Teknis</h4>
                        <ul className="space-y-2 text-gray-700">
                            <li className="flex items-center"><CheckCircle className="w-4 h-4 text-purple-500 mr-2" />Cara Anda menggunakan platform kami</li>
                            <li className="flex items-center"><CheckCircle className="w-4 h-4 text-purple-500 mr-2" />Log aktivitas untuk keamanan</li>
                        </ul>
                    </div>
                </div>
            )
        },
        {
            id: "data-usage",
            title: "Cara Kami Menggunakan Data",
            icon: <Eye className="w-6 h-6" />,
            content: (
                <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-blue-900 mb-2">Menyediakan Layanan</h4>
                        <p className="text-blue-800">Menjalankan otomasi Instagram dan fitur-fitur platform</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-green-900 mb-2">Meningkatkan Platform</h4>
                        <p className="text-green-800">Menganalisis penggunaan untuk mengembangkan fitur baru</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-purple-900 mb-2">Komunikasi</h4>
                        <p className="text-purple-800">Mengirim notifikasi penting dan customer support</p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-orange-900 mb-2">Keamanan</h4>
                        <p className="text-orange-800">Mencegah penyalahgunaan dan melindungi platform</p>
                    </div>
                </div>
            )
        },
        {
            id: "data-storage",
            title: "Penyimpanan Data",
            icon: <Lock className="w-6 h-6" />,
            content: (
                <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-gray-900 mb-2">Lokasi</h4>
                            <p className="text-gray-700">Server aman di Indonesia</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-gray-900 mb-2">Enkripsi</h4>
                            <p className="text-gray-700">Dienkripsi saat disimpan dan dikirim</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-gray-900 mb-2">Durasi</h4>
                            <p className="text-gray-700">Selama akun aktif + 2 tahun setelah dihapus</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-gray-900 mb-2">Instagram Data</h4>
                            <p className="text-gray-700">Dihapus otomatis setelah 90 hari tidak aktif</p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: "data-sharing",
            title: "Berbagi Data",
            icon: <Users className="w-6 h-6" />,
            content: (
                <div>
                    <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-6">
                        <h4 className="font-semibold text-red-900 mb-2">❌ Kami TIDAK Menjual Data Anda</h4>
                        <p className="text-red-800">Data pribadi Anda tidak pernah dijual atau disewakan ke pihak ketiga untuk tujuan komersial.</p>
                    </div>

                    <h4 className="font-semibold text-gray-900 mb-4">Data hanya dibagikan dengan:</h4>
                    <div className="space-y-3">
                        <div className="flex items-start">
                            <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                            <div>
                                <h5 className="font-medium text-gray-900">Instagram</h5>
                                <p className="text-gray-600 text-sm">Untuk menjalankan otomasi sesuai kebijakan mereka</p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                            <div>
                                <h5 className="font-medium text-gray-900">Payment Processor</h5>
                                <p className="text-gray-600 text-sm">Untuk memproses pembayaran dengan aman</p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                            <div>
                                <h5 className="font-medium text-gray-900">Pihak Berwenang</h5>
                                <p className="text-gray-600 text-sm">Hanya jika diwajibkan oleh hukum</p>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: "user-rights",
            title: "Hak Anda",
            icon: <FileText className="w-6 h-6" />,
            content: (
                <div>
                    <p className="text-gray-700 mb-6">Sebagai pengguna, Anda memiliki hak penuh atas data pribadi:</p>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-blue-900 mb-2">👁️ Melihat Data</h4>
                            <p className="text-blue-800 text-sm">Akses lengkap ke semua data yang kami simpan</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-green-900 mb-2">✏️ Mengubah Data</h4>
                            <p className="text-green-800 text-sm">Update atau perbaiki informasi kapan saja</p>
                        </div>
                        <div className="bg-red-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-red-900 mb-2">🗑️ Menghapus Data</h4>
                            <p className="text-red-800 text-sm">Hapus akun dan semua data yang terkait</p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-purple-900 mb-2">📥 Mengunduh Data</h4>
                            <p className="text-purple-800 text-sm">Export data dalam format yang mudah dibaca</p>
                        </div>
                    </div>

                    <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-yellow-800">
                            <strong>Cara menggunakan hak ini:</strong> Hubungi kami di privacy@zosmed.com atau melalui pengaturan akun Anda.
                        </p>
                    </div>
                </div>
            )
        }
    ];

    return (
        <div className="py-16 bg-white">
            <div className="container mx-auto px-6">
                <div className="max-w-4xl mx-auto">
                    {sections.map((section, index) => (
                        <MotionDiv key={section.id} className="mb-12">
                            <div className="flex items-center mb-6">
                                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mr-4">
                                    {section.icon}
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">{section.title}</h2>
                            </div>
                            <div className="bg-gray-50 rounded-2xl p-8">
                                {section.content}
                            </div>
                        </MotionDiv>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Additional Info Component
const AdditionalInfo = () => {
    return (
        <div className="py-16 bg-gray-50">
            <div className="container mx-auto px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Security */}
                        <div className="bg-white rounded-2xl p-8 shadow-lg">
                            <div className="flex items-center mb-4">
                                <Shield className="w-8 h-8 text-green-600 mr-3" />
                                <h3 className="text-xl font-bold text-gray-900">Keamanan</h3>
                            </div>
                            <ul className="space-y-3 text-gray-700">
                                <li className="flex items-center">
                                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                                    Enkripsi tingkat bank untuk melindungi data
                                </li>
                                <li className="flex items-center">
                                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                                    Akses terbatas hanya untuk tim yang berwenang
                                </li>
                                <li className="flex items-center">
                                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                                    Monitoring keamanan 24/7
                                </li>
                                <li className="flex items-center">
                                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                                    Update keamanan berkala
                                </li>
                            </ul>
                        </div>

                        {/* Cookies */}
                        <div className="bg-white rounded-2xl p-8 shadow-lg">
                            <div className="flex items-center mb-4">
                                <Database className="w-8 h-8 text-blue-600 mr-3" />
                                <h3 className="text-xl font-bold text-gray-900">Cookies</h3>
                            </div>
                            <p className="text-gray-700 mb-4">Kami menggunakan cookies untuk:</p>
                            <ul className="space-y-2 text-gray-700">
                                <li className="flex items-center">
                                    <CheckCircle className="w-4 h-4 text-blue-500 mr-2" />
                                    Login dan preferensi akun
                                </li>
                                <li className="flex items-center">
                                    <CheckCircle className="w-4 h-4 text-blue-500 mr-2" />
                                    Analytics penggunaan website
                                </li>
                                <li className="flex items-center">
                                    <CheckCircle className="w-4 h-4 text-blue-500 mr-2" />
                                    Meningkatkan pengalaman pengguna
                                </li>
                            </ul>
                            <p className="text-sm text-gray-600 mt-3">
                                Anda dapat mengatur cookies di browser Anda.
                            </p>
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
        <div className="py-16 bg-gradient-to-r from-blue-600 to-cyan-500">
            <div className="container mx-auto px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl font-bold text-white mb-4">Ada Pertanyaan Tentang Privasi?</h2>
                    <p className="text-blue-100 text-lg mb-8">
                        Tim kami siap membantu menjawab pertanyaan Anda tentang kebijakan privasi dan penggunaan data.
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

                    <div className="mt-8 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                        <p className="text-blue-100 text-sm">
                            <strong>Respon Time:</strong> Kami akan merespon pertanyaan privasi Anda dalam 24 jam kerja.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Main Privacy Policy Page Component
const PrivacyPolicyPage = () => {
    return (
        <div className="min-h-screen bg-white">
            <PrivacyHeader />
            <QuickSummary />
            <PrivacyContent />
            <AdditionalInfo />
            <ContactSection />

            {/* Footer Note */}
            <div className="bg-gray-900 py-8">
                <div className="container mx-auto px-6 text-center">
                    <p className="text-gray-400 text-sm">
                        Dengan menggunakan Zosmed, Anda setuju dengan kebijakan privasi ini.
                        Kebijakan ini dapat berubah dari waktu ke waktu dan akan kami beritahukan jika ada perubahan penting.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicyPage;