import { Box, styled } from '@mui/material';
import terminalBg from '../../assets/terminal_bg.png';
import { useTypewriter } from '../../hooks/useTypewriter';
import { useState, useEffect } from 'react';

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

interface TerminalLine {
  id: string;
  text: string;
}

export default function TerminalView() {
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);

  const terminalLines = [
    { id: 'line-1', text: '1 Initializing system...' },
    { id: 'line-2', text: '2 Loading modules...' },
    { id: 'line-3', text: '3 Connected to network' },
    { id: 'line-4', text: '4 Ready for input' },
    { id: 'line-5', text: '5 Ready for input' },
    { id: 'line-6', text: '6 Ready for input' },
    { id: 'line-7', text: '7 Ready for input' },
    { id: 'line-8', text: '8 Ready for input' },
    { id: 'line-9', text: '9 Ready for input' },
    { id: 'line-10', text: '10 Ready for input' },
    { id: 'line-11', text: '11 Ready for input' },
    { id: 'line-12', text: '12 Ready for input' },
    { id: 'line-13', text: '13 Ready for input' },
    { id: 'line-14', text: '14 Ready for input' },
    { id: 'line-15', text: '15 Ready for input' },
    { id: 'line-16', text: '16 Ready for input' },
    { id: 'line-17', text: '17 Ready for input' },
    { id: 'line-18', text: '18 Ready for input' },
    { id: 'line-19', text: '19 Ready for input' },
    { id: 'line-20', text: '20 Ready for input' },
    { id: 'line-21', text: '21 Ready for input' },
    { id: 'line-22', text: '22 Ready for input' },
    { id: 'line-23', text: '23 Ready for input' },
    { id: 'line-24', text: '24 Ready for input' },
    { id: 'line-25', text: '25 Ready for input' },
    { id: 'line-26', text: '26 Ready for input' },
    { id: 'line-27', text: '27 Ready for input' },
    { id: 'line-28', text: '28 Ready for input' },
    { id: 'line-29', text: '29 Ready for input' },
    { id: 'line-30', text: '30 Ready for input' },
    { id: 'line-31', text: '31 Ready for input' },
    { id: 'line-32', text: '32 Ready for input' },
    { id: 'line-33', text: '33 Ready for input' },
    { id: 'line-34', text: '34 Ready for input' },
    { id: 'line-35', text: '35 Ready for input' },
    { id: 'line-36', text: '36 Ready for input' },
    { id: 'line-37', text: '37 Ready for input' },
    { id: 'line-38', text: '38 Ready for input' },
    { id: 'line-39', text: '39 Ready for input' },
    { id: 'line-40', text: '40 Ready for input' },
    { id: 'line-41', text: '41 Ready for input' },
    { id: 'line-42', text: '42 Ready for input' },
    { id: 'line-43', text: '43 Ready for input' },
    { id: 'line-44', text: '44 Ready for input' },
    { id: 'line-45', text: '45 Ready for input' },
    { id: 'line-46', text: '46 Ready for input' },
    { id: 'line-47', text: '47 Ready for input' },
    { id: 'line-48', text: '48 Ready for input' },
    { id: 'line-49', text: '49 Ready for input' },
  ];

  //@ts-ignore
  const { displayText, isTyping } = useTypewriter({
    text: currentLineIndex < terminalLines.length ? terminalLines[currentLineIndex].text : '',
    speed: 30,
    onComplete: () => {
      if (currentLineIndex < terminalLines.length) {
        setLines(prev => [...prev, {
          id: `${terminalLines[currentLineIndex].id}-${Date.now()}`,
          text: terminalLines[currentLineIndex].text
        }]);
        setCurrentLineIndex(prev => prev + 1);
      }
    }
  });

  useEffect(() => {
    const element = document.getElementById('terminal-output');
    if (element) {
      element.scrollTop = element.scrollHeight;
    }
  }, [lines, displayText]);

  return (
    <TerminalContainer>
      <BackgroundImage src={terminalBg} alt="" />
      <TerminalOutput id="terminal-output">
        {lines.map(line => (
          <div key={line.id}>{line.text}<br /></div>
        ))}
        {currentLineIndex < terminalLines.length && (
          <div key={`typing-${currentLineIndex}`}>{displayText}</div>
        )}
      </TerminalOutput>
    </TerminalContainer>
  );
} 