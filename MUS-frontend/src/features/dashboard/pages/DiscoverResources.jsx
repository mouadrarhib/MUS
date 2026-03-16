import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Chip,
  Paper,
  Skeleton,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  alpha,
} from '@mui/material';
import { AutoAwesome, School, MenuBook } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import DiscoverNavbar from '@/features/discover/components/DiscoverNavbar';
import RecommendationResourceCard from '@/features/dashboard/components/RecommendationResourceCard';
import resourcesService from '@/services/resourcesService';
import personalizationService from '@/services/personalizationService';

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

const DiscoverResources = () => {
  const navigate = useNavigate();
  const { logout, user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [resources, setResources] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [view, setView] = useState('universities');

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

  const groupedByUniversity = useMemo(
    () => groupResources(rankedResources, getUniversityName),
    [rankedResources]
  );

  const groupedByModule = useMemo(
    () => groupResources(rankedResources, getModuleName),
    [rankedResources]
  );

  const groupsToRender = view === 'modules' ? groupedByModule : groupedByUniversity;

  const handleLogout = () => {
    navigate('/', { replace: true });
    logout();
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#120f1d' : '#f2f4f8'),
      }}
    >
      <DiscoverNavbar onLogout={handleLogout} isAuthenticated={isAuthenticated} />

      <Box sx={{ width: '100%', maxWidth: 1320, mx: 'auto', px: { xs: 1.5, sm: 2.5, md: 3.5 }, py: { xs: 2.2, md: 3.2 } }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.2, md: 3 },
            mb: 2.5,
            borderRadius: 3.2,
            border: '1px solid',
            borderColor: (theme) => (theme.palette.mode === 'dark' ? alpha('#fff', 0.1) : alpha(theme.palette.primary.main, 0.16)),
            background: (theme) =>
              theme.palette.mode === 'dark'
                ? 'linear-gradient(145deg, #231a39 0%, #19142a 100%)'
                : 'linear-gradient(145deg, #ffffff 0%, #f8faff 100%)',
          }}
        >
          <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between" spacing={1.5}>
            <Box>
              <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: '0.12em', fontWeight: 700 }}>
                Personalized Discovery
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
                Welcome, {user?.full_name || 'Student'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Resources are ranked by recommendation score and grouped by academic context.
              </Typography>
            </Box>
            <ToggleButtonGroup
              size="small"
              value={view}
              exclusive
              onChange={(_, next) => next && setView(next)}
              sx={{
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                borderRadius: 999,
                px: 0.6,
                py: 0.4,
                '& .MuiToggleButton-root': { border: 0, px: 1.5, borderRadius: 999, fontWeight: 700 },
              }}
            >
              <ToggleButton value="universities">Universities</ToggleButton>
              <ToggleButton value="modules">Modules</ToggleButton>
            </ToggleButtonGroup>
          </Stack>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 2.5,
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            background: (theme) =>
              theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, #1e192f 0%, #171224 100%)'
                : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          }}
        >
          <Box display="flex" alignItems="center" gap={1} mb={1.5}>
            <AutoAwesome sx={{ fontSize: 18, color: 'primary.main' }} />
            <Typography variant="subtitle2" fontWeight={700}>
              Recommended For You
            </Typography>
          </Box>

          {loading ? (
            <Box sx={{ display: 'grid', gap: 1.25 }}>
              {[...Array(3)].map((_, idx) => (
                <Skeleton key={`rec-skeleton-${idx}`} variant="rounded" height={60} />
              ))}
            </Box>
        ) : recommendations.length === 0 ? (
          <Typography variant="caption" color="text.secondary">
            No personalized recommendations yet. Add profile tags to improve matching.
          </Typography>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
              gap: 1.2,
            }}
          >
            {recommendations.slice(0, 6).map((item, index) => {
              return (
                <RecommendationResourceCard
                  key={`discover-recommendation-${item.resource_id || item.id}`}
                  item={item}
                  index={index}
                  score={parseScore(item.score)}
                  matchReasons={item.match_reasons}
                  showScore
                  showMatchReasons
                />
              );
            })}
          </Box>
        )}
      </Paper>

        <Box sx={{ display: 'grid', gap: 1.4 }}>
          {loading ? (
            [...Array(5)].map((_, idx) => (
              <Skeleton key={`group-skeleton-${idx}`} variant="rounded" height={92} />
            ))
          ) : groupsToRender.length === 0 ? (
            <Paper
              elevation={0}
              sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider', textAlign: 'center' }}
            >
              <Typography variant="body2" color="text.secondary">
                No resources available yet.
              </Typography>
            </Paper>
          ) : (
            groupsToRender.map((group) => (
              <Paper
                key={`${view}-${group.name}`}
                elevation={0}
                sx={{
                  p: 1.8,
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: 'divider',
                  background: (theme) =>
                    theme.palette.mode === 'dark'
                      ? 'linear-gradient(135deg, #1e192f 0%, #171224 100%)'
                      : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                }}
              >
                <Box display="flex" alignItems="center" gap={1} mb={1.1}>
                  {view === 'modules' ? (
                    <MenuBook sx={{ fontSize: 16, color: 'primary.main' }} />
                  ) : (
                    <School sx={{ fontSize: 16, color: 'primary.main' }} />
                  )}
                  <Typography variant="subtitle2" fontWeight={700} noWrap>
                    {group.name}
                  </Typography>
                  <Chip size="small" label={`${group.items.length} resources`} />
                </Box>

                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: '1fr',
                      md: 'repeat(2, minmax(0, 1fr))',
                    },
                    gap: 1.2,
                  }}
                >
                  {group.items.slice(0, 8).map((resource, index) => {
                    return (
                      <RecommendationResourceCard
                        key={`${group.name}-${getResourceId(resource)}-${index}`}
                        item={resource}
                        index={index}
                      />
                    );
                  })}
                </Box>
              </Paper>
            ))
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default DiscoverResources;
