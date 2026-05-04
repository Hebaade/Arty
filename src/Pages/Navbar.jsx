import { useState } from "react";
import {
  AppBar, Toolbar, Typography, Button, Box,
  Avatar, IconButton, Divider,
  Drawer, List, ListItem, ListItemText
} from "@mui/material";
import { useContext } from "react";
import { ColorModeContext } from "../App";
import { DarkMode, LightMode } from "@mui/icons-material";
import MenuIcon from "@mui/icons-material/Menu";

import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { signOut } from "firebase/auth";
import { auth } from "../Firebase/auth";
import { logout } from "../Store/authSlice";
import { useAuth } from "../Hooks/useAuth";
import { useTranslation } from "react-i18next";

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { toggleColorMode, mode } = useContext(ColorModeContext);
  const { isLoggedIn, user, isArtist, isAdmin, isCollector } = useAuth();

  const [drawerOpen, setDrawerOpen] = useState(false);

  const { t, i18n } = useTranslation();
  const isAR = i18n.language === "ar";

  const toggleLanguage = () => {
    const newLang = isAR ? "en" : "ar";
    i18n.changeLanguage(newLang);
    document.dir = newLang === "ar" ? "rtl" : "ltr";
  };

  const handleLogout = async () => {
    await signOut(auth);
    dispatch(logout());
    navigate("/login");
    setDrawerOpen(false);
  };

  const navItems = [
    { label: t("nav.home"), path: "/" },
    { label: t("nav.gallery"), path: "/gallery" },
    { label: t("nav.artTypes"), path: "/art-types" },
    { label: t("nav.artists"), path: "/artists" },

    ...(isArtist
      ? [
          { label: t("nav.upload"), path: "/artist/upload" },
          { label: t("nav.myArtworks"), path: "/artist/my-artworks" },
          { label: t("nav.earnings"), path: "/artist/earnings" },
          { label: t("nav.canvas"), path: "/artist/canvas" },
        ]
      : []),

    ...(isCollector
      ? [
          { label: t("nav.myCollection"), path: "/collector/my-collection" },
          { label: t("nav.favorites"), path: "/collector/favorites" },
        ]
      : []),

    ...(isAdmin
      ? [{ label: t("nav.dashboard"), path: "/admin" }]
      : []),
  ];

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: "background.paper",
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between" }}>

        <Typography
          onClick={() => navigate("/")}
          sx={{
            cursor: "pointer",
            fontFamily: "'Playfair Display', serif",
            fontWeight: 800,
            fontSize: "1.6rem",
            color: "primary.main",
          }}
        >
          Arty
        </Typography>

        <Box sx={{ display: { xs: "none", md: "flex" }, gap: 1 }}>
          {navItems.map((item) => (
            <Button
              key={item.path}
              onClick={() => navigate(item.path)}
              sx={{ color: "text.secondary", fontSize: "0.85rem" }}
            >
              {item.label}
            </Button>
          ))}
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>

          <IconButton
            onClick={toggleColorMode}
            size="small"
            sx={{ border: "1px solid", borderColor: "divider" }}
          >
            {mode === "dark" ? (
              <LightMode sx={{ fontSize: 18, color: "text.secondary" }} />
            ) : (
              <DarkMode sx={{ fontSize: 18, color: "text.secondary" }} />
            )}
          </IconButton>

          <Button
            onClick={toggleLanguage}
            size="small"
            sx={{
              minWidth: 40,
              border: "1px solid",
              borderColor: "divider",
              fontSize: "0.75rem",
            }}
          >
            {isAR ? "EN" : "AR"}
          </Button>

          {!isLoggedIn ? (
            <Box sx={{ display: { xs: "none", md: "flex" }, gap: 1 }}>
              <Button onClick={() => navigate("/login")}>
                {t("nav.login")}
              </Button>
              <Button variant="contained" onClick={() => navigate("/register")}>
                {t("nav.register")}
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>

              <IconButton onClick={() => navigate("/profile")}>
                <Avatar
                  src={user?.photoURL}
                  alt={user?.displayName}
                  sx={{
                    width: 32,
                    height: 32,
                    cursor: "pointer",
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  {!user?.photoURL && user?.displayName?.charAt(0)}
                </Avatar>
              </IconButton>

              <Button
                onClick={handleLogout}
                color="error"
                variant="outlined"
                size="small"
              >
                {t("nav.logout")}
              </Button>

            </Box>
          )}

          <IconButton
            sx={{ display: { xs: "flex", md: "none" } }}
            onClick={() => setDrawerOpen(true)}
          >
            <MenuIcon />
          </IconButton>

        </Box>
      </Toolbar>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box sx={{ width: 250, p: 2 }}>

          <Typography fontWeight={800} mb={2}>
            Arty
          </Typography>

          <List>
            {navItems.map((item) => (
              <ListItem
                button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setDrawerOpen(false);
                }}
              >
                <ListItemText primary={item.label} />
              </ListItem>
            ))}

            <Divider sx={{ my: 1 }} />

            {isLoggedIn ? (
              <>
                <ListItem
                  button
                  onClick={() => {
                    navigate("/profile");
                    setDrawerOpen(false);
                  }}
                >
                  <ListItemText primary="Profile" />
                </ListItem>

                <ListItem button onClick={handleLogout}>
                  <ListItemText primary="Logout" />
                </ListItem>
              </>
            ) : (
              <>
                <ListItem button onClick={() => navigate("/login")}>
                  <ListItemText primary="Login" />
                </ListItem>
                <ListItem button onClick={() => navigate("/register")}>
                  <ListItemText primary="Register" />
                </ListItem>
              </>
            )}
          </List>

        </Box>
      </Drawer>

    </AppBar>
  );
};

export default Navbar;