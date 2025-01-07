import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '..';

// 支付相关信息接口
interface PaymentInfo {
  recipient_address: string;  // 接收方地址
  price: string;             // 价格
  network: string;           // 网络
  chainId: number;           // 链ID
}

// 聊天消息接口
export interface ChatMessage {
  id: number;
  content: string;
  role: 'user' | 'assistant' | 'system';  // 消息发送者角色
  type: 'text' | 'image' | 'error' | 'transaction';  // 消息类型
  time?: string;                          // 消息时间
  show_status?: 'send_eth' | 'idle' | 'disconnected' | 'queuing';  // 显示状态
  payment_info?: PaymentInfo;             // 支付信息（如果需要）
}

// 聊天状态接口
interface ChatState {
  messages: ChatMessage[];                // 消息列表
  processingState: 'idle' | 'thinking' | 'generating' | 'minting';  // 处理状态
  currentRequestId: string | null;        // 当前请求ID
  isRequesting: boolean;                  // 是否正在请求
  connectionState: 'not-connected' | 'queuing' | 'ready' | 'not-enough-tokens';  // 连接状态
  queuePosition: number;                  // 队列位置
  wasActive: boolean;                     // 是否曾经活跃
  lastActivityTime: number;               // 最后活动时间
  error?: string | null;                  // 错误信息
}

// 初始欢迎消息
const initialMessages: ChatMessage[] = [
  {
    id: 1,
    type: 'text',
    content: '### MISATO just opened her own studio! You can ask her about NFT purchases. Minting fee 200k $MISATO, total supply 500. ### Max 1 per wallet, DO NOT mint 2 Frens NFTs using the same address.',
    role: 'system',
  }
];

// 初始状态
const initialState: ChatState = {
  messages: initialMessages,
  processingState: 'idle',
  currentRequestId: null,
  isRequesting: false,
  connectionState: 'ready',
  queuePosition: 0,
  wasActive: false,
  lastActivityTime: Date.now(),
};

// 添加等待函数
const waitForRequestAvailable = async (getState: () => RootState): Promise<void> => {
  const checkInterval = 100; // 每100ms检查一次
  const maxWaitTime = 30000; // 最大等待30秒
  let waitedTime = 0;

  while (getState().chat.isRequesting) {
    await new Promise(resolve => setTimeout(resolve, checkInterval));
    waitedTime += checkInterval;
    if (waitedTime >= maxWaitTime) {
      throw new Error('Request timeout: system is busy');
    }
  }
};

