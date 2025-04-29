import { useState, useCallback, useEffect, useMemo } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useAccount, useReadContract } from 'wagmi';
import { usdtContractConfig, bet100ContractConfig } from '../config/contracts'; // Uncommented
import { BET_AMOUNT_WEI, CONTRACT_ADDRESS } from '../lib/constants'; // Uncommented CONTRACT_ADDRESS
import { toast } from 'react-toastify';
// import { maxUint256 } from 'viem'; // Remove this import
import { erc20Abi } from '../config/abis/erc20Abi';
// import { numberBetAbi } from '../config/abis/numberBetAbi'; // Commented out as unused
import { NUMBER_BET_ADDRESS, BETTING_TOKEN_ADDRESS } from '../config/constants';
// import { formatUnits } from 'viem'; // Commented out as unused

export function useBetting() {
  const { address } = useAccount();
  const [isActionPending, setIsActionPending] = useState(false);

  // Fetch allowance
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: BETTING_TOKEN_ADDRESS,
    abi: erc20Abi,
    functionName: 'allowance',
    args: [address!, NUMBER_BET_ADDRESS],
    query: { enabled: !!address }
  });

  const { writeContractAsync: approveAsync, data: approveTxHash } = useWriteContract();
  const { isLoading: isConfirmingApproval } = useWaitForTransactionReceipt({ hash: approveTxHash });

  // Determine if approval is needed
  const needsApproval = useMemo(() => {
    // Ensure both allowance and the constant are valid numbers before comparing
    const currentAllowance = typeof allowance === 'bigint' ? allowance : -1n; // Use -1n if undefined/not bigint
    const requiredAmount = typeof BET_AMOUNT_WEI === 'bigint' ? BET_AMOUNT_WEI : 0n; // Use 0n if undefined/not bigint
    return currentAllowance >= 0n && currentAllowance < requiredAmount;
  }, [allowance]);

  const approve = useCallback(async () => {
    if (!address || !needsApproval) return false;
    setIsActionPending(true);
    const toastId = toast.loading("Requesting USDT approval...");
    try {
      await approveAsync({
        ...usdtContractConfig,
        functionName: 'approve',
        args: [CONTRACT_ADDRESS, maxUint256], // Corrected to lowercase
      });
      toast.update(toastId, { render: "Approval sent, awaiting confirmation...", type: "info", isLoading: true });
      // Success/failure toast handled by effect watching isConfirmingApproval / isApprovalSuccess
      return true;
    } catch (error: any) {
      console.error("Approval failed:", error);
      toast.update(toastId, { render: `Approval failed: ${error.shortMessage || error.message}`, type: "error", isLoading: false, autoClose: 5000 });
      setIsActionPending(false);
      return false;
    }
  }, [address, needsApproval, approveAsync]);

  // --- Bet Placement --- 
  const { writeContractAsync: placeBetAsync, data: placeBetTxHash } = useWriteContract();
  const { isLoading: isConfirmingBet } = useWaitForTransactionReceipt({ hash: placeBetTxHash });

  const placeBet = useCallback(async (number: number) => {
    if (!address) return false;
    if (needsApproval) {
        toast.error("USDT Approval Required First");
        return false;
    }
    setIsActionPending(true);
    const toastId = toast.loading(`Placing bet on number ${number}...`);
    try {
      await placeBetAsync({
        ...bet100ContractConfig,
        functionName: 'placeBet',
        args: [number],
      });
      toast.update(toastId, { render: "Bet transaction sent, awaiting confirmation...", type: "info", isLoading: true });
      // Success/failure toast handled by effect watching isConfirmingBet / isBetSuccess
      return true;
    } catch (error: any) {
      console.error("Place bet failed:", error);
      toast.update(toastId, { render: `Bet failed: ${error.shortMessage || error.message}`, type: "error", isLoading: false, autoClose: 5000 });
       setIsActionPending(false);
       return false;
    }
  }, [address, placeBetAsync, needsApproval]);

  // TODO: Add effects to watch useWaitForTransactionReceipt results and update toasts/state
  // e.g., useEffect for approve confirmation
  // e.g., useEffect for bet confirmation
  useEffect(() => {
      if (!isConfirmingApproval && approveTxHash) { // Check hash to ensure it's from *this* hook call
          setIsActionPending(false);
          refetchAllowance(); // Refresh allowance after confirmation
          // Potentially trigger bet automatically if approval was the blocking step
      }
  }, [isConfirmingApproval, approveTxHash, refetchAllowance]);

  useEffect(() => {
      if (!isConfirmingBet && placeBetTxHash) { // Check hash
          setIsActionPending(false);
          // Refetch game data needed here
      }
  }, [isConfirmingBet, placeBetTxHash]);

  return {
    allowance,
    needsApproval,
    approve,
    placeBet,
    isApproving: isConfirmingApproval || (isActionPending && needsApproval), // Indicate pending if action started and approval needed
    isPlacingBet: isConfirmingBet || (isActionPending && !needsApproval),
    refetchAllowance
  };
} 