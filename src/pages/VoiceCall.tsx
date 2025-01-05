import { Box, Typography, styled } from '@mui/material';

const PageContainer = styled(Box)({
  padding: '40px',
  height: '100%',
});

const Title = styled(Typography)({
  fontSize: '22px',
  fontWeight: 800,
  lineHeight: '100%',
  color: '#FFFFFF',
  marginBottom: '20px',
});

export default function VoiceCall() {
  return (
    <PageContainer>
      <Title>Voice Call</Title>
      <Typography color="white">
        Voice Call feature coming soon...
      </Typography>
    </PageContainer>
  );
} 