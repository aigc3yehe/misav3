import { Box, Typography } from '@mui/material';
import { useState } from 'react';
import ChatInput from '../../components/ChatInput';

export default function ChatView() {
  const [message, setMessage] = useState('');
  
  const handleSend = () => {
    if (!message) return;
    console.log('发送消息:', message);
    setMessage('');
  };

  return (
    <Box sx={{ 
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '20px'
    }}>
      <Typography variant="h4">Chat</Typography>
      
      <ChatInput
        value={message}
        onChange={setMessage}
        onSend={handleSend}
        // disabled={false} // 可以根据需要设置禁用状态
      />
      <ChatInput
        value={message}
        onChange={setMessage}
        onSend={handleSend}
        disabled={true} // 可以根据需要设置禁用状态
      />
    </Box>
  );
} 