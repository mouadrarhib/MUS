import { Box, Stack, Typography, alpha } from "@mui/material";
import { Description, AccountBalance, Group } from "@mui/icons-material";

const statsItems = [
  {
    count: 50,
    suffix: "M",
    title: "Study resources",
    chip: "1 new each second",
    accentColor: "#7c5cfc",
    chipBg: "rgba(124,92,252,0.12)",
    chipBorder: "rgba(124,92,252,0.35)",
    chipText: "#7c5cfc",
    icon: <Description sx={{ fontSize: 22 }} />,
    iconBg: "rgba(124,92,252,0.12)",
    iconColor: "#7c5cfc",
  },
  {
    count: 120,
    suffix: "K",
    title: "Institutions",
    chip: "In 100+ countries",
    accentColor: "#10b981",
    chipBg: "rgba(16,185,129,0.1)",
    chipBorder: "rgba(16,185,129,0.35)",
    chipText: "#10b981",
    icon: <AccountBalance sx={{ fontSize: 22 }} />,
    iconBg: "rgba(16,185,129,0.1)",
    iconColor: "#10b981",
  },
  {
    count: 60,
    suffix: "M",
    title: "Users",
    chip: "Active every month",
    accentColor: "#f59e0b",
    chipBg: "rgba(245,158,11,0.1)",
    chipBorder: "rgba(245,158,11,0.35)",
    chipText: "#f59e0b",
    icon: <Group sx={{ fontSize: 22 }} />,
    iconBg: "rgba(245,158,11,0.1)",
    iconColor: "#f59e0b",
  },
];

const PublicStatsSection = () => (
  <Box
    sx={{
      position: "relative",
      overflow: "hidden",
      py: { xs: 8, md: 11 },
      background: (theme) =>
        theme.palette.mode === "dark"
          ? "linear-gradient(160deg, #100d1f 0%, #16121f 60%, #0d1019 100%)"
          : "linear-gradient(160deg, #f0eeff 0%, #eef2f9 55%, #e8f0ff 100%)",
    }}
    data-reveal
  >
    {/* Radial spotlight decorations */}
    <Box
      sx={{
        position: "absolute",
        top: "-10%",
        left: "50%",
        transform: "translateX(-50%)",
        width: { xs: 480, md: 700 },
        height: { xs: 340, md: 460 },
        borderRadius: "50%",
        background: (theme) =>
          theme.palette.mode === "dark"
            ? "radial-gradient(ellipse, rgba(124,92,252,0.13) 0%, transparent 70%)"
            : "radial-gradient(ellipse, rgba(124,92,252,0.09) 0%, transparent 70%)",
        pointerEvents: "none",
      }}
    />

    <Box
      sx={{
        width: "100%",
        px: { xs: 2, sm: 3, md: 4 },
        position: "relative",
        zIndex: 1,
        maxWidth: 1200,
        mx: "auto",
      }}
    >
      {/* Header */}
      <Stack spacing={2} textAlign="center" alignItems="center">
        <Typography
          variant="h2"
          sx={{
            fontWeight: 800,
            lineHeight: 1.08,
            letterSpacing: "-0.025em",
            fontSize: { xs: "2.2rem", sm: "2.8rem", md: "4rem" },
            maxWidth: 860,
            color: (theme) =>
              theme.palette.mode === "dark" ? "#f7f5ff" : "#0d0b1a",
          }}
        >
          Over 1 billion students helped, and counting
        </Typography>
        <Typography
          sx={{
            color: (theme) =>
              theme.palette.mode === "dark"
                ? "rgba(235,228,255,0.72)"
                : "#4a5068",
            fontSize: { xs: "1.1rem", md: "1.35rem" },
            maxWidth: 700,
            lineHeight: 1.6,
          }}
        >
          50K new study notes added every day, from the world's most active
          student communities
        </Typography>
      </Stack>

      {/* Stat Cards */}
      <Box
        sx={{
          mt: { xs: 5.5, md: 7 },
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(3, minmax(0, 1fr))",
          },
          gap: { xs: 2.5, md: 3 },
        }}
      >
        {statsItems.map((item) => (
          <Box
            key={item.title}
            data-stats-item
            sx={{
              position: "relative",
              borderRadius: { xs: 3, md: 4 },
              border: "1px solid",
              borderColor: (theme) =>
                theme.palette.mode === "dark"
                  ? "rgba(255,255,255,0.07)"
                  : "rgba(0,0,0,0.07)",
              background: (theme) =>
                theme.palette.mode === "dark"
                  ? "linear-gradient(155deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)"
                  : "rgba(255,255,255,0.88)",
              boxShadow: (theme) =>
                theme.palette.mode === "dark"
                  ? "0 2px 24px rgba(0,0,0,0.35)"
                  : "0 4px 28px rgba(20,20,60,0.07)",
              backdropFilter: "blur(10px)",
              px: { xs: 3, md: 3.5 },
              pt: { xs: 3.2, md: 3.8 },
              pb: { xs: 3, md: 3.5 },
              overflow: "hidden",
              transition: "transform 0.22s ease, box-shadow 0.22s ease",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: (theme) =>
                  theme.palette.mode === "dark"
                    ? `0 12px 40px rgba(0,0,0,0.45)`
                    : `0 12px 40px rgba(20,20,60,0.12)`,
              },
            }}
          >
            {/* Top accent stripe */}
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 3,
                background: item.accentColor,
                borderRadius: "4px 4px 0 0",
              }}
            />

            {/* Icon */}
            <Box
              sx={{
                width: 46,
                height: 46,
                borderRadius: 2.5,
                bgcolor: item.iconBg,
                color: item.iconColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 2.5,
              }}
            >
              {item.icon}
            </Box>

            {/* Number */}
            <Typography
              sx={{
                fontSize: { xs: "3.6rem", md: "4.4rem" },
                fontWeight: 800,
                lineHeight: 1,
                letterSpacing: "-0.04em",
                color: (theme) =>
                  theme.palette.mode === "dark" ? "#f7f3ff" : "#0d0b1a",
              }}
            >
              <Box
                component="span"
                data-count-to={item.count}
                data-count-suffix={item.suffix}
              >
                0{item.suffix}
              </Box>
            </Typography>

            {/* Label */}
            <Typography
              sx={{
                mt: 1,
                fontSize: { xs: "1.15rem", md: "1.3rem" },
                fontWeight: 600,
                color: (theme) =>
                  theme.palette.mode === "dark"
                    ? "rgba(232,224,255,0.9)"
                    : "#1a1d2e",
              }}
            >
              {item.title}
            </Typography>

            {/* Chip pill */}
            <Box
              sx={{
                mt: 1.8,
                display: "inline-flex",
                alignItems: "center",
                px: 1.5,
                py: 0.5,
                borderRadius: 999,
                bgcolor: item.chipBg,
                border: "1px solid",
                borderColor: item.chipBorder,
                color: item.chipText,
                fontWeight: 700,
                fontSize: "0.82rem",
                letterSpacing: "0.01em",
                gap: 0.5,
              }}
            >
              <Box
                component="span"
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  bgcolor: item.accentColor,
                  display: "inline-block",
                  flexShrink: 0,
                }}
              />
              {item.chip}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  </Box>
);

export default PublicStatsSection;
