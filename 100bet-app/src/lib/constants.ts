import { Address } from 'viem';

// Read using import.meta.env for Vite client-side access
export const USDT_ADDRESS = (import.meta.env.VITE_USDT_CONTRACT_ADDRESS || '0x') as Address;
export const CONTRACT_ADDRESS = (import.meta.env.VITE_CONTRACT_ADDRESS || '0x') as Address;
export const ADMIN_PRIVATE_KEY = import.meta.env.VITE_ADMIN_PRIVATE_KEY || '';
export const RPC_URL = import.meta.env.VITE_RPC_URL || '';
export const CHAIN_ID = parseInt(import.meta.env.VITE_CHAIN_ID || "84532");

// Validate critical environment variables
if (!USDT_ADDRESS || USDT_ADDRESS === '0x') {
    console.error("VITE_USDT_CONTRACT_ADDRESS is not set in .env file.");
}
if (!CONTRACT_ADDRESS || CONTRACT_ADDRESS === '0x') {
    console.error("VITE_CONTRACT_ADDRESS is not set in .env file. Deploy the contract first.");
}
if (!ADMIN_PRIVATE_KEY) {
    console.warn("VITE_ADMIN_PRIVATE_KEY is not set in .env file. Admin panel will not function.");
}
if (!RPC_URL) {
    console.warn("VITE_RPC_URL is not set in .env file. Using default public RPC.");
}

// --- Game Constants ---
export const BET_AMOUNT_USDT_STR = "0.1"; // For display
export const BET_AMOUNT_WEI = 100000n; // 0.1 USDT assuming 6 decimals (adjust if USDT decimals differ)
export const USDT_DECIMALS = 6; // Common USDT decimals - VERIFY for the specific token!
export const MAX_NUMBER = 100;

export const REFETCH_INTERVAL = 15000; // 15 seconds for refetching game data 