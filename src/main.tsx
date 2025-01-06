import { createAppKit } from '@reown/appkit/react'
import { WagmiProvider } from 'wagmi'
import { arbitrum, mainnet } from '@reown/appkit/networks'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { createRoot } from 'react-dom/client'
import React, { useEffect } from 'react'
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from './theme';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { Provider, useDispatch } from 'react-redux';
import { store, AppDispatch } from './store';
import { useAppKitAccount, useWalletInfo } from '@reown/appkit/react';
import { useAccount } from 'wagmi';
import { updateAppKitAccount, checkTokenBalance, getWalletIcon } from './store/slices/walletSlice';

const queryClient = new QueryClient()

const projectId = '0052e9e1883c5d42c4db7099c52964af'

const metadata = {
  name: 'Demo',
  description: 'AppKit Example',
  url: 'https://reown.com/appkit',
  icons: ['https://assets.reown.com/reown-profile-pic.png']
}

const networks = [mainnet, arbitrum]

const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: true
});

createAppKit({
  adapters: [wagmiAdapter],
  networks: [mainnet, arbitrum],
  projectId,
  metadata,
  features: {
    analytics: true
  }
})

function AppKitStateSync() {
  const dispatch = useDispatch<AppDispatch>();
  const appKitAccount = useAppKitAccount();
  const { walletInfo } = useWalletInfo();
  const { address: wagmiAddress, isConnected: wagmiIsConnected } = useAccount();

  // 主要的状态更新
  useEffect(() => {
    console.log('States before dispatch1:', {
      wagmi: { address: wagmiAddress, isConnected: wagmiIsConnected },
      appKit: appKitAccount,
      walletInfo
    });

    if (!wagmiIsConnected) return;

    console.log('States before dispatch:', {
      wagmi: { address: wagmiAddress, isConnected: wagmiIsConnected },
      appKit: appKitAccount,
      walletInfo
    });

    // 1. 更新基本状态
    dispatch(updateAppKitAccount({
      address: wagmiAddress || null,
      isConnected: wagmiIsConnected,
      caipAddress: appKitAccount.caipAddress || null,
      status: wagmiIsConnected ? 'connected' : 'disconnected'
    }));

    // 2. 直接获取钱包图标
    const rdns = walletInfo?.rdns || walletInfo?.name;
    console.log('rdns:', rdns);
    dispatch(getWalletIcon(rdns as string));
    
    // 3. 检查代币余额
    if (wagmiAddress) {
      dispatch(checkTokenBalance(wagmiAddress));
    }
  }, [
    dispatch, 
    wagmiAddress, 
    wagmiIsConnected, 
    appKitAccount.caipAddress,
    walletInfo?.rdns,
    walletInfo?.name
  ]);

  return null;
}

function AppKitProvider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <AppKitStateSync />
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppKitProvider>
          <RouterProvider router={router} />
        </AppKitProvider>
      </ThemeProvider>
    </Provider>
  </React.StrictMode>
);
