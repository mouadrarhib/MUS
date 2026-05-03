import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import resourcesService from '@/services/resourcesService';
import favoritesService from '@/services/favoritesService';
import moduleService from '@/services/moduleService';
import { toResourceDetailModel } from '@/entities/resource/mappers/resourceViewModel';

const getResourceId = (item) => Number(item?.id || item?.resource_id || 0);

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

const getInitialParam = (search, key, fallback = 'all') => {
  const params = new URLSearchParams(search || '');
  const value = params.get(key);
  if (!value || !String(value).trim()) return fallback;
  return String(value).trim();
};

const getInitialNumberParam = (search, key, fallback = 0, { min = 0, max = Number.POSITIVE_INFINITY } = {}) => {
  const value = Number(getInitialParam(search, key, ''));
  if (!Number.isFinite(value)) return fallback;
  return Math.min(Math.max(value, min), max);
};

const getInitialBooleanParam = (search, key, fallback = false) => {
  const raw = getInitialParam(search, key, '');
  if (!raw) return fallback;
  return ['1', 'true', 'yes', 'on'].includes(String(raw).toLowerCase());
};

const getInitialPageParam = (search) => {
  const value = Number(getInitialParam(search, 'page', '1'));
  if (!Number.isFinite(value) || value < 1) return 1;
  return Math.floor(value);
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
  const [discoverMeta, setDiscoverMeta] = useState({});
  const [discoverModules, setDiscoverModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(() => getInitialParam(location.search, 'module', 'all'));
  const [selectedType, setSelectedType] = useState(() => getInitialParam(location.search, 'type', 'all').toLowerCase());
  const [selectedFormat, setSelectedFormat] = useState(() => getInitialParam(location.search, 'format', 'all').toLowerCase());
  const [selectedLanguage, setSelectedLanguage] = useState(() => getInitialParam(location.search, 'language', 'all').toLowerCase());
  const [selectedAccessTier, setSelectedAccessTier] = useState(() => getInitialParam(location.search, 'access', 'all').toLowerCase());
  const [selectedSort, setSelectedSort] = useState(() => getInitialParam(location.search, 'sort', 'recommended').toLowerCase());
  const [minRating, setMinRating] = useState(() => getInitialNumberParam(location.search, 'rating', 0, { min: 0, max: 5 }));
  const [favoritesOnly, setFavoritesOnly] = useState(() => getInitialBooleanParam(location.search, 'favorites', false));
  const [searchQuery, setSearchQuery] = useState(() => {
    const initialParams = new URLSearchParams(location.search);
    return initialParams.get('q') || '';
  });
  const [page, setPage] = useState(() => getInitialPageParam(location.search));
  const [pageSize] = useState(24);
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
  const deferredFormat = useDeferredValue(selectedFormat);
  const deferredLanguage = useDeferredValue(selectedLanguage);
  const deferredAccessTier = useDeferredValue(selectedAccessTier);
  const deferredSort = useDeferredValue(selectedSort);
  const deferredMinRating = useDeferredValue(minRating);
  const deferredFavoritesOnly = useDeferredValue(favoritesOnly);
  const [isPending, startTransition] = useTransition();
  const detailsCacheRef = useRef(new Map());

  useEffect(() => {
    let mounted = true;

    const loadModules = async () => {
      if (!isAuthenticated) {
        setDiscoverModules([]);
        return;
      }

      try {
        const response = await moduleService.getDiscoverModules();
        const payload = Array.isArray(response?.data?.data)
          ? response.data.data
          : Array.isArray(response?.data)
            ? response.data
            : [];

        if (!mounted) return;

        const normalized = payload.map((item) => ({
          module_id: item?.id,
          module_title: item?.title || item?.code || 'Module',
          module_code: item?.code || '',
          resource_count: Number(item?.published_resources_count || 0),
        }));

        setDiscoverModules(normalized);
      } catch {
        if (!mounted) return;
        setDiscoverModules([]);
      }
    };

    loadModules();

    return () => {
      mounted = false;
    };
  }, [isAuthenticated]);

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
        setDiscoverMeta({});
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
          recommendationLimit: recommendationsOnly ? 60 : 24,
          resourcesLimit: 500,
          page,
          pageSize,
          moduleId: deferredModule,
          educationalType: deferredType,
          format: deferredFormat,
          language: deferredLanguage,
          accessTier: deferredAccessTier,
          minRating: deferredMinRating,
          favoritesOnly: deferredFavoritesOnly,
          sortBy: deferredSort,
          search: deferredSearchQuery,
        });

        if (!mounted) return;

        setRecommendations(Array.isArray(bootstrap?.recommendations) ? bootstrap.recommendations : []);
        setDiscoverMeta(bootstrap?.meta && typeof bootstrap.meta === 'object' ? bootstrap.meta : {});
        const bootstrapModules = Array.isArray(bootstrap?.discover_modules) ? bootstrap.discover_modules : [];
        if (bootstrapModules.length > 0) {
          setDiscoverModules(bootstrapModules);
        }

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
        setDiscoverMeta({});
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
  }, [
    isAuthenticated,
    recommendationsOnly,
    page,
    pageSize,
    deferredModule,
    deferredType,
    deferredFormat,
    deferredLanguage,
    deferredAccessTier,
    deferredMinRating,
    deferredFavoritesOnly,
    deferredSort,
    deferredSearchQuery,
  ]);

  useEffect(() => {
    const params = new URLSearchParams();

    const normalizedSearch = searchQuery.trim();
    if (normalizedSearch) params.set('q', normalizedSearch);
    if (selectedModule !== 'all') params.set('module', String(selectedModule));
    if (selectedType !== 'all') params.set('type', String(selectedType));
    if (selectedFormat !== 'all') params.set('format', String(selectedFormat));
    if (selectedLanguage !== 'all') params.set('language', String(selectedLanguage));
    if (selectedAccessTier !== 'all') params.set('access', String(selectedAccessTier));
    if (selectedSort !== 'recommended') params.set('sort', String(selectedSort));
    if (Number(minRating) > 0) params.set('rating', String(minRating));
    if (favoritesOnly) params.set('favorites', '1');
    if (page > 1) params.set('page', String(page));

    const nextSearch = params.toString();
    const currentSearch = location.search.startsWith('?') ? location.search.slice(1) : location.search;

    if (nextSearch !== currentSearch) {
      navigate(
        {
          pathname: location.pathname,
          search: nextSearch ? `?${nextSearch}` : '',
        },
        { replace: true }
      );
    }
  }, [
    searchQuery,
    page,
    selectedModule,
    selectedType,
    selectedFormat,
    selectedLanguage,
    selectedAccessTier,
    selectedSort,
    minRating,
    favoritesOnly,
    location.pathname,
    location.search,
    navigate,
  ]);

  const rankedResources = useMemo(() => resources, [resources]);

  const availableTypes = useMemo(() => {
    const fromMeta = Array.isArray(discoverMeta?.facets?.educational_types)
      ? discoverMeta.facets.educational_types
      : [];
    if (fromMeta.length > 0) {
      return fromMeta;
    }

    const set = new Set();
    resources.forEach((item) => {
      set.add(getEducationalType(item));
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [discoverMeta, resources]);

  const availableFormats = useMemo(() => {
    const fromMeta = Array.isArray(discoverMeta?.facets?.formats) ? discoverMeta.facets.formats : [];
    if (fromMeta.length > 0) return fromMeta;

    const set = new Set();
    resources.forEach((item) => {
      const value = String(item?.format || item?.resource_format || '').trim().toLowerCase();
      if (value) set.add(value);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [discoverMeta, resources]);

  const availableLanguages = useMemo(() => {
    const fromMeta = Array.isArray(discoverMeta?.facets?.languages) ? discoverMeta.facets.languages : [];
    if (fromMeta.length > 0) return fromMeta;

    const set = new Set();
    resources.forEach((item) => {
      const value = String(item?.language || '').trim().toLowerCase();
      if (value) set.add(value);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [discoverMeta, resources]);

  const availableAccessTiers = useMemo(() => {
    const fromMeta = Array.isArray(discoverMeta?.facets?.access_tiers) ? discoverMeta.facets.access_tiers : [];
    if (fromMeta.length > 0) return fromMeta;

    const set = new Set();
    resources.forEach((item) => {
      const value = String(item?.access_tier || item?.accessTier || 'free').trim().toLowerCase();
      if (value) set.add(value);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [discoverMeta, resources]);

  const query = useMemo(() => deferredSearchQuery.trim().toLowerCase(), [deferredSearchQuery]);
  const filteredRecommendations = useMemo(() => recommendations, [recommendations]);

  const discoverRecommendationPreviewCount = 4;
  const displayedRecommendations = recommendationsOnly
    ? filteredRecommendations
    : filteredRecommendations.slice(0, discoverRecommendationPreviewCount);
  const hasActiveFilterSelection =
    selectedModule !== 'all' ||
    selectedType !== 'all' ||
    selectedFormat !== 'all' ||
    selectedLanguage !== 'all' ||
    selectedAccessTier !== 'all' ||
    selectedSort !== 'recommended' ||
    Number(minRating) > 0 ||
    favoritesOnly ||
    Boolean(query);
  const hideRecommendationsSection =
    hasActiveFilterSelection && !loadingRecommendations && filteredRecommendations.length === 0;

  const filteredRankedResources = useMemo(() => rankedResources, [rankedResources]);

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

  const resetFilters = useCallback(() => {
    setSelectedModule('all');
    setSelectedType('all');
    setSelectedFormat('all');
    setSelectedLanguage('all');
    setSelectedAccessTier('all');
    setSelectedSort('recommended');
    setMinRating(0);
    setFavoritesOnly(false);
    setSearchQuery('');
    setPage(1);
  }, []);

  useEffect(() => {
    setPage(1);
  }, [deferredModule, deferredType, deferredFormat, deferredLanguage, deferredAccessTier, deferredMinRating, deferredFavoritesOnly, deferredSort, deferredSearchQuery]);

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
    selectedFormat,
    selectedLanguage,
    selectedAccessTier,
    selectedSort,
    minRating,
    favoritesOnly,
    searchQuery,
    isPending,
    query,
    discoverMeta,
    availableTypes,
    availableFormats,
    availableLanguages,
    availableAccessTiers,
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
    page,
    pageSize,
    setSelectedModule,
    setSelectedType,
    setSelectedFormat,
    setSelectedLanguage,
    setSelectedAccessTier,
    setSelectedSort,
    setMinRating,
    setFavoritesOnly,
    setSearchQuery,
    setPage,
    resetFilters,
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
