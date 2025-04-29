// Define props interface
interface BetsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  // TODO: Add prop for user bets data (e.g., bets: { number: number; amount: bigint }[])
}

function BetsDrawer({ isOpen, onClose }: BetsDrawerProps) {
  // TODO: Implement drawer slide animation and display user bets
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ease-in-out"
      onClick={onClose}
    >
      <div
        className="fixed right-0 top-0 h-full w-full max-w-sm bg-white shadow-xl z-50 p-6 transform transition-transform duration-300 ease-in-out translate-x-0" // TODO: Animate translate-x based on isOpen
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside drawer
      >
        <h2 className="text-xl font-semibold mb-4">My Bets (Current Round)</h2>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">&times;</button>
        <div>
          {/* TODO: List user's bets with cancel buttons */}
          <p>Bet on #5 (TODO)</p>
          <p>Bet on #23 (TODO)</p>
        </div>
      </div>
    </div>
  );
}

export default BetsDrawer; 