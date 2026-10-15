import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: { main: "#1d4e89" },
    background: { default: "#eef2f6", paper: "#ffffff" },
    text: { primary: "#1c2430", secondary: "#5c6778" },
  },
  typography: {
    fontFamily: "system-ui, Segoe UI, Roboto, sans-serif",
    h1: { fontSize: "1.75rem", fontWeight: 700, lineHeight: 1.2 },
    h2: { fontSize: "1.125rem", fontWeight: 700, lineHeight: 1.3 },
    h3: { fontSize: "1rem", fontWeight: 650, lineHeight: 1.4 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          overflowX: "clip",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          minHeight: 44,
          textTransform: "none",
          fontWeight: 600,
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          minHeight: 44,
          textTransform: "none",
          fontWeight: 600,
        },
      },
    },
  },
});
