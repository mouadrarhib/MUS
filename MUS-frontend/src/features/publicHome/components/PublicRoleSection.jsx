import { useEffect, useRef } from "react";
import { Box, Stack, Typography } from "@mui/material";
import { useLanguage } from "@/app/providers/LanguageContext";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger.js";

gsap.registerPlugin(ScrollTrigger);

const ACCENT_COLORS = [
  { color: "#7c5cfc", bg: "rgba(124,92,252,0.10)", border: "rgba(124,92,252,0.22)" },
  { color: "#10b981", bg: "rgba(16,185,129,0.10)", border: "rgba(16,185,129,0.22)" },
  { color: "#3b82f6", bg: "rgba(59,130,246,0.10)", border: "rgba(59,130,246,0.22)" },
  { color: "#f59e0b", bg: "rgba(245,158,11,0.10)", border: "rgba(245,158,11,0.22)" },
  { color: "#ec4899", bg: "rgba(236,72,153,0.10)", border: "rgba(236,72,153,0.22)" },
  { color: "#06b6d4", bg: "rgba(6,182,212,0.10)", border: "rgba(6,182,212,0.22)" },
];

const PublicRoleSection = ({ pillars = [] }) => {
  const { t } = useLanguage();
  const sectionRef = useRef(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray("[data-role-card]");
      cards.forEach((card, index) => {
        gsap.from(card, {
          opacity: 0,
          y: 28,
          scale: 0.98,
          duration: 0.55,
          delay: index * 0.08,
          ease: "power2.out",
          scrollTrigger: {
            trigger: card,
            start: "top 88%",
            toggleActions: "play none none reverse",
          },
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <Box
      ref={sectionRef}
      sx={{
        py: { xs: 8, md: 11 },
        px: { xs: 2, sm: 3, md: 4 },
        position: "relative",
        overflow: "hidden",
        background: (theme) =>
          theme.palette.mode === "dark"
            ? "linear-gradient(160deg, #0f0c1d 0%, #141121 55%, #0c101a 100%)"
            : "linear-gradient(160deg, #f4f2ff 0%, #f3f4f7 55%, #edf2ff 100%)",
      }}
      data-role-section
    >
      <Box
        sx={{
          position: "absolute",
          top: "-10%",
          right: "-8%",
          width: { xs: 300, md: 520 },
          height: { xs: 300, md: 520 },
          borderRadius: "50%",
          background: (theme) =>
            theme.palette.mode === "dark"
              ? "radial-gradient(ellipse, rgba(59,130,246,0.10) 0%, transparent 70%)"
              : "radial-gradient(ellipse, rgba(59,130,246,0.07) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: "-5%",
          left: "-5%",
          width: { xs: 260, md: 400 },
          height: { xs: 260, md: 400 },
          borderRadius: "50%",
          background: (theme) =>
            theme.palette.mode === "dark"
              ? "radial-gradient(ellipse, rgba(124,92,252,0.08) 0%, transparent 70%)"
              : "radial-gradient(ellipse, rgba(124,92,252,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <Box sx={{ maxWidth: 1180, mx: "auto", position: "relative", zIndex: 1 }}>
        <Stack spacing={2} alignItems="center" textAlign="center" data-role-intro>
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.7,
              px: 1.5,
              py: 0.5,
              borderRadius: 999,
              bgcolor: "rgba(59,130,246,0.10)",
              border: "1px solid rgba(59,130,246,0.25)",
              color: "#3b82f6",
              fontWeight: 700,
              fontSize: "0.78rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            <Box
              component="span"
              sx={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                bgcolor: "#3b82f6",
                display: "inline-block",
              }}
            />
            {t("publicHome.role.eyebrow", "Platform Mission")}
          </Box>

          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              fontSize: { xs: "2rem", sm: "2.6rem", md: "3.25rem" },
              lineHeight: 1.12,
              letterSpacing: "-0.025em",
              color: (theme) => (theme.palette.mode === "dark" ? "#f4f1ff" : "#0d0b1a"),
              maxWidth: 820,
            }}
          >
            {t(
              "publicHome.role.title",
              "A single academic workspace for students, teachers, and university communities"
            )}
          </Typography>

          <Typography
            sx={{
              maxWidth: 760,
              fontSize: { xs: "1.05rem", md: "1.18rem" },
              color: (theme) => (theme.palette.mode === "dark" ? "rgba(228,220,255,0.78)" : "#4d586b"),
              lineHeight: 1.65,
            }}
          >
            {t(
              "publicHome.role.description",
              "MUS helps learners find reliable resources, prepare effectively for exams, coordinate university clubs and events, access structured academic notes, and maintain clear communication with teachers."
            )}
          </Typography>
        </Stack>

        <Box
          sx={{
            mt: { xs: 5, md: 6.5 },
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
            gridAutoFlow: { md: "column" },
            gridAutoColumns: { md: "1fr" },
            gap: { xs: 2, md: 2.5 },
          }}
        >
          {pillars.map(({ icon: Icon, titleKey, descriptionKey, title, description }, idx) => {
            const accent = ACCENT_COLORS[idx % ACCENT_COLORS.length];
            return (
              <Box
                key={titleKey || title}
                data-role-card
                sx={{
                  position: "relative",
                  borderRadius: { xs: 3, md: 3.5 },
                  p: { xs: 2.8, md: 3.2 },
                  bgcolor: (theme) =>
                    theme.palette.mode === "dark" ? "rgba(255,255,255,0.035)" : "rgba(255,255,255,0.92)",
                  border: "1px solid",
                  borderColor: (theme) =>
                    theme.palette.mode === "dark" ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)",
                  boxShadow: (theme) =>
                    theme.palette.mode === "dark"
                      ? "0 2px 20px rgba(0,0,0,0.35)"
                      : "0 4px 24px rgba(20,20,60,0.07)",
                  backdropFilter: "blur(8px)",
                  overflow: "hidden",
                  transition: "transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    borderColor: accent.border,
                    boxShadow: (theme) =>
                      theme.palette.mode === "dark"
                        ? `0 12px 40px rgba(0,0,0,0.45), 0 0 0 1px ${accent.border}`
                        : "0 12px 36px rgba(20,20,60,0.11)",
                    "& .role-accent-stripe": {
                      opacity: 1,
                    },
                  },
                }}
              >
                <Box
                  className="role-accent-stripe"
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    bottom: 0,
                    width: 3,
                    background: accent.color,
                    borderRadius: "3px 0 0 3px",
                    opacity: 0,
                    transition: "opacity 0.22s ease",
                  }}
                />

                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2.5,
                    bgcolor: accent.bg,
                    color: accent.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 2.2,
                    border: "1px solid",
                    borderColor: accent.border,
                  }}
                >
                  <Icon sx={{ fontSize: 22 }} />
                </Box>

                <Typography
                  sx={{
                    fontSize: { xs: "1.05rem", md: "1.15rem" },
                    fontWeight: 700,
                    color: (theme) => (theme.palette.mode === "dark" ? "#f0ecff" : "#0f0d1c"),
                    mb: 1,
                    lineHeight: 1.3,
                  }}
                >
                  {t(titleKey || "", title || "")}
                </Typography>

                <Typography
                  sx={{
                    fontSize: { xs: "0.92rem", md: "0.97rem" },
                    lineHeight: 1.65,
                    color: (theme) =>
                      theme.palette.mode === "dark" ? "rgba(220,212,248,0.72)" : "#576071",
                  }}
                >
                  {t(descriptionKey || "", description || "")}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
};

export default PublicRoleSection;
