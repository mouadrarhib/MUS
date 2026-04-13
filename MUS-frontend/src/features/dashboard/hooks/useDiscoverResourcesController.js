import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import resourcesService from '@/services/resourcesService';
import favoritesService from '@/services/favoritesService';
import { toResourceDetailModel } from '@/entities/resource/mappers/resourceViewModel';

const parseScore = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const getResourceId = (item) => Number(item?.id || item?.resource_id || 0);

const getModuleId = (item) => Number(item?.module_id || item?.academicContext?.moduleId || item?.moduleId || 0);

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

export const useDiscoverResourcesController = ({ recommendationsOnly = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user, isAuthenticated } = useAuth();

  const [loadingRecommendations, setLoadingRecommendations] = useState(true);
  const [loadingResources, setLoadingResources] = useState(true);
  const [resources, setResources] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [discoverModules, setDiscoverModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [searchQuery, setSearchQuery] = useState(() => {
    const initialParams = new URLSearchParams(location.search);
    return initialParams.get('q') || '';
  });
  const [likedMap, setLikedMap] = useState({});
  const [likeLoadingId, setLikeLoadingId] = useState(null);
  const [downloadLoadingId, setDownloadLoadingId] = useState(null);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [viewingResource, setViewingResource] = useState(null);
  const [feedback, setFeedback] = useState({ open: false, severity: 'info', message: '' });
  const [showHeavySections, setShowHeavySections] = useState(false);
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const deferredModule = useDeferredValue(selectedModule);
  const deferredType = useDeferredValue(selectedType);
  const [isPending, startTransition] = useTransition();
  const detailsCacheRef = useRef(new Map());

  useEffect(() => {
    let timeoutId = null;
    let idleId = null;

    setShowHeavySections(false);

    const enableHeavySections = () => setShowHeavySections(true);

    if (typeof window !== 'undefined' && typeof window.requestIdleCallback === 'function') {
      idleId = window.requestIdleCallback(enableHeavySections, { timeout: 1200 });
    } else {
      timeoutId = window.setTimeout(enableHeavySections, 300);
    }

    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
      if (idleId && typeof window !== 'undefined' && typeof window.cancelIdleCallback === 'function') {
        window.cancelIdleCallback(idleId);
      }
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadDiscoverBootstrap = async () => {
      if (!isAuthenticated) {
        setRecommendations([]);
        setDiscoverModules([]);
        setResources([]);
        setLikedMap({});
        setLoadingRecommendations(false);
        setLoadingResources(false);
        return;
      }

      setLoadingRecommendations(true);
      setLoadingResources(true);

      try {
        const bootstrap = await resourcesService.getDiscoverBootstrap({
          recommendationLimit: 12,
          resourcesLimit: 80,
        });

        if (!mounted) return;

        setRecommendations(Array.isArray(bootstrap?.recommendations) ? bootstrap.recommendations : []);
        setDiscoverModules(Array.isArray(bootstrap?.discover_modules) ? bootstrap.discover_modules : []);
        setResources(Array.isArray(bootstrap?.published_resources) ? bootstrap.published_resources : []);

        const mapped = (Array.isArray(bootstrap?.favorites) ? bootstrap.favorites : []).reduce((acc, fav) => {
          const id = Number(fav?.resource_id || fav?.id || 0);
          if (id > 0) acc[id] = true;
          return acc;
        }, {});
        setLikedMap(mapped);
      } catch {
        if (!mounted) return;
        setRecommendations([]);
        setDiscoverModules([]);
        setResources([]);
        setLikedMap({});
      } finally {
        if (mounted) {
          setLoadingRecommendations(false);
          setLoadingResources(false);
        }
      }
    };

    loadDiscoverBootstrap();

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

  const selectedModuleLabel = useMemo(() => {
    if (selectedModule === 'all') return null;
    const match = discoverModules.find((moduleRow) => String(moduleRow?.id) === String(selectedModule));
    return match?.title || match?.module_title || null;
  }, [discoverModules, selectedModule]);

  const availableTypes = useMemo(() => {
    const set = new Set();
    rankedResources.forEach((item) => {
      set.add(getEducationalType(item));
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [rankedResources]);

  const query = useMemo(() => deferredSearchQuery.trim().toLowerCase(), [deferredSearchQuery]);

  const matchesSearch = useCallback(
    (item) => {
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
    },
    [query]
  );

  const matchesFilters = useCallback(
    (item) => {
      if (deferredModule !== 'all') {
        const itemModuleId = getModuleId(item);
        if (itemModuleId > 0) {
          if (String(itemModuleId) !== String(deferredModule)) return false;
        } else if (selectedModuleLabel) {
          if (getModuleName(item) !== selectedModuleLabel) return false;
        } else {
          return false;
        }
      }
      if (deferredType !== 'all' && getEducationalType(item) !== deferredType) {
        return false;
      }
      return true;
    },
    [deferredModule, deferredType, selectedModuleLabel]
  );

  const filteredRecommendations = useMemo(
    () => recommendations.filter((item) => matchesSearch(item) && matchesFilters(item)),
    [recommendations, matchesSearch, matchesFilters]
  );

  const discoverRecommendationPreviewCount = 4;
  const displayedRecommendations = recommendationsOnly
    ? filteredRecommendations
    : filteredRecommendations.slice(0, discoverRecommendationPreviewCount);
  const hasActiveFilterSelection = selectedModule !== 'all' || selectedType !== 'all';
  const hideRecommendationsSection =
    hasActiveFilterSelection && !loadingRecommendations && filteredRecommendations.length === 0;

  const filteredRankedResources = useMemo(
    () => rankedResources.filter((item) => matchesSearch(item) && matchesFilters(item)),
    [rankedResources, matchesSearch, matchesFilters]
  );

  const latestPublishedResources = useMemo(() => {
    return [...filteredRankedResources]
      .sort((a, b) => {
        const tsA = new Date(a?.createdAt || a?.created_at || 0).getTime() || 0;
        const tsB = new Date(b?.createdAt || b?.created_at || 0).getTime() || 0;
        return tsB - tsA;
      })
      .slice(0, 6);
  }, [filteredRankedResources]);

  const groupedByModule = useMemo(() => {
    if (!showHeavySections) return [];
    return groupResources(filteredRankedResources, getModuleName);
  }, [filteredRankedResources, showHeavySections]);

  const ensureAuthenticated = () => {
    if (isAuthenticated) return true;
    navigate('/login', { state: { from: { pathname: location.pathname, search: location.search } } });
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

  const handleOpenDetails = async (item) => {
    const baseResource = toResourceDetailModel(item);
    if (!baseResource?.id) return;

    setViewingResource(baseResource);
    setOpenDetailsDialog(true);

    const cached = detailsCacheRef.current.get(baseResource.id);
    if (cached) {
      setViewingResource(cached);
      return;
    }

    try {
      const [resourceRes, statsRes, tagsRes] = await Promise.allSettled([
        resourcesService.getResourceById(baseResource.id),
        resourcesService.getResourceStatistics(baseResource.id),
        resourcesService.getResourceTags(baseResource.id),
      ]);

      const detailed =
        resourceRes.status === 'fulfilled' && resourceRes.value
          ? {
              ...toResourceDetailModel(resourceRes.value),
              stats: statsRes.status === 'fulfilled' ? statsRes.value || {} : {},
              tags: tagsRes.status === 'fulfilled' ? tagsRes.value || [] : [],
            }
          : {
              ...baseResource,
              stats: statsRes.status === 'fulfilled' ? statsRes.value || {} : {},
              tags: tagsRes.status === 'fulfilled' ? tagsRes.value || [] : [],
            };

      detailsCacheRef.current.set(baseResource.id, detailed);
      setViewingResource((prev) => (prev?.id === baseResource.id ? detailed : prev));
    } catch {
      // Keep base details when enrichment fails.
    }
  };

  const handleOpenPreviewPage = (resource, resolvedPreviewUrl = '') => {
    const id = Number(resource?.id || resource?.resource_id || 0);
    if (!id) return;

    navigate(`/discover/resources/${id}/preview`, {
      state: {
        resource,
        previewUrl: resolvedPreviewUrl,
        returnTo: `${location.pathname}${location.search}`,
      },
    });
  };

  const handleCloseDetailsDialog = () => {
    setOpenDetailsDialog(false);
    setViewingResource(null);
  };

  const handleLogout = () => {
    navigate('/', { replace: true });
    logout();
  };

  return {
    user,
    isAuthenticated,
    loadingRecommendations,
    loadingResources,
    discoverModules,
    selectedModule,
    selectedType,
    searchQuery,
    isPending,
    query,
    availableTypes,
    filteredRecommendations,
    displayedRecommendations,
    filteredRankedResources,
    latestPublishedResources,
    groupsToRender: groupedByModule,
    hideRecommendationsSection,
    showHeavySections,
    discoverRecommendationPreviewCount,
    likedMap,
    likeLoadingId,
    downloadLoadingId,
    openDetailsDialog,
    viewingResource,
    feedback,
    setSelectedModule,
    setSelectedType,
    setSearchQuery,
    startTransition,
    handleToggleLike,
    handleDownload,
    handleOpenDetails,
    handleOpenPreviewPage,
    handleCloseDetailsDialog,
    handleLogout,
    navigate,
    setFeedback,
    formatTypeLabel,
    getResourceId,
  };
};
