import React, { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract, useReadContracts } from 'wagmi';
import { formatUnits } from 'viem';
import { erc20Abi } from '../../config/abis/erc20Abi'; // Assuming you have a generic ERC20 ABI
import { numberBetAbi } from '../../config/abis/numberBetAbi'; // Assuming you have the NumberBet contract ABI
import { BETTING_TOKEN_ADDRESS, NUMBER_BET_ADDRESS } from '../../config/constants'; // Import contract addresses (updated name)
import { toast } from 'react-toastify'; // Import toast from react-toastify

// Default decimals if fetch fails or during loading
const DEFAULT_DECIMALS = 6;

// Type for tracking transaction confirmation
type ConfirmingTxType = 'approve' | 'bet' | null;

function BettingForm() {
  // Component State
  const [number, setNumber] = useState<string>(''); // User's guessed number input
  const [isApproving, setIsApproving] = useState<boolean>(false); // Loading state for approval transaction
  const [isPlacingBet, setIsPlacingBet] = useState<boolean>(false); // Loading state for place bet transaction
  const [allowance, setAllowance] = useState<bigint>(0n); // User's current token allowance for the NumberBet contract
  const [confirmingTxType, setConfirmingTxType] = useState<ConfirmingTxType>(null); // Track type of tx being confirmed

  // Wagmi Hooks
  const { address, isConnected } = useAccount(); // Get connected account details
  const { data: writeContractData, writeContract, isPending: isWritePending, error: writeError } = useWriteContract(); // Hook for contract write operations

  // Define contract configs
  const numberBetContractConfig = {
    address: NUMBER_BET_ADDRESS,
    abi: numberBetAbi,
  } as const;
  const bettingTokenContractConfig = {
    address: BETTING_TOKEN_ADDRESS,
    abi: erc20Abi,
  } as const;

  // Read token decimals and BET_AMOUNT in parallel
  const { data: contractReadsData, isLoading: isLoadingReads } = useReadContracts({
      contracts: [
          {
              ...bettingTokenContractConfig,
              functionName: 'decimals',
          },
          {
              ...numberBetContractConfig,
              functionName: 'BET_AMOUNT',
          },
      ],
      query: {
          enabled: isConnected,
          staleTime: Infinity,
      },
    });
  // Get decimals, falling back to default
  const tokenDecimals = contractReadsData?.[0]?.status === 'success' ? Number(contractReadsData[0].result) : DEFAULT_DECIMALS;
  // Get BET_AMOUNT from contract
  const contractBetAmount = contractReadsData?.[1]?.status === 'success' ? contractReadsData[1].result as bigint : undefined;

  // Fetch user's token allowance
  const { data: allowanceData, refetch: refetchAllowance } = useReadContract({
    ...bettingTokenContractConfig,
    functionName: 'allowance',
    args: [address!, NUMBER_BET_ADDRESS],
    query: {
      enabled: isConnected && !!address,
      refetchInterval: 10000,
    },
  });
  // Update allowance state
  useEffect(() => {
    if (allowanceData !== undefined) {
      setAllowance(allowanceData as bigint);
    }
  }, [allowanceData]);

  // Hook to wait for transaction confirmation
  const { data: txReceiptData, isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: writeContractData, // Hash of the transaction submitted by writeContract
  });

  // Refetch allowance and show toast after a transaction is confirmed or errors
  useEffect(() => {
    // Only run when confirmation status changes *and* we were expecting a confirmation
    if (isConfirmed && confirmingTxType) {
        const message = confirmingTxType === 'approve'
            ? "Approval successful!"
            : "Bet placed successfully!";
        toast.success(message);
        refetchAllowance();
        setIsApproving(false);
        setIsPlacingBet(false);
        // Reset number input after successful bet
        if (confirmingTxType === 'bet') setNumber('');
        setConfirmingTxType(null); // Reset confirmation type tracker
        console.log(`Transaction confirmed! Type: ${confirmingTxType}, Hash: ${writeContractData}`);
    }
    if (writeError && confirmingTxType) { // Check confirmingTxType here too
        const shortMessage = (writeError as any)?.shortMessage || writeError.message.split('(')[0] || "Transaction failed";
        toast.error(`Error (${confirmingTxType}): ${shortMessage}`);
        console.error(`Transaction failed (${confirmingTxType}):`, writeError);
        setIsApproving(false);
        setIsPlacingBet(false);
        setConfirmingTxType(null); // Reset confirmation type tracker
    }
     // Dependencies: confirmation status, error status, tx type tracker, refetch
  }, [isConfirmed, writeError, confirmingTxType, refetchAllowance, writeContractData]); // Added confirmingTxType

  // Function to handle the "Approve" button click
  const handleApprove = () => {
    // Approve for the exact BET_AMOUNT required by the contract
    if (!contractBetAmount) {
        toast.error("Could not determine bet amount from contract.");
        return;
    }
    setIsApproving(true);
    setConfirmingTxType('approve'); // Set type before calling write
    writeContract({
      ...bettingTokenContractConfig,
      functionName: 'approve',
      args: [NUMBER_BET_ADDRESS, contractBetAmount], // Approve the specific contract amount
    });
  };

  // Function to handle the "Place Bet" button click
  const handlePlaceBet = () => {
    // Validate number input
    if (!number) return; // Basic check
    const numberParsed = parseInt(number, 10);
    if (isNaN(numberParsed) || numberParsed < 1 || numberParsed > 100) {
        toast.error("Please enter a number between 1 and 100.");
        return;
    }

    // Check connection and ensure BET_AMOUNT is loaded
    if (!isConnected || contractBetAmount === undefined) {
        toast.error("Cannot place bet. Check connection or contract data.");
        return;
    }

    // Check if allowance is sufficient for the *actual* BET_AMOUNT
    if (allowance < contractBetAmount) {
        toast.error(`Insufficient allowance. Please approve at least ${formatUnits(contractBetAmount, tokenDecimals)} tokens.`);
        // Technically, the Approve button should be shown, but this is a safeguard
        return;
    }

    setIsPlacingBet(true);
    setConfirmingTxType('bet'); // Set type before calling write
    // Call the placeBet function on the NumberBet contract with only the number
    writeContract({
      ...numberBetContractConfig,
      functionName: 'placeBet',
      args: [numberParsed], // Argument: _number ONLY
    });
  };

  // Determine if the user needs to approve tokens for the fixed BET_AMOUNT
  const needsApproval = isConnected && contractBetAmount !== undefined && allowance < contractBetAmount;
  // Determine if the number input is valid
  const isNumberValid = !!number && parseInt(number, 10) >= 1 && parseInt(number, 10) <= 100;
  // Determine if the Place Bet button should be enabled
  const canPlaceBet = isConnected && isNumberValid && !needsApproval && !isPlacingBet && !isApproving && !isConfirming && contractBetAmount !== undefined;
  // Determine if the Approve button should be enabled
  const canApprove = isConnected && needsApproval && !isApproving && !isPlacingBet && !isConfirming && contractBetAmount !== undefined;

  // Overall loading state
  const isLoading = isApproving || isPlacingBet || isConfirming || isWritePending || isLoadingReads;

  // Format BET_AMOUNT for display
  const formattedBetAmount = contractBetAmount !== undefined ? formatUnits(contractBetAmount, tokenDecimals) : 'Loading...';

  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">Place Your Bet</h2>
      {/* Number Input */} 
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="number">
          Guess a number (1-100)
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="number"
          type="number"
          placeholder="Enter your guess"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          min="1"
          max="100"
          disabled={isLoading}
        />
      </div>

      {/* Fixed Bet Amount Display & Allowance Info */}
      <div className="mb-6 bg-gray-50 p-4 rounded border border-gray-200">
         <div className="flex justify-between items-center mb-2">
             <span className="text-gray-700 text-sm font-bold">Bet Amount (Fixed):</span>
             <span className="text-gray-900 font-semibold">
                {formattedBetAmount} Token{/* Display formatted fixed amount */}
             </span>
         </div>
         {isConnected && address && (
            <div className="flex justify-between items-center text-xs">
                 <span className="text-gray-600">Your Allowance:</span>
                 <span className="text-gray-800">
                     {formatUnits(allowance, tokenDecimals)} Token {/* Use fetched decimals */}
                 </span>
            </div>
        )}
         {/* Optional: Add input for approve check amount if needed for UI reasons, but hide it or make read-only */}
         {/* <input type="hidden" value={approveCheckAmount} onChange={(e) => setApproveCheckAmount(e.target.value)} /> */}
      </div>


      {/* Action Buttons: Approve or Place Bet */}
      <div className="flex items-center justify-center">
        {needsApproval ? (
          // Show Approve button if allowance is insufficient for BET_AMOUNT
          <button
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed"
            type="button"
            onClick={handleApprove} // Call approve function
            disabled={!canApprove || isLoading} // Disable if approval not needed/possible or loading
          >
            {/* Use confirmingTxType to adjust message */}
            {isApproving || (isConfirming && confirmingTxType === 'approve') ? 'Approving...' : `Approve ${formattedBetAmount} Token`}
          </button>
        ) : (
          // Show Place Bet button if allowance is sufficient
          <button
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed"
            type="button"
            onClick={handlePlaceBet} // Call place bet function
            disabled={!canPlaceBet || isLoading} // Disable if bet cannot be placed or loading
          >
            {/* Use confirmingTxType to adjust message */}
            {isPlacingBet || (isConfirming && confirmingTxType === 'bet') ? 'Placing Bet...' : 'Place Bet'}
          </button>
        )}
      </div>
      {/* Transaction Confirmation Message */} 
      {isConfirming && confirmingTxType && <p className="text-blue-500 text-xs italic text-center mt-2">Waiting for {confirmingTxType} confirmation...</p>}
    </div>
  );
}

export default BettingForm;