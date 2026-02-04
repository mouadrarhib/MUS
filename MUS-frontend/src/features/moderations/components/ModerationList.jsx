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
import { Box, Tabs, Tab, Typography, Button, Card } from '@mui/material';
import { ModerationItem } from './ModerationItem';

// Mock moderation data
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
  const { showSuccess } = useNotification();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentTab, setCurrentTab] = useState('pending');
  
  // Rejection Modal State
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [resourceToReject, setResourceToReject] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    const fetchResources = async () => {
      try {
        // Replace with actual API call
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

  return (
    <>
      <PageHeader title="Content Moderation" />
      
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={currentTab} onChange={(e, val) => setCurrentTab(val)}>
            <Tab label="Pending Reviews" value="pending" />
            <Tab label="Approved" value="approved" />
            <Tab label="Rejected" value="rejected" />
            <Tab label="All History" value="all" />
          </Tabs>
        </Box>

        <TextField
          label="Search Resources..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ marginBottom: '24px' }}
        />

        {error && <Alert severity="error">{error}</Alert>}
        
        {loading ? (
          <Skeleton count={3} height={100} />
        ) : (
          <Box>
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
              <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                <Typography>No resources found in this category.</Typography>
              </Box>
            )}
          </Box>
        )}
      </Card>

      <Modal
        open={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="Reject Resource"
      >
        <Box sx={{ p: 1 }}>
          <Typography variant="body2" color="text.secondary" paragraph>
            Please provide a reason for rejecting this resource. This will be sent to the author.
          </Typography>
          <TextField
            label="Rejection Reason"
            multiline
            rows={4}
            fullWidth
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
          />
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button onClick={() => setIsRejectModalOpen(false)}>Cancel</Button>
            <Button 
              variant="contained" 
              color="error" 
              onClick={handleConfirmReject}
              disabled={!rejectionReason.trim()}
            >
              Reject Resource
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
};
