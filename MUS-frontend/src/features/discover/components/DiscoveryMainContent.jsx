import { Avatar, Box, Button, CircularProgress, InputBase, Paper, Stack, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { Apps, Menu, Search, ViewList } from '@mui/icons-material';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import ResourceCard from '@/features/discover/components/ResourceCard';
import { toResourceCardModel } from '@/features/discover/components/resourceCardMapper';

const sortTabs = ['Recommended', 'Most Recent', 'Most Viewed', 'Top Rated'];
const sortValueMap = {
  Recommended: 'recommended',
  'Most Recent': 'newest',
  'Most Viewed': 'favorites',
  'Top Rated': 'rating',
};

const DiscoverySearchBar = memo(({ searchQuery, onSearchQueryChange }) => {
  const [localSearch, setLocalSearch] = useState(searchQuery || '');
  const isFirstSearchSyncRef = useRef(true);

  useEffect(() => {
    setLocalSearch(searchQuery || '');
  }, [searchQuery]);

  useEffect(() => {
    if (isFirstSearchSyncRef.current) {
      isFirstSearchSyncRef.current = false;
      return;
    }

    const timeoutId = window.setTimeout(() => {
      onSearchQueryChange?.(localSearch);
    }, 400);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [localSearch, onSearchQueryChange]);

  return (
    <Paper
      sx={(theme) => ({
        px: { xs: 1, md: 1.3 },
        py: { xs: 0.45, md: 0.55 },
        borderRadius: 3,
        border: '1px solid',
        borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
        flex: 1,
        boxShadow: 'none',
        bgcolor: theme.palette.background.paper,
        minHeight: { xs: 56, md: 72 },
        display: 'flex',
        alignItems: 'center',
      })}
    >
      <Stack direction="row" alignItems="center" spacing={1.1} sx={{ width: '100%' }}>
        <Search sx={{ color: 'text.disabled', fontSize: 19, ml: 0.2 }} />
        <InputBase
          placeholder="Search for resources, topics, or students..."
          value={localSearch}
          onChange={(event) => setLocalSearch(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              onSearchQueryChange?.(localSearch);
            }
          }}
          sx={{
            flex: 1,
            minWidth: 0,
            width: '100%',
            fontSize: '0.82rem',
            lineHeight: 1.2,
            '& input': { py: 0.1 },
            '& input::placeholder': { opacity: 1, color: 'text.disabled' },
          }}
        />
        <Button
          variant="contained"
          onClick={() => onSearchQueryChange?.(localSearch)}
          sx={{
            ml: 'auto',
            alignSelf: 'center',
            textTransform: 'none',
            fontWeight: 700,
            borderRadius: 99,
            px: { xs: 2.3, md: 4.2 },
            height: { xs: 36, md: 38 },
            py: 0,
            fontSize: '0.98rem',
            minWidth: { xs: 104, md: 118 },
            background: 'linear-gradient(92deg, #1D72F2 0%, #7C3AED 100%)',
            boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
          }}
        >
          Search
        </Button>
      </Stack>
    </Paper>
  );
});

DiscoverySearchBar.displayName = 'DiscoverySearchBar';

const DiscoveryMainContent = ({
  resources,
  loading = false,
  searchQuery = '',
  onSearchQueryChange,
  selectedSort = 'recommended',
  onSortChange,
  pagination = null,
  page = 1,
  onPageChange,
  onResourceOpen,
}) => {
  const [viewMode, setViewMode] = useState('grid');
  const cardResources = useMemo(() => resources.map(toResourceCardModel), [resources]);

  return (
    <Box sx={{ minWidth: 0 }}>
      <Stack direction={{ xs: 'column', xl: 'row' }} spacing={1.5} alignItems="flex-start" sx={{ mb: 2 }}>
        <DiscoverySearchBar searchQuery={searchQuery} onSearchQueryChange={onSearchQueryChange} />
        <Paper
          sx={{
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            px: 2,
            py: 1.2,
            minWidth: { xl: 360 },
            boxShadow: 'none',
            bgcolor: 'background.paper',
            alignSelf: 'stretch',
          }}
        >
          <Typography sx={{ color: '#4F46E5', fontWeight: 800, mb: 0.25, fontSize: '1.05rem' }}>Learn. Share. Grow Together</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.2 }}>
            Join thousands of students
            <br />
            learning from each other.
          </Typography>
          <Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={0.6}>
            <Avatar src="https://i.pravatar.cc/100?img=14" sx={{ width: 28, height: 28, border: '2px solid', borderColor: 'background.paper' }} />
            <Avatar src="https://i.pravatar.cc/100?img=32" sx={{ width: 28, height: 28, ml: -1, border: '2px solid', borderColor: 'background.paper' }} />
            <Avatar src="https://i.pravatar.cc/100?img=47" sx={{ width: 28, height: 28, ml: -1, border: '2px solid', borderColor: 'background.paper' }} />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5, fontWeight: 600 }}>+2K</Typography>
          </Stack>
        </Paper>
      </Stack>

      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={1.3} sx={{ mb: 1.6 }}>
        <Typography variant="h5" fontWeight={800} fontSize={{ xs: '1.25rem', md: '1.8rem' }}>Explore Learning Resources</Typography>
        <Stack direction="row" spacing={1}>
          <ToggleButtonGroup
            size="small"
            exclusive
            value={viewMode}
            onChange={(_, nextValue) => {
              if (nextValue) setViewMode(nextValue);
            }}
          >
            <ToggleButton value="grid"><Apps fontSize="small" /></ToggleButton>
            <ToggleButton value="list"><ViewList fontSize="small" /></ToggleButton>
          </ToggleButtonGroup>
        </Stack>
      </Stack>

      <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
        {sortTabs.map((tab) => {
          const isActive = selectedSort === sortValueMap[tab];
          return (
            <Button
              key={tab}
              size="small"
              onClick={() => onSortChange?.(sortValueMap[tab])}
              startIcon={isActive ? <Menu fontSize="small" /> : null}
              sx={(theme) => ({
                textTransform: 'none',
                borderRadius: 2,
                border: '1px solid',
                borderColor: theme.palette.divider,
                color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
                bgcolor: isActive
                  ? (theme.palette.mode === 'dark' ? 'rgba(59,130,246,0.18)' : '#EEF2FF')
                  : theme.palette.background.paper,
                fontWeight: isActive ? 700 : 500,
              })}
            >
              {tab}
            </Button>
          );
        })}
      </Stack>

      {loading ? (
        <Stack alignItems="center" justifyContent="center" sx={{ py: 6 }}>
          <CircularProgress size={30} />
        </Stack>
      ) : cardResources.length === 0 ? (
        <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
          <Typography color="text.secondary">No resources available yet.</Typography>
        </Paper>
      ) : (
        <>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: viewMode === 'grid'
                ? { xs: '1fr', md: 'repeat(2, 1fr)', xl: 'repeat(3, 1fr)' }
                : '1fr',
              gap: 1.5,
            }}
          >
            {cardResources.map((resource, index) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                view={viewMode}
                onClick={() => onResourceOpen?.(resources[index])}
              />
            ))}
          </Box>

          {pagination && Number(pagination.total_pages || 0) > 1 ? (
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Page {pagination.page || page} of {pagination.total_pages} · {pagination.total_items || 0} resources
              </Typography>
              <Stack direction="row" spacing={1}>
                <Button
                  size="small"
                  variant="outlined"
                  disabled={!pagination.has_prev_page}
                  onClick={() => onPageChange?.(Math.max(1, Number(page || 1) - 1))}
                  sx={{ textTransform: 'none' }}
                >
                  Previous
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  disabled={!pagination.has_next_page}
                  onClick={() => onPageChange?.(Number(page || 1) + 1)}
                  sx={{ textTransform: 'none' }}
                >
                  Next
                </Button>
              </Stack>
            </Stack>
          ) : null}
        </>
      )}
    </Box>
  );
};

export default DiscoveryMainContent;
