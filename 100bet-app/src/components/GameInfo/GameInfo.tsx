// src/components/GameInfo/GameInfo.tsx
import { useAccount, useReadContracts, useReadContract } from 'wagmi';
import { formatUnits } from 'viem';
import { numberBetAbi } from '../../config/abis/numberBetAbi';
import { NUMBER_BET_ADDRESS } from '../../config/constants.ts';

// Helper function to format timestamp (you might want a more sophisticated library like date-fns)
const formatTimestamp = (timestamp: bigint | undefined): string => {
  if (!timestamp || timestamp === 0n) return 'N/A';
  try {
    // Multiply by 1000 for milliseconds
    const date = new Date(Number(timestamp) * 1000);
    // Basic formatting, customize as needed
    return date.toLocaleString();
  } catch (e) {
    console.error("Error formatting timestamp:", e);
    return 'Invalid Date';
  }
};

const DEFAULT_DECIMALS = 6; // Assuming USDT has 6 decimals

function GameInfo() {
  const { isConnected } = useAccount();

  // Contract configuration
  const numberBetContractConfig = {
    address: NUMBER_BET_ADDRESS,
    abi: numberBetAbi,
  } as const;

  // Fetch currentRoundId first (using useReadContract)
  const { data: currentRoundIdData, /* isLoading: isLoadingRoundId, */ error: errorRoundId } = useReadContract({
      ...numberBetContractConfig,
      functionName: 'currentRoundId',
      query: {
          enabled: isConnected,
          refetchInterval: 30000, // Refetch every 30 seconds
      },
  });
  const currentRoundId = currentRoundIdData as bigint | undefined;

  // Fetch general round data and BET_AMOUNT once currentRoundId is available
  const { data: roundAndBetAmountData /*, isLoading: isLoadingRoundData */ } = useReadContracts({
    contracts: [
      {
        ...numberBetContractConfig,
        functionName: 'rounds',
        args: [currentRoundId!],
      },
      {
        ...numberBetContractConfig,
        functionName: 'BET_AMOUNT',
      },
    ],
    query: {
      enabled: isConnected && currentRoundId !== undefined, // Enable only when round ID is fetched
      refetchInterval: 60000, // Refetch round data every minute
    },
  });

  // Safely extract results
  const roundStructResult = roundAndBetAmountData?.[0];
  const betAmountResult = roundAndBetAmountData?.[1];

  const roundInfo = roundStructResult?.status === 'success' ? roundStructResult.result as any : undefined;
  const betAmount = betAmountResult?.status === 'success' ? betAmountResult.result as bigint : undefined;

  // Combine loading states
  // const isLoading = isLoadingRoundId || isLoadingRoundData;

  // Combine error states
  const error = errorRoundId; // Removed errorRoundData

  // Format values for display
  const formattedTotalPot = roundInfo?.totalPot !== undefined
    ? formatUnits(roundInfo.totalPot, DEFAULT_DECIMALS)
    : 'Loading...';
  const formattedBetAmount = betAmount !== undefined
    ? formatUnits(betAmount, DEFAULT_DECIMALS)
    : 'Loading...';
  const totalBetsCount = roundInfo?.totalBets?.toString() ?? 'Loading...';
  const playerCount = roundInfo?.playerCount?.toString() ?? 'Loading...';

  if (error) {
    console.error("Error fetching game info:", error);
    // Return a user-friendly error display
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline"> Could not load game information. Please try again later.</span>
      </div>
    );
  }

  // Render the game info
  return (
    <div className="bg-purple-100 border border-purple-300 text-purple-800 px-6 py-4 rounded-lg shadow-md mb-6 text-sm">
      <h3 className="text-lg font-semibold text-center mb-3">Current Round Info</h3>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        <div className="font-medium">Round ID:</div>
        <div>{currentRoundId !== undefined ? currentRoundId.toString() : 'N/A'}</div>

        <div className="font-medium">Betting Ends:</div>
        <div>{formatTimestamp(roundInfo?.bettingEnd)}</div>

        <div className="font-medium">Total Pot (Token):</div>
        <div>{formattedTotalPot}</div>

        <div className="font-medium">Your Stake (Token):</div>
        <div>{formattedBetAmount}</div>

        <div className="font-medium">Total Bets:</div>
        <div>{totalBetsCount}</div>

        <div className="font-medium">Players:</div>
        <div>{playerCount}</div>
      </div>
    </div>
  );
}

export default GameInfo; 