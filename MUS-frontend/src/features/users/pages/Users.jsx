import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { useState, useEffect } from 'react';
import { Add, Delete as DeleteIcon, Warning as WarningIcon } from '@mui/icons-material';
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
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

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
        await usersService.updateUser(editingUser.user_id, userData);
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
    const userToDeleteObj = users.find(u => u.user_id === userId);
    setUserToDelete(userToDeleteObj);
    setOpenDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    try {
      await usersService.deleteUser(userToDelete.user_id);
      await loadUsers();
      setOpenDeleteConfirm(false);
      setUserToDelete(null);
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleToggleStatus = async (userId, newStatus) => {
    try {
      await usersService.toggleUserStatus(userId, newStatus);
      await loadUsers();
    } catch (error) {
      console.error('Error toggling user status:', error);
    }
  };

  const handleCancelDelete = () => {
    setOpenDeleteConfirm(false);
    setUserToDelete(null);
  };

  const activeUsers = users.filter(u => u.is_active).length;
  const teachers = users.filter(u => u.roles?.includes('teacher')).length;

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box 
        mb={4} 
        display="flex" 
        justifyContent="space-between" 
        alignItems="flex-start"
        sx={{
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
        }}
      >
        <Box>
          <Typography 
            variant="h4" 
            fontWeight="700" 
            gutterBottom
            sx={{
              background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Users Management
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
            Manage all platform users, their roles, and status
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleOpenDialog}
          size="large"
          sx={{
            borderRadius: 2,
            px: 3,
            py: 1.5,
            textTransform: 'none',
            fontWeight: 600,
            boxShadow: 2,
            '&:hover': {
              boxShadow: 4,
              transform: 'translateY(-2px)',
            },
            transition: 'all 0.3s ease',
          }}
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
        onToggleStatus={handleToggleStatus}
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteConfirm}
        onClose={handleCancelDelete}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <WarningIcon sx={{ color: 'error.main', fontSize: 28 }} />
            <Typography variant="h6" fontWeight="700">
              Delete User
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Are you sure you want to delete this user? This action cannot be undone.
          </Typography>
            {userToDelete && (
              <Box
                sx={{
                  p: 2,
                  borderRadius: 1,
                  bgcolor: 'error.main',
                  color: 'error.contrastText',
                }}
              >
                <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                  {userToDelete.full_name}
                </Typography>
                <Typography variant="body2">
                  {userToDelete.email}
                </Typography>
              </Box>
            )}
        </DialogContent>

        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button
            onClick={handleCancelDelete}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Users;
