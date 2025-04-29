import { http, createConfig } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { farcasterFrame } from '@farcaster/frame-wagmi-connector';
import { QueryClient } from '@tanstack/react-query';

// Check if running in an iframe (Farcaster environment)
// const isFrame = typeof window !== 'undefined' && window.self !== window.top;

// Currently, the Farcaster connector seems necessary even for local dev
// if it handles the EIP-1193 provider injection.
const connectors = [farcasterFrame()];

export const config = createConfig({
  chains: [baseSepolia], // Use Base Sepolia
  // connectors: isFrame ? [farcasterFrame()] : [], // Use connector only in frame?
  connectors: connectors,
  transports: {
    [baseSepolia.id]: http(), // Use default public RPC for Base Sepolia
  },
  ssr: false, // Ensure Wagmi is client-side only for React
});

export const queryClient = new QueryClient(); 