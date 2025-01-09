import { styled } from '@mui/material';
import { Avatar } from '@mui/material';

interface SharedAvatarProps {
  expanded: boolean;
  src: string;
}

const TransitionAvatar = styled(Avatar, {
  shouldForwardProp: (prop) => prop !== 'isExpanded',
})<{ isExpanded: boolean }>(({ isExpanded }) => ({
  position: 'fixed',
  zIndex: 1300,
  width: '40px',
  height: '40px',
  border: '1px solid #ffffff',
  transition: 'all 0.3s ease-in-out',
  ...(isExpanded ? {
    left: '20px',
    top: '24px',
  } : {
    left: '44px',
    top: '22px',
  })
}));

export default function SharedAvatar({ expanded, src }: SharedAvatarProps) {
  return (
    <TransitionAvatar
      isExpanded={expanded}
      src={src}
    />
  );
} 