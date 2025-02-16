import { Box, styled } from '@mui/material';
import ChatWindow from '../../components/ChatWindow';
import UnityGame from '../../components/UnityGame';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

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

const ChatWindowWrapper = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: 0,
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 4,
  overflow: 'hidden',

  [theme.breakpoints.down('sm')]: {
    left: 0,
    right: 0,
    transform: 'none',
    width: '100%',
  },
}));

const NiyokoContainer = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  overflow: 'hidden',
  zIndex: 3,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});

const NiyokoBg = styled('img')({
  position: 'absolute',
  width: '100%',
  height: '100%',
  objectFit: 'cover',
});

const Niyoko = styled('img')({
  height: '95%',
  width: 'auto',
  objectFit: 'contain',
  position: 'relative',
  zIndex: 1,
});

export default function ChatView() {
  const currentAgent = useSelector((state: RootState) => state.agent.currentAgent);
  const isNiyoko = currentAgent?.id === 'niyoko';

  return (
    <ViewContainer>
      {isNiyoko ? (
        <NiyokoContainer>
          <NiyokoBg src="/bg.jpg" alt="background" />
          <Niyoko src="/niyoko.png" alt="Niyoko" />
        </NiyokoContainer>
      ) : (
        <UnityContainer>
          <UnityGame />
        </UnityContainer>
      )}
      <ChatWindowWrapper>
        <ChatWindow agentName={currentAgent?.name || 'MISATO'} />
      </ChatWindowWrapper>
    </ViewContainer>
  );
} 