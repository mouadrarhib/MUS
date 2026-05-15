import { memo } from "react";
import { Box, Button, Chip, Stack, Typography } from "@mui/material";
import { CheckCircleOutline, ArrowForward, AutoAwesome } from "@mui/icons-material";
import { keyframes } from "@mui/system";

const floatAnim = keyframes`
  0%   { transform: translateY(0px)  rotate(0deg);   }
  50%  { transform: translateY(-7px) rotate(1.5deg); }
  100% { transform: translateY(0px)  rotate(0deg);   }
`;
const pulseRing = keyframes`
  0%   { transform: scale(1);    opacity: 0.55; }
  65%  { transform: scale(1.42); opacity: 0;    }
  100% { transform: scale(1.42); opacity: 0;    }
`;
const shimmerSlide = keyframes`
  0%   { background-position: -200% 0; }
  100% { background-position:  200% 0; }
`;
const gradientShift = keyframes`
  0%   { background-position: 0%   50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0%   50%; }
`;

// Default accent so the card never crashes even if accent is missing
const DEFAULT_ACCENT = {
  color: "#7c5cfc", bg: "rgba(124,92,252,0.10)", border: "rgba(124,92,252,0.28)",
  glow: "rgba(124,92,252,0.22)", gradient: "linear-gradient(135deg,#7c3aed 0%,#5b21b6 60%,#4c1d95 100%)",
};

