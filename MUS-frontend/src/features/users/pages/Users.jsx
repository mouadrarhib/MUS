import { Box, Typography, Button } from '@mui/material';
import { useState, useEffect } from 'react';
import { Add } from '@mui/icons-material';
import usersService from '@/services/usersService';
import UsersStatsCards from '../components/UsersStatsCards';
import UsersTable from '../components/UsersTable';
import UserDialog from '../components/UserDialog';
import UserDetailsDialog from '../components/UserDetailsDialog';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);

  // Load users on component mount
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await usersService.getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setEditingUser(null);
    setOpenDialog(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUser(null);
  };

  const handleViewUser = (user) => {
    setViewingUser(user);
    setOpenDetailsDialog(true);
  };

  const handleCloseDetailsDialog = () => {
    setOpenDetailsDialog(false);
    setViewingUser(null);
  };

  const handleSaveUser = async (userData) => {
    try {
      if (editingUser) {
        // Update existing user
        await usersService.updateUser(editingUser.id, userData);
      } else {
        // Create new user
        await usersService.createUser(userData);
      }
      await loadUsers();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await usersService.deleteUser(userId);
        await loadUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const activeUsers = users.filter(u => u.isActive).length;
  const teachers = users.filter(u => u.userRoles?.includes('teacher')).length;

  return (
    <Box>
      {/* Header */}
      <Box mb={4} display="flex" justifyContent="space-between" alignItems="flex-start">
        <Box>
          <Typography variant="h4" fontWeight="700" gutterBottom>
            Users Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage all platform users, their roles, and status
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleOpenDialog}
        >
          Add User
        </Button>
      </Box>

      {/* Stats Cards */}
      <UsersStatsCards
        totalUsers={users.length}
        activeUsers={activeUsers}
        teachers={teachers}
      />

      {/* Users Table */}
      <UsersTable
        users={users}
        loading={loading}
        onView={handleViewUser}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
      />

      {/* User Dialog */}
      <UserDialog
        open={openDialog}
        user={editingUser}
        onClose={handleCloseDialog}
        onSave={handleSaveUser}
      />

      {/* User Details Dialog */}
      <UserDetailsDialog
        open={openDetailsDialog}
        user={viewingUser}
        onClose={handleCloseDetailsDialog}
      />
    </Box>
  );
};

export default Users;
