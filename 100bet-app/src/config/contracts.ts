// export type Address = `0x${string}`;

// import { Address } from 'viem'; // Commented out
import { CONTRACT_ADDRESS /*, USDT_ADDRESS */ } from '../lib/constants'; // Commented out USDT_ADDRESS
import Bet100Abi from '../contracts/abi/Bet100.json';
import Erc20Abi from '../contracts/abi/ERC20.json';

export const bet100ContractConfig = {
  address: CONTRACT_ADDRESS,
  abi: Bet100Abi,
} as const;

export const usdtContractConfig = {
  address: '0x...', // TODO: Add actual USDT address for the target chain
  abi: Erc20Abi,
} as const; 