// 发送消息的异步 action
// 处理流程：
// 1. 添加用户消息到列表
// 2. 过滤并准备对话历史
// 3. 发送请求到服务器
export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ 
    messageText, 
    payFeeHash 
  }: { 
    messageText: string; 
    payFeeHash?: string 
  }, { getState, dispatch, rejectWithValue }) => {
    // 更新最后活动时间
    console.log('sendMessage先执行主体', messageText);
    dispatch(updateLastActivity());
    try {
      await waitForRequestAvailable(getState as () => RootState);
      dispatch(setIsRequesting(true));

      const state = getState() as RootState;
      const { address: walletAddress, userUuid } = state.wallet;
      
      // 检查连接状态
      /* if (state.chat.connectionState !== 'ready') {
        throw new Error('Connection not ready');
      } */

      // 添加用户消息到列表
      dispatch(addMessage({
        id: Date.now(),
        type: 'text',
        role: 'user',
        content: messageText,
        time: formatTime(new Date()),
      }));

      // 过滤并准备对话历史
      const conversation_history = state.chat.messages
        .filter(msg => 
          (msg.role === 'assistant' || msg.role === 'user') && 
          msg.type !== 'transaction'
        )
        .map(msg => ({ 
          role: msg.role, 
          content: msg.content 
        }));

      // 发送请求
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFnZW50IiwiaWF0IjoxNzMyNDQzNjUxfQ.mEGxHMQPGxb2q4nEDvyAJwCjGGQmi9DNcXgslosn6DI',
          'x-user-id': userUuid || 'anonymous'
        },
        body: JSON.stringify({
          message: messageText,
          conversation_history,
          user_uuid: userUuid || 'anonymous',
          wallet_address: walletAddress || '',
          request_id: state.chat.currentRequestId,
          pay_fee_hash: payFeeHash
        })
      });

      const data = await response.json();

      // 检查是否从活跃到非活跃
      if (state.chat.wasActive && !data.isActive && state.chat.connectionState === 'ready') {
        // 停止心跳
        stopHeartbeat();
      }
      
      // 更新是否活跃
      dispatch(setWasActive(data.isActive))

      // 处理支付相关的响应
      if ((data.status === 'paying' || data.status?.status === 'paying') && 
            (data.recipient_address || data.status?.recipient_address) && 
            (data.price || data.status?.price)) {
        // 获取正确的支付信息
        const recipientAddress = data.recipient_address || data.status?.recipient_address
        const price = data.price || data.status?.price
        const network = data.network || data.status?.network
        const chainId = data.chainId || data.status?.chainId
        const content = data.content || data.status?.content

        // 添加支付信息到消息列表
        dispatch(addMessage({
          id: Date.now() + 1,
          type: 'text',
          role: 'assistant',
          content: content,
          time: formatTime(new Date()),
          show_status: 'send_eth',
          payment_info: {
            recipient_address: recipientAddress,
            price: price,
            network: network,
            chainId: chainId
          }
        }));

        // 添加语音播放
        return data;
      }

      // 如果队伍已满，或者在队列中
      if (data.status === 'full' || data.inQueue) {
        dispatch(setConnectionState('queuing'))
        if (data.position) {
          dispatch(setQueuePosition(data.position || 100))
        }
        // 重置消息
        dispatch(resetMessages())
        return data;
      }

      // 处理响应
      if (data.error) {
        throw new Error(data.error.message);
      }

      // 添加助手响应消息
      dispatch(addMessage({
        id: Date.now() + 1,
        type: 'text',
        role: 'assistant',
        content: data.content,
        time: formatTime(new Date()),
      }));

      // 如果是图片生成请求，添加系统消息
      if (data.request_id) {
        dispatch(setCurrentRequestId(data.request_id))
        dispatch(setProcessingState('generating'))
        // 如果是图片生成请求，开始轮询状态
        dispatch(pollImageStatus(data.request_id))
      }

      // 将 AI 回复分段发送到 Unity
      // 逐句发送到 Unity 进行语音播放前进行数字转换

      return data;

    } catch (error) {
      // 添加错误消息
      dispatch(addMessage({
        id: Date.now(),
        type: 'error',
        role: 'system',
        content: error instanceof Error ? error.message : 'An error occurred',
        time: formatTime(new Date()),
      }));

      return rejectWithValue(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      // 确保请求结束时重置状态
      dispatch(setIsRequesting(false));
    }
  }
);

// 轮询图片生成状态的异步 action
// 处理流程：
// 1. 添加生成中的提示消息
// 2. 轮询检查生成状态
// 3. 完成后移除提示消息
export const pollImageStatus = createAsyncThunk(
  'chat/pollImageStatus',
  async (requestId: string, { dispatch, getState }) => {
    const state = getState() as RootState;
    const { userUuid } = state.wallet;
    
    // 添加进度消息
    const progressMessageId = Date.now();
    dispatch(addMessage({
      id: progressMessageId,
      type: 'text',
      role: 'system',
      content: '🎨 Generating image...',
      time: formatTime(new Date()),
    }));

    try {
      let attempts = 0;
      const maxAttempts = 60; // 最多尝试60次
      const interval = 2000; // 每2秒检查一次

      while (attempts < maxAttempts) {
        await waitForRequestAvailable(getState as () => RootState);

        try {
          const response = await fetch(`/api/generation-status/${requestId}`, {
            headers: {
              'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFnZW50IiwiaWF0IjoxNzMyNDQzNjUxfQ.mEGxHMQPGxb2q4nEDvyAJwCjGGQmi9DNcXgslosn6DI',
              'x-user-id': userUuid || 'anonymous'
            }
          });
          
          const result = await response.json();

          // 如果生成完成
          if (result.status === 'completed') {
            // 移除进度消息
            dispatch(removeMessage(progressMessageId));
            
            // 添加消息并发送到 Unity
            const content = result.content
            dispatch(addMessage({
              id: Date.now() + 1,
              type: 'text',
              role: 'assistant',
              content: content,
              time: formatTime(new Date()),
            }));

            // 过滤掉图片标记后发送到 Unity

            return result;
          }

          // 如果生成失败
          if (result.status === 'failed') {
            // 移除进度消息
            dispatch(removeMessage(progressMessageId));
            // 添加错误消息
            dispatch(addMessage({
              id: Date.now() + 1,
              type: 'error',
              role: 'system',
              content: 'Image generation failed, please try again.',
              time: formatTime(new Date()),
            }));

            // 发送错误消息到 Unity
            return result;
          }

          // 继续等待
          await new Promise(resolve => setTimeout(resolve, interval));
          attempts++;
        } finally {
          
        }
      }

      throw new Error('Image generation timeout');

    } catch (error) {
      // 移除进度消息
      dispatch(removeMessage(progressMessageId));
      
      // 添加错误消息
      dispatch(addMessage({
        id: Date.now() + 1,
        type: 'error',
        role: 'system',
        content: 'Error checking image generation status',
        time: formatTime(new Date()),
      }));
      // 发送错误消息到 Unity
      throw error;
    }
  }
);

