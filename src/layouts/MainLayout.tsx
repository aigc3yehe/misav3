import { Box, styled, Alert, Snackbar, useTheme, useMediaQuery } from '@mui/material';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import SharedAvatar from '../components/SharedAvatar';
import SharedMenuButton from '../components/SharedMenuButton';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { useLocation, Navigate } from 'react-router-dom';
import { hideToast } from '../store/slices/toastSlice';
import { fetchCollections } from '../store/slices/collectionSlice';

const LayoutRoot = styled('div')(({ theme }) => ({
  display: 'flex',
  height: '100%',
  overflow: 'hidden',
  width: '100%',
  backgroundColor: theme.palette.background.default
}));

const LayoutWrapper = styled('div')<{ sidebarOpen: boolean, isFullscreen: boolean }>(({ theme, sidebarOpen, isFullscreen }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  paddingTop: isFullscreen ? 0 : 84,
  paddingLeft: sidebarOpen ? 250 : 0,
  transition: 'padding-left 0.3s ease-in-out',
  overflow: 'auto',
  
  [theme.breakpoints.down('sm')]: {
    paddingTop: isFullscreen ? 0 : 64,
    paddingLeft: 0,
  }
}));

export default function MainLayout() {
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const currentAgent = useSelector((state: RootState) => state.agent.currentAgent);
  const isFullscreen = location.pathname === '/workstation' || location.pathname === '/voice_call';
  const dispatch = useDispatch<AppDispatch>();
  const toast = useSelector((state: RootState) => state.toast);

  useEffect(() => {
    dispatch(fetchCollections());
  }, [dispatch]);

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
      {!isMobile && (
        <SharedAvatar 
          expanded={sidebarOpen} 
          src={currentAgent.avatar} 
        />
      )}
      {!isMobile && (
        <SharedMenuButton 
          isExpanded={sidebarOpen}
          onClick={handleToggleSidebar}
        />
      )}
      <Navbar 
        onSidebarOpen={handleToggleSidebar}
        sidebarOpen={sidebarOpen}
        isMobile={isMobile}
        avatar={currentAgent.avatar}
      />
      <Sidebar
        open={sidebarOpen}
        onClose={handleToggleSidebar}
        isMobile={isMobile}
      />
      <LayoutWrapper sidebarOpen={!isMobile && sidebarOpen} isFullscreen={isFullscreen}>
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
          sx={{ 
            width: '100%',
            backgroundColor: 'rgba(47, 29, 86, 0.95)',
            padding: '10px 20px',
            '& .MuiAlert-message': {
              color: '#fff',
              fontSize: 14,
              fontWeight: 400,
              lineHeight: '140%'
            },
            '& .MuiAlert-icon': {
              color: '#fff'
            },
            '& .MuiAlert-action': {
              padding: 0,
              marginRight: 0,
              marginLeft: '8px',
              alignItems: 'center'
            }
          }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </LayoutRoot>
  );
} 