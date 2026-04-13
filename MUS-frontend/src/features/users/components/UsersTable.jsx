// src/features/users/components/UsersTable.jsx
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Box,
  Avatar,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Switch,
  alpha,
  Tooltip,
} from '@mui/material';
import { Edit, Delete, Visibility, MoreVert, People } from '@mui/icons-material';
import PropTypes from 'prop-types';
import { DataTableShell } from '@/shared/components/ui';

const UsersTable = ({ users, loading, onView, onEdit, onDelete, onToggleStatus }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [selectedUser, setSelectedUser] = React.useState(null);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [searchTerm, setSearchTerm] = React.useState('');

  const handleMenuOpen = (event, user) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };

  const handleView = () => {
    if (selectedUser) onView(selectedUser);
    handleMenuClose();
  };

  const handleEdit = () => {
    if (selectedUser) onEdit(selectedUser);
    handleMenuClose();
  };

  const handleDelete = () => {
    if (selectedUser) onDelete(selectedUser.user_id);
    handleMenuClose();
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getRoleColor = (roles) => {
    if (!roles || typeof roles !== 'string') return 'default';
    const rolesList = roles.split(',').map(r => r.trim().toLowerCase());
    const colors = {
      admin: 'error',
      teacher: 'warning',
      student: 'info',
    };
    for (const role of rolesList) {
      if (colors[role]) return colors[role];
    }
    return 'default';
  };

  const getFirstRole = (roles) => {
    if (!roles || typeof roles !== 'string') return 'N/A';
    return roles.split(',')[0].trim().toUpperCase();
  };

  const isProtectedAdmin = (user) => String(user?.primary_role || '').toLowerCase() === 'admin';

  // Filter users by search
  const filteredUsers = React.useMemo(() => {
    const q = searchTerm.toLowerCase();
    return users.filter((user) =>
      user.full_name?.toLowerCase().includes(q) ||
      user.email?.toLowerCase().includes(q)
    );
  }, [users, searchTerm]);

  const paginatedUsers = React.useMemo(
    () => filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filteredUsers, page, rowsPerPage]
  );

  return (
    <>
      <DataTableShell
        icon={People}
        title="All Users"
        subtitle={`${filteredUsers.length} users found`}
        accentColor="primary"
        searchPlaceholder="Search users..."
        searchValue={searchTerm}
        onSearchChange={(e) => setSearchTerm(e.target.value)}
        loading={loading}
        pagination={{
          count: filteredUsers.length,
          page,
          onPageChange: handleChangePage,
          rowsPerPage,
          onRowsPerPageChange: handleChangeRowsPerPage,
          rowsPerPageOptions: [5, 10, 25],
        }}
      >
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: (theme) => alpha(theme.palette.grey[500], 0.05) }}>
              <TableCell width="50px" sx={{ fontWeight: 600, fontSize: '0.75rem' }}></TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Role</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Joined</TableCell>
              <TableCell align="center" width="60px" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedUsers && paginatedUsers.length > 0 ? (
              paginatedUsers.map((user) => (
                <TableRow 
                  key={user.user_id} 
                  hover
                  sx={{
                    '&:hover': {
                      bgcolor: (theme) => alpha(theme.palette.primary.main, 0.02),
                    },
                  }}
                >
                  <TableCell>
                    <Avatar
                      sx={{ 
                        width: 36, 
                        height: 36, 
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        bgcolor: 'primary.main',
                      }}
                    >
                      {user.full_name?.charAt(0)}
                    </Avatar>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="600" noWrap>
                      {user.full_name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {user.email}
                    </Typography>
                  </TableCell>
                  <TableCell>
                      <Chip
                       label={(user.primary_role || getFirstRole(user.roles)).toString().toUpperCase()}
                       color={getRoleColor(user.roles)}
                       size="small"
                      sx={{ 
                        fontWeight: 600, 
                        fontSize: '0.65rem',
                        height: 22,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                     <Tooltip title={isProtectedAdmin(user) ? 'The unique admin cannot be deactivated' : ''}>
                       <span>
                         <Switch
                           checked={user.is_active}
                           onChange={() => onToggleStatus && onToggleStatus(user.user_id, !user.is_active)}
                           color="success"
                           size="small"
                           disabled={isProtectedAdmin(user)}
                         />
                       </span>
                     </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(user.user_created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: '2-digit'
                      })}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                     <IconButton
                       size="small"
                       onClick={(e) => handleMenuOpen(e, user)}
                       sx={{
                        '&:hover': {
                          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                        },
                      }}
                    >
                      <MoreVert sx={{ fontSize: 18 }} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    No users found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      </DataTableShell>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            borderRadius: 2,
            minWidth: 150,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          }
        }}
      >
        <MenuItem onClick={handleView} sx={{ fontSize: '0.875rem' }}>
          <ListItemIcon>
            <Visibility sx={{ fontSize: 18, color: 'info.main' }} />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ fontSize: '0.875rem' }}>View</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleEdit} sx={{ fontSize: '0.875rem' }}>
          <ListItemIcon>
            <Edit sx={{ fontSize: 18, color: 'primary.main' }} />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ fontSize: '0.875rem' }}>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={isProtectedAdmin(selectedUser) ? undefined : handleDelete} disabled={isProtectedAdmin(selectedUser)} sx={{ fontSize: '0.875rem' }}>
          <ListItemIcon>
            <Delete sx={{ fontSize: 18, color: 'error.main' }} />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ fontSize: '0.875rem' }}>
            {isProtectedAdmin(selectedUser) ? 'Delete disabled' : 'Delete'}
          </ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

UsersTable.propTypes = {
  users: PropTypes.array.isRequired,
  loading: PropTypes.bool,
  onView: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onToggleStatus: PropTypes.func,
};

UsersTable.defaultProps = {
  loading: false,
};

export default React.memo(UsersTable);
