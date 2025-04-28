import { useReadContracts } from 'wagmi';
import { bet100ContractConfig } from '../config/contracts';
import { REFETCH_INTERVAL } from '../lib/constants';

// TODO: Define return type for game data

export function useGameData() {
  // TODO: Implement logic to read currentRoundId, getRoundInfo, user stakes, etc.
  // Use useReadContracts for batching reads.

  const { data, isLoading, error, refetch } = useReadContracts({
      contracts: [
        {
            ...bet100ContractConfig,
            functionName: 'currentRoundId',
        },
        // Add more contract reads here (e.g., getRoundInfo(currentRoundId))
        // Need to handle dependent reads (get round ID first, then get info for that ID)
      ],
      query: {
        refetchInterval: REFETCH_INTERVAL, // Refetch data periodically
        // select: (data) => { /* TODO: Process raw contract data */ return processedData; }
      }
  });

  // TODO: Process the raw data from useReadContracts into a structured gameData object
  const gameData = null; // Placeholder

  return {
    gameData,
    isLoadingGameData: isLoading,
    errorGameData: error,
    refetchGameData: refetch,
  };
} 