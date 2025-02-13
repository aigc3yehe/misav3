import { Box, Typography, styled } from '@mui/material';
import { useState, useEffect, KeyboardEvent, useRef } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useAccount } from 'wagmi';
import ChatInput from './ChatInput';
import msgDown from '../assets/msg_down.svg';
import msgUp from '../assets/msg_up.svg';
import MessageBubble from './ChatWindow/MessageBubble';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { sendMessage, checkConnectionStatus, addMessage, removeMessage } from '../store/slices/chatSlice';
import { checkTokenBalance } from '../store/slices/walletSlice';
import { InputBaseProps } from '@mui/material';
import { useSendTransaction, useWriteContract, useWaitForTransactionReceipt, useChainId } from 'wagmi';
import { showToast } from '../store/slices/toastSlice';
import { parseUnits, parseEther } from 'viem';
import { selectCollectionByName } from '../store/slices/collectionSlice';
import CommonDialog, { ActionButton } from './CommonDialog';
import { Collection } from '../store/slices/collectionSlice';

const ORIGINAL_HEIGHT = 1800;  // 原始设计高度
const WINDOW_HEIGHT = 1180;    // 原始窗口高度

const WindowContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isExpanded'
})<{ isExpanded: boolean }>(({ theme, isExpanded }) => ({
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

  [theme.breakpoints.down('sm')]: {
    width: '100%',
    padding: '10px 12px',
    // 添加底部安全距离（适配不同机型的底部区域）
    paddingBottom: 'calc(10px + env(safe-area-inset-bottom))',
  },
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

const MessageList = styled(Box)(({ theme }) => ({
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
  [theme.breakpoints.down('sm')]: {
    padding: '20px 14px',
    gap: 14,
  },
}));

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
  urls?: string[]
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

const formatPrice = (price: number): string => {
  // 将价格转换为K,M,B,并保留2位小数
  if (price >= 1000000000) {
    return (price / 1000000000).toFixed(2) + 'B';
  } else if (price >= 1000000) {
    return (price / 1000000).toFixed(2) + 'M';
  } else if (price >= 1000) {
    return (price / 1000).toFixed(2) + 'K';
  }
  return price.toString();
};

// 转换消息格式的函数
const convertChatMessage = (
  agentId: string | undefined,
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
  sendHash: `0x${string}` | undefined,
  error: Error | null,
  currentCollection: Collection | null
): Message => {

  let content = chatMessage.content;
  if (chatMessage.id === 1) {
    if (agentId === 'niyoko') {
      content = "Hi, I'm Niyoko, I'm an AI agent for professional model training."
    } else {
      content = '### Welcome! I ($MISATO) am offering minting services for two NFT collections: MISATO Frens and Seven Bond. If you\'re interested in them, just let me know by saying: "I want to buy an NFT."'
    }
  }

  const baseMessage = {
    id: chatMessage.id || Date.now(),
    isUser: chatMessage.role === 'user',
    content: content,
    type: chatMessage.type || 'text',
    time: chatMessage.time || formatTime(new Date()),
    avatar: chatMessage.role === 'user' ? undefined : '/misato.jpg',
    show_status: chatMessage.show_status,
    urls: chatMessage.urls,
    };

  // 如果是需要支付的消息
  if (chatMessage.show_status === 'send_eth') {
    console.log('currentCollection', currentCollection);
    const feeSymbol = currentCollection?.fee?.feeSymbol || 'MISATO';
    const price = currentCollection?.fee?.feeAmount || 0;
    // 获取发送按钮文本
    const getSendButtonLabel = () => {
      if (isTransactionFailed) return `Pay ${formatPrice(price)} $${feeSymbol}`;
      if (isPending) return 'Paying...';
      if (isConfirming) return 'Confirming...';
      if (isConfirmed) return 'Confirmed!';
      return `Pay ${formatPrice(price)} $${feeSymbol}`;
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
          onClick: () => checkPayment(),
          disabled: !sendHash && !hash && !error
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

// 添加一个新的对话框组件用于显示交易确认
const TransactionConfirmedDialog = ({ 
  open, 
  onClose, 
  hash, 
  onCopy 
}: { 
  open: boolean, 
  onClose: () => void, 
  hash: string, 
  onCopy: () => void 
}) => (
  <CommonDialog
    open={open}
    onClose={onClose}
    title="Transaction Confirmed"
    actions={
      <>
        <ActionButton 
          variant="secondary" 
          onClick={onClose}
        >
          Close
        </ActionButton>
        <ActionButton 
          variant="primary" 
          onClick={onCopy}
        >
          Copy Hash
        </ActionButton>
      </>
    }
  >
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <Typography sx={{ fontSize: 14, fontWeight: 400, lineHeight: '140%', color: '#fff' }}>
        Your transaction has been confirmed!
      </Typography>
      <Box sx={{ wordBreak: 'break-all' }}>
        <Typography sx={{ fontSize: 14, fontWeight: 400, lineHeight: '140%', color: '#fff' }}>
          Transaction Hash: 
          <Box component="span" sx={{ 
            color: '#2C0CB9', 
            fontFamily: 'monospace',
            ml: 1
          }}>
            {hash}
          </Box>
        </Typography>
      </Box>
      <Typography sx={{ 
        fontSize: 14, 
        fontWeight: 400, 
        lineHeight: '140%', 
        color: '#666' 
      }}>
        You can copy this hash and paste it to the chat with the word "payed" if the AI hasn't detected your payment automatically.
      </Typography>
    </Box>
  </CommonDialog>
);

export default function ChatWindow({ agentName }: ChatWindowProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { user, login, linkWallet, authenticated } = usePrivy();
  const { isConnected } = useAccount();
  const connectionState = useSelector((state: RootState) => state.chat.connectionState);
  const queuePosition = useSelector((state: RootState) => state.chat.queuePosition);
  const chatMessages = useSelector((state: RootState) => state.chat.messages);
  const collectionName = useSelector((state: RootState) => state.chat.collectionName);
  const [message, setMessage] = useState('');
  const isRequesting = useSelector((state: RootState) => state.chat.isRequesting);
  const processingState = useSelector((state: RootState) => state.chat.processingState);
  const agentId = useSelector((state: RootState) => state.agent.currentAgent?.id);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<InputBaseProps['inputRef']>();

  const [latestPaymentHash, setLatestPaymentHash] = useState<string | null>(null);
  const [isTransactionFailed, setIsTransactionFailed] = useState(false);
  // 添加对话框状态
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [currentPaymentId, setCurrentPaymentId] = useState<number | null>(null);
  const [showConfirmedDialog, setShowConfirmedDialog] = useState(false);

  const shouldShowConnect = !authenticated || !isConnected;

  const { 
    data: hash, // 交易哈希
    isPending, // 是否正在等待交易
    error, // 错误
    writeContract // 写入合约
  } = useWriteContract()

  const {
    data: sendHash, // 交易哈希
    isPending: isSendPending, // 是否正在等待交易
    error: sendError, // 错误
    sendTransaction // 发送交易
  } = useSendTransaction()

  const {
    isLoading: isConfirming, // 是否正在等待交易确认
    isSuccess: isConfirmed, // 是否交易确认成功
  } = useWaitForTransactionReceipt({
    hash
  })

  const {
    isLoading: isSendConfirming, // 是否正在等待交易
    isSuccess: isSendConfirmed, // 是否交易确认成功
  } = useWaitForTransactionReceipt({
    hash: sendHash
  })

  const chainId = useChainId();

  // 获取当前选中的收藏集
  const currentCollection = useSelector((state: RootState) => 
    selectCollectionByName(state, state.chat.collectionName || '')
  );

  // 处理发送 eth
  const sendEth = (id: number) => {
    if (shouldShowConnect) {
      dispatch(showToast({
        message: 'Please connect your wallet first.',
        severity: 'error'
      }));
      return;
    }

    // 获取当前消息的支付信息并进行类型检查
    const message = chatMessages.find(msg => msg.id === id);
    if (message?.show_status !== 'send_eth') {
      dispatch(showToast({
        message: 'Payment info not found.',
        severity: 'error'
      }));
      return;
    }

    // 检查是否有有效的收藏集信息
    const fee = currentCollection?.fee;
    if (!fee || !fee.feeToken || !fee.feeAmount || !fee.feeDecimals
      || !fee.feeSymbol || !fee.treasury
    ) {
      dispatch(showToast({
        message: 'Collection info not found.',
        severity: 'error'
      }));
      return;
    }

    // 保存当前正在处理的交易消息
    setCurrentPaymentId(id);

    const requiredChainId = currentCollection?.chain;
    const recipient_address = fee.treasury;
    const payment_address = fee.feeToken;
    const price = fee.feeAmount.toString();
    const network = currentCollection?.chain;

    // 检查网络是否正确
    if (chainId !== requiredChainId) {
      dispatch(showToast({
        message: `Please switch to ${network} network`,
        severity: 'warning'
      }));
      return;
    }

    console.log('Sending Transaction...', recipient_address, price, chainId, requiredChainId, payment_address);

    // 判断payment_address地址是否是 0x0000000000000000000000000000000000000000, 如果是，采用 sendTransaction 发送交易
    if (payment_address === '0x0000000000000000000000000000000000000000') {
      try {
        sendTransaction({
          to: recipient_address as `0x${string}`,
          value: parseEther(price)
        })

        console.log('Transaction sent:', sendHash, sendError);

        if (sendError) {
          dispatch(showToast({
            message: `Failed to send ETH. ${sendError.message}`,
            severity: 'error'
          }));
          return;
        }

        // 发送提醒交易的消息
        dispatch(showToast({
          message: 'Transaction sent!',
          severity: 'info'
        }));
      } catch (error) {
        console.error('Failed to send ETH:', error);
        setCurrentPaymentId(null);
        dispatch(showToast({
          message: `Failed to send ETH.`,
          severity: 'error'
        }));
      }
      return;
    }

    
    try {
      // 使用当前收藏集的合约地址
      writeContract({
        address: fee.feeToken as `0x${string}`,
        abi: abi,
        functionName: 'transfer',
        args: [
          recipient_address as `0x${string}`,
          parseUnits(price ? price : fee.feeAmount.toString(), fee.feeDecimals)
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

      // 发送提醒交易的消息
      dispatch(showToast({
        message: 'Transaction sent!',
        severity: 'info'
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
    const fee = currentCollection?.fee;

    if (!fee
      || !fee.treasury 
      || !fee.feeAmount
      || !fee.feeSymbol
      || !fee.feeDecimals
      || !fee.feeToken
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
    const fee = currentCollection?.fee;

    if (!fee || !fee.feeSymbol || !fee.feeAmount) return null;

    const feeSymbol = fee?.feeSymbol || 'MISATO';
    const price = fee?.feeAmount || 0;
    const formattedPrice = formatPrice(price);
    const recipient_address = fee?.treasury;
    const network = currentCollection?.chain;
    const payment_address = fee?.feeToken;

    let hasConfirmed = false;
    if (payment_address === '0x0000000000000000000000000000000000000000') {
      hasConfirmed = isSendConfirmed && (sendHash !== undefined && sendHash !== null);
    } else {
      hasConfirmed = isConfirmed && (hash !== undefined && hash !== null);
    }

    if (hasConfirmed) {
      // 已有成功交易的确认框
      return (
        <CommonDialog
          open={showConfirmDialog}
          onClose={() => setShowConfirmDialog(false)}
          title="Payment Already Sent"
          actions={
            <>
              <ActionButton 
                variant="secondary" 
                onClick={() => setShowConfirmDialog(false)}
              >
                Cancel
              </ActionButton>
              <ActionButton 
                variant="primary" 
                onClick={confirmPayment}
              >
                Yes, Pay Again
              </ActionButton>
            </>
          }
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Typography sx={{ fontSize: 14, fontWeight: 400, lineHeight: '140%', color: '#fff' }}>
              You have already made a payment for this request.
            </Typography>
            <Typography sx={{ fontSize: 14, fontWeight: 400, lineHeight: '140%', color: '#666' }}>
              Previous transaction hash: {hash}
            </Typography>
            <Typography sx={{ fontSize: 14, fontWeight: 400, lineHeight: '140%', color: '#2C0CB9' }}>
              Do you still want to make another payment?
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <Typography sx={{ fontSize: 14, fontWeight: 400, lineHeight: '140%', color: '#999' }}>
                Amount: {formattedPrice} ${feeSymbol}
              </Typography>
              <Typography sx={{ fontSize: 14, fontWeight: 400, lineHeight: '140%', color: '#999' }}>
                Recipient: {recipient_address}
              </Typography>
              <Typography sx={{ fontSize: 14, fontWeight: 400, lineHeight: '140%', color: '#999' }}>
                Chain: {network}
              </Typography>
            </Box>
          </Box>
        </CommonDialog>
      );
    }

    // 首次支付的确认框
    return (
      <CommonDialog
        open={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        title={`Send $${feeSymbol}`}
        actions={
          <>
            <ActionButton 
              variant="secondary" 
              onClick={() => setShowConfirmDialog(false)}
            >
              Cancel
            </ActionButton>
            <ActionButton 
              variant="primary" 
              onClick={confirmPayment}
            >
              Confirm
            </ActionButton>
          </>
        }
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Typography sx={{ fontSize: 14, fontWeight: 400, lineHeight: '140%', color: '#fff' }}>
            Are you sure to pay {formattedPrice} ${feeSymbol}?
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <Typography sx={{ fontSize: 14, fontWeight: 400, lineHeight: '140%', color: '#999' }}>
              Recipient: {recipient_address}
            </Typography>
            <Typography sx={{ fontSize: 14, fontWeight: 400, lineHeight: '140%', color: '#999' }}>
              Chain: {network}
            </Typography>
          </Box>
        </Box>
      </CommonDialog>
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

  // 修改 checkPayment 函数
  const checkPayment = () => {
    // 打印所有相关状态
    console.log('isConfirmed:', isConfirmed, 'hash:', hash,
      'isPending:', isPending,
      'isConfirming:', isConfirming,
      'error:', error
    );
    console.log('isSendConfirmed:', isSendConfirmed, 'sendHash:', sendHash,
      'isSendPending:', isSendPending,
      'isSendConfirming:', isSendConfirming,
      'sendError:', sendError
    ); 
    const fee = currentCollection?.fee;
    const payment_address = fee?.feeToken;
    
    if (payment_address === '0x0000000000000000000000000000000000000000') {
      if (!sendHash) {
        dispatch(showToast({
          message: 'Transaction not found.',
          severity: 'warning'
        }));
        return;
      }

      if (isSendConfirming) {
        dispatch(showToast({
          message: 'Transaction is being confirmed...',
          severity: 'info'
        }));
        return;
      }

      if (isSendConfirmed && sendHash) {
        setShowConfirmedDialog(true);
        return;
      }

      if (sendError) {
        dispatch(showToast({
          message: `Failed to send ETH`,
          severity: 'error'
        }));
        return;
      }
      return;
    }

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

    if (isConfirmed && hash) {
      setShowConfirmedDialog(true);
      return;
    }

    if (error) {
      dispatch(showToast({
        message: `Failed to send ETH`,
        severity: 'error'
      }));
    }
  };

  // 添加复制 hash 的处理函数
  const handleCopyHash = async () => {
    const hashToCopy = hash || sendHash;
    if (!hashToCopy) return;

    try {
      await navigator.clipboard.writeText(hashToCopy);
      dispatch(showToast({
        message: 'Hash copied to clipboard',
        severity: 'success'
      }));
    } catch (err) {
      dispatch(showToast({
        message: 'Failed to copy hash',
        severity: 'error'
      }));
    }
  };

  // 监听错误状态
  useEffect(() => {
    if (error) {
      // 设置交易失败状态
      setIsTransactionFailed(true);
      // 显示错误弹窗
      dispatch(showToast({
        message: `Transaction failed: ${error.message}`,
        severity: 'error'
      }));
    }
  }, [error]);

  // 监听错误状态
  useEffect(() => {
    if (sendError) {
      // 设置交易失败状态
      setIsTransactionFailed(true);
      // 显示错误弹窗
      dispatch(showToast({
        message: `Transaction failed: ${sendError.message}`,
        severity: 'error'
      }));
    }
  }, [sendError]);

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

  // 监听Send交易状态
  useEffect(() => {
    if (isSendConfirmed && sendHash) {
      // 交易确认后添加消息
      dispatch(showToast({
        message: 'Payment confirmed.',
        severity: 'success'
      }));
      setLatestPaymentHash(sendHash);
      dispatch(addMessage({
        id: Date.now(),
        role: 'user',
        content: "Submitted the transaction. I will click 'check payment' and copy hash to you, after the transaction is confirmed.",
        type: 'transaction',
      }));
    }
  }, [sendHash, isSendConfirmed]);

  // 根据状态获取要显示的消息
  const messages: Message[] = (() => {
    if (shouldShowConnect) {
      return [{
        ...walletMessage,
        actions: [{
          // @ts-ignore
          ...walletMessage.actions[0],
          label: authenticated ? 'RECONNECT' : 'CONNECT',
          onClick: authenticated ? () => linkWallet() : () => login()
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
            agentId,
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
            sendHash,
            error,
            currentCollection || null
          )
        );
    }
  })();

  const [isExpanded, setIsExpanded] = useState(true);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const handleSend = async () => {
    // 只保留消息内容的检查
    if (!message.trim()) return;
    
    try {
      // 清空输入框
      setMessage('');
      // 发送消息，让逻辑层处理等待
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
    const isInputEnabled = !shouldShowConnect && !isRequesting && processingState === 'idle';
    if (isInputEnabled) {
      // 使用 MUI 的 inputRef
      const input = inputRef.current as unknown as HTMLInputElement;
      input?.focus();
    }
  }, [shouldShowConnect, isRequesting, processingState]);

  // 判断输入框是否应该禁用
  const isInputDisabled = shouldShowConnect || 
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
                messageId={msg.id}
                key={msg.id}
                isUser={msg.isUser}
                content={msg.content}
                avatar={msg.avatar}
                actions={msg.actions}
                show_status={msg.show_status}
                urls={msg.urls}
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

      {/* 渲染确认对话框 */}
      {renderDialogContent()}

      {/* 添加交易确认对话框 */}
      <TransactionConfirmedDialog
        open={showConfirmedDialog}
        onClose={() => setShowConfirmedDialog(false)}
        hash={hash || sendHash || ''}
        onCopy={handleCopyHash}
      />
    </WindowContainer>
  );
}