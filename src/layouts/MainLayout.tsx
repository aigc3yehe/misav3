import { Box, styled } from '@mui/material';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import SharedAvatar from '../components/SharedAvatar';
import SharedMenuButton from '../components/SharedMenuButton';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { Navigate } from 'react-router-dom';

const LayoutRoot = styled('div')(({ theme }) => ({
  display: 'flex',
  height: '100%',
  overflow: 'hidden',
  width: '100%',
  backgroundColor: theme.palette.background.default
}));

const LayoutWrapper = styled('div')<{ sidebarOpen: boolean }>(({ sidebarOpen }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  paddingTop: 84,
  paddingLeft: sidebarOpen ? 250 : 0,
  transition: 'padding-left 0.3s ease-in-out',
  overflow: 'auto',
}));

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const currentAgent = useSelector((state: RootState) => state.agent.currentAgent);

  if (!currentAgent) {
    return <Navigate to="/" replace />;
  }

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <LayoutRoot>
      <SharedAvatar 
        expanded={sidebarOpen} 
        src={currentAgent.avatar} 
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
          width: '100%',
          height: '100%',
        }}>
          <Outlet />
        </Box>
      </LayoutWrapper>
    </LayoutRoot>
  );
} 