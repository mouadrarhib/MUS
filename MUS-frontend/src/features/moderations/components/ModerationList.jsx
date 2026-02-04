import { useState, useEffect } from 'react';
import {
  PrimaryButton,
  TextField,
  Alert,
  Loading,
  Skeleton,
  Modal,
  useNotification,
} from '../../../shared/components/ui';
import { PageHeader } from '../../../shared/components/common';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Button,
  Card,
  Stack,
  InputAdornment,
  Chip,
  Fade,
  alpha,
  useTheme
} from '@mui/material';
import {
  Search,
  FilterList,
  HourglassEmpty,
  CheckCircle,
  Cancel
} from '@mui/icons-material';
import { ModerationItem } from './ModerationItem';

const mockResources = [
  {
    id: 1,
    title: 'Introduction to React Hooks',
    description: 'A comprehensive video tutorial covering useState, useEffect, and custom hooks.',
    type: 'video',
    url: 'https://example.com/react-hooks',
    author: 'Alex Johnson',
    authorAvatar: 'https://i.pravatar.cc/150?img=11',
    submittedAt: '2023-10-27T10:30:00Z',
    status: 'pending',
  },
  {
    id: 2,
    title: 'Data Structures Cheatsheet',
    description: 'Quick reference guide for common data structures and their time complexities.',
    type: 'pdf',
    url: 'https://example.com/ds-cheatsheet.pdf',
    author: 'Maria Garcia',
    authorAvatar: 'https://i.pravatar.cc/150?img=5',
    submittedAt: '2023-10-26T15:45:00Z',
    status: 'pending',
  },
  {
    id: 3,
    title: 'Machine Learning Basics',
    description: 'An article explaining the fundamental concepts of ML.',
    type: 'article',
    url: 'https://example.com/ml-basics',
    author: 'Sam Wilson',
    authorAvatar: 'https://i.pravatar.cc/150?img=3',
    submittedAt: '2023-10-25T09:20:00Z',
    status: 'approved',
  },
];

