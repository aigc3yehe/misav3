import { Box, Typography, styled, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { useState, useEffect, KeyboardEvent, useRef } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import ChatInput from './ChatInput';
import msgDown from '../assets/msg_down.svg';
import msgUp from '../assets/msg_up.svg';
import MessageBubble from './ChatWindow/MessageBubble';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { sendMessage, checkConnectionStatus, addMessage, removeMessage } from '../store/slices/chatSlice';
import { checkTokenBalance } from '../store/slices/walletSlice';
import { InputBaseProps } from '@mui/material';
import { useWriteContract, useWaitForTransactionReceipt, useChainId } from 'wagmi';
import { showToast } from '../store/slices/toastSlice';
import { parseUnits } from 'viem';

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
  time?: string;
  show_status?: 'send_eth' | 'idle' | 'disconnected' | 'queuing';
  actions?: Array<{
    label: string;
    variant: 'primary' | 'secondary';
    onClick: () => void;
    disabled?: boolean;
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
      onClick: () => {}, // 将在组件中更新
      disabled: false
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
      onClick: () => {}, // 将在组件中更新
      disabled: false
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
      onClick: () => {}, // 将在组件中更新
      disabled: false 
    }
  ]
});

// 添加时间格式化辅助函数
const formatTime = (date: Date): string => {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

// 转换消息格式的函数
const convertChatMessage = (
  chatMessage: any, 
  handleSendEth: (id: number) => void,
  checkPayment: () => void,
  retryLastMessage: (lastUserMessage: string) => void,
  messages: any[],
  // 添加支付状态参数
  isPending: boolean,
  isConfirming: boolean,
  isConfirmed: boolean,
  isTransactionFailed: boolean,
  hash: `0x${string}` | undefined,
  error: Error | null
): Message => {
  const baseMessage = {
    id: chatMessage.id || Date.now(),
    isUser: chatMessage.role === 'user',
    content: chatMessage.content,
    type: chatMessage.type || 'text',
    time: chatMessage.time || formatTime(new Date()),
    avatar: chatMessage.role === 'user' ? undefined : '/misato.jpg',
    show_status: chatMessage.show_status,
    };

  // 如果是需要支付的消息
  if (chatMessage.show_status === 'send_eth' && chatMessage.payment_info) {
    // 获取发送按钮文本
    const getSendButtonLabel = () => {
      if (isTransactionFailed) return 'Pay 200k $MISATO';
      if (isPending) return 'Paying...';
      if (isConfirming) return 'Confirming...';
      if (isConfirmed) return 'Confirmed!';
      return 'Pay 200k $MISATO';
    };

    return {
      ...baseMessage,
      actions: [
        {
          label: getSendButtonLabel(),
          variant: 'primary',
          onClick: () => handleSendEth(chatMessage.id),
          disabled: isPending || isConfirming
        },
        {
          label: 'Check Payment',
          variant: 'secondary',
          onClick: checkPayment,
          disabled: !hash && !error
        }
      ]
    };
  }

  // 如果是错误消息且是最后一条消息
  if (chatMessage.type === 'error' && chatMessage.id === messages[messages.length - 1].id) {
    // 找到最后一条用户消息
    const lastUserMessage = messages
      .slice()
      .reverse()
      .find(msg => msg.role === 'user')?.content;

    return {
      ...baseMessage,
      actions: [
        {
          label: 'Retry',
          variant: 'primary',
          onClick: () => lastUserMessage && retryLastMessage(lastUserMessage)
        }
      ]
    };
  }

  return baseMessage;
};

// MISATO 代币的 ABI
const abi = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "transfer",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const

export default function ChatWindow({ agentName }: ChatWindowProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { authenticated, user, login } = usePrivy();
  const connectionState = useSelector((state: RootState) => state.chat.connectionState);
  const queuePosition = useSelector((state: RootState) => state.chat.queuePosition);
  const chatMessages = useSelector((state: RootState) => state.chat.messages);
  const collectionName = useSelector((state: RootState) => state.chat.collectionName);
  const [message, setMessage] = useState('');
  const isRequesting = useSelector((state: RootState) => state.chat.isRequesting);
  const processingState = useSelector((state: RootState) => state.chat.processingState);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<InputBaseProps['inputRef']>();

  const [latestPaymentHash, setLatestPaymentHash] = useState<string | null>(null);
  const [isTransactionFailed, setIsTransactionFailed] = useState(false);
  // 添加对话框状态
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [currentPaymentId, setCurrentPaymentId] = useState<number | null>(null);

  console.log('user', user);
  console.log('authenticated', authenticated);

  const { 
    data: hash, // 交易哈希
    isPending, // 是否正在等待交易
    error, // 错误
    writeContract // 写入合约
  } = useWriteContract()

  const {
    isLoading: isConfirming, // 是否正在等待交易确认
    isSuccess: isConfirmed, // 是否交易确认成功
  } = useWaitForTransactionReceipt({
    hash
  })

  const chainId = useChainId();

  // 处理发送 eth
  const sendEth = (id: number) => {
    if (!authenticated) {
      dispatch(showToast({
        message: 'Please connect your wallet first.',
        severity: 'error'
      }));
      return;
    }

    // 获取当前消息的支付信息并进行类型检查
    const message = chatMessages.find(msg => msg.id === id);
    const paymentInfo = message?.payment_info;
    if (!paymentInfo || 
      !paymentInfo.recipient_address ||
      !paymentInfo.price ||
      !paymentInfo.network ||
      !paymentInfo.chainId
    ) {
      dispatch(showToast({
        message: 'Payment info not found.',
        severity: 'error'
      }));
      return;
    }

    // 保存当前正在处理的交易消息
    setCurrentPaymentId(id);

    const { recipient_address, price, network, chainId: requiredChainId } = paymentInfo;

    // 检查网络是否正确
    if (chainId !== requiredChainId) {
      dispatch(showToast({
        message: `Please switch to ${network} network`,
        severity: 'error'
      }));
      return;
    }

    console.log('Sending Transaction...', recipient_address, price, chainId, requiredChainId);

    try {
      // 发送交易
      writeContract({
        address: '0x98f4779FcCb177A6D856dd1DfD78cd15B7cd2af5',
        abi: abi,
        functionName: 'transfer',
        args: [
          recipient_address as `0x${string}`,
          parseUnits(price, 18)
        ]
      })

      console.log('Transaction sent:', hash, error);

      if (error) {
        dispatch(showToast({
          message: `Failed to send ETH. ${error.message}`,
          severity: 'error'
        }));
        return;
      }

      // 发送提醒交易成功的消息
      dispatch(showToast({
        message: 'Transaction sent successfully.',
        severity: 'success'
      }));
    } catch (error) {
      console.error('Failed to send ETH:', error);
      setCurrentPaymentId(null);
      dispatch(showToast({
        message: `Failed to send ETH.`,
        severity: 'error'
      }));
    }
  }

  

  // 处理发送 ETH
  const handleSendEth = (id: number) => {
    setIsTransactionFailed(false);
    const currentMessage = chatMessages.find(msg => msg.id === id);
    const paymentInfo = currentMessage?.payment_info;

    if (!paymentInfo
      || !paymentInfo.recipient_address 
      || !paymentInfo.price
      || !paymentInfo.network
      || !paymentInfo.chainId
    ) {
      dispatch(showToast({
        message: 'Payment info is incomplete.',
        severity: 'error'
      }));
      return;
    }

    setCurrentPaymentId(id);
    setShowConfirmDialog(true);
  };

  // 确认支付
  const confirmPayment = () => {
    if (!currentPaymentId) return;
    sendEth(currentPaymentId);
    setShowConfirmDialog(false);
  };

  // 渲染确认对话框内容
  const renderDialogContent = () => {
    const currentMessage = chatMessages.find(msg => msg.id === currentPaymentId);
    const paymentInfo = currentMessage?.payment_info;

    if (!paymentInfo) return null;

    if (isConfirmed && hash) {
      // 已有成功交易的确认框
      return (
        <>
          <DialogTitle>Payment Already Sent</DialogTitle>
          <DialogContent>
            <Typography>You have already made a payment for this request.</Typography>
            <Typography sx={{ mt: 1, color: '#666' }}>
              Previous transaction hash: {hash}
            </Typography>
            <Typography sx={{ mt: 1.5, color: '#2C0CB9' }}>
              Do you still want to make another payment?
            </Typography>
            <Box sx={{ mt: 1, fontSize: '12px', color: '#999' }}>
              <Typography variant="body2">Amount: {paymentInfo.price} $MISATO</Typography>
              <Typography variant="body2">Recipient: {paymentInfo.recipient_address}</Typography>
              <Typography variant="body2">Network: {paymentInfo.network}</Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowConfirmDialog(false)}>Cancel</Button>
            <Button onClick={confirmPayment} variant="contained">Yes, Pay Again</Button>
          </DialogActions>
        </>
      );
    }

    // 首次支付的确认框
    return (
      <>
        <DialogTitle>Send $MISATO</DialogTitle>
        <DialogContent>
          <Typography>Are you sure to pay {paymentInfo.price} $MISATO?</Typography>
          <Box sx={{ mt: 1, fontSize: '12px', color: '#999' }}>
            <Typography variant="body2">Recipient: {paymentInfo.recipient_address}</Typography>
            <Typography variant="body2">Network: {paymentInfo.network}</Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmDialog(false)}>Cancel</Button>
          <Button onClick={confirmPayment} variant="contained">Confirm</Button>
        </DialogActions>
      </>
    );
  };

  // 添加重试处理函数
  const handleRetry = async (lastUserMessage: string) => {
    // 移除最后一条错误消息
    const lastId = messages[messages.length - 1].id;
    if (typeof lastId === 'number') {
      dispatch(removeMessage(lastId));
    } else {
      dispatch(removeMessage(parseInt(lastId)));
    }
    // 重新发送最后一条用户消息
    await dispatch(sendMessage({ 
      messageText: lastUserMessage,
      payFeeHash: latestPaymentHash || undefined
    })).unwrap();
  };

  // 检查支付状态
  const checkPayment = () => {
    // 打印所有相关状态
    console.log('isConfirmed:', isConfirmed, 'hash:', hash,
      'isPending:', isPending,
      'isConfirming:', isConfirming,
      'error:', error
    );

    if (!hash) {
      dispatch(showToast({
        message: 'Transaction not found.',
        severity: 'warning'
      }));
      return;
    }

    if (isConfirming) {
      dispatch(showToast({
        message: 'Transaction is being confirmed...',
        severity: 'info'
      }));
      return;
    }

    // 如果交易成功，显示成功消息
    if (isConfirmed && hash) {
      dispatch(showToast({
        message: 'Transaction confirmed.',
        severity: 'success'
      }));
    }

    if (error) {
      dispatch(showToast({
        message: `Failed to send ETH`,
        severity: 'error'
      }));
    }
  }

  // 监听交易状态
  useEffect(() => {
    if (isConfirmed && hash) {
      // 交易确认后添加消息
      dispatch(showToast({
        message: 'Payment confirmed.',
        severity: 'success'
      }));
      setLatestPaymentHash(hash);
      dispatch(addMessage({
        id: Date.now(),
        role: 'user',
        content: "Submitted the transaction. I will click 'check payment' and copy hash to you, after the transaction is confirmed.",
        type: 'transaction',
      }));
    }
  }, [hash, isConfirmed]);

  // 根据状态获取要显示的消息
  const messages: Message[] = (() => {
    if (!authenticated) {
      return [{
        ...walletMessage,
        actions: [{
          // @ts-ignore
          ...walletMessage.actions[0],
          onClick: () => login()
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
            onClick: () => dispatch(checkTokenBalance(user?.wallet?.address || ''))
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
        return chatMessages.map(msg => 
          convertChatMessage(
            msg, 
            handleSendEth, 
            checkPayment,
            handleRetry, 
            chatMessages,
            isPending,
            isConfirming,
            isConfirmed,
            isTransactionFailed,
            hash,
            error
          )
        );
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
      await dispatch(sendMessage({ 
        messageText: message.trim(),
        payFeeHash: latestPaymentHash || undefined
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
    const isInputEnabled = authenticated && !isRequesting && processingState === 'idle';
    if (isInputEnabled) {
      // 使用 MUI 的 inputRef
      const input = inputRef.current as unknown as HTMLInputElement;
      input?.focus();
    }
  }, [authenticated, isRequesting, processingState]);

  // 判断输入框是否应该禁用
  const isInputDisabled = !authenticated || 
    processingState !== 'idle' ||
    //connectionState === 'not-enough-tokens' ||
    connectionState === 'queuing';

  return (
    <WindowContainer isExpanded={isExpanded}>
      <TitleBar>
        <TitleSection>
          <AgentName>{agentName}</AgentName>
          {collectionName && (
            <CollectionTag>
              <CollectionText>Collection</CollectionText>
              <FrensText>{collectionName}</FrensText>
            </CollectionTag>
          )}
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
              processingState={processingState}
            />
          </InputContainer>
        </>
      )}

      {/* 添加确认对话框 */}
      <Dialog 
        open={showConfirmDialog} 
        onClose={() => setShowConfirmDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        {renderDialogContent()}
      </Dialog>
    </WindowContainer>
  );
}