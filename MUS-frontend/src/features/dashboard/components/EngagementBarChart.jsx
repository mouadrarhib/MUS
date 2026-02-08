// src/features/dashboard/components/EngagementBarChart.jsx
import { Card, CardContent, Typography, Box, alpha } from '@mui/material';
import { BarChart as BarChartIcon } from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const COLORS = ['#1976d2', '#2e7d32', '#ed6c02', '#9c27b0'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
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
        <Typography variant="caption" fontWeight="600" mb={0.5} display="block">
          {label}
        </Typography>
        <Typography variant="subtitle2" fontWeight="700" color="primary.main">
          {payload[0].value.toLocaleString()}
        </Typography>
      </Box>
    );
  }
  return null;
};

const EngagementBarChart = ({ data, title = "Engagement Overview" }) => {
  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        minHeight: { xs: 320, md: 380 },
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
            background: (theme) => alpha(theme.palette.secondary.main, 0.02),
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
                  `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.2)} 0%, ${alpha(theme.palette.secondary.light, 0.3)} 100%)`,
              }}
            >
              <BarChartIcon sx={{ color: 'secondary.main', fontSize: { xs: 18, sm: 20 } }} />
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight="600" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                {title}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
                Key performance indicators
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Chart */}
        <Box sx={{ flex: 1, p: { xs: 1.5, sm: 2 }, minHeight: 240 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              barSize={20}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" horizontal={false} />
              <XAxis 
                type="number" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#666', fontSize: 10 }}
              />
              <YAxis
                type="category"
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#333', fontSize: 11 }}
                width={80}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
              <Bar 
                dataKey="value" 
                radius={[0, 4, 4, 0]}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default EngagementBarChart;
