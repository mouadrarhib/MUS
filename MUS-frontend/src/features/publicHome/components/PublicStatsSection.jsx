import { memo, useEffect, useRef, useState } from "react";
import { Box, Stack, Typography, useMediaQuery } from "@mui/material";
import { Description, AccountBalance, Group } from "@mui/icons-material";
import { useLanguage } from "@/app/providers/LanguageContext";

// ─── Stats data (icons as component refs, not JSX — no re-creation on render) ─

const STATS = [
  {
    id:          "resources",
    count:       50,
    suffix:      "M+",
    titleKey:    "publicHome.stats.items.resources.title",
    chipKey:     "publicHome.stats.items.resources.chip",
    Icon:        Description,
    accent:      "#7c5cfc",
    iconBg:      "rgba(124,92,252,0.13)",
    chipBg:      "rgba(124,92,252,0.11)",
    chipBorder:  "rgba(124,92,252,0.35)",
    glowColor:   "rgba(124,92,252,0.20)",
  },
  {
    id:          "institutions",
    count:       120,
    suffix:      "K+",
    titleKey:    "publicHome.stats.items.institutions.title",
    chipKey:     "publicHome.stats.items.institutions.chip",
    Icon:        AccountBalance,
    accent:      "#10b981",
    iconBg:      "rgba(16,185,129,0.12)",
    chipBg:      "rgba(16,185,129,0.10)",
    chipBorder:  "rgba(16,185,129,0.35)",
    glowColor:   "rgba(16,185,129,0.18)",
  },
  {
    id:          "users",
    count:       60,
    suffix:      "M+",
    titleKey:    "publicHome.stats.items.users.title",
    chipKey:     "publicHome.stats.items.users.chip",
    Icon:        Group,
    accent:      "#f59e0b",
    iconBg:      "rgba(245,158,11,0.12)",
    chipBg:      "rgba(245,158,11,0.10)",
    chipBorder:  "rgba(245,158,11,0.35)",
    glowColor:   "rgba(245,158,11,0.18)",
  },
];

// ─── Hook: count-up animation (fires once when triggered) ─────────────────────

function useCountUp(target, { duration = 1800, enabled = true } = {}) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!enabled) { setValue(target); return; }

    let start      = null;
    let rafId;

    const step = (timestamp) => {
      if (!start) start = timestamp;
      const elapsed  = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic for natural deceleration
      const eased    = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * target));
      if (progress < 1) rafId = requestAnimationFrame(step);
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [target, duration, enabled]);

  return value;
}

// ─── Single stat card ─────────────────────────────────────────────────────────

