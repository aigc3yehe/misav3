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
  border: '1px solid #ffffff',
  transition: 'all 0.3s ease-in-out',
  ...(isExpanded ? {
    width: '34px',
    height: '34px',
    left: '20px',
    top: '24px',
  } : {
    width: '41px',
    height: '41px',
    left: '44.5px',
    top: '21.5px',
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