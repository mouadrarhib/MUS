// src/features/users/pages/Users.jsx
import { Box, Typography, Button, alpha } from '@mui/material';
import { useState, useEffect } from 'react';
import { Add, People } from '@mui/icons-material';
import usersService from '@/services/usersService';
import institutionService from '@/services/institutionService';
import levelService from '@/services/levelService';
import semesterService from '@/services/semesterService';
import UsersStatsCards from '../components/UsersStatsCards';
import UsersTable from '../components/UsersTable';
import UserDialog from '../components/UserDialog';
import UserDetailsDialog from '../components/UserDetailsDialog';
import { ConfirmDialog, PageHeader, useNotification } from '@/shared/components/ui';
import { useLanguage } from '@/app/providers/LanguageContext';

const extractList = (payload) => (Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : []);

const Users = () => {
  const { t } = useLanguage();
  const { showSuccess, showError, showWarning, showInfo } = useNotification();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [levels, setLevels] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);
  const [confirmState, setConfirmState] = useState({ open: false, title: '', message: '', confirmLabel: 'Confirm', severity: 'warning', action: null });
  const [savingUser, setSavingUser] = useState(false);
  const [deletingUser, setDeletingUser] = useState(false);

  // Load users on component mount
  useEffect(() => {
    loadUsers();
    loadCatalogOptions();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await usersService.getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
      showError(error?.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const loadCatalogOptions = async () => {
    try {
      const [rolesData, institutionsData, levelsData, semestersData] = await Promise.all([
        usersService.getAllRoles(),
        institutionService.getAllInstitutions(),
        levelService.getAllLevels(),
        semesterService.getAllSemesters(),
      ]);

      setRoles((Array.isArray(rolesData) ? rolesData : []).filter((role) => ['student', 'teacher', 'admin'].includes(role.name)));
      setInstitutions(extractList(institutionsData));
      setLevels(extractList(levelsData));
      setSemesters(extractList(semestersData));
    } catch (error) {
      showError(error?.response?.data?.message || 'Failed to load user management options');
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
    setSavingUser(true);
    try {
      if (editingUser) {
        await usersService.updateUser(editingUser.user_id, {
          email: userData.email,
          full_name: userData.full_name,
          is_active: userData.is_active,
        });

        if (userData.role_name && userData.role_name !== editingUser.primary_role) {
          await usersService.syncSingleRole(editingUser.user_id, userData.role_name);
        }
        showSuccess('User updated successfully');
      } else {
        await usersService.createUser(userData);
        showSuccess('User created successfully');
      }
      await loadUsers();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving user:', error);
      showError(error?.response?.data?.message || 'Failed to save user');
      throw error;
    } finally {
      setSavingUser(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    const userToDeleteObj = users.find(u => u.user_id === userId);
    if (!userToDeleteObj) return;
    if (userToDeleteObj.primary_role === 'admin') {
      showWarning('The unique admin account cannot be deleted');
      return;
    }
    setConfirmState({
      open: true,
      title: 'Delete User',
      message: `Delete "${userToDeleteObj.full_name}"?\nThis action cannot be undone.`,
      confirmLabel: 'Delete',
      severity: 'error',
      action: async () => {
        setDeletingUser(true);
        try {
          await usersService.deleteUser(userToDeleteObj.user_id);
          await loadUsers();
          showInfo('User deleted successfully');
          setConfirmState((prev) => ({ ...prev, open: false, action: null }));
        } catch (error) {
          showError(error?.response?.data?.message || 'Failed to delete user');
        } finally {
          setDeletingUser(false);
        }
      },
    });
  };

  const handleToggleStatus = async (userId, newStatus) => {
    const targetUser = users.find((user) => user.user_id === userId);
    if (targetUser?.primary_role === 'admin') {
      showWarning('The unique admin account cannot be deactivated');
      return;
    }

    try {
      await usersService.toggleUserStatus(userId, newStatus);
      await loadUsers();
      showSuccess(`User ${newStatus ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Error toggling user status:', error);
      showError(error?.response?.data?.message || 'Failed to update user status');
    }
  };

  const handleCancelDelete = () => setConfirmState((prev) => ({ ...prev, open: false, action: null }));
  const handleConfirmAction = async () => {
    if (confirmState.action) await confirmState.action();
  };

  const activeUsers = users.filter(u => u.is_active).length;
  const teachers = users.filter(u => u.roles?.includes('teacher')).length;
  const adminCount = users.filter((u) => u.primary_role === 'admin').length;

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
            disabled={savingUser || deletingUser}
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
          saving={savingUser}
          availableRoles={roles}
          allowAdminCreation={adminCount === 0}
          institutions={institutions}
          levels={levels}
          semesters={semesters}
        />

      {/* User Details Dialog */}
      <UserDetailsDialog
        open={openDetailsDialog}
        user={viewingUser}
        onClose={handleCloseDetailsDialog}
      />

      <ConfirmDialog
        open={confirmState.open}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmAction}
        title={confirmState.title}
        message={confirmState.message}
        confirmLabel={confirmState.confirmLabel}
        severity={confirmState.severity}
        loading={deletingUser}
      />
    </Box>
  );
};

export default Users;
