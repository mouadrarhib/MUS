import { useState } from "react";
import {
  Box,
  Button,
  Stack,
  Typography,
  alpha,
  Menu as MuiMenu,
  MenuItem,
  ListItemIcon,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Divider,
} from "@mui/material";
import { Language, Check, Menu as MenuIcon, Close as CloseIcon } from "@mui/icons-material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useLanguage } from "@/app/providers/LanguageContext";
import { useAuth } from "@/features/auth/context/AuthContext";
import PublicAuthPromptDialog from "@/features/publicHome/components/PublicAuthPromptDialog";
import logo from "@/assets/images/logo.png";

const PublicHomeHeader = ({ navLinks = [] }) => {
  const { language, setLanguage, t } = useLanguage();
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [languageAnchorEl, setLanguageAnchorEl] = useState(null);
  const [authPromptOpen, setAuthPromptOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const languageOpen = Boolean(languageAnchorEl);

  const languageOptions = [
    { code: "en", label: "English" },
    { code: "fr", label: "Français" },
    { code: "ar", label: "العربية" },
  ];

  const handleLanguageOpen = (event) => setLanguageAnchorEl(event.currentTarget);
  const handleLanguageClose = () => setLanguageAnchorEl(null);
  const handleMobileNavOpen = () => setMobileNavOpen(true);
  const handleMobileNavClose = () => setMobileNavOpen(false);
  const handleLanguageSelect = (nextLanguage) => {
    setLanguage(nextLanguage);
    handleLanguageClose();
  };

  const handleLogout = () => {
    navigate("/", { replace: true });
    logout();
  };

  const handleResourcesClick = (event) => {
    if (isAuthenticated) return;
    event.preventDefault();
    setAuthPromptOpen(true);
  };

  const navigateToAuth = (mode) => {
    const to = mode === "register" ? "/register" : "/login";
    navigate(to, {
      state: {
        from: {
          pathname: "/discover",
        },
      },
    });
    setAuthPromptOpen(false);
  };

  return (
    <Box
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 20,
        backdropFilter: "blur(16px) saturate(1.6)",
        WebkitBackdropFilter: "blur(16px) saturate(1.6)",
        bgcolor: (theme) =>
          theme.palette.mode === "dark"
            ? "rgba(18,15,30,0.82)"
            : "rgba(255,255,255,0.78)",
        borderBottom: "1px solid",
        borderColor: 'var(--border)',
        boxShadow: (theme) =>
          theme.palette.mode === "dark"
            ? "0 1px 12px rgba(0,0,0,0.4)"
            : "0 1px 12px rgba(0,0,0,0.04)",
      }}
      data-anim="nav"
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 1320,
          mx: "auto",
          px: { xs: 1.5, sm: 2.5, md: 3.5 },
          height: 68,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Left: Logo + Nav links */}
        <Stack direction="row" spacing={2} alignItems="center">
              <Stack component={RouterLink} to="/" direction="row" alignItems="center" sx={{ textDecoration: "none" }}>
            <Box component="img" src={logo} alt="MUS Logo" sx={{ height: { xs: 34, sm: 40 }, width: "auto", objectFit: "contain" }} />
          </Stack>

          <Stack direction="row" spacing={0.5} sx={{ display: { xs: "none", md: "flex" } }}>
            {navLinks.map((link) => (
              <Typography
                key={link.key || link.labelKey || link}
                component={RouterLink}
                to={link.key === "resources" ? "/discover" : "/"}
                onClick={link.key === "resources" ? handleResourcesClick : undefined}
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: "text.secondary",
                  textDecoration: "none",
                  px: 1.5,
                  py: 0.6,
                  borderRadius: 2,
                  transition: "all 0.2s ease",
                  "&:hover": {
                    color: "primary.main",
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.06),
                  },
                }}
              >
                {t(link.labelKey || "", link.key || link)}
              </Typography>
            ))}
          </Stack>
        </Stack>

        {/* Right: Sign in + Language */}
          <Stack direction="row" spacing={0.8} alignItems="center">
          <IconButton
            onClick={handleMobileNavOpen}
            aria-label="Open navigation menu"
            sx={{
              display: { xs: "inline-flex", md: "none" },
              border: "1px solid",
              borderColor: (theme) =>
                theme.palette.mode === "dark" ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)",
              borderRadius: 2,
            }}
          >
            <MenuIcon />
          </IconButton>
          {isAuthenticated ? (
            <>
              <Button
                component={RouterLink}
                to="/discover"
                variant="contained"
                sx={{
                  display: { xs: "none", sm: "inline-flex" },
                  borderRadius: 2,
                  px: 2.2,
                  py: 0.7,
                  fontWeight: 700,
                  textTransform: "none",
                  fontSize: "0.85rem",
                  background: "linear-gradient(135deg, #7c5cfc 0%, #5b3fdd 100%)",
                  boxShadow: "0 2px 8px rgba(124,92,252,0.3)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #6e4fe8 0%, #4e36cc 100%)",
                    boxShadow: "0 4px 14px rgba(124,92,252,0.4)",
                  },
                }}
              >
                {t("publicHome.nav.resources", "Resources")}
              </Button>
              <Button
                variant="outlined"
                onClick={handleLogout}
                sx={{
                  display: { xs: "none", sm: "inline-flex" },
                  borderRadius: 2,
                  px: 1.8,
                  py: 0.6,
                  fontWeight: 700,
                  textTransform: "none",
                  fontSize: "0.85rem",
                  borderColor: (theme) =>
                    theme.palette.mode === "dark" ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)",
                  color: "text.primary",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    borderColor: "error.main",
                    color: "error.main",
                    bgcolor: (theme) => alpha(theme.palette.error.main, 0.06),
                  },
                }}
              >
                {t("common.logout", "Logout")}
              </Button>
            </>
          ) : (
            <Button
              component={RouterLink}
              to="/login"
              variant="contained"
              sx={{
                display: { xs: "none", sm: "inline-flex" },
                borderRadius: 2,
                px: 2.2,
                py: 0.7,
                fontWeight: 700,
                textTransform: "none",
                fontSize: "0.85rem",
                background: "linear-gradient(135deg, #44d62c 0%, #36b824 100%)",
                boxShadow: "0 2px 8px rgba(68,214,44,0.3)",
                border: "1px solid rgba(68,214,44,0.2)",
                "&:hover": {
                  background: "linear-gradient(135deg, #3ec427 0%, #30a820 100%)",
                  boxShadow: "0 4px 14px rgba(68,214,44,0.4)",
                },
              }}
            >
              {t("publicHome.header.signIn", "Sign in")}
            </Button>
          )}

          <Button
            onClick={handleLanguageOpen}
            variant="outlined"
            startIcon={<Language sx={{ fontSize: 16 }} />}
            sx={{
              minWidth: 0,
              borderRadius: 2,
              px: { xs: 1, sm: 1.2 },
              py: 0.6,
              textTransform: "none",
              fontWeight: 700,
              fontSize: "0.8rem",
              borderColor: (theme) =>
                theme.palette.mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
              color: "text.primary",
              transition: "all 0.2s ease",
              "&:hover": {
                borderColor: (theme) => alpha(theme.palette.primary.main, 0.4),
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.06),
              },
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
                borderRadius: 2.5,
                border: "1px solid",
                borderColor: 'var(--border)',
                backdropFilter: "blur(16px)",
                bgcolor: (theme) =>
                  theme.palette.mode === "dark"
                    ? "rgba(24,20,36,0.95)"
                    : "rgba(255,255,255,0.95)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
              },
            }}
          >
            {languageOptions.map((option) => (
              <MenuItem
                key={option.code}
                onClick={() => handleLanguageSelect(option.code)}
                sx={{
                  borderRadius: 1.5,
                  mx: 0.5,
                  my: 0.2,
                  transition: "all 0.15s ease",
                }}
              >
                <ListItemIcon sx={{ minWidth: 26 }}>
                  {language === option.code ? <Check fontSize="small" color="primary" /> : null}
                </ListItemIcon>
                {option.label}
              </MenuItem>
            ))}
          </MuiMenu>

          <PublicAuthPromptDialog
            open={authPromptOpen}
            onClose={() => setAuthPromptOpen(false)}
            onRegister={() => navigateToAuth("register")}
            onLogin={() => navigateToAuth("login")}
            title={t("publicHome.hero.authPrompt.title", "Sign in required")}
            description={t(
              "publicHome.hero.authPrompt.description",
              "Please sign in or create an account to access personalized discover resources."
            )}
            cancelLabel={t("common.cancel", "Cancel")}
            registerLabel={t("common.register", "Register")}
            loginLabel={t("publicHome.header.signIn", "Sign in")}
          />
        </Stack>
      </Box>

      <Drawer
        anchor="right"
        open={mobileNavOpen}
        onClose={handleMobileNavClose}
        PaperProps={{
          sx: {
            width: "min(86vw, 320px)",
            px: 1.2,
            py: 1,
          },
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 1, py: 0.5 }}>
          <Typography variant="subtitle2" fontWeight={700}>Menu</Typography>
          <IconButton onClick={handleMobileNavClose} aria-label="Close navigation menu">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
        <Divider sx={{ mb: 1 }} />

        <List>
          {navLinks.map((link) => (
            <ListItemButton
              key={link.key || link.labelKey || link}
              component={RouterLink}
              to={link.key === "resources" ? "/discover" : "/"}
              onClick={(event) => {
                if (link.key === "resources") handleResourcesClick(event);
                if (!event.defaultPrevented) handleMobileNavClose();
              }}
            >
              <ListItemText primary={t(link.labelKey || "", link.key || link)} />
            </ListItemButton>
          ))}
        </List>

        <Divider sx={{ my: 1 }} />
        <Stack spacing={1} sx={{ p: 1 }}>
          {isAuthenticated ? (
            <>
              <Button component={RouterLink} to="/discover" variant="contained" onClick={handleMobileNavClose}>
                {t("publicHome.nav.resources", "Resources")}
              </Button>
              <Button variant="outlined" onClick={() => { handleMobileNavClose(); handleLogout(); }}>
                {t("common.logout", "Logout")}
              </Button>
            </>
          ) : (
            <Button component={RouterLink} to="/login" variant="contained" onClick={handleMobileNavClose}>
              {t("publicHome.header.signIn", "Sign in")}
            </Button>
          )}
        </Stack>
      </Drawer>
    </Box>
  );
};

export default PublicHomeHeader;
