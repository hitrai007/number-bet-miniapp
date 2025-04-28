import { useState, useCallback } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { bet100ContractConfig } from '../config/contracts';
import { toast } from 'react-toastify';

export function useClaiming() {
  const { address } = useAccount();
  const [isActionPending, setIsActionPending] = useState(false);

  const { writeContractAsync: claimWinningsAsync, data: claimWinTxHash } = useWriteContract();
  const { isLoading: isConfirmingWinClaim } = useWaitForTransactionReceipt({ hash: claimWinTxHash });

  const { writeContractAsync: claimRefundAsync, data: claimRefundTxHash } = useWriteContract();
  const { isLoading: isConfirmingRefundClaim } = useWaitForTransactionReceipt({ hash: claimRefundTxHash });

  const claimWinnings = useCallback(async (roundId: bigint) => {
    if (!address || !roundId) return false;
    setIsActionPending(true);
    const toastId = toast.loading(`Claiming winnings for round ${roundId}...`);
    try {
      await claimWinningsAsync({
        ...bet100ContractConfig,
        functionName: 'claimWinnings',
        args: [roundId],
      });
      toast.update(toastId, { render: "Claim transaction sent, awaiting confirmation...", type: "info", isLoading: true });
      return true;
    } catch (error: any) {
      console.error("Claim winnings failed:", error);
      toast.update(toastId, { render: `Claim failed: ${error.shortMessage || error.message}`, type: "error", isLoading: false, autoClose: 5000 });
      setIsActionPending(false);
      return false;
    }
  }, [address, claimWinningsAsync]);

  const claimRefund = useCallback(async (roundId: bigint) => {
    if (!address || !roundId) return false;
    setIsActionPending(true);
    const toastId = toast.loading(`Claiming refund for round ${roundId}...`);
    try {
      await claimRefundAsync({
        ...bet100ContractConfig,
        functionName: 'claimRefund',
        args: [roundId],
      });
      toast.update(toastId, { render: "Refund claim transaction sent, awaiting confirmation...", type: "info", isLoading: true });
      return true;
    } catch (error: any) {
      console.error("Claim refund failed:", error);
      toast.update(toastId, { render: `Refund claim failed: ${error.shortMessage || error.message}`, type: "error", isLoading: false, autoClose: 5000 });
      setIsActionPending(false);
      return false;
    }
  }, [address, claimRefundAsync]);

   // TODO: Add effects for transaction confirmations

  return {
    claimWinnings,
    isClaimingWinnings: isConfirmingWinClaim || (isActionPending && !!claimWinTxHash), // Basic pending state
    claimRefund,
    isClaimingRefund: isConfirmingRefundClaim || (isActionPending && !!claimRefundTxHash),
  };
} 