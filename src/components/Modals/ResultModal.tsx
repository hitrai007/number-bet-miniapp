import React from 'react';
import Confetti from 'react-confetti';

interface ResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  wonAmount: bigint | null;
  winningNumber: number | null;
  // TODO: Add prop for claiming winnings function
}

function ResultModal({ isOpen, onClose, wonAmount, winningNumber }: ResultModalProps) {
  if (!isOpen) return null;

  const isWinner = wonAmount !== null && wonAmount > 0n;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      {isWinner && <Confetti recycle={false} numberOfPieces={300} />} 
      <div className="bg-white p-8 rounded-lg shadow-xl text-center max-w-sm mx-auto relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        <h2 className="text-2xl font-bold mb-4">
          Round Concluded!
        </h2>
        <p className="mb-4 text-lg">
          The winning number was: <span className="font-bold text-purple-700 text-xl">{winningNumber ?? 'N/A'}</span>
        </p>
        {isWinner ? (
          <div className="text-green-600">
            <p className="text-xl font-semibold mb-2">Congratulations!</p>
            <p>You won {wonAmount ? (Number(wonAmount) / 1e18).toFixed(4) : '0'} USDT! (TODO: Format correctly based on decimals)</p>
            {/* TODO: Add Claim Button if needed */}
          </div>
        ) : (
          <p className="text-red-600 text-xl font-semibold">Better luck next time!</p>
        )}
        <button
           onClick={onClose}
           className="mt-6 bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded"
        >
            Close
        </button>
      </div>
    </div>
  );
}

export default ResultModal; 