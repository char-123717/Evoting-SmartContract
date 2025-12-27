import React from 'react';

// ==========================================
// Component: LoadingOverlay
// ==========================================
// A full-screen overlay shown during async blockchain transactions.
// Prevents user interaction while waiting for confirmation.
const LoadingOverlay = () => {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0B0E14]/80 backdrop-blur-sm animate-fade-in">
            <div className="flex flex-col items-center gap-6 p-8 rounded-3xl bg-white/[0.05] border border-white/10 shadow-2xl">
                <div className="relative w-16 h-16">
                    <div className="absolute inset-0 border-4 border-indigo-500/30 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <div className="text-center space-y-2">
                    <h3 className="text-xl font-bold text-white">Processing Transaction</h3>
                    <p className="text-sm text-slate-400">Please wait while the blockchain confirms your action...</p>
                </div>
            </div>
        </div>
    );
};

export default LoadingOverlay;
