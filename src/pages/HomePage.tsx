import React, { useState } from 'react';
import Grid from '../components/BettingGrid/Grid';
import Timer from '../components/Core/Timer';
import ResultModal from '../components/Modals/ResultModal';
import BetsDrawer from '../components/MyBets/BetsDrawer';

function HomePage() {
  // TODO: Fetch game state, user bets, allowance
  // TODO: Implement bet placement logic (approve -> placeBet)
  // TODO: Implement winner reveal logic, modal display, claim winnings/refunds

  const [isBetsDrawerOpen, setIsBetsDrawerOpen] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [userWonAmount, setUserWonAmount] = useState<bigint | null>(null);
  const [winningNumber, setWinningNumber] = useState<number | null>(null);

  const handlePlaceBet = (number: number) => {
    console.log(`TODO: Place bet on ${number}`);
    // 1. Check allowance
    // 2. If insufficient, call approve hook
    // 3. If sufficient or after approval, call placeBet hook
    // 4. Show toasts for success/failure
    // 5. Refetch game data
  };

  return (
    <div className="space-y-6">
      {/* Timer Display */}
      <Timer />

      {/* Game Info Area - TODO: Populate with real data */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center bg-white p-4 rounded-lg shadow">
          <div><span className="block text-xs text-gray-500">Round ID</span> <span className="font-semibold">1 (TODO)</span></div>
          <div><span className="block text-xs text-gray-500">Total Pot (USDT)</span> <span className="font-semibold">123.45 (TODO)</span></div>
          <div><span className="block text-xs text-gray-500">Your Stake (USDT)</span> <span className="font-semibold">1.20 (TODO)</span></div>
          <div><span className="block text-xs text-gray-500">Players</span> <span className="font-semibold">50 (TODO)</span></div>
      </div>

      {/* Betting Grid */}
      <Grid /> {/* TODO: Pass props */}

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4 mt-4">
          {/* TODO: Conditional Approve Button */}
          <button 
              onClick={() => setIsBetsDrawerOpen(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded"
            > 
              My Bets
          </button>
          {/* TODO: Conditional Claim Buttons */}
      </div>

      {/* Bets Drawer */}
      <BetsDrawer isOpen={isBetsDrawerOpen} onClose={() => setIsBetsDrawerOpen(false)} />

      {/* Result Modal */}
      <ResultModal 
        isOpen={showResultModal} 
        onClose={() => setShowResultModal(false)} 
        wonAmount={userWonAmount} 
        winningNumber={winningNumber} 
      />
    </div>
  );
}

export default HomePage; 