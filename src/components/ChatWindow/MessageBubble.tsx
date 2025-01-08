import { Box, Button, styled } from '@mui/material';
import MDRenderer from '../shared/MDRenderer';

const BubbleContainer = styled(Box)({
  width: '100%',
  display: 'flex',
  gap: 9,
});

const AgentAvatar = styled(Box)({
  width: 34,
  height: 34,
  borderRadius: '50%',
  border: '1px solid #FFFFFF',
  overflow: 'hidden',
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  }
});

const MessageContent = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isUser'
})<{ isUser?: boolean }>(({ isUser }) => ({
  padding: '15px 20px',
  backgroundColor: isUser ? '#FAE6B6' : '#E1D4FE',
  borderRadius: isUser ? '17px 17px 4px 17px' : '4px 17px 17px 17px',
  display: 'flex',
  flexDirection: 'column',
  gap: 7,
  maxWidth: '80%',
}));

const ActionButtons = styled(Box)({
  display: 'flex',
  gap: 10,
});

const ActionButton = styled(Button)<{ variant?: 'primary' | 'secondary' }>(({ variant = 'primary' }) => ({
  height: 35,
  padding: '0 24px',
  borderRadius: 4,
  backgroundColor: variant === 'primary' ? '#C7FF8C' : '#C9ACFF',
  color: '#000000',
  fontSize: 16,
  fontWeight: 700,
  lineHeight: '24px',
  textTransform: 'none',
  '&:hover': {
    backgroundColor: variant === 'primary' ? '#B7EF7C' : '#B99CEF',
  }
}));

interface MessageBubbleProps {
  isUser?: boolean;
  content: string;
  avatar?: string;
  actions?: Array<{
    label: string;
    variant: 'primary' | 'secondary';
    onClick: () => void;
    disabled?: boolean;
  }>;
}

export default function MessageBubble({ 
  isUser, 
  content, 
  avatar, 
  actions 
}: MessageBubbleProps) {
  return (
    <BubbleContainer sx={{ justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
      {!isUser && (
        <AgentAvatar>
          <img src={avatar || '/misato.jpg'} alt="Agent" />
        </AgentAvatar>
      )}
      <MessageContent isUser={isUser}>
        {isUser ? (
          <Box sx={{ 
            color: '#22116E',
            fontSize: 14,
            lineHeight: '140%',
            whiteSpace: 'pre-wrap'
          }}>
            {content}
          </Box>
        ) : (
          <MDRenderer content={content} />
        )}
        {!isUser && actions && actions.length > 0 && (
          <ActionButtons>
            {actions.map((action, index) => (
              <ActionButton
                key={`action-${index}`}
                onClick={action.onClick}
                disabled={action.disabled}
              >
                {action.label}
              </ActionButton>
            ))}
          </ActionButtons>
        )}
      </MessageContent>
    </BubbleContainer>
  );
} 