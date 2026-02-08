// src/features/users/components/UsersTable.jsx
import React from 'react';
import {
  Paper,
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
  alpha,
  TextField,
  InputAdornment,
} from '@mui/material';
import { Edit, Delete, Visibility, MoreVert, Search, People } from '@mui/icons-material';
import PropTypes from 'prop-types';

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

  // Filter users by search
  const filteredUsers = users.filter(user => 
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedUsers = filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  if (loading) {
    return (
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          background: (theme) => theme.palette.mode === 'dark' 
            ? 'linear-gradient(135deg, #1a1a1a 0%, #141414 100%)'
            : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        }}
      >
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
          <CircularProgress size={32} />
        </Box>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        background: (theme) => theme.palette.mode === 'dark' 
          ? 'linear-gradient(135deg, #1a1a1a 0%, #141414 100%)'
          : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 3,
          py: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
          background: (theme) => alpha(theme.palette.primary.main, 0.02),
        }}
      >
        <Box display="flex" alignItems="center" gap={1.5}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: (theme) => alpha(theme.palette.primary.main, 0.1),
            }}
          >
            <People sx={{ fontSize: 20, color: 'primary.main' }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight="600">
              All Users
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {filteredUsers.length} users found
            </Typography>
          </Box>
        </Box>
        <TextField
          size="small"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ fontSize: 18, color: 'text.secondary' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            minWidth: 200,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              fontSize: '0.875rem',
            },
          }}
        />
      </Box>

      {/* Table */}
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
                      label={getFirstRole(user.roles)}
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
                    <Switch
                      checked={user.is_active}
                      onChange={() => onToggleStatus && onToggleStatus(user.user_id, !user.is_active)}
                      color="success"
                      size="small"
                    />
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
      
      <TablePagination
        component="div"
        count={filteredUsers.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
        sx={{
          borderTop: '1px solid',
          borderColor: 'divider',
          '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
            fontSize: '0.75rem',
          },
        }}
      />

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
        <MenuItem onClick={handleDelete} sx={{ fontSize: '0.875rem' }}>
          <ListItemIcon>
            <Delete sx={{ fontSize: 18, color: 'error.main' }} />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ fontSize: '0.875rem' }}>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </Paper>
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
