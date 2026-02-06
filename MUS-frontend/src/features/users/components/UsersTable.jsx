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
  Button,
  Box,
  Avatar,
  CircularProgress
} from '@mui/material';
import { Edit, Delete, Visibility } from '@mui/icons-material';
import PropTypes from 'prop-types';

const UsersTable = ({ users, loading, onView, onEdit, onDelete }) => {
  const getRoleColor = (roles) => {
    if (!Array.isArray(roles)) return 'default';

    const colors = {
      admin: 'error',
      teacher: 'warning',
      student: 'info',
    };
    return colors[roles[0]] || 'default';
  };

  if (loading) {
    return (
      <Card>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
          <CircularProgress />
        </Box>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title="All Users"
        subheader={`Total: ${users.length} users`}
      />
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell width="5%"></TableCell>
              <TableCell><strong>Name</strong></TableCell>
              <TableCell><strong>Email</strong></TableCell>
              <TableCell><strong>Role</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Join Date</strong></TableCell>
              <TableCell align="center" width="15%"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users && users.length > 0 ? (
              users.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>
                    <Avatar
                      src={user.avatar}
                      sx={{ width: 32, height: 32 }}
                    >
                      {user.fullName?.charAt(0)}
                    </Avatar>
                  </TableCell>
                  <TableCell fontWeight="600">{user.fullName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.userRoles?.[0]?.toUpperCase() || 'N/A'}
                      color={getRoleColor(user.userRoles)}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.isActive ? 'Active' : 'Inactive'}
                      color={user.isActive ? 'success' : 'default'}
                      size="small"
                      variant={user.isActive ? 'filled' : 'outlined'}
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      size="small"
                      startIcon={<Visibility />}
                      onClick={() => onView(user)}
                      variant="text"
                      color="info"
                      title="View Details"
                    >
                      View
                    </Button>
                    <Button
                      size="small"
                      startIcon={<Edit />}
                      onClick={() => onEdit(user)}
                      variant="text"
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      startIcon={<Delete />}
                      onClick={() => onDelete(user.id)}
                      variant="text"
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan="7" align="center" sx={{ py: 4 }}>
                  No users found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
};

UsersTable.propTypes = {
  users: PropTypes.array.isRequired,
  loading: PropTypes.bool,
  onView: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

UsersTable.defaultProps = {
  loading: false,
};

export default UsersTable;
