import { useState } from "react";
import { Box, Button, Paper, Stack, Typography, alpha } from "@mui/material";
import { Search, KeyboardArrowDown } from "@mui/icons-material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useLanguage } from "@/app/providers/LanguageContext";
import { useAuth } from "@/features/auth/context/AuthContext";
import PublicAuthPromptDialog from "@/features/publicHome/components/PublicAuthPromptDialog";

const PublicHeroSection = ({ theme }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [authPromptOpen, setAuthPromptOpen] = useState(false);

  const targetQuery = searchQuery.trim();
  const targetSearch = targetQuery ? `?q=${encodeURIComponent(targetQuery)}` : "";

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    if (isAuthenticated) {
      navigate(targetSearch ? `/discover${targetSearch}` : "/discover");
      return;
    }

    setAuthPromptOpen(true);
  };

  const navigateToAuth = (mode) => {
    const to = mode === "register" ? "/register" : "/login";
    navigate(to, {
      state: {
        from: {
          pathname: "/discover",
          search: targetSearch,
        },
      },
    });
    setAuthPromptOpen(false);
  };

  return (
    <Box
      sx={{
        background:
          theme.palette.mode === "dark"
            ? "linear-gradient(145deg, #2a0038 0%, #190021 100%)"
            : `linear-gradient(145deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
        minHeight: { xs: 580, md: 740 },
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box data-float sx={{ position: "absolute", left: -90, top: 160, width: 220, height: 220, bgcolor: alpha(theme.palette.info.light, 0.85), borderRadius: "58% 42% 56% 44% / 45% 55% 45% 55%" }} />
      <Box data-float sx={{ position: "absolute", left: -30, top: 320, width: 120, height: 150, bgcolor: alpha(theme.palette.secondary.light, 0.8), borderRadius: "60% 40% 50% 50% / 60% 55% 45% 40%" }} />
      <Box data-float sx={{ position: "absolute", right: -120, top: 220, width: 380, height: 420, bgcolor: alpha(theme.palette.success.light, 0.85), borderRadius: "52% 48% 42% 58% / 46% 54% 46% 54%" }} />
      <Box data-float sx={{ position: "absolute", right: 140, top: 210, width: 170, height: 80, bgcolor: theme.palette.warning.main, borderRadius: "58% 42% 58% 42%" }} />
      <Box data-float sx={{ position: "absolute", right: 190, top: 355, width: 72, height: 110, bgcolor: theme.palette.success.main, borderRadius: "60% 40% 57% 43%" }} />
      <Box data-float sx={{ position: "absolute", right: 40, bottom: -30, width: 220, height: 115, bgcolor: alpha(theme.palette.secondary.main, 0.85), borderRadius: "58% 42% 58% 42%" }} />

      <Box sx={{ width: "100%", px: { xs: 1.5, sm: 2, md: 3 }, position: "relative", zIndex: 1 }}>
        <Stack alignItems="center" spacing={2.2} sx={{ width: "100%", maxWidth: "none" }}>
          <Typography data-hero="title" variant="h2" textAlign="center" sx={{ color: "#fff", fontWeight: 800, letterSpacing: "-0.02em", fontSize: { xs: "2.2rem", md: "4rem" }, maxWidth: { md: "70%" } }}>
            {t("publicHome.hero.title", "Grow smarter together")}
          </Typography>

          <Typography data-hero="subtitle" variant="h5" textAlign="center" sx={{ color: "rgba(255,255,255,0.92)", maxWidth: { md: "60%" } }}>
            {t("publicHome.hero.subtitle", "Find top-rated study notes from students taking the same courses as you.")}
          </Typography>

          <Paper
            data-hero="search"
            component="form"
            onSubmit={handleSearchSubmit}
            elevation={0}
            sx={{
              mt: 1,
              width: "100%",
              maxWidth: { xs: "100%", sm: 680, md: 760 },
              borderRadius: 30,
              bgcolor: "#fff",
              px: { xs: 1.8, md: 2.3 },
              py: 1.2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box
              component="input"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={t("publicHome.hero.searchPlaceholder", "Search for courses, quizzes, or documents")}
              sx={{
                width: "100%",
                border: 0,
                outline: "none",
                bgcolor: "transparent",
                color: "#374151",
                fontSize: { xs: "1rem", md: "1.05rem" },
                fontFamily: "inherit",
              }}
            />
            <Button
              type="submit"
              sx={{ minWidth: 0, p: 0.4, borderRadius: 2, color: "#4b5563" }}
            >
              <Search />
            </Button>
          </Paper>

          <Stack direction="row" spacing={1.2}>
            <Button component={RouterLink} to="/register" variant="contained" sx={{ borderRadius: 20, px: 3.5, fontWeight: 700 }}>
              {t("publicHome.hero.register", "Register")}
            </Button>
            <Button component={RouterLink} to="/login" variant="outlined" sx={{ borderRadius: 20, px: 3.5, color: "#fff", borderColor: "rgba(255,255,255,0.6)", "&:hover": { borderColor: "#fff" } }}>
              {t("publicHome.hero.signIn", "Sign in")}
            </Button>
          </Stack>

          <KeyboardArrowDown sx={{ color: "#fff", fontSize: 34, mt: 1 }} />
        </Stack>
      </Box>

      <PublicAuthPromptDialog
        open={authPromptOpen}
        onClose={() => setAuthPromptOpen(false)}
        onRegister={() => navigateToAuth("register")}
        onLogin={() => navigateToAuth("login")}
        title={t("publicHome.hero.authRequired.title", "Sign in required")}
        description={t(
          "publicHome.hero.authRequired.description",
          "To search and access resources, please sign in first. You can also create a new account."
        )}
        cancelLabel={t("common.cancel", "Cancel")}
        registerLabel={t("publicHome.hero.register", "Register")}
        loginLabel={t("publicHome.hero.signIn", "Sign in")}
      />
    </Box>
  );
};

export default PublicHeroSection;
