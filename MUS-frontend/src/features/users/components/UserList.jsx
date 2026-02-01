import React, { useState, useEffect } from 'react';
import {
  Card,
  PrimaryButton,
  TextField,
  IconButton,
  Avatar,
  Badge,
  Alert,
  Loading,
  Skeleton,
  Divider,
} from '../../../shared/components/ui';
import { getUsers } from '../services/userService';

// Mock user data
const mockUsers = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: 'https://i.pravatar.cc/150?img=1',
    status: 'Active',
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    avatar: 'https://i.pravatar.cc/150?img=2',
    status: 'Inactive',
  },
  {
    id: 3,
    name: 'Peter Jones',
    email: 'peter.jones@example.com',
    avatar: 'https://i.pravatar.cc/150?img=3',
    status: 'Active',
  },
];

export const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Replace with actual API call
        // const fetchedUsers = await getUsers();
        // setUsers(fetchedUsers);
        setTimeout(() => {
          setUsers(mockUsers);
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError('Failed to fetch users.');
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2>User Management</h2>
        <PrimaryButton>New User</PrimaryButton>
      </div>
      <TextField
        label="Search Users"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ marginBottom: '16px' }}
      />
      {error && <Alert severity="error">{error}</Alert>}
      {loading ? (
        <Skeleton count={3} height={60} />
      ) : (
        <div>
          {filteredUsers.map((user, index) => (
            <React.Fragment key={user.id}>
              <div style={{ display: 'flex', alignItems: 'center', padding: '16px 0' }}>
                <Avatar src={user.avatar} alt={user.name} />
                <div style={{ marginLeft: '16px', flexGrow: 1 }}>
                  <div style={{ fontWeight: 'bold' }}>{user.name}</div>
                  <div>{user.email}</div>
                </div>
                <Badge label={user.status} color={user.status === 'Active' ? 'success' : 'default'} />
                <div style={{ marginLeft: '16px' }}>
                  <IconButton icon="edit" />
                  <IconButton icon="delete" />
                </div>
              </div>
              {index < filteredUsers.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </div>
      )}
    </Card>
  );
};