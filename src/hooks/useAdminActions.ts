import { useState, useCallback, useMemo } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
// import { Bet100 } from '../../typechain-types'; // Commented out
import { bet100ContractConfig } from '../config/contracts';
import { RPC_URL } from '../lib/constants';

// Function to create admin signer and contract instance
const getAdminContract = (adminPrivateKey: string): ethers.Contract | null => {
  if (!adminPrivateKey) return null;
  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(adminPrivateKey, provider);
    const contract = new ethers.Contract(bet100ContractConfig.address, bet100ContractConfig.abi, wallet) as unknown as ethers.Contract;
    return contract;
  } catch (error) {
    console.error("Failed to create admin contract instance:", error);
    toast.error("Failed to initialize admin wallet. Check private key format.");
    return null;
  }
};

export function useAdminActions(adminPrivateKey: string) {
  const [isActionPending, setIsActionPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const adminContract = useMemo(() => getAdminContract(adminPrivateKey), [adminPrivateKey]);

  const executeAdminTx = useCallback(async (actionName: string, txPromise: Promise<ethers.ContractTransactionResponse>) => {
    if (!adminContract) {
      setError("Admin contract not initialized.");
      toast.error("Admin action failed: Contract not initialized.");
      return false;
    }
    setIsActionPending(true);
    setError(null);
    const toastId = toast.loading(`Executing ${actionName}...`);
    try {
      const tx = await txPromise;
      toast.update(toastId, { render: `Tx sent (${actionName}), awaiting confirmation...`, isLoading: true });
      await tx.wait(); // Wait for 1 confirmation
      toast.update(toastId, { render: `${actionName} successful!`, type: "success", isLoading: false, autoClose: 5000 });
      setIsActionPending(false);
      return true;
    } catch (err: any) {
      console.error(`${actionName} failed:`, err);
      const errMsg = err.shortMessage || err.message || "Unknown error";
      toast.update(toastId, { render: `${actionName} failed: ${errMsg}`, type: "error", isLoading: false, autoClose: 5000 });
      setError(errMsg);
      setIsActionPending(false);
      return false;
    }
  }, [adminContract]);

  // --- Specific Admin Actions ---

  const drawWinner = useCallback((winningNumber: number) => {
    return executeAdminTx('Draw Winner', adminContract!.drawWinner(winningNumber));
  }, [executeAdminTx, adminContract]);

  const cancelGame = useCallback((refundFee: boolean) => {
      // Note: refundFee param might not exist depending on final contract implementation
    return executeAdminTx('Cancel Game', adminContract!.cancelGame(refundFee)); 
  }, [executeAdminTx, adminContract]);

  const refundBet = useCallback((user: string, roundId: bigint, number: number) => {
    return executeAdminTx('Refund Bet', adminContract!.refundBet(user, roundId, number));
  }, [executeAdminTx, adminContract]);

   const overrideWinner = useCallback((winningNumber: number) => {
    return executeAdminTx('Override Winner', adminContract!.overrideWinner(winningNumber));
  }, [executeAdminTx, adminContract]);

  const resetTimer = useCallback(() => {
    return executeAdminTx('Reset Timer', adminContract!.resetTimer());
  }, [executeAdminTx, adminContract]);

  return {
    drawWinner,
    cancelGame,
    refundBet,
    overrideWinner,
    resetTimer,
    isActionPending,
    error,
    isAdminContractInitialized: !!adminContract
  };
}
