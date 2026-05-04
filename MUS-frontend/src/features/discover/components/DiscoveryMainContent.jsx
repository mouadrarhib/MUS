import { memo, useCallback, useEffect, useState, useRef, useMemo } from 'react';
// Optimized Imports for Tree-Shaking
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import InputBase from '@mui/material/InputBase';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';

import Apps from '@mui/icons-material/Apps';
import ArrowForward from '@mui/icons-material/ArrowForward';
import EmojiObjects from '@mui/icons-material/EmojiObjects';
import Grade from '@mui/icons-material/Grade';
import NewReleases from '@mui/icons-material/NewReleases';
import People from '@mui/icons-material/People';
import Recommend from '@mui/icons-material/Recommend';
import Search from '@mui/icons-material/Search';
import ViewList from '@mui/icons-material/ViewList';
import Visibility from '@mui/icons-material/Visibility';

import { motion, useReducedMotion } from 'framer-motion';
import ResourceCard from '@/features/discover/components/ResourceCard';
import { toResourceCardModel } from '@/features/discover/components/resourceCardMapper';

// ─── Static Data ──────────────────────────────────────────────────────────────

const SORT_TABS = [
  { label: 'Recommended', value: 'recommended', icon: <Recommend sx={{ fontSize: 14 }} /> },
  { label: 'Most Recent',  value: 'newest',      icon: <NewReleases sx={{ fontSize: 14 }} /> },
  { label: 'Most Viewed',  value: 'favorites',   icon: <Visibility sx={{ fontSize: 14 }} /> },
  { label: 'Top Rated',    value: 'rating',       icon: <Grade sx={{ fontSize: 14 }} /> },
];

const PROMO_AVATARS = [
  'https://i.pravatar.cc/28?img=1',
  'https://i.pravatar.cc/28?img=2',
  'https://i.pravatar.cc/28?img=3',
];

// ─── SX Definitions (All strictly static to avoid re-creation) ───────────────

const OUTER_SX = { display: 'flex', flexDirection: 'column', width: '100%', minWidth: 0, flex: 1 };
const TOP_ROW_SX = { display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, alignItems: { xs: 'stretch', lg: 'center' }, gap: 2, width: '100%', mb: 2.5 };
const SEARCH_WRAP_SX = { flex: 1, minWidth: 0 };

