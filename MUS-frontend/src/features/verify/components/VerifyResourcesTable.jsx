// src/features/verify/components/VerifyResourcesTable.jsx
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
  CircularProgress,
  IconButton,
  TablePagination,
  Typography,
  TextField,
  InputAdornment,
  Button,
  Tooltip,
  Avatar,
  alpha,
} from '@mui/material';
import { 
  Search, 
  PendingActions,
  CheckCircle,
  Cancel,
  Visibility,
  Person,
} from '@mui/icons-material';
import PropTypes from 'prop-types';

const VerifyResourcesTable = ({ 
  resources, 
  loading, 
  onView, 
  onApprove, 
  onReject 
}) => {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [searchTerm, setSearchTerm] = React.useState('');

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getTypeColor = (type) => {
    const colors = {
      exam: 'error',
      course: 'info',
      notes: 'secondary',
    };
    return colors[type] || 'default';
  };

  const getAuthorRoleColor = (role) => {
    const colors = {
      student: 'primary',
      teacher: 'success',
    };
    return colors[role] || 'default';
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      easy: 'success',
      medium: 'warning',
      hard: 'error',
    };
    return colors[difficulty] || 'default';
  };

  // Filter resources by search
  const filteredResources = resources.filter(resource =>
    resource.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resource.author?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resource.academicContext?.moduleCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedResources = filteredResources.slice(
    page * rowsPerPage, 
    page * rowsPerPage + rowsPerPage
  );

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
          background: (theme) => alpha(theme.palette.warning.main, 0.02),
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
              background: (theme) => alpha(theme.palette.warning.main, 0.1),
            }}
          >
            <PendingActions sx={{ fontSize: 20, color: 'warning.main' }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight="600">
              Pending Verification
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {filteredResources.length} resources awaiting review
            </Typography>
          </Box>
        </Box>
        <TextField
          size="small"
          placeholder="Search by title, author, module..."
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
            minWidth: 280,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              fontSize: '0.875rem',
            },
          }}
        />
      </Box>

      {/* Table */}
      <TableContainer sx={{ overflowX: 'hidden' }}>
        <Table size="small" sx={{ tableLayout: 'fixed' }}>
          <TableHead>
            <TableRow sx={{ bgcolor: (theme) => alpha(theme.palette.grey[500], 0.05) }}>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', width: '38%' }}>Resource</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', width: '12%' }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', width: '20%' }}>Author</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', width: '12%' }}>Submitted</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, fontSize: '0.75rem', width: '18%' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedResources && paginatedResources.length > 0 ? (
              paginatedResources.map((resource) => (
                <TableRow 
                  key={resource.id} 
                  hover
                  sx={{
                    '&:hover': {
                      bgcolor: (theme) => alpha(theme.palette.warning.main, 0.02),
                    },
                  }}
                >
                  <TableCell>
                    <Box sx={{ overflow: 'hidden' }}>
                      <Typography variant="body2" fontWeight="600" noWrap>
                        {resource.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" noWrap display="block">
                        {resource.description?.substring(0, 50)}...
                      </Typography>
                      <Typography variant="caption" color="text.secondary" noWrap display="block" sx={{ fontSize: '0.65rem', mt: 0.25 }}>
                        {resource.academicContext?.moduleCode} - {resource.academicContext?.moduleTitle}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                        <Chip
                          label={resource.format?.toUpperCase()}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.6rem', height: 18 }}
                        />
                        {resource.academicContext?.difficulty && (
                          <Chip
                            label={resource.academicContext.difficulty}
                            size="small"
                            color={getDifficultyColor(resource.academicContext.difficulty)}
                            sx={{ fontSize: '0.6rem', height: 18 }}
                          />
                        )}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={resource.educationalType?.toUpperCase() || 'N/A'}
                      color={getTypeColor(resource.educationalType)}
                      size="small"
                      sx={{ fontWeight: 600, fontSize: '0.65rem', height: 22 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar 
                        sx={{ 
                          width: 28, 
                          height: 28, 
                          fontSize: '0.75rem',
                          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                          color: 'primary.main',
                        }}
                      >
                        {resource.author?.name?.charAt(0) || 'U'}
                      </Avatar>
                      <Box>
                        <Typography variant="caption" fontWeight="600" noWrap display="block">
                          {resource.author?.name}
                        </Typography>
                        <Chip
                          icon={<Person sx={{ fontSize: '12px !important' }} />}
                          label={resource.author?.role}
                          size="small"
                          color={getAuthorRoleColor(resource.author?.role)}
                          variant="outlined"
                          sx={{ fontSize: '0.6rem', height: 18, '& .MuiChip-icon': { ml: 0.5 } }}
                        />
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(resource.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: '2-digit'
                      })}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => onView(resource)}
                          sx={{
                            bgcolor: (theme) => alpha(theme.palette.info.main, 0.1),
                            '&:hover': {
                              bgcolor: (theme) => alpha(theme.palette.info.main, 0.2),
                            },
                          }}
                        >
                          <Visibility sx={{ fontSize: 16, color: 'info.main' }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Approve & Publish">
                        <IconButton
                          size="small"
                          onClick={() => onApprove(resource)}
                          sx={{
                            bgcolor: (theme) => alpha(theme.palette.success.main, 0.1),
                            '&:hover': {
                              bgcolor: (theme) => alpha(theme.palette.success.main, 0.2),
                            },
                          }}
                        >
                          <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Reject">
                        <IconButton
                          size="small"
                          onClick={() => onReject(resource)}
                          sx={{
                            bgcolor: (theme) => alpha(theme.palette.error.main, 0.1),
                            '&:hover': {
                              bgcolor: (theme) => alpha(theme.palette.error.main, 0.2),
                            },
                          }}
                        >
                          <Cancel sx={{ fontSize: 16, color: 'error.main' }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: 3,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: (theme) => alpha(theme.palette.success.main, 0.1),
                      }}
                    >
                      <CheckCircle sx={{ fontSize: 28, color: 'success.main' }} />
                    </Box>
                    <Typography variant="subtitle2" fontWeight="600" color="text.primary">
                      All caught up!
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      No resources pending verification
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      <TablePagination
        component="div"
        count={filteredResources.length}
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
    </Paper>
  );
};

VerifyResourcesTable.propTypes = {
  resources: PropTypes.array.isRequired,
  loading: PropTypes.bool,
  onView: PropTypes.func.isRequired,
  onApprove: PropTypes.func.isRequired,
  onReject: PropTypes.func.isRequired,
};

VerifyResourcesTable.defaultProps = {
  loading: false,
};

export default VerifyResourcesTable;
