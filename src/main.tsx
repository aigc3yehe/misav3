import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PrivyProvider } from '@privy-io/react-auth';
import { WagmiProvider, createConfig } from '@privy-io/wagmi';
import { createRoot } from 'react-dom/client';
import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from './theme';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { Provider } from 'react-redux';
import { store } from './store';
import { base, baseSepolia } from 'viem/chains';
import { http } from 'wagmi';
import { PrivyClientConfig } from '@privy-io/react-auth';

// 创建 wagmi 配置
const wagmiConfig = createConfig({
  chains: [baseSepolia],
  transports: {
    [baseSepolia.id]: http(),
    //[base.id]: http(),
  },
});

// 创建 query client
const queryClient = new QueryClient();

// Privy 配置
const privyConfig: PrivyClientConfig  = {
  loginMethods: ['wallet'],
  appearance: {
    theme: 'dark',
    accentColor: '#C7FF8C',
    showWalletLoginFirst: true,
    // logo: '/misato.jpg',
  },
  embeddedWallets: {
    createOnLogin: 'users-without-wallets',
    requireUserPasswordOnCreate: true,
    showWalletUIs: true,
  },
  defaultChain: baseSepolia,
  supportedChains: [baseSepolia],
};

function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId="cm5lv29x9004b7sm0zundvun8"
      config={privyConfig}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>
          {children}
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppProvider>
          <RouterProvider router={router} />
        </AppProvider>
      </ThemeProvider>
    </Provider>
  </React.StrictMode>
);
