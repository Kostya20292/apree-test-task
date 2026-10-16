import { CssBaseline, ThemeProvider } from '@mui/material';
import { Board } from './components/Board/Board';
import { theme } from './theme';

export const App = () => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <Board />
  </ThemeProvider>
);
