import { createElement, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Divider,
  FormControlLabel,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Skeleton,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
  alpha,
} from '@mui/material';
import {
  ArrowBack,
  Download,
  OpenInNew,
  Person,
  School,
  MenuBook,
  Lock,
  LockOpen,
  BrokenImage,
  PlayCircle,
  PictureAsPdf,
  Slideshow,
  Article,
  Headphones,
  ImageOutlined,
  QuestionAnswer,
  ReportProblem,
} from '@mui/icons-material';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import DiscoverNavbar from '@/features/discover/components/DiscoverNavbar';
import { useAuth } from '@/features/auth/context/AuthContext';
import confusionService from '@/services/confusionService';
import qaService from '@/services/qaService';
import resourceModuleMapService from '@/services/resourceModuleMapService';
import resourcesService from '@/services/resourcesService';
import { useNotification } from '@/shared/components/ui';

/* ─── helpers ─── */
const getFormat = (resource) =>
  String(resource?.format || resource?.resource_format || '').trim().toLowerCase();

const FORMAT_META = {
  pdf:        { label: 'PDF',   color: '#ef4444', Icon: PictureAsPdf  },
  video:      { label: 'Video', color: '#8b5cf6', Icon: PlayCircle    },
  audio:      { label: 'Audio', color: '#f59e0b', Icon: Headphones    },
  image:      { label: 'Image', color: '#10b981', Icon: ImageOutlined },
  powerpoint: { label: 'PPT',   color: '#f97316', Icon: Slideshow     },
  word:       { label: 'Word',  color: '#3b82f6', Icon: Article       },
  excel:      { label: 'Excel', color: '#22c55e', Icon: Article       },
};

const getFormatMeta = (fmt) =>
  FORMAT_META[fmt] || { label: fmt ? fmt.toUpperCase() : 'File', color: '#7c5cfc', Icon: Article };

const formatDateTime = (value) => {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toLocaleString();
};

const pickModuleIdFromResource = (resource) => {
  const candidates = [
    resource?.academicContext?.moduleId,
    resource?.module_id,
    resource?.moduleId,
    resource?.module?.id,
    resource?.resource_module_id,
  ];

  for (const value of candidates) {
    const parsed = Number(value || 0);
    if (parsed > 0) return parsed;
  }

  return null;
};

const pickModuleIdFromModulesPayload = (payload) => {
  const modules = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.modules)
      ? payload.modules
      : Array.isArray(payload?.data?.modules)
        ? payload.data.modules
      : [];

  for (const item of modules) {
    const parsed = Number(item?.module_id || item?.id || item?.module?.id || 0);
    if (parsed > 0) return parsed;
  }

  return null;
};

const extractLinkedModules = (payload) => {
  const modules = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.modules)
      ? payload.modules
      : Array.isArray(payload?.data?.modules)
        ? payload.data.modules
      : [];

  const seen = new Set();

  return modules
    .map((item) => {
      const moduleId = Number(item?.module_id || item?.id || item?.module?.id || 0);
      if (!moduleId || seen.has(moduleId)) return null;
      seen.add(moduleId);
      return {
        module_id: moduleId,
        module_code: item?.module_code || item?.code || item?.module?.code || '',
        module_title: item?.module_title || item?.title || item?.module?.title || `Module ${moduleId}`,
      };
    })
    .filter(Boolean);
};

/* ─── Panel wrapper ─── */
const Panel = ({ children, sx = {} }) => (
  <Box
    sx={(theme) => ({
      borderRadius: 3,
      border: '1px solid',
      borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)',
      background:
        theme.palette.mode === 'dark'
          ? 'linear-gradient(155deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 100%)'
          : 'linear-gradient(155deg, rgba(255,255,255,0.95) 0%, rgba(248,249,255,0.97) 100%)',
      backdropFilter: 'blur(12px)',
      boxShadow:
        theme.palette.mode === 'dark'
          ? '0 2px 20px rgba(0,0,0,0.3)'
          : '0 4px 24px rgba(20,20,60,0.06)',
      overflow: 'hidden',
      ...sx,
    })}
  >
    {children}
  </Box>
);

/* ─── Metadata row ─── */
const MetaRow = ({ icon, label, value }) => {
  if (!value) return null;
  return (
    <Stack direction="row" spacing={1} alignItems="flex-start">
      {createElement(icon, { sx: { fontSize: 15, color: 'text.disabled', mt: '2px', flexShrink: 0 } })}
      <Box>
        <Typography
          variant="caption"
          color="text.disabled"
          sx={{ display: 'block', lineHeight: 1.2, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}
        >
          {label}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.85rem', lineHeight: 1.4 }}>
          {value}
        </Typography>
      </Box>
    </Stack>
  );
};

/* ─── Sidebar skeleton (shown while loading) ─── */
const SidebarSkeleton = () => (
  <Box sx={{ p: { xs: 2, md: 2.5 } }}>
    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
      <Skeleton variant="rounded" width={40} height={40} sx={{ borderRadius: 2, flexShrink: 0 }} />
      <Box sx={{ flex: 1 }}>
        <Skeleton variant="text" width="80%" height={20} />
        <Skeleton variant="text" width="50%" height={14} sx={{ mt: 0.4 }} />
      </Box>
    </Stack>
    <Skeleton variant="rounded" height={1} sx={{ mb: 2, opacity: 0.4 }} />
    <Stack spacing={1.8}>
      {[...Array(4)].map((_, i) => (
        <Stack key={i} direction="row" spacing={1} alignItems="flex-start">
          <Skeleton variant="circular" width={15} height={15} sx={{ mt: '2px', flexShrink: 0 }} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="35%" height={12} />
            <Skeleton variant="text" width="70%" height={16} sx={{ mt: 0.3 }} />
          </Box>
        </Stack>
      ))}
    </Stack>
    <Skeleton variant="rounded" height={1} sx={{ my: 2, opacity: 0.4 }} />
    <Skeleton variant="text" width="40%" height={12} sx={{ mb: 1 }} />
    <Skeleton variant="rounded" height={64} sx={{ borderRadius: 1.5 }} />
  </Box>
);

/* ─── Preview skeleton (shown while loading) ─── */
const PreviewSkeleton = () => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
      minHeight: { xs: '52vw', sm: '48vw', md: '55vh', lg: '68vh' },
      p: 4,
    }}
  >
    <CircularProgress size={44} thickness={3.5} sx={{ color: '#7c5cfc' }} />
    <Typography variant="body2" color="text.disabled" sx={{ fontSize: '0.82rem' }}>
      Loading resource…
    </Typography>
  </Box>
);

/* ─── Format-specific preview renderers ─── */
const PdfPreview = ({ url }) => (
  <Box
    component="iframe"
    src={url}
    title="PDF preview"
    sx={{ width: '100%', height: '100%', minHeight: { xs: '60vh', md: '72vh' }, border: 0, display: 'block', bgcolor: '#fff' }}
  />
);

