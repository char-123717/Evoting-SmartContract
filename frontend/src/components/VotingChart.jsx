import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

// Vibrant, highly distinguishable color palette for chart segments
const COLORS = [
    '#f43f5e', // Rose
    '#3b82f6', // Blue
    '#22c55e', // Green
    '#f59e0b', // Amber
    '#8b5cf6', // Violet
    '#06b6d4', // Cyan
    '#ec4899', // Pink
    '#84cc16', // Lime
    '#f97316', // Orange
    '#14b8a6', // Teal
];

// ==========================================
// Component: VotingChart
// ==========================================
// Visualizes voting results using Bar and Pie charts (via Recharts library).
const VotingChart = ({ candidates, hideVotes, votingStarted, votingEnded }) => {
    // Check if votes should be hidden
    const shouldHideVotes = hideVotes && !votingEnded;
    // Show hidden state when votes are hidden
    if (shouldHideVotes) {
        return (
            <div className="glass-panel rounded-3xl p-8 mb-12 relative overflow-hidden">
                {/* Background Accent */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-500"></div>

                <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                            <span className="text-2xl">📊</span>
                            Live Voting Results
                        </h2>
                        <p className="text-slate-400 mt-1 text-sm">Real-time visualization of vote distribution</p>
                    </div>
                    <div className="bg-amber-500/10 px-4 py-2 rounded-full text-sm font-bold text-amber-400 border border-amber-500/20">
                        🙈 Hidden
                    </div>
                </div>

                <div className="py-16 text-center">
                    <div className="text-6xl mb-6 opacity-80">🔒</div>
                    <h3 className="text-2xl font-bold text-white mb-3">Live Voting is hidden</h3>
                    <p className="text-slate-400 max-w-md mx-auto">
                        Results will be revealed after voting ends.
                    </p>
                    <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20">
                        <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></div>
                        <span className="text-amber-400 text-sm font-medium">
                            {votingStarted ? 'Voting is in progress' : 'Voting has not started'}
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    // Show empty state if no candidates
    if (!candidates || candidates.length === 0) {
        return (
            <div className="glass-panel rounded-3xl p-8 mb-12 relative overflow-hidden">
                {/* Background Accent */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>

                <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                            <span className="text-2xl">📊</span>
                            Live Voting Results
                        </h2>
                        <p className="text-slate-400 mt-1 text-sm">Real-time visualization of vote distribution</p>
                    </div>
                    <div className="bg-white/5 px-4 py-2 rounded-full text-sm font-bold text-slate-300">
                        Total: <span className="text-purple-400">0</span> votes
                    </div>
                </div>

                <div className="py-16 text-center">
                    <div className="text-5xl mb-4 opacity-50">📈</div>
                    <h3 className="text-xl font-semibold text-slate-400 mb-2">No Candidates Registered Yet</h3>
                    <p className="text-slate-500">Charts will appear once candidates are registered.</p>
                </div>
            </div>
        );
    }

    // --- Data Preparation ---
    // Format candidate data for Recharts
    const chartData = candidates.map((c, index) => ({
        name: `#${c.id + 1}`, // Label
        address: c.address.slice(0, 6) + '...' + c.address.slice(-4), // Shortened address
        votes: c.votes, // Numeric vote count
        fill: COLORS[index % COLORS.length] // Color assignment
    }));

    const totalVotes = chartData.reduce((sum, item) => sum + item.votes, 0);

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-slate-900/95 backdrop-blur-md border border-white/10 rounded-xl p-4 shadow-xl">
                    <p className="text-white font-bold mb-1">Candidate {data.name}</p>
                    <p className="text-slate-400 text-xs font-mono mb-2">{data.address}</p>
                    <p className="text-indigo-400 font-bold text-lg">{data.votes} votes</p>
                    {totalVotes > 0 && (
                        <p className="text-slate-500 text-xs mt-1">
                            {((data.votes / totalVotes) * 100).toFixed(1)}% of total
                        </p>
                    )}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="glass-panel rounded-3xl p-8 mb-12 relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>

            <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <span className="text-2xl">📊</span>
                        Live Voting Results
                    </h2>
                    <p className="text-slate-400 mt-1 text-sm">Real-time visualization of vote distribution</p>
                </div>
                <div className="bg-white/5 px-4 py-2 rounded-full text-sm font-bold text-slate-300">
                    Total: <span className="text-purple-400">{totalVotes}</span> votes
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Bar Chart */}
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <span className="w-1.5 h-5 bg-indigo-500 rounded-full"></span>
                        Vote Count
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                                    allowDecimals={false}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                                <Bar
                                    dataKey="votes"
                                    radius={[8, 8, 0, 0]}
                                    maxBarSize={60}
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Pie Chart */}
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <span className="w-1.5 h-5 bg-purple-500 rounded-full"></span>
                        Vote Distribution
                    </h3>
                    <div className="h-64">
                        {totalVotes > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={80}
                                        paddingAngle={2}
                                        dataKey="votes"
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} stroke="transparent" />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend
                                        formatter={(value, entry) => (
                                            <span className="text-slate-300 text-xs">{entry.payload.name}</span>
                                        )}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center">
                                <p className="text-slate-500 italic">No votes cast yet</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VotingChart;
