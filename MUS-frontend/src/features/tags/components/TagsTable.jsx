// src/features/tags/components/TagsTable.jsx
import { memo, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  alpha, Box, Chip, Paper, Skeleton, Stack,
  Switch, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Tooltip, Typography,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit } from '@mui/icons-material';
import { EmptyState } from '@/shared/components/ui';
import TagUsageBreakdown from './TagUsageBreakdown';
import TagActionButton from './TagActionButton';
import TagSearchInput from './TagSearchInput';

// ─── Skeleton row ─────────────────────────────────────────────────────────────
const SkeletonRow = memo(() => (
  <TableRow>
    <TableCell><Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Skeleton variant="rounded" width={28} height={28} sx={{ borderRadius: '8px', flexShrink: 0 }} />
      <Box sx={{ flex: 1 }}>
        <Skeleton width="55%" height={14} sx={{ mb: 0.5 }} />
        <Skeleton width="35%" height={11} />
      </Box>
    </Box></TableCell>
    <TableCell><Skeleton width="70%" height={20} sx={{ borderRadius: '6px' }} /></TableCell>
    <TableCell><Skeleton width="60%" height={18} sx={{ borderRadius: '6px' }} /></TableCell>
    <TableCell>
      <Skeleton width="50%" height={14} sx={{ mb: 0.5 }} />
      <Skeleton width="70%" height={11} />
    </TableCell>
    <TableCell><Skeleton width={36} height={20} sx={{ borderRadius: '99px' }} /></TableCell>
    <TableCell>
      <Box sx={{ display: 'flex', gap: 0.75 }}>
        <Skeleton variant="rounded" width={30} height={30} sx={{ borderRadius: '8px' }} />
        <Skeleton variant="rounded" width={30} height={30} sx={{ borderRadius: '8px' }} />
      </Box>
    </TableCell>
  </TableRow>
));
SkeletonRow.displayName = 'SkeletonRow';

// ─── Header cell ──────────────────────────────────────────────────────────────
const Th = ({ children, align = 'left', width }) => (
  <TableCell
    align={align}
    sx={{
      width, py: 1.5, px: 2.5,
      fontSize: '0.68rem', fontWeight: 700,
      letterSpacing: 0.6, textTransform: 'uppercase',
      color: 'text.secondary', whiteSpace: 'nowrap',
      borderBottom: '1px solid', borderColor: 'divider',
      bgcolor: (t) => t.palette.mode === 'dark'
        ? alpha(t.palette.common.white, 0.025)
        : alpha(t.palette.common.black, 0.02),
    }}
  >
    {children}
  </TableCell>
);

