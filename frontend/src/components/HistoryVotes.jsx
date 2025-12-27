import React from 'react';

// ==========================================
// Component: HistoryVotes
// ==========================================
// Displays a list of all votes cast, retrieved from blockchain events.
const HistoryVotes = ({ history, hideVotes, votingStarted, votingEnded }) => {

    // Check if votes should be hidden
    const shouldHideVotes = hideVotes && !votingEnded;

    // Sort History: Newest First
    // We convert timestamp (BigInt/String) to Number for comparison.
    // 'b - a' ensures descending order.
    const sortedHistory = [...history].sort((a, b) => Number(b.timestamp) - Number(a.timestamp));

    return (
        <div className="glass-panel rounded-3xl p-8 mb-12 relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-500"></div>

            <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <span className="text-2xl">📜</span>
                        History Votes
                    </h2>
                    <p className="text-slate-400 mt-1 text-sm">Real-time ledger of blockchain transactions</p>
                </div>
                {shouldHideVotes ? (
                    <div className="bg-amber-500/10 px-3 py-1 rounded-full text-xs font-bold text-amber-400 border border-amber-500/20">
                        🙈 Hidden
                    </div>
                ) : (
                    <div className="bg-white/5 px-3 py-1 rounded-full text-xs font-mono text-slate-300">
                        Total: {history.length}
                    </div>
                )}
            </div>

            {shouldHideVotes ? (
                <div className="py-16 text-center">
                    <div className="text-5xl mb-4 opacity-80">🔒</div>
                    <h3 className="text-xl font-semibold text-white mb-2">Vote History Is Hidden</h3>
                    <p className="text-slate-500">History will be revealed after voting ends.</p>
                    <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20">
                        <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></div>
                        <span className="text-amber-400 text-sm font-medium">
                            {votingStarted ? 'Voting is in progress' : 'Voting has not started'}
                        </span>
                    </div>
                </div>
            ) : (

                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {sortedHistory.length === 0 ? (
                        <div className="text-center py-10 text-slate-500 italic">
                            No votes cast yet. Be the first!
                        </div>
                    ) : (
                        sortedHistory.map((record, index) => (
                            <div key={`${record.voter}-${record.timestamp}-${index}`} className="bg-white/[0.02] border border-white/5 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-white/[0.05] transition-colors relative overflow-hidden group">

                                {/* Decorative line */}
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-500/50 to-blue-500/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 flex items-center justify-center text-xs text-slate-400 font-mono">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-500 uppercase tracking-widest mb-1">Voter</div>
                                        <div className="font-mono text-sm text-cyan-300">
                                            {record.voter}
                                        </div>
                                    </div>
                                </div>

                                <div className="hidden md:block w-px h-10 bg-white/5"></div>

                                <div className="flex items-center gap-4">
                                    <div className="text-right md:text-left">
                                        <div className="text-xs text-slate-500 uppercase tracking-widest mb-1">Voted For</div>
                                        <div className="font-mono text-sm text-purple-300">
                                            {record.candidate}
                                        </div>
                                    </div>
                                </div>

                                <div className="hidden md:block w-px h-10 bg-white/5"></div>

                                <div className="text-right min-w-[120px]">
                                    <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Time</div>
                                    <div className="text-xs text-slate-300 font-medium">
                                        {new Date(Number(record.timestamp) * 1000).toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default HistoryVotes;
