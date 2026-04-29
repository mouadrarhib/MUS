import { memo, useEffect, useMemo, useRef } from "react";
import { Box, Stack, Typography, useMediaQuery } from "@mui/material";
import {
  SchoolOutlined, CastForEducationOutlined, AdminPanelSettingsOutlined,
  LibraryBooksOutlined, TrendingUpOutlined, ShieldOutlined,
} from "@mui/icons-material";
import { useLanguage } from "@/app/providers/LanguageContext";
import { keyframes } from "@mui/system";
import PublicRoleCard from "@/features/publicHome/components/PublicRoleCard";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger.js";

gsap.registerPlugin(ScrollTrigger);

const pulseRing = keyframes`
  0%   { transform: scale(1);    opacity: 0.55; }
  65%  { transform: scale(1.42); opacity: 0;    }
  100% { transform: scale(1.42); opacity: 0;    }
`;

const ACCENT_COLORS = [
  { color:"#7c5cfc", light:"#a78bfa", bg:"rgba(124,92,252,0.10)",  border:"rgba(124,92,252,0.28)",  glow:"rgba(124,92,252,0.22)",  gradient:"linear-gradient(135deg,#7c3aed 0%,#5b21b6 60%,#4c1d95 100%)" },
  { color:"#10b981", light:"#34d399", bg:"rgba(16,185,129,0.10)",  border:"rgba(16,185,129,0.28)",  glow:"rgba(16,185,129,0.20)",  gradient:"linear-gradient(135deg,#059669 0%,#047857 60%,#065f46 100%)" },
  { color:"#3b82f6", light:"#60a5fa", bg:"rgba(59,130,246,0.10)",  border:"rgba(59,130,246,0.28)",  glow:"rgba(59,130,246,0.20)",  gradient:"linear-gradient(135deg,#2563eb 0%,#1d4ed8 60%,#1e3a8a 100%)" },
  { color:"#f59e0b", light:"#fcd34d", bg:"rgba(245,158,11,0.10)",  border:"rgba(245,158,11,0.28)",  glow:"rgba(245,158,11,0.20)",  gradient:"linear-gradient(135deg,#d97706 0%,#b45309 60%,#92400e 100%)" },
  { color:"#ec4899", light:"#f9a8d4", bg:"rgba(236,72,153,0.10)",  border:"rgba(236,72,153,0.28)",  glow:"rgba(236,72,153,0.20)",  gradient:"linear-gradient(135deg,#db2777 0%,#be185d 60%,#9d174d 100%)" },
  { color:"#06b6d4", light:"#67e8f9", bg:"rgba(6,182,212,0.10)",   border:"rgba(6,182,212,0.28)",   glow:"rgba(6,182,212,0.18)",   gradient:"linear-gradient(135deg,#0891b2 0%,#0e7490 60%,#155e75 100%)" },
];

// ─── Default pillars ──────────────────────────────────────────────────────────
// Used when no `pillars` prop is passed, OR when the passed array is empty.
// Items from content.js (musRolePillars) use `icon` + `descriptionKey` —
// the normalization in activePillars handles both shapes automatically.
const DEFAULT_PILLARS = [
  {
    id:"student", Icon:SchoolOutlined, SubIcon:LibraryBooksOutlined, accent:ACCENT_COLORS[0],
    badge:"publicHome.role.student.badge", badgeFallback:"Student",
    titleKey:"publicHome.role.student.title", title:"Learn smarter, discover faster",
    descKey:"publicHome.role.student.desc",
    desc:"Access thousands of curated notes, past exams, and summaries.",
    stat:{ valueKey:"publicHome.role.student.stat.value", value:"50M+", labelKey:"publicHome.role.student.stat.label", label:"Resources available" },
    ctaKey:"publicHome.role.student.cta", ctaFallback:"Start learning",
    features:[
      { key:"publicHome.role.student.f1", fallback:"Browse & download notes, exams & summaries" },
      { key:"publicHome.role.student.f2", fallback:"AI-powered personalized recommendations"    },
      { key:"publicHome.role.student.f3", fallback:"Save to favorites, rate & review content"   },
      { key:"publicHome.role.student.f4", fallback:"Premium membership for exclusive resources"  },
    ],
  },
  {
    id:"teacher", Icon:CastForEducationOutlined, SubIcon:TrendingUpOutlined, accent:ACCENT_COLORS[1],
    badge:"publicHome.role.teacher.badge", badgeFallback:"Teacher",
    titleKey:"publicHome.role.teacher.title", title:"Share knowledge, track engagement",
    descKey:"publicHome.role.teacher.desc",
    desc:"Publish and organize academic resources by module and program.",
    stat:{ valueKey:"publicHome.role.teacher.stat.value", value:"120K+", labelKey:"publicHome.role.teacher.stat.label", label:"Institutions worldwide" },
    ctaKey:"publicHome.role.teacher.cta", ctaFallback:"Start publishing",
    features:[
      { key:"publicHome.role.teacher.f1", fallback:"Upload notes, exams & course summaries" },
      { key:"publicHome.role.teacher.f2", fallback:"Organize by module, level & program"    },
      { key:"publicHome.role.teacher.f3", fallback:"Real-time download & rating analytics"  },
      { key:"publicHome.role.teacher.f4", fallback:"Wallet earnings from premium content"   },
    ],
  },
  {
    id:"admin", Icon:AdminPanelSettingsOutlined, SubIcon:ShieldOutlined, accent:ACCENT_COLORS[2],
    badge:"publicHome.role.admin.badge", badgeFallback:"Administrator",
    titleKey:"publicHome.role.admin.title", title:"Govern with full visibility",
    descKey:"publicHome.role.admin.desc",
    desc:"Oversee every layer of the platform in one dashboard.",
    stat:{ valueKey:"publicHome.role.admin.stat.value", value:"100%", labelKey:"publicHome.role.admin.stat.label", label:"Platform control" },
    ctaKey:"publicHome.role.admin.cta", ctaFallback:"Access dashboard",
    features:[
      { key:"publicHome.role.admin.f1", fallback:"Content moderation & verification queue" },
      { key:"publicHome.role.admin.f2", fallback:"Full user management with RBAC"          },
      { key:"publicHome.role.admin.f3", fallback:"Academic catalog management"             },
      { key:"publicHome.role.admin.f4", fallback:"Platform analytics, wallet & engagement" },
    ],
  },
];

