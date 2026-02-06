// src/features/dashboard/components/ResourceBreakdown.jsx
import { Card, CardContent, Typography, Box, alpha, Divider } from '@mui/material';
import { 
  CheckCircle, 
  Edit, 
  Archive,
  TrendingUp 
} from '@mui/icons-material';

const ResourceBreakdown = ({ published, draft, archived, total }) => {
  const stats = [
    {
      label: 'Published',
      value: published,
      percentage: ((published / total) * 100).toFixed(1),
      color: 'success',
      icon: CheckCircle,
      description: 'Live resources'
    },
    {
      label: 'Drafts',
      value: draft,
      percentage: ((draft / total) * 100).toFixed(1),
      color: 'warning',
      icon: Edit,
      description: 'In progress'
    },
    {
      label: 'Archived',
      value: archived,
      percentage: ((archived / total) * 100).toFixed(1),
      color: 'error',
      icon: Archive,
      description: 'Not visible'
    },
  ];

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        overflow: 'hidden',
      }}
    >
      <CardContent sx={{ p: 0 }}>
        {/* Header */}
        <Box 
          sx={{ 
            px: 3, 
            py: 2.5,
            borderBottom: '1px solid',
            borderColor: 'divider',
            background: (theme) => alpha(theme.palette.primary.main, 0.02),
          }}
        >
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={1.5}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: (theme) => 
                    `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.2)} 0%, ${alpha(theme.palette.primary.light, 0.3)} 100%)`,
                }}
              >
                <TrendingUp sx={{ color: 'primary.main', fontSize: 22 }} />
              </Box>
              <Typography variant="h6" fontWeight="600">
                Resource Status Overview
              </Typography>
            </Box>
            <Box 
              sx={{ 
                px: 2, 
                py: 0.5, 
                borderRadius: 2,
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
              }}
            >
              <Typography variant="body2" fontWeight="600" color="primary.main">
                {total.toLocaleString()} Total
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Stats Grid */}
        <Box sx={{ p: 3 }}>
          <Box 
            display="grid" 
            gridTemplateColumns={{ xs: '1fr', sm: 'repeat(3, 1fr)' }}
            gap={2}
          >
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Box key={index}>
                  <Card
                    elevation={0}
                    sx={{
                      height: '100%',
                      borderRadius: 2.5,
                      border: '1px solid',
                      borderColor: 'divider',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: (theme) => `0 8px 24px ${alpha(theme.palette[stat.color].main, 0.2)}`,
                        borderColor: `${stat.color}.main`,
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '3px',
                        background: (theme) => theme.palette[stat.color].main,
                      }
                    }}
                  >
                    <CardContent sx={{ p: 2.5 }}>
                      {/* Icon & Label */}
                      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                        <Box
                          sx={{
                            width: 44,
                            height: 44,
                            borderRadius: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: (theme) => alpha(theme.palette[stat.color].main, 0.1),
                          }}
                        >
                          <Icon sx={{ color: `${stat.color}.main`, fontSize: 24 }} />
                        </Box>
                        <Box
                          sx={{
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 1.5,
                            bgcolor: (theme) => alpha(theme.palette[stat.color].main, 0.1),
                          }}
                        >
                          <Typography 
                            variant="caption" 
                            fontWeight="700"
                            color={`${stat.color}.main`}
                          >
                            {stat.percentage}%
                          </Typography>
                        </Box>
                      </Box>

                      {/* Value */}
                      <Typography 
                        variant="h3" 
                        fontWeight="700"
                        mb={0.5}
                        sx={{
                          background: (theme) => 
                            `linear-gradient(135deg, ${theme.palette[stat.color].main} 0%, ${theme.palette[stat.color].light} 100%)`,
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                        }}
                      >
                        {stat.value.toLocaleString()}
                      </Typography>

                      {/* Label */}
                      <Typography 
                        variant="body2" 
                        fontWeight="600"
                        color="text.primary"
                        mb={0.5}
                      >
                        {stat.label}
                      </Typography>

                      {/* Description */}
                      <Typography 
                        variant="caption" 
                        color="text.secondary"
                        sx={{ opacity: 0.8 }}
                      >
                        {stat.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Footer Summary */}
        <Box 
          sx={{ 
            px: 3, 
            py: 2,
            borderTop: '1px solid',
            borderColor: 'divider',
            background: (theme) => alpha(theme.palette.grey[100], 0.5),
          }}
        >
          <Box 
            display="flex" 
            flexWrap="wrap"
            gap={3}
            justifyContent="space-around"
            alignItems="center"
          >
            <Box textAlign="center">
              <Typography variant="caption" color="text.secondary" fontWeight={500}>
                Completion Rate
              </Typography>
              <Typography variant="h6" fontWeight="700" color="success.main">
                {((published / total) * 100).toFixed(1)}%
              </Typography>
            </Box>
            <Divider orientation="vertical" flexItem />
            <Box textAlign="center">
              <Typography variant="caption" color="text.secondary" fontWeight={500}>
                In Progress
              </Typography>
              <Typography variant="h6" fontWeight="700" color="warning.main">
                {((draft / total) * 100).toFixed(1)}%
              </Typography>
            </Box>
            <Divider orientation="vertical" flexItem />
            <Box textAlign="center">
              <Typography variant="caption" color="text.secondary" fontWeight={500}>
                Inactive Rate
              </Typography>
              <Typography variant="h6" fontWeight="700" color="error.main">
                {((archived / total) * 100).toFixed(1)}%
              </Typography>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ResourceBreakdown;
