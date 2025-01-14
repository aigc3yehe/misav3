import { AppBar, Button, Toolbar, styled, alpha, Box, IconButton } from '@mui/material';
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { showToast } from '../store/slices/toastSlice';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Avatar from '@mui/material/Avatar';
import logoutIcon from '../assets/logout.svg';
import pointingCursor from '../assets/pointer.png';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { usePrivy } from '@privy-io/react-auth';
import { useWalletManager } from '../hooks/useWalletManager';
import { updatePrivyAccount } from '../store/slices/walletSlice';
import { useAccount } from 'wagmi';
import { AppDispatch } from '../store';
import { checkTokenBalance } from '../store/slices/walletSlice';
import mobileJoinIcon from '../assets/mobile_join_us.svg';
import mobileLivingroomNormal from '../assets/mobile_livingroom_normal.svg';
import mobileLivingroomSelected from '../assets/mobile_livingroom_selected.svg';
import mobileTerminalNormal from '../assets/mobile_terminal_normal.svg';
import mobileTerminalSelected from '../assets/mobile_terminal_selected.svg';
import menuNormal from '../assets/menu_normal.svg';
import CommonDialog, { ActionButton } from './CommonDialog';

const StyledAppBar = styled(AppBar)(() => ({
  background: 'transparent',
}));

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  gap: '20px',
  minHeight: 'auto',
  padding: '22px 40px',
  
  [theme.breakpoints.down('sm')]: {
    padding: '20px 20px 0px 20px',
    gap: 'auto',
    height: '52px',
    minHeight: '52px',
  },
}));

const GradientBorderButton = styled(Button)(({ theme }) => ({
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

  [theme.breakpoints.down('sm')]: {
    width: '140px',
    height: '36px',
    fontSize: '14px',
    lineHeight: '20px',
  },
}));

const ConnectButton = styled(Button)(({ theme }) => ({
  width: '117px',
  height: '40px',
  borderRadius: '4px',
  fontFamily: 'Tektur, sans-serif',
  fontWeight: 700,
  fontSize: '16px',
  lineHeight: '24px',
  textTransform: 'uppercase',
  padding: '0',

  [theme.breakpoints.down('sm')]: {
    width: 'auto',
    height: '24px',
    padding: '6px 12px',
    fontSize: '14px',
    lineHeight: '18px',
  },
}));

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

// 左侧容器
const LeftSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  
  [theme.breakpoints.down('sm')]: {
    gap: '5px',
  },
}));

// 右侧容器
const RightSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: '1rem',
  
  [theme.breakpoints.down('sm')]: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
}));

// 添加新的样式组件
// @ts-ignore
const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme, mode }: { mode: string }) => ({
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
  
  [theme.breakpoints.down('sm')]: {
    position: 'relative',
    left: '0',
    marginLeft: '36px',
    width: '93px',
    height: '24px',
    '& .button-text': {
      display: 'none',
    },
    '& .button-icon': {
      display: 'block',
    },
  },
}));

const StyledToggleButton = styled(ToggleButton)(({ theme }) => ({
  width: '87px',
  height: '40px',
  padding: '8px 16px',
  fontFamily: 'Tektur, sans-serif',
  fontSize: '16px',
  fontWeight: 700,
  lineHeight: '24px',
  color: '#FFFFFF',
  
  '& .button-icon': {
    display: 'none',
  },

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

  [theme.breakpoints.down('sm')]: {
    width: '46.5px',
    height: '24px',
    padding: '1px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',

    '&:first-of-type, &:last-of-type': {
      width: '46.5px',
    },

    '& .button-icon': {
      display: 'block',
      width: '22px',
      height: '22px',
    },
  },
}));

const JoinButton = styled(Box)(({ theme }) => ({
  // 桌面端样式 (>900px)
  [theme.breakpoints.up('sm')]: {
    '& .desktop-button': {
      display: 'block',
    },
    '& .mobile-button': {
      display: 'none',
    },
  },
  
  // 中等移动端样式 (460px-900px)
  '@media (min-width: 460px) and (max-width: 900px)': {
    '& .desktop-button': {
      display: 'none',
    },
    '& .mobile-button': {
      display: 'flex',
      width: '32px', // 更大的图标尺寸
      height: '32px',
      cursor: 'pointer',
      '& img': {
        width: '100%',
        height: '100%',
      },
    },
  },
  
  // 小屏移动端样式 (<460px)
  '@media (max-width: 459px)': {
    '& .desktop-button': {
      display: 'none',
    },
    '& .mobile-button': {
      display: 'flex',
      width: '24px', // 基于390px设计稿的尺寸
      height: '24px',
      cursor: 'pointer',
      '& img': {
        width: '100%',
        height: '100%',
      },
    },
  },
}));

interface NavbarProps {
  onSidebarOpen: () => void;
  sidebarOpen: boolean;
  isMobile: boolean;
  avatar: string;
}

function formatAddress(address: string | undefined) {
  return address ? address.slice(0, 6) + '...' + address.slice(-4) : '';
}