const SEARCH_PAPER_SX = (theme) => ({
  px: 1.5, py: 0, borderRadius: '10px',
  border: '1.5px solid', borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.10)' : '#E5E7EB',
  width: '100%', height: 44, boxShadow: 'none', bgcolor: theme.palette.background.paper,
  display: 'flex', alignItems: 'center', gap: 1, transition: 'border-color 180ms ease, box-shadow 180ms ease',
  '&:focus-within': { borderColor: theme.palette.primary.main, boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.12)}` },
});

const INPUT_SX = { flex: 1, minWidth: 0, fontSize: '0.9rem', '& input': { py: 0 }, '& input::placeholder': { opacity: 0.55 } };

const SEARCH_BTN_SX = {
  ml: 'auto', alignSelf: 'center', textTransform: 'none', fontWeight: 700, borderRadius: '8px',
  px: { xs: 2, md: 2.5 }, height: 32, py: 0, fontSize: '0.85rem', minWidth: { xs: 80, md: 95 }, flexShrink: 0,
  background: 'linear-gradient(92deg, #1D72F2 0%, #7C3AED 100%)', color: '#fff', boxShadow: '0 2px 8px rgba(29,114,242,0.28)',
  transition: 'box-shadow 180ms ease, transform 180ms cubic-bezier(0.16,1,0.3,1)',
  '&:hover': { background: 'linear-gradient(92deg, #1560d4 0%, #6b2fd4 100%)', boxShadow: '0 4px 16px rgba(29,114,242,0.38)', transform: 'translateY(-1px)' },
  '&:active': { transform: 'translateY(0)' },
};

const PROMO_CARD_SX = (theme) => ({
  bgcolor: theme.palette.background.paper, border: '1px solid',
  borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)', borderRadius: '16px', px: 2, py: 1.5,
  boxShadow: theme.palette.mode === 'dark' ? '0 4px 20px rgba(0,0,0,0.28)' : '0 4px 20px rgba(17,24,39,0.06)',
  width: { xs: '100%', lg: 230 }, flexShrink: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center',
});

const SECTION_HEADER_SX = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: { xs: 1.5, md: 1 }, mb: 2 };
const SECTION_TITLE_SX = { fontWeight: 700, fontSize: { xs: '1.1rem', md: '1.25rem' }, color: 'text.primary', flexShrink: 0 };
const SORT_ROW_SX = { display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 };
const TOGGLE_GROUP_SX = { '& .MuiToggleButtonGroup-grouped': { border: 'none !important', borderRadius: '10px !important' } };

const VIEW_TOGGLE_SX = (theme) => ({
  border: '1px solid', borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)', borderRadius: '10px !important',
  p: 0.75, color: 'text.secondary', '&.Mui-selected': { color: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.08) },
});

// Avoids function recreation: use static objects for view modes
const GRID_SX_GRID = { display: 'grid', width: '100%', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', xl: 'repeat(4, 1fr)' }, gap: 2.5, alignItems: 'start' };
const GRID_SX_LIST = { display: 'grid', width: '100%', gridTemplateColumns: '1fr', gap: 2, alignItems: 'start' };

const EMPTY_STATE_SX = { py: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, color: 'text.secondary' };
const PAGINATION_SX = { mt: 4, justifyContent: 'center', alignItems: 'center', gap: 2 };
const PAGE_INFO_SX = { fontSize: '0.82rem', color: 'text.secondary', minWidth: 140, textAlign: 'center' };

const BANNER_SX = {
  position: 'sticky', bottom: 0, left: 0, zIndex: 10, width: '100%', background: 'linear-gradient(92deg, #1D72F2 0%, #7C3AED 100%)',
  boxShadow: '0 -2px 20px rgba(0,0,0,0.13)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: { xs: 1.5, md: 3 },
  px: { xs: 2, sm: 3, md: 5 }, py: { xs: 1.5, md: 1.75 }, mt: 4,
};

const BANNER_ICON_WRAP_SX = { width: 44, height: 44, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.15)', display: { xs: 'none', sm: 'flex' }, alignItems: 'center', justifyContent: 'center', flexShrink: 0 };
const BANNER_BTN_SX = {
  bgcolor: '#fff', color: '#1D4ED8', borderRadius: '10px', textTransform: 'none', fontWeight: 700, px: { xs: 1.75, md: 2.75 }, py: { xs: 0.75, md: 0.9 },
  fontSize: { xs: '0.82rem', md: '0.9rem' }, whiteSpace: 'nowrap', flexShrink: 0, transition: 'background 180ms ease, box-shadow 180ms ease',
  '&:hover': { bgcolor: '#EEF2FF', boxShadow: '0 4px 16px rgba(0,0,0,0.18)' },
};

// Animations
const MOTION_INITIAL_REDUCE = false;
const MOTION_INITIAL_NORMAL = { y: '100%', opacity: 0 };
const MOTION_ANIMATE = { y: 0, opacity: 1 };
const MOTION_TRANSITION_REDUCE = { duration: 0 };
const MOTION_TRANSITION_NORMAL = { type: 'spring', damping: 30, stiffness: 200, delay: 0.2 };
const MOTION_HOVER_NORMAL = { scale: 1.03, y: -1 };
const MOTION_TAP_NORMAL = { scale: 0.97 };
const MOTION_BTN_TRANSITION = { type: 'spring', damping: 22, stiffness: 300 };

// ─── Sub-Components ───────────────────────────────────────────────────────────

const ResourceCardSkeleton = memo(() => (
  <Box sx={{ borderRadius: '16px', overflow: 'hidden' }}>
    <Skeleton variant="rectangular" height={180} sx={{ borderRadius: '12px 12px 0 0' }} />
    <Box sx={{ p: 1.5 }}>
      <Skeleton variant="text" width="55%" height={14} sx={{ mb: 0.75 }} />
      <Skeleton variant="text" width="80%" height={18} sx={{ mb: 0.5 }} />
      <Skeleton variant="text" width="80%" height={18} sx={{ mb: 0.5 }} />
      <Skeleton variant="text" width="60%" height={14} sx={{ mb: 1 }} />
      <Stack direction="row" alignItems="center" gap={1}>
        <Skeleton variant="circular" width={28} height={28} />
        <Skeleton variant="text" width={60} height={14} />
      </Stack>
    </Box>
  </Box>
));
ResourceCardSkeleton.displayName = 'ResourceCardSkeleton';

const DiscoverySearchBar = memo(({ searchQuery, onSearchQueryChange }) => {
  const [localSearch, setLocalSearch] = useState(searchQuery || '');
  const isFirstSyncRef = useRef(true);

  useEffect(() => { setLocalSearch(searchQuery || ''); }, [searchQuery]);

  useEffect(() => {
    if (isFirstSyncRef.current) { isFirstSyncRef.current = false; return; }
    const id = window.setTimeout(() => onSearchQueryChange?.(localSearch), 400);
    return () => window.clearTimeout(id);
  }, [localSearch, onSearchQueryChange]);

  const handleChange  = useCallback((e) => setLocalSearch(e.target.value), []);
  const handleKeyDown = useCallback((e) => { if (e.key === 'Enter') onSearchQueryChange?.(localSearch); }, [localSearch, onSearchQueryChange]);
  const handleSearch  = useCallback(() => onSearchQueryChange?.(localSearch), [localSearch, onSearchQueryChange]);

  return (
    <Paper component="form" onSubmit={(e) => { e.preventDefault(); handleSearch(); }} sx={SEARCH_PAPER_SX} elevation={0}>
      <InputAdornment position="start"><Search sx={{ color: 'text.disabled', fontSize: 20 }} /></InputAdornment>
      <InputBase placeholder="Search for resources, topics, or students..." value={localSearch} onChange={handleChange} onKeyDown={handleKeyDown} sx={INPUT_SX} inputProps={{ 'aria-label': 'Search resources' }} />
      <Button type="submit" variant="contained" disableElevation sx={SEARCH_BTN_SX}>Search</Button>
    </Paper>
  );
});
DiscoverySearchBar.displayName = 'DiscoverySearchBar';

// Optimized: takes onSort callback to prevent inline function recreation
const SortTabButton = memo(({ tab, isActive, onSort }) => {
  const handleClick = useCallback(() => onSort?.(tab.value), [onSort, tab.value]);

  return (
    <Button
      startIcon={tab.icon}
      onClick={handleClick}
      sx={(theme) => ({
        textTransform: 'none', borderRadius: '10px', border: '1px solid',
        borderColor: isActive ? 'transparent' : theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
        color: isActive ? '#fff' : theme.palette.text.secondary,
        bgcolor: isActive ? theme.palette.primary.main : theme.palette.background.paper,
        fontWeight: isActive ? 700 : 500, fontSize: '0.82rem', px: 1.5, py: 0.65, minWidth: 0,
        transition: 'background 180ms ease, color 180ms ease, border-color 180ms ease, transform 180ms cubic-bezier(0.16,1,0.3,1)',
        '&:hover': {
          transform: 'translateY(-1px)',
          bgcolor: isActive ? theme.palette.primary.dark : theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : '#F3F4F6',
          borderColor: isActive ? 'transparent' : theme.palette.primary.main,
          color: isActive ? '#fff' : theme.palette.primary.main,
        },
      })}
    >
      {tab.label}
    </Button>
  );
});
SortTabButton.displayName = 'SortTabButton';

const PromoCard = memo(() => (
  <Box sx={PROMO_CARD_SX}>
    <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: 'primary.main', mb: 0.3, lineHeight: 1.3 }}>Learn. Share. Grow Together</Typography>
    <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary', mb: 1.25, lineHeight: 1.5 }}>Join thousands of students<br />learning from each other.</Typography>
    <Stack direction="row" alignItems="center">
      {PROMO_AVATARS.map((src, i) => (
        <Avatar key={i} src={src} sx={{ width: 28, height: 28, border: '2px solid white', ml: i === 0 ? 0 : -1, zIndex: PROMO_AVATARS.length - i }} />
      ))}
      <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary', ml: 1 }}>+2K</Typography>
    </Stack>
  </Box>
));
PromoCard.displayName = 'PromoCard';

// ─── Main Component ───────────────────────────────────────────────────────────

const DiscoveryMainContent = ({ resources, loading = false, searchQuery = '', onSearchQueryChange, selectedSort = 'recommended', onSortChange, pagination = null, page = 1, onPageChange, onResourceOpen }) => {
  const [viewMode, setViewMode] = useState('grid');
  const reduce = useReducedMotion();

  const cardResources = useMemo(() => (resources ?? []).map(toResourceCardModel), [resources]);

  const handleViewMode = useCallback((_, next) => { if (next) setViewMode(next); }, []);
  const handlePrev = useCallback(() => onPageChange?.(Math.max(1, Number(page || 1) - 1)), [onPageChange, page]);
  const handleNext = useCallback(() => onPageChange?.(Number(page || 1) + 1), [onPageChange, page]);

  const totalPages  = Number(pagination?.total_pages || 0);
  const currentPage = pagination?.page || page;

  return (
    <Box sx={OUTER_SX}>
      <Box sx={TOP_ROW_SX}>
        <Box sx={SEARCH_WRAP_SX}>
          <DiscoverySearchBar searchQuery={searchQuery} onSearchQueryChange={onSearchQueryChange} />
        </Box>
        <PromoCard />
      </Box>

      <Box sx={SECTION_HEADER_SX}>
        <Typography sx={SECTION_TITLE_SX}>Explore Learning Resources</Typography>
        <Box sx={SORT_ROW_SX}>
          {SORT_TABS.map((tab) => (
            <SortTabButton key={tab.value} tab={tab} isActive={selectedSort === tab.value} onSort={onSortChange} />
          ))}
          <ToggleButtonGroup value={viewMode} exclusive onChange={handleViewMode} size="small" sx={TOGGLE_GROUP_SX} aria-label="View mode">
            <ToggleButton value="grid" sx={VIEW_TOGGLE_SX} aria-label="Grid view"><Apps sx={{ fontSize: 18 }} /></ToggleButton>
            <ToggleButton value="list" sx={VIEW_TOGGLE_SX} aria-label="List view"><ViewList sx={{ fontSize: 18 }} /></ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      {loading ? (
        <Box sx={viewMode === 'grid' ? GRID_SX_GRID : GRID_SX_LIST}>
          {Array.from({ length: 8 }).map((_, i) => <ResourceCardSkeleton key={i} />)}
        </Box>
      ) : cardResources.length === 0 ? (
        <Box sx={EMPTY_STATE_SX}>
          <EmojiObjects sx={{ fontSize: 48, opacity: 0.3 }} />
          <Typography fontWeight={600}>No resources found</Typography>
          <Typography variant="body2" textAlign="center" sx={{ maxWidth: 360 }}>Try adjusting your filters or search query to discover more content.</Typography>
        </Box>
      ) : (
        <>
          <Box sx={viewMode === 'grid' ? GRID_SX_GRID : GRID_SX_LIST}>
            {cardResources.map((resource, index) => (
              <ResourceCard
                key={resource.id ?? index}
                resource={resource}
                viewMode={viewMode}
                // PERFORMANCE NOTE: Ideal optimization requires ResourceCard to accept `resource` in onOpen.
                onOpen={() => onResourceOpen?.(resources[index])}
              />
            ))}
          </Box>
          {totalPages > 1 && (
            <Stack direction="row" sx={PAGINATION_SX}>
              <Button variant="outlined" disabled={currentPage <= 1} onClick={handlePrev} sx={{ textTransform: 'none', borderRadius: '10px' }}>Previous</Button>
              <Typography sx={PAGE_INFO_SX}>Page {currentPage} of {totalPages} · {pagination?.total_items || 0} resources</Typography>
              <Button variant="outlined" disabled={currentPage >= totalPages} onClick={handleNext} sx={{ textTransform: 'none', borderRadius: '10px' }}>Next</Button>
            </Stack>
          )}
        </>
      )}

      <motion.div
        initial={reduce ? MOTION_INITIAL_REDUCE : MOTION_INITIAL_NORMAL}
        animate={MOTION_ANIMATE}
        transition={reduce ? MOTION_TRANSITION_REDUCE : MOTION_TRANSITION_NORMAL}
      >
        <Box sx={BANNER_SX}>
          <Stack direction="row" alignItems="center" gap={1.5} sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={BANNER_ICON_WRAP_SX}><People sx={{ color: '#fff', fontSize: 22 }} /></Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontWeight: 700, fontSize: { xs: '0.875rem', md: '1rem' }, color: '#fff', lineHeight: 1.3 }}>
                Share your knowledge.&nbsp; Help others.&nbsp; Earn recognition.
              </Typography>
              <Typography sx={{ fontSize: { xs: '0.72rem', md: '0.82rem' }, color: 'rgba(255,255,255,0.78)', mt: 0.25 }}>
                Join our community of student educators today!
              </Typography>
            </Box>
          </Stack>
          <motion.div
            whileHover={reduce ? {} : MOTION_HOVER_NORMAL}
            whileTap={reduce ? {} : MOTION_TAP_NORMAL}
            transition={MOTION_BTN_TRANSITION}
            style={{ flexShrink: 0 }}
          >
            <Button variant="contained" disableElevation endIcon={<ArrowForward sx={{ fontSize: 16 }} />} sx={BANNER_BTN_SX}>
              Become a Creator
            </Button>
          </motion.div>
        </Box>
      </motion.div>
    </Box>
  );
};

export default memo(DiscoveryMainContent);