import { memo, useCallback, useState } from "react";
import {
  Box,
  Divider,
  Grid,
  IconButton,
  Stack,
  Typography,
  alpha,
  useMediaQuery,
} from "@mui/material";
import { LinkedIn, Instagram, X } from "@mui/icons-material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useLanguage } from "@/app/providers/LanguageContext";
import { useAuth } from "@/features/auth/context/AuthContext";
import PublicAuthPromptDialog from "@/features/publicHome/components/PublicAuthPromptDialog";
import logo from "@/assets/images/logo.png";

// ─── Static data (outside component) ─────────────────────────────────────────

const NAV_LINKS = [
  { id: "discover", labelKey: "publicHome.footer.links.discover", fallback: "Discover",  to: "/discover", protected: true  },
  { id: "signin",   labelKey: "publicHome.footer.links.signIn",   fallback: "Sign in",   to: "/login",    protected: false },
  { id: "register", labelKey: "publicHome.footer.links.register", fallback: "Register",  to: "/register", protected: false },
];

const SOCIAL_LINKS = [
  { id: "linkedin",  Icon: LinkedIn,  label: "LinkedIn",    href: "https://linkedin.com"  },
  { id: "instagram", Icon: Instagram, label: "Instagram",   href: "https://instagram.com" },
  { id: "x",         Icon: X,         label: "X (Twitter)", href: "https://x.com"         },
];

// ─── Reusable footer link ─────────────────────────────────────────────────────

const FooterLink = memo(({ to, label, onClick, reducedMotion }) => (
  <RouterLink to={to} onClick={onClick} style={{ textDecoration: "none" }}>
    <Typography
      variant="body2"
      sx={{
        fontWeight:  500,
        fontSize:    "0.9rem",
        color:       (theme) =>
          theme.palette.mode === "dark"
            ? "rgba(210,200,255,0.65)"
            : "rgba(55,45,110,0.65)",
        display:     "inline-block",
        position:    "relative",
        transition:  reducedMotion ? "none" : "color 180ms cubic-bezier(0.16,1,0.3,1)",
        "&:hover":   { color: (theme) => theme.palette.primary.main },
        "&::after": {
          content:    '""',
          position:   "absolute",
          bottom:     -1,
          left:       0,
          width:      0,
          height:     "1.5px",
          borderRadius: "2px",
          background: (theme) => theme.palette.primary.main,
          transition: reducedMotion ? "none" : "width 220ms cubic-bezier(0.16,1,0.3,1)",
        },
        "&:hover::after": { width: "100%" },
      }}
    >
      {label}
    </Typography>
  </RouterLink>
));
FooterLink.displayName = "FooterLink";

// ─── Column heading ───────────────────────────────────────────────────────────

const ColHeading = ({ children }) => (
  <Typography
    variant="overline"
    sx={{
      fontSize:      "0.7rem",
      fontWeight:    700,
      letterSpacing: "0.1em",
      color:         (theme) =>
        theme.palette.mode === "dark"
          ? "rgba(180,165,255,0.45)"
          : "rgba(80,60,180,0.45)",
      mb:            2,
      display:       "block",
    }}
  >
    {children}
  </Typography>
);

// ─── Main component ───────────────────────────────────────────────────────────

