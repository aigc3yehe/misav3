import { styled, alpha } from '@mui/material';
import { IconButton } from '@mui/material';
import menuExpanded from '../assets/menu_expanded.svg';
import menuNormal from '../assets/menu_normal.svg';

interface SharedMenuButtonProps {
  expanded: boolean;
  onClick: () => void;
}

const TransitionIconButton = styled(IconButton)<{ $expanded: boolean }>(({ $expanded }) => ({
  position: 'fixed',
  zIndex: 1300,
  color: 'white',
  transition: 'all 0.3s ease-in-out',
  padding: 0,
  width: '30px',
  height: '30px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  ...$expanded ? {
    left: '207px',
    top: '19px',
  } : {
    left: '90px',
    top: '27px',
  },
  '&:hover': {
    backgroundColor: alpha('#fff', 0.08),
  },
}));

const MenuIcon = styled('img')<{ $expanded: boolean }>(({ $expanded }) => ({
  width: $expanded ? '16px' : '18px',
  height: $expanded ? '20px' : '16px',
  transition: 'all 0.3s ease-in-out',
}));

export default function SharedMenuButton({ expanded, onClick }: SharedMenuButtonProps) {
  return (
    <TransitionIconButton
      $expanded={expanded}
      onClick={onClick}
    >
      <MenuIcon 
        $expanded={expanded}
        src={expanded ? menuExpanded : menuNormal}
        alt="menu"
      />
    </TransitionIconButton>
  );
} 