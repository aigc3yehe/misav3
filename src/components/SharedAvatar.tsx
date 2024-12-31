import { styled } from '@mui/material';
import { Avatar } from '@mui/material';

interface SharedAvatarProps {
  expanded: boolean;
  src: string;
}

const TransitionAvatar = styled(Avatar)<{ $expanded: boolean }>(({ $expanded }) => ({
  position: 'fixed',
  zIndex: 1300,
  border: '1px solid #ffffff',
  transition: 'all 0.3s ease-in-out',
  ...$expanded ? {
    width: '34px',
    height: '34px',
    left: '20px',
    top: '24px',
  } : {
    width: '40px',
    height: '40px',
    left: '40px',
    top: '22px',
  }
}));

export default function SharedAvatar({ expanded, src }: SharedAvatarProps) {
  return (
    <TransitionAvatar
      $expanded={expanded}
      src={src}
    />
  );
} 