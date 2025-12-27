# Evoting - Decentralized Voting Application

This project is a decentralized voting application (DApp) built on the Ethereum blockchain. It consists of a Solidity smart contract backend and a React frontend, allowing for secure, transparent, and tamper-proof voting processes.

## 🚀 Features

- **Admin Dashboard**:
  - Claim ownership of the voting contract.
  - Register candidates.
  - Whitelist voters.
  - Start and stop the voting process.
  - Option to hide/show vote counts during the election.
- **Voter Interface**:
  - Secure voting using MetaMask (or compatible Web3 wallet).
  - Real-time voting status.
  - View voting history.
- **Real-time Results**:
  - Visual representation of voting results using charts.
  - Live updates of vote counts (when visible).

## 🛠 Technology Stack

### Backend (Blockchain)
- **Solidity**: Smart contract programming language.
- **Hardhat**: Development environment for compiling, deploying, and testing smart contracts.
- **Ethers.js**: Library for interacting with the Ethereum blockchain.

### Frontend
- **React**: UI library for building the web interface.
- **Vite**: Next Generation Frontend Tooling.
- **Tailwind CSS**: Utility-first CSS framework for styling.
- **Recharts**: For displaying voting data charts.
- **React Hot Toast**: For user notifications.

## 📂 Project Structure

```
Evoting/
├── backend/            # Smart contract and deployment scripts
│   ├── contracts/      # Solidity source files (Evoting.sol)
│   ├── scripts/        # Deployment scripts
│   └── hardhat.config.js # Hardhat configuration
├── frontend/           # React application
│   ├── src/
│   │   ├── components/ # React components (AdminPanel, VoterPanel, etc.)
│   │   ├── contracts/  # ABI and Contract Address
│   │   └── ...
│   └── ...
└── README.md           # Project documentation
```

## 🏁 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [MetaMask](https://metamask.io/) browser extension installed.

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Evoting
   ```

2. **Backend Setup (Smart Contract)**
   
   Navigate to the backend directory:
   ```bash
   cd backend
   ```
   
   Install dependencies:
   ```bash
   npm install
   ```
   
   Compile the smart contract:
   ```bash
   npx hardhat compile
   ```
   
   Start a local Hardhat node (optional, for local testing):
   ```bash
   npx hardhat node
   ```
   
   Deploy the contract (open a new terminal if running local node):
   ```bash
   # For local network (localhost)
   npx hardhat run scripts/deploy.js --network localhost
   
   # For Sepolia testnet (requires .env configuration)
   npx hardhat run scripts/deploy.js --network sepolia
   ```
   
   > **Note:** After deployment, make sure to update the contract address in the frontend configuration if it's not automated.

3. **Frontend Setup**
   
   Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
   
   Install dependencies:
   ```bash
   npm install
   ```
   
   Start the development server:
   ```bash
   npm run dev
   ```
   
   Open your browser and navigate to the URL provided (usually `http://localhost:5173`).

## 📜 Smart Contract Functions

The `Evoting.sol` contract includes the following key functions:

- `claimOwnership()`: Claim admin rights (first caller).
- `addCandidate(address)`: Add a new candidate (Admin only).
- `registerVoter(address)`: Whitelist a voter address (Admin only).
- `startVoting()` / `stopVoting()`: Control the voting period.
- `vote(address)`: Cast a vote for a candidate.
- `setHideVotes(bool)`: Toggle visibility of vote counts.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
