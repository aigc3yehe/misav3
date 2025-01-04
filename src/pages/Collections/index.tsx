import { Box, Typography, styled } from '@mui/material';

const PageContainer = styled(Box)({
  padding: '24px',
  height: '100%',
  backgroundColor: '#1A0B3C',
});

const Title = styled(Typography)({
  fontSize: '24px',
  fontWeight: 700,
  color: '#FFFFFF',
  marginBottom: '24px',
});

export default function Collections() {
  return (
    <PageContainer>
      <Title>Collections</Title>
      {/* 在这里添加collections内容 */}
    </PageContainer>
  );
} 