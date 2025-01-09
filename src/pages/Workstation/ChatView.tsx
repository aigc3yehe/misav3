import { Box, styled } from '@mui/material';
import ChatWindow from '../../components/ChatWindow';
import UnityGame from '../../components/UnityGame';

const ViewContainer = styled(Box)({
  position: 'relative',
  width: '100%',
  height: '100%',
  overflow: 'hidden'
});

// Unity 界面占位
const UnityContainer = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  overflow: 'hidden',
  zIndex: 3,
  pointerEvents: 'auto'
});

const ChatWindowWrapper = styled(Box)({
  position: 'absolute',
  bottom: 0,
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 4,
  overflow: 'hidden'
});

export default function ChatView() {
  return (
    <ViewContainer>
      <UnityContainer>
        <UnityGame />
      </UnityContainer>
      <ChatWindowWrapper>
        <ChatWindow agentName="Misato" />
      </ChatWindowWrapper>
    </ViewContainer>
  );
} 