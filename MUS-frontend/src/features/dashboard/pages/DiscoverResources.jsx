import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Chip,
  Paper,
  InputBase,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  Skeleton,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  alpha,
} from '@mui/material';
import { AutoAwesome, School, MenuBook, Explore, Search, Close } from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import DiscoverNavbar from '@/features/discover/components/DiscoverNavbar';
import RecommendationResourceCard from '@/features/dashboard/components/RecommendationResourceCard';
import resourcesService from '@/services/resourcesService';
import personalizationService from '@/services/personalizationService';
import favoritesService from '@/services/favoritesService';
import { keyframes } from '@mui/system';

/* ── subtle shine animation on the welcome header ── */
const shimmer = keyframes`
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const parseScore = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const getResourceId = (item) => Number(item?.id || item?.resource_id || 0);

const getUniversityName = (item) => {
  return (
    item?.institution_name ||
    item?.author?.institution ||
    item?.institution ||
    'Unknown university'
  );
};

const getModuleName = (item) => {
  return (
    item?.module_title ||
    item?.academicContext?.moduleTitle ||
    item?.module_code ||
    item?.academicContext?.moduleCode ||
    'General resources'
  );
};

const getEducationalType = (item) => {
  const raw = item?.educationalType || item?.educational_type || item?.resource_educational_type || '';
  return String(raw || '').trim().toLowerCase() || 'other';
};

const formatTypeLabel = (value) => {
  const normalized = String(value || '').trim().toLowerCase();
  if (!normalized || normalized === 'all') return 'All Types';
  if (normalized === 'notes') return 'Notes';
  if (normalized === 'exam') return 'Exams';
  if (normalized === 'course') return 'Courses';
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

const groupResources = (resources, keyGetter) => {
  const groups = new Map();

  resources.forEach((item) => {
    const key = keyGetter(item);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
  });

  return Array.from(groups.entries())
    .map(([name, items]) => ({ name, items }))
    .sort((a, b) => b.items.length - a.items.length || a.name.localeCompare(b.name));
};

/* ── Reusable card styling ── */
const panelSx = (theme) => ({
  borderRadius: 3.5,
  border: '1px solid',
  borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)',
  background:
    theme.palette.mode === 'dark'
      ? 'linear-gradient(155deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 100%)'
      : 'linear-gradient(155deg, rgba(255,255,255,0.92) 0%, rgba(248,249,255,0.95) 100%)',
  backdropFilter: 'blur(10px)',
  boxShadow:
    theme.palette.mode === 'dark'
      ? '0 2px 20px rgba(0,0,0,0.3)'
      : '0 4px 24px rgba(20,20,60,0.06)',
  overflow: 'hidden',
  position: 'relative',
});

const DiscoverResources = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [resources, setResources] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [view, setView] = useState('universities');
  const [selectedModule, setSelectedModule] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [searchQuery, setSearchQuery] = useState(() => {
    const initialParams = new URLSearchParams(location.search);
    return initialParams.get('q') || '';
  });
  const [likedMap, setLikedMap] = useState({});
  const [likeLoadingId, setLikeLoadingId] = useState(null);
  const [downloadLoadingId, setDownloadLoadingId] = useState(null);
  const [feedback, setFeedback] = useState({ open: false, severity: 'info', message: '' });
  const deferredSearchQuery = useDeferredValue(searchQuery);

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      setLoading(true);
      const [recommendedRes, resourcesRes] = await Promise.allSettled([
        personalizationService.getMyRecommendations(12),
        resourcesService.listPublishedResources(),
      ]);

      if (!mounted) return;

      if (recommendedRes.status === 'fulfilled') {
        setRecommendations(Array.isArray(recommendedRes.value) ? recommendedRes.value : []);
      } else {
        setRecommendations([]);
      }

      if (resourcesRes.status === 'fulfilled') {
        setResources(Array.isArray(resourcesRes.value) ? resourcesRes.value : []);
      } else {
        setResources([]);
      }

      setLoading(false);
    };

    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    if (!isAuthenticated) {
      setLikedMap({});
      return () => {
        mounted = false;
      };
    }

    const loadFavorites = async () => {
      try {
        const favorites = await favoritesService.getAllFavorites();
        if (!mounted) return;

        const mapped = (Array.isArray(favorites) ? favorites : []).reduce((acc, fav) => {
          const id = Number(fav?.resource_id || fav?.id || 0);
          if (id > 0) acc[id] = true;
          return acc;
        }, {});
        setLikedMap(mapped);
      } catch {
        if (mounted) setLikedMap({});
      }
    };

    loadFavorites();
    return () => {
      mounted = false;
    };
  }, [isAuthenticated]);

  const rankedResources = useMemo(() => {
    const recommendationMap = new Map();
    recommendations.forEach((row) => {
      const id = Number(row?.resource_id || row?.id || 0);
      if (id > 0) recommendationMap.set(id, parseScore(row?.score));
    });

    const sorted = [...resources].sort((a, b) => {
      const scoreA = recommendationMap.get(getResourceId(a)) || 0;
      const scoreB = recommendationMap.get(getResourceId(b)) || 0;
      if (scoreA !== scoreB) return scoreB - scoreA;

      const tsA = new Date(a?.createdAt || a?.created_at || 0).getTime() || 0;
      const tsB = new Date(b?.createdAt || b?.created_at || 0).getTime() || 0;
      return tsB - tsA;
    });

    return sorted;
  }, [recommendations, resources]);

  const query = deferredSearchQuery.trim().toLowerCase();

  const availableModules = useMemo(() => {
    const set = new Set();
    rankedResources.forEach((item) => {
      set.add(getModuleName(item));
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [rankedResources]);

  const availableTypes = useMemo(() => {
    const set = new Set();
    rankedResources.forEach((item) => {
      set.add(getEducationalType(item));
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [rankedResources]);

  const matchesSearch = (item) => {
    if (!query) return true;

    const haystack = [
      item?.title,
      item?.resource_title,
      item?.author?.name,
      item?.author_name,
      item?.created_by_name,
      item?.creator_name,
      item?.institution_name,
      item?.author?.institution,
      item?.module_title,
      item?.academicContext?.moduleTitle,
      item?.module_code,
      item?.academicContext?.moduleCode,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return haystack.includes(query);
  };

  const matchesFilters = (item) => {
    if (selectedModule !== 'all' && getModuleName(item) !== selectedModule) {
      return false;
    }

    if (selectedType !== 'all' && getEducationalType(item) !== selectedType) {
      return false;
    }

    return true;
  };

  const filteredRecommendations = useMemo(
    () => recommendations.filter((item) => matchesSearch(item) && matchesFilters(item)),
    [recommendations, query, selectedModule, selectedType]
  );

  const filteredRankedResources = useMemo(
    () => rankedResources.filter((item) => matchesSearch(item) && matchesFilters(item)),
    [rankedResources, query, selectedModule, selectedType]
  );

  const groupedByUniversity = useMemo(
    () => groupResources(filteredRankedResources, getUniversityName),
    [filteredRankedResources]
  );

  const groupedByModule = useMemo(
    () => groupResources(filteredRankedResources, getModuleName),
    [filteredRankedResources]
  );

  const groupsToRender = view === 'modules' ? groupedByModule : groupedByUniversity;

  const handleLogout = () => {
    navigate('/', { replace: true });
    logout();
  };

  const ensureAuthenticated = () => {
    if (isAuthenticated) return true;
    navigate('/login', { state: { from: { pathname: '/discover' } } });
    return false;
  };

  const handleToggleLike = async (resourceId) => {
    if (!resourceId || !ensureAuthenticated()) return;

    try {
      setLikeLoadingId(resourceId);
      await favoritesService.toggleFavorite(resourceId);
      setLikedMap((prev) => ({ ...prev, [resourceId]: !prev[resourceId] }));
    } catch {
      setFeedback({ open: true, severity: 'error', message: 'Failed to update favorite.' });
    } finally {
      setLikeLoadingId(null);
    }
  };

  const handleDownload = async (resourceId) => {
    if (!resourceId || !ensureAuthenticated()) return;

    try {
      setDownloadLoadingId(resourceId);
      const result = await resourcesService.getResourceFileUrl(resourceId, { download: true });
      const url = result?.download_url || result?.url;
      if (!url) throw new Error('No download URL available');

      window.open(url, '_blank', 'noopener,noreferrer');
      try {
        await resourcesService.recordDownload(resourceId);
      } catch {
        // silent analytics fail
      }
    } catch (error) {
      const status = Number(error?.response?.status || 0);
      if (status === 403) {
        setFeedback({ open: true, severity: 'warning', message: 'This resource requires premium access to download.' });
      } else {
        setFeedback({ open: true, severity: 'error', message: 'Unable to download this resource now.' });
      }
    } finally {
      setDownloadLoadingId(null);
    }
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: (theme) =>
          theme.palette.mode === 'dark'
            ? 'linear-gradient(160deg, #0f0c1d 0%, #120f20 55%, #0c101a 100%)'
            : 'linear-gradient(160deg, #f0eeff 0%, #f2f4f8 55%, #edf2ff 100%)',
      }}
    >
      <DiscoverNavbar onLogout={handleLogout} isAuthenticated={isAuthenticated} />

      <Box sx={{ width: '100%', maxWidth: 1320, mx: 'auto', px: { xs: 1.5, sm: 2.5, md: 3.5 }, py: { xs: 2.5, md: 3.5 } }}>

        {/* ─── Welcome header ─── */}
        <Box sx={(theme) => ({ ...panelSx(theme), p: { xs: 2.5, md: 3 }, mb: 3 })}>
          {/* Top accent gradient */}
          <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #7c5cfc, #3b82f6, #10b981)' }} />

          <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between" spacing={2}>
            <Box>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.8 }}>
                <Box
                  sx={{
                    width: 30,
                    height: 30,
                    borderRadius: 1.5,
                    background: 'linear-gradient(135deg, #7c5cfc, #3b82f6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Explore sx={{ fontSize: 16, color: '#fff' }} />
                </Box>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.72rem',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: '#7c5cfc',
                  }}
                >
                  Personalized Discovery
                </Typography>
              </Stack>

              <Typography
                variant="h5"
                sx={{
                  fontWeight: 800,
                  mb: 0.5,
                  fontSize: { xs: '1.3rem', md: '1.5rem' },
                  color: (theme) => (theme.palette.mode === 'dark' ? '#f0ecff' : '#0d0b1a'),
                }}
              >
                Welcome, {user?.full_name || 'Student'}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: 'text.secondary', fontSize: '0.88rem' }}
              >
                Resources are ranked by recommendation score and grouped by academic context.
              </Typography>
            </Box>

            <ToggleButtonGroup
              size="small"
              value={view}
              exclusive
              onChange={(_, next) => next && setView(next)}
              sx={{
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.07),
                borderRadius: 2.5,
                p: 0.4,
                gap: 0.5,
                '& .MuiToggleButton-root': {
                  border: 0,
                  px: 2,
                  py: 0.6,
                  borderRadius: '8px !important',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  textTransform: 'none',
                  transition: 'all 0.2s ease',
                  '&.Mui-selected': {
                    bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(124,92,252,0.2)' : '#fff',
                    boxShadow: (theme) => theme.palette.mode === 'dark' ? 'none' : '0 2px 8px rgba(0,0,0,0.06)',
                    color: 'primary.main',
                  },
                },
              }}
            >
              <ToggleButton value="universities">
                <School sx={{ fontSize: 16, mr: 0.6 }} />
                Universities
              </ToggleButton>
              <ToggleButton value="modules">
                <MenuBook sx={{ fontSize: 16, mr: 0.6 }} />
                Modules
              </ToggleButton>
            </ToggleButtonGroup>
          </Stack>
        </Box>

        <Box
          sx={(theme) => ({
            ...panelSx(theme),
            mb: 3,
            p: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
          })}
        >
          <Search sx={{ ml: 0.75, color: 'text.secondary', fontSize: 20 }} />
          <InputBase
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search resources, authors, universities, or modules"
            sx={{
              flex: 1,
              fontSize: '0.95rem',
              px: 0.8,
              color: 'text.primary',
            }}
          />
          {searchQuery ? (
            <IconButton size="small" onClick={() => setSearchQuery('')} sx={{ mr: 0.5 }}>
              <Close fontSize="small" />
            </IconButton>
          ) : null}
        </Box>

        <Box
          sx={(theme) => ({
            ...panelSx(theme),
            mb: 3,
            p: { xs: 1.2, md: 1.4 },
          })}
        >
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.2} alignItems={{ xs: 'stretch', md: 'center' }}>
            <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 260 } }}>
              <InputLabel id="discover-module-filter-label">Module</InputLabel>
              <Select
                labelId="discover-module-filter-label"
                value={selectedModule}
                label="Module"
                onChange={(event) => setSelectedModule(event.target.value)}
              >
                <MenuItem value="all">All Modules</MenuItem>
                {availableModules.map((module) => (
                  <MenuItem key={module} value={module}>
                    {module}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 220 } }}>
              <InputLabel id="discover-type-filter-label">Type</InputLabel>
              <Select
                labelId="discover-type-filter-label"
                value={selectedType}
                label="Type"
                onChange={(event) => setSelectedType(event.target.value)}
              >
                <MenuItem value="all">All Types</MenuItem>
                {availableTypes.map((typeValue) => (
                  <MenuItem key={typeValue} value={typeValue}>
                    {formatTypeLabel(typeValue)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Stack direction="row" spacing={0.8} sx={{ ml: { md: 'auto' } }}>
              {(selectedModule !== 'all' || selectedType !== 'all') && (
                <Chip
                  label="Reset filters"
                  onClick={() => {
                    setSelectedModule('all');
                    setSelectedType('all');
                  }}
                  variant="outlined"
                />
              )}
              <Chip
                label={`${filteredRankedResources.length} results`}
                sx={{ bgcolor: (theme) => alpha(theme.palette.primary.main, 0.12), color: 'primary.main', fontWeight: 700 }}
              />
            </Stack>
          </Stack>
        </Box>

        {/* ─── Recommended For You ─── */}
        <Box sx={(theme) => ({ ...panelSx(theme), p: { xs: 2, md: 2.5 }, mb: 3 })}>
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 2,
              background: 'linear-gradient(90deg, #f59e0b 0%, #ec4899 100%)',
            }}
          />

          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: 1.5,
                bgcolor: 'rgba(245,158,11,0.12)',
                border: '1px solid rgba(245,158,11,0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AutoAwesome sx={{ fontSize: 15, color: '#f59e0b' }} />
            </Box>
            <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: '0.9rem' }}>
              Recommended For You
            </Typography>
            {!loading && filteredRecommendations.length > 0 && (
              <Chip
                size="small"
                label={`${filteredRecommendations.length} match${filteredRecommendations.length !== 1 ? 'es' : ''}`}
                sx={{
                  height: 20,
                  fontSize: '0.66rem',
                  fontWeight: 700,
                  bgcolor: 'rgba(245,158,11,0.1)',
                  color: '#f59e0b',
                  border: '1px solid rgba(245,158,11,0.22)',
                  '& .MuiChip-label': { px: 0.7 },
                }}
              />
            )}
          </Stack>

          {loading ? (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 1.5 }}>
              {[...Array(4)].map((_, idx) => (
                <Skeleton key={`rec-skeleton-${idx}`} variant="rounded" height={80} sx={{ borderRadius: 2.5 }} />
              ))}
            </Box>
          ) : filteredRecommendations.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3, opacity: 0.7, fontSize: '0.88rem' }}>
              {query
                ? 'No recommendations match your search.'
                : 'No personalized recommendations yet. Add profile tags to improve matching.'}
            </Typography>
          ) : (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
                gap: 1.5,
              }}
            >
              {filteredRecommendations.slice(0, 6).map((item, index) => {
                return (
                  <RecommendationResourceCard
                    key={`discover-recommendation-${item.resource_id || item.id}`}
                    item={item}
                    index={index}
                    score={parseScore(item.score)}
                    matchReasons={item.match_reasons}
                    showScore
                    showMatchReasons
                    showActions
                    isLiked={Boolean(likedMap[Number(item?.resource_id || item?.id || 0)])}
                    likeLoading={likeLoadingId === Number(item?.resource_id || item?.id || 0)}
                    downloadLoading={downloadLoadingId === Number(item?.resource_id || item?.id || 0)}
                    onToggleLike={() => handleToggleLike(Number(item?.resource_id || item?.id || 0))}
                    onDownload={() => handleDownload(Number(item?.resource_id || item?.id || 0))}
                  />
                );
              })}
            </Box>
          )}
        </Box>

        {/* ─── Grouped resources ─── */}
        <Box sx={{ display: 'grid', gap: 2 }}>
          {loading ? (
            [...Array(3)].map((_, idx) => (
              <Skeleton key={`group-skeleton-${idx}`} variant="rounded" height={120} sx={{ borderRadius: 3 }} />
            ))
          ) : groupsToRender.length === 0 ? (
            <Box
              sx={(theme) => ({
                ...panelSx(theme),
                p: 4,
                textAlign: 'center',
              })}
            >
              <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.7 }}>
                {query ? 'No resources match your search.' : 'No resources available yet.'}
              </Typography>
            </Box>
          ) : (
            groupsToRender.map((group) => (
              <Box
                key={`${view}-${group.name}`}
                sx={(theme) => ({
                  ...panelSx(theme),
                  p: { xs: 2, md: 2.5 },
                })}
              >
                {/* Group header */}
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: 1.5,
                      bgcolor: view === 'modules' ? 'rgba(59,130,246,0.1)' : 'rgba(124,92,252,0.1)',
                      border: '1px solid',
                      borderColor: view === 'modules' ? 'rgba(59,130,246,0.22)' : 'rgba(124,92,252,0.22)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {view === 'modules' ? (
                      <MenuBook sx={{ fontSize: 14, color: '#3b82f6' }} />
                    ) : (
                      <School sx={{ fontSize: 14, color: '#7c5cfc' }} />
                    )}
                  </Box>
                  <Typography variant="subtitle2" fontWeight={700} noWrap sx={{ fontSize: '0.9rem' }}>
                    {group.name}
                  </Typography>
                  <Chip
                    size="small"
                    label={`${group.items.length}`}
                    sx={{
                      height: 20,
                      minWidth: 28,
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                      color: 'primary.main',
                      '& .MuiChip-label': { px: 0.6 },
                    }}
                  />
                </Stack>

                {/* Cards */}
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: '1fr',
                      md: 'repeat(2, minmax(0, 1fr))',
                    },
                    gap: 1.5,
                  }}
                >
                  {group.items.slice(0, 8).map((resource, index) => {
                    return (
                      <RecommendationResourceCard
                        key={`${group.name}-${getResourceId(resource)}-${index}`}
                        item={resource}
                        index={index}
                        showActions
                        isLiked={Boolean(likedMap[getResourceId(resource)])}
                        likeLoading={likeLoadingId === getResourceId(resource)}
                        downloadLoading={downloadLoadingId === getResourceId(resource)}
                        onToggleLike={() => handleToggleLike(getResourceId(resource))}
                        onDownload={() => handleDownload(getResourceId(resource))}
                      />
                    );
                  })}
                </Box>
              </Box>
            ))
          )}
        </Box>
      </Box>

      <Snackbar
        open={feedback.open}
        autoHideDuration={3200}
        onClose={() => setFeedback((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setFeedback((prev) => ({ ...prev, open: false }))}
          severity={feedback.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {feedback.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DiscoverResources;
