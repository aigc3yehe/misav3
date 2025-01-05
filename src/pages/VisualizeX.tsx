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

export default function VisualizeX() {
  return (
    <PageContainer>
      <Title>Visualize X</Title>
      <Typography color="white">
        Visualize X feature coming soon...
      </Typography>
    </PageContainer>
  );
} 