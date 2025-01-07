import { Box, Typography, styled } from '@mui/material';
import { useState, useEffect, KeyboardEvent, useRef } from 'react';
import { useAccount } from 'wagmi';
import { useAppKit } from '@reown/appkit/react'
import ChatInput from './ChatInput';
import msgDown from '../assets/msg_down.svg';
import msgUp from '../assets/msg_up.svg';
import MessageBubble from './ChatWindow/MessageBubble';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { sendMessage, checkConnectionStatus } from '../store/slices/chatSlice';
import { checkTokenBalance } from '../store/slices/walletSlice';
import { InputBaseProps } from '@mui/material';

const ORIGINAL_HEIGHT = 1800;  // 原始设计高度
const WINDOW_HEIGHT = 1180;    // 原始窗口高度

const WindowContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isExpanded'
})<{ isExpanded: boolean }>(({ isExpanded }) => ({
  width: 722,
  height: isExpanded ? `calc(${WINDOW_HEIGHT}px * min(1, ${window.innerHeight}/${ORIGINAL_HEIGHT}))` : 70,
  padding: 20,
  display: 'flex',
  flexDirection: 'column',
  gap: 15,
  borderRadius: '10px 10px 0 0',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  transition: 'all 0.3s ease',
  overflow: 'hidden',
}));

const TitleBar = styled(Box)({
  width: '100%',
  height: 30,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

const TitleSection = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: 20,
});

const AgentName = styled(Typography)({
  fontSize: 20,
  fontWeight: 900,
  lineHeight: '140%',
  color: '#FFFFFF',
});

const CollectionTag = styled(Box)({
  height: 30,
  padding: '0 15px',
  borderRadius: 10,
  backgroundColor: 'rgba(78, 49, 141, 0.6)',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  display: 'flex',
  alignItems: 'center',
});

const CollectionText = styled('span')({
  fontSize: 16,
  fontWeight: 500,
  lineHeight: '140%',
  color: '#8855D7',
});

const FrensText = styled('span')({
  fontSize: 16,
  fontWeight: 500,
  lineHeight: '140%',
  color: '#FFFFFF',
  marginLeft: 4,
});

const ToggleButton = styled('img')({
  width: 30,
  height: 30,
  cursor: 'pointer',
});

const MessageList = styled(Box)({
  width: '100%',
  flex: 1,
  padding: '30px 24px',
  borderRadius: 10,
  backgroundColor: 'rgba(21, 15, 32, 0.6)',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
  gap: 20,
});

const InputContainer = styled(Box)({
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
});

interface ChatWindowProps {
  agentName: string;
}

interface Message {
  id: string | number;
  isUser: boolean;
  content: string;
  type?: 'text' | 'image' | 'error' | 'transaction';
  avatar?: string;
  actions?: Array<{
    label: string;
    variant: 'primary' | 'secondary';
    onClick: () => void;
  }>;
}

// 未连接钱包时的消息
const walletMessage: Message = {
  id: 'wallet-connect',
  isUser: false,
  content: 'Please connect your wallet first.',
  avatar: '/misato.jpg',
  actions: [
    { 
      label: 'CONNECT', 
      variant: 'primary',
      onClick: () => {} // 将在组件中更新
    }
  ]
};

// Token不足时的消息
const notEnoughTokensMessage: Message = {
  id: 'not-enough-tokens',
  isUser: false,
  content: 'Hold at least 50k $MISATO to enter the conversation...',
  avatar: '/misato.jpg',
  actions: [
    {
      label: 'RECHECK',
      variant: 'primary',
      onClick: () => {} // 将在组件中更新
    }
  ]
};

// 排队等待时的消息
const createQueueMessage = (position: number): Message => ({
  id: 'queuing',
  isUser: false,
  content: `There are too many people at the moment, please wait... ${position} people are waiting.`,
  avatar: '/misato.jpg',
  actions: [
    {
      label: 'TRY TO CONNECT',
      variant: 'primary',
      onClick: () => {} // 将在组件中更新
    }
  ]
});

