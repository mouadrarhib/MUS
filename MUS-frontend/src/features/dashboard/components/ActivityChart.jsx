// src/features/dashboard/components/ActivityChart.jsx
import { Card, CardContent, Typography, Box, alpha, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { ShowChart } from '@mui/icons-material';
import { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

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
        {payload.map((entry, index) => (
          <Box key={index} display="flex" alignItems="center" gap={0.5}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: entry.color,
              }}
            />
            <Typography variant="caption" color="text.secondary">
              {entry.name}: <strong>{entry.value.toLocaleString()}</strong>
            </Typography>
          </Box>
        ))}
      </Box>
    );
  }
  return null;
};

const ActivityChart = ({ data, title = "Platform Activity" }) => {
  const [timeRange, setTimeRange] = useState('week');

  const handleTimeChange = (event, newValue) => {
    if (newValue !== null) {
      setTimeRange(newValue);
    }
  };

  const chartData = data?.[timeRange] || [];

  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        minHeight: { xs: 350, md: 400 },
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        background: (theme) => theme.palette.mode === 'dark' 
          ? 'linear-gradient(135deg, #1a1a1a 0%, #141414 100%)'
          : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
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
            background: (theme) => alpha(theme.palette.primary.main, 0.02),
          }}
        >
          <Box 
            display="flex" 
            alignItems="center" 
            justifyContent="space-between" 
            flexWrap="wrap" 
            gap={1.5}
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
                    `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.2)} 0%, ${alpha(theme.palette.primary.light, 0.3)} 100%)`,
                }}
              >
                <ShowChart sx={{ color: 'primary.main', fontSize: { xs: 18, sm: 20 } }} />
              </Box>
              <Box>
                <Typography variant="subtitle1" fontWeight="600" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                  {title}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
                  Uploads and downloads over time
                </Typography>
              </Box>
            </Box>
            
            <ToggleButtonGroup
              value={timeRange}
              exclusive
              onChange={handleTimeChange}
              size="small"
              sx={{
                '& .MuiToggleButton-root': {
                  px: { xs: 1, sm: 1.5 },
                  py: 0.25,
                  fontSize: '0.7rem',
                  border: '1px solid',
                  borderColor: 'divider',
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                  },
                },
              }}
            >
              <ToggleButton value="week">7D</ToggleButton>
              <ToggleButton value="month">30D</ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Box>

        {/* Chart */}
        <Box sx={{ flex: 1, p: { xs: 1.5, sm: 2 }, minHeight: 250 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorUploads" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1976d2" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#1976d2" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorDownloads" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2e7d32" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2e7d32" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#666', fontSize: 11 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#666', fontSize: 11 }}
                width={40}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ paddingTop: 10, fontSize: 12 }}
                iconType="circle"
                iconSize={8}
              />
              <Area
                type="monotone"
                dataKey="uploads"
                name="Uploads"
                stroke="#1976d2"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorUploads)"
                dot={{ fill: '#1976d2', strokeWidth: 1, r: 3 }}
                activeDot={{ r: 5, stroke: '#fff', strokeWidth: 2 }}
              />
              <Area
                type="monotone"
                dataKey="downloads"
                name="Downloads"
                stroke="#2e7d32"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorDownloads)"
                dot={{ fill: '#2e7d32', strokeWidth: 1, r: 3 }}
                activeDot={{ r: 5, stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ActivityChart;
