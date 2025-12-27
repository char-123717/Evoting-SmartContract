import React from 'react';

// ==========================================
// Component: WinnerCard
// ==========================================
// Displays the election winner after voting ends.
// Handles cases for: No winner yet, Single winner, and Ties.
const WinnerCard = ({ winner, votingStatus }) => {
    // 1. Show Pending State (If voting hasn't ended or no winner calculated)
    if (!winner) {
        return (
            <div id="winner-section" className="relative mt-8 group scroll-mt-24">
                {/* Visual styling for pending state */}
                <div className="absolute inset-0 bg-gradient-to-r from-slate-600 via-slate-500 to-slate-600 rounded-3xl blur opacity-15"></div>
                <div className="glass-panel rounded-3xl p-1 relative overflow-hidden mb-12">
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-500 via-slate-400 to-slate-500 opacity-10"></div>

                    <div className="bg-[#0B0E14]/90 backdrop-blur-xl rounded-[22px] p-8 text-center relative z-10">
                        <div className="mb-6 inline-flex p-4 rounded-full bg-gradient-to-br from-slate-500/20 to-slate-600/20 shadow-[0_0_30px_rgba(100,116,139,0.2)]">
                            <span className="text-4xl filter drop-shadow-md opacity-50">⏳</span>
                        </div>

                        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-300 via-slate-400 to-slate-500 mb-2">
                            Winner Not Yet Determined
                        </h2>

                        <p className="text-slate-500 mb-4">
                            {/* Conditional Message based on Voting Status */}
                            {votingStatus?.start
                                ? "Voting is still in progress. Please wait until the election ends."
                                : votingStatus?.end
                                    ? "Processing results..."
                                    : "Voting has not started yet. Stay tuned!"
                            }
                        </p>

                        <div className="mt-4 flex items-center justify-center gap-2">
                            <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse"></div>
                            <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // 2. Winner Data Exists
    const { addresses, votes } = winner;

    // Check if there is a tie (array has more than 1 address)
    const isTie = addresses && addresses.length > 1;

    return (
        <div id="winner-section" className="relative mt-8 group scroll-mt-24">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-3xl blur opacity-25 group-hover:opacity-40 transition-opacity duration-1000"></div>
            <div className="glass-panel rounded-3xl p-1 relative overflow-hidden mb-12 animate-fade-in-up">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 opacity-20 animate-shine"></div>

                <div className="bg-[#0B0E14]/90 backdrop-blur-xl rounded-[22px] p-8 text-center relative z-10">
                    <div className="mb-6 inline-flex p-4 rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-500/20 shadow-[0_0_30px_rgba(234,179,8,0.2)]">
                        <span className="text-4xl filter drop-shadow-md">
                            {isTie ? '🤝' : '👑'}
                        </span>
                    </div>

                    <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-orange-400 mb-2">
                        {isTie ? "Election Result: TIE!" : "Election Winner"}
                    </h2>

                    {isTie && <p className="text-slate-400 mb-6">Voting ended with a draw.</p>}

                    <div className="space-y-4">
                        {addresses.map((addr, idx) => (
                            <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-4 max-w-lg mx-auto">
                                <div className="text-xs text-slate-500 uppercase tracking-widest mb-1">
                                    {isTie ? `Winner #${idx + 1}` : "Winning Candidate"}
                                </div>
                                <div className="font-mono text-lg text-yellow-300 break-all">
                                    {addr}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 inline-block px-6 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/20">
                        <span className="text-yellow-400 font-bold text-xl">{votes}</span>
                        <span className="text-yellow-500/60 ml-2 uppercase text-sm font-bold tracking-wider">Total Votes</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WinnerCard;