const VideoPreview = ({ url }) => (
  <Box sx={{ width: '100%', height: '100%', minHeight: { xs: '52vw', md: '58vh' }, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#000' }}>
    <Box component="video" src={url} controls sx={{ width: '100%', maxHeight: '75vh', display: 'block' }} />
  </Box>
);

const AudioPreview = ({ url, title }) => (
  <Box sx={{ width: '100%', height: '100%', minHeight: { xs: '32vh', md: '38vh' }, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, p: { xs: 2, md: 4 } }}>
    <Box sx={{ width: 100, height: 100, borderRadius: '50%', background: 'linear-gradient(135deg, #f59e0b22, #f59e0b44)', border: '2px solid rgba(245,158,11,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Headphones sx={{ fontSize: 44, color: '#f59e0b' }} />
    </Box>
    <Typography variant="subtitle1" fontWeight={700} textAlign="center" sx={{ px: 2 }}>
      {title || 'Audio Resource'}
    </Typography>
    <Box component="audio" src={url} controls sx={{ width: 'min(540px, 96%)', borderRadius: 2 }} />
  </Box>
);

const ImagePreview = ({ url, title }) => (
  <Box sx={{ width: '100%', height: '100%', minHeight: { xs: '52vw', md: '58vh' }, display: 'flex', alignItems: 'center', justifyContent: 'center', p: { xs: 1, md: 2 }, bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.5)' : 'rgba(248,249,255,1)' }}>
    <Box component="img" src={url} alt={title || 'Resource image'} sx={{ maxWidth: '100%', maxHeight: '74vh', objectFit: 'contain', borderRadius: 2, boxShadow: '0 8px 40px rgba(0,0,0,0.18)' }} />
  </Box>
);

const OfficePreview = ({ embedUrl }) => (
  <Box component="iframe" src={embedUrl} title="Office document preview" sx={{ width: '100%', height: '100%', minHeight: { xs: '60vh', md: '72vh' }, border: 0, display: 'block' }} />
);

const UnsupportedPreview = ({ format, onOpen, canOpen }) => {
  const meta = getFormatMeta(format);
  return (
    <Box sx={{ width: '100%', height: '100%', minHeight: { xs: '32vh', md: '40vh' }, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2.5, p: 4 }}>
      <Box sx={{ width: 80, height: 80, borderRadius: 3, background: `${meta.color}18`, border: `2px solid ${meta.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <meta.Icon sx={{ fontSize: 38, color: meta.color }} />
      </Box>
      <Typography variant="subtitle1" fontWeight={700} textAlign="center">
        Inline preview not available for {meta.label} files
      </Typography>
      <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ maxWidth: 340 }}>
        Use the <strong>Open</strong> button to view this file in a new tab, or <strong>Download</strong> it directly.
      </Typography>
      {canOpen && (
        <Button variant="outlined" startIcon={<OpenInNew />} onClick={onOpen} sx={{ textTransform: 'none', borderRadius: 2, mt: 0.5 }}>
          Open in new tab
        </Button>
      )}
    </Box>
  );
};

const NoUrlState = () => (
  <Box sx={{ width: '100%', minHeight: { xs: '32vh', md: '40vh' }, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, p: 4 }}>
    <BrokenImage sx={{ fontSize: 56, color: 'text.disabled' }} />
    <Typography variant="subtitle1" fontWeight={600} color="text.secondary">No preview available</Typography>
    <Typography variant="body2" color="text.disabled" textAlign="center">This resource does not have a preview URL yet.</Typography>
  </Box>
);

const QUESTIONS_PAGE_SIZE = 20;
const MODULE_PREFERENCE_STORAGE_KEY = 'mus:last-selected-module';
const AUTO_REFRESH_INTERVAL_MS = 15000;
const QUESTION_STATUS_LABELS = {
  open: 'Open',
  answered: 'Answered',
  closed: 'Closed',
};

const moderationVisibilityLabel = (status) => {
  if (status === 'hidden') return 'Hidden from learners';
  if (status === 'deleted') return 'Removed from learners';
  return 'Visible to everyone';
};

/* ═══════════════════════════════════════════════
   Main page
═══════════════════════════════════════════════ */
const ResourcePreviewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, isAuthenticated, isTeacher, isAdmin, isStudent } = useAuth();
  const { showSuccess, showError, showInfo } = useNotification();
  const queryState = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return {
      questionId: Number(params.get('question') || 0) || null,
      answerId: Number(params.get('answer') || 0) || null,
      commentId: Number(params.get('comment') || 0) || null,
    };
  }, [location.search]);

  const [loading, setLoading] = useState(true);
  const [resource, setResource] = useState(location.state?.resource || null);
  const [previewUrl, setPreviewUrl] = useState(location.state?.previewUrl || '');
  const [error, setError] = useState('');
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [qaLoading, setQaLoading] = useState(false);
  const [threadLoading, setThreadLoading] = useState(false);
  const [qaError, setQaError] = useState('');
  const [questions, setQuestions] = useState([]);
  const [questionsPage, setQuestionsPage] = useState(1);
  const [questionsHasMore, setQuestionsHasMore] = useState(false);
  const [questionsLoadingMore, setQuestionsLoadingMore] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState(null);
  const [preferredQuestionId, setPreferredQuestionId] = useState(queryState.questionId);
  const [targetAnswerId, setTargetAnswerId] = useState(queryState.answerId);
  const [targetCommentId, setTargetCommentId] = useState(queryState.commentId);
  const [highlightedAnswerId, setHighlightedAnswerId] = useState(null);
  const [highlightedCommentId, setHighlightedCommentId] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [questionComments, setQuestionComments] = useState([]);
  const [answerCommentsMap, setAnswerCommentsMap] = useState({});
  const [questionTitleInput, setQuestionTitleInput] = useState('');
  const [questionBodyInput, setQuestionBodyInput] = useState('');
  const [questionAnonymousInput, setQuestionAnonymousInput] = useState(false);
  const [answerBodyInput, setAnswerBodyInput] = useState('');
  const [answerExplanationInput, setAnswerExplanationInput] = useState('');
  const [answerExampleInput, setAnswerExampleInput] = useState('');
  const [questionCommentInput, setQuestionCommentInput] = useState('');
  const [answerCommentInputs, setAnswerCommentInputs] = useState({});
  const [creatingQuestion, setCreatingQuestion] = useState(false);
  const [creatingAnswer, setCreatingAnswer] = useState(false);
  const [creatingQuestionComment, setCreatingQuestionComment] = useState(false);
  const [creatingAnswerCommentId, setCreatingAnswerCommentId] = useState(null);
  const [creatingConfusionSignal, setCreatingConfusionSignal] = useState(false);
  const [confusionNoteInput, setConfusionNoteInput] = useState('');
  const [confusionFeedback, setConfusionFeedback] = useState({ type: '', message: '' });
  const [myConfusionCasesLoading, setMyConfusionCasesLoading] = useState(false);
  const [myConfusionCases, setMyConfusionCases] = useState([]);
  const [linkedModules, setLinkedModules] = useState([]);
  const [studentAvailableModuleIds, setStudentAvailableModuleIds] = useState([]);
  const [selectedModuleId, setSelectedModuleId] = useState(null);
  const [moderationLoadingKey, setModerationLoadingKey] = useState('');
  const [resolvedModuleId, setResolvedModuleId] = useState(() => pickModuleIdFromResource(location.state?.resource || null));
  const inferredModuleIdFromQuestions = useMemo(() => {
    for (const item of questions) {
      const parsed = Number(item?.module_id || item?.moduleId || 0);
      if (parsed > 0) return parsed;
    }
    return null;
  }, [questions]);
  const resourceId = Number(resource?.id || id);
  const moduleId = selectedModuleId || pickModuleIdFromResource(resource) || resolvedModuleId || inferredModuleIdFromQuestions;
  const canModerate = isTeacher || isAdmin;
  const moduleIdsForResource = useMemo(
    () => linkedModules.map((item) => Number(item?.module_id || 0)).filter((value) => value > 0),
    [linkedModules]
  );

  useEffect(() => {
    const resourceId = Number(id);
    if (!resourceId) {
      setError('Invalid resource id');
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError('');
    setLinkedModules([]);
    setSelectedModuleId(null);

    Promise.allSettled([
      resourcesService.getResourceById(resourceId),
      resourcesService.getResourceFileUrl(resourceId),
      resourceModuleMapService.getModulesByResource(resourceId),
    ]).then(([detailRes, fileRes, modulesRes]) => {
      // Always call setLoading(false) — only skip the other state updates if cancelled.
      if (!cancelled) {
        if (detailRes.status === 'fulfilled' && detailRes.value) {
          setResource((prev) => ({ ...prev, ...detailRes.value }));
        }
        if (detailRes.status === 'fulfilled' && detailRes.value) {
          const picked = pickModuleIdFromResource(detailRes.value);
          if (picked) {
            setResolvedModuleId(picked);
          }
        }
        if (modulesRes.status === 'fulfilled') {
          const normalizedModules = extractLinkedModules(modulesRes.value);
          setLinkedModules(normalizedModules);

          const picked = pickModuleIdFromModulesPayload(modulesRes.value);
          if (picked) {
            setResolvedModuleId(picked);
            setSelectedModuleId((current) => current || picked);
          }
        } else {
          setLinkedModules([]);
        }
        if (fileRes.status === 'fulfilled') {
          setPreviewUrl(fileRes.value?.url || fileRes.value?.download_url || '');
        }
        if (detailRes.status === 'rejected' && fileRes.status === 'rejected') {
          setError('Failed to load resource preview');
        }
      }
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    setPreferredQuestionId(queryState.questionId);
    setTargetAnswerId(queryState.answerId);
    setTargetCommentId(queryState.commentId);
  }, [queryState]);

  useEffect(() => {
    if (selectedModuleId) return;
    const storedModuleId = Number(window.localStorage.getItem(MODULE_PREFERENCE_STORAGE_KEY) || 0) || null;
    const studentPreferredModuleId = studentAvailableModuleIds.find((candidateId) => moduleIdsForResource.includes(candidateId)) || null;
    const storedPreferredModuleId = storedModuleId && moduleIdsForResource.includes(storedModuleId) ? storedModuleId : null;
    const candidate =
      studentPreferredModuleId
      || storedPreferredModuleId
      || pickModuleIdFromResource(resource)
      || resolvedModuleId
      || inferredModuleIdFromQuestions
      || linkedModules[0]?.module_id
      || null;
    if (candidate) {
      setSelectedModuleId(candidate);
    }
  }, [selectedModuleId, resource, resolvedModuleId, inferredModuleIdFromQuestions, linkedModules, moduleIdsForResource, studentAvailableModuleIds]);

  useEffect(() => {
    if (!selectedModuleId) return;
    window.localStorage.setItem(MODULE_PREFERENCE_STORAGE_KEY, String(selectedModuleId));
  }, [selectedModuleId]);

  useEffect(() => {
    if (!resourceId) return;
    let cancelled = false;

    setQaLoading(true);
    setQaError('');
    setQuestionsPage(1);
    setQuestionsHasMore(false);
    setQuestionsLoadingMore(false);

    qaService
      .listQuestions({ resource_id: resourceId, include_hidden: canModerate, page: 1, limit: QUESTIONS_PAGE_SIZE })
      .then((rows) => {
        if (cancelled) return;
        setQuestions(rows);
        setQuestionsHasMore(rows.length === QUESTIONS_PAGE_SIZE);
        setSelectedQuestionId((current) => {
          if (preferredQuestionId && rows.some((item) => item.id === preferredQuestionId)) {
            return preferredQuestionId;
          }
          if (rows.some((item) => item.id === current)) {
            return current;
          }
          return rows[0]?.id || null;
        });
        if (preferredQuestionId) {
          setPreferredQuestionId(null);
        }
      })
      .catch(() => {
        if (cancelled) return;
        setQaError('Unable to load Q&A right now.');
        setQuestions([]);
        setQuestionsHasMore(false);
        setSelectedQuestionId(null);
      })
      .finally(() => {
        if (cancelled) return;
        setQaLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [resourceId, preferredQuestionId, canModerate]);

  useEffect(() => {
    if (!resourceId || !isAuthenticated || !isStudent) {
      setMyConfusionCases([]);
      return;
    }

    let cancelled = false;
    setMyConfusionCasesLoading(true);

    confusionService
      .listMyCases({ page: 1, limit: 20 })
      .then((rows) => {
        if (cancelled) return;
        const nextRows = Array.isArray(rows)
          ? rows.filter((item) => Number(item?.resource_id || 0) === Number(resourceId))
          : [];
        setMyConfusionCases(nextRows);
      })
      .catch(() => {
        if (cancelled) return;
        setMyConfusionCases([]);
      })
      .finally(() => {
        if (cancelled) return;
        setMyConfusionCasesLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [resourceId, isAuthenticated, isStudent]);

  useEffect(() => {
    if (!isAuthenticated || !isStudent || !moduleIdsForResource.length) {
      setStudentAvailableModuleIds([]);
      return;
    }

    let cancelled = false;

    resourceModuleMapService
      .getAvailableModulesForStudent()
      .then((payload) => {
        if (cancelled) return;
        const rows = Array.isArray(payload?.data?.modules)
          ? payload.data.modules
          : Array.isArray(payload?.modules)
            ? payload.modules
            : Array.isArray(payload?.data)
              ? payload.data
              : Array.isArray(payload)
                ? payload
                : [];
        const moduleIds = rows
          .map((item) => Number(item?.module_id || item?.id || 0))
          .filter((value) => value > 0);
        setStudentAvailableModuleIds(moduleIds);
      })
      .catch(() => {
        if (!cancelled) {
          setStudentAvailableModuleIds([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isStudent, moduleIdsForResource]);

  const normalizedFormat = getFormat(resource);
  const formatMeta = getFormatMeta(normalizedFormat);
  const isOfficeFormat = useMemo(
    () => ['word', 'powerpoint', 'excel'].includes(normalizedFormat),
    [normalizedFormat]
  );
  const officeEmbedUrl = previewUrl
    ? `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(previewUrl)}`
    : '';

  const handleBack = () => navigate(location.state?.returnTo || '/discover');
  const handleOpen = () => {
    const target = previewUrl || resource?.url;
    if (target) window.open(target, '_blank', 'noopener,noreferrer');
  };
  const handleDownload = async () => {
    const resourceId = Number(resource?.id || id);
    if (!resourceId) return;
    setDownloadLoading(true);
    try {
      const result = await resourcesService.getResourceFileUrl(resourceId, { download: true });
      const target = result?.download_url || result?.url;
      if (!target) throw new Error('No download URL');
      window.open(target, '_blank', 'noopener,noreferrer');
      try { await resourcesService.recordDownload(resourceId); } catch { /* silent */ }
    } finally {
      setDownloadLoading(false);
    }
  };

  /* derived metadata */
  const authorName    = resource?.author?.name || resource?.creator_name || resource?.created_by_name;
  const institution   = resource?.author?.institution || resource?.institution_name;
  const moduleTitle   = resource?.academicContext?.moduleTitle || resource?.module_title || resource?.academicContext?.moduleCode || resource?.module_code;
  const educationalType = resource?.educationalType || resource?.educational_type || resource?.resource_educational_type;
  const accessTier    = resource?.accessTier || resource?.access_tier || 'free';
  const isPremium     = String(accessTier).toLowerCase() === 'premium';
  const description   = resource?.description || resource?.resource_description;
  const selectedQuestion = questions.find((item) => item.id === selectedQuestionId) || null;
  const questionReadOnly = selectedQuestion?.status === 'closed' || selectedQuestion?.moderation_status !== 'active';

  async function loadQuestions({ keepSelection = true, preferredId = null, page = 1, append = false } = {}) {
    if (!resourceId) return;
    if (append) {
      setQuestionsLoadingMore(true);
    } else {
      setQaLoading(true);
    }
    setQaError('');
    try {
      const rows = await qaService.listQuestions({
        resource_id: resourceId,
        include_hidden: canModerate,
        page,
        limit: QUESTIONS_PAGE_SIZE,
      });

      setQuestionsPage(page);
      setQuestionsHasMore(rows.length === QUESTIONS_PAGE_SIZE);
      setQuestions((currentRows) => {
        if (!append || page <= 1) {
          return rows;
        }
        const merged = [...currentRows, ...rows];
        const seen = new Set();
        return merged.filter((item) => {
          const id = Number(item?.id || 0);
          if (!id || seen.has(id)) return false;
          seen.add(id);
          return true;
        });
      });

      setSelectedQuestionId((current) => {
        if (preferredId && rows.some((item) => item.id === preferredId)) {
          return preferredId;
        }
        if (append && keepSelection && current) {
          return current;
        }
        if (keepSelection && rows.some((item) => item.id === current)) {
          return current;
        }
        return current || rows[0]?.id || null;
      });
    } catch {
      setQaError('Unable to load Q&A right now.');
      if (!append) {
        setQuestions([]);
        setQuestionsHasMore(false);
        setSelectedQuestionId(null);
      }
    } finally {
      if (append) {
        setQuestionsLoadingMore(false);
      } else {
        setQaLoading(false);
      }
    }
  }

  async function loadSelectedThread(questionIdValue) {
    if (!questionIdValue) {
      setAnswers([]);
      setQuestionComments([]);
      setAnswerCommentsMap({});
      setThreadLoading(false);
      return;
    }

    setThreadLoading(true);
    setQaError('');
    try {
      const [nextAnswers, nextQuestionComments] = await Promise.all([
        qaService.listAnswersByQuestion(questionIdValue, { include_hidden: canModerate }),
        qaService.listQuestionComments(questionIdValue, { include_hidden: canModerate }),
      ]);

      setAnswers(nextAnswers);
      setQuestionComments(nextQuestionComments);

      if (!nextAnswers.length) {
        setAnswerCommentsMap({});
        return;
      }

      const answerCommentEntries = await Promise.all(
        nextAnswers.map(async (answer) => {
          const comments = await qaService.listAnswerComments(answer.id, { include_hidden: canModerate });
          return [answer.id, comments];
        })
      );

      setAnswerCommentsMap(Object.fromEntries(answerCommentEntries));
    } catch {
      setQaError('Unable to load this discussion thread.');
    } finally {
      setThreadLoading(false);
    }
  }

  const handleLoadMoreQuestions = async () => {
    if (!questionsHasMore || qaLoading || questionsLoadingMore) return;
    await loadQuestions({ keepSelection: true, page: questionsPage + 1, append: true });
  };

  useEffect(() => {
    if (!selectedQuestionId) {
      setAnswers([]);
      setQuestionComments([]);
      setAnswerCommentsMap({});
      setThreadLoading(false);
      return;
    }

    let cancelled = false;
    setThreadLoading(true);
    setQaError('');

    const run = async () => {
      try {
        const [nextAnswers, nextQuestionComments] = await Promise.all([
          qaService.listAnswersByQuestion(selectedQuestionId, { include_hidden: canModerate, page: 1, limit: 50 }),
          qaService.listQuestionComments(selectedQuestionId, { include_hidden: canModerate, page: 1, limit: 100 }),
        ]);

        if (cancelled) return;
        setAnswers(nextAnswers);
        setQuestionComments(nextQuestionComments);

        if (!nextAnswers.length) {
          setAnswerCommentsMap({});
          return;
        }

        const answerCommentEntries = await Promise.all(
          nextAnswers.map(async (answer) => {
            const comments = await qaService.listAnswerComments(answer.id, { include_hidden: canModerate, page: 1, limit: 100 });
            return [answer.id, comments];
          })
        );

        if (cancelled) return;
        setAnswerCommentsMap(Object.fromEntries(answerCommentEntries));
      } catch {
        if (cancelled) return;
        setQaError('Unable to load this discussion thread.');
      } finally {
        if (!cancelled) {
          setThreadLoading(false);
        }
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [selectedQuestionId, canModerate]);

  useEffect(() => {
    if (!selectedQuestionId) return;

    const timer = window.setTimeout(() => {
      if (targetCommentId) {
        const commentElement = document.getElementById(`qa-comment-${targetCommentId}`);
        if (commentElement) {
          setHighlightedCommentId(targetCommentId);
          commentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setTargetCommentId(null);
          return;
        }
      }

      if (targetAnswerId) {
        const answerElement = document.getElementById(`qa-answer-${targetAnswerId}`);
        if (answerElement) {
          setHighlightedAnswerId(targetAnswerId);
          answerElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setTargetAnswerId(null);
        }
      }
    }, 120);

    return () => {
      window.clearTimeout(timer);
    };
  }, [selectedQuestionId, answers, answerCommentsMap, questionComments, targetAnswerId, targetCommentId]);

  useEffect(() => {
    if (!highlightedAnswerId && !highlightedCommentId) return;
    const timer = window.setTimeout(() => {
      setHighlightedAnswerId(null);
      setHighlightedCommentId(null);
    }, 2200);

    return () => {
      window.clearTimeout(timer);
    };
  }, [highlightedAnswerId, highlightedCommentId]);

  useEffect(() => {
    if (!resourceId) return undefined;

    const interval = window.setInterval(() => {
      loadQuestions({ keepSelection: true });
      if (selectedQuestionId) {
        loadSelectedThread(selectedQuestionId);
      }
    }, AUTO_REFRESH_INTERVAL_MS);

    return () => {
      window.clearInterval(interval);
    };
  }, [resourceId, selectedQuestionId, canModerate]);

  const handleCreateQuestion = async () => {
    if (!isAuthenticated || !moduleId || !resourceId || creatingQuestion) return;
    if (questionTitleInput.trim().length < 5 || questionBodyInput.trim().length < 10) return;

    setCreatingQuestion(true);
    setQaError('');
    try {
      const created = await qaService.createQuestion({
        module_id: moduleId,
        resource_id: resourceId,
        title: questionTitleInput.trim(),
        body: questionBodyInput.trim(),
        is_anonymous: questionAnonymousInput,
      });
      setQuestionTitleInput('');
      setQuestionBodyInput('');
      setQuestionAnonymousInput(false);
      await loadQuestions({ keepSelection: false, preferredId: created?.id || null });
    } catch {
      setQaError('Failed to post your question.');
    } finally {
      setCreatingQuestion(false);
    }
  };

  const handleCreateAnswer = async () => {
    if (!isAuthenticated || !selectedQuestionId || creatingAnswer) return;
    if (answerBodyInput.trim().length < 10) return;
    if (isTeacher && answerExplanationInput.trim().length < 50) return;
    if (isTeacher && answerExampleInput.trim().length < 10) return;

    setCreatingAnswer(true);
    setQaError('');
    try {
      await qaService.createAnswer(selectedQuestionId, {
        body: answerBodyInput.trim(),
        explanation: isTeacher ? answerExplanationInput.trim() : null,
        example: isTeacher ? answerExampleInput.trim() : null,
      });
      setAnswerBodyInput('');
      setAnswerExplanationInput('');
      setAnswerExampleInput('');
      await Promise.all([loadQuestions({ keepSelection: true }), loadSelectedThread(selectedQuestionId)]);
    } catch {
      setQaError('Failed to post your answer.');
    } finally {
      setCreatingAnswer(false);
    }
  };

  const handleCreateQuestionComment = async () => {
    if (!isAuthenticated || !selectedQuestionId || creatingQuestionComment) return;
    if (questionCommentInput.trim().length < 2) return;

    setCreatingQuestionComment(true);
    setQaError('');
    try {
      await qaService.createQuestionComment(selectedQuestionId, {
        body: questionCommentInput.trim(),
      });
      setQuestionCommentInput('');
      await loadSelectedThread(selectedQuestionId);
    } catch {
      setQaError('Failed to post question comment.');
    } finally {
      setCreatingQuestionComment(false);
    }
  };

  const handleCreateAnswerComment = async (answerId) => {
    if (!isAuthenticated || !answerId || creatingAnswerCommentId) return;
    const value = String(answerCommentInputs[answerId] || '').trim();
    if (value.length < 2) return;

    setCreatingAnswerCommentId(answerId);
    setQaError('');
    try {
      await qaService.createAnswerComment(answerId, { body: value });
      setAnswerCommentInputs((prev) => ({ ...prev, [answerId]: '' }));
      await loadSelectedThread(selectedQuestionId);
    } catch {
      setQaError('Failed to post answer comment.');
    } finally {
      setCreatingAnswerCommentId(null);
    }
  };

  const handleCreateConfusionSignal = async () => {
    if (!isAuthenticated || !isStudent || !resourceId || !moduleId || creatingConfusionSignal) return;

    const normalizedNote = confusionNoteInput.trim();
    if (normalizedNote.length > 0 && normalizedNote.length < 3) {
      setConfusionFeedback({
        type: 'warning',
        message: 'Please provide at least 3 characters in the confusion note, or leave it empty.',
      });
      return;
    }

    setCreatingConfusionSignal(true);
    setConfusionFeedback({ type: '', message: '' });

    try {
      await confusionService.createSignal(resourceId, {
        module_id: moduleId,
        note: normalizedNote || undefined,
      });
      setConfusionNoteInput('');
      setConfusionFeedback({
        type: 'success',
        message: 'Your confusion signal has been sent. A support case is now tracked for this resource.',
      });

      const refreshedRows = await confusionService.listMyCases({ page: 1, limit: 20 });
      const nextRows = Array.isArray(refreshedRows)
        ? refreshedRows.filter((item) => Number(item?.resource_id || 0) === Number(resourceId))
        : [];
      setMyConfusionCases(nextRows);
    } catch {
      setConfusionFeedback({
        type: 'error',
        message: 'Unable to submit confusion signal right now. Please try again.',
      });
    } finally {
      setCreatingConfusionSignal(false);
    }
  };

  const handleAcceptAnswer = async (answerId) => {
    if (!canModerate || !answerId || moderationLoadingKey) return;
    setModerationLoadingKey(`accept-answer-${answerId}`);
    setQaError('');
    try {
      await qaService.acceptAnswer(answerId);
      await Promise.all([loadQuestions({ keepSelection: true }), loadSelectedThread(selectedQuestionId)]);
      showSuccess('Accepted answer updated successfully.');
    } catch {
      setQaError('Failed to accept this answer.');
      showError('Failed to accept this answer.');
    } finally {
      setModerationLoadingKey('');
    }
  };

  const handleModerateQuestion = async (status) => {
    if (!canModerate || !selectedQuestionId || moderationLoadingKey) return;
    setModerationLoadingKey(`question-${selectedQuestionId}-${status}`);
    setQaError('');
    try {
      await qaService.moderateQuestion(selectedQuestionId, {
        moderation_status: status,
        reason: `Updated from preview page (${status})`,
      });
      await Promise.all([loadQuestions({ keepSelection: true }), loadSelectedThread(selectedQuestionId)]);
      showInfo(`Question visibility updated: ${moderationVisibilityLabel(status)}.`);
    } catch {
      setQaError('Failed to update question moderation state.');
      showError('Failed to update question moderation state.');
    } finally {
      setModerationLoadingKey('');
    }
  };

  const handleModerateAnswer = async (answerId, status) => {
    if (!canModerate || !answerId || moderationLoadingKey) return;
    setModerationLoadingKey(`answer-${answerId}-${status}`);
    setQaError('');
    try {
      await qaService.moderateAnswer(answerId, {
        moderation_status: status,
        reason: `Updated from preview page (${status})`,
      });
      await Promise.all([loadQuestions({ keepSelection: true }), loadSelectedThread(selectedQuestionId)]);
      showInfo(`Answer visibility updated: ${moderationVisibilityLabel(status)}.`);
    } catch {
      setQaError('Failed to update answer moderation state.');
      showError('Failed to update answer moderation state.');
    } finally {
      setModerationLoadingKey('');
    }
  };

  const handleModerateComment = async (commentId, status) => {
    if (!canModerate || !commentId || moderationLoadingKey) return;
    setModerationLoadingKey(`comment-${commentId}-${status}`);
    setQaError('');
    try {
      await qaService.moderateComment(commentId, {
        moderation_status: status,
        reason: `Updated from preview page (${status})`,
      });
      await loadSelectedThread(selectedQuestionId);
      showInfo(`Comment visibility updated: ${moderationVisibilityLabel(status)}.`);
    } catch {
      setQaError('Failed to update comment moderation state.');
      showError('Failed to update comment moderation state.');
    } finally {
      setModerationLoadingKey('');
    }
  };

  const handleQuestionLifecycle = async (nextStatus) => {
    if (!canModerate || !selectedQuestionId || moderationLoadingKey) return;
    setModerationLoadingKey(`question-status-${selectedQuestionId}-${nextStatus}`);
    setQaError('');
    try {
      await qaService.updateQuestionStatus(selectedQuestionId, { status: nextStatus });
      await Promise.all([loadQuestions({ keepSelection: true }), loadSelectedThread(selectedQuestionId)]);
      showSuccess(nextStatus === 'closed' ? 'Question closed. New answers and comments are now blocked.' : 'Question reopened successfully.');
    } catch {
      setQaError(nextStatus === 'closed' ? 'Failed to close this question.' : 'Failed to reopen this question.');
      showError(nextStatus === 'closed' ? 'Failed to close this question.' : 'Failed to reopen this question.');
    } finally {
      setModerationLoadingKey('');
    }
  };

  /* ─── preview panel content ─── */
  const renderPreview = () => {
    if (loading)  return <PreviewSkeleton />;
    if (error)    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, p: 5, minHeight: { xs: '32vh', md: '40vh' } }}>
        <BrokenImage sx={{ fontSize: 56, color: 'error.light' }} />
        <Typography color="error.main" fontWeight={600}>{error}</Typography>
      </Box>
    );
    if (!previewUrl)                 return <NoUrlState />;
    if (normalizedFormat === 'pdf')  return <PdfPreview url={previewUrl} />;
    if (normalizedFormat === 'video') return <VideoPreview url={previewUrl} />;
    if (normalizedFormat === 'audio') return <AudioPreview url={previewUrl} title={resource?.title} />;
    if (normalizedFormat === 'image') return <ImagePreview url={previewUrl} title={resource?.title} />;
    if (isOfficeFormat)               return <OfficePreview embedUrl={officeEmbedUrl} />;
    return <UnsupportedPreview format={normalizedFormat} onOpen={handleOpen} canOpen={!!(previewUrl || resource?.url)} />;
  };

  /* ─── derived format color for accent bars ─── */
  const accentColor = loading ? '#7c5cfc' : formatMeta.color;

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
      <DiscoverNavbar
        onLogout={() => { navigate('/', { replace: true }); logout(); }}
        isAuthenticated={isAuthenticated}
      />

      <Box
        sx={{
          width: '100%',
          maxWidth: 1400,
          mx: 'auto',
          px: { xs: 1, sm: 1.5, md: 2.5, lg: 3 },
          py: { xs: 1.5, md: 2.5 },
        }}
      >
        {/* ── Top toolbar ── */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          alignItems={{ xs: 'stretch', sm: 'center' }}
          justifyContent="space-between"
          sx={{ mb: 2 }}
        >
          {/* Left: back + title + chips */}
          <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
            <Tooltip title="Back">
              <IconButton
                onClick={handleBack}
                size="small"
                sx={(theme) => ({
                  border: '1px solid',
                  borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                  borderRadius: 2,
                  flexShrink: 0,
                  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08) },
                })}
              >
                <ArrowBack sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>

            {loading ? (
              <Skeleton variant="text" width={220} height={28} sx={{ borderRadius: 1 }} />
            ) : (
              <Typography
                variant="h6"
                noWrap
                sx={{ fontWeight: 700, fontSize: { xs: '0.95rem', md: '1.1rem' }, minWidth: 0, flex: 1 }}
              >
                {resource?.title || 'Resource Preview'}
              </Typography>
            )}

            {!loading && normalizedFormat && (
              <Chip
                label={formatMeta.label}
                size="small"
                sx={{ bgcolor: `${formatMeta.color}18`, color: formatMeta.color, fontWeight: 700, border: `1px solid ${formatMeta.color}33`, flexShrink: 0 }}
              />
            )}
            {!loading && isPremium && (
              <Chip
                icon={<Lock sx={{ fontSize: '14px !important', color: '#f59e0b !important' }} />}
                label="Premium"
                size="small"
                sx={{ bgcolor: 'rgba(245,158,11,0.1)', color: '#f59e0b', fontWeight: 700, border: '1px solid rgba(245,158,11,0.25)', flexShrink: 0 }}
              />
            )}
          </Stack>

          {/* Right: action buttons */}
          <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
            <Button
              startIcon={<OpenInNew sx={{ fontSize: '16px !important' }} />}
              variant="outlined"
              onClick={handleOpen}
              disabled={loading || (!previewUrl && !resource?.url)}
              sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600, fontSize: '0.82rem', px: 1.6 }}
            >
              Open
            </Button>
            <Button
              startIcon={<Download sx={{ fontSize: '16px !important' }} />}
              variant="contained"
              onClick={handleDownload}
              disabled={loading || downloadLoading}
              sx={{
                textTransform: 'none', borderRadius: 2, fontWeight: 700, fontSize: '0.82rem', px: 1.6,
                background: 'linear-gradient(135deg, #7c5cfc 0%, #5b3fdd 100%)',
                boxShadow: '0 2px 8px rgba(124,92,252,0.3)',
                '&:hover': { background: 'linear-gradient(135deg, #6e4fe8 0%, #4e36cc 100%)', boxShadow: '0 4px 14px rgba(124,92,252,0.4)' },
              }}
            >
              {downloadLoading ? 'Downloading…' : 'Download'}
            </Button>
          </Stack>
        </Stack>

        {/* ── Main split layout ── */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '1fr 320px' },
            gap: { xs: 1.5, md: 2 },
            alignItems: 'start',
          }}
        >
          {/* ═══ Preview panel ═══ */}
          <Panel
            sx={{
              order: { xs: 2, lg: 1 },
              p: 0,
              minHeight: { xs: '56vw', sm: '48vw', md: '55vh', lg: '68vh' },
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Colour accent — fades from purple to format colour once loaded */}
            <Box
              sx={{
                height: 3,
                flexShrink: 0,
                background: `linear-gradient(90deg, #7c5cfc, ${accentColor}88)`,
                transition: 'background 0.4s ease',
              }}
            />
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRadius: '0 0 12px 12px' }}>
              {renderPreview()}
            </Box>
          </Panel>

          {/* ═══ Info sidebar ═══ */}
          <Panel
            sx={{
              order: { xs: 1, lg: 2 },
              position: { lg: 'sticky' },
              top: { lg: 88 },
            }}
          >
            <Box sx={{ height: 3, background: 'linear-gradient(90deg, #7c5cfc, #3b82f6)' }} />

            {loading ? (
              <SidebarSkeleton />
            ) : (
              <Box sx={{ p: { xs: 2, md: 2.5 } }}>
                {/* Format icon + title */}
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                  <Box
                    sx={{
                      width: 40, height: 40, borderRadius: 2, flexShrink: 0,
                      background: `${formatMeta.color}18`,
                      border: `1px solid ${formatMeta.color}33`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <formatMeta.Icon sx={{ fontSize: 22, color: formatMeta.color }} />
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="subtitle1" fontWeight={800} sx={{ lineHeight: 1.3, fontSize: { xs: '0.9rem', md: '0.95rem' } }}>
                      {resource?.title || 'Resource'}
                    </Typography>
                    {educationalType && (
                      <Typography variant="caption" color="text.disabled" sx={{ textTransform: 'capitalize', fontSize: '0.7rem' }}>
                        {educationalType} resource
                      </Typography>
                    )}
                  </Box>
                </Stack>

                <Divider sx={{ mb: 2, opacity: 0.5 }} />

                <Stack spacing={1.6}>
                  <MetaRow icon={Person}                  label="Author"      value={authorName}   />
                  <MetaRow icon={School}                  label="Institution" value={institution}   />
                  <MetaRow icon={MenuBook}                label="Module"      value={moduleTitle}   />
                  <MetaRow icon={isPremium ? Lock : LockOpen} label="Access" value={isPremium ? 'Premium' : 'Free'} />
                </Stack>

                {description && (
                  <>
                    <Divider sx={{ my: 2, opacity: 0.5 }} />
                    <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mb: 0.75, textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.68rem' }}>
                      Description
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7, fontSize: '0.84rem', whiteSpace: 'pre-line' }}>
                      {description}
                    </Typography>
                  </>
                )}
              </Box>
            )}
          </Panel>
        </Box>

        <Panel sx={{ mt: 2, p: { xs: 2, md: 2.5 } }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <QuestionAnswer sx={{ color: 'primary.main' }} />
              <Typography variant="h6" fontWeight={700}>Q&A Discussion</Typography>
            </Stack>
            <Button
              variant="outlined"
              size="small"
              onClick={() => loadQuestions({ keepSelection: true })}
              disabled={qaLoading || !resourceId}
              sx={{ textTransform: 'none', borderRadius: 2 }}
            >
              Refresh
            </Button>
          </Stack>

          {qaError ? (
            <Alert
              severity="error"
              sx={{ mb: 2 }}
              action={
                <Button
                  color="inherit"
                  size="small"
                  onClick={() => {
                    loadQuestions({ keepSelection: true });
                    if (selectedQuestionId) {
                      loadSelectedThread(selectedQuestionId);
                    }
                  }}
                >
                  Retry
                </Button>
              }
            >
              {qaError}
            </Alert>
          ) : null}

          <Box sx={{ mb: 2.5 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>Ask a question</Typography>
            {!isAuthenticated ? (
              <Alert severity="info">Sign in to ask questions, answer, and comment.</Alert>
            ) : !moduleId ? (
              <Alert severity="warning">This resource is not linked to a module yet. Question creation is disabled.</Alert>
            ) : null}

            {isAuthenticated && linkedModules.length > 1 ? (
              <FormControl size="small" fullWidth sx={{ mt: 1.25 }}>
                <InputLabel id="qa-module-select-label">Module context</InputLabel>
                <Select
                  labelId="qa-module-select-label"
                  value={String(selectedModuleId || '')}
                  label="Module context"
                  onChange={(event) => {
                    const value = Number(event.target.value || 0);
                    setSelectedModuleId(value > 0 ? value : null);
                  }}
                >
                  {linkedModules.map((item) => (
                    <MenuItem key={item.module_id} value={String(item.module_id)}>
                      {item.module_code ? `${item.module_code} - ${item.module_title}` : item.module_title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : null}

            <Stack spacing={1.25} sx={{ mt: 1.25 }}>
              <TextField
                size="small"
                label="Question title"
                value={questionTitleInput}
                onChange={(event) => setQuestionTitleInput(event.target.value)}
                disabled={!isAuthenticated || !moduleId || creatingQuestion}
              />
              <TextField
                size="small"
                label="Question details"
                multiline
                minRows={3}
                value={questionBodyInput}
                onChange={(event) => setQuestionBodyInput(event.target.value)}
                disabled={!isAuthenticated || !moduleId || creatingQuestion}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={questionAnonymousInput}
                    onChange={(event) => setQuestionAnonymousInput(event.target.checked)}
                    disabled={!isAuthenticated || !moduleId || creatingQuestion}
                    size="small"
                  />
                }
                label="Post this question anonymously"
              />
              <Box>
                <Button
                  variant="contained"
                  onClick={handleCreateQuestion}
                  disabled={!isAuthenticated || !moduleId || creatingQuestion || questionTitleInput.trim().length < 5 || questionBodyInput.trim().length < 10}
                  sx={{ textTransform: 'none', borderRadius: 2 }}
                >
                  {creatingQuestion ? 'Posting...' : 'Post question'}
                </Button>
              </Box>
            </Stack>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '320px 1fr' },
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
                Questions ({questions.length})
              </Typography>
              {qaLoading ? (
                <Typography variant="body2" color="text.secondary">Loading discussions...</Typography>
              ) : !questions.length ? (
                <Typography variant="body2" color="text.secondary">No questions yet. Start the first thread.</Typography>
              ) : (
                <Stack spacing={1}>
                  {questions.map((question) => {
                    const isSelected = selectedQuestionId === question.id;
                    return (
                      <Box
                        key={question.id}
                        role="button"
                        onClick={() => {
                          setQaError('');
                          setSelectedQuestionId(question.id);
                        }}
                        sx={(theme) => ({
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: isSelected ? 'primary.main' : 'divider',
                          backgroundColor: isSelected ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                          p: 1.25,
                          cursor: 'pointer',
                        })}
                      >
                        <Typography variant="body2" fontWeight={700}>{question.title}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.35 }}>
                          {question.user_name || 'Unknown'} · {QUESTION_STATUS_LABELS[question.status] || question.status}
                        </Typography>
                        {question.is_anonymous ? (
                          <Chip
                            size="small"
                            label="Anonymous"
                            sx={{ mt: 0.6, height: 20 }}
                          />
                        ) : null}
                        {question.moderation_status && question.moderation_status !== 'active' ? (
                          <Chip
                            size="small"
                            label={question.moderation_status}
                            color={question.moderation_status === 'hidden' ? 'warning' : 'error'}
                            sx={{ mt: 0.6, height: 20 }}
                          />
                        ) : null}
                      </Box>
                    );
                  })}

                  {questionsHasMore ? (
                    <Button
                      variant="outlined"
                      onClick={handleLoadMoreQuestions}
                      disabled={questionsLoadingMore || qaLoading}
                      sx={{ textTransform: 'none', borderRadius: 2 }}
                    >
                      {questionsLoadingMore ? 'Loading more...' : 'Load more questions'}
                    </Button>
                  ) : null}
                </Stack>
              )}
            </Box>

            <Box>
              {!selectedQuestion ? (
                <Typography variant="body2" color="text.secondary">
                  Select a question to view the full thread. Comments are attached to a question or to a specific answer.
                </Typography>
              ) : threadLoading ? (
                <Stack direction="row" spacing={1} alignItems="center">
                  <CircularProgress size={18} />
                  <Typography variant="body2" color="text.secondary">Loading thread...</Typography>
                </Stack>
              ) : (
                <Stack spacing={2}>
                  <Box id={`qa-question-${selectedQuestion.id}`} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 1.5 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                      <Typography variant="subtitle1" fontWeight={700}>{selectedQuestion.title}</Typography>
                      <Stack direction="row" spacing={0.6}>
                        <Chip size="small" label={QUESTION_STATUS_LABELS[selectedQuestion.status] || selectedQuestion.status || 'Open'} color="default" />
                        {selectedQuestion.is_anonymous ? <Chip size="small" label="Anonymous" color="info" /> : null}
                        {selectedQuestion.moderation_status && selectedQuestion.moderation_status !== 'active' ? (
                          <Chip
                            size="small"
                            label={selectedQuestion.moderation_status}
                            color={selectedQuestion.moderation_status === 'hidden' ? 'warning' : 'error'}
                          />
                        ) : null}
                      </Stack>
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line', mt: 0.75 }}>
                      {selectedQuestion.body}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                      {selectedQuestion.user_name || 'Unknown'} · {formatDateTime(selectedQuestion.created_at)}
                    </Typography>
                    {selectedQuestion.status === 'closed' ? (
                      <Alert severity="info" sx={{ mt: 1.25 }}>
                        This discussion is closed. New answers and comments are no longer accepted.
                      </Alert>
                    ) : null}
                    {selectedQuestion.moderation_status && selectedQuestion.moderation_status !== 'active' ? (
                      <Alert severity={selectedQuestion.moderation_status === 'hidden' ? 'warning' : 'error'} sx={{ mt: 1.25 }}>
                        Staff-only view: this question is currently {moderationVisibilityLabel(selectedQuestion.moderation_status).toLowerCase()}.
                      </Alert>
                    ) : null}
                    {canModerate ? (
                      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                        {selectedQuestion.status === 'closed' ? (
                          <Button
                            size="small"
                            variant="contained"
                            color="primary"
                            onClick={() => handleQuestionLifecycle('open')}
                            disabled={Boolean(moderationLoadingKey) || selectedQuestion.moderation_status !== 'active'}
                            sx={{ textTransform: 'none' }}
                          >
                            Reopen
                          </Button>
                        ) : (
                          <Button
                            size="small"
                            variant="contained"
                            color="secondary"
                            onClick={() => handleQuestionLifecycle('closed')}
                            disabled={Boolean(moderationLoadingKey) || selectedQuestion.moderation_status !== 'active'}
                            sx={{ textTransform: 'none' }}
                          >
                            Close
                          </Button>
                        )}
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleModerateQuestion('active')}
                          disabled={Boolean(moderationLoadingKey)}
                          sx={{ textTransform: 'none' }}
                        >
                          Show
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="warning"
                          onClick={() => handleModerateQuestion('hidden')}
                          disabled={Boolean(moderationLoadingKey)}
                          sx={{ textTransform: 'none' }}
                        >
                          Hide
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => handleModerateQuestion('deleted')}
                          disabled={Boolean(moderationLoadingKey)}
                          sx={{ textTransform: 'none' }}
                        >
                          Delete
                        </Button>
                      </Stack>
                    ) : null}
                  </Box>

                  <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 1.5 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Comments on question</Typography>
                    {questionComments.length ? (
                      <Stack spacing={0.8} sx={{ mb: 1.25 }}>
                        {questionComments.map((comment) => (
                          <Box
                            id={`qa-comment-${comment.id}`}
                            key={comment.id}
                            sx={(theme) => ({
                              p: 1,
                              borderRadius: 1.5,
                              border: highlightedCommentId === comment.id ? '1px solid' : 'none',
                              borderColor: highlightedCommentId === comment.id ? 'warning.main' : 'transparent',
                              bgcolor:
                                highlightedCommentId === comment.id
                                  ? alpha(theme.palette.warning.main, 0.18)
                                  : alpha(theme.palette.primary.main, 0.06),
                            })}
                          >
                            <Typography variant="body2">{comment.body}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {comment.user_name || 'Unknown'} · {formatDateTime(comment.created_at)}
                            </Typography>
                            {comment.moderation_status && comment.moderation_status !== 'active' ? (
                              <Chip
                                size="small"
                                label={comment.moderation_status}
                                color={comment.moderation_status === 'hidden' ? 'warning' : 'error'}
                                sx={{ ml: 1, height: 20 }}
                              />
                            ) : null}
                            {canModerate ? (
                              <Stack direction="row" spacing={0.7} sx={{ mt: 0.6 }}>
                                <Button size="small" variant="text" onClick={() => handleModerateComment(comment.id, 'active')} disabled={Boolean(moderationLoadingKey)} sx={{ textTransform: 'none', minWidth: 0, px: 0.5 }}>Show</Button>
                                <Button size="small" variant="text" color="warning" onClick={() => handleModerateComment(comment.id, 'hidden')} disabled={Boolean(moderationLoadingKey)} sx={{ textTransform: 'none', minWidth: 0, px: 0.5 }}>Hide</Button>
                                <Button size="small" variant="text" color="error" onClick={() => handleModerateComment(comment.id, 'deleted')} disabled={Boolean(moderationLoadingKey)} sx={{ textTransform: 'none', minWidth: 0, px: 0.5 }}>Delete</Button>
                              </Stack>
                            ) : null}
                          </Box>
                        ))}
                      </Stack>
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.25 }}>No comments yet.</Typography>
                    )}
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                      <TextField
                        size="small"
                        fullWidth
                        label="Add a comment"
                        value={questionCommentInput}
                        onChange={(event) => setQuestionCommentInput(event.target.value)}
                        disabled={!isAuthenticated || creatingQuestionComment || questionReadOnly}
                      />
                      <Button
                        variant="outlined"
                        onClick={handleCreateQuestionComment}
                        disabled={!isAuthenticated || creatingQuestionComment || questionCommentInput.trim().length < 2 || questionReadOnly}
                        sx={{ textTransform: 'none', borderRadius: 2, whiteSpace: 'nowrap' }}
                      >
                        {creatingQuestionComment ? 'Posting...' : 'Comment'}
                      </Button>
                    </Stack>
                  </Box>

                  <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 1.5 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Post an answer</Typography>
                    {questionReadOnly ? (
                      <Alert severity="info" sx={{ mb: 1.2 }}>
                        {selectedQuestion.status === 'closed'
                          ? 'This question is closed. New answers and comments are disabled.'
                          : 'This question is hidden from learners. Staff can review it, but new answers are disabled.'}
                      </Alert>
                    ) : null}
                    <Stack spacing={1}>
                      <TextField
                        size="small"
                        multiline
                        minRows={3}
                        label="Your answer"
                        value={answerBodyInput}
                        onChange={(event) => setAnswerBodyInput(event.target.value)}
                        disabled={!isAuthenticated || creatingAnswer || questionReadOnly}
                      />
                      {isTeacher ? (
                        <>
                          <TextField
                            size="small"
                            multiline
                            minRows={2}
                            label="Official explanation (min 50 chars)"
                            value={answerExplanationInput}
                            onChange={(event) => setAnswerExplanationInput(event.target.value)}
                            disabled={!isAuthenticated || creatingAnswer || questionReadOnly}
                            helperText="Teacher official answers require a detailed explanation."
                          />
                          <TextField
                            size="small"
                            label="Concrete example (min 10 chars)"
                            value={answerExampleInput}
                            onChange={(event) => setAnswerExampleInput(event.target.value)}
                            disabled={!isAuthenticated || creatingAnswer || questionReadOnly}
                          />
                        </>
                      ) : null}
                      <Box>
                        <Button
                          variant="contained"
                          onClick={handleCreateAnswer}
                          disabled={
                            !isAuthenticated
                            || creatingAnswer
                            || answerBodyInput.trim().length < 10
                            || (isTeacher && answerExplanationInput.trim().length < 50)
                            || (isTeacher && answerExampleInput.trim().length < 10)
                            || questionReadOnly
                          }
                          sx={{ textTransform: 'none', borderRadius: 2 }}
                        >
                          {creatingAnswer ? 'Posting...' : 'Post answer'}
                        </Button>
                      </Box>
                    </Stack>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                      Answers ({answers.length})
                    </Typography>
                    {!answers.length ? (
                      <Typography variant="body2" color="text.secondary">No answers yet.</Typography>
                    ) : (
                      <Stack spacing={1.25}>
                        {answers.map((answer) => (
                          <Box
                            id={`qa-answer-${answer.id}`}
                            key={answer.id}
                            sx={(theme) => ({
                              border: '1px solid',
                              borderColor: highlightedAnswerId === answer.id ? 'warning.main' : 'divider',
                              borderRadius: 2,
                              p: 1.25,
                              bgcolor: highlightedAnswerId === answer.id ? alpha(theme.palette.warning.main, 0.12) : 'transparent',
                            })}
                          >
                            <Stack direction="row" spacing={0.75} sx={{ mb: 0.75, flexWrap: 'wrap' }}>
                              {answer.is_official ? <Chip size="small" label="Official" color="info" /> : null}
                              {answer.is_accepted ? <Chip size="small" label="Accepted" color="success" /> : null}
                              {answer.moderation_status && answer.moderation_status !== 'active' ? (
                                <Chip
                                  size="small"
                                  label={answer.moderation_status}
                                  color={answer.moderation_status === 'hidden' ? 'warning' : 'error'}
                                />
                              ) : null}
                            </Stack>
                            <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>{answer.body}</Typography>
                            {answer.is_official ? (
                              <Box sx={{ mt: 1, display: 'grid', gap: 0.8 }}>
                                <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: (theme) => alpha(theme.palette.info.main, 0.08) }}>
                                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.35 }}>
                                    Official explanation
                                  </Typography>
                                  <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                                    {answer.explanation || 'No explanation provided.'}
                                  </Typography>
                                </Box>
                                <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: (theme) => alpha(theme.palette.success.main, 0.08) }}>
                                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.35 }}>
                                    Concrete example
                                  </Typography>
                                  <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                                    {answer.example || 'No example provided.'}
                                  </Typography>
                                </Box>
                              </Box>
                            ) : null}
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75 }}>
                              {answer.user_name || 'Unknown'} · {formatDateTime(answer.created_at)}
                            </Typography>
                            {canModerate ? (
                              <Stack direction="row" spacing={1} sx={{ mt: 0.8, mb: 0.3 }}>
                                {!answer.is_accepted ? (
                                  <Button
                                    size="small"
                                    variant="contained"
                                    color="success"
                                    onClick={() => handleAcceptAnswer(answer.id)}
                                    disabled={Boolean(moderationLoadingKey)}
                                    sx={{ textTransform: 'none' }}
                                  >
                                    Accept
                                  </Button>
                                ) : null}
                                <Button size="small" variant="outlined" onClick={() => handleModerateAnswer(answer.id, 'active')} disabled={Boolean(moderationLoadingKey)} sx={{ textTransform: 'none' }}>Show</Button>
                                <Button size="small" variant="outlined" color="warning" onClick={() => handleModerateAnswer(answer.id, 'hidden')} disabled={Boolean(moderationLoadingKey)} sx={{ textTransform: 'none' }}>Hide</Button>
                                <Button size="small" variant="outlined" color="error" onClick={() => handleModerateAnswer(answer.id, 'deleted')} disabled={Boolean(moderationLoadingKey)} sx={{ textTransform: 'none' }}>Delete</Button>
                              </Stack>
                            ) : null}

                            <Box sx={{ mt: 1.1 }}>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                Answer comments
                              </Typography>
                              {Array.isArray(answerCommentsMap[answer.id]) && answerCommentsMap[answer.id].length ? (
                                <Stack spacing={0.5} sx={{ mb: 0.8 }}>
                                  {answerCommentsMap[answer.id].map((comment) => (
                                    <Box
                                      id={`qa-comment-${comment.id}`}
                                      key={comment.id}
                                      sx={(theme) => ({
                                        p: 0.75,
                                        borderRadius: 1.25,
                                        border: highlightedCommentId === comment.id ? '1px solid' : 'none',
                                        borderColor: highlightedCommentId === comment.id ? 'warning.main' : 'transparent',
                                        bgcolor:
                                          highlightedCommentId === comment.id
                                            ? alpha(theme.palette.warning.main, 0.18)
                                            : alpha(theme.palette.info.main, 0.07),
                                      })}
                                    >
                                      <Typography variant="caption" sx={{ display: 'block' }}>{comment.body}</Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        {comment.user_name || 'Unknown'} · {formatDateTime(comment.created_at)}
                                      </Typography>
                                      {comment.moderation_status && comment.moderation_status !== 'active' ? (
                                        <Chip
                                          size="small"
                                          label={comment.moderation_status}
                                          color={comment.moderation_status === 'hidden' ? 'warning' : 'error'}
                                          sx={{ ml: 1, height: 20 }}
                                        />
                                      ) : null}
                                      {canModerate ? (
                                        <Stack direction="row" spacing={0.7} sx={{ mt: 0.4 }}>
                                          <Button size="small" variant="text" onClick={() => handleModerateComment(comment.id, 'active')} disabled={Boolean(moderationLoadingKey)} sx={{ textTransform: 'none', minWidth: 0, px: 0.5 }}>Show</Button>
                                          <Button size="small" variant="text" color="warning" onClick={() => handleModerateComment(comment.id, 'hidden')} disabled={Boolean(moderationLoadingKey)} sx={{ textTransform: 'none', minWidth: 0, px: 0.5 }}>Hide</Button>
                                          <Button size="small" variant="text" color="error" onClick={() => handleModerateComment(comment.id, 'deleted')} disabled={Boolean(moderationLoadingKey)} sx={{ textTransform: 'none', minWidth: 0, px: 0.5 }}>Delete</Button>
                                        </Stack>
                                      ) : null}
                                    </Box>
                                  ))}
                                </Stack>
                              ) : (
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.8 }}>
                                  No comments yet.
                                </Typography>
                              )}

                              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                                <TextField
                                  size="small"
                                  fullWidth
                                  label="Comment on this answer"
                                  value={answerCommentInputs[answer.id] || ''}
                                  onChange={(event) => setAnswerCommentInputs((prev) => ({ ...prev, [answer.id]: event.target.value }))}
                                  disabled={!isAuthenticated || creatingAnswerCommentId === answer.id || questionReadOnly || answer.moderation_status !== 'active'}
                                />
                                <Button
                                  variant="outlined"
                                  onClick={() => handleCreateAnswerComment(answer.id)}
                                  disabled={!isAuthenticated || creatingAnswerCommentId === answer.id || String(answerCommentInputs[answer.id] || '').trim().length < 2 || questionReadOnly || answer.moderation_status !== 'active'}
                                  sx={{ textTransform: 'none', borderRadius: 2, whiteSpace: 'nowrap' }}
                                >
                                  {creatingAnswerCommentId === answer.id ? 'Posting...' : 'Comment'}
                                </Button>
                              </Stack>
                            </Box>
                          </Box>
                        ))}
                      </Stack>
                    )}
                  </Box>
                </Stack>
              )}
            </Box>
          </Box>

          <Divider sx={{ my: 2.5 }} />
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
              <ReportProblem color="warning" />
              <Typography variant="h6" fontWeight={700}>Need extra help? Confusion signal</Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              If this resource or thread is still unclear, you can escalate a confusion signal so staff can follow up through the confusion-case workflow.
            </Typography>

            {confusionFeedback.message ? (
              <Alert severity={confusionFeedback.type || 'info'} sx={{ mb: 1.5 }}>
                {confusionFeedback.message}
              </Alert>
            ) : null}

            {!isAuthenticated ? (
              <Alert severity="info">Sign in to open a confusion signal.</Alert>
            ) : !isStudent ? (
              <Alert severity="info">Confusion signals can be opened by student accounts.</Alert>
            ) : !moduleId ? (
              <Alert severity="warning">This resource is not linked to a module yet, so confusion signal creation is disabled.</Alert>
            ) : (
              <Stack spacing={1}>
                <TextField
                  size="small"
                  multiline
                  minRows={2}
                  label="Optional note for staff"
                  placeholder="Describe where you are blocked"
                  value={confusionNoteInput}
                  onChange={(event) => setConfusionNoteInput(event.target.value)}
                  disabled={creatingConfusionSignal}
                  helperText="Optional (3-1000 chars). Leave empty if not needed."
                />
                <Box>
                  <Button
                    variant="contained"
                    color="warning"
                    onClick={handleCreateConfusionSignal}
                    disabled={creatingConfusionSignal}
                    sx={{ textTransform: 'none', borderRadius: 2 }}
                  >
                    {creatingConfusionSignal ? 'Sending...' : "I don't understand this yet"}
                  </Button>
                </Box>
              </Stack>
            )}

            {isAuthenticated && isStudent ? (
              <Box sx={{ mt: 1.5 }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.8 }}>
                  My confusion cases for this resource
                </Typography>
                {myConfusionCasesLoading ? (
                  <Typography variant="body2" color="text.secondary">Loading cases...</Typography>
                ) : !myConfusionCases.length ? (
                  <Typography variant="body2" color="text.secondary">No case yet for this resource.</Typography>
                ) : (
                  <Stack spacing={0.8}>
                    {myConfusionCases.map((item) => (
                      <Box key={item.id || `${item.case_id}-${item.status}`} sx={{ p: 1, borderRadius: 1.5, border: '1px solid', borderColor: 'divider' }}>
                        <Stack direction="row" alignItems="center" spacing={0.8} sx={{ flexWrap: 'wrap' }}>
                          <Typography variant="body2" fontWeight={600}>Case #{item.id || item.case_id}</Typography>
                          <Chip size="small" label={item.status || 'nouveau'} color={String(item.status || '').toLowerCase() === 'resolu' ? 'success' : 'default'} />
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                          Module {item.module_id || 'N/A'} · Updated {formatDateTime(item.updated_at || item.created_at)}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                )}
              </Box>
            ) : null}
          </Box>
        </Panel>
      </Box>
    </Box>
  );
};

export default ResourcePreviewPage;
