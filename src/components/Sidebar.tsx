import { 
  Drawer, 
  styled, 
  Typography, 
  IconButton, 
  List,
  ListItemButton,
  Divider,
  Box,
  Menu,
  MenuItem,
  Link,
  Avatar,
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { keyframes } from '@mui/system';
import livingroomNormal from '../assets/livingroom_normal.svg';
import livingroomSelected from '../assets/livingroom_selected.svg';
import modelsNormal from '../assets/models_normal.svg';
import editIcon from '../assets/edit.svg';
import modelsSelected from '../assets/models_selected.svg';
import galleryNormal from '../assets/gallery_normal.svg';
import gallerySelected from '../assets/gallery_selected.svg';
import arrowDropDown from '../assets/arrow_drop_down.svg';
import xIcon from '../assets/x.svg';
import docsIcon from '../assets/docs.svg';
import discardIcon from '../assets/discard.svg';
import logoIcon from '../assets/logo.svg';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { setCurrentAgent } from '../store/slices/agentSlice';
import callNormal from '../assets/call_normal.svg';
import callSelected from '../assets/call_selected.svg';
//import visualizeXNormal from '../assets/visualize_x_normal.svg';
//import visualizeXSelected from '../assets/visualize_x_selected.svg';
import dockIcon from '../assets/dock.svg';
import walletIcon from '../assets/wallet.svg';
import okIcon from '../assets/ok.svg';
import pointingCursor from '../assets/pointer.png';
import { showToast } from '../store/slices/toastSlice';
import menuExpanded from '../assets/menu_expanded.svg';
import { alpha } from '@mui/material/styles';

const SIDEBAR_WIDTH = 250;

// 定义展开动画
const expandAnimation = keyframes`
  from {
    transform: translateX(-50%) scaleX(1) scaleY(1);
    opacity: 0;
    transform-origin: left start;
  }
  to {
    transform: translateX(0) scaleX(1) scaleY(1);
    opacity: 1;
    transform-origin: left start;
  }
`;

// 定义收起动画
const collapseAnimation = keyframes`
  from {
    transform: translateX(0) scaleX(1) scaleY(1);
    opacity: 1;
    transform-origin: left start;
  }
  to {
    transform: translateX(-50%) scaleX(1) scaleY(1);
    opacity: 0;
    transform-origin: left start;
  }
`;

interface StyledDrawerProps {
  isOpen: boolean;
}

interface ChatHistoryProps {
  id: string;
  label: string;
}

const StyledDrawer = styled(Drawer, {
  shouldForwardProp: (prop) => prop !== 'isOpen',
})<StyledDrawerProps>(({ theme, isOpen }) => ({
  width: SIDEBAR_WIDTH,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: SIDEBAR_WIDTH,
    boxSizing: 'border-box',
    backgroundColor: '#2B1261',
    border: 'none',
    overflow: 'hidden',
    animation: isOpen 
      ? `${expandAnimation} 0.3s ease-out forwards`
      : `${collapseAnimation} 0.3s ease-in forwards`,
    zIndex: theme.zIndex.drawer + 2,
    '--Paper-overlay': 'none !important',
  },
  // 移动端显示背景遮罩
  [theme.breakpoints.down('sm')]: {
    '& .MuiBackdrop-root': {
      display: 'block',
      zIndex: theme.zIndex.drawer + 1,
    },
    '& .MuiDrawer-paper': {
      '--Paper-overlay': 'none !important',
      '--Paper-shadow': 'none !important',
    },
  },
}));

const ProfileSection = styled(Box)(({ theme }) => ({
  padding: '24px 20px',
  display: 'flex',
  flexDirection: 'column',
  
  [theme.breakpoints.down('sm')]: {
    padding: '16px',
  },
}));

const ProfileHeader = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
});

const ProfileInfo = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
});

const NameSection = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '0px',
  marginTop: '0px',
});

const IconsSection = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  marginTop: '0px',
  marginLeft: '-2px',
});

const ActionIcon = styled('img')({
  width: '24px',
  height: '24px',
  cursor: `url(${pointingCursor}), pointer`,
});

