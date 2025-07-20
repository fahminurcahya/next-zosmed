// interface ProgressBarProps {
//     currentStep: number;
//     totalSteps: number;
// }

// const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, totalSteps }) => {
//     const progress = (currentStep / totalSteps) * 100;

//     return (
//         <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
//             <div
//                 className="bg-gradient-to-r from-blue-600 to-cyan-500 h-2 rounded-full transition-all duration-500 ease-out"
//                 style={{ width: `${progress}%` }}
//             />
//             <div className="flex justify-between mt-2 text-sm text-gray-600">
//                 <span>Step {currentStep} of {totalSteps}</span>
//                 <span>{Math.round(progress)}% Complete</span>
//             </div>
//         </div>
//     );
// };