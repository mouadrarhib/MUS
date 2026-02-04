import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  IconButton,
  Box,
  Typography,
  Switch,
  Tooltip,
} from '@mui/material';
import { Visibility, Edit, Delete } from '@mui/icons-material';

import UserDetailsModal from './UserDetailsModal';

const UserTable = ({ users, onEdit, onDelete, onStatusChange }) => {
  const [selectedUser, setSelectedUser] = useState(null);

  const handleViewDetails = (user) => {
    setSelectedUser(user);
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
  };

  const getStatusChipColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <>
      <TableContainer>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow
                key={user.id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar
                      src={user.avatar}
                      alt={user.name}
                      sx={{ mr: 2, width: 40, height: 40 }}
                    />
                    <Typography variant="body2" fontWeight="500">
                      {user.name}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell sx={{ textTransform: 'capitalize' }}>
                  {user.role}
                </TableCell>
                <TableCell>
                  <Chip
                    label={user.status}
                    color={getStatusChipColor(user.status)}
                    size="small"
                    sx={{ textTransform: 'capitalize', fontWeight: 500 }}
                  />
                </TableCell>
                <TableCell align="right">
                  <Tooltip title={user.status === 'active' ? 'Deactivate User' : 'Activate User'}>
                    <Switch
                      checked={user.status === 'active'}
                      onChange={(e) => onStatusChange(user.id, e.target.checked ? 'active' : 'inactive')}
                      size="small"
                      color="success"
                    />
                  </Tooltip>
                  <IconButton
                    size="small"
                    onClick={() => handleViewDetails(user)}
                    aria-label="view details"
                  >
                    <Visibility />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => onEdit(user)}
                    aria-label="edit user"
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => onDelete(user)}
                    aria-label="delete user"
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <UserDetailsModal
        user={selectedUser}
        open={!!selectedUser}
        onClose={handleCloseModal}
      />
    </>
  );
};

export default UserTable;