import { Box, styled } from '@mui/material';
import UnityVoiceCall from '../components/UnityVoiceCall';

const PageContainer = styled(Box)({
  width: '100%',
  height: '100%',
  position: 'relative',
  overflow: 'hidden',
});

export default function VoiceCall() {
  return (
    <PageContainer>
      <UnityVoiceCall />
    </PageContainer>
  );
} 