// ─── TagsTable ────────────────────────────────────────────────────────────────
const TagsTable = memo(({
  tags, loading, error, search, onSearchChange,
  onRetry, onAddTag, onEdit, onDelete, onToggleActive,
}) => {
  const handleToggle = useCallback((tag) => onToggleActive(tag), [onToggleActive]);

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: '16px',
        border: '1px solid', borderColor: 'divider',
        overflow: 'hidden',
      }}
    >
      {/* ── Table header toolbar ── */}
      <Box sx={(t) => ({
        px: { xs: 2, sm: 3 }, py: 2,
        display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5,
        borderBottom: '1px solid', borderColor: 'divider',
        bgcolor: t.palette.mode === 'dark'
          ? alpha(t.palette.common.white, 0.02)
          : alpha(t.palette.common.black, 0.015),
      })}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" fontWeight={800} sx={{ fontSize: '0.9375rem', letterSpacing: -0.2 }}>
            All Tags
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {loading ? 'Loading…' : `${tags.length} tag${tags.length !== 1 ? 's' : ''} found`}
          </Typography>
        </Box>

        <TagSearchInput value={search} onChange={onSearchChange} />

        <Tooltip title="Create a new tag" placement="top" arrow>
          <Box>
            <Box
              component="button"
              onClick={onAddTag}
              sx={(t) => ({
                display: 'inline-flex', alignItems: 'center', gap: 0.75,
                px: 1.75, py: 0.875, borderRadius: '10px',
                border: '1px solid', borderColor: alpha(t.palette.primary.main, 0.35),
                bgcolor: alpha(t.palette.primary.main, 0.07),
                color: 'primary.main', fontWeight: 700, fontSize: '0.8rem',
                cursor: 'pointer', transition: 'all 0.16s ease',
                '&:hover': {
                  bgcolor: alpha(t.palette.primary.main, 0.13),
                  borderColor: 'primary.main',
                  transform: 'translateY(-1px)',
                },
                '&:active': { transform: 'translateY(0)' },
              })}
            >
              <AddIcon sx={{ fontSize: 16 }} />
              Add Tag
            </Box>
          </Box>
        </Tooltip>
      </Box>

      {/* ── Table ── */}
      {error && !loading ? (
        <EmptyState onRetry={onRetry} />
      ) : !loading && tags.length === 0 ? (
        <EmptyState
          title="No tags found"
          description={search ? `No tags match "${search}". Try a different search term.` : 'Create your first tag to start categorising resources.'}
          action={{ label: 'Create Tag', onClick: onAddTag }}
        />
      ) : (
        <TableContainer>
          <Table size="small" sx={{ minWidth: 680 }}>
            <TableHead>
              <TableRow>
                <Th width="30%">Name</Th>
                <Th width="18%">Slug</Th>
                <Th width="14%">Category</Th>
                <Th width="20%">Usage</Th>
                <Th width="10%" align="center">Status</Th>
                <Th width="8%"  align="right">Actions</Th>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading
                ? Array.from({ length: 6 }, (_, i) => <SkeletonRow key={i} />)
                : tags.map((tag) => (
                  <TableRow
                    key={tag.id}
                    sx={(t) => ({
                      transition: 'background 0.14s ease',
                      '&:hover': { bgcolor: t.palette.mode === 'dark'
                        ? alpha(t.palette.common.white, 0.025)
                        : alpha(t.palette.common.black, 0.02) },
                      '&:last-child td': { border: 0 },
                    })}
                  >
                    {/* ── Name ── */}
                    <TableCell sx={{ px: 2.5, py: 1.75 }}>
                      <Typography variant="body2" fontWeight={700} sx={{ lineHeight: 1.25 }}>
                        {tag.name}
                      </Typography>
                      {tag.description && (
                        <Typography
                          variant="caption" color="text.secondary"
                          sx={{
                            display: '-webkit-box', WebkitLineClamp: 1,
                            WebkitBoxOrient: 'vertical', overflow: 'hidden',
                          }}
                        >
                          {tag.description}
                        </Typography>
                      )}
                    </TableCell>

                    {/* ── Slug ── */}
                    <TableCell sx={{ px: 2.5, py: 1.75 }}>
                      <Chip
                        label={`#${tag.slug}`}
                        size="small"
                        sx={(t) => ({
                          height: 20, fontSize: '0.7rem', fontWeight: 600,
                          bgcolor: alpha(t.palette.primary.main, 0.07),
                          color: 'primary.main',
                          border: '1px solid', borderColor: alpha(t.palette.primary.main, 0.16),
                          '& .MuiChip-label': { px: 0.8 },
                        })}
                      />
                    </TableCell>

                    {/* ── Category ── */}
                    <TableCell sx={{ px: 2.5, py: 1.75 }}>
                      <Typography variant="caption" fontWeight={600}
                        sx={{ textTransform: 'capitalize', color: 'text.secondary' }}>
                        {tag.category || '—'}
                      </Typography>
                    </TableCell>

                    {/* ── Usage ── */}
                    <TableCell sx={{ px: 2.5, py: 1.75 }}>
                      <TagUsageBreakdown tag={tag} />
                    </TableCell>

                    {/* ── Status ── */}
                    <TableCell align="center" sx={{ px: 2.5, py: 1.75 }}>
                      <Tooltip
                        title={tag.is_active ? 'Active — click to deactivate' : 'Inactive — click to activate'}
                        placement="top" arrow
                      >
                        <Switch
                          checked={!!tag.is_active}
                          onChange={() => handleToggle(tag)}
                          size="small" color="success"
                        />
                      </Tooltip>
                    </TableCell>

                    {/* ── Actions ── */}
                    <TableCell align="right" sx={{ px: 2.5, py: 1.75 }}>
                      <Stack direction="row" spacing={0.75} justifyContent="flex-end">
                        <TagActionButton icon={Edit}       label="Edit tag"    color="primary" onClick={() => onEdit(tag)}   />
                        <TagActionButton icon={DeleteIcon} label="Delete tag"  color="error"   onClick={() => onDelete(tag)} />
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              }
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
});

TagsTable.displayName = 'TagsTable';

TagsTable.propTypes = {
  tags:           PropTypes.array.isRequired,
  loading:        PropTypes.bool.isRequired,
  error:          PropTypes.string.isRequired,
  search:         PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  onRetry:        PropTypes.func.isRequired,
  onAddTag:       PropTypes.func.isRequired,
  onEdit:         PropTypes.func.isRequired,
  onDelete:       PropTypes.func.isRequired,
  onToggleActive: PropTypes.func.isRequired,
};

export default TagsTable;