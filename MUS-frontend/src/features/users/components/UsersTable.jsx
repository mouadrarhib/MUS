import React from 'react';
import {
  Card,
  CardHeader,
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
  TablePagination,
  Typography,
  Switch,
} from '@mui/material';
import { Edit, Delete, Visibility, MoreVert } from '@mui/icons-material';
import PropTypes from 'prop-types';

const UsersTable = ({ users, loading, onView, onEdit, onDelete, onToggleStatus }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [selectedUser, setSelectedUser] = React.useState(null);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

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
    // roles is now a comma-separated string like "admin, user"
    if (!roles || typeof roles !== 'string') return 'default';
    
    const rolesList = roles.split(',').map(r => r.trim().toLowerCase());
    const colors = {
      admin: 'error',
      teacher: 'warning',
      student: 'info',
    };
    // Return color based on first matching role
    for (const role of rolesList) {
      if (colors[role]) return colors[role];
    }
    return 'default';
  };

  const getFirstRole = (roles) => {
    if (!roles || typeof roles !== 'string') return 'N/A';
    return roles.split(',')[0].trim().toUpperCase();
  };

  if (loading) {
    return (
      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Card>
    );
  }

  const paginatedUsers = users.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
      <CardHeader
        title={<Typography variant="h6" fontWeight="700">All Users</Typography>}
        subheader={<Typography variant="body2" color="text.secondary">{`Total: ${users.length} users`}</Typography>}
        sx={{ pb: 2 }}
      />
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.50' }}>
              <TableCell width="60px" sx={{ fontWeight: 700 }}></TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Join Date</TableCell>
              <TableCell align="center" width="80px" sx={{ fontWeight: 700 }}>Actions</TableCell>
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
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <TableCell>
                    <Avatar
                      sx={{ width: 40, height: 40, boxShadow: 1, bgcolor: 'primary.main' }}
                    >
                      {user.full_name?.charAt(0)}
                    </Avatar>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="600">
                      {user.full_name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {user.email}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getFirstRole(user.roles)}
                      color={getRoleColor(user.roles)}
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={user.is_active}
                      onChange={() => onToggleStatus && onToggleStatus(user.user_id, !user.is_active)}
                      color="success"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(user.user_created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, user)}
                      sx={{
                        '&:hover': {
                          bgcolor: 'action.selected',
                        },
                      }}
                    >
                      <MoreVert />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan="7" align="center" sx={{ py: 8 }}>
                  <Typography variant="body1" color="text.secondary">
                    No users found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      <TablePagination
        component="div"
        count={users.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50]}
      />

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleView}>
          <ListItemIcon>
            <Visibility fontSize="small" color="info" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <Edit fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText>Edit User</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <ListItemIcon>
            <Delete fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete User</ListItemText>
        </MenuItem>
      </Menu>
    </Card>
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

export default UsersTable;
