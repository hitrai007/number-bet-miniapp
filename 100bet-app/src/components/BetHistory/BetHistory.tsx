// src/components/BetHistory/BetHistory.tsx
import { useMemo } from 'react';
import { useReadContracts, useAccount, useReadContract } from 'wagmi';
import { formatUnits } from 'viem';
import { numberBetAbi } from '../../config/abis/numberBetAbi';
import { NUMBER_BET_ADDRESS } from '../../config/constants.ts';
import { toast } from 'react-toastify';

function BetHistory() {
  // Get connected account details
  const { address, isConnected } = useAccount();

  // Define the contract config
  const numberBetContractConfig = {
    address: NUMBER_BET_ADDRESS,
    abi: numberBetAbi,
  } as const;

  // Read the current round ID first (using useReadContract for single read)
  const { data: currentRoundIdData, isLoading: isLoadingRoundId } = useReadContract({
    ...numberBetContractConfig,
    functionName: 'currentRoundId',
    query: {
        enabled: isConnected, // Only run if connected
        refetchInterval: 30000, // Refetch periodically
    }
  });
  const currentRoundId = currentRoundIdData as bigint | undefined;

  // Create contract read configurations for numbers 1-100 for the current round
  const userBetContracts = useMemo(() => {
    if (!isConnected || !address || currentRoundId === undefined) {
        return []; // Return empty array if not ready
    }
    // Create an array of contract read objects for numbers 1 to 100
    return Array.from({ length: 100 }, (_, i) => ({
      ...numberBetContractConfig,
      functionName: 'userBets',
      args: [currentRoundId, i + 1, address!], // args: [roundId, number, userAddress]
    }));
  }, [isConnected, address, currentRoundId, numberBetContractConfig]); // Recalculate when dependencies change

  // Read user bets for all numbers in the current round
  const { data: userBetsData, isLoading: isLoadingBets, error } = useReadContracts({
    contracts: userBetContracts,
    query: {
      enabled: isConnected && !!address && currentRoundId !== undefined && userBetContracts.length > 0, // Enable only when ready
      refetchInterval: 15000, // Refetch bets data periodically
    },
  });

  // Process the results to find which numbers the user has bet on
  const userBetNumbers = useMemo(() => {
    if (!userBetsData) return [];
    const numbers: number[] = [];
    // Iterate through the results
    userBetsData.forEach((result: any, index: number) => {
      // Check if the read was successful and the bet count (result) is greater than 0
      if (result?.status === 'success' && (result.result as bigint) > 0n) {
        numbers.push(index + 1); // Add the number (index + 1) to the list
      }
    });
    return numbers.sort((a, b) => a - b); // Sort numbers numerically
  }, [userBetsData]); // Recalculate when data changes

  // Do not render the component if the user is not connected
  if (!isConnected) {
    return null;
  }

  // Handle loading states
  const isLoading = isLoadingRoundId || (userBetContracts.length > 0 && isLoadingBets);

  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mt-6">
      <h3 className="text-xl font-semibold mb-4 text-center text-gray-700">Your Bets This Round</h3>
      {isLoading ? (
        // Show loading indicator
        <p className="text-center text-gray-500">Loading your bets...</p>
      ) : error ? (
        // Show error message
        <p className="text-center text-red-500">Error loading bets.</p>
      ) : userBetNumbers.length > 0 ? (
        // Display the list of numbers the user bet on
        <div className="flex flex-wrap gap-2 justify-center">
          {userBetNumbers.map((num: number) => (
            <span
              key={num} // Unique key for each number
              className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full"
            >
              {num} {/* Display the number */}
            </span>
          ))}
        </div>
      ) : (
        // Show message if no bets placed in the current round
        <p className="text-center text-gray-500">You haven't placed any bets this round.</p>
      )}
    </div>
  );
}

export default BetHistory; 