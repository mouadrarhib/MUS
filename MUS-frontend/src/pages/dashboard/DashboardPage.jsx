import React, { useState, useEffect } from 'react';
import { Grid, Box, Fade, Skeleton, Stack, Card, Typography, Button, alpha, useTheme, Avatar, Chip, LinearProgress, IconButton, Divider, Container } from '@mui/material';
import StatCard from '../../shared/components/ui/data-display/StatCard';
import DashboardStats from './DashboardStats';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import SubscriptionsIcon from '@mui/icons-material/Subscriptions';
import FreeBreakfastIcon from '@mui/icons-material/FreeBreakfast';
import WebIcon from '@mui/icons-material/Web';
import RateReviewIcon from '@mui/icons-material/RateReview';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { useNavigate } from 'react-router-dom';

const stats = [
  {
    title: 'Total Users',
    value: '1,234',
    icon: <PeopleIcon sx={{ fontSize: 40 }} />,
    color: 'primary',
    trend: 'up',
    trendValue: '+12.5%',
    subtitle: 'vs last month',
  },
  {
    title: 'Total Resources',
    value: '567',
    icon: <WebIcon sx={{ fontSize: 40 }} />,
    color: 'info',
    trend: 'up',
    trendValue: '+8.2%',
    subtitle: 'Published content',
  },
  {
    title: 'Pending Moderations',
    value: '89',
    icon: <RateReviewIcon sx={{ fontSize: 40 }} />,
    color: 'warning',
    trend: 'down',
    trendValue: '-3.1%',
    subtitle: 'Awaiting review',
  },
  {
    title: 'Teachers',
    value: '123',
    icon: <SchoolIcon sx={{ fontSize: 40 }} />,
    color: 'success',
    trend: 'up',
    trendValue: '+5.7%',
    subtitle: 'Active educators',
  },
  {
    title: 'Student Subscriptions',
    value: '456',
    icon: <SubscriptionsIcon sx={{ fontSize: 40 }} />,
    color: 'secondary',
    trend: 'up',
    trendValue: '+15.3%',
    subtitle: 'Premium members',
  },
  {
    title: 'Free Plan Users',
    value: '789',
    icon: <FreeBreakfastIcon sx={{ fontSize: 40 }} />,
    color: 'error',
    trend: 'up',
    trendValue: '+4.8%',
    subtitle: 'Trial accounts',
  },
];

// Recent Activity Data
const recentActivity = [
  {
    id: 1,
    user: 'John Smith',
    avatar: 'https://i.pravatar.cc/150?img=12',
    action: 'submitted a new video resource',
    resource: 'Advanced React Patterns',
    time: '5 minutes ago',
    status: 'pending',
  },
  {
    id: 2,
    user: 'Sarah Johnson',
    avatar: 'https://i.pravatar.cc/150?img=45',
    action: 'subscribed to premium plan',
    resource: null,
    time: '12 minutes ago',
    status: 'completed',
  },
  {
    id: 3,
    user: 'Mike Chen',
    avatar: 'https://i.pravatar.cc/150?img=33',
    action: 'submitted a PDF resource',
    resource: 'JavaScript Design Patterns',
    time: '1 hour ago',
    status: 'pending',
  },
  {
    id: 4,
    user: 'Emily Davis',
    avatar: 'https://i.pravatar.cc/150?img=27',
    action: 'completed teacher verification',
    resource: null,
    time: '2 hours ago',
    status: 'completed',
  },
];

// Pending Moderations
const pendingModerations = [
  {
    id: 1,
    title: 'Introduction to TypeScript',
    type: 'video',
    submittedBy: 'Alex Turner',
    submittedAt: '2 hours ago',
    priority: 'high',
  },
  {
    id: 2,
    title: 'Node.js Best Practices',
    type: 'pdf',
    submittedBy: 'Rachel Green',
    submittedAt: '5 hours ago',
    priority: 'medium',
  },
  {
    id: 3,
    title: 'CSS Grid Mastery',
    type: 'article',
    submittedBy: 'Tom Wilson',
    submittedAt: '1 day ago',
    priority: 'low',
  },
  {
    id: 4,
    title: 'Docker Fundamentals',
    type: 'video',
    submittedBy: 'Lisa Anderson',
    submittedAt: '1 day ago',
    priority: 'medium',
  },
];

function DashboardPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const QuickActionCard = ({ title, description, icon, color, onClick }) => (
    <Card
      onClick={onClick}
      sx={{
        p: 3,
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        height: '100%',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[12],
          borderColor: color,
          '& .action-icon': {
            transform: 'translateX(4px)',
          },
        },
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: alpha(color, 0.1),
            color: color,
          }}
        >
          {icon}
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem', mb: 0.5 }}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
            {description}
          </Typography>
        </Box>
        <ArrowForwardIcon
          className="action-icon"
          sx={{ color: 'text.secondary', transition: 'transform 0.3s ease' }}
        />
      </Stack>
    </Card>
  );

  return (
    <Box 
      sx={{ 
        width: '100%',
        minHeight: '100vh',
        bgcolor: 'background.default',
        py: { xs: 2, sm: 3, md: 4 },
      }}
    >
      <Container 
        maxWidth="xl" 
        sx={{ 
          px: { xs: 2, sm: 3, md: 4 },
        }}
      >
        {/* Header Section */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
            Dashboard Overview
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Welcome back! Here's what's happening with your platform today.
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap" gap={2}>
            <Button
              variant="outlined"
              startIcon={<AssessmentIcon />}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
              }}
            >
              Reports
            </Button>
            <Button
              variant="contained"
              startIcon={<NotificationsActiveIcon />}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: theme.shadows[8],
                },
              }}
            >
              View Alerts
            </Button>
          </Stack>
        </Box>

        {loading ? (
          <Grid container spacing={3}>
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item}>
                <Skeleton variant="rectangular" height={180} sx={{ borderRadius: 3 }} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Fade in timeout={600}>
            <Box>
              {/* Stats Grid - Full Width 3 Columns */}
              <Box sx={{ mb: 4 }}>
                <Box 
                  sx={{ 
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 1,
                    mb: 3,
                  }}
                >
                  <TrendingUpIcon sx={{ color: 'primary.main' }} />
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      fontWeight: 700,
                      textAlign: 'center',
                    }}
                  >
                    Platform Statistics
                  </Typography>
                </Box>
                <Grid container spacing={3}>
                  {stats.map((stat, index) => (
                    <Grid item xs={12} sm={6} md={4} key={stat.title}>
                      <Fade in timeout={600 + index * 100}>
                        <Box>
                          <StatCard
                            title={stat.title}
                            value={stat.value}
                            icon={stat.icon}
                            color={stat.color}
                            trend={stat.trend}
                            trendValue={stat.trendValue}
                            subtitle={stat.subtitle}
                          />
                        </Box>
                      </Fade>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              <Divider sx={{ my: 4 }} />

              {/* Quick Actions Section */}
              <Box sx={{ mb: 4 }}>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 700, 
                    mb: 3,
                    textAlign: 'center',
                  }}
                >
                  Quick Actions
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={3}>
                    <QuickActionCard
                      title="Review Submissions"
                      description="89 resources awaiting moderation"
                      icon={<RateReviewIcon sx={{ fontSize: 32 }} />}
                      color={theme.palette.warning.main}
                      onClick={() => navigate('/moderation')}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <QuickActionCard
                      title="Manage Users"
                      description="View and manage user accounts"
                      icon={<PeopleIcon sx={{ fontSize: 32 }} />}
                      color={theme.palette.primary.main}
                      onClick={() => navigate('/users')}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <QuickActionCard
                      title="View Resources"
                      description="Browse all published content"
                      icon={<WebIcon sx={{ fontSize: 32 }} />}
                      color={theme.palette.info.main}
                      onClick={() => navigate('/resources')}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <QuickActionCard
                      title="Analytics"
                      description="Deep dive into platform metrics"
                      icon={<TrendingUpIcon sx={{ fontSize: 32 }} />}
                      color={theme.palette.success.main}
                      onClick={() => navigate('/analytics')}
                    />
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ my: 4 }} />

              {/* Analytics Charts Section */}
              <Box sx={{ mb: 4 }}>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 700, 
                    mb: 3,
                    textAlign: 'center',
                  }}
                >
                  Analytics & Insights
                </Typography>
                <DashboardStats />
              </Box>

              <Divider sx={{ my: 4 }} />

              {/* Activity & Moderation Section - Full Width Grid */}
              <Box sx={{ mb: 4 }}>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 700, 
                    mb: 3,
                    textAlign: 'center',
                  }}
                >
                  Recent Activity & Pending Items
                </Typography>
                <Grid container spacing={3}>
                  {/* Pending Moderations Card */}
                  <Grid item xs={12} md={6}>
                    <Card
                      sx={{
                        p: 3,
                        borderRadius: 3,
                        border: '1px solid',
                        borderColor: 'divider',
                        height: '100%',
                        minHeight: 500,
                        '&:hover': {
                          boxShadow: theme.shadows[8],
                        },
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box
                            sx={{
                              width: 48,
                              height: 48,
                              borderRadius: 2,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              bgcolor: alpha(theme.palette.warning.main, 0.1),
                              color: 'warning.main',
                            }}
                          >
                            <PendingActionsIcon sx={{ fontSize: 28 }} />
                          </Box>
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>
                              Pending Moderations
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Resources awaiting your review
                            </Typography>
                          </Box>
                        </Box>
                        <Chip
                          label="89"
                          color="warning"
                          size="medium"
                          sx={{ fontWeight: 700, fontSize: '0.875rem', height: 32 }}
                        />
                      </Stack>

                      <Stack spacing={2.5}>
                        {pendingModerations.map((item) => (
                          <Box
                            key={item.id}
                            sx={{
                              p: 2.5,
                              borderRadius: 2,
                              bgcolor: alpha(theme.palette.background.default, 0.5),
                              border: '1px solid',
                              borderColor: 'divider',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                bgcolor: alpha(theme.palette.primary.main, 0.05),
                                borderColor: 'primary.main',
                                transform: 'translateX(4px)',
                              },
                            }}
                          >
                            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
                              <Typography variant="body1" sx={{ fontWeight: 600, flex: 1 }}>
                                {item.title}
                              </Typography>
                              <Chip
                                label={item.priority}
                                size="small"
                                color={item.priority === 'high' ? 'error' : item.priority === 'medium' ? 'warning' : 'default'}
                                sx={{ 
                                  height: 24, 
                                  fontSize: '0.7rem', 
                                  textTransform: 'uppercase',
                                  fontWeight: 700,
                                }}
                              />
                            </Stack>
                            <Stack direction="row" spacing={2} alignItems="center">
                              <Chip
                                label={item.type}
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: '0.7rem', height: 22 }}
                              />
                              <Typography variant="caption" color="text.secondary">
                                by <strong>{item.submittedBy}</strong>
                              </Typography>
                            </Stack>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                              {item.submittedAt}
                            </Typography>
                          </Box>
                        ))}
                      </Stack>

                      <Button
                        fullWidth
                        variant="contained"
                        endIcon={<ArrowForwardIcon />}
                        onClick={() => navigate('/moderation')}
                        sx={{
                          mt: 3,
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 600,
                          py: 1.5,
                          boxShadow: 'none',
                          '&:hover': {
                            boxShadow: theme.shadows[8],
                          },
                        }}
                      >
                        View All Moderations
                      </Button>
                    </Card>
                  </Grid>

                  {/* Recent Activity Card */}
                  <Grid item xs={12} md={6}>
                    <Card
                      sx={{
                        p: 3,
                        borderRadius: 3,
                        border: '1px solid',
                        borderColor: 'divider',
                        height: '100%',
                        minHeight: 500,
                        '&:hover': {
                          boxShadow: theme.shadows[8],
                        },
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box
                            sx={{
                              width: 48,
                              height: 48,
                              borderRadius: 2,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              color: 'primary.main',
                            }}
                          >
                            <CheckCircleIcon sx={{ fontSize: 28 }} />
                          </Box>
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>
                              Recent Activity
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Latest platform events
                            </Typography>
                          </Box>
                        </Box>
                        <IconButton size="small">
                          <MoreVertIcon />
                        </IconButton>
                      </Stack>

                      <Stack spacing={3}>
                        {recentActivity.map((activity) => (
                          <Box key={activity.id}>
                            <Stack direction="row" spacing={2} alignItems="flex-start">
                              <Avatar
                                src={activity.avatar}
                                alt={activity.user}
                                sx={{ 
                                  width: 48, 
                                  height: 48,
                                  border: '2px solid',
                                  borderColor: 'divider',
                                }}
                              />
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="body2" sx={{ mb: 0.5, lineHeight: 1.6 }}>
                                  <strong>{activity.user}</strong> {activity.action}
                                </Typography>
                                {activity.resource && (
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      display: 'block',
                                      color: 'primary.main',
                                      fontWeight: 600,
                                      mb: 0.5,
                                    }}
                                  >
                                    "{activity.resource}"
                                  </Typography>
                                )}
                                <Typography variant="caption" color="text.secondary">
                                  {activity.time}
                                </Typography>
                              </Box>
                              <Chip
                                label={activity.status}
                                size="small"
                                color={activity.status === 'completed' ? 'success' : 'warning'}
                                sx={{ height: 24, fontSize: '0.7rem', fontWeight: 600 }}
                              />
                            </Stack>
                          </Box>
                        ))}
                      </Stack>

                      <Button
                        fullWidth
                        variant="outlined"
                        endIcon={<ArrowForwardIcon />}
                        sx={{
                          mt: 3,
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 600,
                          py: 1.5,
                        }}
                      >
                        View All Activity
                      </Button>
                    </Card>
                  </Grid>
                </Grid>
              </Box>

              {/* System Performance - Full Width */}
              <Box sx={{ mb: 4 }}>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 700, 
                    mb: 3,
                    textAlign: 'center',
                  }}
                >
                  Platform Performance
                </Typography>
                <Card
                  sx={{
                    p: 4,
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
                  }}
                >
                  <Grid container spacing={4}>
                    <Grid item xs={12} md={4}>
                      <Box>
                        <Stack direction="row" justifyContent="space-between" mb={2}>
                          <Typography variant="h6" color="text.primary" sx={{ fontWeight: 700 }}>
                            Approval Rate
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main' }}>
                            87%
                          </Typography>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={87}
                          sx={{
                            height: 12,
                            borderRadius: 6,
                            bgcolor: alpha(theme.palette.success.main, 0.1),
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 6,
                              bgcolor: 'success.main',
                            },
                          }}
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                          432 approved out of 497 total submissions
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Box>
                        <Stack direction="row" justifyContent="space-between" mb={2}>
                          <Typography variant="h6" color="text.primary" sx={{ fontWeight: 700 }}>
                            User Engagement
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                            92%
                          </Typography>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={92}
                          sx={{
                            height: 12,
                            borderRadius: 6,
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 6,
                              bgcolor: 'primary.main',
                            },
                          }}
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                          1,135 active users in the last 30 days
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Box>
                        <Stack direction="row" justifyContent="space-between" mb={2}>
                          <Typography variant="h6" color="text.primary" sx={{ fontWeight: 700 }}>
                            Content Quality
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: 'warning.main' }}>
                            78%
                          </Typography>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={78}
                          sx={{
                            height: 12,
                            borderRadius: 6,
                            bgcolor: alpha(theme.palette.warning.main, 0.1),
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 6,
                              bgcolor: 'warning.main',
                            },
                          }}
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                          Based on user ratings and engagement metrics
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Card>
              </Box>
            </Box>
          </Fade>
        )}
      </Container>
    </Box>
  );
}

export default DashboardPage;
