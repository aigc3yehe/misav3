import { Box, Typography, styled } from '@mui/material';
import { useState } from 'react';
import ChatInput from './ChatInput';
import msgDown from '../assets/msg_down.svg';
import msgUp from '../assets/msg_up.svg';

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

export default function ChatWindow({ agentName }: ChatWindowProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [message, setMessage] = useState('');

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const handleSend = () => {
    if (!message.trim()) return;
    console.log('发送消息:', message);
    setMessage('');
  };

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
            {/* 消息列表内容 */}
          </MessageList>
          <InputContainer>
            <ChatInput
              value={message}
              onChange={setMessage}
              onSend={handleSend}
            />
          </InputContainer>
        </>
      )}
    </WindowContainer>
  );
}