import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';
import AdminPanel from '../components/Admin/AdminPanel';
// import { RPC_URL } from '../config/constants'; // Assume RPC handled by wagmi
import { ADMIN_PRIVATE_KEY } from '../lib/constants';

function AdminPage() {
  const { address } = useAccount();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [adminWalletAddress, setAdminWalletAddress] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    if (ADMIN_PRIVATE_KEY) {
      try {
        // Validate the key format without creating a full provider instance here
        const wallet = new ethers.Wallet(ADMIN_PRIVATE_KEY);
        if (mounted) {
            setAdminWalletAddress(wallet.address);
            if (address && address.toLowerCase() === wallet.address.toLowerCase()) {
              setIsAdmin(true);
            } else {
              setIsAdmin(false);
            }
        }
      } catch (error) {
        console.error("Invalid Admin Private Key format:", error);
         if (mounted) setIsAdmin(false);
      }
    } else {
      console.warn("Admin private key not configured.");
      if (mounted) setIsAdmin(false);
    }
     if (mounted) setIsLoading(false);

     return () => { mounted = false; };

  }, [address]); // Re-check when connected address changes

  if (isLoading) {
    return <div className="text-center p-10">Loading Admin Access...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="text-center p-10 bg-red-100 border border-red-400 text-red-700 rounded">
        <h2 className="text-2xl font-bold mb-4">Admin Access Denied</h2>
        <p>
          You must connect the designated admin wallet 
          {adminWalletAddress && ` (${adminWalletAddress.substring(0, 6)}...${adminWalletAddress.substring(adminWalletAddress.length - 4)})`}
           to access this page.
        </p>
        {!ADMIN_PRIVATE_KEY && <p className="mt-2 font-semibold">Admin private key not configured in .env</p>}
      </div>
    );
  }

  // If admin, render the panel
  return <AdminPanel />; // TODO: Pass admin actions and data as props
}

export default AdminPage; 