// src/features/verify/components/VerifyResourcesTable.jsx
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
  IconButton,
  Typography,
  Tooltip,
  Avatar,
  alpha,
} from '@mui/material';
import { 
  PendingActions,
  CheckCircle,
  Cancel,
  Visibility,
  Person,
} from '@mui/icons-material';
import PropTypes from 'prop-types';
import { DataTableShell } from '@/shared/components/ui';

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
  const filteredResources = React.useMemo(() => {
    const q = searchTerm.toLowerCase();
    return resources.filter(
      (resource) =>
        resource.title?.toLowerCase().includes(q) ||
        resource.author?.name?.toLowerCase().includes(q) ||
        resource.academicContext?.moduleCode?.toLowerCase().includes(q)
    );
  }, [resources, searchTerm]);

  const paginatedResources = React.useMemo(
    () => filteredResources.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filteredResources, page, rowsPerPage]
  );

  return (
    <DataTableShell
      icon={PendingActions}
      title="Pending Verification"
      subtitle={`${filteredResources.length} resources awaiting review`}
      accentColor="warning"
      searchPlaceholder="Search by title, author, module..."
      searchValue={searchTerm}
      onSearchChange={(e) => setSearchTerm(e.target.value)}
      searchMinWidth={280}
      loading={loading}
      pagination={{
        count: filteredResources.length,
        page,
        onPageChange: handleChangePage,
        rowsPerPage,
        onRowsPerPageChange: handleChangeRowsPerPage,
        rowsPerPageOptions: [5, 10, 25],
      }}
    >
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
    </DataTableShell>
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

export default React.memo(VerifyResourcesTable);