export const ModerationList = () => {
  const theme = useTheme();
  const { showSuccess } = useNotification();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentTab, setCurrentTab] = useState('pending');
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [resourceToReject, setResourceToReject] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    const fetchResources = async () => {
      try {
        setTimeout(() => {
          setResources(mockResources);
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError('Failed to fetch resources.');
        setLoading(false);
      }
    };
    fetchResources();
  }, []);

  const handleApprove = (resource) => {
    setResources(resources.map(r =>
      r.id === resource.id ? { ...r, status: 'approved' } : r
    ));
    showSuccess(`Resource "${resource.title}" approved successfully.`);
  };

  const handleRejectClick = (resource) => {
    setResourceToReject(resource);
    setRejectionReason('');
    setIsRejectModalOpen(true);
  };

  const handleConfirmReject = () => {
    if (resourceToReject) {
      setResources(resources.map(r =>
        r.id === resourceToReject.id ? { ...r, status: 'rejected', rejectionReason } : r
      ));
      showSuccess(`Resource "${resourceToReject.title}" rejected.`);
      setIsRejectModalOpen(false);
      setResourceToReject(null);
    }
  };

  const handleView = (resource) => {
    window.open(resource.url, '_blank');
  };

  const filteredResources = resources.filter((resource) => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = currentTab === 'all' || resource.status === currentTab;
    return matchesSearch && matchesTab;
  });

  const getTabIcon = (status) => {
    const icons = {
      pending: <HourglassEmpty sx={{ fontSize: 18 }} />,
      approved: <CheckCircle sx={{ fontSize: 18 }} />,
      rejected: <Cancel sx={{ fontSize: 18 }} />
    };
    return icons[status];
  };

  const getCount = (status) => {
    if (status === 'all') return resources.length;
    return resources.filter(r => r.status === status).length;
  };

  return (
    <>
      <PageHeader
        title="Content Moderation"
        subtitle="Review and manage submitted learning resources"
      />

      <Box sx={{ mb: 4 }}>
        {/* Tabs with Modern Design */}
        <Card
          sx={{
            mb: 3,
            borderRadius: 3,
            boxShadow: theme.shadows[2],
            overflow: 'hidden',
          }}
        >
          <Tabs
            value={currentTab}
            onChange={(e, val) => setCurrentTab(val)}
            sx={{
              px: 2,
              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: '3px 3px 0 0',
              },
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.95rem',
                minHeight: 64,
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                },
              },
            }}
          >
            <Tab
              label={
                <Stack direction="row" spacing={1} alignItems="center">
                  <span>All Resources</span>
                  <Chip
                    label={getCount('all')}
                    size="small"
                    sx={{
                      height: 22,
                      minWidth: 22,
                      fontSize: '0.75rem',
                      fontWeight: 700,
                    }}
                  />
                </Stack>
              }
              value="all"
            />
            <Tab
              label={
                <Stack direction="row" spacing={1} alignItems="center">
                  {getTabIcon('pending')}
                  <span>Pending</span>
                  <Chip
                    label={getCount('pending')}
                    size="small"
                    color="warning"
                    sx={{
                      height: 22,
                      minWidth: 22,
                      fontSize: '0.75rem',
                      fontWeight: 700,
                    }}
                  />
                </Stack>
              }
              value="pending"
            />
            <Tab
              label={
                <Stack direction="row" spacing={1} alignItems="center">
                  {getTabIcon('approved')}
                  <span>Approved</span>
                  <Chip
                    label={getCount('approved')}
                    size="small"
                    color="success"
                    sx={{
                      height: 22,
                      minWidth: 22,
                      fontSize: '0.75rem',
                      fontWeight: 700,
                    }}
                  />
                </Stack>
              }
              value="approved"
            />
            <Tab
              label={
                <Stack direction="row" spacing={1} alignItems="center">
                  {getTabIcon('rejected')}
                  <span>Rejected</span>
                  <Chip
                    label={getCount('rejected')}
                    size="small"
                    color="error"
                    sx={{
                      height: 22,
                      minWidth: 22,
                      fontSize: '0.75rem',
                      fontWeight: 700,
                    }}
                  />
                </Stack>
              }
              value="rejected"
            />
          </Tabs>
        </Card>

        {/* Search Bar */}
        <TextField
          fullWidth
          placeholder="Search resources by title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search color="action" />
              </InputAdornment>
            ),
          }}
          sx={{
            mb: 3,
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              bgcolor: 'background.paper',
              transition: 'all 0.2s ease',
              '&:hover': {
                boxShadow: theme.shadows[4],
              },
              '&.Mui-focused': {
                boxShadow: theme.shadows[8],
              }
            }
          }}
        />

        {/* Error Alert */}
        {error && (
          <Fade in>
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          </Fade>
        )}

        {/* Content */}
        {loading ? (
          <Stack spacing={2}>
            {[1, 2, 3].map((item) => (
              <Skeleton
                key={item}
                variant="rectangular"
                height={200}
                sx={{ borderRadius: 3 }}
              />
            ))}
          </Stack>
        ) : (
          <Fade in timeout={600}>
            <Stack spacing={2.5}>
              {filteredResources.length > 0 ? (
                filteredResources.map((resource) => (
                  <ModerationItem
                    key={resource.id}
                    resource={resource}
                    onApprove={handleApprove}
                    onReject={handleRejectClick}
                    onView={handleView}
                  />
                ))
              ) : (
                <Card
                  sx={{
                    p: 8,
                    textAlign: 'center',
                    borderRadius: 3,
                    border: '2px dashed',
                    borderColor: 'divider',
                  }}
                >
                  <FilterList
                    sx={{
                      fontSize: 64,
                      color: 'text.disabled',
                      mb: 2,
                    }}
                  />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No resources found
                  </Typography>
                  <Typography variant="body2" color="text.disabled">
                    Try adjusting your search or filter criteria
                  </Typography>
                </Card>
              )}
            </Stack>
          </Fade>
        )}
      </Box>

      {/* Rejection Modal */}
      <Modal
        open={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="Reject Resource"
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Please provide a reason for rejecting this resource. This feedback will be sent to the author.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Enter rejection reason..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              }
            }}
          />
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button
              variant="outlined"
              onClick={() => setIsRejectModalOpen(false)}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleConfirmReject}
              disabled={!rejectionReason.trim()}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
              }}
            >
              Reject Resource
            </Button>
          </Stack>
        </Box>
      </Modal>
    </>
  );
};
