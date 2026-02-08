// src/features/dashboard/components/MiniChart.jsx
import { Box, Typography, alpha } from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
} from 'recharts';

const COLORS = ['#2e7d32', '#ed6c02', '#9e9e9e', '#1976d2'];

// Donut chart for resource distribution
export const ResourceDonut = ({ published, draft, archived, total }) => {
  const data = [
    { name: 'Published', value: parseInt(published) || 0, color: COLORS[0] },
    { name: 'Draft', value: parseInt(draft) || 0, color: COLORS[1] },
    { name: 'Archived', value: parseInt(archived) || 0, color: COLORS[2] },
  ].filter(d => d.value > 0);

  if (data.length === 0) {
    data.push({ name: 'No Data', value: 1, color: '#e0e0e0' });
  }

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        background: (theme) => theme.palette.mode === 'dark' 
          ? 'linear-gradient(135deg, #1a1a1a 0%, #141414 100%)'
          : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        height: '100%',
      }}
    >
      <Typography variant="subtitle2" fontWeight="600" mb={1}>
        Resource Status
      </Typography>
      <Box sx={{ height: 140 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={35}
              outerRadius={55}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value, name) => [value, name]}
              contentStyle={{ 
                borderRadius: 8, 
                border: '1px solid #e0e0e0',
                fontSize: 12,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </Box>
      <Box display="flex" justifyContent="center" gap={2} flexWrap="wrap">
        {[
          { label: 'Published', color: COLORS[0], value: published },
          { label: 'Draft', color: COLORS[1], value: draft },
          { label: 'Archived', color: COLORS[2], value: archived },
        ].map((item, i) => (
          <Box key={i} display="flex" alignItems="center" gap={0.5}>
            <Box sx={{ width: 8, height: 8, borderRadius: 0.5, bgcolor: item.color }} />
            <Typography variant="caption" color="text.secondary">
              {item.label}: {item.value}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

// Simple bar chart for engagement
export const EngagementBars = ({ favorites, ratings, avgRating }) => {
  const data = [
    { name: 'Favorites', value: parseInt(favorites) || 0 },
    { name: 'Ratings', value: parseInt(ratings) || 0 },
  ];

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        background: (theme) => theme.palette.mode === 'dark' 
          ? 'linear-gradient(135deg, #1a1a1a 0%, #141414 100%)'
          : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        height: '100%',
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="subtitle2" fontWeight="600">
          Engagement
        </Typography>
        <Box 
          sx={{ 
            px: 1, 
            py: 0.25, 
            borderRadius: 1, 
            bgcolor: (theme) => alpha(theme.palette.warning.main, 0.1),
          }}
        >
          <Typography variant="caption" fontWeight="600" color="warning.main">
            {parseFloat(avgRating || 0).toFixed(1)} avg
          </Typography>
        </Box>
      </Box>
      <Box sx={{ height: 140 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 50, right: 10 }}>
            <XAxis type="number" hide />
            <Tooltip 
              formatter={(value) => [value, '']}
              contentStyle={{ 
                borderRadius: 8, 
                border: '1px solid #e0e0e0',
                fontSize: 12,
              }}
            />
            <Bar 
              dataKey="value" 
              fill="#1976d2" 
              radius={[0, 4, 4, 0]}
              barSize={24}
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>
      <Box display="flex" justifyContent="space-around">
        <Box textAlign="center">
          <Typography variant="h6" fontWeight="700" color="primary.main">
            {favorites}
          </Typography>
          <Typography variant="caption" color="text.secondary">Favorites</Typography>
        </Box>
        <Box textAlign="center">
          <Typography variant="h6" fontWeight="700" color="success.main">
            {ratings}
          </Typography>
          <Typography variant="caption" color="text.secondary">Ratings</Typography>
        </Box>
      </Box>
    </Box>
  );
};
