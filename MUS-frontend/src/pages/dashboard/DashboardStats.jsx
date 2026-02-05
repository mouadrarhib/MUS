import React from 'react';
import { Grid, Card, Typography, Box, alpha, useTheme, Stack, Chip } from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import {
  TrendingUp,
  People,
  Assessment,
} from '@mui/icons-material';

const monthlyData = [
  { name: 'Jan', users: 400, resources: 240, subscriptions: 240 },
  { name: 'Feb', users: 450, resources: 290, subscriptions: 261 },
  { name: 'Mar', users: 520, resources: 350, subscriptions: 289 },
  { name: 'Apr', users: 478, resources: 390, subscriptions: 300 },
  { name: 'May', users: 589, resources: 480, subscriptions: 318 },
  { name: 'Jun', users: 639, resources: 520, subscriptions: 350 },
  { name: 'Jul', users: 749, resources: 630, subscriptions: 410 },
];

const userRolesData = [
  { name: 'Teachers', value: 123, color: '#10B981' },
  { name: 'Students', value: 456, color: '#3B82F6' },
  { name: 'Free Users', value: 789, color: '#F59E0B' },
];

const moderationData = [
  { name: 'Approved', value: 432, color: '#10B981' },
  { name: 'Pending', value: 89, color: '#F59E0B' },
  { name: 'Rejected', value: 46, color: '#EF4444' },
];

function DashboardStats() {
  const theme = useTheme();

  const CHART_COLORS = {
    primary: theme.palette.primary.main,
    secondary: theme.palette.secondary.main,
    success: theme.palette.success.main,
    warning: theme.palette.warning.main,
    info: theme.palette.info.main,
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Card
          sx={{
            p: 2,
            boxShadow: theme.shadows[8],
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>
            {label}
          </Typography>
          {payload.map((entry, index) => (
            <Typography
              key={index}
              variant="caption"
              sx={{ display: 'block', color: entry.color }}
            >
              {entry.name}: {entry.value}
            </Typography>
          ))}
        </Card>
      );
    }
    return null;
  };

  const ChartCard = ({ title, subtitle, icon, children, actions }) => (
    <Card
      sx={{
        p: 3,
        height: '100%',
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: theme.shadows[8],
          borderColor: 'primary.main',
        },
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={3}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {icon && (
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: 'primary.main',
              }}
            >
              {icon}
            </Box>
          )}
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                fontSize: '1.1rem',
                color: 'text.primary',
              }}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
        {actions}
      </Stack>
      {children}
    </Card>
  );

  return (
    <Grid container spacing={3}>
      {/* Growth Trend Chart - Full Width */}
      <Grid item xs={12}>
        <ChartCard
          title="Growth Overview"
          subtitle="User acquisition, resources, and subscription trends"
          icon={<TrendingUp />}
          actions={
            <Chip
              label="Last 7 months"
              size="small"
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: 'primary.main',
                fontWeight: 600,
              }}
            />
          }
        >
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorResources" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS.info} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={CHART_COLORS.info} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorSubscriptions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS.success} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={CHART_COLORS.success} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.3)} />
              <XAxis
                dataKey="name"
                stroke={theme.palette.text.secondary}
                style={{ fontSize: '0.875rem' }}
              />
              <YAxis
                stroke={theme.palette.text.secondary}
                style={{ fontSize: '0.875rem' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{
                  paddingTop: '20px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                }}
              />
              <Area
                type="monotone"
                dataKey="users"
                stroke={CHART_COLORS.primary}
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorUsers)"
                name="Users"
              />
              <Area
                type="monotone"
                dataKey="resources"
                stroke={CHART_COLORS.info}
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorResources)"
                name="Resources"
              />
              <Area
                type="monotone"
                dataKey="subscriptions"
                stroke={CHART_COLORS.success}
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorSubscriptions)"
                name="Subscriptions"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </Grid>

      {/* User Distribution & Moderation Status */}
      <Grid item xs={12} md={6}>
        <ChartCard
          title="User Distribution"
          subtitle="By account type"
          icon={<People />}
        >
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={userRolesData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={90}
                innerRadius={55}
                fill="#8884d8"
                dataKey="value"
                paddingAngle={5}
              >
                {userRolesData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <Stack spacing={1.5} mt={2}>
            {userRolesData.map((item, index) => (
              <Stack
                key={index}
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: item.color,
                    }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {item.name}
                  </Typography>
                </Stack>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {item.value}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </ChartCard>
      </Grid>

      <Grid item xs={12} md={6}>
        <ChartCard
          title="Moderation Status"
          subtitle="Resource approval workflow"
          icon={<Assessment />}
        >
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={moderationData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={90}
                innerRadius={55}
                fill="#8884d8"
                dataKey="value"
                paddingAngle={5}
              >
                {moderationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <Stack spacing={1.5} mt={2}>
            {moderationData.map((item, index) => (
              <Stack
                key={index}
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: item.color,
                    }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {item.name}
                  </Typography>
                </Stack>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {item.value}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </ChartCard>
      </Grid>
    </Grid>
  );
}

export default DashboardStats;
