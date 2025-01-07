import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { formatUnits } from 'viem';

// 常量定义
const MISATO_TOKEN_ADDRESS = '0x98f4779FcCb177A6D856dd1DfD78cd15B7cd2af5';
const REQUIRED_BALANCE = 50_000; // 需要持有的最小数量
const PROJECT_ID = '24138badb492a0fbadb1a04687d27fcd';
const WALLET_INFO_CACHE_KEY = 'wallet_info_cache';
const UUID_STORAGE_KEY = 'misato_user_uuid';

// 接口定义
interface WalletListing {
  id: string;
  name: string;
  rdns: string;
  image_url: {
    sm: string;
    md: string;
    lg: string;
  };
}

interface WalletInfo {
  name: string;
  icon: string;
}

interface WalletState {
  address: string | null;
  caipAddress: string | null;
  status: string;
  isConnected: boolean;
  walletInfo: {
    name: string;
    icon: string;
  };
  tokenBalance: number;
  hasEnoughTokens: boolean;
  maxBalances: Record<string, number>;
  isLoading: boolean;
  error: string | null;
  userUuid: string;
}

// 初始化或获取 UUID
const initializeUuid = (): string => {
  const storedUuid = localStorage.getItem(UUID_STORAGE_KEY);
  if (storedUuid) {
    return storedUuid;
  }
  const newUuid = crypto.randomUUID();
  localStorage.setItem(UUID_STORAGE_KEY, newUuid);
  return newUuid;
};

const initialState: WalletState = {
  address: null,
  caipAddress: null,
  status: 'disconnected',
  isConnected: false,
  walletInfo: {
    name: '',
    icon: '',
  },
  tokenBalance: 0,
  hasEnoughTokens: false,
  maxBalances: {},
  isLoading: false,
  error: null,
  userUuid: initializeUuid(), // 使用初始化函数
};

// 从缓存加载钱包信息
const loadWalletInfoFromCache = () => {
  try {
    const cached = localStorage.getItem(WALLET_INFO_CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.error('Failed to load wallet info from cache:', error);
    return null;
  }
};

// 保存钱包信息到缓存
const saveWalletInfoToCache = (walletInfo: WalletInfo) => {
  try {
    localStorage.setItem(WALLET_INFO_CACHE_KEY, JSON.stringify(walletInfo));
  } catch (error) {
    console.error('Failed to save wallet info to cache:', error);
  }
};

// Async Thunks
export const getWalletIcon = createAsyncThunk(
  'wallet/getWalletIcon',
  async (rdns: string) => {
    try {
      if (rdns === undefined) {
        console.log('rdns is undefined');
        return null;
      }
      // 先从缓存中查找
      const cached = loadWalletInfoFromCache();
      if (cached?.rdns === rdns && cached?.icon) {
        console.log('Cached wallet info:', cached);
        return cached;
      }

      const walletName = rdns.split('.').pop() || '';
      const response = await fetch(
        `https://explorer-api.walletconnect.com/v3/wallets?projectId=${PROJECT_ID}&search=${walletName}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch wallet info');
      }

      const data = await response.json();
      const wallets = Object.values(data.listings) as WalletListing[];
      console.log('Wallets:', wallets);
      
      if (wallets.length === 0) {
        return null;
      }
      
      const wallet = wallets.find((w) => w.rdns === rdns) || wallets[0];
      console.log('Wallet:', wallet);
      const walletInfo = {
        name: wallet.name,
        icon: wallet.image_url.md,
        rdns: wallet.rdns
      };
      console.log('WalletInfo:', walletInfo);
      // 保存到缓存
      saveWalletInfoToCache(walletInfo);
      
      return walletInfo;
    } catch (error) {
      console.error('Failed to get wallet icon:', error);
      return null;
    }
  }
);

export const checkTokenBalance = createAsyncThunk(
  'wallet/checkTokenBalance',
  async (address: string) => {
    const baseUrl = 'https://base-mainnet.g.alchemy.com/v2/goUyG3r-JBxlrxzsqIoyv0b_W-LwScsN';
    
    const raw = JSON.stringify({
      "jsonrpc": "2.0",
      "method": "alchemy_getTokenBalances",
      "headers": {
        "Content-Type": "application/json"
      },
      "params": [
        address,
        [MISATO_TOKEN_ADDRESS]
      ],
      "id": 42
    });

    const response = await fetch(baseUrl, {
      method: 'POST',
      body: raw,
      redirect: 'follow'
    });

    const result = await response.json();
    const tokenBalance = result.result.tokenBalances[0].tokenBalance;
    const tokenBalanceVal = BigInt(tokenBalance);
    return Number(formatUnits(tokenBalanceVal, 18));
  }
);

const walletSlice = createSlice({
  name: 'wallet',
  initialState: {
    ...initialState,
    walletInfo: loadWalletInfoFromCache() || initialState.walletInfo,
  },
  reducers: {
    updateAppKitAccount: (state, action: PayloadAction<{
      address: string | null;
      isConnected: boolean;
      caipAddress: string | null;
      status: string;
      walletInfo?: {
        name: string;
        icon: string;
        rdns?: string;
      };
    }>) => {
      state.address = action.payload.address;
      state.isConnected = action.payload.isConnected;
      state.caipAddress = action.payload.caipAddress;
      state.status = action.payload.status;
    },
    setAddress: (state, action: PayloadAction<string | null>) => {
      state.address = action.payload;
    },
    setCaipAddress: (state, action: PayloadAction<string | null>) => {
      state.caipAddress = action.payload;
    },
    setStatus: (state, action: PayloadAction<string>) => {
      state.status = action.payload;
    },
    setConnected: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
    },
    setWalletInfo: (state, action: PayloadAction<WalletState['walletInfo']>) => {
      state.walletInfo = action.payload;
    },
    setUserUuid: (state, action: PayloadAction<string>) => {
      state.userUuid = action.payload;
    },
    disconnectWallet: (state) => {
      state.address = null;
      state.caipAddress = null;
      state.status = 'disconnected';
      state.isConnected = false;
      state.walletInfo = { name: '', icon: '' };
      state.tokenBalance = 0;
      state.hasEnoughTokens = false;
      state.userUuid = '';
    },
    updateMaxBalance: (state, action: PayloadAction<{ address: string; balance: number }>) => {
      const { address, balance } = action.payload;
      state.maxBalances[address] = Math.max(state.maxBalances[address] || 0, balance);
      state.hasEnoughTokens = state.maxBalances[address] >= REQUIRED_BALANCE;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkTokenBalance.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(checkTokenBalance.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tokenBalance = action.payload;
        console.log('tokenBalance:', state.tokenBalance);
        if (state.address) {
          state.maxBalances[state.address] = Math.max(
            state.maxBalances[state.address] || 0,
            action.payload
          );
          state.hasEnoughTokens = state.maxBalances[state.address] >= REQUIRED_BALANCE;
        }
      })
      .addCase(checkTokenBalance.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to check token balance';
      })
      .addCase(getWalletIcon.fulfilled, (state, action) => {
        if (action.payload) {
          state.walletInfo = {
            ...state.walletInfo,
            ...action.payload
          };
          saveWalletInfoToCache(action.payload);
        }
      });
  },
});

export const {
  updateAppKitAccount,
  setAddress,
  setCaipAddress,
  setStatus,
  setConnected,
  setWalletInfo,
  setUserUuid,
  disconnectWallet,
  updateMaxBalance,
} = walletSlice.actions;

export default walletSlice.reducer; 