import { useAccount, useConnect, useDisconnect } from 'wagmi';

export function Header() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  const connector = connectors[0]; // Assuming the Farcaster connector is the first one

  const handleConnect = () => {
    if (connector) {
      connect({ connector });
    }
  };

  const handleDisconnect = () => {
    disconnect();
  };

  const truncateAddress = (addr: string) => {
    if (!addr) return "";
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  return (
    <header className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white p-4 shadow-md flex justify-between items-center">
      <h1 className="text-2xl font-bold tracking-tight">100Bet</h1>
      <div>
        {isConnected ? (
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium bg-white/10 px-3 py-1 rounded-full">
              {truncateAddress(address!)}
            </span>
            <button
              onClick={handleDisconnect}
              className="bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-3 py-1 rounded-md transition-colors duration-200"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <button
            onClick={handleConnect}
            disabled={!connector}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Connect Wallet
          </button>
        )}
      </div>
    </header>
  );
} 