import { styled, alpha } from '@mui/material';
import { IconButton } from '@mui/material';
import menuExpanded from '../assets/menu_expanded.svg';
import menuNormal from '../assets/menu_normal.svg';

interface SharedMenuButtonProps {
  isExpanded: boolean;
  onClick: () => void;
}

const TransitionIconButton = styled(IconButton, {
  shouldForwardProp: (prop) => prop !== 'isExpanded',
})<{ isExpanded: boolean }>(({ isExpanded }) => ({
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
  ...(isExpanded ? {
    left: '207px',
    top: '19px',
  } : {
    left: '90px',
    top: '27px',
  }),
  '&:hover': {
    backgroundColor: alpha('#fff', 0.08),
  },
}));

const MenuIcon = styled('img')<{ isExpanded: boolean }>(({ isExpanded }) => ({
  width: isExpanded ? '16px' : '18px',
  height: isExpanded ? '20px' : '16px',
  transition: 'all 0.3s ease-in-out',
}));

export default function SharedMenuButton({ isExpanded, onClick }: SharedMenuButtonProps) {
  return (
    <TransitionIconButton
      isExpanded={isExpanded}
      onClick={onClick}
    >
      <MenuIcon 
        isExpanded={isExpanded}
        src={isExpanded ? menuExpanded : menuNormal}
        alt="menu"
      />
    </TransitionIconButton>
  );
} 