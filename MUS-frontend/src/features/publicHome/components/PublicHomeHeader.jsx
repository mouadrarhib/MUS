import { Box, Button, IconButton, Stack, Typography, alpha } from "@mui/material";
import { Menu, ExpandMore, Language, DarkMode, LightMode } from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";
import { useThemeMode } from "@/app/providers/ThemeContext";

const PublicHomeHeader = ({ navLinks = [] }) => {
  const { mode, toggleTheme } = useThemeMode();

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
          <Stack direction="row" spacing={1} alignItems="center">
            <Box sx={{ width: 20, height: 20, borderRadius: 0.8, bgcolor: "primary.main", transform: "rotate(15deg)", opacity: 0.95 }} />
            <Typography variant="h5" fontWeight={800} sx={{ color: "text.primary", letterSpacing: "-0.01em" }}>
              MUS
            </Typography>
          </Stack>
          <Stack direction="row" spacing={3} sx={{ display: { xs: "none", md: "flex" } }}>
            {navLinks.map((link) => (
              <Typography key={link} variant="body1" sx={{ fontWeight: 700, color: "text.secondary" }}>
                {link}
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
            Sign in
          </Button>
          <IconButton size="small" sx={{ color: "text.primary", bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08) }}>
            <Language fontSize="small" />
          </IconButton>
          <IconButton size="small" sx={{ color: "text.primary" }}>
            <ExpandMore fontSize="small" />
          </IconButton>
        </Stack>
      </Box>
    </Box>
  );
};

export default PublicHomeHeader;
