import React, { useState, useEffect } from 'react';
import {
  Card,
  PrimaryButton,
  TextField,
  Alert,
  Loading,
  Skeleton,
  Modal,
  useNotification,
} from '../../../shared/components/ui';
import { PageHeader, ConfirmDialog } from '../../../shared/components/common';
import { Box, Typography, Tabs, Tab } from '@mui/material';
import { ResourceCard } from './ResourceCard';
import { ResourceForm } from './ResourceForm';

// Mock resource data
const mockResources = [
  {
    id: 1,
    title: 'React Fundamentals',
    description: 'A comprehensive video course on the fundamentals of React and modern hooks.',
    author: 'John Doe',
    authorAvatar: 'https://i.pravatar.cc/150?img=11',
    type: 'video',
    url: 'https://example.com/react',
    createdAt: '2023-10-01T10:00:00Z',
  },
  {
    id: 2,
    title: 'Advanced CSS Architecture',
    description: 'Learn how to structure your CSS for large scale applications. PDF Guide.',
    author: 'Jane Smith',
    authorAvatar: 'https://i.pravatar.cc/150?img=5',
    type: 'pdf',
    url: 'https://example.com/css',
    createdAt: '2023-10-05T14:30:00Z',
  },
  {
    id: 3,
    title: 'JavaScript Algorithms',
    description: 'Practice common algorithms and data structures in JavaScript.',
    author: 'Peter Jones',
    authorAvatar: 'https://i.pravatar.cc/150?img=3',
    type: 'article',
    url: 'https://example.com/js',
    createdAt: '2023-10-10T09:15:00Z',
  },
];

export const ResourceList = () => {
  const { showSuccess } = useNotification();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentTab, setCurrentTab] = useState('all');
  
  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [resourceToDelete, setResourceToDelete] = useState(null);

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

  const handleCreate = () => {
    setEditingResource(null);
    setIsFormOpen(true);
  };

  const handleEdit = (resource) => {
    setEditingResource(resource);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (resource) => {
    setResourceToDelete(resource);
  };

  const handleConfirmDelete = () => {
    setResources(resources.filter(r => r.id !== resourceToDelete.id));
    showSuccess('Resource deleted successfully');
    setResourceToDelete(null);
  };

  const handleSave = (resourceData) => {
    if (editingResource) {
      setResources(resources.map(r => r.id === editingResource.id ? { ...r, ...resourceData } : r));
      showSuccess('Resource updated successfully');
    } else {
      const newResource = {
        id: resources.length + 1,
        ...resourceData,
        author: 'Current User', // Mock
        authorAvatar: 'https://i.pravatar.cc/150?img=60',
        createdAt: new Date().toISOString(),
      };
      setResources([newResource, ...resources]);
      showSuccess('Resource created successfully');
    }
    setIsFormOpen(false);
  };

  const filteredResources = resources.filter((resource) => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = currentTab === 'all' || resource.type === currentTab;
    return matchesSearch && matchesType;
  });

  return (
    <>
      <PageHeader 
        title="Resources Library" 
        rightContent={<PrimaryButton onClick={handleCreate}>Share Resource</PrimaryButton>}
      />
      
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={currentTab} onChange={(e, val) => setCurrentTab(val)}>
            <Tab label="All Resources" value="all" />
            <Tab label="Videos" value="video" />
            <Tab label="Documents" value="pdf" />
            <Tab label="Articles" value="article" />
          </Tabs>
        </Box>

        <Box sx={{ mb: 3 }}>
          <TextField
            label="Search Resources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            fullWidth
          />
        </Box>

        {error && <Alert severity="error">{error}</Alert>}
        
        {loading ? (
          <Box sx={{ display: 'flex', gap: 3, overflowX: 'auto', pb: 2 }}>
            {[1, 2, 3].map((i) => (
              <Box key={i} sx={{ minWidth: 300, flexShrink: 0 }}>
                <Skeleton height={200} />
                <Skeleton />
                <Skeleton width="60%" />
              </Box>
            ))}
          </Box>
        ) : (
          <Box
            sx={{
              display: 'flex',
              gap: 3,
              overflowX: 'auto',
              pb: 2,
              '&::-webkit-scrollbar': { height: 8 },
              '&::-webkit-scrollbar-track': { bgcolor: 'grey.100', borderRadius: 4 },
              '&::-webkit-scrollbar-thumb': { bgcolor: 'grey.400', borderRadius: 4 },
              '&::-webkit-scrollbar-thumb:hover': { bgcolor: 'grey.500' },
            }}
          >
            {filteredResources.map((resource) => (
              <Box key={resource.id} sx={{ minWidth: 320, maxWidth: 320, flexShrink: 0 }}>
                <ResourceCard 
                  resource={resource} 
                  onEdit={() => handleEdit(resource)}
                  onDelete={() => handleDeleteClick(resource)}
                />
              </Box>
            ))}
            {filteredResources.length === 0 && (
              <Box sx={{ width: '100%', p: 4, textAlign: 'center', color: 'text.secondary' }}>
                <Typography>No resources found matching your criteria.</Typography>
              </Box>
            )}
          </Box>
        )}
      </Card>

      <Modal
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingResource ? "Edit Resource" : "Share New Resource"}
      >
        <ResourceForm 
          initialValues={editingResource} 
          onSave={handleSave} 
          onCancel={() => setIsFormOpen(false)} 
        />
      </Modal>

      <ConfirmDialog
        open={!!resourceToDelete}
        onClose={() => setResourceToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Resource"
        description={`Are you sure you want to delete "${resourceToDelete?.title}"? This action cannot be undone.`}
      />
    </>
  );
};