import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '..';

interface PaymentInfo {
  recipient_address: string;
  price: string;
  network: string;
  chainId: number;
}

export interface ChatMessage {
  id: number;
  content: string;
  role: 'user' | 'assistant' | 'system';
  type: 'text' | 'image' | 'error' | 'transaction';
  time?: string;
  show_status?: 'send_eth' | 'idle';
  payment_info?: PaymentInfo;
}

interface ChatState {
  messages: ChatMessage[];
  processingState: 'idle' | 'thinking' | 'generating' | 'minting';
  currentRequestId: string | null;
  isRequesting: boolean;
  connectionState: 'ready' | 'queuing';
  queuePosition: number;
  wasActive: boolean;
  lastActivityTime: number;
}

const initialMessages: ChatMessage[] = [
  {
    id: 1,
    type: 'text',
    content: '### MISATO just opened her own studio! You can ask her about NFT purchases. Minting fee 200k $MISATO, total supply 500. ### Max 1 per wallet, DO NOT mint 2 Frens NFTs using the same address.',
    role: 'system',
  }
];

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

// 心跳请求
export const sendHeartbeat = createAsyncThunk(
  'chat/sendHeartbeat',
  async (_, { getState }) => {
    const response = await fetch('/api/heartbeat', {
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFnZW50IiwiaWF0IjoxNzMyNDQzNjUxfQ.mEGxHMQPGxb2q4nEDvyAJwCjGGQmi9DNcXgslosn6DI',
        'x-user-id': 'user-uuid' // 需要从wallet store获取
      }
    });
    
    return await response.json();
  }
);

// 发送消息
export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ 
    messageText, 
    payFeeHash 
  }: { 
    messageText: string; 
    payFeeHash?: string 
  }, { getState, dispatch }) => {
    const state = getState() as RootState;
    
    // 添加用户消息
    dispatch(addMessage({
      id: Date.now(),
      type: 'text',
      role: 'user',
      content: messageText,
    }));

    const conversation_history = state.chat.messages
      .filter(msg => 
        (msg.role === 'assistant' || msg.role === 'user') && 
        msg.type !== 'transaction'
      )
      .map(msg => ({ 
        role: msg.role, 
        content: msg.content 
      }));

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFnZW50IiwiaWF0IjoxNzMyNDQzNjUxfQ.mEGxHMQPGxb2q4nEDvyAJwCjGGQmi9DNcXgslosn6DI',
        'x-user-id': 'user-uuid' // 需要从wallet store获取
      },
      body: JSON.stringify({
        message: messageText,
        conversation_history,
        user_uuid: 'user-uuid', // 需要从wallet store获取
        wallet_address: 'wallet-address', // 需要从wallet store获取
        request_id: state.chat.currentRequestId,
        pay_fee_hash: payFeeHash
      })
    });

    return await response.json();
  }
);

// 轮询图片生成状态
export const pollImageStatus = createAsyncThunk(
  'chat/pollImageStatus',
  async (requestId: string, { dispatch }) => {
    const progressMessageId = Date.now();
    dispatch(addMessage({
      id: progressMessageId,
      type: 'text',
      role: 'system',
      content: '🎨 Generating image...',
    }));

    try {
      const response = await fetch(`/api/generation-status/${requestId}`, {
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFnZW50IiwiaWF0IjoxNzMyNDQzNjUxfQ.mEGxHMQPGxb2q4nEDvyAJwCjGGQmi9DNcXgslosn6DI',
          'x-user-id': 'user-uuid' // 需要从wallet store获取
        }
      });
      
      const result = await response.json();
      dispatch(removeMessage(progressMessageId));

      return result;
    } catch (error) {
      dispatch(removeMessage(progressMessageId));
      throw error;
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      state.messages.push({
        ...action.payload,
        time: formatTime(new Date()),
      });
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
      .addCase(sendHeartbeat.fulfilled, (state, action) => {
        state.wasActive = action.payload.isActive;
        if (action.payload.inQueue) {
          state.connectionState = 'queuing';
          state.queuePosition = action.payload.position || 100;
        } else if (action.payload.isActive) {
          state.connectionState = 'ready';
        }
      })
      // 处理发送消息
      .addCase(sendMessage.pending, (state) => {
        state.processingState = 'thinking';
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        if (action.payload.request_id) {
          state.currentRequestId = action.payload.request_id;
          state.processingState = 'generating';
        } else {
          state.processingState = 'idle';
        }
      })
      // 处理图片状态轮询
      .addCase(pollImageStatus.fulfilled, (state, action) => {
        if (action.payload.status === 'completed') {
          state.processingState = 'idle';
          state.currentRequestId = null;
        }
      });
  },
});

// 辅助函数
function formatTime(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

export const {
  addMessage,
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
} = chatSlice.actions;

export default chatSlice.reducer; 