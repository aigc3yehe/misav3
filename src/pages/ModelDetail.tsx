import { Box, styled, IconButton, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import backIcon from '../assets/back.svg';

const PageContainer = styled(Box)({
  padding: '0 40px',
  height: '100%',
  overflow: 'auto',
});

const Header = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '30px 0',
});

const BackButton = styled(IconButton)({
  padding: 0,
  width: '32px',
  height: '32px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
});

const BackIcon = styled('img')({
  width: '12px',
  height: '24px',
});

const Title = styled(Typography)({
  fontSize: '22px',
  fontWeight: 800,
  lineHeight: '100%',
  color: '#FFFFFF',
});

export default function ModelDetail() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1); // 返回上一页
  };

  return (
    <PageContainer>
      <Header>
        <BackButton onClick={handleBack}>
          <BackIcon src={backIcon} alt="Back" />
        </BackButton>
        <Title>Model Detail</Title>
      </Header>
      
      {/* 其他详情内容将在这里添加 */}
    </PageContainer>
  );
} 