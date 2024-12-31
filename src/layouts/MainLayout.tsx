import { Box, styled } from '@mui/material';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import SharedAvatar from '../components/SharedAvatar';
import SharedMenuButton from '../components/SharedMenuButton';

const LayoutRoot = styled('div')(({ theme }) => ({
  display: 'flex',
  height: '100%',
  overflow: 'hidden',
  width: '100%',
  backgroundColor: theme.palette.background.default
}));

const LayoutWrapper = styled('div')<{ sidebarOpen: boolean }>(({ sidebarOpen }) => ({
  display: 'flex',
  flex: '1 1 auto',
  overflow: 'hidden',
  paddingTop: 84,
  marginLeft: sidebarOpen ? '250px' : 0,
  transition: 'margin-left 0.3s ease-in-out',
  transitionDelay: sidebarOpen ? '0.1s' : '0s',
}));

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <LayoutRoot>
      <SharedAvatar 
        expanded={sidebarOpen} 
        src="/path-to-avatar.jpg" 
      />
      <SharedMenuButton 
        expanded={sidebarOpen}
        onClick={handleToggleSidebar}
      />
      <Navbar 
        onSidebarOpen={handleToggleSidebar}
        sidebarOpen={sidebarOpen}
      />
      <Sidebar
        open={sidebarOpen}
        onClose={handleToggleSidebar}
      />
      <LayoutWrapper sidebarOpen={sidebarOpen}>
        <Box sx={{ 
          flex: '1 1 auto', 
          overflow: 'auto',
          width: '100%',
        }}>
          <Outlet />
        </Box>
      </LayoutWrapper>
    </LayoutRoot>
  );
} 