import React from 'react';
import {
  Card,
  Box,
  Typography,
  Avatar,
  Stack,
  Chip,
  Button,
  IconButton,
  Tooltip,
  alpha,
  useTheme
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Visibility,
  PictureAsPdf,
  VideoLibrary,
  Description,
  Link as LinkIcon,
  MoreVert
} from '@mui/icons-material';

export const ModerationItem = ({ resource, onApprove, onReject, onView }) => {
  const theme = useTheme();

  const getTypeConfig = (type) => {
    const configs = {
      video: {
        icon: <VideoLibrary />,
        color: '#FF6B6B',
        bgColor: alpha('#FF6B6B', 0.1),
        label: 'Video'
      },
      pdf: {
        icon: <PictureAsPdf />,
        color: '#4ECDC4',
        bgColor: alpha('#4ECDC4', 0.1),
        label: 'PDF'
      },
      article: {
        icon: <Description />,
        color: '#95E1D3',
        bgColor: alpha('#95E1D3', 0.1),
        label: 'Article'
      },
      default: {
        icon: <LinkIcon />,
        color: '#A8DADC',
        bgColor: alpha('#A8DADC', 0.1),
        label: 'Link'
      }
    };
    return configs[type] || configs.default;
  };

  const getStatusConfig = (status) => {
    const configs = {
      approved: { 
        color: 'success', 
        label: 'Approved',
        bgColor: alpha(theme.palette.success.main, 0.1)
      },
      rejected: { 
        color: 'error', 
        label: 'Rejected',
        bgColor: alpha(theme.palette.error.main, 0.1)
      },
      pending: { 
        color: 'warning', 
        label: 'Pending Review',
        bgColor: alpha(theme.palette.warning.main, 0.1)
      }
    };
    return configs[status] || configs.pending;
  };

  const typeConfig = getTypeConfig(resource.type);
  const statusConfig = getStatusConfig(resource.status);

  return (
    <Card
      sx={{
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        border: '1px solid',
        borderColor: 'divider',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[8],
          borderColor: 'primary.main',
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: `linear-gradient(90deg, ${typeConfig.color}, ${alpha(typeConfig.color, 0.6)})`,
          opacity: 0,
          transition: 'opacity 0.3s ease',
        },
        '&:hover::before': {
          opacity: 1,
        }
      }}
    >
      <Box sx={{ p: 3 }}>
        {/* Header Section */}
        <Stack direction="row" spacing={2} alignItems="flex-start" mb={2}>
          {/* Type Icon */}
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: typeConfig.bgColor,
              color: typeConfig.color,
              flexShrink: 0,
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'scale(1.1) rotate(5deg)',
              }
            }}
          >
            {typeConfig.icon}
          </Box>

          {/* Title and Description */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  color: 'text.primary',
                }}
              >
                {resource.title}
              </Typography>
              <Chip
                label={typeConfig.label}
                size="small"
                sx={{
                  height: 22,
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  bgcolor: typeConfig.bgColor,
                  color: typeConfig.color,
                  border: 'none',
                }}
              />
            </Stack>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                lineHeight: 1.6,
                mb: 2
              }}
            >
              {resource.description}
            </Typography>
          </Box>

          {/* Status Badge */}
          <Chip
            label={statusConfig.label}
            color={statusConfig.color}
            size="small"
            sx={{
              height: 28,
              fontWeight: 600,
              borderRadius: '8px',
              bgcolor: statusConfig.bgColor,
            }}
          />
        </Stack>

        {/* Author and Date Section */}
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          justifyContent="space-between"
          sx={{
            py: 2,
            borderTop: '1px solid',
            borderBottom: '1px solid',
            borderColor: 'divider',
            mb: 2,
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar
              src={resource.authorAvatar}
              alt={resource.author}
              sx={{
                width: 32,
                height: 32,
                border: '2px solid',
                borderColor: 'background.paper',
                boxShadow: theme.shadows[2],
              }}
            />
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', fontSize: '0.7rem', mb: 0.25 }}
              >
                Submitted by
              </Typography>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, fontSize: '0.875rem' }}
              >
                {resource.author}
              </Typography>
            </Box>
          </Stack>

          <Box sx={{ textAlign: 'right' }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', fontSize: '0.7rem', mb: 0.25 }}
            >
              Submitted on
            </Typography>
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, fontSize: '0.875rem' }}
            >
              {new Date(resource.submittedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </Typography>
          </Box>
        </Stack>

        {/* Action Buttons */}
        <Stack direction="row" spacing={1.5} justifyContent="flex-end">
          <Button
            variant="outlined"
            size="medium"
            startIcon={<Visibility />}
            onClick={() => onView(resource)}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              px: 2.5,
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: theme.shadows[4],
              }
            }}
          >
            View
          </Button>

          {resource.status === 'pending' && (
            <>
              <Button
                variant="contained"
                size="medium"
                startIcon={<CheckCircle />}
                onClick={() => onApprove(resource)}
                color="success"
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 2.5,
                  transition: 'all 0.2s ease',
                  boxShadow: 'none',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: theme.shadows[8],
                  }
                }}
              >
                Approve
              </Button>

              <Button
                variant="contained"
                size="medium"
                startIcon={<Cancel />}
                onClick={() => onReject(resource)}
                color="error"
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 2.5,
                  transition: 'all 0.2s ease',
                  boxShadow: 'none',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: theme.shadows[8],
                  }
                }}
              >
                Reject
              </Button>
            </>
          )}
        </Stack>
      </Box>
    </Card>
  );
};