const PublicFooterSection = memo(() => {
  const { t }               = useLanguage();
  const { isAuthenticated } = useAuth();
  const navigate            = useNavigate();
  const reducedMotion       = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [authPromptOpen, setAuthPromptOpen] = useState(false);

  const handleLinkClick = useCallback(
    (e, link) => {
      if (!link.protected || isAuthenticated) return;
      e.preventDefault();
      setAuthPromptOpen(true);
    },
    [isAuthenticated]
  );

  const handleClose    = useCallback(() => setAuthPromptOpen(false), []);

  const navigateToAuth = useCallback(
    (mode) => {
      navigate(mode === "register" ? "/register" : "/login", {
        state: { from: { pathname: "/discover" } },
      });
      setAuthPromptOpen(false);
    },
    [navigate]
  );

  const handleLogin    = useCallback(() => navigateToAuth("login"),    [navigateToAuth]);
  const handleRegister = useCallback(() => navigateToAuth("register"), [navigateToAuth]);

  return (
    <Box
      component="footer"
      aria-label="Site footer"
      sx={{
        position:   "relative",
        overflow:   "hidden",
        background: (theme) =>
          theme.palette.mode === "dark"
            ? "linear-gradient(180deg, #0f0c1c 0%, #130f24 100%)"
            : "linear-gradient(180deg, #f5f3ff 0%, #edeaff 100%)",
      }}
    >
      {/* ── Top gradient accent bar ─────────────────────────────────────── */}
      <Box
        aria-hidden="true"
        sx={{
          position:   "absolute",
          top:        0,
          left:       0,
          right:      0,
          height:     "2px",
          background: "linear-gradient(90deg, transparent 0%, #7c3aed 30%, #6d28d9 60%, transparent 100%)",
        }}
      />

      {/* ── Ambient glow blobs ──────────────────────────────────────────── */}
      <Box aria-hidden="true" sx={{
        position: "absolute", top: -80, left: "10%",
        width: 400, height: 400, borderRadius: "50%",
        background: (theme) =>
          theme.palette.mode === "dark"
            ? "radial-gradient(circle, rgba(124,92,252,0.09) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(124,92,252,0.07) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <Box aria-hidden="true" sx={{
        position: "absolute", bottom: -60, right: "5%",
        width: 300, height: 300, borderRadius: "50%",
        background: (theme) =>
          theme.palette.mode === "dark"
            ? "radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <Box
        sx={{
          maxWidth: 1100,
          mx:       "auto",
          px:       { xs: 3, sm: 5, md: 8 },
          pt:       { xs: 7, md: 10 },
          pb:       { xs: 4, md: 5 },
          position: "relative",
          zIndex:   1,
        }}
      >
        {/* ── 3-Column grid ───────────────────────────────────────────────── */}
        <Grid container spacing={{ xs: 5, md: 4 }} sx={{ mb: { xs: 5, md: 7 } }}>

          {/* Col 1 — Brand */}
          <Grid item xs={12} md={5}>
            <Stack
              component={RouterLink}
              to="/"
              direction="row"
              spacing={1.5}
              alignItems="center"
              sx={{ textDecoration: "none", display: "inline-flex", mb: 2.5 }}
            >
              <Box
                component="img"
                src={logo}
                alt="MUS logo"
                sx={{ height: 32, width: "auto", objectFit: "contain" }}
              />
            </Stack>

            <Typography
              variant="body2"
              sx={{
                color:      (theme) =>
                  theme.palette.mode === "dark"
                    ? "rgba(210,200,255,0.58)"
                    : "rgba(55,45,110,0.62)",
                lineHeight: 1.75,
                fontSize:   "0.9rem",
                maxWidth:   "38ch",
              }}
            >
              {t(
                "publicHome.footer.description",
                "MUS helps university communities discover trusted resources, learn faster, and collaborate with clarity."
              )}
            </Typography>
          </Grid>

          {/* Col 2 — Quick Links */}
          <Grid item xs={12} sm={6} md={3}>
            <ColHeading>{t("publicHome.footer.nav.heading", "Navigation")}</ColHeading>
            <Stack spacing={2}>
              {NAV_LINKS.map((link) => (
                <FooterLink
                  key={link.id}
                  to={link.to}
                  label={t(link.labelKey, link.fallback)}
                  reducedMotion={reducedMotion}
                  onClick={(e) => handleLinkClick(e, link)}
                />
              ))}
            </Stack>
          </Grid>

          {/* Col 3 — Connect */}
          <Grid item xs={12} sm={6} md={4}>
            <ColHeading>{t("publicHome.footer.social.heading", "Follow Us")}</ColHeading>
            <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
              {SOCIAL_LINKS.map(({ id, Icon, label, href }) => (
                <IconButton
                  key={id}
                  component="a"
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Visit our ${label} page`}
                  size="small"
                  sx={{
                    width:        38,
                    height:       38,
                    borderRadius: "10px",
                    border:       "1px solid",
                    borderColor:  (theme) =>
                      theme.palette.mode === "dark"
                        ? "rgba(139,92,246,0.20)"
                        : "rgba(109,40,217,0.14)",
                    background:   (theme) =>
                      theme.palette.mode === "dark"
                        ? "rgba(139,92,246,0.07)"
                        : "rgba(109,40,217,0.04)",
                    color:        (theme) =>
                      theme.palette.mode === "dark"
                        ? "rgba(196,181,253,0.65)"
                        : "rgba(91,33,182,0.60)",
                    willChange:   "transform",
                    transition:   reducedMotion
                      ? "none"
                      : "color 180ms cubic-bezier(0.16,1,0.3,1), background 180ms cubic-bezier(0.16,1,0.3,1), border-color 180ms cubic-bezier(0.16,1,0.3,1), transform 180ms cubic-bezier(0.16,1,0.3,1)",
                    "&:hover": {
                      color:       (theme) => theme.palette.primary.main,
                      background:  (theme) => alpha(theme.palette.primary.main, 0.10),
                      borderColor: (theme) => alpha(theme.palette.primary.main, 0.35),
                      transform:   "translateY(-3px)",
                    },
                    "&:active": { transform: "translateY(0)" },
                    "&:focus-visible": {
                      outline:       "2px solid",
                      outlineColor:  (theme) => theme.palette.primary.main,
                      outlineOffset: "3px",
                    },
                  }}
                >
                  <Icon sx={{ fontSize: 17 }} />
                </IconButton>
              ))}
            </Stack>

            <Typography
              variant="body2"
              sx={{
                color:      (theme) =>
                  theme.palette.mode === "dark"
                    ? "rgba(210,200,255,0.40)"
                    : "rgba(55,45,110,0.45)",
                fontSize:   "0.82rem",
                lineHeight: 1.6,
              }}
            >
              {t("publicHome.footer.social.cta", "Join thousands of students already learning smarter.")}
            </Typography>
          </Grid>
        </Grid>

        {/* ── Divider ─────────────────────────────────────────────────────── */}
        <Divider
          sx={{
            borderColor: (theme) =>
              theme.palette.mode === "dark"
                ? "rgba(139,92,246,0.12)"
                : "rgba(109,40,217,0.10)",
            mb: { xs: 3, md: 3.5 },
          }}
        />

        {/* ── Bottom bar ──────────────────────────────────────────────────── */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={1.5}
        >
          <Typography
            variant="body2"
            sx={{
              color:    (theme) =>
                theme.palette.mode === "dark"
                  ? "rgba(180,165,255,0.32)"
                  : "rgba(80,60,160,0.38)",
              fontSize: "0.78rem",
            }}
          >
            {t("publicHome.footer.copyright", "© 2026 MUS. All rights reserved.")}
          </Typography>

          <Stack direction="row" spacing={{ xs: 2, sm: 3 }} flexWrap="wrap" useFlexGap>
            {[
              { key: "privacy",  labelKey: "publicHome.footer.legal.privacy",  fallback: "Privacy Policy", to: "/privacy"  },
              { key: "terms",    labelKey: "publicHome.footer.legal.terms",     fallback: "Terms of Use",   to: "/terms"    },
            ].map((item) => (
              <RouterLink key={item.key} to={item.to} style={{ textDecoration: "none" }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize:   "0.78rem",
                    fontWeight: 500,
                    color:      (theme) =>
                      theme.palette.mode === "dark"
                        ? "rgba(180,165,255,0.38)"
                        : "rgba(80,60,160,0.42)",
                    transition: reducedMotion ? "none" : "color 160ms ease",
                    "&:hover":  { color: (theme) => theme.palette.primary.main },
                  }}
                >
                  {t(item.labelKey, item.fallback)}
                </Typography>
              </RouterLink>
            ))}
          </Stack>
        </Stack>
      </Box>

      {/* ── Auth dialog ─────────────────────────────────────────────────── */}
      <PublicAuthPromptDialog
        open={authPromptOpen}
        onClose={handleClose}
        onLogin={handleLogin}
        onRegister={handleRegister}
        title={t("publicHome.hero.authPrompt.title", "Sign in required")}
        description={t(
          "publicHome.hero.authPrompt.description",
          "Please sign in or create an account to access personalized discover resources."
        )}
        cancelLabel={t("common.cancel", "Cancel")}
        registerLabel={t("common.register", "Register")}
        loginLabel={t("publicHome.header.signIn", "Sign in")}
      />
    </Box>
  );
});

PublicFooterSection.displayName = "PublicFooterSection";

export default PublicFooterSection;
