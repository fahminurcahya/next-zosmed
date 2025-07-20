// 'use client'
// import { useEffect, useState } from "react";

// interface MotionDivProps {
//     children: React.ReactNode;
//     className?: string;
//     delay?: number;
// }

// export const MotionDiv: React.FC<MotionDivProps> = ({ children, className = "", delay = 0 }) => {
//     const [isVisible, setIsVisible] = useState(false);

//     useEffect(() => {
//         const timer = setTimeout(() => setIsVisible(true), delay);
//         return () => clearTimeout(timer);
//     }, [delay]);

//     const style: React.CSSProperties = {
//         transform: isVisible ? 'translateY(0px)' : 'translateY(20px)',
//         opacity: isVisible ? 1 : 0,
//         transition: 'all 0.6s ease-out'
//     };

//     return (
//         <div className={className} style={style}>
//             {children}
//         </div>
//     );
// };