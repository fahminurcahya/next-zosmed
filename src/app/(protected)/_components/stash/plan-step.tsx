// 'use client'
// import { useState } from "react";
// import type { PlanId } from "../types/onboarding.type";
// import { api } from "@/trpc/react";
// import { ArrowRight, CheckCircle, Crown, Loader2 } from "lucide-react";
// import { MotionDiv } from "./motion-div";
// import { Card, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";

// interface PlanStepProps {
//     onNext: () => void;
//     selectedPlan: PlanId | null;
//     updateSelectedPlan: (planId: PlanId) => void;
// }

// const PlanStep: React.FC<PlanStepProps> = ({ onNext, selectedPlan, updateSelectedPlan }) => {
//     const [isLoading, setIsLoading] = useState(false);

//     // Fetch plans from database
//     const { data: plansData, isLoading: plansLoading } = api.onboarding.getPlans.useQuery();

//     // tRPC mutation for saving subscription
//     const saveSubscriptionMutation = api.onboarding.saveSubscription.useMutation({
//         onSuccess: () => {
//             onNext();
//         },
//         onError: (error) => {
//             console.error('Failed to save subscription:', error);
//             setIsLoading(false);
//         },
//     });

//     const handleContinue = async () => {
//         if (!selectedPlan) return;
//         setIsLoading(true);

//         try {
//             await saveSubscriptionMutation.mutateAsync({
//                 planId: selectedPlan,
//             });
//         } catch (error) {
//             console.error('Subscription error:', error);
//             setIsLoading(false);
//         }
//     };

//     // Show loading state while fetching plans
//     if (plansLoading) {
//         return (
//             <div className="max-w-4xl mx-auto">
//                 <div className="text-center">
//                     <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
//                     <p className="text-gray-600">Memuat paket langganan...</p>
//                 </div>
//             </div>
//         );
//     }

//     const plans = plansData?.plans || [];

//     return (
//         <div className="max-w-4xl mx-auto">
//             <MotionDiv className="text-center mb-8">
//                 <Crown className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
//                 <h2 className="text-3xl font-bold text-gray-900 mb-2">Pilih Paket yang Tepat</h2>
//                 <p className="text-gray-600">Mulai gratis, upgrade kapan saja. Tidak ada komitmen jangka panjang.</p>
//             </MotionDiv>

//             <div className="grid md:grid-cols-3 gap-6 mb-8">
//                 {plans.map((plan, index) => (
//                     <MotionDiv key={plan.id} delay={index * 100}>
//                         <Card
//                             className={`relative border-2 transition-all duration-300 ${selectedPlan === plan.id
//                                 ? 'border-blue-500 ring-2 ring-blue-200 shadow-lg'
//                                 : 'border-gray-200 hover:border-blue-300'
//                                 }`}
//                             onClick={() => updateSelectedPlan(plan.id as PlanId)}
//                         >
//                             {plan.recommended && (
//                                 <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
//                                     <span className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
//                                         Recommended
//                                     </span>
//                                 </div>
//                             )}

//                             <CardContent className="pt-6">
//                                 <div className="text-center mb-6">
//                                     <div className={`w-12 h-12 bg-gradient-to-r ${plan.color || 'from-blue-500 to-cyan-500'} rounded-xl mx-auto mb-3 flex items-center justify-center`}>
//                                         <Crown className="w-6 h-6 text-white" />
//                                     </div>
//                                     <h3 className="text-xl font-bold text-gray-900 mb-1">{plan.name}</h3>
//                                     <p className="text-gray-600 text-sm mb-3">{plan.description}</p>
//                                     <div className="text-2xl font-bold text-gray-900">{plan.price}</div>
//                                     <div className="text-gray-600 text-sm">{plan.period}</div>
//                                 </div>

//                                 <ul className="space-y-2">
//                                     {plan.features.map((feature: string, idx: number) => (
//                                         <li key={idx} className="flex items-center text-sm text-gray-700">
//                                             <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
//                                             {feature}
//                                         </li>
//                                     ))}
//                                 </ul>

//                                 {selectedPlan === plan.id && (
//                                     <div className="absolute top-4 right-4">
//                                         <CheckCircle className="w-6 h-6 text-blue-500" />
//                                     </div>
//                                 )}
//                             </CardContent>
//                         </Card>
//                     </MotionDiv>
//                 ))}
//             </div>

//             <div className="text-center">
//                 <Button onClick={handleContinue} disabled={!selectedPlan || isLoading} size="lg">
//                     {isLoading ? (
//                         <>
//                             <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//                             Menyimpan...
//                         </>
//                     ) : (
//                         <>
//                             Lanjutkan
//                             <ArrowRight className="w-4 h-4 ml-2" />
//                         </>
//                     )}
//                 </Button>
//             </div>
//         </div>
//     );
// };