// 心跳请求的异步 action
// 用于维持与服务器的连接状态
export const sendHeartbeat = createAsyncThunk(
  'chat/sendHeartbeat',
  async (_, { getState, dispatch }) => {
    // 如果上次活跃时间没有超过20秒，就不发送心跳
    const state = getState() as RootState;
    const lastActivityTime = state.chat.lastActivityTime;
    if (Date.now() - lastActivityTime < 20000) {
      return;
    }
    try {
      await waitForRequestAvailable(getState as () => RootState);
      dispatch(setIsRequesting(true));
      
      const state = getState() as RootState;
      const { userUuid } = state.wallet;
      
      const response = await fetch('/api/heartbeat', {
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFnZW50IiwiaWF0IjoxNzMyNDQzNjUxfQ.mEGxHMQPGxb2q4nEDvyAJwCjGGQmi9DNcXgslosn6DI',
          'x-user-id': userUuid || ''
        }
      });
      const data = await response.json();

      // 检查是否从活跃状态变为非活跃状态
      if (state.chat.wasActive && !data.isActive && state.chat.connectionState === 'ready') {
        // 停止心跳
        dispatch(setConnectionState('queuing'));
        dispatch(resetMessages());
        stopHeartbeat();
      }

      // 更新是否活跃
      dispatch(setWasActive(data.isActive))

      if (data.inQueue) {
        dispatch(setConnectionState('queuing'))
        dispatch(setQueuePosition(data.position || 100))
        if (state.chat.processingState === 'idle') {
          dispatch(resetMessages())
        }
      } else if (data.isActive) {
        dispatch(setConnectionState('ready'))
      }

      return data;
    } finally {
      dispatch(setIsRequesting(false));
    }
  }
);

// 检查连接状态的异步 action
// 用于初始连接和重连时检查状态
export const checkConnectionStatus = createAsyncThunk(
  'chat/checkConnectionStatus',
  async (_, { getState, dispatch }) => {
    try {
      await waitForRequestAvailable(getState as () => RootState);
      dispatch(setIsRequesting(true));
      
      const state = getState() as RootState;
      const { userUuid } = state.wallet;
      
      const response = await fetch(`/api/initial-connection/${userUuid}`, {
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFnZW50IiwiaWF0IjoxNzMyNDQzNjUxfQ.mEGxHMQPGxb2q4nEDvyAJwCjGGQmi9DNcXgslosn6DI',
          'x-user-id': userUuid || ''
        }
      });
      const data = await response.json();

      // 检查状态是否OK
      if (data.isActive || data.status === 'yes') {
        dispatch(setConnectionState('ready'))
        dispatch(setWasActive(true))
        // 开始心跳 
        startHeartbeat(dispatch)
      } else if (data.isQueue) {
        dispatch(setConnectionState('queuing'))
        dispatch(setQueuePosition(data.position || 100))
        dispatch(resetMessages())
        // 开始心跳
        startHeartbeat(dispatch)
      } else {
        dispatch(setConnectionState('not-connected'))
        dispatch(setWasActive(false))
        // 停止心跳
        stopHeartbeat()
      }

      return data;
    } finally {
      dispatch(setIsRequesting(false));
    }
  }
);

// 心跳相关的工具函数
let heartbeatInterval: NodeJS.Timeout | null = null;

// 开始心跳
const startHeartbeat = (dispatch: any) => {
  stopHeartbeat();
  heartbeatInterval = setInterval(() => {
    dispatch(sendHeartbeat());
  }, 10000);
};

// 停止心跳
const stopHeartbeat = () => {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
};

