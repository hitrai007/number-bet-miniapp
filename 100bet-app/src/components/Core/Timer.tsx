import { useState /*, useEffect */ } from 'react';

// Remove the empty interface
// interface TimerProps {}

// Helper function to format seconds into MM:SS
function formatTime(totalSeconds: number): string {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function Timer(/* props: TimerProps */) {
    // TODO: Fetch actual bettingEndTime and cooldownEndTime from contract or props
    const [ /*timeLeft*/, /*setTimeLeft*/ ] = useState<number>(3600); // Example: 1 hour
    const [ /*phase*/, /*setPhase*/ ] = useState<string>('Betting'); // Example: 'Betting' or 'Cooldown'

    // Placeholder values - Replace with actual data
    const currentPhase = 'Betting'; // Or 'Cooldown' based on actual game state
    const timeRemaining = 15 * 60 + 30; // Example: 15 minutes 30 seconds

    // TODO: Implement useEffect hook to:
    // 1. Fetch current round end times (bettingEnd, cooldownEnd) from the contract
    // 2. Set up an interval timer to update timeLeft and phase every second
    // 3. Calculate remaining time based on current time and end times
    // 4. Determine current phase ('Betting', 'Cooldown', 'Ended')
    // 5. Clear interval on component unmount

    return (
    <div className="bg-white p-4 rounded-lg shadow text-center">
      <p className="text-sm text-gray-500 mb-1">Current Phase: <span className="font-semibold">{currentPhase}</span></p>
      <p className="text-2xl font-bold text-purple-700">{formatTime(timeRemaining)}</p>
      {/* TODO: Add Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-2">
          <div className="bg-purple-600 h-2.5 rounded-full" style={{width: `${(timeRemaining / 3600) * 100}%`}}></div>
      </div>
    </div>
  );
}

export default Timer; 