const StyledListItemButton = styled(ListItemButton)<{ selected?: boolean }>(() => ({
  width: '210px',
  height: '44px',
  margin: '0 20px',
  padding: '10px 6px',
  gap: '8px',
  borderRadius: '4px',
  '&.MuiListItemButton-root': {
    backgroundColor: 'transparent',
  },
  '&.MuiListItemButton-root.Mui-selected': {
    backgroundColor: '#C7FF8C',
    '& .MuiTypography-root': {
      color: '#000000',
      fontWeight: 700,
    },
    '& .MuiSvgIcon-root': {
      color: '#000000',
    },
    '&:hover': {
      backgroundColor: '#C7FF8C',
    },
  },
  '&:hover': {
    backgroundColor: '#4E318D',
    '& .chat-more-button': {
      opacity: 1,
    },
  },
}));

const ChatListItem = styled(Box)({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  width: '100%',
  '& .chat-more-button': {
    position: 'absolute',
    right: '0px',
    opacity: 0,
    transition: 'opacity 0.2s',
  },
});

const NavText = styled(Typography)({
  fontSize: '14px',
  fontWeight: 500,
  lineHeight: '100%',
});

const GroupTitle = styled(Typography)({
  padding: '16px 20px 8px',
  color: '#D6C0FF',
  fontSize: '14px',
  fontWeight: 500,
  lineHeight: '100%',
});

const StyledList = styled(List)({
  '& .MuiListItemButton-root': {
    marginBottom: '8px',
  },
});

const SocialBar = styled(Box)({
  width: 210,
  height: 40,
  margin: '30px 20px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: 'transparent',
});

const SocialIconsWrapper = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  marginTop: '5px',
});

const SocialIconLink = styled(Link)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '30px',
  height: '30px',
  borderRadius: '50%',
  color: 'white',
  transition: 'background-color 0.2s',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  '& img': {
    width: '20px',
    height: '20px',
  }
});

const NavIcon = styled('img')({
  width: '24px',
  height: '24px',
});

const EditIcon = styled('img')({
  width: '24px',
  height: '24px',
});

const IconImage = styled('img')({
  display: 'block',
});

const ArrowIcon = styled(IconImage)({
  width: '14px',
  height: '10px',
});

const SocialIcon = styled(IconImage)({
  width: '20px',
  height: '20px',
});

const LogoImage = styled('img')({
  width: '87px',
  height: '32px',
  marginBottom: '10px',
});

const ContentWrapper = styled(Box)({
  position: 'relative',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
});

const ScrollableSection = styled(Box)({
  flex: 1,
  overflowY: 'auto',
  // 自定义滚动条样式
  '&::-webkit-scrollbar': {
    width: '4px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'transparent',
  },
  '&::-webkit-scrollbar-thumb': {
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '2px',
  },
  '&::-webkit-scrollbar-thumb:hover': {
    background: 'rgba(255, 255, 255, 0.2)',
  },
});

// 添加 AgentMenu 样式组件
const StyledAgentMenu = styled(Menu)(() => ({
  '& .MuiPaper-root': {
    backgroundColor: 'rgba(21, 15, 32, 0.95)',
    borderRadius: 4,
  },
}));

const AgentMenuItem = styled(MenuItem)({
  padding: '5px 20px',
  whiteSpace: 'nowrap',
  '&:hover': {
    backgroundColor: '#4E318D',
  },
});

const AgentItemContent = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '5px',
});

const AgentAvatar = styled(Box)({
  width: 24,
  height: 24,
  borderRadius: '50%',
  border: '1px solid #FFFFFF',
  overflow: 'hidden',
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
});

const AgentName = styled(Typography)({
  color: '#FFFFFF',
  fontSize: '14px',
  fontWeight: 400,
  lineHeight: '100%',
});

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  isMobile: boolean;
}

