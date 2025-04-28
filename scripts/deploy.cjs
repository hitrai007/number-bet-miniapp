// scripts/deploy.cjs (CommonJS syntax)
const hre = require("hardhat"); // Use require for Hardhat Runtime Environment
const { ethers, network } = hre; // Destructure ethers and network
const { BETTING_TOKEN_ADDRESS } = require("../hardhat.constants.cjs"); // Use require for HARDHAT constants

async function main() {
  // Log the network being deployed to
  console.log(`Deploying to network: ${network.name}`);

  // Get the deployer account(s)
  const signers = await ethers.getSigners(); // Get the array of signers
  console.log("Signers retrieved:", signers); // Log the signers array

  // Check if any signers were retrieved
  if (!signers || signers.length === 0) {
    throw new Error(`No signers found for network ${network.name}. Check 'accounts' configuration in hardhat.config.cjs and ensure PRIVATE_KEY env var is set correctly.`);
  }

  // Get the first signer as the deployer
  const deployer = signers[0];
  console.log("Deploying contracts with the account:", deployer.address);

  // Log the betting token address being used
  console.log("Using Betting Token Address:", BETTING_TOKEN_ADDRESS);

  // Check if the token address is valid (basic check)
  if (!BETTING_TOKEN_ADDRESS || !ethers.isAddress(BETTING_TOKEN_ADDRESS) || BETTING_TOKEN_ADDRESS === '0x0000000000000000000000000000000000000000') {
    throw new Error("Invalid or missing BETTING_TOKEN_ADDRESS in hardhat.constants.cjs");
  }

  // Get the contract factory for Bet100
  const Bet100 = await ethers.getContractFactory("Bet100");

  // Log deployment initiation
  console.log("Deploying Bet100...");

  // Deploy the contract, passing the token address and deployer address as owner
  const bet100 = await Bet100.deploy(BETTING_TOKEN_ADDRESS, deployer.address);

  // Wait for the deployment transaction to be mined
  await bet100.waitForDeployment();

  // Get the deployed contract address
  const deployedAddress = await bet100.getAddress();

  // Log the deployed contract address
  console.log(`Bet100 contract deployed to: ${deployedAddress}`);

  // Optional: Verify contract on Etherscan/Basescan if configured in hardhat config
  // console.log("Verifying contract...");
  // await hre.run("verify:verify", { // Use hre here as well
  //   address: deployedAddress,
  //   constructorArguments: [
  //     BETTING_TOKEN_ADDRESS,
  //     deployer.address
  //   ],
  // });
  // console.log("Contract verified (if verification was successful)");
}

// Standard Hardhat pattern to run the main function and handle errors
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 