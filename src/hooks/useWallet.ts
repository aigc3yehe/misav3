import { useDispatch } from 'react-redux';
import { useDisconnect } from '@reown/appkit/react';
import { disconnectWallet } from '../store/slices/walletSlice';
import { AppDispatch } from '../store';

export const useWallet = () => {
  const { disconnect } = useDisconnect();
  const dispatch = useDispatch<AppDispatch>();
  
  const handleDisconnect = async () => {
    try {
      await disconnect();
      dispatch(disconnectWallet());
    } catch (error) {
      console.error('Wallet disconnection error:', error);
      throw error;
    }
  };

  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return {
    handleDisconnect,
    formatAddress,
  };
};