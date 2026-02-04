import React, { useState, useEffect } from 'react';
import {
  Card,
  TextField,
  Alert,
  Loading,
  PrimaryButton,
  useNotification,
} from '../../../shared/components/ui';
import { PageHeader, ConfirmDialog } from '../../../shared/components/common';
import UserTable from './UserTable';
import EditUserModal from './EditUserModal';

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
    createdAt: new Date().toISOString(),
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
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    name: 'Peter Jones',
    email: 'peter.jones@example.com',
    avatar: 'https://i.pravatar.cc/150?img=3',
    status: 'active',
    role: 'admin',
    createdAt: new Date().toISOString(),
  },
];

export const UserList = () => {
  const { showSuccess } = useNotification();
  const [users, setUsers] = useState(mockUsers);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (user) => {
    setEditingUser(user);
  };

  const handleSave = (editedUser) => {
    setUsers(
      users.map((user) =>
        user.id === editedUser.id ? editedUser : user
      )
    );
    setEditingUser(null);
  };

  const handleDelete = (user) => {
    setUserToDelete(user);
  };

  const handleConfirmDelete = () => {
    setUsers(users.filter((user) => user.id !== userToDelete.id));
    showSuccess(`User ${userToDelete.name} deleted successfully.`);
    setUserToDelete(null);
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
        <EditUserModal
          user={editingUser}
          open={!!editingUser}
          onClose={() => setEditingUser(null)}
          onSave={handleSave}
        />
        <ConfirmDialog
          open={!!userToDelete}
          onClose={() => setUserToDelete(null)}
          onConfirm={handleConfirmDelete}
          title="Delete User"
          description={`Are you sure you want to delete ${userToDelete?.name}? This action cannot be undone.`}
        />
      </Card>
    </>
  );
};