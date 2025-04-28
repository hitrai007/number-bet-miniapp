require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const { ADMIN_PRIVATE_KEY, RPC_URL, CHAIN_ID } = process.env;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.17",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  typechain: {
    outDir: "./typechain-types",
    target: "ethers-v6", // Target ethers v6
  },
  networks: {
    basesepolia: {
      url: RPC_URL || "https://sepolia.base.org",
      accounts: ADMIN_PRIVATE_KEY ? [`0x${ADMIN_PRIVATE_KEY}`] : [],
      chainId: CHAIN_ID ? parseInt(CHAIN_ID) : 84532,
    },
    // Add other networks like mainnet if needed
    // base: {
    //   url: "https://mainnet.base.org",
    //   accounts: ADMIN_PRIVATE_KEY ? [`0x${ADMIN_PRIVATE_KEY}`] : [],
    //   chainId: 8453
    // }
  },
  mocha: {
    timeout: 40000,
  },
}; 