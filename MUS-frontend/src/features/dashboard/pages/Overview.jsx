// src/features/dashboard/pages/Overview.jsx
import { Box, Typography, Grid } from '@mui/material';
import { useAuth } from '@/features/auth/context/AuthContext';
import { 
  People, 
  Article, 
  ThumbUp, 
  Download,
  CheckCircle,
  PersonAdd,
  TrendingUp,
  Star
} from '@mui/icons-material';

import StatCard from '../components/StatCard';
import ProgressCard from '../components/ProgressCard';
import MetricGrid from '../components/MetricGrid';
import TopPerformerCard from '../components/TopPerformerCard';
import ResourceBreakdown from '../components/ResourceBreakdown'; // NEW IMPORT

import statsData from '@/data/stats.json';

const Overview = () => {
  const { user } = useAuth();
  const {
    studentsOverview,
    resourceMetrics,
    engagementMetrics,
    topPerformers
  } = statsData;

  return (
    <Box 
      sx={{ 
        maxWidth: '1400px',
        mx: 'auto',
        width: '100%'
      }}
    >
      {/* Welcome Header */}
      <Box mb={4}>
        <Typography variant="h4" fontWeight="700" gutterBottom>
          Welcome back, {user?.full_name}! 👋
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's what's happening with your platform today
        </Typography>
      </Box>

      {/* Students Overview Section */}
      <MetricGrid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Students"
            value={studentsOverview.totalStudents.toLocaleString()}
            icon={People}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Students"
            value={studentsOverview.activeStudents.toLocaleString()}
            icon={CheckCircle}
            color="success"
            subtitle={`${studentsOverview.inactiveStudents} inactive`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Resources"
            value={resourceMetrics.totalResourcesByStudents.toLocaleString()}
            icon={Article}
            color="info"
            trend="up"
            trendValue={`+${resourceMetrics.resourcesLast7Days} this week`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Downloads"
            value={engagementMetrics.totalDownloads.toLocaleString()}
            icon={Download}
            color="warning"
          />
        </Grid>
      </MetricGrid>

      {/* Profile Completion & Resource Status */}
      <MetricGrid>
        <Grid item xs={12} md={6} mt={3}>
          <ProgressCard
            title="Profile Completion Rate"
            value={studentsOverview.studentsWithProfile}
            total={studentsOverview.totalStudents}
            percentage={studentsOverview.profileCompletionPercentage}
            icon={PersonAdd}
            color="success"
          />
        </Grid>
        <Grid item xs={12} md={6} mt={3}>
          <ProgressCard
            title="Published Resources"
            value={resourceMetrics.publishedResources}
            total={resourceMetrics.totalResourcesByStudents}
            percentage={Math.round((resourceMetrics.publishedResources / resourceMetrics.totalResourcesByStudents) * 100)}
            icon={CheckCircle}
            color="primary"
          />
        </Grid>
      </MetricGrid>

      {/* Resource Breakdown - NEW COMPONENT */}
      <Box mt={4}>
        <ResourceBreakdown
          published={resourceMetrics.publishedResources}
          draft={resourceMetrics.draftResources}
          archived={resourceMetrics.archivedResources}
          total={resourceMetrics.totalResourcesByStudents}
        />
      </Box>

      {/* Engagement Metrics */}
      <Box mt={4}>
        <Typography variant="h5" fontWeight="600" mb={2}>
          Engagement Metrics
        </Typography>
        <MetricGrid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Avg Resources/Student"
              value={engagementMetrics.avgResourcesPerStudent}
              icon={Article}
              color="secondary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Avg Favorites/Student"
              value={engagementMetrics.avgFavoritesPerStudent}
              icon={Star}
              color="warning"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Avg Student Rating"
              value={engagementMetrics.avgRatingGivenByStudents}
              icon={ThumbUp}
              color="success"
              subtitle="Out of 5.0"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Resources (30 days)"
              value={resourceMetrics.resourcesLast30Days}
              icon={TrendingUp}
              color="info"
              trend="up"
              trendValue={`${resourceMetrics.resourcesLast7Days} last week`}
            />
          </Grid>
        </MetricGrid>
      </Box>

      {/* Top Performer */}
      <Box mt={4}>
        <Typography variant="h5" fontWeight="600" mb={2}>
          Top Contributor
        </Typography>
        <TopPerformerCard
          name={topPerformers.mostActiveStudentName}
          resourceCount={topPerformers.mostActiveStudentResources}
          id={topPerformers.mostActiveStudentId}
        />
      </Box>
    </Box>
  );
};

export default Overview;
