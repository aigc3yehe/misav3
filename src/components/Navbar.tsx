import { AppBar, Button, Toolbar, styled, alpha, Dialog, DialogTitle, DialogActions, Box } from '@mui/material';
import { useAppKit } from '@reown/appkit/react'
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useWallet } from '../hooks/useWallet';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { showToast } from '../store/slices/toastSlice';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Avatar from '@mui/material/Avatar';
import xIcon from '../assets/x.svg';
import logoutIcon from '../assets/logout.svg';
import avatarImage from '../assets/avatar.png';
import pointingCursor from '../assets/pointer.png';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

const StyledAppBar = styled(AppBar)(() => ({
  background: 'transparent',
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

// 添加新的样式组件
const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ mode }: { mode: string }) => ({
  position: 'absolute',
  left: '290px',
  width: '214px',
  height: '40px',
  '& .MuiToggleButtonGroup-grouped': {
    transition: 'all 0.3s ease',
    border: `1px solid ${mode === 'chat' ? '#C9ACFF' : '#A1FF3C'}`,
    borderWidth: '1px',
    '&:not(:first-of-type)': {
      marginLeft: '0',
    },
  },
}));

const StyledToggleButton = styled(ToggleButton)({
  width: '87px',
  height: '40px',
  padding: '8px 16px',
  fontFamily: 'Tektur, sans-serif',
  fontSize: '16px',
  fontWeight: 700,
  lineHeight: '24px',
  color: '#FFFFFF',
  transition: 'all 0.3s ease',
  
  '&:hover': {
    backgroundColor: 'rgba(201, 172, 255, 0.08)',
  },

  '&:first-of-type': {
    width: '87px',
    '&.Mui-selected': {
      backgroundColor: '#C9ACFF',
      color: '#000000',
      '&:hover': {
        backgroundColor: '#C9ACFF',
      },
    },
  },

  '&:last-of-type': {
    width: '127px',
    '&.Mui-selected': {
      backgroundColor: '#A1FF3C',
      color: '#000000',
      '&:hover': {
        backgroundColor: '#A1FF3C',
      },
    },
    '&:hover:not(.Mui-selected)': {
      backgroundColor: 'rgba(161, 255, 60, 0.08)',
    },
  },
});

interface NavbarProps {
  onSidebarOpen: () => void;
  sidebarOpen: boolean;
}

export default function Navbar({ sidebarOpen }: NavbarProps) {
  const { open } = useAppKit();
  const { handleDisconnect, formatAddress } = useWallet();
  const dispatch = useDispatch();

  const {
    address,
    isConnected,
    walletInfo
  } = useSelector((state: RootState) => state.wallet);

  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isWorkstation = location.pathname === '/app/workstation';
  const mode = searchParams.get('mode') || 'chat';

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleModeChange = (
    event: React.MouseEvent<HTMLElement>,
    newMode: string,
  ) => {
    if (newMode !== null) {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set('mode', newMode);
      navigate(`${location.pathname}?${newSearchParams.toString()}`);
    } else {
      console.log('newMode is null', event);
    }
  };

  const handleLogout = async () => {
    try {
      await handleDisconnect();
      setIsLogoutDialogOpen(false);
      dispatch(showToast({
        message: 'Logout successfully',
        type: 'success'
      }));
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <StyledAppBar position="fixed">
      <StyledToolbar>
        <LeftSection>
          {!sidebarOpen && (
            <Box sx={{ width: 40, height: 40 }} />
          )}
          {isWorkstation && (
            <StyledToggleButtonGroup
              value={mode}
              exclusive
              onChange={handleModeChange}
              mode={mode}
            >
              <StyledToggleButton value="chat">
                CHAT
              </StyledToggleButton>
              <StyledToggleButton value="terminal">
                TERMINAL
              </StyledToggleButton>
            </StyledToggleButtonGroup>
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
                src={walletInfo.icon || avatarImage}
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
                    <Avatar src={walletInfo.icon || avatarImage} sx={{ width: 20, height: 20 }} />
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
              onClick={handleLogout}
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