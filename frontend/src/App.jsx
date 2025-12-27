import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import toast, { Toaster } from 'react-hot-toast';

// --- Component Imports ---
import Navbar from './components/Navbar';
import AdminPanel from './components/AdminPanel';
import VoterPanel from './components/VoterPanel';
import WinnerCard from './components/WinnerCard';
import LoadingOverlay from './components/LoadingOverlay'; // Import Loader
import HistoryVotes from './components/HistoryVotes';
import VotingChart from './components/VotingChart';

// --- Contract Imports ---
// 1. The ABI (Application Binary Interface) tells us what functions exist in the contract.
import EvotingArtifact from './contracts/Evoting.json';
// 2. The Address tells us where to find the contract on the blockchain.
import ContractAddress from './contracts/contract-address.json';

const CONTRACT_ADDRESS = ContractAddress.address;

// ==========================================
// Main Application Component
// ==========================================
function App() {
  // --- State Management ---
  // Stores the current user's wallet address.
  const [account, setAccount] = useState(null);

  // Stores the connected contract instance (to call functions).
  const [contract, setContract] = useState(null);

  // Check if the current user is the Admin (Owner).
  const [isOwner, setIsOwner] = useState(false);

  // Check if the contract has NO Owner yet (Dynamic Assignment).
  const [isAdminUnclaimed, setIsAdminUnclaimed] = useState(false);

  // Controls visibility of the main app (Dashboard).
  // Separate from 'account' to allow "connection" without "entry".
  const [isAppEntered, setIsAppEntered] = useState(false);

  // Stores global voting status (Started/Ended).
  const [votingStatus, setVotingStatus] = useState({ start: false, end: false });

  // Stores list of candidates.
  const [candidates, setCandidates] = useState([]);

  // Stores history of all votes.
  const [history, setHistory] = useState([]);

  // Stores winner data (only if voting ended).
  const [winner, setWinner] = useState(null);

  // Global Loading State for async operations.
  const [isLoading, setIsLoading] = useState(false);

  // Hide Votes State - controlled by admin
  const [hideVotes, setHideVotes] = useState(false);

  // --- Functions ---

  // Function: Connect Wallet (Navbar Action)
  // ONLY handles wallet connection, does not enter the app.
  // Function: Connect Wallet (Navbar Action)
  // ONLY handles wallet connection, does not enter the app.
  const connectWallet = async () => {
    if (window.ethereum) { // Check if MetaMask is installed
      try {
        // Force MetaMask to show account selection screen
        await window.ethereum.request({
          method: 'wallet_requestPermissions',
          params: [{ eth_accounts: {} }],
        });

        // After permission is granted/account selected, get the accounts
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

        setAccount(accounts[0]); // Save the first account found
        setupContract(accounts[0]); // Setup contract but don't enter app yet
        toast.success("Wallet connected!");
      } catch (error) {
        console.error("Connection failed", error);
        // Don't show error if user just closed the popup
        if (error.code !== 4001) {
          toast.error("Connection failed");
        }
      }
    } else {
      alert("Please install Metamask!");
    }
  };

  // Function: Enter App (Landing Page Action)
  // Handles strict role validation before allowing entry.
  const enterApp = async (role) => {
    if (!account) {
      toast.error("Please connect metamask account", {
        icon: '🦊',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
      return;
    }

    if (!contract) {
      toast.error("Contract not loaded. Please wait or refresh.");
      return;
    }

    // Refresh owner status to be sure
    const owner = await contract.owner();
    const zeroAddress = "0x0000000000000000000000000000000000000000";
    const contractOwner = owner.toLowerCase();
    const userAccount = account.toLowerCase();
    const isUserOwner = contractOwner === userAccount;


    // ---------------------------------------------------------
    // CASE: Admin Unclaimed -> Offer to Claim
    // ---------------------------------------------------------
    if (owner === zeroAddress) {
      if (role === 'admin') {
        // Check if user is a registered voter
        let isRegisteredVoter = false;
        try {
          isRegisteredVoter = await contract.isVoterRegistered(account);
        } catch (e) { console.error("Error checking voter registration:", e); }

        if (isRegisteredVoter) {
          toast.error("Access Denied: Registered Voters cannot claim Admin access.", {
            icon: '🚫',
          });
          return;
        }

        toast((t) => (
          <div className="flex flex-col gap-2">
            <span className="font-medium text-slate-200">
              No Administrator found.<br />
              Do you want to claim Admin access?
            </span>
            <div className="flex gap-2 justify-end mt-1">
              <button
                onClick={() => toast.dismiss(t.id)}
                className="px-3 py-1 text-sm rounded-md bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
              >
                No
              </button>
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  handleClaimAdmin();
                }}
                className="px-3 py-1 text-sm rounded-md bg-amber-500 hover:bg-amber-600 text-black font-bold transition-colors shadow-sm"
              >
                Yes, Claim
              </button>
            </div>
          </div>
        ), {
          duration: 8000,
          icon: '👑',
        });
        return;
      } else if (role === 'voter') {
        // If no admin, block voters from entering.
        toast.error("System requires an Administrator first. Please wait for an Admin to claim access.", {
          icon: '⏳',
          duration: 5000
        });
        return;
      }
    }

    // ---------------------------------------------------------
    // CASE: Normal Role Checks
    // ---------------------------------------------------------
    if (role === 'admin') {
      if (isUserOwner) {
        setIsAppEntered(true);
        toast.success("Welcome, Administrator");
      } else {
        toast.error("Access Denied: You are not the Admin.", { duration: 4000 });
      }
    } else if (role === 'voter') {
      if (isUserOwner) {
        toast.error("You are Admin. Please log in as Admin.", { duration: 4000 });
      } else {
        // NEW: Check if this user is actually a registered voter
        let isRegistered = false;
        try {
          isRegistered = await contract.isVoterRegistered(userAccount);
        } catch (e) {
          console.error("Check voter failed", e);
          toast.error("Connection error. Please try again.");
          return;
        }

        if (!isRegistered) {
          toast.error("Access Denied: You are not registered to vote.", {
            icon: '🚫',
            duration: 4000
          });
        } else {
          setIsAppEntered(true);
          toast.success("Welcome, Voter");
        }
      }
    }
  };

  // Function: Setup Contract Connection
  // Creates the ethers.js contract instance to interact with the blockchain.
  const setupContract = async (currentAccount) => {
    console.log("Setup Contract called with:", currentAccount);

    if (!ethers.isAddress(CONTRACT_ADDRESS)) {
      console.error("Invalid Contract Address!");
      return;
    }

    // 1. Create a Provider
    const provider = new ethers.BrowserProvider(window.ethereum);

    // 2. Create a Signer
    const signer = await provider.getSigner();

    // 3. Create the Contract Instance
    const tmpContract = new ethers.Contract(CONTRACT_ADDRESS, EvotingArtifact.abi, signer);
    setContract(tmpContract);

    // 4. Check Ownership Status
    const owner = await tmpContract.owner();
    const zeroAddress = "0x0000000000000000000000000000000000000000";

    const contractOwner = owner.toLowerCase();
    const userAccount = currentAccount.toLowerCase();
    const isOwner = contractOwner === userAccount;

    if (owner === zeroAddress) {
      setIsAdminUnclaimed(true);
      setIsOwner(false);
    } else {
      setIsAdminUnclaimed(false);
      setIsOwner(isOwner);
    }

    // 5. Fetch Initial Data from Blockchain
    fetchData(tmpContract);
  };

  // Function: Claim Admin Access
  const handleClaimAdmin = async () => {
    if (!contract) return;
    try {
      setIsLoading(true);
      const tx = await contract.claimOwnership();
      await tx.wait();

      // Refresh logic after claim
      const owner = await contract.owner();
      const currentAccount = account;
      setIsAdminUnclaimed(false);
      setIsOwner(owner.toLowerCase() === currentAccount.toLowerCase());
      toast.success("Successfully claimed Admin access!", { icon: '👑' });
      fetchData(contract); // Refresh data
    } catch (error) {
      console.error("Claim Admin Failed:", error);
      toast.error("Failed to claim admin access.");
    } finally {
      setIsLoading(false);
    }
  };

  // Function: Fetch All Data from Blockchain
  const fetchData = async (contractInstance) => {
    try {
      // Step A: Fetch Voting Status (Start/End)
      let currentStatus = { start: false, end: false };
      try {
        const start = await contractInstance.votingStart();
        const end = await contractInstance.votingEnd();
        const hide = await contractInstance.hideVotes();
        currentStatus = { start, end };
        setVotingStatus(currentStatus);
        setHideVotes(hide);
      } catch (e) { console.warn("Could not fetch voting status", e); }

      // Step B: Fetch Candidates
      let formattedCandidates = [];
      try {
        const candidatesData = await contractInstance.getAllCandidates();
        formattedCandidates = candidatesData.map((c, i) => ({
          address: c.addr_candidate,
          votes: Number(c.num_votes),
          id: i
        }));
      } catch (err) {
        console.warn("getAllCandidates failed, falling back to loop:", err);
        let i = 0;
        while (true) {
          try {
            const c = await contractInstance.candidate(i);
            formattedCandidates.push({
              address: c.addr_candidate,
              votes: Number(c.num_votes),
              id: i
            });
            i++;
          } catch { break; }
        }
      }
      setCandidates(formattedCandidates);

      // Step C: Fetch Vote History
      try {
        const historyData = await contractInstance.getVoteHistory();
        setHistory(historyData);
      } catch (e) { console.warn("Could not fetch vote history", e); }

      // Step D: Calculate Winner
      if (currentStatus.end) {
        try {
          const w = await contractInstance.Winner();
          const winnersList = Array.from(w[0]);
          setWinner({
            addresses: winnersList,
            votes: Number(w[1])
          });
        } catch (e) {
          console.warn("Fetch winner error:", e);
          setWinner(null);
        }
      } else {
        setWinner(null);
      }
    } catch (error) {
      console.error("Error fetching data", error);
    }
  };

  // Function: Disconnect Wallet (Navbar Action)
  // Resets all state to initial values.
  const disconnectWallet = () => {
    setAccount(null);
    setContract(null);
    setIsOwner(false);
    setIsAppEntered(false);
    setIsAdminUnclaimed(false);
    setCandidates([]);
    setWinner(null);
    toast.success("Wallet disconnected");
  };

  // --- useEffect Hook ---
  useEffect(() => {
    // NOTE: Auto-connection on load is DISABLED as per user request.
    // The user must explicitly connect their wallet first.

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          // Only update if we are already connected or if user explicitly initiates action
          // But if we want to stay disconnected until explicit action, strictly speaking we might
          // want to ignore this UNLESS we have a way to know if it was user-initiated.
          // However, usually listeners update state.
          // For "Default on first load = No account", simply NOT running the initial check is enough.
          // If user switches account in MM, it's okay to update UI if they were already connected?
          // Or if they weren't?

          // Current behavior: If they switch, we take the new one.
          // But on FIRST LOAD (refresh), we don't check.

          setAccount(accounts[0]);
          setupContract(accounts[0]);
          setIsAppEntered(false); // Reset entry on account change for security
        } else {
          // If MetaMask disconnects
          disconnectWallet();
        }
      });
    }

    return () => {
      if (window.ethereum && window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', () => { });
      }
    };
  }, []);

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          style: {
            background: '#1e293b', // Dark Slate 800
            color: '#f8fafc',      // Slate 50
            border: '1px solid #334155', // Slate 700
            borderRadius: '12px',
          },
          success: {
            iconTheme: {
              primary: '#10b981', // Emerald 500
              secondary: '#1e293b',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444', // Red 500
              secondary: '#1e293b',
            },
          },
        }}
      />

      {/* Global Loading Overlay */}
      {isLoading && <LoadingOverlay />}

      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] bg-indigo-900/20 rounded-full blur-[120px] mix-blend-screen opacity-50"></div>
        <div className="absolute top-[20%] -right-[10%] w-[50vw] h-[50vw] bg-purple-900/10 rounded-full blur-[100px] mix-blend-screen opacity-50"></div>
        <div className="absolute bottom-0 left-[20%] w-[60vw] h-[40vw] bg-blue-900/10 rounded-full blur-[120px] mix-blend-screen opacity-30"></div>
      </div>

      <Navbar
        account={account}
        connectWallet={connectWallet}
        disconnectWallet={disconnectWallet}
        isAppEntered={isAppEntered}
        onBack={() => setIsAppEntered(false)}
      />

      <main className="relative z-10 pt-32 pb-20 px-6 container mx-auto max-w-6xl">

        {!isAppEntered && (
          <div className="flex flex-col items-center justify-center min-h-[70vh]">

            {/* Hero Section */}
            <div className="text-center space-y-6 mb-16 relative z-10">
              <div className="inline-block mb-4 relative">
                <div className="absolute inset-0 bg-indigo-500 blur-3xl opacity-20 rounded-full"></div>
                <div className="relative bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-xl shadow-2xl">
                  <div className="text-6xl">🗳️</div>
                </div>
              </div>
              <h1 className="text-6xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-slate-300 tracking-tight">
                Secure Vote
              </h1>
              <p className="text-xl text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
                The future of decentralized governance. Transparent, immutable, and secure voting powered by blockchain technology.
              </p>
            </div>

            {/* Action Cards */}
            <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl relative z-10">

              {/* Admin Card */}
              <div className="group relative cursor-pointer" onClick={() => enterApp('admin')}>
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-600 rounded-3xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
                <div className="relative h-full bg-[#0B0E14]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 flex flex-col items-center text-center hover:border-amber-500/30 transition-all hover:-translate-y-1">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center mb-6 ring-1 ring-white/10">
                    <span className="text-3xl">👑</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Administrator</h3>
                  <p className="text-slate-400 mb-8 text-sm">Manage elections, register candidates, and oversee the voting process.</p>
                  <button className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold text-lg shadow-lg shadow-orange-500/20 group-hover:shadow-orange-500/40 group-hover:scale-[1.02] active:scale-[0.98] transition-all">
                    Connect as Admin
                  </button>
                </div>
              </div>

              {/* Voter Card */}
              <div className="group relative cursor-pointer" onClick={() => enterApp('voter')}>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
                <div className="relative h-full bg-[#0B0E14]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 flex flex-col items-center text-center hover:border-indigo-500/30 transition-all hover:-translate-y-1">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center mb-6 ring-1 ring-white/10">
                    <span className="text-3xl">👤</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Voter</h3>
                  <p className="text-slate-400 mb-8 text-sm">Participate in active elections and view real-time transparent results.</p>
                  <button className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 group-hover:scale-[1.02] active:scale-[0.98] transition-all">
                    Connect as Voter
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {isAppEntered && (
          <div className="space-y-12 animate-fadeIn">



            {/* Winner Section - Always visible with pending state */}
            <WinnerCard winner={winner} votingStatus={votingStatus} />

            {isOwner && (
              <AdminPanel
                contract={contract}
                candidates={candidates}
                votingStatus={votingStatus}
                hideVotes={hideVotes}
                refresh={() => fetchData(contract)}
                setIsLoading={setIsLoading}
              />
            )}

            {/* Vote Section */}
            <div id="vote-section" className="scroll-mt-24">
              <VoterPanel
                contract={contract}
                candidates={candidates}
                hideVotes={hideVotes}
                votingEnded={votingStatus?.end}
                refresh={() => fetchData(contract)}
                setIsLoading={setIsLoading}
              />
            </div>

            {/* Live Charts Section */}
            <div id="live-section" className="scroll-mt-24">
              <VotingChart candidates={candidates} hideVotes={hideVotes} votingStarted={votingStatus?.start} votingEnded={votingStatus?.end} />
            </div>

            {/* History Section */}
            <div id="history-section" className="scroll-mt-24">
              <HistoryVotes history={history} hideVotes={hideVotes} votingStarted={votingStatus?.start} votingEnded={votingStatus?.end} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
