import { createAppKit } from '@reown/appkit/react'
import { WagmiProvider } from 'wagmi'
import { base, baseSepolia } from '@reown/appkit/networks'
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
import { http } from 'wagmi'
import { walletConnect, coinbaseWallet, injected } from 'wagmi/connectors'
const queryClient = new QueryClient()

const projectId = '0052e9e1883c5d42c4db7099c52964af'

const metadata = {
  name: 'Niyoko Studio',
  description: 'Niyoko Studio',
  url: window.location.origin,
  icons: ['/misato.jpg']
}

const networks = [base, baseSepolia]
// 创建连接器数组
const connectors = [
  walletConnect({ 
    projectId, 
    metadata, 
    showQrModal: false
  }),
  injected({ 
    shimDisconnect: true
  }),
  coinbaseWallet({
    appName: metadata.name,
    appLogoUrl: metadata.icons[0]
  })
]

// 创建Wagmi适配器
export const wagmiAdapter = new WagmiAdapter({
  transports: {
    [base.id]: http()
  },
  connectors,
  projectId,
  networks
})

// 自定义主题变量
const themeVariables = {
  '--w3m-font-family': 'Tektur, sans-serif', // 使用应用的主字体
  '--w3m-accent': '#C7FF8C', // 品牌主色
  '--w3m-color-mix': '#FFF', // 辅助色
  '--w3m-color-mix-strength': 50,
  '--w3m-border-radius-master': '2px', // 方形边角
  '--w3m-z-index': 999,
  '--w3m-background-color': '#FFFFFF', // 背景色
  '--w3m-container-border-radius': '4px',
  '--w3m-button-border-radius': '4px',
  '--w3m-text-big-bold-size': '18px',
  '--w3m-text-big-bold-weight': '400',
  '--w3m-overlay-background-color': 'rgba(43, 12, 185, 0.8)', // 半透明遮罩
}

createAppKit({
  adapters: [wagmiAdapter],
  networks: [base, baseSepolia],
  projectId,
  metadata,
  //themeVariables,
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
