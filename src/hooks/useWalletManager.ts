import { useWallets } from '@privy-io/react-auth';
import { useSetActiveWallet } from '@privy-io/wagmi';
import { useDispatch } from 'react-redux';
import { updatePrivyAccount } from '../store/slices/walletSlice';

export function useWalletManager() {
  const { wallets } = useWallets();
  const { setActiveWallet } = useSetActiveWallet();
  const dispatch = useDispatch();

  // 切换活跃钱包
  const switchWallet = async (address: string) => {
    try {
      const targetWallet = wallets.find(wallet => wallet.address === address);
      if (!targetWallet) {
        throw new Error('找不到目标钱包');
      }

      // 更新 wagmi 的活跃钱包
      await setActiveWallet(targetWallet);

      // 更新 Redux store
      // @ts-ignore
      dispatch(updatePrivyAccount({
        address: targetWallet.address,
        isConnected: true,
        status: 'connected',
        walletInfo: {
          name: targetWallet.walletClientType,
          icon: targetWallet.meta?.icon || '/assets/avatar.png'
        }
      }));

      return true;
    } catch (error) {
      console.error('切换钱包失败:', error);
      return false;
    }
  };

  return {
    wallets: wallets.map(wallet => ({
      address: wallet.address,
      type: wallet.walletClientType,
      isEmbedded: wallet.walletClientType === 'privy',
      icon: wallet.meta?.icon
    })),
    switchWallet,
    activeWallet: wallets[0], // 默认使用第一个钱包作为活跃钱包
  };
} 