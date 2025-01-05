import { Box } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import ChatView from './ChatView';
import TerminalView from './TerminalView';

export default function Workstation() {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'chat';

  return (
    <Box sx={{ height: '100%' }}>
      <Box sx={{ display: mode === 'chat' ? 'block' : 'none', height: '100%' }}>
        <ChatView />
      </Box>
      <Box sx={{ display: mode === 'terminal' ? 'block' : 'none', height: '100%' }}>
        <TerminalView />
      </Box>
    </Box>
  );
} 