const PublicRoleCard = memo(({ pillar, t, isDark, reducedMotion }) => {
  // ── Safety guard — if pillar is somehow undefined, render nothing ──────────
  if (!pillar) return null;

  const {
    Icon, SubIcon,
    accent = DEFAULT_ACCENT,     // fallback accent if not provided
    badge, badgeFallback,
    titleKey, title,
    descKey, desc,
    stat, ctaKey, ctaFallback = "Learn more",
    features = [],
  } = pillar;

  // Guarantee accent always has all required fields
  const safeAccent = { ...DEFAULT_ACCENT, ...accent };

  return (
    <Box
      data-role-card
      sx={{
        display: "flex",
        flexDirection: "column",
        borderRadius: "24px",
        overflow: "hidden",
        willChange: "transform",
        transition: "transform 260ms cubic-bezier(0.16,1,0.3,1), box-shadow 260ms cubic-bezier(0.16,1,0.3,1)",
        "&:hover": {
          transform: "translateY(-8px)",
          boxShadow: isDark
            ? `0 28px 60px rgba(0,0,0,0.55), 0 0 0 1px ${safeAccent.border}`
            : `0 28px 60px ${safeAccent.glow}, 0 0 0 1px ${safeAccent.border}`,
          "& .card-cta-arrow":      { transform: "translateX(4px)" },
          "& .card-header-shimmer": { opacity: 1 },
        },
      }}
    >
      {/* ── Gradient header — flex-shrink:0 keeps height identical per row ── */}
      <Box sx={{
        position: "relative", flexShrink: 0,
        px: 3.5, pt: 3.5, pb: 4,
        background: safeAccent.gradient,
        backgroundSize: "200% 200%",
        animation: reducedMotion ? "none" : `${gradientShift} 6s ease infinite`,
        overflow: "hidden",
      }}>
        {/* Shimmer on hover */}
        <Box className="card-header-shimmer" sx={{
          position: "absolute", inset: 0, opacity: 0, pointerEvents: "none",
          background: "linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.13) 50%,transparent 60%)",
          backgroundSize: "200% 100%",
          animation: reducedMotion ? "none" : `${shimmerSlide} 1.4s ease infinite`,
          transition: "opacity 300ms ease",
        }} />
        {/* Decorative blobs */}
        <Box aria-hidden="true" sx={{ position:"absolute", top:-30, right:-30, width:120, height:120, borderRadius:"50%", background:"rgba(255,255,255,0.08)", pointerEvents:"none" }} />
        <Box aria-hidden="true" sx={{ position:"absolute", bottom:-18, right:36, width:64, height:64, borderRadius:"50%", background:"rgba(255,255,255,0.06)", pointerEvents:"none" }} />

        {/* Badge — only renders when badge text exists */}
        {(badge || badgeFallback) && (
          <Chip
            icon={<AutoAwesome sx={{ fontSize:"12px !important", color:"rgba(255,255,255,0.85) !important" }} />}
            label={t ? t(badge ?? "", badgeFallback ?? "") : badgeFallback}
            size="small"
            sx={{
              mb:2.5, height:24, fontSize:"0.68rem", fontWeight:700,
              letterSpacing:"0.07em", borderRadius:"8px",
              background:"rgba(255,255,255,0.18)", border:"1px solid rgba(255,255,255,0.30)",
              color:"#fff", backdropFilter:"blur(6px)",
              "& .MuiChip-label":{ px:1.25 }, "& .MuiChip-icon":{ ml:1 },
            }}
          />
        )}

        {/* Floating icon with pulse ring */}
        <Box sx={{ position:"relative", width:60, height:60, mb:2 }}>
          <Box aria-hidden="true" sx={{
            position:"absolute", inset:0, borderRadius:"50%",
            border:"2px solid rgba(255,255,255,0.50)",
            animation: reducedMotion ? "none" : `${pulseRing} 2.4s ease-out infinite`,
          }} />
          <Box sx={{
            width:60, height:60, borderRadius:"16px",
            background:"rgba(255,255,255,0.22)", backdropFilter:"blur(8px)",
            border:"1px solid rgba(255,255,255,0.35)",
            display:"flex", alignItems:"center", justifyContent:"center",
            animation: reducedMotion ? "none" : `${floatAnim} 4s ease-in-out infinite`,
          }}>
            {Icon && <Icon sx={{ color:"#fff", fontSize:28 }} />}
          </Box>
        </Box>

        {/* Title */}
        <Typography component="h3" sx={{
          fontWeight: (t) => t.typography.fontWeightExtraBold, lineHeight:1.25,
          fontSize:{ xs:"1.15rem", md:"1.25rem" },
          letterSpacing:"-0.3px", color:"#fff",
        }}>
          {t ? t(titleKey ?? "", title ?? "") : (title ?? "")}
        </Typography>
      </Box>

      {/* ── Body — flex:1 stretches to fill row height ─────────────────────── */}
      <Box sx={{
        flex: 1, display: "flex", flexDirection: "column",
        p: { xs:3, md:3.5 },
        background: isDark
          ? "linear-gradient(180deg,rgba(255,255,255,0.04) 0%,rgba(255,255,255,0.02) 100%)"
          : "#fff",
        border: "1px solid", borderTop: "none",
        borderColor: 'var(--border)',
        borderRadius: "0 0 24px 24px",
      }}>

        {/* Description */}
        <Typography variant="body2" sx={{
          color: isDark ? "rgba(220,212,248,0.70)" : "#576071",
          lineHeight:1.75, fontSize:"0.875rem", mb:3,
        }}>
          {t ? t(descKey ?? "", desc ?? "") : (desc ?? "")}
        </Typography>

        {/* Features checklist — only shown when features array has items */}
        {features.length > 0 && (
          <Stack spacing={1.4} sx={{ mb:3.5 }}>
            {features.map((f, i) => (
              <Stack key={f?.key ?? f?.fallback ?? i} data-feature-item direction="row" spacing={1.5} alignItems="flex-start">
                <Box sx={{
                  width:20, height:20, borderRadius:"6px", flexShrink:0,
                  background:safeAccent.bg, border:"1px solid", borderColor:safeAccent.border,
                  display:"flex", alignItems:"center", justifyContent:"center", mt:"1px",
                }}>
                  <CheckCircleOutline aria-hidden="true" sx={{ fontSize:13, color:safeAccent.color }} />
                </Box>
                <Typography variant="body2" sx={{
                  fontSize:"0.84rem", fontWeight:500, lineHeight:1.5,
                  color: isDark ? "rgba(220,212,248,0.82)" : "#374151",
                }}>
                  {t ? t(f?.key ?? "", f?.fallback ?? "") : (f?.fallback ?? "")}
                </Typography>
              </Stack>
            ))}
          </Stack>
        )}

        {/* Spacer — pushes stat/CTA to the bottom of every card equally */}
        <Box sx={{ flex:1 }} />

        {/* Divider */}
        <Box sx={{
          height:"1px", mb:3,
          background: isDark
            ? "rgba(255,255,255,0.07)"
            : `linear-gradient(90deg,${safeAccent.border},transparent)`,
        }} />

        {/* Stat + CTA — always pinned to the bottom */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          {stat && (
            <Stack direction="row" spacing={1} alignItems="center">
              {SubIcon && (
                <Box sx={{
                  width:30, height:30, borderRadius:"8px",
                  background:safeAccent.bg, border:"1px solid", borderColor:safeAccent.border,
                  display:"flex", alignItems:"center", justifyContent:"center",
                }}>
                  <SubIcon sx={{ fontSize:15, color:safeAccent.color }} />
                </Box>
              )}
              <Box>
                <Typography sx={{
                  fontWeight: (t) => t.typography.fontWeightExtraBold, fontSize:"1rem", lineHeight:1,
                  color: isDark ? "#f0ecff" : "#0f0d1c",
                  fontVariantNumeric:"tabular-nums",
                }}>
                  {t ? t(stat.valueKey ?? "", stat.value ?? "") : (stat.value ?? "")}
                </Typography>
                <Typography sx={{
                  fontSize:"0.7rem", fontWeight:500, lineHeight:1.2,
                  color: isDark ? "rgba(200,190,255,0.50)" : "rgba(80,70,140,0.55)",
                }}>
                  {t ? t(stat.labelKey ?? "", stat.label ?? "") : (stat.label ?? "")}
                </Typography>
              </Box>
            </Stack>
          )}
          <Button
            size="small"
            endIcon={
              <ArrowForward className="card-cta-arrow" sx={{
                fontSize:"14px !important",
                transition:"transform 200ms cubic-bezier(0.16,1,0.3,1)",
              }} />
            }
            sx={{
              ml: stat ? 0 : "auto",    /* right-align CTA when no stat */
              borderRadius:"10px", px:2, py:0.9,
              fontSize:"0.82rem", fontWeight:700,
              background:safeAccent.bg, border:"1px solid", borderColor:safeAccent.border,
              color:safeAccent.color,
              transition:"box-shadow 200ms ease",
              "&:hover":{ boxShadow:`0 4px 14px ${safeAccent.glow}` },
            }}
          >
            {t ? t(ctaKey ?? "", ctaFallback) : ctaFallback}
          </Button>
        </Stack>
      </Box>
    </Box>
  );
});

PublicRoleCard.displayName = "PublicRoleCard";
export default PublicRoleCard;