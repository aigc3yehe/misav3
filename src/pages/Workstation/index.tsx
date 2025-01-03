import { Box } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import ChatView from './ChatView';
import TerminalView from './TerminalView';

export default function Workstation() {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'chat';

  return (
    <Box sx={{ 
      backgroundColor: '#101010',
      backgroundImage: `
        linear-gradient(#111912 0.8px, transparent 0.8px), 
        linear-gradient(90deg, #111912 0.8px, transparent 0.8px), 
        linear-gradient(#111912 0.4px, transparent 0.4px), 
        linear-gradient(90deg, #111912 0.4px, #101010 0.4px)
      `,
      backgroundSize: '20px 20px, 20px 20px, 4px 4px, 4px 4px',
      backgroundPosition: '-0.8px -0.8px, -0.8px -0.8px, -0.4px -0.4px, -0.4px -0.4px',
      opacity: 1,
      height: '100%'
    }}>
      <Box sx={{ display: mode === 'chat' ? 'block' : 'none', height: '100%' }}>
        <ChatView />
      </Box>
      <Box sx={{ display: mode === 'terminal' ? 'block' : 'none', height: '100%' }}>
        <TerminalView />
      </Box>
    </Box>
  );
} 