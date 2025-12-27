import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

// ==========================================
// Component: AdminPanel
// ==========================================
// Only visible to the contract Owner (Admin).
// Allows: Adding candidates, Registering voters, and Managing voting session.
const AdminPanel = ({ contract, refresh, candidates, votingStatus, hideVotes, setIsLoading }) => { // Add props
    // State for form inputs
    const [candidateAddress, setCandidateAddress] = useState('');
    const [voterAddress, setVoterAddress] = useState('');
    const [candidateCount, setCandidateCount] = useState(0);

    // Monitor candidate count to update UI
    useEffect(() => { fetchCandidateCount(); }, [contract, candidates]);

    // Helper: Logic to count candidates (handles potential read errors)
    const fetchCandidateCount = async () => {
        if (!contract) return;
        try {
            // Try getAllCandidates first
            try {
                const candidates = await contract.getAllCandidates();
                setCandidateCount(candidates.length);
            } catch (e) {
                // Fallback: count manually
                let count = 0;
                while (true) {
                    try {
                        await contract.candidate(count);
                        count++;
                    } catch (err) {
                        break;
                    }
                }
                setCandidateCount(count);
            }
        } catch (err) {
            console.error(err);
        }
    };

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

        // Smart Contract error messages (EXACT from Evoting.sol)
        const contractErrors = [
            // registerVoter() errors
            "Only owner can register voters",
            "Owner cannot be registered as voter",
            "Voter already registered",

            // AddCandidate() errors
            "You aren't the owner, Only owner has the right to add candidates",
            "Owner was not allowed to add candidates during voting started",
            "The candidate has been added",

            // VotingStart() errors
            "You aren't the owner, Only owner has the right to initiate the voting",
            "Candidates must be more than one or at least two to start the voting",
            "Voting has started",
            "Voting has ended and cannot be restarted",

            // VotingEnd() errors
            "No voting is on going",

            // toggleHideVotes() errors
            "Only owner can toggle hide votes",

            // Vote() errors
            "Owner has no right to vote",
            "You are not registered to vote",
            "Voting has not started or Voting has ended",
            "Candidate not found",
            "All voters are only allowed to vote once",

            // General
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

    // Generic function to handle transactions
    // Wraps blockchain calls with Loading State and Toast Notifications.
    const handleTx = async (action) => {
        try {
            setIsLoading(true); // Global loader
            const tx = await action(); // Execute the blockchain transaction
            await tx.wait(); // Wait for transaction to be mined
            toast.success('Transaction successful! ✅');

            await new Promise(resolve => setTimeout(resolve, 1000));
            await fetchCandidateCount();
            refresh(); // Refresh App data
        } catch (err) {
            console.error(err);
            const errorMessage = parseErrorMessage(err);
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    // Button status logic
    // Start Disabled: If already started OR already ended
    const isStartDisabled = votingStatus?.start || votingStatus?.end;

    // End Disabled: If NOT started OR already ended
    const isEndDisabled = !votingStatus?.start || votingStatus?.end;

    return (
        <div className="glass-panel rounded-3xl p-8 mb-12 relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-white/5 pb-8">
                <div>
                    <h2 className="text-2xl font-bold text-white">Election Control Center</h2>
                    <p className="text-slate-400 mt-1 text-sm">Privileged access for contract owner</p>
                </div>
                <div className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-300 text-xs font-bold uppercase tracking-widest">
                    Administrator
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-indigo-500 rounded-full"></span>
                        Register Candidate
                    </h3>
                    <div className="space-y-3">
                        <input
                            type="text"
                            placeholder="Enter Wallet Address (0x...)"
                            value={candidateAddress}
                            onChange={(e) => setCandidateAddress(e.target.value)}
                            className="input-modern"
                        />
                        <button
                            onClick={() => {
                                if (!candidateAddress || !candidateAddress.trim()) {
                                    toast.error('Please enter the valid address');
                                    return;
                                }
                                handleTx(() => contract.AddCandidate(candidateAddress));
                            }}
                            className="w-full btn-gradient py-3.5 shadow-lg shadow-indigo-500/20"
                        >
                            Register Candidate
                        </button>
                    </div>
                </div>

                {/* Voter Registration Section */}
                <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-cyan-500 rounded-full"></span>
                        Register Voter (Whitelist)
                    </h3>
                    <div className="space-y-3">
                        <input
                            type="text"
                            placeholder="Enter Voter Wallet Address (0x...)"
                            value={voterAddress}
                            onChange={(e) => setVoterAddress(e.target.value)}
                            className="input-modern"
                        />
                        <button
                            onClick={() => {
                                if (!voterAddress || !voterAddress.trim()) {
                                    toast.error('Please enter the valid address');
                                    return;
                                }
                                handleTx(() => contract.registerVoter(voterAddress));
                            }}
                            className="w-full py-3.5 rounded-xl font-bold bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg shadow-cyan-500/20"
                        >
                            Register Voter
                        </button>
                    </div>
                </div>

                <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-purple-500 rounded-full"></span>
                        Session Management
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => handleTx(() => contract.VotingStart())}
                            disabled={isStartDisabled}
                            className={`rounded-xl border font-bold transition-all flex flex-col items-center justify-center gap-2 py-4
                                ${isStartDisabled
                                    ? 'border-slate-700 bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'
                                    : 'border-green-500/30 bg-green-500/5 hover:bg-green-500/10 text-green-400'
                                }`}
                        >
                            <div className={`w-3 h-3 rounded-full ${isStartDisabled ? 'bg-slate-500' : 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]'}`}></div>
                            START VOTING
                        </button>
                        <button
                            onClick={() => handleTx(() => contract.VotingEnd())}
                            disabled={isEndDisabled}
                            className={`rounded-xl border font-bold transition-all flex flex-col items-center justify-center gap-2 py-4
                                ${isEndDisabled
                                    ? 'border-slate-700 bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'
                                    : 'border-red-500/30 bg-red-500/5 hover:bg-red-500/10 text-red-400'
                                }`}
                        >
                            <div className={`w-3 h-3 rounded-full ${isEndDisabled ? 'bg-slate-500' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'}`}></div>
                            END VOTING
                        </button>
                    </div>

                    {/* Hide Votes Toggle */}
                    <div className={`mt-4 p-4 rounded-xl border ${votingStatus?.end ? 'border-slate-700 bg-slate-800/50' : 'border-white/10 bg-white/[0.02]'}`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className={`text-sm font-semibold flex items-center gap-2 ${votingStatus?.end ? 'text-slate-500' : 'text-white'}`}>
                                    <span className="text-lg">{votingStatus?.end ? '🔓' : (hideVotes ? '🙈' : '👁️')}</span>
                                    Hide Vote Counts
                                </h4>
                                <p className="text-xs text-slate-500 mt-1">
                                    {votingStatus?.end
                                        ? 'Voting has ended - Results are now public'
                                        : (hideVotes
                                            ? 'Votes are hidden from public view'
                                            : 'Votes are visible to everyone (live update)')
                                    }
                                </p>
                            </div>
                            <button
                                onClick={() => handleTx(() => contract.toggleHideVotes())}
                                disabled={votingStatus?.end}
                                className={`relative w-14 h-7 rounded-full transition-all duration-300 ${votingStatus?.end
                                    ? 'bg-slate-700 cursor-not-allowed opacity-50'
                                    : (hideVotes
                                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 shadow-lg shadow-amber-500/20'
                                        : 'bg-slate-700 hover:bg-slate-600')
                                    }`}
                            >
                                <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-300 ${votingStatus?.end ? 'left-1' : (hideVotes ? 'left-8' : 'left-1')
                                    }`}></div>
                            </button>
                        </div>
                        <div className={`mt-3 px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-2 ${votingStatus?.end
                            ? 'bg-slate-700/50 text-slate-400 border border-slate-600'
                            : (hideVotes
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20')
                            }`}>
                            <div className={`w-2 h-2 rounded-full ${votingStatus?.end ? 'bg-slate-500' : (hideVotes ? 'bg-amber-400' : 'bg-emerald-400')
                                } ${votingStatus?.end ? '' : 'animate-pulse'}`}></div>
                            {votingStatus?.end ? 'VOTING ENDED' : (hideVotes ? 'HIDDEN MODE ON' : 'LIVE MODE ON')}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;