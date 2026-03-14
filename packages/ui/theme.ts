// Minimal black & white theme with accent color
import { createTheme } from '@mui/material/styles';

export const accentColor = '#6f42c1'; // Purple accent

const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#000000',
      paper: '#181a1b',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#E0E0E0',
      disabled: '#A0A0A0',
    },
    primary: {
      main: accentColor,
      contrastText: '#fff',
    },
    secondary: {
      main: '#fff',
      contrastText: '#000',
    },
    error: {
      main: '#ff1744',
    },
    warning: {
      main: '#ff9100',
    },
    info: {
      main: '#2979ff',
    },
    success: {
      main: '#00e676',
    },
    divider: '#333',
  },
  typography: {
    fontFamily: 'Inter, Arial, sans-serif',
    fontWeightBold: 800,
    h1: { fontWeight: 800, fontSize: '2.5rem', letterSpacing: -1 },
    h2: { fontWeight: 800, fontSize: '2rem', letterSpacing: -1 },
    h3: { fontWeight: 700, fontSize: '1.5rem' },
    body1: { fontSize: '1.1rem', fontWeight: 600 },
    button: { fontWeight: 700, letterSpacing: 0.5 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          ':focus': {
            outline: '3px solid #fff',
            outlineOffset: 2,
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          background: '#181a1b',
          color: '#fff',
          fontWeight: 600,
          ':focus-within': {
            outline: '2px solid #6f42c1',
            outlineOffset: 1,
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: '#fff',
          fontWeight: 700,
        },
      },
    },
  },
});

export default theme;