// Chat Slice 主体
const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setMessages: (state, action: PayloadAction<ChatMessage[]>) => {
      state.messages = action.payload;
    },
    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      state.messages.push({
        ...action.payload,
        time: formatTime(new Date()),
      });
    },
    clearMessages: (state) => {
      state.messages = [];
    },
    removeMessage: (state, action: PayloadAction<number>) => {
      state.messages = state.messages.filter(m => m.id !== action.payload);
    },
    removeLastMessage: (state) => {
      state.messages.pop();
    },
    setProcessingState: (state, action: PayloadAction<ChatState['processingState']>) => {
      state.processingState = action.payload;
    },
    setCurrentRequestId: (state, action: PayloadAction<string | null>) => {
      state.currentRequestId = action.payload;
    },
    setIsRequesting: (state, action: PayloadAction<boolean>) => {
      state.isRequesting = action.payload;
    },
    setConnectionState: (state, action: PayloadAction<ChatState['connectionState']>) => {
      state.connectionState = action.payload;
    },
    updateConnectionState: (state, action: PayloadAction<ChatState['connectionState']>) => {
      state.connectionState = action.payload;
    },
    setQueuePosition: (state, action: PayloadAction<number>) => {
      state.queuePosition = action.payload;
    },
    setWasActive: (state, action: PayloadAction<boolean>) => {
      state.wasActive = action.payload;
    },
    updateLastActivity: (state) => {
      state.lastActivityTime = Date.now();
    },
    resetMessages: (state) => {
      state.messages = [...initialMessages];
    },
  },
  extraReducers: (builder) => {
    builder
      // 处理心跳请求
      /* .addCase(sendHeartbeat.fulfilled, (state, action) => {
        state.wasActive = action.payload.isActive;
        if (action.payload.inQueue) {
          state.connectionState = 'queuing';
          state.queuePosition = action.payload.position || 100;
        } else if (action.payload.isActive) {
          state.connectionState = 'ready';
        }
      }) */
      // 处理发送消息
      .addCase(sendMessage.pending, (state) => {
        console.log('执行sendMessage.pending');
        state.processingState = 'thinking';
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        console.log('执行sendMessage.fulfilled');
        if (!action.payload.request_id) {
          state.processingState = 'idle';
          state.currentRequestId = null;
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        console.log('执行sendMessage.rejected', action.payload);
        state.processingState = 'idle';
        state.currentRequestId = null;
        state.error = action.payload as string || 'Failed to send message';
      })
      // 处理图片状态轮询
      .addCase(pollImageStatus.pending, (state) => {
        state.processingState = 'generating';
      })
      .addCase(pollImageStatus.fulfilled, (state) => {
        state.processingState = 'idle';
      })
      .addCase(pollImageStatus.rejected, (state) => {
        state.processingState = 'idle';
        state.currentRequestId = null;
      })
      // 处理检查连接状态
      .addCase(checkConnectionStatus.fulfilled, (state, action) => {
        if (action.payload.inQueue) {
          state.connectionState = 'queuing';
          state.queuePosition = action.payload.position || 100;
        } else if (action.payload.isActive) {
          state.connectionState = 'ready';
        }
      });
  },
});

// 钱包状态监听中间件
// 处理流程：
// 1. 监听钱包连接状态和代币余额变化
// 2. 根据状态变化执行相应操作：
//    - 连接且有足够代币：开始心跳
//    - 连接但代币不足：更新状态并停止心跳
//    - 未连接：停止心跳并重置消息
export const walletStatusMiddleware = (store: any) => (next: any) => (action: any) => {
  const prevState = store.getState();
  const result = next(action);
  const currentState = store.getState();

  // 检查钱包状态变化
  const prevWallet = prevState.wallet;
  const currentWallet = currentState.wallet;

  if (
    prevWallet.isConnected !== currentWallet.isConnected ||
    prevWallet.hasEnoughTokens !== currentWallet.hasEnoughTokens
  ) {
    console.log('Wallet status changed:', {
      isConnected: currentWallet.isConnected,
      hasEnoughTokens: currentWallet.hasEnoughTokens
    });

    if (currentWallet.isConnected) {
      if (currentWallet.hasEnoughTokens) {
        console.log('Wallet is connected and has enough tokens');
        store.dispatch(checkConnectionStatus())
          .then(() => {
            startHeartbeat(store.dispatch);
          });
      } else {
        console.log('The wallet is connected, but does not have enough tokens');
        store.dispatch(chatSlice.actions.updateConnectionState('not-enough-tokens'));
        stopHeartbeat();
        store.dispatch(chatSlice.actions.resetMessages());
      }
    } else {
      stopHeartbeat();
      store.dispatch(chatSlice.actions.updateConnectionState('not-connected'));
      store.dispatch(chatSlice.actions.resetMessages());
    }
  }

  return result;
};

// 辅助函数
function formatTime(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

export const {
  setMessages,
  addMessage,
  clearMessages,
  removeMessage,
  removeLastMessage,
  setProcessingState,
  setCurrentRequestId,
  setIsRequesting,
  setConnectionState,
  setQueuePosition,
  setWasActive,
  updateLastActivity,
  resetMessages,
  updateConnectionState,
} = chatSlice.actions;

export default chatSlice.reducer; 