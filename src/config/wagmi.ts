import { http, createConfig, fallback } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { farcasterFrame } from '@farcaster/frame-wagmi-connector';
import { QueryClient } from '@tanstack/react-query';

// Read directly from process.env which Vite replaces during build
const VITE_RPC_URL = process.env.VITE_RPC_URL;
const VITE_CHAIN_ID = parseInt(process.env.VITE_CHAIN_ID || "84532");

// Determine the target chain based on environment variable
const targetChain = VITE_CHAIN_ID === base.id ? base : baseSepolia;

if (!VITE_RPC_URL) {
    console.warn(`VITE_RPC_URL not set. Using default public RPC for chain ID ${targetChain.id}.`);
}

export const config = createConfig({
  chains: [targetChain],
  connectors: [
    farcasterFrame(),
    // Add other connectors like WalletConnect, MetaMask if needed for standalone testing
  ],
  transports: {
    [targetChain.id]: fallback([
        http(VITE_RPC_URL), // Use configured RPC if available
        http() // Default public RPC as fallback
    ]),
  },
  ssr: false, // Important for client-side rendering in Mini-Apps
});

export const queryClient = new QueryClient(); 