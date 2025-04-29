import { useState, useEffect } from 'react';
import { useAccount, useReadContracts, useWriteContract, useWaitForTransactionReceipt /*, useReadContract */ } from 'wagmi';
import { formatUnits, formatEther } from 'viem';
import { numberBetAbi } from '../../config/abis/numberBetAbi';
import { NUMBER_BET_ADDRESS } from '../../config/constants.ts';
import { toast } from 'react-toastify';

// Default decimals (replace if needed or fetch dynamically)
const DEFAULT_DECIMALS = 6;

interface RoundResultsProps {
  roundId: bigint; // The specific round ID to display results for
}

enum RoundStatus {
    Pending,
    Concluded,
    Cancelled
}

function RoundResults({ roundId }: RoundResultsProps) {
  // Component state
  const [isClaimingWinnings, setIsClaimingWinnings] = useState(false);
  const [isClaimingRefund, setIsClaimingRefund] = useState(false);

  // Wagmi hooks
  const { address, isConnected } = useAccount();
  const { data: writeContractData, writeContract, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: writeContractData });

  // Define contract config
  const numberBetContractConfig = {
    address: NUMBER_BET_ADDRESS,
    abi: numberBetAbi,
  } as const;

  // Define base contracts array
  const contractsToRead = [
    {
      ...numberBetContractConfig,
      functionName: 'rounds',
      args: [roundId],
    },
    // Conditionally add user-specific reads
    ...(isConnected && address ? [
        {
          ...numberBetContractConfig,
          functionName: 'userTotalStakeInRound',
          args: [roundId, address!],
        },
        {
          ...numberBetContractConfig,
          functionName: 'getClaimedWinnings',
          args: [roundId, address!],
        },
        {
          ...numberBetContractConfig,
          functionName: 'getRefundedAmount',
          args: [roundId, address!],
        }
    ] : []),
  ];

  // Read general round data
  const { data: roundData, isLoading: isLoadingRoundData, refetch } = useReadContracts({
    contracts: contractsToRead, // Pass the conditionally built array
    query: {
       enabled: isConnected && contractsToRead.length > 1, // Enable the hook if connected and user contracts are added
      // select: (data) => { ... process data ... }
    }
  });

  // Extract results safely (adjust indices if needed due to conditional inclusion)
  // If not connected, roundData will only contain the result for 'rounds'
  const roundInfo = roundData?.[0];
  const userTotalStake = isConnected ? roundData?.[1] : undefined;
  const claimedWinningsData = isConnected ? roundData?.[2] : undefined;
  const refundedAmountData = isConnected ? roundData?.[3] : undefined;

  // Extract round details from struct
  const roundDetails = roundInfo?.result as any; // Adjust type as needed based on ABI structure
  const userStake = userTotalStake?.result as bigint | undefined;
  const claimedWinningsAmount = claimedWinningsData?.result as bigint | undefined;
  const refundedAmount = refundedAmountData?.result as bigint | undefined;

  // Determine round status
  let status: RoundStatus = RoundStatus.Pending;
  if (roundDetails?.cancelled) {
    status = RoundStatus.Cancelled;
  } else if (roundDetails?.concluded) {
    status = RoundStatus.Concluded;
  }

  // Determine claim/refund eligibility
  const hasPlacedBet = userStake !== undefined && userStake > 0n;
  const hasAlreadyClaimedWinnings = claimedWinningsAmount !== undefined && claimedWinningsAmount > 0n;
  const hasAlreadyClaimedRefund = refundedAmount !== undefined && refundedAmount > 0n;

  const canClaimWinnings =
      status === RoundStatus.Concluded &&
      isConnected &&
      hasPlacedBet && // User must have placed a bet in this round
      roundDetails?.winningBetsOnNumber > 0n && // There must be winning bets on the winning number
      !hasAlreadyClaimedWinnings; // User must not have claimed winnings already

  const canClaimRefund =
      status === RoundStatus.Cancelled &&
      isConnected &&
      hasPlacedBet &&
      !hasAlreadyClaimedRefund; // User must not have claimed refund already

  // Format values
  const formattedPot = roundDetails?.totalPot !== undefined ? formatUnits(roundDetails.totalPot, DEFAULT_DECIMALS) : 'N/A';
  const formattedPlatformFee = roundDetails?.platformFeeAmount !== undefined ? formatEther(roundDetails.platformFeeAmount) : 'N/A';
  const formattedDistributablePot = roundDetails?.distributablePot !== undefined ? formatEther(roundDetails.distributablePot) : 'N/A';

  // Combined refetch function
  const refetchAll = () => {
      refetch();
  }

  // Handle transaction confirmation and errors
  useEffect(() => {
    if (isConfirmed && writeContractData) {
      const message = isClaimingWinnings ? "Winnings claimed successfully!" : isClaimingRefund ? "Refund claimed successfully!" : "Transaction confirmed!";
      toast.success(message);
      setIsClaimingWinnings(false);
      setIsClaimingRefund(false);
      refetchAll(); // Refetch all relevant data
    }
    if (writeError) {
      const shortMessage = (writeError as any)?.shortMessage || writeError.message.split('(')[0] || "Transaction failed";
      toast.error(`Claim Error: ${shortMessage}`);
      setIsClaimingWinnings(false);
      setIsClaimingRefund(false);
    }
    // Dependencies include state setters and refetch functions
  }, [isConfirmed, writeError, writeContractData, isClaimingWinnings, isClaimingRefund, refetchAll]);

  // --- Action Handlers ---
  const handleClaimWinnings = () => {
    if (!canClaimWinnings || !isConnected) return;
    setIsClaimingWinnings(true);
    writeContract({
      ...numberBetContractConfig,
      functionName: 'claimWinnings',
      args: [roundId],
    });
  };

  const handleClaimRefund = () => {
    if (!canClaimRefund || !isConnected) return;
    setIsClaimingRefund(true);
    writeContract({
      ...numberBetContractConfig,
      functionName: 'claimRefund',
      args: [roundId],
    });
  };

  // --- Render Logic ---
  const isLoading = isLoadingRoundData;
  if (isLoading) return <div className="text-sm text-center py-3">Loading results for round {roundId.toString()}...</div>;
  if (writeError) return <div className="text-sm text-center text-red-500 py-3">Error loading results for round {roundId.toString()}.</div>;
  if (!roundDetails) return <div className="text-sm text-center text-gray-500 py-3">No data found for round {roundId.toString()}.</div>;

  // Main component rendering
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg shadow-sm p-4 mb-4">
      <h4 className="font-semibold text-center text-gray-800 mb-3">Round {roundId.toString()} Results</h4>

      {/* Status: Cancelled */} 
      {status === RoundStatus.Cancelled && (
        <div className="text-center mb-3">
          <p className="text-yellow-600 font-medium">Round Cancelled</p>
          {canClaimRefund && (
            <button
              onClick={handleClaimRefund}
              disabled={isClaimingRefund || isConfirming}
              className="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded text-sm disabled:opacity-50"
            >
              {isClaimingRefund || isConfirming ? 'Processing...' : 'Claim Refund'}
            </button>
          )}
          {hasAlreadyClaimedRefund && (
            <p className="text-sm text-gray-500 mt-2">Refund already claimed.</p>
          )}
        </div>
      )}

      {/* Status: Concluded */} 
      {status === RoundStatus.Concluded && (
        <div className="text-center mb-3">
          <p className="text-lg">Winning Number: <span className="font-bold">{roundDetails.winningNumber.toString()}</span></p>
          <p className="text-sm">Total Pot: {formattedPot} Token</p>
          <p className="text-sm">Platform Fee: {formattedPlatformFee} USDT</p>
          <p className="text-sm">Distributed Pot: {formattedDistributablePot} USDT</p>
          {canClaimWinnings && (
            <button
              onClick={handleClaimWinnings}
              disabled={isClaimingWinnings || isConfirming}
              className="mt-2 bg-green-500 hover:bg-green-600 text-white px-4 py-1 rounded text-sm disabled:opacity-50"
            >
              {isClaimingWinnings || isConfirming ? 'Processing...' : 'Claim Winnings'}
            </button>
          )}
           {hasAlreadyClaimedWinnings && (
            <p className="text-sm text-green-700 mt-2">Winnings already claimed!</p>
           )}
           {/* Show message only if concluded and user didn't win/claim */}
           {!hasAlreadyClaimedWinnings && roundDetails.winningBetsOnNumber === 0n && <p className="text-xs text-gray-500 mt-1">You did not bet on the winning number.</p>}
        </div>
      )}

      {/* Status: In Progress / Not Concluded */} 
      {status === RoundStatus.Pending && (
        <p className="text-center text-sm text-gray-500">Round in progress or awaiting results...</p>
      )}

    </div>
  );
}

export default RoundResults; 