// src/features/dashboard/components/ResourceDistributionChart.jsx
import { Card, CardContent, Typography, Box, alpha } from '@mui/material';
import { PieChart as PieChartIcon } from '@mui/icons-material';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

const COLORS = {
  published: '#2e7d32',
  draft: '#ed6c02',
  archived: '#9e9e9e',
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <Box
        sx={{
          bgcolor: 'background.paper',
          p: 1.5,
          borderRadius: 2,
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box display="flex" alignItems="center" gap={0.5}>
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              bgcolor: data.payload.fill,
            }}
          />
          <Typography variant="caption" fontWeight="600">
            {data.name}
          </Typography>
        </Box>
        <Typography variant="subtitle2" fontWeight="700" mt={0.5}>
          {data.value.toLocaleString()} ({data.payload.percentage}%)
        </Typography>
      </Box>
    );
  }
  return null;
};

const ResourceDistributionChart = ({ published, draft, archived, total }) => {
  const data = [
    {
      name: 'Published',
      value: published,
      percentage: ((published / total) * 100).toFixed(1),
      fill: COLORS.published,
    },
    {
      name: 'Drafts',
      value: draft,
      percentage: ((draft / total) * 100).toFixed(1),
      fill: COLORS.draft,
    },
    {
      name: 'Archived',
      value: archived,
      percentage: ((archived / total) * 100).toFixed(1),
      fill: COLORS.archived,
    },
  ];

  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        minHeight: { xs: 350, md: 400 },
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        overflow: 'hidden',
      }}
    >
      <CardContent sx={{ p: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box
          sx={{
            px: { xs: 2, sm: 3 },
            py: { xs: 1.5, sm: 2 },
            borderBottom: '1px solid',
            borderColor: 'divider',
            background: (theme) => alpha(theme.palette.info.main, 0.02),
          }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <Box
              sx={{
                width: { xs: 32, sm: 36 },
                height: { xs: 32, sm: 36 },
                borderRadius: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: (theme) =>
                  `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.2)} 0%, ${alpha(theme.palette.info.light, 0.3)} 100%)`,
              }}
            >
              <PieChartIcon sx={{ color: 'info.main', fontSize: { xs: 18, sm: 20 } }} />
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight="600" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                Resource Distribution
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {total.toLocaleString()} total
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Chart & Legend */}
        <Box sx={{ flex: 1, p: { xs: 1.5, sm: 2 }, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ flex: 1, minHeight: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius="50%"
                  outerRadius="80%"
                  paddingAngle={3}
                  dataKey="value"
                  cornerRadius={4}
                  stroke="none"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </Box>
          
          {/* Legend */}
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: { xs: 2, sm: 3 },
              flexWrap: 'wrap',
              mt: 1,
            }}
          >
            {data.map((item, index) => (
              <Box key={index} display="flex" alignItems="center" gap={0.5}>
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: 0.5,
                    bgcolor: item.fill,
                  }}
                />
                <Typography variant="caption" color="text.secondary">
                  {item.name}: <strong>{item.percentage}%</strong>
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Footer */}
        <Box
          sx={{
            px: { xs: 2, sm: 3 },
            py: 1.5,
            borderTop: '1px solid',
            borderColor: 'divider',
            background: (theme) => alpha(theme.palette.grey[100], 0.5),
            display: 'flex',
            justifyContent: 'center',
            gap: { xs: 3, sm: 4 },
          }}
        >
          <Box textAlign="center">
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              Success
            </Typography>
            <Typography variant="subtitle2" fontWeight="700" color="success.main">
              {((published / total) * 100).toFixed(0)}%
            </Typography>
          </Box>
          <Box textAlign="center">
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              Pending
            </Typography>
            <Typography variant="subtitle2" fontWeight="700" color="warning.main">
              {draft}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ResourceDistributionChart;
