import { memo, useCallback } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  Divider,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { LockOutlined } from "@mui/icons-material";
import PropTypes from "prop-types";
import { keyframes } from "@mui/system";

// ─── Keyframes (outside component — never re-created on render) ───────────────

const floatUp = keyframes`
  0%   { transform: translateY(0px); }
  50%  { transform: translateY(-7px); }
  100% { transform: translateY(0px); }
`;

const fadeSlideUp = keyframes`
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
`;

// ─── Component ────────────────────────────────────────────────────────────────

const PublicAuthPromptDialog = memo(({
  open,
  onClose,
  onLogin,
  onRegister,
  title,
  description,
  cancelLabel   = "Cancel",
  registerLabel = "Create Account",
  loginLabel    = "Sign In",
}) => {
  const theme               = useTheme();
  const isDark              = theme.palette.mode === "dark";
  const isFullScreen        = useMediaQuery(theme.breakpoints.down("sm"));
  const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  // Stable refs — prevents unnecessary child re-renders
  const handleLogin    = useCallback(() => onLogin(),    [onLogin]);
  const handleRegister = useCallback(() => onRegister(), [onRegister]);
  const handleClose    = useCallback(() => onClose(),    [onClose]);

  // ── Design tokens (one place to maintain all colors) ──────────────────────
  const t = {
    bgGradient:    isDark
      ? "linear-gradient(160deg, #1e1a30 0%, #12101e 100%)"
      : "linear-gradient(160deg, #ffffff 0%, #f4f0ff 100%)",
    borderColor:   isDark ? "rgba(139,92,246,0.18)"  : "rgba(124,58,237,0.14)",
    dialogShadow:  isDark ? "0 32px 80px rgba(0,0,0,0.65)" : "0 24px 72px rgba(109,40,217,0.18)",
    backdropBg:    isDark ? "rgba(5,4,12,0.72)"      : "rgba(60,40,140,0.14)",
    titleColor:    isDark ? "#ede9fe"                : "#2e1065",
    descColor:     isDark ? "rgba(221,214,254,0.65)" : "rgba(76,29,149,0.65)",
    dividerColor:  isDark ? "rgba(139,92,246,0.12)"  : "rgba(109,40,217,0.10)",
    focusRing:     "2px solid #a78bfa",
  };

  const animBase = {
    animation: open && !prefersReducedMotion
      ? `${fadeSlideUp} 0.35s cubic-bezier(0.16,1,0.3,1) both`
      : "none",
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullScreen={isFullScreen}
      maxWidth="xs"
      fullWidth
      aria-labelledby="auth-dialog-title"
      aria-describedby="auth-dialog-desc"
      PaperProps={{
        elevation: 0,
        sx: {
          borderRadius:  isFullScreen ? 0 : "20px",
          background:    t.bgGradient,
          border:        "1px solid",
          borderColor:   t.borderColor,
          boxShadow:     t.dialogShadow,
          overflow:      "hidden",
          willChange:    "transform, opacity",
        },
      }}
      slotProps={{
        backdrop: {
          sx: {
            backdropFilter:       "blur(10px) saturate(180%)",
            WebkitBackdropFilter: "blur(10px) saturate(180%)",
            backgroundColor:      t.backdropBg,
          },
        },
      }}
    >
      <DialogContent sx={{ px: { xs: 3, sm: 4 }, py: { xs: 4, sm: 4.5 }, textAlign: "center" }}>

        {/* ── Icon ──────────────────────────────────────────────────────── */}
        <Box
          aria-hidden="true"
          sx={{
            width:        68,
            height:       68,
            borderRadius: "50%",
            background:   "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
            display:      "flex",
            alignItems:   "center",
            justifyContent: "center",
            mx:           "auto",
            mb:           3,
            boxShadow:    "0 8px 28px rgba(109,40,217,0.45)",
            animation:    open && !prefersReducedMotion
              ? `${floatUp} 3.2s ease-in-out infinite`
              : "none",
            willChange:   "transform", // GPU layer — no layout thrash
          }}
        >
          <LockOutlined sx={{ color: "#fff", fontSize: 30 }} />
        </Box>

        {/* ── Title ─────────────────────────────────────────────────────── */}
        <Typography
          id="auth-dialog-title"
          component="h2"
          variant="h6"
          fontWeight={700}
          letterSpacing="-0.3px"
          sx={{
            mb:    1,
            color: t.titleColor,
            ...animBase,
            animationDelay: "0.05s",
          }}
        >
          {title}
        </Typography>

        {/* ── Description ───────────────────────────────────────────────── */}
        <Typography
          id="auth-dialog-desc"
          variant="body2"
          sx={{
            mb:         3.5,
            color:      t.descColor,
            lineHeight: 1.65,
            maxWidth:   "32ch",
            mx:         "auto",
            ...animBase,
            animationDelay: "0.10s",
          }}
        >
          {description}
        </Typography>

        {/* ── Buttons ───────────────────────────────────────────────────── */}
        <Stack spacing={1.5} sx={{ ...animBase, animationDelay: "0.15s" }}>

          {/* PRIMARY — Sign In */}
          <Button
            variant="contained"
            onClick={handleLogin}
            fullWidth
            size="large"
            disableElevation
            sx={{
              borderRadius: "12px",
              py:           1.3,
              fontWeight:   700,
              fontSize:     "0.95rem",
              letterSpacing: "0.01em",
              background:   "linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)",
              boxShadow:    "0 4px 18px rgba(109,40,217,0.40)",
              transition:   "transform 180ms cubic-bezier(0.16,1,0.3,1), box-shadow 180ms cubic-bezier(0.16,1,0.3,1)",
              "&:hover": {
                background:  "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
                boxShadow:   "0 6px 24px rgba(109,40,217,0.55)",
                transform:   "translateY(-2px)",
              },
              "&:active":      { transform: "translateY(0)" },
              "&:focus-visible": { outline: t.focusRing, outlineOffset: "3px" },
            }}
          >
            {loginLabel}
          </Button>

          {/* SECONDARY — Create Account */}
          <Button
            variant="outlined"
            onClick={handleRegister}
            fullWidth
            size="large"
            sx={{
              borderRadius:  "12px",
              py:            1.3,
              fontWeight:    600,
              fontSize:      "0.95rem",
              letterSpacing: "0.01em",
              borderColor:   isDark ? "rgba(139,92,246,0.45)" : "rgba(109,40,217,0.35)",
              color:         isDark ? "#a78bfa" : "#6d28d9",
              transition:    "transform 180ms cubic-bezier(0.16,1,0.3,1), box-shadow 180ms, border-color 180ms, background 180ms",
              "&:hover": {
                borderColor: isDark ? "#a78bfa" : "#6d28d9",
                background:  isDark ? "rgba(139,92,246,0.09)" : "rgba(109,40,217,0.07)",
                boxShadow:   "0 4px 14px rgba(109,40,217,0.15)",
                transform:   "translateY(-2px)",
              },
              "&:active":      { transform: "translateY(0)" },
              "&:focus-visible": { outline: t.focusRing, outlineOffset: "3px" },
            }}
          >
            {registerLabel}
          </Button>

          <Divider sx={{ borderColor: t.dividerColor }} />

          {/* GHOST — Cancel */}
          <Button
            variant="text"
            onClick={handleClose}
            fullWidth
            size="medium"
            sx={{
              borderRadius: "10px",
              py:           0.8,
              fontWeight:   500,
              fontSize:     "0.85rem",
              color:        isDark ? "rgba(196,181,253,0.5)" : "rgba(91,33,182,0.45)",
              transition:   "color 160ms ease, background 160ms ease",
              "&:hover": {
                color:      isDark ? "rgba(221,214,254,0.85)" : "rgba(91,33,182,0.8)",
                background: isDark ? "rgba(255,255,255,0.05)" : "rgba(109,40,217,0.05)",
              },
              "&:focus-visible": { outline: t.focusRing, outlineOffset: "3px" },
            }}
          >
            {cancelLabel}
          </Button>

        </Stack>
      </DialogContent>
    </Dialog>
  );
});

PublicAuthPromptDialog.displayName = "PublicAuthPromptDialog";

PublicAuthPromptDialog.propTypes = {
  open:          PropTypes.bool.isRequired,
  onClose:       PropTypes.func.isRequired,
  onLogin:       PropTypes.func.isRequired,
  onRegister:    PropTypes.func.isRequired,
  title:         PropTypes.string.isRequired,
  description:   PropTypes.string.isRequired,
  cancelLabel:   PropTypes.string,
  registerLabel: PropTypes.string,
  loginLabel:    PropTypes.string,
};

export default PublicAuthPromptDialog;