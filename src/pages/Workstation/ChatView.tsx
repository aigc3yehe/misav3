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

const BackgroundImage = styled('img')({
  position: 'absolute',
  bottom: 24,
  left: '50%',
  transform: 'translateX(-50%)',
  height: '90%',  // 设置为容器的100%高度
  width: 'auto',   // 宽度自动计算
  objectFit: 'contain',
  pointerEvents: 'none',
  '@media (min-height: 1800px)': {
    width: '642px',    // 在超过原始设计高度时使用原始宽度
    height: '1712px',   // 在超过原始设计高度时使用原始高度
  },
  zIndex: 3,
});

export default function ChatView() {
  return (
    <ViewContainer>
      <UnityContainer>
        <UnityGame />
      </UnityContainer>
      {/* <BackgroundImage src="/mock/Niyoko.png" alt="" /> */}
      <ChatWindowWrapper>
        <ChatWindow agentName="Misato" />
      </ChatWindowWrapper>
    </ViewContainer>
  );
} 