import React from 'react';
import { Header } from '../components/Core/Header';
import BettingForm from '../components/Betting/BettingForm';
import GameInfo from '../components/GameInfo/GameInfo';
import BetHistory from '../components/BetHistory/BetHistory';
import RoundResults from '../components/Results/RoundResults';
import { useReadContract } from 'wagmi';
import { numberBetAbi } from '../config/abis/numberBetAbi';
import { NUMBER_BET_ADDRESS } from '../config/constants';

function HomePage() {
  // Fetch current round ID to determine the previous round ID
  const { data: currentRoundIdData } = useReadContract({
    address: NUMBER_BET_ADDRESS,
    abi: numberBetAbi,
    functionName: 'currentRoundId',
    query: {
        refetchInterval: 30000, // Refetch periodically
    }
  });
  const currentRoundId = currentRoundIdData as bigint | undefined;
  const previousRoundId = currentRoundId && currentRoundId > 1n ? currentRoundId - 1n : undefined;

  // TODO: Implement winner reveal logic, modal display, claim winnings/refunds
  // TODO: Consider moving bet placement logic (handlePlaceBet) here if needed globally

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Application Header */} 
      <Header />
      {/* Main Content Area */} 
      <main className="container mx-auto px-4 py-8">
         {/* Centered Content Box */} 
         <div className="max-w-md mx-auto">
             {/* Display Current Game Information */} 
             <GameInfo />
             {/* Betting Form */} 
             <BettingForm />
             {/* Display User's Bets for Current Round */} 
             <BetHistory />
             {/* Display results for the previous round if it exists */}
             {previousRoundId && (
                <RoundResults roundId={previousRoundId} />
             )}
             {/* Placeholder for Previous Round Results / History */} 
             {/* <PastRoundsHistory /> */}
         </div>
      </main>
      {/* Optional: Footer Component */}
      {/* <Footer /> */}
    </div>
  );
}

export default HomePage; 