// 转换消息格式的函数
const convertChatMessage = (chatMessage: any): Message => {
  return {
    id: chatMessage.id || Date.now(),
    isUser: chatMessage.role === 'user',
    content: chatMessage.content,
    avatar: chatMessage.role === 'user' ? undefined : '/misato.jpg',
    ...(chatMessage.type === 'transaction' && {
      actions: [
        {
          label: 'Send ETH',
          variant: 'primary',
          onClick: () => console.log('Send ETH')
        }
      ]
    })
  };
};

export default function ChatWindow({ agentName }: ChatWindowProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { isConnected, address } = useAccount();
  const { open } = useAppKit();
  const connectionState = useSelector((state: RootState) => state.chat.connectionState);
  const queuePosition = useSelector((state: RootState) => state.chat.queuePosition);
  const chatMessages = useSelector((state: RootState) => state.chat.messages);
  const [message, setMessage] = useState('');
  const isRequesting = useSelector((state: RootState) => state.chat.isRequesting);
  const processingState = useSelector((state: RootState) => state.chat.processingState);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<InputBaseProps['inputRef']>();

  // 根据状态获取要显示的消息
  const messages: Message[] = (() => {
    if (!isConnected) {
      return [{
        ...walletMessage,
        actions: [{
          // @ts-ignore
          ...walletMessage.actions[0],
          onClick: () => open()
        }]
      }];
    }
    
    switch (connectionState) {
      case 'not-enough-tokens':
        return [{
          ...notEnoughTokensMessage,
          actions: [{
            // @ts-ignore
            ...notEnoughTokensMessage.actions[0],
            onClick: () => dispatch(checkTokenBalance(address || ''))
          }]
        }];
      case 'queuing':
        return [{
          ...createQueueMessage(queuePosition),
          actions: [{
            // @ts-ignore
            ...createQueueMessage(queuePosition).actions[0],
            onClick: () => dispatch(checkConnectionStatus())
          }]
        }];
      default:
        return chatMessages.map(convertChatMessage);
    }
  })();

  const [isExpanded, setIsExpanded] = useState(true);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const handleSend = async () => {
    if (!message.trim() || isRequesting) return;

    try {
      // 清空输入框
      setMessage('');
      // 使用正确的类型
      const result = await dispatch(sendMessage({ 
        messageText: message.trim(),
        payFeeHash: undefined // 如果需要支付相关的参数
      })).unwrap();
      
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  // 处理回车键发送消息
  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // 阻止默认的换行行为
      handleSend();
    }
  };

  // 滚动到底部的函数
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 当消息列表更新时滚动到底部
  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  // 当输入框变为可用时自动聚焦
  useEffect(() => {
    const isInputEnabled = isConnected && !isRequesting && processingState === 'idle';
    if (isInputEnabled) {
      // 使用 MUI 的 inputRef
      const input = inputRef.current as unknown as HTMLInputElement;
      input?.focus();
    }
  }, [isConnected, isRequesting, processingState]);

  // 判断输入框是否应该禁用
  const isInputDisabled = !isConnected || 
    isRequesting || 
    processingState !== 'idle' ||
    connectionState === 'not-enough-tokens' ||
    connectionState === 'queuing';

  return (
    <WindowContainer isExpanded={isExpanded}>
      <TitleBar>
        <TitleSection>
          <AgentName>{agentName}</AgentName>
          <CollectionTag>
            <CollectionText>Collection</CollectionText>
            <FrensText>Misato Frens</FrensText>
          </CollectionTag>
        </TitleSection>
        <ToggleButton 
          src={isExpanded ? msgDown : msgUp} 
          alt="toggle chat" 
          onClick={handleToggle}
        />
      </TitleBar>
      
      {isExpanded && (
        <>
          <MessageList>
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                isUser={msg.isUser}
                content={msg.content}
                avatar={msg.avatar}
                actions={msg.actions}
              />
            ))}
            <div ref={messagesEndRef} />
          </MessageList>
          <InputContainer>
            <ChatInput
              value={message}
              onChange={setMessage}
              onSend={handleSend}
              onKeyPress={handleKeyPress}
              disabled={isInputDisabled}
              inputRef={inputRef}
            />
          </InputContainer>
        </>
      )}
    </WindowContainer>
  );
}