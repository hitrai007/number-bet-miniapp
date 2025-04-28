

function Cell({ number, onClick }: CellProps) {
  // TODO: Implement cell styling based on props (user bets, winner, etc.)
  const baseStyle = "aspect-square flex items-center justify-center border rounded text-xs md:text-sm font-semibold cursor-pointer transition-all duration-300 ease-in-out relative overflow-hidden bg-gray-100 hover:bg-purple-100";

  return (
    <button
      onClick={onClick}
      className={`${baseStyle} {/* Add conditional styles here */}`}
      aria-label={`Bet on number ${number}`}
    >
      <span className="z-10">{number}</span>
      {/* TODO: Add stake badges */}
    </button>
  );
}

export default Cell; 