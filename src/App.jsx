import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { prefixer } from "stylis";
import rtlPlugin from "stylis-plugin-rtl";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import store from "./Store/index";
import { useAuthListener } from "./Hooks/useAuth";
import AppRouter from "./router";

const cacheRtl = createCache({ key: "muirtl", stylisPlugins: [prefixer, rtlPlugin] });
const cacheLtr = createCache({ key: "muiltr" });

export const ColorModeContext = React.createContext({ toggleColorMode: () => {} });

import React from "react";

const AppContent = ({ mode, toggleColorMode }) => {
  useAuthListener();
  const { i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  useEffect(() => {
    document.dir = isRTL ? "rtl" : "ltr";
  }, [isRTL]);

  const theme = createTheme({
    direction: isRTL ? "rtl" : "ltr",
    palette: {
      mode,
      ...(mode === "light" ? {
        primary:    { main: "#8B5E3C", light: "#C49A6C", dark: "#5C3D1E", contrastText: "#fff" },
        secondary:  { main: "#D4956A", light: "#E8C4A0", dark: "#A06040", contrastText: "#fff" },
        background: { default: "#F5F0E8", paper: "#FDFAF5" },
        text:       { primary: "#2C1810", secondary: "#6B4C35" },
        divider:    "#E8D5C0",
      } : {
        primary:    { main: "#C49A6C", light: "#E8C4A0", dark: "#8B5E3C", contrastText: "#1a0a00" },
        secondary:  { main: "#D4956A", light: "#E8C4A0", dark: "#A06040", contrastText: "#fff" },
        background: { default: "#1A1208", paper: "#241A0E" },
        text:       { primary: "#F5EDE0", secondary: "#C49A6C" },
        divider:    "#3D2A18",
      }),
    },
    typography: {
      fontFamily: "'Lato', 'Arial', sans-serif",
      h1: { fontFamily: "'Playfair Display', serif", fontWeight: 800 },
      h2: { fontFamily: "'Playfair Display', serif", fontWeight: 700 },
      h3: { fontFamily: "'Playfair Display', serif", fontWeight: 700 },
      h4: { fontFamily: "'Playfair Display', serif", fontWeight: 600 },
      h5: { fontFamily: "'Playfair Display', serif", fontWeight: 600 },
      h6: { fontFamily: "'Playfair Display', serif", fontWeight: 500 },
    },
    shape: { borderRadius: 4 },
    components: {
      MuiButton: {
        styleOverrides: {
          root: { borderRadius: 2, textTransform: "none", fontWeight: 700 },
          contained: { boxShadow: "none", "&:hover": { boxShadow: "0 2px 8px rgba(139,94,60,0.3)" } },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: { borderRadius: 2, boxShadow: "none", border: "1px solid", borderColor: mode === "light" ? "#E8D5C0" : "#3D2A18" },
        },
      },
      MuiPaper: {
        styleOverrides: { root: { backgroundImage: "none" } },
      },
    },
  });

  return (
    <ColorModeContext.Provider value={{ toggleColorMode, mode }}>
      <CacheProvider value={isRTL ? cacheRtl : cacheLtr}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AppRouter />
        </ThemeProvider>
      </CacheProvider>
    </ColorModeContext.Provider>
  );
};

function App() {
  const [mode, setMode] = useState(() => localStorage.getItem("colorMode") || "light");

  const toggleColorMode = () => {
    setMode((prev) => {
      const next = prev === "light" ? "dark" : "light";
      localStorage.setItem("colorMode", next);
      return next;
    });
  };

  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppContent mode={mode} toggleColorMode={toggleColorMode} />
      </BrowserRouter>
    </Provider>
  );
}

export default App;