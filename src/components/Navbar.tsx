import { AppBar, Button, Toolbar, styled, alpha, Dialog, DialogTitle, DialogActions, Box } from '@mui/material';
import { useAppKit } from '@reown/appkit/react'
import { useAccount, useDisconnect } from 'wagmi';
import { useState } from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Avatar from '@mui/material/Avatar';
import xIcon from '../assets/x.svg';
import logoutIcon from '../assets/logout.svg';
import avatarImage from '../assets/avatar.png';
import pointingCursor from '../assets/pointer.png';

const StyledAppBar = styled(AppBar)(() => ({
  background: 'transparent',
  backdropFilter: 'blur(8px)',
}));

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  gap: '20px',
  minHeight: 'auto',
  padding: '22px 40px',
  [theme.breakpoints.up('sm')]: {
    padding: '22px 40px',
  },
}));

const GradientBorderButton = styled(Button)({
  position: 'relative',
  width: '190px',
  height: '40px',
  padding: '0',
  border: 'none',
  borderRadius: '4px',
  background: 'transparent',
  fontFamily: 'Tektur, sans-serif',
  fontWeight: 700,
  fontSize: '16px',
  lineHeight: '24px',
  
  // 文字渐变效果
  backgroundImage: 'linear-gradient(90deg, #C7FF8C 0%, #E8C4EA 43%, #39EDFF 100%)',
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  color: 'transparent',
  
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: 0,
    borderRadius: '4px',
    padding: '1px',
    background: 'linear-gradient(90deg, #C7FF8C 0%, #E8C4EA 43%, #39EDFF 100%)',
    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
    WebkitMaskComposite: 'xor',
    maskComposite: 'exclude',
  },

  '&:hover': {
    background: 'linear-gradient(90deg, #C7FF8C 0%, #E8C4EA 43%, #39EDFF 100%)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    color: 'transparent',
    '&::before': {
      opacity: 0.8,
    },
  },
});

const ConnectButton = styled(Button)({
  width: '117px',
  height: '40px',
  borderRadius: '4px',
  fontFamily: 'Tektur, sans-serif',
  fontWeight: 700,
  fontSize: '16px',
  lineHeight: '24px',
  textTransform: 'uppercase',
  padding: '0',
});

const StyledMenu = styled(Menu)(() => ({
  '& .MuiPaper-root': {
    backgroundColor: 'rgba(21, 15, 32, 0.95)',
    width: 'auto',
    borderRadius: 4,
  },
  '& .MuiMenuItem-root': {
    height: 34,
    '&:hover': {
      backgroundColor: '#4E318D',
    },
  },
}));

const MenuItemContent = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  width: '100%',
  padding: '8px 6px',
  '& img': {
    width: 20,
    height: 20,
  },
  '& .logout-icon': {
    width: 24,
    height: 24,
  },
  '& .address-text': {
    fontFamily: 'Inter, sans-serif',
    fontSize: 14,
    fontWeight: 400,
    lineHeight: '140%',
    color: '#ffffff',
  },
});

// 自定义确认弹窗样式
const StyledDialog = styled(Dialog)(() => ({
  '& .MuiDialog-paper': {
    backgroundColor: '#2B1261',
    borderRadius: '4px',
    padding: '20px',
    minWidth: '300px',
  },
  '& .MuiDialogTitle-root': {
    fontFamily: 'Tektur, sans-serif',
    textAlign: 'center',
    color: '#ffffff',
  },
  '& .MuiDialogActions-root': {
    justifyContent: 'center',
    padding: '20px 0 0',
    gap: '16px',
  },
}));

const DialogButton = styled(Button)({
  width: '117px',
  height: '40px',
  borderRadius: '4px',
  fontFamily: 'Tektur, sans-serif',
  fontWeight: 700,
  fontSize: '16px',
  lineHeight: '24px',
});

// 左侧容器
const LeftSection = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
});

// 右侧容器
const RightSection = styled(Box)({
  display: 'flex',
  gap: '1rem',
});

interface NavbarProps {
  onSidebarOpen: () => void;
  sidebarOpen: boolean;
}

export default function Navbar({ sidebarOpen }: NavbarProps) {
  const { open } = useAppKit();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);

  const handleDisconnect = () => {
    disconnect();
    setIsLogoutDialogOpen(false);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <StyledAppBar position="fixed">
      <StyledToolbar>
        <LeftSection>
          {!sidebarOpen && (
            <Box sx={{ width: 40, height: 40 }} />
          )}
        </LeftSection>

        <RightSection>
          <GradientBorderButton>
            JOIN THE STUDIO!
          </GradientBorderButton>
          {!isConnected ? (
            <ConnectButton
              onClick={() => open()}
              sx={{
                backgroundColor: '#C7FF8C',
                color: '#000000',
                '&:hover': {
                  backgroundColor: alpha('#C7FF8C', 0.8),
                },
              }}
            >
              CONNECT
            </ConnectButton>
          ) : (
            <>
              <Avatar
                src={avatarImage}
                sx={{
                  width: 40,
                  height: 40,
                  cursor: `url(${pointingCursor}), pointer`,
                }}
                onClick={handleClick}
              />
              <StyledMenu
                anchorEl={anchorEl}
                open={openMenu}
                onClose={handleClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                style={{
                  marginTop: '10px',
                }}
              >
                <MenuItem disableRipple sx={{ cursor: 'default' }}>
                  <MenuItemContent>
                    <Avatar src={avatarImage} sx={{ width: 20, height: 20 }} />
                    <span className="address-text">{formatAddress(address || '')}</span>
                  </MenuItemContent>
                </MenuItem>
                <MenuItem onClick={handleClose}>
                  <MenuItemContent>
                    <img src={xIcon} alt="Twitter" />
                    <span className="address-text">Link Twitter</span>
                  </MenuItemContent>
                </MenuItem>
                <MenuItem onClick={() => {
                  handleClose();
                  setIsLogoutDialogOpen(true);
                }}>
                  <MenuItemContent>
                    <img src={logoutIcon} alt="Logout" className="logout-icon" />
                    <span className="address-text">Logout</span>
                  </MenuItemContent>
                </MenuItem>
              </StyledMenu>
            </>
          )}
        </RightSection>

        {/* 退出确认弹窗 */}
        <StyledDialog
          open={isLogoutDialogOpen}
          onClose={() => setIsLogoutDialogOpen(false)}
        >
          <DialogTitle>是否退出钱包？</DialogTitle>
          <DialogActions>
            <DialogButton
              onClick={() => setIsLogoutDialogOpen(false)}
              sx={{
                backgroundColor: 'transparent',
                border: '1px solid #C7FF8C',
                color: '#C7FF8C',
                '&:hover': {
                  backgroundColor: alpha('#C7FF8C', 0.1),
                },
              }}
            >
              取消
            </DialogButton>
            <DialogButton
              onClick={handleDisconnect}
              sx={{
                backgroundColor: '#C7FF8C',
                color: '#000000',
                '&:hover': {
                  backgroundColor: alpha('#C7FF8C', 0.8),
                },
              }}
            >
              确认
            </DialogButton>
          </DialogActions>
        </StyledDialog>
      </StyledToolbar>
    </StyledAppBar>
  );
} 