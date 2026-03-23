import { Box, Stack, Typography, IconButton, Button, alpha } from "@mui/material";
import { LinkedIn, Instagram, X, ArrowForward } from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";
import { useLanguage } from "@/app/providers/LanguageContext";
import logo from "@/assets/images/logo.png";

const PublicFooterSection = () => {
  const { t } = useLanguage();

  const links = [
    { label: t("publicHome.footer.links.discover", "Discover"), to: "/discover" },
    { label: t("publicHome.footer.links.signIn", "Sign in"), to: "/login" },
    { label: t("publicHome.footer.links.register", "Register"), to: "/register" },
  ];

  return (
    <Box
      sx={{
        position: "relative",
        overflow: "hidden",
        mt: { xs: 7, md: 10 },
        px: { xs: 2, sm: 3, md: 4 },
        py: { xs: 4, md: 5 },
        background: (theme) =>
          theme.palette.mode === "dark"
            ? "linear-gradient(145deg, #130f24 0%, #0f0c1c 100%)"
            : "linear-gradient(145deg, #f8f8fc 0%, #eef3ff 100%)",
        borderTop: "1px solid",
        borderColor: (theme) =>
          theme.palette.mode === "dark" ? alpha("#fff", 0.08) : alpha(theme.palette.primary.main, 0.12),
      }}
      data-reveal
    >
      <Box
        data-float
        sx={{
          position: "absolute",
          right: -46,
          top: -40,
          width: 150,
          height: 150,
          borderRadius: "46% 54% 60% 40%",
          bgcolor: "rgba(124,92,252,0.16)",
          pointerEvents: "none",
        }}
      />
      <Box
        data-float
        sx={{
          position: "absolute",
          left: -36,
          bottom: -34,
          width: 120,
          height: 120,
          borderRadius: "57% 43% 52% 48%",
          bgcolor: "rgba(16,185,129,0.12)",
          pointerEvents: "none",
        }}
      />

      <Box sx={{ maxWidth: 1320, mx: "auto", position: "relative", zIndex: 1 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2.5}
          alignItems={{ xs: "flex-start", md: "center" }}
          justifyContent="space-between"
        >
          <Stack spacing={1.2}>
            <Stack component={RouterLink} to="/" direction="row" spacing={1} alignItems="center" sx={{ textDecoration: "none" }}>
              <Box component="img" src={logo} alt="MUS Logo" sx={{ height: 36, width: "auto", objectFit: "contain" }} />
              <Typography sx={{ fontSize: "1.35rem", fontWeight: 800, color: "text.primary", letterSpacing: "-0.01em" }}>
                MUS
              </Typography>
            </Stack>
            <Typography sx={{ color: "text.secondary", maxWidth: 560 }}>
              {t(
                "publicHome.footer.description",
                "MUS helps university communities discover trusted resources, learn faster, and collaborate with clarity."
              )}
            </Typography>
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.1}>
            {links.map((link) => (
              <Button
                key={link.to}
                component={RouterLink}
                to={link.to}
                endIcon={<ArrowForward sx={{ fontSize: 16 }} />}
                variant="outlined"
                sx={{ borderRadius: 999, textTransform: "none", fontWeight: 700 }}
              >
                {link.label}
              </Button>
            ))}
          </Stack>
        </Stack>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.4}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
          sx={{ mt: 3, pt: 2.2, borderTop: "1px solid", borderColor: "divider" }}
        >
          <Typography sx={{ color: "text.secondary", fontSize: "0.9rem" }}>
            {t("publicHome.footer.copyright", "© 2026 MUS. All rights reserved.")}
          </Typography>

          <Stack direction="row" spacing={0.6}>
            {[LinkedIn, Instagram, X].map((Icon, index) => (
              <IconButton
                key={index}
                size="small"
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.06),
                  transition: "transform 0.2s ease",
                  "&:hover": { transform: "translateY(-2px)", bgcolor: (theme) => alpha(theme.palette.primary.main, 0.13) },
                }}
              >
                <Icon sx={{ fontSize: 16 }} />
              </IconButton>
            ))}
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
};

export default PublicFooterSection;
