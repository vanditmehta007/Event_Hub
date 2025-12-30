import React, { useEffect, useState } from 'react';

const PaperPlaneAnimation = ({ onComplete }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            if (onComplete) onComplete();
        }, 3000); // 3 seconds animation duration

        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 backdrop-blur-sm">
            <div className="relative w-full max-w-lg h-64 overflow-hidden rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-white/20 shadow-2xl flex items-center justify-center">

                {/* Success Message */}
                <div className="absolute top-10 text-white font-bold text-2xl animate-pulse">
                    Registration Successful!
                </div>

                {/* Dotted Line Path */}
                <svg className="absolute w-full h-full" viewBox="0 0 400 200">
                    <path
                        id="flightPath"
                        d="M 50 150 Q 200 50 350 150"
                        fill="none"
                        stroke="rgba(255,255,255,0.5)"
                        strokeWidth="2"
                        strokeDasharray="10,10"
                        className="animate-drawPath"
                    />
                </svg>

                {/* Paper Plane */}
                <div className="plane-container absolute left-0 top-0">
                    <div className="text-4xl text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">
                        ✈️
                    </div>
                </div>

                <style jsx>{`
            .plane-container {
                offset-path: path("M 50 150 Q 200 50 350 150");
                animation: fly 2s ease-in-out forwards;
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            @keyframes fly {
                0% {
                    offset-distance: 0%;
                    transform: scale(0.5);
                    opacity: 0;
                }
                10% {
                    opacity: 1;
                    transform: scale(1);
                }
                90% {
                    opacity: 1; 
                    transform: scale(1);
                }
                100% {
                    offset-distance: 100%;
                    transform: scale(0.5);
                    opacity: 0;
                }
            }
        `}</style>
            </div>
        </div>
    );
};

export default PaperPlaneAnimation;
