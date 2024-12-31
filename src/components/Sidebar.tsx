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
} from '@mui/material';
import infoIcon from '../assets/info.svg';
import DeleteIcon from '@mui/icons-material/Delete';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { keyframes } from '@mui/system';
import livingroomNormal from '../assets/livingroom_normal.svg';
import livingroomSelected from '../assets/livingroom_selected.svg';
import modelsNormal from '../assets/models_normal.svg';
import modelsSelected from '../assets/models_selected.svg';
import galleryNormal from '../assets/gallery_normal.svg';
import gallerySelected from '../assets/gallery_selected.svg';
import moreIcon from '../assets/more.svg';
import arrowDropDown from '../assets/arrow_drop_down.svg';
import copyIcon from '../assets/mi_copy.svg';
import xIcon from '../assets/x.svg';
import docsIcon from '../assets/docs.svg';
import discardIcon from '../assets/discard.svg';
import logoImage from '../assets/mirae_studio.png';

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
  gap: '0px',
  marginTop: '-5px',
});

const AddressSection = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '0px',
  marginTop: '-12px',
});

const AddressText = styled(Typography)({
  color: '#D6C0FF',
  fontSize: '12px',
  lineHeight: '100%',
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
  position: 'absolute',
  bottom: 30,
  left: 20,
  width: 210,
  height: 40,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
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

const InfoIconButton = styled(IconButton)({
  padding: 5,
  '& img': {
    width: '20px',
    height: '20px',
  },
});

const NavIcon = styled('img')({
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

const CopyIcon = styled(IconImage)({
  width: '12px',
  height: '12px',
});

const SocialIcon = styled(IconImage)({
  width: '20px',
  height: '20px',
});

const LogoImage = styled('img')({
  width: '90px',
  height: '35px',
  marginBottom: '10px',
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
    { 
      path: '/living-room', 
      label: 'Living Room', 
      icon: {
        normal: livingroomNormal,
        selected: livingroomSelected
      }
    },
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
    },
  ];

  const mySpaceItems = [
    {
      path: '/my-models',
      label: 'My Models',
      icon: {
        normal: modelsNormal, // 使用与 Models 相同的图标
        selected: modelsSelected
      }
    },
    {
      path: '/my-nfts',
      label: 'My NFTs',
      icon: {
        normal: galleryNormal, // 使用与 Gallery 相同的图标
        selected: gallerySelected
      }
    },
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

  const renderNavItems = (items: typeof navigationItems) => {
    return items.map((item) => {
      const isSelected = location.pathname === item.path;
      return (
        <StyledListItemButton
          key={item.path}
          selected={isSelected}
          onClick={() => navigate(item.path)}
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
                <IconButton 
                  size="small" 
                  onClick={() => handleCopyAddress('0x1234567890abcdef1234567890abcdef12345678')}
                  sx={{ padding: 1, width: 28, height: 28 }}
                >
                  <ArrowIcon src={arrowDropDown} alt="expand" />
                </IconButton>
                
              </NameSection>
              <AddressSection>
                <AddressText>
                  {formatAddress('0x1234567890abcdef1234567890abcdef12345678')}
                </AddressText>
                <IconButton 
                  size="small" 
                  onClick={() => handleCopyAddress('0x1234567890abcdef1234567890abcdef12345678')}
                  sx={{ padding: 1, width: 28, height: 28  }}
                >
                  <CopyIcon src={copyIcon} alt="copy" />
                </IconButton>
              </AddressSection>
            </Box>
          </ProfileInfo>
          <InfoIconButton style={{ padding: 5, marginTop: -16, marginRight: 21 }}>
            <img src={infoIcon} alt="info" />
          </InfoIconButton>  
          
        </ProfileHeader>
      </ProfileSection>

      <StyledList>
        {renderNavItems(navigationItems)}
      </StyledList>

      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)', margin: '0 20px' }} />

      <GroupTitle>My Space</GroupTitle>
      <StyledList>
        {renderNavItems(mySpaceItems)}
      </StyledList>

      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)', margin: '0 20px' }} />

      <GroupTitle>Recent Chat</GroupTitle>
      <StyledList>
        {recentChats.map((chat) => (
          <StyledListItemButton key={chat.id}>
            <ChatListItem>
              <NavIcon src={livingroomNormal} alt="chat" />
              <NavText>{chat.label}</NavText>
              <IconButton
                className="chat-more-button"
                size="small"
                sx={{ marginRight: '-5px' }}
                onClick={(e) => handleMoreClick(e, chat.id)}
              >
                <NavIcon src={moreIcon} alt="more" />
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
        <LogoImage src={logoImage} alt="Mirae Studio" />
        <SocialIconsWrapper>
          <SocialIconLink
            href="https://twitter.com/yourhandle"
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
          >
            <SocialIcon src={discardIcon} alt="Discard" />
          </SocialIconLink>
          <SocialIconLink
            href="/docs"
            underline="none"
          >
            <SocialIcon src={docsIcon} alt="Docs" />
          </SocialIconLink>
        </SocialIconsWrapper>
      </SocialBar>
    </StyledDrawer>
  );
} 