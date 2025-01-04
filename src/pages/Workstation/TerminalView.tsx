import { Box, styled } from '@mui/material';
import terminalBg from '../../assets/terminal_bg.png';
import { useTypewriter } from '../../hooks/useTypewriter';
import { useState, useEffect } from 'react';

const TerminalContainer = styled(Box)({
  position: 'relative',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-end',
  alignItems: 'center',
  paddingBottom: '22px',
});

const BackgroundImage = styled('img')({
  position: 'absolute',
  bottom: 0,
  left: '50%',
  transform: 'translateX(-50%)',
  width: '1190px',
  height: '900px',
  objectFit: 'contain',
  pointerEvents: 'none',
});

const TerminalOutput = styled(Box)({
  position: 'relative', // 改为相对定位
  width: 'min(calc(100% - 80px), 1110px)', // 左右各减去40px
  height: '425px',
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