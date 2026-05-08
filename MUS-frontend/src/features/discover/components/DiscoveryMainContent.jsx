import { memo, useCallback, useEffect, useState, useRef, useMemo } from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import InputAdornment from '@mui/material/InputAdornment';
import InputBase from '@mui/material/InputBase';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';

import AppsIcon from '@mui/icons-material/Apps';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
import GradeIcon from '@mui/icons-material/Grade';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import PeopleIcon from '@mui/icons-material/People';
import RecommendIcon from '@mui/icons-material/Recommend';
import SearchIcon from '@mui/icons-material/Search';
import ViewListIcon from '@mui/icons-material/ViewList';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

import { motion, useReducedMotion } from 'framer-motion';
import ResourceCard from '@/features/discover/components/ResourceCard';
import { toResourceCardModel } from '@/features/discover/components/resourceCardMapper';

// ---------------------------------------------------------------------------
// Static data — module scope, no re-creation on render
// ---------------------------------------------------------------------------

const SORT_TABS = [
  { label: 'Recommended', value: 'recommended', icon: <RecommendIcon sx={{ fontSize: 14 }} /> },
  { label: 'Most recent',  value: 'newest',      icon: <NewReleasesIcon sx={{ fontSize: 14 }} /> },
  { label: 'Most viewed',  value: 'favorites',   icon: <VisibilityIcon sx={{ fontSize: 14 }} /> },
  { label: 'Top rated',    value: 'rating',       icon: <GradeIcon sx={{ fontSize: 14 }} /> },
];

const PROMO_AVATARS = [
  'https://i.pravatar.cc/28?img=1',
  'https://i.pravatar.cc/28?img=2',
  'https://i.pravatar.cc/28?img=3',
];

// ---------------------------------------------------------------------------
// Static SX objects — defined once, never recreated
// ---------------------------------------------------------------------------

const OUTER_SX = {
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  minWidth: 0,
  flex: 1,
};

const TOP_ROW_SX = {
  display: 'flex',
  flexDirection: { xs: 'column', lg: 'row' },
  alignItems: { xs: 'stretch', lg: 'center' },
  gap: 1.5,
  width: '100%',
  mb: 2,
};

const SEARCH_WRAP_SX = { flex: 1, minWidth: 0 };

