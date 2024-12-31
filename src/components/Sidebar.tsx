import { 
  Drawer, 
  styled, 
  Avatar, 
  Typography, 
  IconButton, 
  List, 
  ListItemText,
  ListItemButton,
  Divider,
  Box,
  Menu,
  MenuItem,
  Link,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import HomeIcon from '@mui/icons-material/Home';
import CubeIcon from '@mui/icons-material/ViewInAr';
import GalleryIcon from '@mui/icons-material/Collections';
import ModelIcon from '@mui/icons-material/Person';
import NftIcon from '@mui/icons-material/Token';
import ChatIcon from '@mui/icons-material/Chat';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import DeleteIcon from '@mui/icons-material/Delete';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { keyframes } from '@mui/system';
import TwitterIcon from '@mui/icons-material/X';
import ArticleIcon from '@mui/icons-material/DocumentScanner';
import { Discord as DiscordIcon } from '../components/icons/Discord';
import { Logo } from '../components/icons/Logo';

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

const StyledDrawer = styled(Drawer)<{ $isOpen: boolean }>(({ $isOpen }) => ({
  width: SIDEBAR_WIDTH,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: SIDEBAR_WIDTH,
    boxSizing: 'border-box',
    backgroundColor: '#2B1261',
    border: 'none',
    overflow: 'hidden',
    animation: $isOpen 
      ? `${expandAnimation} 0.3s ease-out forwards`
      : `${collapseAnimation} 0.3s ease-in forwards`,
  },
  '& .MuiBackdrop-root': {
    display: 'none',
  },
}));

const ProfileSection = styled(Box)({
  padding: '24px 20px',
  display: 'flex',
  flexDirection: 'column',
});

const ProfileHeader = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
});

const ProfileInfo = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
});

const NameSection = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
});

const AddressSection = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
});

const AddressText = styled(Typography)({
  color: '#D6C0FF',
  fontSize: '12px',
  lineHeight: '100%',
});

const StyledListItemButton = styled(ListItemButton)<{ selected?: boolean }>(({ selected }) => ({
  width: '210px',
  height: '44px',
  margin: '0 20px',
  padding: '10px 6px',
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
  width: '100%',
  '& .chat-more-button': {
    position: 'absolute',
    right: '8px',
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
  position: 'absolute',
  bottom: 30,
  left: 20,
  width: 210,
  height: 35,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
});

const LogoLink = styled(Link)({
  display: 'flex',
  alignItems: 'center',
  width: 90,
  height: 35,
  '&:hover': {
    opacity: 0.8,
  },
});

const SocialIconsWrapper = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
});

const SocialIconLink = styled(Link)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 20,
  height: 20,
  color: 'white',
  '&:hover': {
    opacity: 0.8,
  },
});

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    // 可以添加复制成功的提示
  };

  const navigationItems = [
    { path: '/living-room', label: 'Living Room', icon: <HomeIcon sx={{ fontSize: 24 }} /> },
    { path: '/models', label: 'Models', icon: <CubeIcon sx={{ fontSize: 24 }} /> },
    { path: '/gallery', label: 'Gallery', icon: <GalleryIcon sx={{ fontSize: 24 }} /> },
  ];

  const handleMoreClick = (event: React.MouseEvent<HTMLElement>, chatId: string) => {
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

  const recentChats = [
    { id: '1', label: 'Chat 2024.12.23' },
    { id: '2', label: 'Chat 2024.12.22' },
  ];

  return (
    <StyledDrawer
      variant="persistent"
      anchor="left"
      open={open}
      onClose={onClose}
      $isOpen={open}
    >
      <ProfileSection>
        <ProfileHeader>
          <ProfileInfo>
            <Box sx={{ width: 34, height: 34 }} />
            <Box>
              <NameSection>
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    fontWeight: 700,
                    fontSize: '16px',
                    lineHeight: '100%',
                  }}
                >
                  NVIYOKO
                </Typography>
                <ArrowDropDownIcon sx={{ fontSize: 16 }} />
              </NameSection>
              <AddressSection>
                <AddressText>
                  {formatAddress('0x1234567890abcdef1234567890abcdef12345678')}
                </AddressText>
                <IconButton 
                  size="small" 
                  onClick={() => handleCopyAddress('0x1234567890abcdef1234567890abcdef12345678')}
                  sx={{ padding: 0 }}
                >
                  <ContentCopyIcon sx={{ fontSize: 12, color: '#D6C0FF' }} />
                </IconButton>
              </AddressSection>
            </Box>
          </ProfileInfo>
          <Box sx={{ display: 'flex', gap: '4px' }}>
            <IconButton size="small">
              <InfoIcon sx={{ fontSize: 20 }} />
            </IconButton>
            <IconButton size="small" onClick={onClose}>
              <MoreVertIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Box>
        </ProfileHeader>
      </ProfileSection>

      <StyledList>
        {navigationItems.map((item) => (
          <StyledListItemButton
            key={item.path}
            selected={location.pathname === item.path}
            onClick={() => navigate(item.path)}
          >
            {item.icon}
            <NavText sx={{ ml: 2 }}>{item.label}</NavText>
          </StyledListItemButton>
        ))}
      </StyledList>

      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)', margin: '0 20px' }} />

      <GroupTitle>My Space</GroupTitle>
      <StyledList>
        <StyledListItemButton>
          <ModelIcon sx={{ mr: 2 }} />
          <ListItemText primary="My Models" />
        </StyledListItemButton>
        <StyledListItemButton>
          <NftIcon sx={{ mr: 2 }} />
          <ListItemText primary="My NFTs" />
        </StyledListItemButton>
      </StyledList>

      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)', margin: '0 20px' }} />

      <GroupTitle>Recent Chat</GroupTitle>
      <StyledList>
        {recentChats.map((chat) => (
          <StyledListItemButton key={chat.id}>
            <ChatListItem>
              <ChatIcon sx={{ mr: 2, fontSize: 24 }} />
              <NavText>{chat.label}</NavText>
              <IconButton
                className="chat-more-button"
                size="small"
                onClick={(e) => handleMoreClick(e, chat.id)}
                sx={{ color: 'white' }}
              >
                <MoreHorizIcon />
              </IconButton>
            </ChatListItem>
          </StyledListItemButton>
        ))}
      </StyledList>

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
          <DeleteIcon sx={{ mr: 1 }} />
          Delete Chat
        </MenuItem>
      </Menu>

      <SocialBar>
        <LogoLink
          href="/"
          underline="none"
        >
          <Logo />
        </LogoLink>
        <SocialIconsWrapper>
          <SocialIconLink
            href="https://twitter.com/yourhandle"
            target="_blank"
            rel="noopener noreferrer"
            underline="none"
          >
            <TwitterIcon sx={{ fontSize: 20 }} />
          </SocialIconLink>
          <SocialIconLink
            href="https://discord.gg/yourinvite"
            target="_blank"
            rel="noopener noreferrer"
            underline="none"
          >
            <DiscordIcon />
          </SocialIconLink>
          <SocialIconLink
            href="/docs"
            underline="none"
          >
            <ArticleIcon sx={{ fontSize: 20 }} />
          </SocialIconLink>
        </SocialIconsWrapper>
      </SocialBar>
    </StyledDrawer>
  );
} 