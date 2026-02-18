// src/features/users/pages/Users.jsx
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, alpha, Chip } from '@mui/material';
import { useState, useEffect } from 'react';
import { Add, Delete as DeleteIcon, Warning as WarningIcon, People } from '@mui/icons-material';
import usersService from '@/services/usersService';
import UsersStatsCards from '../components/UsersStatsCards';
import UsersTable from '../components/UsersTable';
import UserDialog from '../components/UserDialog';
import UserDetailsDialog from '../components/UserDetailsDialog';
import { PageHeader } from '@/shared/components/ui';
import { useLanguage } from '@/app/providers/LanguageContext';

const Users = () => {
  const { t } = useLanguage();
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
        await usersService.updateUser(editingUser.user_id, userData);
      } else {
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
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <PageHeader
        title={t('pages.users.title')}
        subtitle={t('pages.users.subtitle')}
        icon={People}
        breadcrumbs={[
          { label: t('common.dashboard'), to: '/dashboard' },
          { label: t('pages.users.title') },
        ]}
        actions={
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleOpenDialog}
            sx={{
              borderRadius: 2,
              px: 2.5,
              py: 1,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.875rem',
              boxShadow: 'none',
              '&:hover': {
                boxShadow: (theme) => `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
              },
            }}
          >
            {t('pages.users.add')}
          </Button>
        }
      />

      {/* Stats Cards */}
      <Box mb={3}>
        <UsersStatsCards
          totalUsers={users.length}
          activeUsers={activeUsers}
          teachers={teachers}
        />
      </Box>

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
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: 'hidden',
          }
        }}
      >
        <DialogTitle sx={{ pb: 1, pt: 2.5, px: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: (theme) => alpha(theme.palette.error.main, 0.1),
              }}
            >
              <WarningIcon sx={{ color: 'error.main', fontSize: 22 }} />
            </Box>
            <Typography variant="subtitle1" fontWeight="700">
              Delete User
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ px: 3, py: 2 }}>
          <Typography variant="body2" color="text.secondary" mb={2}>
            This action cannot be undone. The user will be permanently removed.
          </Typography>
          {userToDelete && (
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: (theme) => alpha(theme.palette.error.main, 0.05),
                border: '1px solid',
                borderColor: (theme) => alpha(theme.palette.error.main, 0.2),
              }}
            >
              <Typography variant="subtitle2" fontWeight="600" color="text.primary">
                {userToDelete.full_name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {userToDelete.email}
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2.5, gap: 1, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button
            onClick={handleCancelDelete}
            variant="outlined"
            sx={{ 
              borderRadius: 2, 
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
            startIcon={<DeleteIcon sx={{ fontSize: 18 }} />}
            sx={{ 
              borderRadius: 2, 
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: 'none',
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Users;