// ─── Section ──────────────────────────────────────────────────────────────────

const PublicRoleSection = memo(({ pillars }) => {
  const { t }         = useLanguage();
  const sectionRef    = useRef(null);
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const isDark        = useMediaQuery("(prefers-color-scheme: dark)");

  const activePillars = useMemo(() => {
    const source = Array.isArray(pillars) && pillars.length > 0 ? pillars : DEFAULT_PILLARS;
    return source
      .filter(Boolean)                     // ← remove any null / undefined items
      .map((p, idx) => ({
        ...p,
        // Normalize Icon: support both `Icon` (component) and `icon` (lowercase from content.js)
        Icon:        p.Icon        ?? p.icon           ?? null,
        SubIcon:     p.SubIcon                         ?? null,
        // Normalize description key: support both `descKey` and `descriptionKey`
        descKey:     p.descKey     ?? p.descriptionKey ?? null,
        desc:        p.desc        ?? p.description    ?? "",
        // Normalize title fallback
        title:       p.title                           ?? "",
        // Provide accent from palette if missing
        accent:      p.accent?.border ? p.accent : ACCENT_COLORS[idx % ACCENT_COLORS.length],
        // Provide safe defaults for optional fields
        features:    Array.isArray(p.features) ? p.features : [],
        stat:        p.stat        ?? null,
        badge:       p.badge       ?? null,
        badgeFallback: p.badgeFallback ?? null,
        ctaKey:      p.ctaKey      ?? null,
        ctaFallback: p.ctaFallback ?? "Learn more",
        id:          p.id          ?? p.titleKey ?? p.title ?? String(idx),
      }));
  }, [pillars]);

  useEffect(() => {
    if (reducedMotion || !sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(["[data-role-eyebrow]","[data-role-title]","[data-role-desc]"], {
        opacity:0, y:20, stagger:0.08, duration:0.65, ease:"power3.out",
        scrollTrigger:{ trigger:"[data-role-title]", start:"top 88%", toggleActions:"play none none reverse" },
      });
      gsap.from("[data-role-card]", {
        opacity:0, y:40, scale:0.95, duration:0.7, ease:"power3.out",
        scrollTrigger:{ trigger:"[data-role-card]", start:"top 90%", toggleActions:"play none none reverse" },
      });
      gsap.utils.toArray("[data-role-card]").forEach((card) => {
        gsap.from(card.querySelectorAll("[data-feature-item]"), {
          opacity:0, y:10, stagger:0.06, duration:0.35, delay:0.3, ease:"power2.out",
          scrollTrigger:{ trigger:card, start:"top 88%", toggleActions:"play none none reverse" },
        });
      });
    }, sectionRef);
    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <Box
      ref={sectionRef}
      component="section"
      aria-labelledby="role-section-title"
      sx={{
        position:"relative", overflow:"hidden",
        py:{ xs:10, md:14 },
        px:{ xs:2, sm:4, md:8 },
        background:(theme) =>
          theme.palette.mode === "dark"
            ? "linear-gradient(160deg,#0b0918 0%,#0f0c1d 40%,#0c0f1a 100%)"
            : "linear-gradient(160deg,#f0eeff 0%,#f3f4f8 55%,#eaefff 100%)",
      }}
    >
      <Box aria-hidden="true" sx={{
        position:"absolute", inset:0, pointerEvents:"none",
        background:(theme) =>
          theme.palette.mode === "dark"
            ? "radial-gradient(ellipse 80% 50% at 20% 20%,rgba(124,92,252,0.10) 0%,transparent 60%),radial-gradient(ellipse 60% 40% at 80% 80%,rgba(59,130,246,0.08) 0%,transparent 60%)"
            : "radial-gradient(ellipse 80% 50% at 20% 20%,rgba(124,92,252,0.07) 0%,transparent 60%),radial-gradient(ellipse 60% 40% at 80% 80%,rgba(59,130,246,0.05) 0%,transparent 60%)",
      }} />
      <Box aria-hidden="true" sx={{
        position:"absolute", inset:0, pointerEvents:"none",
        backgroundImage:(theme) =>
          theme.palette.mode === "dark"
            ? "radial-gradient(circle,rgba(255,255,255,0.04) 1px,transparent 1px)"
            : "radial-gradient(circle,rgba(100,80,200,0.06) 1px,transparent 1px)",
        backgroundSize:"28px 28px",
        maskImage:"radial-gradient(ellipse 80% 80% at 50% 50%,black 40%,transparent 100%)",
      }} />

      <Box sx={{ maxWidth:1160, mx:"auto", position:"relative", zIndex:1 }}>

        {/* ── Section header ────────────────────────────────────────────── */}
        <Stack spacing={2.5} alignItems="center" textAlign="center" sx={{ mb:{ xs:7, md:10 } }}>
          <Stack
            data-role-eyebrow
            direction="row" spacing={1} alignItems="center"
            sx={{
              display:"inline-flex", px:2.5, py:0.75, borderRadius:"999px",
              background:(t2) => t2.palette.mode==="dark" ? "rgba(124,92,252,0.14)" : "rgba(124,92,252,0.09)",
              border:"1px solid",
              borderColor:(t2) => t2.palette.mode==="dark" ? "rgba(124,92,252,0.30)" : "rgba(124,92,252,0.22)",
            }}
          >
            <Box sx={{
              width:7, height:7, borderRadius:"50%", background:"#7c5cfc",
              boxShadow:"0 0 8px rgba(124,92,252,0.8)",
              animation: reducedMotion ? "none" : `${pulseRing} 2s ease-out infinite`,
            }} />
            <Typography sx={{
              fontSize:"0.72rem", fontWeight:700, letterSpacing:"0.10em", textTransform:"uppercase",
              color:(t2) => t2.palette.mode==="dark" ? "rgba(167,139,250,0.90)" : "rgba(109,40,217,0.80)",
            }}>
              {t("publicHome.role.eyebrow","Built for Every Role")}
            </Typography>
          </Stack>

          <Typography id="role-section-title" data-role-title component="h2" sx={{
            fontWeight:900, lineHeight:1.1, letterSpacing:"-0.8px",
            fontSize:{ xs:"2rem", sm:"2.6rem", md:"3.1rem" },
            color:(t2) => t2.palette.mode==="dark" ? "#f4f1ff" : "#0d0b1a",
            maxWidth:"22ch",
            "& span":{
              background:"linear-gradient(135deg,#7c3aed,#3b82f6)",
              WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text",
            },
          }}>
            {t("publicHome.role.title.pre","One platform,")}{" "}
            <span>{t("publicHome.role.title.accent","three powerful")}</span>{" "}
            {t("publicHome.role.title.post","experiences")}
          </Typography>

          <Typography data-role-desc variant="body1" sx={{
            color:(t2) => t2.palette.mode==="dark" ? "rgba(228,220,255,0.68)" : "#4d586b",
            lineHeight:1.75, fontSize:{ xs:"1rem", md:"1.1rem" }, maxWidth:"55ch",
          }}>
            {t(
              "publicHome.role.description",
              "MUS unifies academic resource sharing, content moderation, personalized recommendations, and engagement analytics — with a tailored dashboard for every role in the university."
            )}
          </Typography>

          <Box sx={{
            width:64, height:3, borderRadius:"999px",
            background:"linear-gradient(90deg,#7c3aed,#3b82f6)",
            boxShadow:"0 2px 12px rgba(124,92,252,0.40)",
          }} />
        </Stack>

        {/* ── 2-column CSS Grid ─────────────────────────────────────────── */}
        {/*
          Uses explicit @media — NOT MUI responsive object — because MUI
          doesn't reliably transform custom CSS values like gridTemplateColumns.
          @media (min-width:600px) corresponds to MUI's "sm" breakpoint.
        */}
        <Box sx={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "24px",
          "@media (min-width:900px)": {
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "32px",
          },
        }}>
          {activePillars.map((pillar) => (
            <PublicRoleCard
              key={pillar.id}
              pillar={pillar}
              t={t}
              isDark={isDark}
              reducedMotion={reducedMotion}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
});

PublicRoleSection.displayName = "PublicRoleSection";
export default PublicRoleSection;
