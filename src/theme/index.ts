import { createTheme } from '@mui/material';
import pointingCursor from '../assets/pointer.png';
import disablePointer from '../assets/disable_pointer.png';
import backgroundImage from '../assets/Niyoko_bg.png';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#150F20',
      paper: '#2B1261',
    },
    primary: {
      main: '#2B1261',
    },
  },
  typography: {
    fontFamily: 'Tektur, sans-serif',
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#150F20',
          minHeight: '100vh',
          backgroundImage: `url(${backgroundImage})`,
          backgroundPosition: 'left top',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
        },
        'button, a, [role="button"], .MuiButtonBase-root, .clickable, .MuiIconButton-root, .MuiMenuItem-root:not([aria-disabled="true"])': {
          cursor: `url(${pointingCursor}), pointer !important`,
        },
        '[disabled], [aria-disabled="true"], .disabled, .Mui-disabled': {
          cursor: `url(${disablePointer}), not-allowed !important`,
        },
        '*::-webkit-scrollbar': {
          width: '17px',
        },
        '*::-webkit-scrollbar-track': {
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '8px',
        },
        '*::-webkit-scrollbar-thumb': {
          background: 'rgba(255, 255, 255, 0.15)',
          borderRadius: '8px',
          border: '5px solid transparent',
          backgroundClip: 'content-box',
        },
        '*::-webkit-scrollbar-thumb:hover': {
          background: 'rgba(255, 255, 255, 0.25)',
          border: '5px solid transparent',
          backgroundClip: 'content-box',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'transparent',
          boxShadow: 'none',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#2B1261',
          borderRight: 'none',
        },
      },
    },
  },
}); 