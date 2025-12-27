const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

// ==========================================
// Deployment Script
// ==========================================
// This script deploys the Smart Contract to the local blockchain (Hardhat Network).
async function main() {
    // 1. Get the Contract Factory
    // This allows Hardhat to know which contract we want to deploy.
    const Evoting = await hre.ethers.getContractFactory("Evoting");

    // 2. Deploy the Contract
    // Triggers the deployment transaction.
    const evoting = await Evoting.deploy();

    // 3. Wait for Deployment to Finish
    // Ensures the contract is mined and active on the blockchain.
    await evoting.waitForDeployment();

    // 4. Get the Deployed Address
    const address = await evoting.getAddress();
    console.log(`Evoting deployed to: ${address}`);

    // 5. Save the Contract Address to Frontend
    // This allows the React app to know where to find the contract.
    const addressDir = path.join(__dirname, "../../frontend/src/contracts");

    if (!fs.existsSync(addressDir)) {
        fs.mkdirSync(addressDir, { recursive: true });
    }

    // Writes the address to 'contract-address.json'
    fs.writeFileSync(
        path.join(addressDir, "contract-address.json"),
        JSON.stringify({ address: address }, null, 2)
    );
}

// Execute the main function and handle errors
main()
    .then(() => {
        console.log("Deployment completed successfully!");
        // Delay exit to allow proper cleanup (fixes Windows assertion error)
        setTimeout(() => process.exit(0), 1000);
    })
    .catch((error) => {
        console.error(error);
        setTimeout(() => process.exit(1), 1000);
    });
