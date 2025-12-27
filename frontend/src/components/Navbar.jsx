import React from 'react';
import toast from 'react-hot-toast';

// ==========================================
// Component: Navbar
// ==========================================
// Handles navigation and displays current wallet status.
const Navbar = ({ account, connectWallet, isAppEntered, onBack, disconnectWallet }) => {
    return (
        <nav className="fixed top-0 w-full z-50 transition-all duration-300">
            {/* Gradient Line */}
            <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500"></div>

            <div className="bg-[#0B0E14]/80 backdrop-blur-xl border-b border-white/[0.05]">
                <div className="container mx-auto px-6 h-20 flex items-center justify-between">

                    {/* Brand */}
                    <div className="flex items-center gap-4 group cursor-default">
                        <div className="relative w-10 h-10">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
                            <div className="relative w-full h-full rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/20">
                                <svg className="w-5 h-5 text-white transform group-hover:scale-110 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-1">
                                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Secure</span>
                                <span className="text-xl font-light text-indigo-400">Vote</span>
                            </div>
                            <span className="text-[10px] font-medium text-slate-500 tracking-widest uppercase">Decentralized Platform</span>
                        </div>
                    </div>

                    {/* Navigation Links */}
                    {isAppEntered && (
                        <div className="hidden md:flex items-center gap-1">
                            <button
                                onClick={onBack}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-amber-400 hover:text-amber-300 hover:bg-amber-400/10 transition-all border border-amber-400/20 mr-2"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Back
                            </button>
                            <button
                                onClick={() => document.getElementById('vote-section')?.scrollIntoView({ behavior: 'smooth' })}
                                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                            >
                                🗳️ Vote
                            </button>
                            <button
                                onClick={() => document.getElementById('live-section')?.scrollIntoView({ behavior: 'smooth' })}
                                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                            >
                                📊 Live
                            </button>
                            <button
                                onClick={() => document.getElementById('history-section')?.scrollIntoView({ behavior: 'smooth' })}
                                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                            >
                                📜 History
                            </button>
                            <button
                                onClick={() => document.getElementById('winner-section')?.scrollIntoView({ behavior: 'smooth' })}
                                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                            >
                                👑 Winner
                            </button>
                        </div>
                    )}

                    {/* Actions */}
                    <div>
                        {account ? (
                            // Connected State
                            <div className="flex gap-2">
                                {/* Wallet Info */}
                                <div className={`group flex items-center gap-4 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] hover:border-white/10 rounded-full pl-6 pr-2 py-1.5 transition-all duration-300 backdrop-blur-md ${isAppEntered ? 'cursor-default' : 'cursor-pointer'}`}
                                    onClick={async () => {
                                        // Disable click if inside App (Dashboard)
                                        if (isAppEntered) return;

                                        if (window.ethereum) {
                                            try {
                                                await window.ethereum.request({
                                                    method: 'wallet_requestPermissions',
                                                    params: [{ eth_accounts: {} }],
                                                });
                                                toast.success('Switching wallet...');
                                            } catch (error) {
                                                console.error(error);
                                                toast.error('Failed to switch wallet');
                                            }
                                        }
                                    }}
                                    title={isAppEntered ? "Wallet Address" : "Click to switch wallet"}
                                >
                                    <div className="flex flex-col items-end mr-2">
                                        <div className="flex items-center gap-1.5 mb-0.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest leading-none">Connected</span>
                                        </div>
                                        <span className="font-mono text-sm text-slate-300 group-hover:text-white transition-colors leading-none tracking-tight">
                                            {account.slice(0, 6)}...{account.slice(-4)}
                                        </span>
                                    </div>
                                    <div className="h-9 w-9 rounded-full bg-white p-1 shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all group-hover:scale-110">
                                        <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="MetaMask" className="w-full h-full" />
                                    </div>
                                </div>

                                {/* Log Out Button - Only show if NOT entered in app */}
                                {!isAppEntered && (
                                    <button
                                        onClick={disconnectWallet}
                                        className="p-2 rounded-full border border-red-500/30 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center group"
                                        title="Log Out"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        ) : (
                            // Disconnected State
                            <div className="relative group">
                                <div className="px-5 py-2.5 rounded-full border border-slate-700/50 bg-slate-800/50 backdrop-blur-sm flex items-center gap-3 cursor-pointer hover:bg-slate-800/80 transition-all hover:border-slate-600 shadow-lg shadow-indigo-500/10"
                                    onClick={connectWallet}
                                    title="Click to connect wallet"
                                >
                                    <div className="w-5 h-5 grayscale group-hover:grayscale-0 transition-all duration-300">
                                        <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="MetaMask" className="w-full h-full" />
                                    </div>
                                    <span className="text-sm font-medium text-slate-400 group-hover:text-white transition-colors">No account is connected</span>
                                </div>

                                {/* "Click Here" Visual Cue */}
                                <div className="absolute top-14 right-0 flex flex-col items-center animate-bounce pointer-events-none">
                                    <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px] border-b-amber-400 filter drop-shadow-md"></div>
                                    <div className="bg-amber-400 text-black text-[10px] font-bold px-2 py-1 rounded-md shadow-lg whitespace-nowrap">
                                        Click Here! 👆
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
