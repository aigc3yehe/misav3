import { Box, styled, Alert, Snackbar } from '@mui/material';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import SharedAvatar from '../components/SharedAvatar';
import SharedMenuButton from '../components/SharedMenuButton';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { useLocation, Navigate } from 'react-router-dom';
import { hideToast } from '../store/slices/toastSlice';

const LayoutRoot = styled('div')(({ theme }) => ({
  display: 'flex',
  height: '100%',
  overflow: 'hidden',
  width: '100%',
  backgroundColor: theme.palette.background.default
}));

const LayoutWrapper = styled('div')<{ sidebarOpen: boolean, isFullscreen: boolean }>(({ sidebarOpen, isFullscreen }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  paddingTop: isFullscreen ? 0 : 84,
  paddingLeft: sidebarOpen ? 250 : 0,
  transition: 'padding-left 0.3s ease-in-out',
  overflow: 'auto',
}));

export default function MainLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const currentAgent = useSelector((state: RootState) => state.agent.currentAgent);
  const isFullscreen = location.pathname === '/workstation' || location.pathname === '/voice_call';
  const dispatch = useDispatch();
  const toast = useSelector((state: RootState) => state.toast);

  if (!currentAgent) {
    return <Navigate to="/" replace />;
  }

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleCloseToast = () => {
    dispatch(hideToast());
  };

  return (
    <LayoutRoot>
      <SharedAvatar 
        expanded={sidebarOpen} 
        src={currentAgent.avatar} 
      />
      <SharedMenuButton 
        isExpanded={sidebarOpen}
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
      <LayoutWrapper sidebarOpen={sidebarOpen} isFullscreen={isFullscreen}>
        <Box sx={{ 
          width: '100%',
          height: '100%',
        }}>
          <Outlet />
        </Box>
      </LayoutWrapper>
      <Snackbar
        open={toast.open}
        autoHideDuration={2000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseToast} 
          severity={toast.severity}
          sx={{ width: '100%' }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </LayoutRoot>
  );
} 