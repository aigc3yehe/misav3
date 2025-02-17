import { Box, Button, styled, useTheme, useMediaQuery } from '@mui/material';
import MDRenderer from '../shared/MDRenderer';
import { useRef, useState } from 'react';
import completedIcon from '../../assets/upload_ok.svg';
import uploadIcon from '../../assets/upload.svg';
import uploadingIcon from '../../assets/uploading.svg';
import { AppDispatch } from '../../store';
import { useDispatch } from 'react-redux';
import { uploadImages } from '../../store/slices/imagesSlice';
import { sendMessage } from '../../store/slices/chatSlice';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

const BubbleContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  display: 'flex',
  gap: 9,

  [theme.breakpoints.down('sm')]: {
    gap: 4,
  },
}));

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
})<{ isUser?: boolean }>(({ theme, isUser }) => ({
  padding: '15px 20px',
  backgroundColor: isUser ? '#FAE6B6' : '#E1D4FE',
  borderRadius: isUser ? '17px 17px 4px 17px' : '4px 17px 17px 17px',
  display: 'flex',
  flexDirection: 'column',
  gap: 7,
  maxWidth: '90%',

  [theme.breakpoints.down('sm')]: {
    padding: '10px 12px',
    gap: 4,
    maxWidth: '100%',
  },
}));

const ActionButtons = styled(Box)({
  display: 'flex',
  gap: 10,
});

const ActionButton = styled(Button)<{ actionstyle: string }>(({ actionstyle="primary" }) => ({
  height: 35,
  padding: '0 24px',
  borderRadius: 4,
  backgroundColor: actionstyle === "secondary" ? '#C9ACFF' : '#C7FF8C',
  color: '#000000',
  fontSize: 16,
  fontWeight: 700,
  lineHeight: '24px',
  textTransform: 'none',
  '&:hover': {
    backgroundColor: actionstyle === "secondary" ? '#C9ACFF' : '#C7FF8C',
  },
  '&.Mui-disabled': {
    backgroundColor: actionstyle === "secondary" ? '#C9ACFF' : '#C7FF8C',
    color: '#636071'
  },
  '& .MuiButton-startIcon': {
    margin: 0,
    marginRight: '0px',
  },
}));

const ButtonIcon = styled('img')({
  width: '30px',
  height: '31px',
});

const UrlList = styled(Box)({
  marginTop: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: '0px',
});

const UrlItem = styled(Box)({
  fontSize: '12px',
  color: '#6D2EF5',
  lineHeight: '140%',
  fontWeight: 'normal'
});

interface MessageBubbleProps {
  messageId: string | number;
  isUser?: boolean;
  content: string;
  avatar?: string;
  show_status?: 'send_eth' | 'idle' | 'disconnected' | 'queuing' | 'upload_image';
  urls?: string[];
  actions?: Array<{
    label: string;
    variant: 'primary' | 'secondary';
    onClick: () => void;
    disabled?: boolean;
  }>;
  progress: number;
}

export default function MessageBubble({ 
  messageId,
  isUser, 
  content, 
  avatar, 
  actions,
  show_status,
  urls,
  progress
}: MessageBubbleProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useDispatch<AppDispatch>();
  const [isConfirmed, setIsConfirmed] = useState(false);
  const isUploading = useSelector((state: RootState) => state.images.isUploading);

  const handleUpload = () => {
    fileInputRef.current?.click();
  };

  const handleCompleted = async () => {
    setIsConfirmed(true);
    try {
      await dispatch(sendMessage({ 
        messageText: "I have uploaded it successfully, please help me train"
      })).unwrap();
    } catch (error) {
      console.error('Failed to send completion message:', error);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      try {
        await dispatch(uploadImages({ 
          messageId: messageId, 
          files 
        })).unwrap();
      } catch (error) {
        console.error('Failed to upload images:', error);
      }
    }
  };

  let startIcon = null;
  if (isUploading) {
    startIcon = <ButtonIcon src={uploadingIcon} alt="uploading" />;
  } else if (isConfirmed) {
    startIcon = <ButtonIcon src={completedIcon} alt="completed" />;
  }

  let disabled = false;
  if (isUploading) {
    disabled = true;
  } else if (isConfirmed) {
    disabled = true;
  }
  if (!urls || urls.length === 0) {
    disabled = true;
  }

  return (
    <BubbleContainer sx={{ justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
      {!isUser && !isMobile && (
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
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
            wordWrap: 'break-word',
            overflowWrap: 'break-word'
          }}>
            {content}
          </Box>
        ) : (
          <MDRenderer content={content} />
        )}
        
        {!isUser && show_status === 'upload_image' && (
          <>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              multiple
              accept="image/*"
              onChange={handleFileChange}
            />
            <ActionButtons>
              <ActionButton 
                startIcon={<ButtonIcon src={uploadIcon} alt="upload" />}
                onClick={handleUpload}
                actionstyle="primary">
                UPLOAD
              </ActionButton>
              <ActionButton
                onClick={handleCompleted} 
                disabled={disabled}
                startIcon={startIcon}
                actionstyle="secondary"
                sx={{
                  '& .MuiButton-startIcon': {
                    animation: isUploading ? 'spin 1s linear infinite' : 'none',
                  },
                }}>
                {isUploading 
                  ? `UPLOADING (${progress}%)`
                  : isConfirmed 
                    ? 'COMPLETED' 
                    : 'CONFIRM'}
              </ActionButton>
            </ActionButtons>
            {urls && urls.length > 0 && (
              <UrlList>
                {urls.map((url, index) => (
                  <UrlItem key={url}>
                    {`${index + 1}/${urls.length} ${url}`}
                  </UrlItem>
                ))}
              </UrlList>
            )}
          </>
        )}

        {!isUser && actions && actions.length > 0 && (
          <ActionButtons>
            {actions.map((action, index) => (
              <ActionButton
                key={`action-${index}`}
                onClick={action.onClick}
                disabled={action.disabled}
                actionstyle="primary"
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