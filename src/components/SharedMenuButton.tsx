import { styled } from '@mui/material';
import { IconButton } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';

interface SharedMenuButtonProps {
  expanded: boolean;
  onClick: () => void;
}

const TransitionIconButton = styled(IconButton)<{ $expanded: boolean }>(({ $expanded }) => ({
  position: 'fixed',
  zIndex: 1300,
  color: 'white',
  transition: 'all 0.3s ease-in-out',
  ...$expanded ? {
    left: '220px', // 侧边栏展开时的位置
    top: '46px',
  } : {
    left: '92px', // 侧边栏收起时的位置
    top: '32px',
  }
}));

export default function SharedMenuButton({ expanded, onClick }: SharedMenuButtonProps) {
  return (
    <TransitionIconButton
      $expanded={expanded}
      onClick={onClick}
    >
      <MoreVertIcon />
    </TransitionIconButton>
  );
} 