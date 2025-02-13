import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '..';

const WELCOME_MSG_ID = 1

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
  show_status?: 'send_eth' | 'idle' | 'disconnected' | 'queuing' | 'upload_image';  // 显示状态
  payment_info?: PaymentInfo;             // 支付信息（如果需要）
  urls?: string[];  // 新增字段，用于存储上传的图片URL
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
  collectionName?: string | null;         // 收藏集名称
}

// 初始欢迎消息
const initialMessages: ChatMessage[] = [
  {
    id: WELCOME_MSG_ID,
    type: 'text',
    content: '### Welcome! I ($MISATO) am offering minting services for two NFT collections: MISATO Frens and Seven Bond. If you\'re interested in them, just let me know by saying: "I want to buy an NFT."',
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

// 添加类型检查辅助函数
const sendToUnity = (content: string, finish: boolean) => {
  if (window.unityInstance?.SendMessage) {
    window.unityInstance.SendMessage('JSCall', 'AddVoice', JSON.stringify({
      content,
      finish: finish
    }));
  }
};

const convertNumberToWords = (text: string): string => {
  const numberWords: { [key: string]: string } = {
    '0': 'zero', '1': 'one', '2': 'two', '3': 'three', '4': 'four',
    '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine',
    '10': 'ten', '11': 'eleven', '12': 'twelve', '13': 'thirteen',
    '14': 'fourteen', '15': 'fifteen', '16': 'sixteen',
    '17': 'seventeen', '18': 'eighteen', '19': 'nineteen',
    '20': 'twenty', '30': 'thirty', '40': 'forty', '50': 'fifty',
    '60': 'sixty', '70': 'seventy', '80': 'eighty', '90': 'ninety'
  }

  const ordinalWords: { [key: string]: string } = {
    '1': 'first', '2': 'second', '3': 'third', '4': 'fourth',
    '5': 'fifth', '6': 'sixth', '7': 'seventh', '8': 'eighth',
    '9': 'ninth', '10': 'tenth'
  }

  // 首先处理序号格式 (例如: "1.", "2.")
  // @ts-ignore
  text = text.replace(/(\d+)\.\s/g, (match, num) => {
    return ordinalWords[num] ? `${ordinalWords[num]}, ` : `number ${num}, `
  })

  // 然后处理其他数字
  return text.replace(/\b\d*\.?\d+\b/g, (match) => {
    // 处理小数
    if (match.includes('.')) {
      const [intPart, decPart] = match.split('.')
      const intWords = intPart === '' ? 'zero' : 
                      intPart === '0' ? 'zero' : 
                      convertNumber(intPart)
      
      const decWords = decPart.split('')
        .map(digit => numberWords[digit])
        .join(' ')
      
      return `${intWords} point ${decWords}`
    }
    
    // 处理整数
    return convertNumber(match)
  })

  // 处理数字的辅助函数
  function convertNumber(num: string): string {
    const number = parseInt(num)
    
    // 处理 0-99 的数字
    if (number >= 0 && number < 100) {
      if (numberWords[num]) {
        return numberWords[num]
      }
      if (number > 20) {
        const tens = Math.floor(number / 10) * 10
        const ones = number % 10
        return ones > 0 
          ? `${numberWords[tens.toString()]}-${numberWords[ones.toString()]}` 
          : numberWords[tens.toString()]
      }
    }
    
    // 对于其他数字，逐个读出
    return num.split('')
      .map(digit => numberWords[digit])
      .join(' ')
  }
}

// 获取API基础URL
const getApiBaseUrl = (getState: () => RootState) => {
  const state = getState();
  return state.agent.currentAgent?.id === 'niyoko' ? '/niyoko-chat-api/' : '/api/';
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
    dispatch(updateLastActivity());
    try {
      // 添加用户消息到列表
      const messageId = Date.now();
      dispatch(addMessage({
        id: messageId,
        type: 'text',
        role: 'user',
        content: messageText,
        time: formatTime(new Date()),
      }));
      await waitForRequestAvailable(getState as () => RootState);
      dispatch(setIsRequesting(true));

      const state = getState() as RootState;
      const { address: walletAddress, userUuid } = state.wallet;
      const apiBaseUrl = getApiBaseUrl(getState as () => RootState);
      
      // 过滤并准备对话历史
      const conversation_history = state.chat.messages
        .filter(msg => 
          // 排除当前发送的新消息
          !(msg.id === messageId && msg.content === messageText) &&
          (msg.role === 'assistant' || msg.role === 'user') && 
          msg.type !== 'transaction'
        )
        .map(msg => ({ 
          role: msg.role, 
          content: msg.content 
        }));

      // 获取最新的带有 URLs 的消息
      const latestMessageWithUrls = [...state.chat.messages]
        .reverse()
        .find(msg => msg.urls && msg.urls.length > 0);

      // 准备请求体
      const baseBody = {
        message: messageText,
        conversation_history,
        wallet_address: walletAddress || '',
      };

      // 根据 agent 类型添加额外字段
      const requestBody = state.agent.currentAgent?.id === 'niyoko' 
        ? {
            ...baseBody,
            urls: latestMessageWithUrls?.urls || []
          }
        : {
            ...baseBody,
            user_uuid: userUuid || 'anonymous',
            request_id: state.chat.currentRequestId,
            pay_fee_hash: payFeeHash,
            collection: state.chat.collectionName
          };

      // 发送请求
      const response = await fetch(`${apiBaseUrl}chat`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFnZW50IiwiaWF0IjoxNzMyNDQzNjUxfQ.mEGxHMQPGxb2q4nEDvyAJwCjGGQmi9DNcXgslosn6DI',
          'x-user-id': userUuid || 'anonymous'
        },
        body: JSON.stringify(requestBody)
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
      if (data.status === 'paying' || data.status?.status === 'paying'){
        // 获取正确的支付信息
        const recipientAddress = data.recipient_address || data.status?.recipient_address || ''
        const price = data.price || data.status?.price || ''
        const network = data.network || data.status?.network || ''
        const chainId = data.chainId || data.status?.chainId || 0
        const content = data.content || data.status?.content || ''

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
        const sentences = content.split(/[.,!?。！？]/g).filter(Boolean)
        const lastIndex = sentences.length - 1

        sentences.forEach((sentence: string, index: number) => {
          const cleanSentence = sentence.trim()
          if (cleanSentence) {
            sendToUnity(convertNumberToWords(cleanSentence), index === lastIndex)
          }
        })
        return data;
      }

      if (data.status === 'upload_image') {
        // 添加一条需要上传图片的消息
        dispatch(addMessage({
          id: Date.now(),
          content: data.content || 'Please upload your images.',
          role: 'assistant',
          type: 'text',
          show_status: 'upload_image',
          urls: [], // 初始化空数组
          time: formatTime(new Date()),
        }));
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

      // 如果是收藏集请求，添加收藏集名称
      if (data.collection) {
        dispatch(setCollectionName(data.collection))
      }

      // 将 AI 回复分段发送到 Unity
      // 逐句发送到 Unity 进行语音播放前进行数字转换
      // 将 AI 回复分段发送到 Unity
      const sentences = data.content.split(/[.,!?。！？]/g).filter(Boolean)
      const lastIndex = sentences.length - 1

      sentences.forEach((sentence: string, index: number) => {
        const cleanSentence = sentence.trim()
        if (cleanSentence) {
          sendToUnity(convertNumberToWords(cleanSentence), index === lastIndex)
        }
      })

      return data;
    } catch (error) {
      // 添加错误消息
      dispatch(addMessage({
        id: Date.now(),
        type: 'error',
        role: 'system',
        content: 'Sorry, an error occurred while processing the message. Please try again.',
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
      const interval = 6000; // 每6秒检查一次

      while (attempts < maxAttempts) {
        await waitForRequestAvailable(getState as () => RootState);
        
        const apiBaseUrl = getApiBaseUrl(getState as () => RootState);

        try {
          const response = await fetch(`${apiBaseUrl}generation-status/${requestId}`, {
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
            const cleanContent = content.replace(/!\[.*?\]\(.*?\)/g, '')
            const sentences = cleanContent.split(/[.,!?。！？]/g).filter(Boolean)
            const lastIndex = sentences.length - 1

            sentences.forEach((sentence: string, index: number) => {
              const cleanSentence = sentence.trim()
              if (cleanSentence) {
                sendToUnity(convertNumberToWords(cleanSentence), index === lastIndex)
              }
            })

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
            sendToUnity('Image generation failed, please try again.', true)

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
      sendToUnity('Error checking image generation status', true)
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
      const apiBaseUrl = getApiBaseUrl(getState as () => RootState);
      
      const response = await fetch(`${apiBaseUrl}heartbeat`, {
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
      const apiBaseUrl = getApiBaseUrl(getState as () => RootState);
      
      const response = await fetch(`${apiBaseUrl}initial-connection/${userUuid}`, {
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
      state.collectionName = null;
    },
    setCollectionName: (state, action: PayloadAction<string | null>) => {
      state.collectionName = action.payload;
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
      state.collectionName = null;
    },
    updateMessageUrls: (state, action: PayloadAction<{ messageId: string | number; urls: string[] }>) => {
      const { messageId, urls } = action.payload;
      const message = state.messages.find(msg => msg.id === messageId);
      if (message) {
        message.urls = urls;
      }
    },
  },
  extraReducers: (builder) => {
    builder
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
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        console.log('执行sendMessage.rejected', action.payload);
        state.processingState = 'idle';
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
  setCollectionName,
  setCurrentRequestId,
  setIsRequesting,
  setConnectionState,
  setQueuePosition,
  setWasActive,
  updateLastActivity,
  resetMessages,
  updateConnectionState,
  updateMessageUrls,
} = chatSlice.actions;

export default chatSlice.reducer; 