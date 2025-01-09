import { Box, Typography, styled } from '@mui/material';
import emptyIcon from '../../assets/empty.svg';

const Container = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  flex: 1,
  gap: 10,
});

const EmptyIcon = styled('img')({
  width: 80,
  height: 80,
});

const EmptyText = styled(Typography)({
  fontSize: 16,
  fontWeight: 400,
  lineHeight: '100%',
  color: '#FFFFFF',
  opacity: 0.2,
});

interface EmptyStateProps {
  text?: string;
}

export default function EmptyState({ text = 'No data found' }: EmptyStateProps) {
  return (
    <Container>
      <EmptyIcon src={emptyIcon} alt="Empty" />
      <EmptyText>{text}</EmptyText>
    </Container>
  );
} 