import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Chip,
  Skeleton,
  alpha,
  Button,
  Divider,
} from "@mui/material";
import {
  AccountBalanceWallet,
  Download,
  Favorite,
  TrendingUp,
  History,
  ArrowDownward,
  ArrowUpward,
} from "@mui/icons-material";
import { PageHeader, EmptyState } from "@/shared/components/ui";
import walletService from "@/services/walletService";
import { getCardBackground } from '@/styles/theme';

const StatCard = ({ title, value, hint, icon: Icon, color = "primary", loading = false }) => (
  <Paper
    elevation={0}
    sx={{
      p: 2,
      borderRadius: (t) => `${t.shape.xl}px`,
      border: "1px solid",
      borderColor: "divider",
      background: (theme) => getCardBackground(theme.palette.mode),
    }}
  >
    {loading ? (
      <>
        <Skeleton variant="text" width={120} height={18} />
        <Skeleton variant="text" width={90} height={34} />
        <Skeleton variant="text" width={160} height={16} />
      </>
    ) : (
      <>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
          <Typography variant="caption" color="text.secondary">
            {title}
          </Typography>
          <Icon sx={{ fontSize: 18, color: `${color}.main` }} />
        </Box>
        <Typography variant="h5" fontWeight="700" mb={0.5}>
          {value}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {hint}
        </Typography>
      </>
    )}
  </Paper>
);

const eventConfig = {
  download_reward: {
    label: "Download",
    icon: Download,
    color: "primary",
  },
  favorite_added_reward: {
    label: "Favorite Added",
    icon: Favorite,
    color: "error",
  },
  favorite_removed_penalty: {
    label: "Favorite Removed",
    icon: Favorite,
    color: "warning",
  },
};

