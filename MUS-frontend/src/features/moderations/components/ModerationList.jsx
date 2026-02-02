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
  Badge,
} from '../../../shared/components/ui';

// Mock moderation data
const mockModerations = [
  {
    id: 1,
    content: 'Inappropriate language in a comment.',
    author: 'User123',
    status: 'Pending',
  },
  {
    id: 2,
    content: 'Spam in the forums.',
    author: 'User456',
    status: 'Approved',
  },
  {
    id: 3,
    content: 'Misleading information in a resource.',
    author: 'User789',
    status: 'Rejected',
  },
];

export const ModerationList = () => {
  const [moderations, setModerations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchModerations = async () => {
      try {
        // Replace with actual API call
        setTimeout(() => {
          setModerations(mockModerations);
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError('Failed to fetch moderations.');
        setLoading(false);
      }
    };

    fetchModerations();
  }, []);

  const filteredModerations = moderations.filter((moderation) =>
    moderation.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getBadgeColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'warning';
      case 'Approved':
        return 'success';
      case 'Rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2>Moderation Queue</h2>
      </div>
      <TextField
        label="Search Moderations"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ marginBottom: '16px' }}
      />
      {error && <Alert severity="error">{error}</Alert>}
      {loading ? (
        <Skeleton count={3} height={60} />
      ) : (
        <div>
          {filteredModerations.map((moderation, index) => (
            <React.Fragment key={moderation.id}>
              <div style={{ display: 'flex', alignItems: 'center', padding: '16px 0' }}>
                <div style={{ flexGrow: 1 }}>
                  <div style={{ fontWeight: 'bold' }}>{moderation.content}</div>
                  <div>Reported by: {moderation.author}</div>
                </div>
                <Badge label={moderation.status} color={getBadgeColor(moderation.status)} />
                <div style={{ marginLeft: '16px' }}>
                  <IconButton icon="check" />
                  <IconButton icon="close" />
                </div>
              </div>
              {index < filteredModerations.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </div>
      )}
    </Card>
  );
};