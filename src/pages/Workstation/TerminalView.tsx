import { Box, styled } from '@mui/material';
import terminalBg from '../../assets/terminal_bg.png';
import terminalBgNiyoko from '../../assets/terminal_niyoko_bg.png';
import mobileTerminalBg from '../../assets/mobile_terminal_bg.png';
import mobileMisato from '../../assets/mobile_misato.png';
import { useEffect, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTypewriter } from '../../hooks/useTypewriter';
import { RootState } from '../../store';
import Pusher from 'pusher-js';
import { 
  fetchTerminalLogs, 
  addLog, 
  setLiveStatus,
  selectTerminalLogs,
  selectTerminalStatus
} from '../../store/slices/terminalSlice';
import type { AppDispatch } from '../../store';

const ORIGINAL_TERMINAL_HEIGHT = 1800;  // 原始设计高度改为1800
const BASE_GRID_SIZE = 40;  // 基础网格大小相应调整为原来的2倍
const SMALL_GRID_SIZE = 8;  // 小网格大小相应调整为原来的2倍
const BASE_LINE_WIDTH = 1.6;  // 基础线宽相应调整为原来的2倍
const SMALL_LINE_WIDTH = 0.8;  // 小线宽相应调整为原来的2倍

const TerminalContainer = styled(Box)(() => {
  // 动态计算网格尺寸
  const heightRatio = `min(1, ${window.innerHeight}/${ORIGINAL_TERMINAL_HEIGHT})`;
  const calculatedBaseGrid = `calc(${BASE_GRID_SIZE}px * ${heightRatio})`;
  const calculatedSmallGrid = `calc(${SMALL_GRID_SIZE}px * ${heightRatio})`;
  const calculatedBaseLine = `calc(${BASE_LINE_WIDTH}px * ${heightRatio})`;
  const calculatedSmallLine = `calc(${SMALL_LINE_WIDTH}px * ${heightRatio})`;

  return {
    position: 'relative',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: '22px',
    backgroundColor: '#101010',
    backgroundImage: `
      linear-gradient(#111912 ${calculatedBaseLine}, transparent ${calculatedBaseLine}), 
      linear-gradient(90deg, #111912 ${calculatedBaseLine}, transparent ${calculatedBaseLine}), 
      linear-gradient(#111912 ${calculatedSmallLine}, transparent ${calculatedSmallLine}), 
      linear-gradient(90deg, #111912 ${calculatedSmallLine}, #101010 ${calculatedSmallLine})
    `,
    backgroundSize: `${calculatedBaseGrid} ${calculatedBaseGrid}, ${calculatedBaseGrid} ${calculatedBaseGrid}, ${calculatedSmallGrid} ${calculatedSmallGrid}, ${calculatedSmallGrid} ${calculatedSmallGrid}`,
    backgroundPosition: `-${calculatedBaseLine} -${calculatedBaseLine}, -${calculatedBaseLine} -${calculatedBaseLine}, -${calculatedSmallLine} -${calculatedSmallLine}, -${calculatedSmallLine} -${calculatedSmallLine}`,
    opacity: 1,
  };
});

const BackgroundImage = styled('img')(({ theme }) => ({
  position: 'absolute',
  bottom: 0,
  left: '50%',
  transform: 'translateX(-50%)',
  height: '100%',
  width: 'auto',
  objectFit: 'contain',
  pointerEvents: 'none',
  '@media (min-height: 1800px)': {
    width: '2380px',
    height: '1800px',
  },

  [theme.breakpoints.down('sm')]: {
    content: `url(${mobileTerminalBg})`,
    width: 'calc(290 / 390 * 100vw)', // 290px at 390px viewport width
    height: 'auto',
    bottom: 0,
  },
}));

const MobileMisatoImage = styled('img')(({ theme }) => ({
  display: 'none',
  
  [theme.breakpoints.down('sm')]: {
    display: 'block',
    position: 'absolute',
    top: 92,
    left: 0,
    width: '100%',
    height: 'auto',
    objectFit: 'contain',
    pointerEvents: 'none',
    zIndex: 1,
  },
}));

const ORIGINAL_OUTPUT_HEIGHT = 1056;        // 原始输出框高度
const ORIGINAL_OUTPUT_RATIO = 1110/528;    // 原始输出框宽高比

