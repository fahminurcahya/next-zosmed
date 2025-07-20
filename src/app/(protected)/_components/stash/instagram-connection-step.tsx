// 'use client'
// import { useEffect, useState } from "react";
// import type { InstagramAccount } from "../types/onboarding.type";
// import { api } from "@/trpc/react";
// import { MotionDiv } from "./motion-div";
// import { AlertCircle, CheckCircle, Instagram, Loader2, Lock, Play, Shield, X, Zap } from "lucide-react";
// import { Card, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";

// interface InstagramStepProps {
//     onNext: () => void;
//     connectedAccounts: InstagramAccount[];
//     setConnectedAccounts: (accounts: InstagramAccount[]) => void;
// }

// const InstagramStep: React.FC<InstagramStepProps> = ({ onNext, connectedAccounts, setConnectedAccounts }) => {
//     const [isConnecting, setIsConnecting] = useState(false);
//     const [showDemo, setShowDemo] = useState(false);
//     const [connectionError, setConnectionError] = useState<string | null>(null);

//     // tRPC queries and mutations for Instagram
//     const { data: existingAccounts } = api.instagram.getConnectedAccounts.useQuery();
//     const getConnectUrlMutation = api.instagram.getConnectUrl.useMutation();

//     // Check if user already has connected accounts
//     useEffect(() => {
//         if (existingAccounts?.accounts && existingAccounts.accounts.length > 0) {
//             const accounts = existingAccounts.accounts.map(account => ({
//                 id: account.id,
//                 username: account.accountUsername || 'unknown',
//                 followers: '0', // We'd need to fetch this from Instagram API
//                 avatar: `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face`,
//                 userId: account.id,
//                 isConnected: true,
//                 connectedAt: account.createdAt
//             }));
//             setConnectedAccounts(accounts);
//         }
//     }, [existingAccounts, setConnectedAccounts]);

//     const handleConnectInstagram = async () => {
//         setIsConnecting(true);
//         setConnectionError(null);

//         try {
//             // Get Instagram OAuth URL
//             const result = await getConnectUrlMutation.mutateAsync();

//             // Redirect to Instagram OAuth
//             window.location.href = result.url;
//         } catch (error: any) {
//             setConnectionError(error.message || 'Gagal menghubungkan Instagram. Silakan coba lagi.');
//             setIsConnecting(false);
//         }
//     };

//     const benefits = [
//         { icon: <Shield className="w-5 h-5" />, text: "100% aman dan compliant dengan Instagram", color: "text-green-600" },
//         { icon: <Zap className="w-5 h-5" />, text: "Setup dalam 30 detik", color: "text-blue-600" },
//         { icon: <Lock className="w-5 h-5" />, text: "Data terenkripsi dan terlindungi", color: "text-purple-600" }
//     ];

//     return (
//         <div className="max-w-2xl mx-auto">
//             <MotionDiv className="text-center mb-8">
//                 <Instagram className="w-12 h-12 text-pink-500 mx-auto mb-4" />
//                 <h2 className="text-3xl font-bold text-gray-900 mb-2">Hubungkan Instagram Anda</h2>
//                 <p className="text-gray-600">Sambungkan akun Instagram Business untuk mulai otomasi</p>
//             </MotionDiv>

//             {connectedAccounts.length === 0 ? (
//                 <MotionDiv delay={200}>
//                     {connectionError && (
//                         <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
//                             <AlertCircle className="w-4 h-4 mr-2" />
//                             {connectionError}
//                         </div>
//                     )}

//                     <Card className="bg-gray-50 mb-6">
//                         <CardContent>
//                             <h3 className="font-semibold text-gray-900 mb-4">Mengapa aman?</h3>
//                             <div className="space-y-3">
//                                 {benefits.map((benefit, index) => (
//                                     <div key={index} className="flex items-center">
//                                         <div className={`${benefit.color} mr-3`}>
//                                             {benefit.icon}
//                                         </div>
//                                         <span className="text-gray-700">{benefit.text}</span>
//                                     </div>
//                                 ))}
//                             </div>
//                         </CardContent>
//                     </Card>

//                     <div className="text-center mb-6">
//                         <Button
//                             onClick={handleConnectInstagram}
//                             disabled={isConnecting}
//                             className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
//                             size="lg"
//                         >
//                             {isConnecting ? (
//                                 <>
//                                     <Loader2 className="w-5 h-5 mr-2 animate-spin" />
//                                     Menghubungkan...
//                                 </>
//                             ) : (
//                                 <>
//                                     <Instagram className="w-5 h-5 mr-2" />
//                                     Hubungkan Instagram
//                                 </>
//                             )}
//                         </Button>
//                     </div>

//                     <div className="text-center">
//                         <button
//                             onClick={() => setShowDemo(true)}
//                             className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
//                         >
//                             Atau lihat demo dulu →
//                         </button>
//                     </div>
//                 </MotionDiv>
//             ) : (
//                 <MotionDiv delay={0}>
//                     <Card className="bg-green-50 border-green-200 mb-6">
//                         <CardContent>
//                             <div className="flex items-center">
//                                 <CheckCircle className="w-8 h-8 text-green-500 mr-3" />
//                                 <div>
//                                     <h3 className="font-semibold text-green-900">Instagram Terhubung!</h3>
//                                     <p className="text-green-700">Akun Anda siap untuk otomasi</p>
//                                 </div>
//                             </div>

//                             <div className="mt-4 flex items-center">
//                                 <img
//                                     src={connectedAccounts[0]?.avatar}
//                                     alt="Profile"
//                                     className="w-12 h-12 rounded-full mr-3"
//                                 />
//                                 <div>
//                                     <div className="font-semibold text-gray-900">@{connectedAccounts[0]?.username}</div>
//                                     <div className="text-gray-600 text-sm">{connectedAccounts[0]?.followers} followers</div>
//                                 </div>
//                             </div>
//                         </CardContent>
//                     </Card>

//                     <div className="text-center">
//                         <Button onClick={onNext} size="lg">
//                             Selesaikan Setup
//                             <CheckCircle className="w-4 h-4 ml-2" />
//                         </Button>
//                     </div>
//                 </MotionDiv>
//             )}

//             {showDemo && (
//                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//                     <Card className="max-w-md w-full">
//                         <CardContent>
//                             <div className="flex justify-between items-center mb-4">
//                                 <h3 className="text-lg font-semibold">Demo Zosmed</h3>
//                                 <button
//                                     onClick={() => setShowDemo(false)}
//                                     className="p-1 hover:bg-gray-100 rounded-full transition-colors"
//                                 >
//                                     <X className="w-5 h-5 text-gray-500" />
//                                 </button>
//                             </div>
//                             <div className="aspect-video bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
//                                 <Play className="w-12 h-12 text-gray-400" />
//                             </div>
//                             <p className="text-gray-600 text-sm mb-4">
//                                 Lihat bagaimana Zosmed mengotomasi respon Instagram dalam 2 menit
//                             </p>
//                             <Button
//                                 onClick={() => setShowDemo(false)}
//                                 className="w-full"
//                             >
//                                 Tutup Demo
//                             </Button>
//                         </CardContent>
//                     </Card>
//                 </div>
//             )}
//         </div>
//     );
// };
