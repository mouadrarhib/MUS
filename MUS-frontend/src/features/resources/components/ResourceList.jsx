import React, { useState, useEffect } from 'react';
import {
  Card,
  PrimaryButton,
  TextField,
  IconButton,
  Alert,
  Loading,
  Skeleton,
  Divider,
} from '../../../shared/components/ui';
import { ResourceCard } from './ResourceCard';

// Mock resource data
const mockResources = [
  {
    id: 1,
    title: 'React Fundamentals',
    description: 'A course on the fundamentals of React.',
    author: 'John Doe',
    image: 'https://via.placeholder.com/300x200',
  },
  {
    id: 2,
    title: 'Advanced CSS',
    description: 'An advanced course on CSS.',
    author: 'Jane Smith',
    image: 'https://via.placeholder.com/300x200',
  },
  {
    id: 3,
    title: 'JavaScript for Beginners',
    description: 'A beginner-friendly course on JavaScript.',
    author: 'Peter Jones',
    image: 'https://via.placeholder.com/300x200',
  },
];

export const ResourceList = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

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

  const filteredResources = resources.filter((resource) =>
    resource.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2>Resource Management</h2>
        <PrimaryButton>New Resource</PrimaryButton>
      </div>
      <TextField
        label="Search Resources"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ marginBottom: '16px' }}
      />
      {error && <Alert severity="error">{error}</Alert>}
      {loading ? (
        <Skeleton count={3} height={120} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {filteredResources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      )}
    </Card>
  );
};