// Factory kept as function — theme-dependent, used once per mount/theme change
const SEARCH_PAPER_SX = (theme) => ({
  px: 1.25,
  py: 0,
  borderRadius: 2,
  border: '0.5px solid',
  borderColor: 'divider',
  width: '100%',
  height: 40,
  boxShadow: 'none',
  bgcolor: theme.palette.background.paper,
  display: 'flex',
  alignItems: 'center',
  gap: 1,
  transition: 'border-color 150ms ease',
  '&:focus-within': {
    borderColor: theme.palette.primary.main,
    boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.1)}`,
  },
});

const INPUT_SX = {
  flex: 1,
  minWidth: 0,
  fontSize: '0.875rem',
  '& input': { py: 0 },
  '& input::placeholder': { opacity: 0.45, fontSize: '0.875rem' },
};

// Search button — flat, no gradient (gradients re-paint on every hover in some browsers)
const SEARCH_BTN_SX = {
  ml: 'auto',
  alignSelf: 'center',
  textTransform: 'none',
  fontWeight: 500,
  borderRadius: '6px',
  px: { xs: 1.5, md: 2 },
  height: 28,
  py: 0,
  fontSize: '0.8rem',
  minWidth: { xs: 70, md: 80 },
  flexShrink: 0,
  bgcolor: 'primary.main',
  color: '#fff',
  boxShadow: 'none',
  '&:hover': { bgcolor: 'primary.dark', boxShadow: 'none' },
};

// Promo card — fixed width, no shadow on dark mode branch
const PROMO_CARD_SX = {
  border: '0.5px solid',
  borderColor: 'divider',
  borderRadius: 3,
  px: 1.75,
  py: 1.25,
  boxShadow: 'none',
  width: { xs: '100%', lg: 220 },
  flexShrink: 0,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
};

const SECTION_HEADER_SX = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: { xs: 1.5, md: 1 },
  mb: 1.75,
};

const SECTION_TITLE_SX = {
  fontWeight: 500,
  fontSize: { xs: '1rem', md: '1.1rem' },
  color: 'text.primary',
  flexShrink: 0,
};

const SORT_ROW_SX = {
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: 0.75,
};

// ToggleButtonGroup — remove MUI default borders so our own styling takes over
const TOGGLE_GROUP_SX = {
  '& .MuiToggleButtonGroup-grouped': {
    border: '0.5px solid !important',
    borderColor: 'divider !important',
    borderRadius: '6px !important',
  },
};

// Static view-toggle SX — no theme factory needed, uses CSS vars
const VIEW_TOGGLE_SX = {
  p: 0.625,
  color: 'text.secondary',
  '&.Mui-selected': { color: 'primary.main', bgcolor: 'action.selected' },
};

const GRID_SX_GRID = {
  display: 'grid',
  width: '100%',
  gridTemplateColumns: {
    xs: '1fr',
    sm: 'repeat(2, 1fr)',
    md: 'repeat(3, 1fr)',
    xl: 'repeat(4, 1fr)',
  },
  gap: 2,
  alignItems: 'start',
};

const GRID_SX_LIST = {
  display: 'grid',
  width: '100%',
  gridTemplateColumns: '1fr',
  gap: 1.5,
  alignItems: 'start',
};

const EMPTY_STATE_SX = {
  py: 10,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 1.25,
  color: 'text.secondary',
};

const PAGINATION_SX = {
  mt: 3,
  justifyContent: 'center',
  alignItems: 'center',
  gap: 1.5,
};

const PAGE_INFO_SX = {
  fontSize: '0.8rem',
  color: 'text.secondary',
  minWidth: 140,
  textAlign: 'center',
};

// Banner — no gradient; uses primary.main for a clean, accessible background
const BANNER_SX = {
  position: 'sticky',
  bottom: 0,
  left: 0,
  zIndex: 10,
  width: '100%',
  bgcolor: 'primary.main',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: { xs: 1.5, md: 3 },
  px: { xs: 2, sm: 3, md: 4 },
  py: { xs: 1.25, md: 1.5 },
  mt: 4,
  borderRadius: '12px 12px 0 0',
};

const BANNER_ICON_WRAP_SX = {
  width: 36,
  height: 36,
  borderRadius: '50%',
  bgcolor: 'rgba(255,255,255,0.15)',
  display: { xs: 'none', sm: 'flex' },
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};

const BANNER_BTN_SX = {
  bgcolor: '#fff',
  color: 'primary.dark',
  borderRadius: '8px',
  textTransform: 'none',
  fontWeight: 500,
  px: { xs: 1.5, md: 2.25 },
  py: { xs: 0.625, md: 0.75 },
  fontSize: { xs: '0.8rem', md: '0.85rem' },
  whiteSpace: 'nowrap',
  flexShrink: 0,
  boxShadow: 'none',
  '&:hover': { bgcolor: 'rgba(255,255,255,0.9)', boxShadow: 'none' },
};

// Motion constants — kept stable at module scope
const MOTION_INITIAL_REDUCE = false;
const MOTION_INITIAL_NORMAL = { y: '100%', opacity: 0 };
const MOTION_ANIMATE = { y: 0, opacity: 1 };
const MOTION_TRANSITION_REDUCE = { duration: 0 };
const MOTION_TRANSITION_NORMAL = { type: 'spring', damping: 30, stiffness: 200, delay: 0.2 };
const MOTION_HOVER_NORMAL = { scale: 1.02 };
const MOTION_TAP_NORMAL = { scale: 0.98 };
const MOTION_BTN_TRANSITION = { type: 'spring', damping: 22, stiffness: 300 };

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

const ResourceCardSkeleton = memo(() => (
  <Box sx={{ borderRadius: 3, overflow: 'hidden', border: '0.5px solid', borderColor: 'divider' }}>
    <Skeleton variant="rectangular" height={160} sx={{ borderRadius: 0 }} />
    <Box sx={{ p: 1.5 }}>
      <Skeleton variant="text" width="45%" height={12} sx={{ mb: 0.75 }} />
      <Skeleton variant="text" width="85%" height={16} sx={{ mb: 0.4 }} />
      <Skeleton variant="text" width="70%" height={16} sx={{ mb: 1 }} />
      <Stack direction="row" alignItems="center" gap={1}>
        <Skeleton variant="circular" width={24} height={24} />
        <Skeleton variant="text" width={55} height={12} />
      </Stack>
    </Box>
  </Box>
));
ResourceCardSkeleton.displayName = 'ResourceCardSkeleton';

/** Debounced search bar — local state prevents parent re-renders on every keystroke */
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
  const handleSearch  = useCallback(() => onSearchQueryChange?.(localSearch), [localSearch, onSearchQueryChange]);
  const handleKeyDown = useCallback((e) => { if (e.key === 'Enter') handleSearch(); }, [handleSearch]);

  return (
    <Paper
      component="form"
      elevation={0}
      onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
      sx={SEARCH_PAPER_SX}
    >
      <InputAdornment position="start">
        <SearchIcon sx={{ color: 'text.disabled', fontSize: 18 }} />
      </InputAdornment>
      <InputBase
        placeholder="Search resources, topics, or tutors…"
        value={localSearch}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        sx={INPUT_SX}
        inputProps={{ 'aria-label': 'Search resources' }}
      />
      <Button type="submit" variant="contained" disableElevation sx={SEARCH_BTN_SX}>
        Search
      </Button>
    </Paper>
  );
});
DiscoverySearchBar.displayName = 'DiscoverySearchBar';

/**
 * Sort tab button — stable callback via memo + useCallback.
 * SX is a plain object (not a factory) because all colour logic uses MUI
 * semantic tokens that resolve correctly in both light and dark modes.
 */
const SortTabButton = memo(({ tab, isActive, onSort }) => {
  const handleClick = useCallback(() => onSort?.(tab.value), [onSort, tab.value]);

  return (
    <Button
      startIcon={tab.icon}
      onClick={handleClick}
      disableElevation
      sx={{
        textTransform: 'none',
        borderRadius: '6px',
        border: '0.5px solid',
        borderColor: isActive ? 'primary.main' : 'divider',
        color: isActive ? 'primary.main' : 'text.secondary',
        bgcolor: isActive ? 'action.selected' : 'transparent',
        fontWeight: isActive ? 500 : 400,
        fontSize: '0.8rem',
        px: 1.25,
        py: 0.5,
        minWidth: 0,
        transition: 'border-color 150ms ease, color 150ms ease, background 150ms ease',
        '&:hover': {
          bgcolor: 'action.hover',
          borderColor: 'primary.light',
          color: 'primary.main',
        },
      }}
    >
      {tab.label}
    </Button>
  );
});
SortTabButton.displayName = 'SortTabButton';

/** Promo card — fully static, no props, memo prevents any re-render */
const PromoCard = memo(() => (
  <Paper variant="outlined" sx={PROMO_CARD_SX}>
    <Typography
      sx={{ fontWeight: 500, fontSize: '0.85rem', color: 'text.primary', mb: 0.25, lineHeight: 1.4 }}
    >
      Learn. Share. Grow together.
    </Typography>
    <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', mb: 1, lineHeight: 1.5 }}>
      Join thousands of students learning from each other.
    </Typography>
    <Stack direction="row" alignItems="center">
      {PROMO_AVATARS.map((src, i) => (
        <Avatar
          key={src}
          src={src}
          sx={{
            width: 24,
            height: 24,
            border: '1.5px solid',
            borderColor: 'background.paper',
            ml: i === 0 ? 0 : -0.75,
            zIndex: PROMO_AVATARS.length - i,
          }}
          imgProps={{ loading: 'lazy' }}
        />
      ))}
      <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', ml: 1 }}>+2K members</Typography>
    </Stack>
  </Paper>
));
PromoCard.displayName = 'PromoCard';

/** Pagination row */
const PaginationRow = memo(({ currentPage, totalPages, totalItems, onPrev, onNext }) => (
  <Stack direction="row" sx={PAGINATION_SX}>
    <Button
      variant="outlined"
      size="small"
      disabled={currentPage <= 1}
      onClick={onPrev}
      startIcon={<ChevronLeftIcon sx={{ fontSize: 16 }} />}
      sx={{ textTransform: 'none', borderRadius: '6px', fontSize: '0.8rem', borderColor: 'divider' }}
    >
      Previous
    </Button>
    <Typography sx={PAGE_INFO_SX}>
      Page {currentPage} of {totalPages}
      {totalItems > 0 && ` · ${totalItems} resources`}
    </Typography>
    <Button
      variant="outlined"
      size="small"
      disabled={currentPage >= totalPages}
      onClick={onNext}
      endIcon={<ChevronRightIcon sx={{ fontSize: 16 }} />}
      sx={{ textTransform: 'none', borderRadius: '6px', fontSize: '0.8rem', borderColor: 'divider' }}
    >
      Next
    </Button>
  </Stack>
));
PaginationRow.displayName = 'PaginationRow';

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

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
  const reduce = useReducedMotion();

  // Map resources to card model — stable across renders unless `resources` changes
  const cardResources = useMemo(
    () => (resources ?? []).map(toResourceCardModel),
    [resources]
  );

  const handleViewMode = useCallback((_, next) => { if (next) setViewMode(next); }, []);

  // Stable page-change handlers
  const handlePrev = useCallback(
    () => onPageChange?.(Math.max(1, Number(page || 1) - 1)),
    [onPageChange, page]
  );
  const handleNext = useCallback(
    () => onPageChange?.(Number(page || 1) + 1),
    [onPageChange, page]
  );

  const totalPages  = Number(pagination?.total_pages || 0);
  const currentPage = pagination?.page || page;
  const totalItems  = pagination?.total_items || 0;

  return (
    <Box sx={OUTER_SX}>

      {/* Search + promo row */}
      <Box sx={TOP_ROW_SX}>
        <Box sx={SEARCH_WRAP_SX}>
          <DiscoverySearchBar
            searchQuery={searchQuery}
            onSearchQueryChange={onSearchQueryChange}
          />
        </Box>
        <PromoCard />
      </Box>

      {/* Section header: title + sort controls */}
      <Box sx={SECTION_HEADER_SX}>
        <Typography sx={SECTION_TITLE_SX}>Explore learning resources</Typography>

        <Box sx={SORT_ROW_SX}>
          {SORT_TABS.map((tab) => (
            <SortTabButton
              key={tab.value}
              tab={tab}
              isActive={selectedSort === tab.value}
              onSort={onSortChange}
            />
          ))}

          <Divider orientation="vertical" flexItem sx={{ mx: 0.25, height: 20, alignSelf: 'center' }} />

          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewMode}
            size="small"
            sx={TOGGLE_GROUP_SX}
            aria-label="View mode"
          >
            <ToggleButton value="grid" sx={VIEW_TOGGLE_SX} aria-label="Grid view">
              <AppsIcon sx={{ fontSize: 16 }} />
            </ToggleButton>
            <ToggleButton value="list" sx={VIEW_TOGGLE_SX} aria-label="List view">
              <ViewListIcon sx={{ fontSize: 16 }} />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      {/* Content area */}
      {loading ? (
        <Box sx={viewMode === 'grid' ? GRID_SX_GRID : GRID_SX_LIST}>
          {Array.from({ length: 8 }).map((_, i) => (
            <ResourceCardSkeleton key={i} />
          ))}
        </Box>
      ) : cardResources.length === 0 ? (
        <Box sx={EMPTY_STATE_SX}>
          <EmojiObjectsIcon sx={{ fontSize: 40, opacity: 0.25 }} />
          <Typography sx={{ fontWeight: 500, fontSize: '0.95rem' }}>
            No resources found
          </Typography>
          <Typography
            variant="body2"
            textAlign="center"
            color="text.secondary"
            sx={{ maxWidth: 340, fontSize: '0.85rem', lineHeight: 1.6 }}
          >
            Try adjusting your filters or search query to discover more content.
          </Typography>
        </Box>
      ) : (
        <>
          <Box sx={viewMode === 'grid' ? GRID_SX_GRID : GRID_SX_LIST}>
            {cardResources.map((resource, index) => (
              <ResourceCard
                key={resource.id ?? index}
                resource={resource}
                viewMode={viewMode}
                // NOTE: Pass resource.id into ResourceCard's onOpen prop if ResourceCard
                // is updated to accept it — avoids closing over `resources[index]` here.
                onOpen={() => onResourceOpen?.(resources[index])}
              />
            ))}
          </Box>

          {totalPages > 1 && (
            <PaginationRow
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              onPrev={handlePrev}
              onNext={handleNext}
            />
          )}
        </>
      )}

      {/* Sticky CTA banner */}
      <motion.div
        initial={reduce ? MOTION_INITIAL_REDUCE : MOTION_INITIAL_NORMAL}
        animate={MOTION_ANIMATE}
        transition={reduce ? MOTION_TRANSITION_REDUCE : MOTION_TRANSITION_NORMAL}
        style={{ width: '100%' }}
      >
        <Box sx={BANNER_SX}>
          <Stack direction="row" alignItems="center" gap={1.5} sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={BANNER_ICON_WRAP_SX}>
              <PeopleIcon sx={{ color: '#fff', fontSize: 18 }} />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                sx={{
                  fontWeight: 500,
                  fontSize: { xs: '0.85rem', md: '0.95rem' },
                  color: '#fff',
                  lineHeight: 1.35,
                }}
              >
                Share your knowledge. Help others. Earn recognition.
              </Typography>
              <Typography
                sx={{
                  fontSize: { xs: '0.72rem', md: '0.78rem' },
                  color: 'rgba(255,255,255,0.75)',
                  mt: 0.2,
                }}
              >
                Join our community of student educators today.
              </Typography>
            </Box>
          </Stack>

          <motion.div
            whileHover={reduce ? {} : MOTION_HOVER_NORMAL}
            whileTap={reduce ? {} : MOTION_TAP_NORMAL}
            transition={MOTION_BTN_TRANSITION}
            style={{ flexShrink: 0 }}
          >
            <Button
              variant="contained"
              disableElevation
              endIcon={<ArrowForwardIcon sx={{ fontSize: 15 }} />}
              sx={BANNER_BTN_SX}
            >
              Become a creator
            </Button>
          </motion.div>
        </Box>
      </motion.div>
    </Box>
  );
};

export default memo(DiscoveryMainContent);