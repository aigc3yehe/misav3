import { createTheme } from '@mui/material';

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
    // 设置默认字体权重
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        @import url('https://fonts.googleapis.com/css2?family=Tektur:wght@400;500;700&display=swap');
        body {
          backgroundColor: '#150F20';
          minHeight: '100vh';
        }
      `,
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