const StatCard = memo(({ item, active, reducedMotion, t, isDark }) => {
  const displayValue = useCountUp(item.count, {
    duration:  1600,
    enabled:   active && !reducedMotion,
  });

  const shown = reducedMotion ? item.count : displayValue;

  return (
    <Box
      sx={{
        flex:           "1 1 260px",
        minWidth:       0,
        position:       "relative",
        borderRadius:   "20px",
        border:         "1px solid",
        borderColor:    isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)",
        background:     isDark
          ? "linear-gradient(155deg, rgba(255,255,255,0.045) 0%, rgba(255,255,255,0.02) 100%)"
          : "rgba(255,255,255,0.90)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        boxShadow:      isDark
          ? "0 2px 24px rgba(0,0,0,0.35)"
          : "0 4px 28px rgba(20,20,60,0.07)",
        px:             { xs: 3, md: 3.5 },
        pt:             { xs: 3.2, md: 3.8 },
        pb:             { xs: 3,   md: 3.5 },
        overflow:       "hidden",
        willChange:     "transform",  // GPU layer — no layout thrash on hover
        transition:     "transform 200ms cubic-bezier(0.16,1,0.3,1), box-shadow 200ms cubic-bezier(0.16,1,0.3,1)",
        "&:hover": {
          transform:  "translateY(-5px)",
          boxShadow:  isDark
            ? `0 16px 48px rgba(0,0,0,0.50), 0 0 0 1px ${item.glowColor}`
            : `0 16px 48px rgba(20,20,60,0.13), 0 0 0 1px ${item.glowColor}`,
        },
      }}
    >
      {/* ── Accent stripe (top) ───────────────────────────────────────── */}
      <Box
        aria-hidden="true"
        sx={{
          position:     "absolute",
          top:          0,
          left:         0,
          right:        0,
          height:       "3px",
          borderRadius: "20px 20px 0 0",
          background:   `linear-gradient(90deg, ${item.accent}, transparent)`,
        }}
      />

      {/* ── Soft radial glow behind icon ──────────────────────────────── */}
      <Box
        aria-hidden="true"
        sx={{
          position:   "absolute",
          top:        -20,
          right:      -20,
          width:      120,
          height:     120,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${item.glowColor} 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      {/* ── Icon ──────────────────────────────────────────────────────── */}
      <Box
        sx={{
          width:        46,
          height:       46,
          borderRadius: "12px",
          background:   item.iconBg,
          display:      "flex",
          alignItems:   "center",
          justifyContent: "center",
          mb:           2.5,
        }}
      >
        <item.Icon sx={{ color: item.accent, fontSize: 24 }} />
      </Box>

      {/* ── Animated number ───────────────────────────────────────────── */}
      <Typography
        component="p"
        sx={{
          fontWeight:   800,
          fontSize:     { xs: "2.6rem", md: "3rem" },
          lineHeight:   1,
          letterSpacing: "-1.5px",
          color:        isDark ? "#f7f3ff" : "#0d0b1a",
          fontVariantNumeric: "tabular-nums",
          mb:           0.75,
        }}
      >
        {shown}
        <Box
          component="span"
          sx={{ fontSize: "1.5rem", fontWeight: 700, color: item.accent, ml: 0.5 }}
        >
          {item.suffix}
        </Box>
      </Typography>

      {/* ── Label ─────────────────────────────────────────────────────── */}
      <Typography
        variant="body1"
        fontWeight={600}
        sx={{
          color: isDark ? "rgba(232,224,255,0.90)" : "#1a1d2e",
          mb:    1.5,
          fontSize: { xs: "0.95rem", md: "1rem" },
        }}
      >
        {t(item.titleKey, "")}
      </Typography>

      {/* ── Chip pill ─────────────────────────────────────────────────── */}
      <Box
        component="span"
        sx={{
          display:      "inline-flex",
          alignItems:   "center",
          px:           1.5,
          py:           0.45,
          borderRadius: "999px",
          fontSize:     "0.75rem",
          fontWeight:   600,
          letterSpacing: "0.02em",
          background:   item.chipBg,
          border:       "1px solid",
          borderColor:  item.chipBorder,
          color:        item.accent,
        }}
      >
        {t(item.chipKey, "")}
      </Box>
    </Box>
  );
});

StatCard.displayName = "StatCard";

// ─── Main section ─────────────────────────────────────────────────────────────

const PublicStatsSection = memo(() => {
  const { t }             = useLanguage();
  const sectionRef        = useRef(null);
  const [active, setActive] = useState(false);
  const reducedMotion     = useMediaQuery("(prefers-reduced-motion: reduce)");
  // useTheme() alternative — read via sx callback to avoid extra re-render
  const isDarkQuery        = useMediaQuery("(prefers-color-scheme: dark)");

  // Trigger count-up once when section scrolls into view
  useEffect(() => {
    if (reducedMotion) { setActive(true); return; }

    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setActive(true); observer.disconnect(); } },
      { threshold: 0.25 }
    );

    const el = sectionRef.current;
    if (el) observer.observe(el);
    return () => observer.disconnect();
  }, [reducedMotion]);

  return (
    <Box
      ref={sectionRef}
      component="section"
      aria-label="Platform statistics"
      sx={{
        position:   "relative",
        py:         { xs: 8, md: 12 },
        px:         { xs: 2, sm: 4, md: 8 },
        background: (theme) =>
          theme.palette.mode === "dark"
            ? "linear-gradient(160deg, #100d1f 0%, #16121f 60%, #0d1019 100%)"
            : "linear-gradient(160deg, #f0eeff 0%, #eef2f9 55%, #e8f0ff 100%)",
        overflow: "hidden",
      }}
    >
      {/* ── Background radial spotlight ─────────────────────────────── */}
      <Box
        aria-hidden="true"
        sx={{
          position:   "absolute",
          inset:      0,
          background: (theme) =>
            theme.palette.mode === "dark"
              ? "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(124,92,252,0.12) 0%, transparent 70%)"
              : "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(124,92,252,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <Box sx={{ position: "relative", maxWidth: 1100, mx: "auto" }}>

        {/* ── Section header ──────────────────────────────────────────── */}
        <Stack spacing={2} alignItems="center" textAlign="center" sx={{ mb: { xs: 6, md: 8 } }}>
          <Typography
            component="h2"
            sx={{
              fontWeight:   800,
              fontSize:     { xs: "1.9rem", sm: "2.4rem", md: "2.9rem" },
              lineHeight:   1.15,
              letterSpacing: "-0.5px",
              color:        (theme) =>
                theme.palette.mode === "dark" ? "#f7f5ff" : "#0d0b1a",
              maxWidth:     "22ch",
            }}
          >
            {t("publicHome.stats.title", "Over 1 billion students helped, and counting")}
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color:      (theme) =>
                theme.palette.mode === "dark"
                  ? "rgba(235,228,255,0.70)"
                  : "#4a5068",
              fontSize:   { xs: "1rem", md: "1.15rem" },
              maxWidth:   "58ch",
              lineHeight: 1.65,
            }}
          >
            {t(
              "publicHome.stats.subtitle",
              "50K new study notes added every day, from the world's most active student communities"
            )}
          </Typography>
        </Stack>

        {/* ── Stat cards ──────────────────────────────────────────────── */}
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={{ xs: 2.5, md: 3 }}
          justifyContent="center"
          alignItems={{ xs: "stretch", md: "stretch" }}
        >
          {STATS.map((item) => (
            <StatCard
              key={item.id}
              item={item}
              active={active}
              reducedMotion={reducedMotion}
              t={t}
              isDark={isDarkQuery}
            />
          ))}
        </Stack>

      </Box>
    </Box>
  );
});

PublicStatsSection.displayName = "PublicStatsSection";

export default PublicStatsSection;