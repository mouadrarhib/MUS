// src/features/publicHome/components/PublicAuthPromptDialog.jsx
import { forwardRef, memo, useCallback } from "react";
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
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

// ─── Keyframes ─────────────────────────────────────────────────────────────────
// floatUp stays as a CSS keyframe — it's an *idle* loop on the icon,
// not a one-shot entry animation. CSS is the right tool for that.

const floatUp = keyframes`
  0%   { transform: translateY(0px);  }
  50%  { transform: translateY(-7px); }
  100% { transform: translateY(0px);  }
`;

// ─── Custom MUI Dialog transition (framer-motion) ─────────────────────────────
// MUI Dialog's TransitionComponent API: receives `in`, `onEnter`, `onEntered`,
// `onExit`, `onExited`. We wire those to framer-motion callbacks so MUI's
// internal state machine keeps working correctly (backdrop removal, focus trap
// cleanup, etc.).

const MotionDialogTransition = forwardRef(function MotionDialogTransition(
  { children, in: inProp, onEnter, onEntered, onExit, onExited },
  ref
) {
  return (
    <AnimatePresence onExitComplete={onExited}>
      {inProp && (
        <motion.div
          ref={ref}
          // Enter: scale from 0.94 + slight rise — feels like the dialog surfaces
          initial={{ opacity: 0, scale: 0.94, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          // Exit: quick fade-down — snappier than enter so it doesn't drag
          exit={{ opacity: 0, scale: 0.94, y: 10, transition: { duration: 0.16, ease: [0.4, 0, 1, 1] } }}
          transition={{ type: "spring", damping: 26, stiffness: 240 }}
          // Wire MUI lifecycle callbacks to framer-motion events
          onAnimationStart={(def) => { if (def === "animate") onEnter?.(); }}
          onAnimationComplete={(def) => { if (def === "animate") onEntered?.(); if (def === "exit") onExit?.(); }}
          // `display: contents` makes this div invisible to layout — the Paper
          // inside handles all sizing/positioning as normal.
          style={{ display: "contents" }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
});

// ─── Content stagger variants ──────────────────────────────────────────────────
// Each child inside DialogContent enters with a spring cascade.
// The icon gets a bounce scale (it's the focal point), everything else slides.

const makeContentContainer = (reduced) =>
  reduced
    ? { hidden: {}, show: {} }
    : { hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: 0.12 } } };

const makeContentItem = (reduced) =>
  reduced
    ? { hidden: { opacity: 1, y: 0 }, show: { opacity: 1, y: 0 } }
    : {
        hidden: { opacity: 0, y: 14 },
        show: { opacity: 1, y: 0, transition: { type: "spring", damping: 28, stiffness: 200 } },
      };

// The icon gets its own variant — scale bounce instead of translateY
const makeIconVariant = (reduced) =>
  reduced
    ? { hidden: { opacity: 1, scale: 1 }, show: { opacity: 1, scale: 1 } }
    : {
        hidden: { opacity: 0, scale: 0.55 },
        show: {
          opacity: 1, scale: 1,
          transition: { type: "spring", damping: 14, stiffness: 260, delay: 0.08 },
        },
      };

// ─── Component ────────────────────────────────────────────────────────────────

const PublicAuthPromptDialog = memo(({
  open,
  onClose,
  onLogin,
  onRegister,
  title,
  description,
  cancelLabel = "Cancel",
  registerLabel = "Create Account",
  loginLabel = "Sign In",
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const isFullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const reduced = useReducedMotion();

  // Stable callbacks — prevents unnecessary child re-renders
  const handleLogin    = useCallback(() => onLogin(),    [onLogin]);
  const handleRegister = useCallback(() => onRegister(), [onRegister]);
  const handleClose    = useCallback(() => onClose(),    [onClose]);

  // ── Design tokens ─────────────────────────────────────────────────────────
  const tok = {
    bgGradient: isDark
      ? "linear-gradient(160deg, #1e1a30 0%, #12101e 100%)"
      : "linear-gradient(160deg, #ffffff 0%, #f4f0ff 100%)",
    borderColor: isDark ? "rgba(139,92,246,0.18)" : "rgba(124,58,237,0.14)",
    dialogShadow: isDark ? "0 32px 80px rgba(0,0,0,0.65)" : "0 24px 72px rgba(109,40,217,0.18)",
    backdropBg: isDark ? "rgba(5,4,12,0.72)" : "rgba(60,40,140,0.14)",
    titleColor: isDark ? "#ede9fe" : "#2e1065",
    descColor: isDark ? "rgba(221,214,254,0.65)" : "rgba(76,29,149,0.65)",
    dividerColor: isDark ? "rgba(139,92,246,0.12)" : "rgba(109,40,217,0.10)",
    focusRing: "2px solid #a78bfa",
  };

  const contentContainer = makeContentContainer(reduced);
  const contentItem      = makeContentItem(reduced);
  const iconVariant      = makeIconVariant(reduced);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullScreen={isFullScreen}
      // Hand animation control entirely to MotionDialogTransition
      TransitionComponent={MotionDialogTransition}
      // transitionDuration={0} is NOT needed — MotionDialogTransition controls timing
      maxWidth="xs"
      fullWidth
      aria-labelledby="auth-dialog-title"
      aria-describedby="auth-dialog-desc"
      slotProps={{
        backdrop: {
          sx: {
            bgcolor: tok.backdropBg,
            backdropFilter: "blur(6px)",
          },
        },
      }}
      PaperProps={{
        elevation: 0,
        sx: {
          background: tok.bgGradient,
          border: "1px solid",
          borderColor: tok.borderColor,
          boxShadow: tok.dialogShadow,
          borderRadius: isFullScreen ? 0 : "20px",
          overflow: "hidden",
          "&:focus-visible": { outline: tok.focusRing },
        },
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: { xs: 3, sm: 4 } }}>

          {/* ── Staggered content container ─────────────────────────────── */}
          <motion.div
            variants={contentContainer}
            initial="hidden"
            animate="show"
          >

            {/* ── Icon ──────────────────────────────────────────────────── */}
            <motion.div variants={iconVariant} style={{ display: "flex", justifyContent: "center" }}>
              <Box
                sx={{
                  width: 64, height: 64,
                  borderRadius: "18px",
                  bgcolor: isDark ? "rgba(139,92,246,0.14)" : "rgba(124,58,237,0.10)",
                  border: "1px solid",
                  borderColor: isDark ? "rgba(139,92,246,0.30)" : "rgba(124,58,237,0.22)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 3,
                  // Idle float — CSS keyframe is the right tool here (continuous loop)
                  animation: reduced
                    ? "none"
                    : `${floatUp} 3.2s ease-in-out infinite`,
                }}
              >
                <LockOutlined sx={{ fontSize: 28, color: isDark ? "#c4b5fd" : "#7c3aed" }} />
              </Box>
            </motion.div>

            {/* ── Title ─────────────────────────────────────────────────── */}
            <motion.div variants={contentItem}>
              <Typography
                id="auth-dialog-title"
                variant="h6"
                sx={{
                  fontWeight: 700,
                  fontSize: "1.2rem",
                  letterSpacing: "-0.01em",
                  color: tok.titleColor,
                  mb: 1,
                  textAlign: "center",
                }}
              >
                {title}
              </Typography>
            </motion.div>

            {/* ── Description ───────────────────────────────────────────── */}
            <motion.div variants={contentItem}>
              <Typography
                id="auth-dialog-desc"
                sx={{
                  fontSize: "0.9rem",
                  color: tok.descColor,
                  lineHeight: 1.65,
                  textAlign: "center",
                  maxWidth: "34ch",
                  mx: "auto",
                  mb: 3.5,
                }}
              >
                {description}
              </Typography>
            </motion.div>

            {/* ── Divider ───────────────────────────────────────────────── */}
            <motion.div variants={contentItem}>
              <Divider sx={{ borderColor: tok.dividerColor, mb: 3 }} />
            </motion.div>

            {/* ── Buttons ───────────────────────────────────────────────── */}
            <Stack spacing={1.5}>

              {/* PRIMARY — Sign In */}
              <motion.div
                variants={contentItem}
                // Micro-interaction: button physically lifts on hover, pushes on tap
                whileHover={reduced ? {} : { scale: 1.025, y: -1, transition: { type: "spring", damping: 25, stiffness: 300 } }}
                whileTap={reduced ? {} : { scale: 0.975 }}
              >
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleLogin}
                  sx={{
                    borderRadius: "12px",
                    py: 1.2,
                    fontWeight: 700,
                    fontSize: "0.9375rem",
                    textTransform: "none",
                    letterSpacing: "0",
                    background: isDark
                      ? "linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)"
                      : "linear-gradient(135deg, #6d28d9 0%, #4c1d95 100%)",
                    boxShadow: isDark
                      ? "0 4px 14px rgba(109,40,217,0.35)"
                      : "0 4px 14px rgba(109,40,217,0.25)",
                    transition: "box-shadow 180ms cubic-bezier(0.16,1,0.3,1)",
                    "&:hover": {
                      background: isDark
                        ? "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)"
                        : "linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)",
                      boxShadow: isDark
                        ? "0 6px 20px rgba(124,92,252,0.45)"
                        : "0 6px 20px rgba(109,40,217,0.35)",
                    },
                    "&:focus-visible": { outline: tok.focusRing, outlineOffset: 2 },
                  }}
                >
                  {loginLabel}
                </Button>
              </motion.div>

              {/* SECONDARY — Create Account */}
              <motion.div
                variants={contentItem}
                whileHover={reduced ? {} : { scale: 1.02, y: -1, transition: { type: "spring", damping: 25, stiffness: 300 } }}
                whileTap={reduced ? {} : { scale: 0.978 }}
              >
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={handleRegister}
                  sx={{
                    borderRadius: "12px",
                    py: 1.2,
                    fontWeight: 600,
                    fontSize: "0.9375rem",
                    textTransform: "none",
                    letterSpacing: "0",
                    borderColor: isDark ? "rgba(139,92,246,0.35)" : "rgba(124,58,237,0.30)",
                    color: isDark ? "#c4b5fd" : "#6d28d9",
                    bgcolor: isDark ? "rgba(139,92,246,0.07)" : "rgba(124,58,237,0.04)",
                    transition: "border-color 180ms cubic-bezier(0.16,1,0.3,1), background 180ms cubic-bezier(0.16,1,0.3,1), box-shadow 180ms cubic-bezier(0.16,1,0.3,1)",
                    "&:hover": {
                      borderColor: isDark ? "rgba(167,139,250,0.55)" : "rgba(109,40,217,0.50)",
                      bgcolor: isDark ? "rgba(139,92,246,0.12)" : "rgba(109,40,217,0.07)",
                      boxShadow: isDark ? "0 4px 14px rgba(124,92,252,0.20)" : "0 4px 14px rgba(109,40,217,0.14)",
                    },
                    "&:focus-visible": { outline: tok.focusRing, outlineOffset: 2 },
                  }}
                >
                  {registerLabel}
                </Button>
              </motion.div>

              {/* GHOST — Cancel */}
              <motion.div variants={contentItem}>
                <Button
                  fullWidth
                  variant="text"
                  onClick={handleClose}
                  sx={{
                    borderRadius: "12px",
                    py: 0.9,
                    fontWeight: 500,
                    fontSize: "0.875rem",
                    textTransform: "none",
                    color: isDark ? "rgba(200,190,255,0.50)" : "rgba(109,40,217,0.45)",
                    transition: "color 160ms ease, background 160ms ease",
                    "&:hover": {
                      color: isDark ? "rgba(200,190,255,0.75)" : "rgba(109,40,217,0.70)",
                      bgcolor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
                    },
                    "&:focus-visible": { outline: tok.focusRing, outlineOffset: 2 },
                  }}
                >
                  {cancelLabel}
                </Button>
              </motion.div>

            </Stack>
          </motion.div>

        </Box>
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