// @ts-ignore
export default function Navbar({ onSidebarOpen, sidebarOpen, isMobile, avatar }: NavbarProps) {
  const { login, logout, authenticated, user, linkWallet } = usePrivy();
  const { address, isConnected } = useAccount();
  const { wallets } = useWalletManager();
  const dispatch = useDispatch<AppDispatch>();

  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isWorkstation = location.pathname === '/workstation';
  const mode = searchParams.get('mode') || 'chat';

  // 从 wallets 中找到当前钱包的图标
  const currentWallet = wallets.find(w => w.address === address);

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
      await logout();
      setIsLogoutDialogOpen(false);
      dispatch(showToast({
        message: 'Logout successfully',
        severity: 'success'
      }));
    } catch (error) {
      console.error('Logout failed:', error);
      dispatch(showToast({
        message: 'Logout failed',
        severity: 'error'
      }));
    }
  };

  const handleSwitchWallet = async () => {
    try {
      if (authenticated && user) {
        linkWallet();
      } else {
        login();
      }
    } catch (error) {
      console.error('Switch wallet failed:', error);
      dispatch(showToast({
        message: 'Failed to switch wallet',
        severity: 'error'
      }));
    }
  };

  // 当钱包状态改变时更新 Redux store
  useEffect(() => {
    if (isConnected && address) {
      const currentWallet = wallets.find(w => w.address === address);
      dispatch(updatePrivyAccount({
        address,
        isConnected: true,
        status: 'connected',
        walletInfo: {
          name: currentWallet?.type || '',
          icon: currentWallet?.icon || '/assets/avatar.png'
        }
      }));

      // 检查代币余额
      dispatch(checkTokenBalance(address));
    }
  }, [isConnected, address, wallets, dispatch]);

  // 修改渲染逻辑
  const shouldShowConnect = !authenticated || !isConnected;
  const walletIcon = currentWallet?.icon || '/assets/avatar.png';

  return (
    <>
      <StyledAppBar position="fixed">
        <StyledToolbar>
          <LeftSection>
            {isMobile && (
              <>
                <Avatar
                  src={avatar}
                  sx={{
                    width: 32,
                    height: 32,
                    border: '1px solid #ffffff',
                  }}
                />
                <IconButton
                  onClick={onSidebarOpen}
                  sx={{
                    padding: 0,
                    width: 27,
                    height: 24,
                    '&:hover': {
                      backgroundColor: alpha('#fff', 0.08),
                    },
                  }}
                >
                  <img 
                    src={menuNormal}
                    alt="menu"
                    style={{
                      width: '18px',
                      height: '16px',
                    }}
                  />
                </IconButton>
              </>
            )}
            {isWorkstation && (
              <StyledToggleButtonGroup
                value={mode}
                exclusive
                onChange={handleModeChange}
                mode={mode}
              >
                <StyledToggleButton value="chat">
                  <span className="button-text">CHAT</span>
                  <img 
                    className="button-icon"
                    src={mode === 'chat' ? mobileLivingroomSelected : mobileLivingroomNormal}
                    alt="Chat"
                  />
                </StyledToggleButton>
                <StyledToggleButton value="terminal">
                  <span className="button-text">TERMINAL</span>
                  <img 
                    className="button-icon"
                    src={mode === 'terminal' ? mobileTerminalSelected : mobileTerminalNormal}
                    alt="Terminal"
                  />
                </StyledToggleButton>
              </StyledToggleButtonGroup>
            )}
          </LeftSection>

          <RightSection>
            <JoinButton sx={{ display: 'none' }}>
              <GradientBorderButton className="desktop-button">
                JOIN THE STUDIO!
              </GradientBorderButton>
              <Box 
                className="mobile-button"
                component="button"
                sx={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <img src={mobileJoinIcon} alt="Join the studio" />
              </Box>
            </JoinButton>
            {shouldShowConnect ? (
              <ConnectButton
                onClick={handleSwitchWallet}
                sx={{
                  backgroundColor: '#C7FF8C',
                  color: '#000000',
                  '&:hover': {
                    backgroundColor: alpha('#C7FF8C', 0.8),
                  },
                }}
              >
                {authenticated ? 'RECONNECT' : 'CONNECT'}
              </ConnectButton>
            ) : (
              <>
                <Avatar
                  src={walletIcon}
                  sx={{
                    width: { xs: 32, sm: 40 },
                    height: { xs: 32, sm: 40 },
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
                  <MenuItem>
                    <MenuItemContent>
                      <Avatar 
                          src={walletIcon} 
                          sx={{ width: 20, height: 20 }} 
                      />
                      <span className="address-text">
                        {formatAddress(address)} 
                      </span>
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
        </StyledToolbar>
      </StyledAppBar>

      {/* 退出确认弹窗 */}
      <CommonDialog
        open={isLogoutDialogOpen}
        onClose={() => setIsLogoutDialogOpen(false)}
        title="LOGOUT"
        children={
          <div>
            Are you sure to logout?
          </div>
        }
        actions={
          <>
            <ActionButton 
              variant="secondary" 
              onClick={() => setIsLogoutDialogOpen(false)}
            >
              Cancel
            </ActionButton>
            <ActionButton 
              variant="primary" 
              onClick={handleLogout}
            >
              Confirm
            </ActionButton>
          </>
        }
      >
        {/* 如果需要添加额外的内容，可以在这里添加 */}
      </CommonDialog>
    </>
  );
} 