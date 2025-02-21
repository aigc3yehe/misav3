import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { formatUnits } from 'viem';
import { RootState } from '..';

// 常量定义
const MISATO_TOKEN_ADDRESS = '0x98f4779FcCb177A6D856dd1DfD78cd15B7cd2af5';
const REQUIRED_BALANCE = 200_000; // 需要持有的最小数量
// const PROJECT_ID = '24138badb492a0fbadb1a04687d27fcd';
const WALLET_INFO_CACHE_KEY = 'wallet_info_cache';
const UUID_STORAGE_KEY = 'misato_user_uuid';

// 添加白名单地址列表
const WHITELISTED_ADDRESSES = [
  '0xdbEA32C9a4438cE9eae6Cf1505343E803F277922',
  '0x520EacebDa3Aa6659080c6e2618502a566C86954',
  '0x4272e3150A81B9735ccc58692f5dd3Cf73fB3B92',
  '0xDDCDDBFc282721beacff99Cc67137f728c5fB2fD'
  // 添加其他白名单地址...
].map(addr => addr.toLowerCase());

// 接口定义
interface WalletInfo {
  name: string;
  icon: string;
  rdns?: string;
}

interface WalletState {
  address: string | null;
  caipAddress: string | null;
  status: string;
  isConnected: boolean;
  walletInfo: WalletInfo;
  tokenBalance: number;
  hasEnoughTokens: boolean;
  maxBalances: Record<string, number>;
  isLoading: boolean;
  error: string | null;
  userUuid: string;
  isWhitelisted: boolean;
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
  hasEnoughTokens: true,
  maxBalances: {},
  isLoading: false,
  error: null,
  userUuid: initializeUuid(),
  isWhitelisted: false,
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
export const checkTokenBalance = createAsyncThunk(
  'wallet/checkTokenBalance',
  async (address: string, { getState }) => {
    const state = getState() as RootState;
    const agentId = state.agent.currentAgent?.id;
    if (agentId === 'niyoko') {
      return REQUIRED_BALANCE * 10;
    }
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

// 更新 Privy 账户状态的 thunk
export const updatePrivyAccount = createAsyncThunk(
  'wallet/updatePrivyAccount',
  async (params: {
    address: string | null;
    isConnected: boolean;
    status: string;
    walletInfo: {
      name: string;
      icon: string;
    }
  }) => params
);

const walletSlice = createSlice({
  name: 'wallet',
  initialState: {
    ...initialState,
    walletInfo: loadWalletInfoFromCache() || initialState.walletInfo,
  },
  reducers: {
    setAddress: (state, action: PayloadAction<string | null>) => {
      state.address = action.payload;
      // 当地址更新时检查是否在白名单中
      state.isWhitelisted = action.payload ? 
        WHITELISTED_ADDRESSES.includes(action.payload.toLowerCase()) : 
        false;
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
    setWalletInfo: (state, action: PayloadAction<WalletInfo>) => {
      state.walletInfo = action.payload;
      saveWalletInfoToCache(action.payload);
    },
    setUserUuid: (state, action: PayloadAction<string>) => {
      state.userUuid = action.payload;
      localStorage.setItem(UUID_STORAGE_KEY, action.payload);
    },
    disconnectWallet: (state) => {
      state.address = null;
      state.caipAddress = null;
      state.status = 'disconnected';
      state.isConnected = false;
      state.walletInfo = { name: '', icon: '' };
      state.tokenBalance = 0;
      state.hasEnoughTokens = true;
      state.userUuid = '';
      state.isWhitelisted = false;
    },
    updateMaxBalance: (state, action: PayloadAction<{ address: string; balance: number; agentId?: string }>) => {
      const { address, balance, agentId } = action.payload;
      state.maxBalances[address] = Math.max(state.maxBalances[address] || 0, balance);
      console.log('updateMaxBalance:', balance);
      // 如果是 niyoko，直接设置 hasEnoughTokens 为 true
      if (agentId === 'niyoko') {
        state.hasEnoughTokens = true;
      } else {
        state.hasEnoughTokens = state.maxBalances[address] >= REQUIRED_BALANCE;
      }
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
          // 如果余额大于等于 REQUIRED_BALANCE，则设置 hasEnoughTokens 为 true
          // 测试时，设置为 true
          state.hasEnoughTokens = state.maxBalances[state.address] >= REQUIRED_BALANCE;
          //state.hasEnoughTokens = true;
        }
      })
      .addCase(checkTokenBalance.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Check token balance failed';
      })
      .addCase(updatePrivyAccount.fulfilled, (state, action) => {
        console.log('updatePrivyAccount.fulfilled', action.payload);
        state.address = action.payload.address;
        // 更新白名单状态
        state.isWhitelisted = action.payload.address ? 
          WHITELISTED_ADDRESSES.includes(action.payload.address.toLowerCase()) : 
          false;
        state.isConnected = action.payload.isConnected;
        state.walletInfo = action.payload.walletInfo;
      });
  },
});

export const {
  setAddress,
  setCaipAddress,
  setStatus,
  setConnected,
  setWalletInfo,
  setUserUuid,
  disconnectWallet,
  updateMaxBalance,
} = walletSlice.actions;

// 添加 agent 状态监听中间件
export const agentStatusMiddleware = (store: any) => (next: any) => (action: any) => {
  // @ts-ignore
  const prevState = store.getState();
  const result = next(action);
  const currentState = store.getState();

  // 检查 agent 是否发生变化
  if (action.type === 'agent/setCurrentAgent') {
    const isNiyoko = action.payload.id === 'niyoko';
    if (isNiyoko) {
      // 如果切换到 niyoko，直接设置 hasEnoughTokens 为 true
      store.dispatch(updateMaxBalance({ 
        address: currentState.wallet.address || '', 
        balance: REQUIRED_BALANCE * 10,
        agentId: 'niyoko'
      }));
    } else {
      // 如果切换到其他 agent，重新检查 token balance
      if (currentState.wallet.address) {
        store.dispatch(checkTokenBalance(currentState.wallet.address));
      }
    }
  }

  return result;
};

export default walletSlice.reducer; 