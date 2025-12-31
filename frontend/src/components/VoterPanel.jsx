import React, { useState } from 'react';
import toast from 'react-hot-toast';
import LoadingOverlay from './LoadingOverlay.jsx';

// ==========================================
// Component: VoterPanel
// ==========================================
// Displayed to all authenticated users.
// Shows the list of candidates and allows users to vote.
const VoterPanel = ({ contract, candidates, hideVotes, votingEnded, refresh }) => {
    const [loading, setLoading] = useState(false);

    // Check if votes should be hidden
    const shouldHideVotes = hideVotes && !votingEnded;

    // Helper: Parse and convert error messages to user-friendly text
    const parseErrorMessage = (err) => {
        let rawMessage = "";

        // Extract the raw error message from various error formats
        // ethers.js v6 uses different error structures
        if (err.reason) {
            rawMessage = err.reason;
        } else if (err.info?.error?.message) {
            rawMessage = err.info.error.message;
        } else if (err.error?.message) {
            rawMessage = err.error.message;
        } else if (err.data?.message) {
            rawMessage = err.data.message;
        } else if (err.message) {
            // Try to extract reason from the error message string
            const reasonMatch = err.message.match(/reason="([^"]+)"/);
            const revertMatch = err.message.match(/reverted with reason string '([^']+)'/);
            const errorMatch = err.message.match(/execution reverted: ([^"]+)/);

            if (reasonMatch) {
                rawMessage = reasonMatch[1];
            } else if (revertMatch) {
                rawMessage = revertMatch[1];
            } else if (errorMatch) {
                rawMessage = errorMatch[1];
            } else {
                rawMessage = err.message;
            }
        }

        // Also check shortMessage for ethers v6
        if (!rawMessage && err.shortMessage) {
            rawMessage = err.shortMessage;
        }

        console.log("Parsed error message:", rawMessage); // Debug log

        // Smart Contract error messages (EXACT from Evoting.sol - Vote function)
        const contractErrors = [
            "Owner has no right to vote",
            "You are not registered to vote",
            "Voting has not started or Voting has ended",
            "Candidate not found",
            "All voters are only allowed to vote once",
            "Voting has ended",
        ];

        // Check if rawMessage contains any contract error
        const lowerMessage = rawMessage.toLowerCase();
        for (const contractError of contractErrors) {
            if (lowerMessage.includes(contractError.toLowerCase())) {
                return contractError; // Return the exact contract error message
            }
        }

        // MetaMask / Transaction errors mapping
        const metaMaskErrors = {
            "user rejected": "Transaction was cancelled by user",
            "user denied": "Transaction was cancelled by user",
            "insufficient funds": "Insufficient ETH balance for gas fees",
            "nonce too low": "Transaction error. Please try again",
            "replacement fee too low": "Network is busy. Please increase gas fee or wait",
        };

        for (const [key, friendlyMessage] of Object.entries(metaMaskErrors)) {
            if (lowerMessage.includes(key.toLowerCase())) {
                return friendlyMessage;
            }
        }

        // Return the raw message if it's reasonable, otherwise generic error
        if (rawMessage && rawMessage.length < 200) {
            return rawMessage;
        }

        return "An unexpected error occurred";
    };

    // Function: Cast Vote
    // Calls the 'Vote' function on the Smart Contract.
    const castVote = async (index) => {
        try {
            setLoading(true);

            // 1. Call Smart Contract
            const tx = await contract.Vote(index);

            // 2. Wait for confirmation
            await tx.wait();

            toast.success('Vote cast successfully! 🎉');
            refresh(); // Update the candidate list (vote count)
        } catch (err) {
            console.error(err);
            const errorMessage = parseErrorMessage(err);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 relative">
            {/* Global Loading Overlay */}
            {loading && (
                <LoadingOverlay
                    title="Casting Your Vote"
                    message="Please wait while the blockchain confirms your transaction..."
                />
            )}

            <div className="flex items-center justify-between border-b border-white/5 pb-6">
                <h2 className="text-3xl font-bold text-white">Active Candidates</h2>
                <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-slate-300">
                    {candidates.length} Registered
                </span>
            </div>

            {candidates.length === 0 ? (
                <div className="py-20 text-center rounded-3xl border border-dashed border-white/10 bg-white/[0.02]">
                    <p className="text-slate-500 text-lg">No candidates registered for this election.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {candidates.map((c, i) => (
                        <div key={c.id} className="group glass-panel rounded-2xl p-6 hover:bg-white/[0.05] transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
                            {/* Decorative Gradient Blob */}
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl group-hover:bg-indigo-500/30 transition-all"></div>

                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 flex items-center justify-center text-xl font-bold text-white shadow-lg">
                                        {c.id + 1}
                                    </div>
                                    {i < 3 && <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded uppercase tracking-wider">Contender</span>}
                                </div>

                                <div className="mb-8 space-y-1">
                                    <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">Candidate Address</p>
                                    <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                                        <p className="text-xs font-mono text-slate-300 break-all leading-relaxed">
                                            {c.address}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="flex-1">
                                        {shouldHideVotes ? (
                                            <>
                                                <p className="text-3xl font-bold text-amber-400 tracking-tight">???</p>
                                                <p className="text-xs text-amber-500/60 font-medium uppercase">Hidden</p>
                                            </>
                                        ) : (
                                            <>
                                                <p className="text-3xl font-bold text-white tracking-tight">{c.votes}</p>
                                                <p className="text-xs text-slate-500 font-medium uppercase">Current Votes</p>
                                            </>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => castVote(c.id)}
                                        disabled={loading}
                                        className="px-6 py-3 rounded-xl bg-white text-black font-bold hover:bg-slate-200 transition-colors shadow-lg shadow-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Vote
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default VoterPanel;