const TerminalOutput = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: `min(calc(100% - 80px), calc(${ORIGINAL_OUTPUT_RATIO} * ${ORIGINAL_OUTPUT_HEIGHT}px * min(1, ${window.innerHeight}/${ORIGINAL_TERMINAL_HEIGHT})))`,
  height: `calc(${ORIGINAL_OUTPUT_HEIGHT}px * min(1, ${window.innerHeight}/${ORIGINAL_TERMINAL_HEIGHT}))`,
  fontFamily: '"Azeret Mono", monospace',
  fontSize: '14px',
  fontWeight: 400,
  lineHeight: '24px',
  color: '#A1FF3C',
  overflowY: 'auto',
  overflowX: 'hidden',
  zIndex: 1,
  whiteSpace: 'pre-wrap',
  wordWrap: 'break-word',
  wordBreak: 'break-all',
  '&::-webkit-scrollbar': {
    width: '4px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'transparent',
  },
  '&::-webkit-scrollbar-thumb': {
    background: 'rgba(161, 255, 60, 0.3)',
    borderRadius: '2px',
  },
  '&::-webkit-scrollbar-thumb:hover': {
    background: 'rgba(161, 255, 60, 0.5)',
  },

  [theme.breakpoints.down('sm')]: {
    width: 'calc(100% - 40px)',
    margin: '0 20px 20px 20px',
    aspectRatio: '350/518',
    height: 'auto',
    fontSize: '12px',
    lineHeight: '24px',
  },
}));

// Pusher 配置
const PUSHER_CONFIG = {
  APP_KEY: 'ae89f44addd84df6b762',
  CLUSTER: 'ap1',
  EVENT: 'aigc'
} as const;

export default function TerminalView() {
  const dispatch = useDispatch<AppDispatch>();
  const logs = useSelector(selectTerminalLogs);
  const { isLoading, error } = useSelector(selectTerminalStatus);

  const currentAgent = useSelector((state: RootState) => state.agent.currentAgent);
  const isNiyoko = currentAgent?.id === 'niyoko';
  const terminalBgImage = isNiyoko ? terminalBgNiyoko : terminalBg;
  
  // 根据当前 agent 确定 channel
  const currentChannel = isNiyoko ? 'niyoko' : 'misato';

  // 添加打字机效果相关状态
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  
  // 使用打字机 hook
  // @ts-ignore
  const { displayText, isTyping } = useTypewriter({
    text: terminalLines[currentLineIndex] || '',
    speed: 20,
    onComplete: () => {
      if (currentLineIndex < terminalLines.length - 1) {
        setCurrentLineIndex(prev => prev + 1);
      }
    }
  });

  // 当日志更新时更新终端行
  useEffect(() => {
    if (logs.length > 0) {
      setTerminalLines(logs.map(log => log.text));
      if (currentLineIndex >= logs.length) {
        setCurrentLineIndex(logs.length - 1);
      }
    }
  }, [logs]);

  // 处理 Pusher 状态变化
  const handleStateChange = useCallback((states: { current: string }) => {
    console.debug('[PUSHER] state change', states);
    dispatch(setLiveStatus(states?.current === 'connected'));
  }, [dispatch]);

  // 初始化 Pusher 和获取历史日志
  useEffect(() => {
    // 获取历史日志
    dispatch(fetchTerminalLogs({
      channel: currentChannel,
      event: PUSHER_CONFIG.EVENT
    }));

    // 初始化 Pusher
    const pusher = new Pusher(PUSHER_CONFIG.APP_KEY, {
      cluster: PUSHER_CONFIG.CLUSTER
    });

    // 绑定状态变化
    pusher.connection.bind('state_change', handleStateChange);

    // 订阅频道和事件
    const channel = pusher.subscribe(currentChannel);
    channel.bind(PUSHER_CONFIG.EVENT, (data: string) => {
      dispatch(addLog(data));
    });

    // 清理函数
    return () => {
      pusher.connection.unbind('state_change', handleStateChange);
      channel.unbind(PUSHER_CONFIG.EVENT);
      pusher.unsubscribe(currentChannel);
      pusher.disconnect();
    };
  }, [dispatch, handleStateChange, currentChannel]);

  // 自动滚动到底部
  useEffect(() => {
    const element = document.getElementById('terminal-output');
    if (element) {
      element.scrollTop = element.scrollHeight;
    }
  }, [logs]);

  return (
    <TerminalContainer>
      <BackgroundImage src={terminalBgImage} alt="" />
      <MobileMisatoImage src={mobileMisato} alt="" />
      <TerminalOutput id="terminal-output">
        {isLoading ? (
          <div>Loading logs...</div>
        ) : error ? (
          <div style={{ color: '#FF4444' }}>{error}</div>
        ) : (
          <>
            {/* 显示已完成的行 */}
            {terminalLines.slice(0, currentLineIndex).map((line, index) => (
              <div key={`complete-${index}`}>
                {line}
                <br />
              </div>
            ))}
            {/* 显示当前正在打字的行 */}
            {currentLineIndex < terminalLines.length && (
              <div key={`typing-${currentLineIndex}`}>
                {displayText}
              </div>
            )}
          </>
        )}
      </TerminalOutput>
    </TerminalContainer>
  );
} 