const Wallet = () => {
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [summary, setSummary] = useState(null);
  const [topResources, setTopResources] = useState([]);
  const [activity, setActivity] = useState([]);
  const [offset, setOffset] = useState(0);
  const [error, setError] = useState("");

  const pageSize = 20;

  const hasActivity = useMemo(() => activity.length > 0, [activity]);

  const loadWallet = async () => {
    setLoading(true);
    setError("");
    try {
      const [summaryData, resourcesData, activityData] = await Promise.all([
        walletService.getSummary(),
        walletService.getTopResources(8),
        walletService.getActivity({ limit: pageSize, offset: 0 }),
      ]);

      setSummary(summaryData || {});
      setTopResources(Array.isArray(resourcesData) ? resourcesData : []);
      const events = Array.isArray(activityData) ? activityData : [];
      setActivity(events);
      setOffset(events.length);
    } catch (loadError) {
      setError(loadError?.response?.data?.message || "Failed to load wallet data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWallet();
  }, []);

  const handleLoadMore = async () => {
    setLoadingMore(true);
    try {
      const next = await walletService.getActivity({ limit: pageSize, offset });
      const nextList = Array.isArray(next) ? next : [];
      setActivity((prev) => [...prev, ...nextList]);
      setOffset((prev) => prev + nextList.length);
    } finally {
      setLoadingMore(false);
    }
  };

  if (error && !loading) {
    return (
      <Box sx={{ width: "100%" }}>
        <PageHeader
          title="Wallet"
          subtitle="Track your points earned from resource engagement"
          icon={AccountBalanceWallet}
          breadcrumbs={[{ label: "Dashboard", to: "/dashboard" }, { label: "Wallet" }]}
        />
        <EmptyState
          icon={AccountBalanceWallet}
          title="Wallet unavailable"
          description={error}
          actionLabel="Retry"
          onAction={loadWallet}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%" }}>
      <PageHeader
        title="Wallet"
        subtitle="Track points earned from downloads and favorites on your resources"
        icon={AccountBalanceWallet}
        breadcrumbs={[{ label: "Dashboard", to: "/dashboard" }, { label: "Wallet" }]}
      />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" },
          gap: 2,
          mb: 3,
        }}
      >
        <StatCard
          title="Current Balance"
          value={`${Number(summary?.current_points || 0)} pts`}
          hint="Available points"
          icon={AccountBalanceWallet}
          color="success"
          loading={loading}
        />
        <StatCard
          title="Downloads Earnings"
          value={`${Number(summary?.points_from_downloads || 0)} pts`}
          hint={`${Number(summary?.total_downloads_received || 0)} downloads received`}
          icon={Download}
          color="primary"
          loading={loading}
        />
        <StatCard
          title="Favorites Earnings"
          value={`${Number(summary?.points_from_favorites || 0)} pts`}
          hint={`${Number(summary?.total_favorites_received || 0)} favorites received`}
          icon={Favorite}
          color="error"
          loading={loading}
        />
        <StatCard
          title="Engagement Earnings"
          value={`${Number(summary?.total_points_from_engagement || 0)} pts`}
          hint={`+${Number(summary?.points_last_30_days || 0)} pts in 30 days`}
          icon={TrendingUp}
          color="warning"
          loading={loading}
        />
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", xl: "1.2fr 1fr" },
          gap: 2,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: (t) => `${t.shape.xl}px`,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography variant="subtitle1" fontWeight="700" mb={0.5}>
            Top Earning Resources
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Ranked by points earned from engagement
          </Typography>

          <Box mt={2}>
            {loading ? (
              [...Array(5)].map((_, index) => (
                <Skeleton key={index} variant="rounded" height={52} sx={{ mb: 1 }} />
              ))
            ) : topResources.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No earning resources yet.
              </Typography>
            ) : (
              topResources.map((item) => (
                <Box
                  key={item.resource_id}
                  sx={{
                    p: 1.25,
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    mb: 1,
                  }}
                >
                  <Box display="flex" alignItems="center" justifyContent="space-between" gap={1}>
                    <Typography variant="body2" fontWeight="600" noWrap>
                      {item.resource_title}
                    </Typography>
                    <Chip
                      size="small"
                      label={`${Number(item.points_total || 0)} pts`}
                      sx={{
                        bgcolor: (theme) => alpha(theme.palette.success.main, 0.12),
                        color: "success.main",
                        fontWeight: 700,
                      }}
                    />
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {Number(item.downloads_count || 0)} downloads • {Number(item.favorites_count || 0)} favorites
                  </Typography>
                </Box>
              ))
            )}
          </Box>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: (t) => `${t.shape.xl}px`,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <History sx={{ fontSize: 18, color: "primary.main" }} />
            <Typography variant="subtitle1" fontWeight="700">
              Recent Activity
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary">
            Includes positive and negative point events
          </Typography>

          <Box mt={2}>
            {loading ? (
              [...Array(6)].map((_, index) => (
                <Skeleton key={index} variant="rounded" height={44} sx={{ mb: 1 }} />
              ))
            ) : !hasActivity ? (
              <Typography variant="body2" color="text.secondary">
                No wallet activity yet.
              </Typography>
            ) : (
              activity.map((event, index) => {
                const cfg = eventConfig[event.event_type] || {
                  label: event.event_type,
                  icon: History,
                  color: "default",
                };
                const Icon = cfg.icon;
                const positive = Number(event.points_change || 0) >= 0;

                return (
                  <Box key={`${event.resource_id}-${event.occurred_at}-${index}`}>
                    <Box display="flex" alignItems="center" justifyContent="space-between" gap={1.5} py={1}>
                      <Box display="flex" alignItems="center" gap={1} minWidth={0}>
                        <Icon sx={{ fontSize: 16, color: `${cfg.color}.main` }} />
                        <Box minWidth={0}>
                          <Typography variant="caption" color="text.secondary" display="block">
                            {cfg.label}
                          </Typography>
                          <Typography variant="body2" fontWeight={600} noWrap>
                            {event.resource_title}
                          </Typography>
                        </Box>
                      </Box>
                      <Box textAlign="right" sx={{ whiteSpace: "nowrap" }}>
                        <Box display="flex" alignItems="center" justifyContent="flex-end" gap={0.25}>
                          {positive ? (
                            <ArrowUpward sx={{ fontSize: 13, color: "success.main" }} />
                          ) : (
                            <ArrowDownward sx={{ fontSize: 13, color: "error.main" }} />
                          )}
                          <Typography
                            variant="body2"
                            fontWeight="700"
                            color={positive ? "success.main" : "error.main"}
                          >
                            {positive ? "+" : ""}
                            {Number(event.points_change || 0)} pts
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {event.occurred_at ? new Date(event.occurred_at).toLocaleString() : "-"}
                        </Typography>
                      </Box>
                    </Box>
                    {index !== activity.length - 1 ? <Divider /> : null}
                  </Box>
                );
              })
            )}

            {hasActivity ? (
              <Box mt={1.5}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? "Loading..." : "Load more"}
                </Button>
              </Box>
            ) : null}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default Wallet;
