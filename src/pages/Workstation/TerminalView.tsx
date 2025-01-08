import { Box, styled } from '@mui/material';
import terminalBg from '../../assets/terminal_bg.png';
import { useEffect, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTypewriter } from '../../hooks/useTypewriter';
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

const BackgroundImage = styled('img')({
  position: 'absolute',
  bottom: 0,
  left: '50%',
  transform: 'translateX(-50%)',
  height: '100%',  // 设置为容器的100%高度
  width: 'auto',   // 宽度自动计算
  objectFit: 'contain',
  pointerEvents: 'none',
  '@media (min-height: 1800px)': {
    width: '2380px',    // 在超过原始设计高度时使用原始宽度
    height: '1800px',   // 在超过原始设计高度时使用原始高度
  }
});

const ORIGINAL_OUTPUT_HEIGHT = 1056;        // 原始输出框高度
const ORIGINAL_OUTPUT_RATIO = 1110/528;    // 原始输出框宽高比

const TerminalOutput = styled(Box)({
  position: 'relative',
  width: `min(calc(100% - 80px), calc(${ORIGINAL_OUTPUT_RATIO} * ${ORIGINAL_OUTPUT_HEIGHT}px * min(1, ${window.innerHeight}/${ORIGINAL_TERMINAL_HEIGHT})))`,
  height: `calc(${ORIGINAL_OUTPUT_HEIGHT}px * min(1, ${window.innerHeight}/${ORIGINAL_TERMINAL_HEIGHT}))`,
  fontFamily: '"Azeret Mono", monospace',
  fontSize: '14px',
  fontWeight: 400,
  lineHeight: '20px',
  color: '#A1FF3C',
  overflowY: 'auto',
  zIndex: 1,
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
});

// Pusher 配置
const PUSHER_CONFIG = {
  APP_KEY: 'ae89f44addd84df6b762',
  CLUSTER: 'ap1',
  CHANNEL: 'misato',
  EVENT: 'aigc'
} as const;

export default function TerminalView() {
  const dispatch = useDispatch<AppDispatch>();
  const logs = useSelector(selectTerminalLogs);
  const { isLoading, error } = useSelector(selectTerminalStatus);

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
      channel: PUSHER_CONFIG.CHANNEL,
      event: PUSHER_CONFIG.EVENT
    }));

    // 初始化 Pusher
    const pusher = new Pusher(PUSHER_CONFIG.APP_KEY, {
      cluster: PUSHER_CONFIG.CLUSTER
    });

    // 绑定状态变化
    pusher.connection.bind('state_change', handleStateChange);

    // 订阅频道和事件
    const channel = pusher.subscribe(PUSHER_CONFIG.CHANNEL);
    channel.bind(PUSHER_CONFIG.EVENT, (data: string) => {
      dispatch(addLog(data));
    });

    // 清理函数
    return () => {
      pusher.connection.unbind('state_change', handleStateChange);
      channel.unbind(PUSHER_CONFIG.EVENT);
      pusher.unsubscribe(PUSHER_CONFIG.CHANNEL);
      pusher.disconnect();
    };
  }, [dispatch, handleStateChange]);

  // 自动滚动到底部
  useEffect(() => {
    const element = document.getElementById('terminal-output');
    if (element) {
      element.scrollTop = element.scrollHeight;
    }
  }, [logs]);

  return (
    <TerminalContainer>
      <BackgroundImage src={terminalBg} alt="" />
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