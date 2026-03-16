import { useState } from "react";
import { Box, Button, IconButton, Stack, Typography, alpha, Menu as MuiMenu, MenuItem, ListItemIcon } from "@mui/material";
import { Menu, Language, DarkMode, LightMode, Check } from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";
import { useThemeMode } from "@/app/providers/ThemeContext";
import { useLanguage } from "@/app/providers/LanguageContext";
import logo from "@/assets/images/logo.png";

const PublicHomeHeader = ({ navLinks = [] }) => {
  const { mode, toggleTheme } = useThemeMode();
  const { language, setLanguage, t } = useLanguage();
  const [languageAnchorEl, setLanguageAnchorEl] = useState(null);

  const languageOpen = Boolean(languageAnchorEl);

  const languageOptions = [
    { code: "en", label: "English" },
    { code: "fr", label: "Francais" },
    { code: "ar", label: "العربية" },
  ];

  const handleLanguageOpen = (event) => setLanguageAnchorEl(event.currentTarget);
  const handleLanguageClose = () => setLanguageAnchorEl(null);
  const handleLanguageSelect = (nextLanguage) => {
    setLanguage(nextLanguage);
    handleLanguageClose();
  };

  return (
    <Box
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 20,
        bgcolor: (theme) => (theme.palette.mode === "dark" ? "#171424" : "#ffffff"),
        borderBottom: "1px solid",
        borderColor: (theme) => (theme.palette.mode === "dark" ? alpha("#fff", 0.08) : "divider"),
      }}
      data-anim="nav"
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 1320,
          mx: "auto",
          px: { xs: 1.5, sm: 2.5, md: 3.5 },
          height: 74,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Stack direction="row" spacing={2.5} alignItems="center">
          <IconButton size="small" sx={{ color: "text.primary" }}>
            <Menu />
          </IconButton>
          <Stack component={RouterLink} to="/" direction="row" spacing={1} alignItems="center" sx={{ textDecoration: "none" }}>
            <Box component="img" src={logo} alt="MUS Logo" sx={{ height: 34, width: "auto", objectFit: "contain" }} />
            <Typography variant="h5" fontWeight={800} sx={{ color: "text.primary", letterSpacing: "-0.01em" }}>
              MUS
            </Typography>
          </Stack>
          <Stack direction="row" spacing={3} sx={{ display: { xs: "none", md: "flex" } }}>
            {navLinks.map((link) => (
              <Typography
                key={link.key || link.labelKey || link}
                component={RouterLink}
                to={link.key === "resources" ? "/discover" : "/"}
                variant="body1"
                sx={{
                  fontWeight: 700,
                  color: "text.secondary",
                  textDecoration: "none",
                  transition: "color 0.2s ease",
                  "&:hover": { color: "primary.main" },
                }}
              >
                {t(link.labelKey || "", link.key || link)}
              </Typography>
            ))}
          </Stack>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          <IconButton
            onClick={toggleTheme}
            aria-label={mode === "light" ? "Switch to dark mode" : "Switch to light mode"}
            size="small"
            sx={{ color: "text.primary", bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1), border: "1px solid", borderColor: "divider", "&:hover": { bgcolor: (theme) => alpha(theme.palette.primary.main, 0.18) } }}
          >
            {mode === "light" ? <DarkMode fontSize="small" /> : <LightMode fontSize="small" />}
          </IconButton>

          <Button
            component={RouterLink}
            to="/login"
            variant="contained"
            sx={{
              borderRadius: 999,
              px: 2.4,
              py: 0.75,
              fontWeight: 800,
              textTransform: "none",
              bgcolor: "#44d62c",
              color: "#fff",
              "&:hover": { bgcolor: "#3ec427" },
            }}
          >
            {t("publicHome.header.signIn", "Sign in")}
          </Button>

          <Button
            onClick={handleLanguageOpen}
            variant="outlined"
            startIcon={<Language fontSize="small" />}
            sx={{
              minWidth: 0,
              borderRadius: 999,
              px: 1.35,
              py: 0.6,
              textTransform: "none",
              fontWeight: 700,
              borderColor: "divider",
              color: "text.primary",
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
            }}
          >
            {String(language || "en").toUpperCase()}
          </Button>

          <MuiMenu
            anchorEl={languageAnchorEl}
            open={languageOpen}
            onClose={handleLanguageClose}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            PaperProps={{
              elevation: 0,
              sx: {
                mt: 1,
                minWidth: 180,
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
              },
            }}
          >
            {languageOptions.map((option) => (
              <MenuItem key={option.code} onClick={() => handleLanguageSelect(option.code)}>
                <ListItemIcon sx={{ minWidth: 26 }}>
                  {language === option.code ? <Check fontSize="small" color="primary" /> : null}
                </ListItemIcon>
                {option.label}
              </MenuItem>
            ))}
          </MuiMenu>
        </Stack>
      </Box>
    </Box>
  );
};

export default PublicHomeHeader;