export default function Sidebar({ open, onClose, isMobile }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const currentAgent = useSelector((state: RootState) => state.agent.currentAgent);
  const dispatch = useDispatch();
  const [agentMenuAnchor, setAgentMenuAnchor] = useState<null | HTMLElement>(null);
  // @ts-ignore
  const [chatHistory, setChatHistory] = useState<ChatHistoryProps[]>([]);

  const showShared = currentAgent?.id === 'misato';

  /* const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }; */

  const handleCopyWalletAddress = () => {
    navigator.clipboard.writeText(currentAgent?.wallet_address || '');
    dispatch(showToast({
      message: `${currentAgent?.name}'s wallet copied`,
      severity: 'success',
    }));
  };

  const handleCopyContractAddress = () => {
    navigator.clipboard.writeText(currentAgent?.address || '');
    dispatch(showToast({
      message: `$${currentAgent?.name} CA copied`,
      severity: 'success',
    }));
  };

  // 根据当前agent决定显示哪些导航项
  const getNavigationItems = () => {
    const baseItems = [
      { 
        path: '/workstation', 
        label: 'Workstation', 
        icon: {
          normal: livingroomNormal,
          selected: livingroomSelected
        }
      }
    ];

    if (currentAgent?.id === 'misato') {
      // misato 特定的导航项
      baseItems.push(
        { 
          path: '/collections', 
          label: 'Collections', 
          icon: {
            normal: modelsNormal,
            selected: modelsSelected
          }
        },
        {
          path: '/voice_call',
          label: 'Voice Call',
          icon: {
            normal: callNormal,
            selected: callSelected
          }
        },
        /* {
          path: '/visualize_x',
          label: 'Visualize X',
          icon: {
            normal: visualizeXNormal,
            selected: visualizeXSelected
          }
        } */
      );
    } else {
      // 其他 agent 的导航项
      baseItems.push(
        { 
          path: '/models', 
          label: 'Models', 
          icon: {
            normal: modelsNormal,
            selected: modelsSelected
          }
        },
        { 
          path: '/gallery', 
          label: 'Gallery', 
          icon: {
            normal: galleryNormal,
            selected: gallerySelected
          }
        }
      );
    }

    return baseItems;
  };

  // 根据当前agent决定显示哪些My Space项
  const getMySpaceItems = () => {
    if (currentAgent?.id === 'misato') {
      return [
        {
          path: '/my-nfts',
          label: 'My NFTs',
          icon: {
            normal: galleryNormal,
            selected: gallerySelected
          }
        }
      ];
    }
    
    return [
      {
        path: '/my-models',
        label: 'My Models',
        icon: {
          normal: modelsNormal,
          selected: modelsSelected
        }
      },
      {
        path: '/my-nfts',
        label: 'My NFTs',
        icon: {
          normal: galleryNormal,
          selected: gallerySelected
        }
      }
    ];
  };

  // 更新 navigationItems 的使用
  const navigationItems = getNavigationItems();
  const mySpaceItems = getMySpaceItems();

  const handleEditClick = (event: React.MouseEvent<HTMLElement>, chatId: string) => {
    event.stopPropagation();
    setSelectedChat(chatId);
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedChat(null);
  };

  const handleDeleteChat = () => {
    // 处理删除聊天的逻辑
    console.log('Delete chat:', selectedChat);
    handleMenuClose();
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      onClose(); // 在移动端导航后关闭侧边栏
    }
  };

  const renderNavItems = (items: typeof navigationItems) => {
    return items.map((item) => {
      const isSelected = location.pathname === item.path;
      return (
        <StyledListItemButton
          key={item.path}
          selected={isSelected}
          onClick={() => handleNavigation(item.path)}
        >
          <NavIcon 
            src={isSelected ? item.icon.selected : item.icon.normal} 
            alt={item.label}
          />
          <NavText>{item.label}</NavText>
        </StyledListItemButton>
      );
    });
  };

  // 添加可用的 agents 列表
  const availableAgents = [
    {
      id: 'misato',
      name: 'MISATO',
      avatar: '/misato.jpg',
      address: '0x98f4779FcCb177A6D856dd1DfD78cd15B7cd2af5',
      wallet_address: '0x900709432a8F2C7E65f90aA7CD35D0afe4eB7169',
    },
    /* {
      id: 'niyoko',
      name: 'NiyoKo',
      avatar: '/misato.jpg',
      address: '0x1234567890abcdef1234567890abcdef12345678',
    }, */
    // 可以添加更多 agent
  ];
  // @ts-ignore
  const handleAgentMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAgentMenuAnchor(event.currentTarget);
  };

  const handleAgentMenuClose = () => {
    setAgentMenuAnchor(null);
  };

  const handleAgentChange = (agent: typeof availableAgents[0]) => {
    dispatch(setCurrentAgent(agent));
    handleAgentMenuClose();
    navigate('/workstation');
  };

  return (
    <StyledDrawer
      variant={isMobile ? "temporary" : "persistent"}
      anchor="left"
      open={open}
      onClose={onClose}
      isOpen={open}
    >
      <ContentWrapper>
        <ProfileSection>
          <ProfileHeader>
            <ProfileInfo>
              {isMobile ? (
                <Avatar
                  src={currentAgent?.avatar}
                  sx={{
                    width: 40,
                    height: 40,
                    border: '1px solid #ffffff',
                  }}
                />
              ) : (
                <Box sx={{ width: 40, height: 40 }} />
              )}
              <Box sx={{ gap: '0px' }}>
                <NameSection>
                  <Typography 
                    variant="subtitle1" 
                    sx={{ 
                      fontWeight: 700,
                      fontSize: '16px',
                      lineHeight: '100%',
                    }}
                  >
                    ${currentAgent?.name}
                  </Typography>
                  <IconButton 
                    size="small" 
                    sx={{ padding: 1, width: 28, height: 28, display: 'none' }}
                  >
                    <ArrowIcon src={arrowDropDown} alt="expand" />
                  </IconButton>
                </NameSection>
                <IconsSection>
                  <ActionIcon src={walletIcon} alt="wallet" onClick={handleCopyWalletAddress}/>
                  <ActionIcon src={dockIcon} alt="dock" onClick={handleCopyContractAddress}/>
                </IconsSection>
              </Box>
            </ProfileInfo>
            {isMobile && (
              <IconButton
                onClick={onClose}
                sx={{
                  padding: 0,
                  width: 27,
                  height: 24,
                  marginTop: '-16px',
                  '&:hover': {
                    backgroundColor: alpha('#fff', 0.08),
                  },
                }}
              >
                <img 
                  src={menuExpanded}
                  alt="close menu"
                  style={{
                    width: '16px',
                    height: '20px',
                  }}
                />
              </IconButton>
            )}
          </ProfileHeader>
        </ProfileSection>

        {/* Agent 切换菜单 */}
        <StyledAgentMenu
          anchorEl={agentMenuAnchor}
          open={Boolean(agentMenuAnchor)}
          onClose={handleAgentMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
        >
          {availableAgents.map((agent) => (
            <AgentMenuItem 
              key={agent.id}
              onClick={() => handleAgentChange(agent)}
            >
              <AgentItemContent>
                <AgentAvatar>
                  <img src={agent.avatar} alt={agent.name} />
                </AgentAvatar>
                <AgentName>{agent.name}</AgentName>
                {agent.id === currentAgent?.id && (
                  <img src={okIcon} alt="selected" width={24} height={24} />
                )}
              </AgentItemContent>
            </AgentMenuItem>
          ))}
        </StyledAgentMenu>

        <ScrollableSection>
          <StyledList>
            {renderNavItems(navigationItems)}
          </StyledList>

          <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)', margin: '0 20px' }} />

          <GroupTitle>My Space</GroupTitle>
          <StyledList>
            {renderNavItems(mySpaceItems)}
          </StyledList>

          <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)', margin: '0 20px' }} />

          {/* 最近聊天记录 */}
          {chatHistory.length > 0 && (
            <>
              <GroupTitle>Recent Chat</GroupTitle>
              <StyledList>
            {chatHistory.map((chat) => (
              <StyledListItemButton key={chat.id}>
                <ChatListItem>
                  <NavIcon src={livingroomNormal} alt="chat" />
                  <NavText>{chat.label}</NavText>
                  <IconButton
                    className="chat-more-button"
                    size="small"
                    onClick={(e) => handleEditClick(e, chat.id)}
                  >
                    <NavIcon src={editIcon} alt="edit" />
                  </IconButton>
                </ChatListItem>
              </StyledListItemButton>
                ))}
              </StyledList>
            </>
          )}
        </ScrollableSection>

        <SocialBar>
          <LogoImage src={logoIcon} alt="Mavae Studio" />
          {showShared && (
          <SocialIconsWrapper>
            <SocialIconLink
              href="https://x.com/Misato_virtuals"
              target="_blank"
              rel="noopener noreferrer"
              underline="none"
            >
              <SocialIcon src={xIcon} alt="Twitter" />
            </SocialIconLink>
            <SocialIconLink
              href="https://discord.gg/yourinvite"
              target="_blank"
              rel="noopener noreferrer"
              underline="none"
              sx={{ display: 'none' }}
            >
              <SocialIcon src={discardIcon} alt="Discard" />
            </SocialIconLink>
            <SocialIconLink
              href="/docs"
              underline="none"
              sx={{ display: 'none' }}
            >
              <SocialIcon src={docsIcon} alt="Docs" />
            </SocialIconLink>
            </SocialIconsWrapper>
          )}
        </SocialBar>
      </ContentWrapper>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            backgroundColor: '#2B1261',
            color: 'white',
            '& .MuiMenuItem-root:hover': {
              backgroundColor: '#4E318D',
            },
          },
        }}
      >
        <MenuItem onClick={handleDeleteChat}>
          <EditIcon src={editIcon} alt="edit" />
          Delete Chat
        </MenuItem>
      </Menu>
    </StyledDrawer>
  );
} 