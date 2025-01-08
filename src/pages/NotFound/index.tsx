import { Box, Button, Typography, styled } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import pointingCursor from '../../assets/pointer.png';

const Container = styled(Box)({
  width: '100%',
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#000000',
});

const Title = styled(Typography)({
  color: '#FFFFFF',
  fontSize: '120px',
  fontWeight: 700,
  lineHeight: '120%',
  marginBottom: '24px',
});

const Subtitle = styled(Typography)({
  color: '#FFFFFF',
  fontSize: '24px',
  fontWeight: 500,
  lineHeight: '120%',
  marginBottom: '48px',
});

const HomeButton = styled(Button)({
  padding: '12px 32px',
  borderRadius: '30px',
  backgroundColor: '#22116E',
  color: '#FFFFFF',
  fontSize: '16px',
  fontWeight: 500,
  textTransform: 'none',
  cursor: `url(${pointingCursor}), pointer`,
  '&:hover': {
    backgroundColor: '#2C0CB9',
  },
});

export default function NotFound() {
  const navigate = useNavigate();

  const handleBackHome = () => {
    navigate('/workstation');
  };

  return (
    <Container>
      <Title>404</Title>
      <Subtitle>Page Not Found</Subtitle>
      <HomeButton onClick={handleBackHome}>
        Back to Home
      </HomeButton>
    </Container>
  );
} 