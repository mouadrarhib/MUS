import React, { useState, useEffect } from 'react';
import {
  Card,
  TextField,
  Alert,
  Loading,
  PrimaryButton,
} from '../../../shared/components/ui';
import { PageHeader } from '../../../shared/components/common';
import UserTable from './UserTable';

const mockUsers = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: 'https://i.pravatar.cc/150?img=1',
    status: 'active',
    role: 'student',
    university: 'State University',
    semester: 'Fall 2024',
    field: 'Computer Science',
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    avatar: 'https://i.pravatar.cc/150?img=2',
    status: 'inactive',
    role: 'professor',
    university: 'Tech Institute',
    specialty: 'Artificial Intelligence',
  },
  {
    id: 3,
    name: 'Peter Jones',
    email: 'peter.jones@example.com',
    avatar: 'https://i.pravatar.cc/150?img=3',
    status: 'active',
    role: 'admin',
  },
];

export const UserList = () => {
  const [users, setUsers] = useState(mockUsers);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (user) => {
    // TODO: Implement edit functionality
    console.log('Editing user:', user);
  };

  const handleDelete = (userId) => {
    // TODO: Implement delete functionality
    setUsers(users.filter((user) => user.id !== userId));
  };

  const handleStatusChange = (userId, status) => {
    // TODO: Implement status change functionality
    setUsers(
      users.map((user) =>
        user.id === userId ? { ...user, status } : user
      )
    );
  };


  return (
    <>
      <PageHeader
        title="User Management"
        rightContent={<PrimaryButton>New User</PrimaryButton>}
      />
      <Card>
        <TextField
          label="Search Users"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 2 }}
        />
        {error && <Alert severity="error">{error}</Alert>}
        {loading ? (
          <Loading />
        ) : (
          <UserTable
            users={filteredUsers}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
          />
        )}
      </Card>
    </>
  );
};