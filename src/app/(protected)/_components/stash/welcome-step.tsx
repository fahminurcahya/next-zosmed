// 'use client'
// import { useState } from "react";
// import type { FormErrors, OnboardingFormData } from "../types/onboarding.type";
// import { Input } from "@/components/ui/input";
// import { Select } from "@/components/ui/select";
// import { api } from "@/trpc/react";
// import { MotionDiv } from "./motion-div";
// import { AlertCircle, ArrowRight, Loader2, Rocket } from "lucide-react";
// import { Button } from "@/components/ui/button";

// interface WelcomeStepProps {
//     onNext: () => void;
//     formData: OnboardingFormData;
//     updateFormData: (updates: Partial<OnboardingFormData>) => void;
// }

// const WelcomeStep: React.FC<WelcomeStepProps> = ({ onNext, formData, updateFormData }) => {
//     const [errors, setErrors] = useState<FormErrors>({});
//     const [isSubmitting, setIsSubmitting] = useState(false);

//     // tRPC mutation for saving business info
//     const saveBusinessInfoMutation = api.onboarding.saveBusinessInfo.useMutation({
//         onSuccess: () => {
//             onNext();
//         },
//         onError: (error) => {
//             setErrors({ general: error.message || 'Terjadi kesalahan. Silakan coba lagi.' });
//             setIsSubmitting(false);
//         },
//     });

//     const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//         e.preventDefault();
//         setIsSubmitting(true);
//         setErrors({});

//         try {
//             // Validate form data
//             userValidationSchema.parse(formData);

//             // Save to database via tRPC
//             await saveBusinessInfoMutation.mutateAsync({
//                 businessName: formData.businessName,
//                 businessCategory: formData.businessCategory as BusinessCategory,
//                 businessSize: formData.businessSize as BusinessSize,
//                 location: formData.location,
//                 goals: formData.goals,
//             });
//         } catch (error) {
//             if (error instanceof z.ZodError) {
//                 const fieldErrors: FormErrors = {};
//                 error.errors.forEach(err => {
//                     if (err.path[0]) {
//                         fieldErrors[err.path[0].toString()] = err.message;
//                     }
//                 });
//                 setErrors(fieldErrors);
//                 setIsSubmitting(false);
//             }
//             // tRPC errors are handled in onError callback
//         }
//     };

//     const handleInputChange = (field: keyof OnboardingFormData) => (
//         e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
//     ) => {
//         updateFormData({ [field]: e.target.value });
//         if (errors[field]) {
//             setErrors(prev => {
//                 const newErrors = { ...prev };
//                 delete newErrors[field];
//                 return newErrors;
//             });
//         }
//     };

//     return (
//         <div className="max-w-2xl mx-auto">
//             <MotionDiv className="text-center mb-8">
//                 <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-cyan-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
//                     <Rocket className="w-8 h-8 text-white" />
//                 </div>
//                 <h1 className="text-3xl font-bold text-gray-900 mb-2">Selamat Datang di Zosmed!</h1>
//                 <p className="text-gray-600">Ceritakan tentang bisnis Anda untuk pengalaman yang lebih personal</p>
//             </MotionDiv>

//             <MotionDiv delay={200}>
//                 {errors.general && (
//                     <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
//                         <AlertCircle className="w-4 h-4 mr-2" />
//                         {errors.general}
//                     </div>
//                 )}

//                 <form onSubmit={handleSubmit} className="space-y-6">
//                     <div className="grid md:grid-cols-2 gap-4">
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">
//                                 Nama Bisnis/Brand <span className="text-red-500">*</span>
//                             </label>
//                             <Input
//                                 type="text"
//                                 placeholder="Nama bisnis atau brand Anda"
//                                 value={formData.businessName}
//                                 onChange={handleInputChange('businessName')}
//                                 disabled={isSubmitting}
//                                 error={errors.businessName}
//                             />
//                             {errors.businessName && <p className="text-red-500 text-xs mt-1">{errors.businessName}</p>}
//                         </div>
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">
//                                 Kategori Bisnis <span className="text-red-500">*</span>
//                             </label>
//                             <Select
//                                 value={formData.businessCategory}
//                                 onChange={handleInputChange('businessCategory')}
//                                 disabled={isSubmitting}
//                                 error={errors.businessCategory}
//                             >
//                                 <option value="">Pilih kategori bisnis</option>
//                                 {BUSINESS_CATEGORY_OPTIONS.map(option => (
//                                     <option key={option.value} value={option.value}>
//                                         {option.label}
//                                     </option>
//                                 ))}
//                             </Select>
//                             {errors.businessCategory && <p className="text-red-500 text-xs mt-1">{errors.businessCategory}</p>}
//                         </div>
//                     </div>

//                     <div className="grid md:grid-cols-2 gap-4">
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">
//                                 Ukuran Bisnis <span className="text-red-500">*</span>
//                             </label>
//                             <Select
//                                 value={formData.businessSize}
//                                 onChange={handleInputChange('businessSize')}
//                                 disabled={isSubmitting}
//                                 error={errors.businessSize}
//                             >
//                                 <option value="">Pilih ukuran bisnis</option>
//                                 {BUSINESS_SIZE_OPTIONS.map(option => (
//                                     <option key={option.value} value={option.value}>
//                                         {option.label} - {option.description}
//                                     </option>
//                                 ))}
//                             </Select>
//                             {errors.businessSize && <p className="text-red-500 text-xs mt-1">{errors.businessSize}</p>}
//                         </div>
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">
//                                 Lokasi <span className="text-red-500">*</span>
//                             </label>
//                             <Input
//                                 type="text"
//                                 placeholder="Kota, Provinsi"
//                                 value={formData.location}
//                                 onChange={handleInputChange('location')}
//                                 disabled={isSubmitting}
//                                 error={errors.location}
//                             />
//                             {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
//                         </div>
//                     </div>

//                     <div>
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">
//                                 Tujuan Utama Menggunakan Zosmed <span className="text-red-500">*</span>
//                             </label>
//                             <Select
//                                 value={formData.goals}
//                                 onChange={handleInputChange('goals')}
//                                 disabled={isSubmitting}
//                                 error={errors.goals}
//                             >
//                                 <option value="">Pilih tujuan utama</option>
//                                 {GOALS_OPTIONS.map(option => (
//                                     <option key={option.value} value={option.value}>
//                                         {option.label}
//                                     </option>
//                                 ))}
//                             </Select>
//                             {errors.goals && <p className="text-red-500 text-xs mt-1">{errors.goals}</p>}
//                         </div>
//                     </div>

//                     <div className="flex items-start">
//                         <input type="checkbox" className="mt-1 mr-2" required disabled={isSubmitting} />
//                         <p className="text-xs text-gray-600">
//                             Saya setuju dengan <a href="/terms" className="text-blue-600 hover:underline">Syarat & Ketentuan</a> dan <a href="/privacy" className="text-blue-600 hover:underline">Kebijakan Privasi</a>
//                         </p>
//                     </div>

//                     <Button type="submit" disabled={isSubmitting} className="w-full" size="lg">
//                         {isSubmitting ? (
//                             <>
//                                 <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//                                 Menyimpan Data...
//                             </>
//                         ) : (
//                             <>
//                                 Lanjutkan
//                                 <ArrowRight className="w-4 h-4 ml-2" />
//                             </>
//                         )}
//                     </Button>
//                 </form>
//             </MotionDiv>
//         </div>
//     );
// };