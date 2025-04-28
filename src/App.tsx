import React, { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';
import Header from './components/Core/Header';
import Footer from './components/Core/Footer';
import { useFrame } from '@farcaster/frame-sdk';
import { useAccount } from 'wagmi';

function App() {
  const { sdk } = useFrame();
  const location = useLocation();
  const { isConnected } = useAccount();

  // Signal ready to the Farcaster client once the app loads
  // Could be delayed further based on fetching initial data
  useEffect(() => {
    sdk?.actions.ready();
    console.log("Farcaster Mini-App SDK Initialized & Ready Signal Sent");
  }, [sdk]);

  // Optional: Request account connection automatically on load if needed
  // useEffect(() => {
  //   if (!isConnected && sdk?.wallet.ethProvider) {
  //     sdk.wallet.ethProvider.request({ method: 'eth_requestAccounts' }).catch(console.error);
  //   }
  // }, [isConnected, sdk]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Only show header/footer on non-admin routes or adjust as needed */}
      {location.pathname !== '/admin' && <Header />}
      <main className="flex-grow container mx-auto p-4">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </main>
      {location.pathname !== '/admin' && <Footer />}
    </div>
  );
}

export default App; 