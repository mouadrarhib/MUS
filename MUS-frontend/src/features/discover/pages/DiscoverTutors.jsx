import { useEffect, useMemo, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ScheduleIcon from '@mui/icons-material/Schedule';
import VideocamIcon from '@mui/icons-material/Videocam';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import StarIcon from '@mui/icons-material/Star';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ShieldIcon from '@mui/icons-material/Shield';
import { useNavigate } from 'react-router-dom';
import DiscoveryHeader from '@/features/discover/components/DiscoveryHeader';
import sessionService from '@/services/sessionService';
import { useNotification } from '@/shared/components/ui';

// ---------------------------------------------------------------------------
// Formatters
// ---------------------------------------------------------------------------
const formatTutorName = (slot) => String(slot?.teacher_name || '').trim() || 'Tutor';
const formatTime = (value) =>
  new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const formatDateTime = (value) =>
  new Date(value).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

// ---------------------------------------------------------------------------
// Constants — all at module scope to avoid re-creation on every render
// ---------------------------------------------------------------------------
const STEPS = ['Choose tutor', 'Choose time', 'Session details', 'Confirm'];
const DURATIONS = [30, 60, 90, 120];
const USE_VIRTUAL_TUTOR_DATA_WHEN_EMPTY = true;

const VIRTUAL_TUTOR_SLOTS = [
  {
    id: 990001,
    teacher_id: 'virtual-teacher-rohan',
    teacher_name: 'Rohan K.',
    teacher_avatar_url: 'https://i.pravatar.cc/120?img=12',
    start_at: '2026-05-08T09:00:00.000Z',
    end_at: '2026-05-08T10:00:00.000Z',
    timezone: 'UTC',
  },
  {
    id: 990002,
    teacher_id: 'virtual-teacher-rohan',
    teacher_name: 'Rohan K.',
    teacher_avatar_url: 'https://i.pravatar.cc/120?img=12',
    start_at: '2026-05-08T15:00:00.000Z',
    end_at: '2026-05-08T16:00:00.000Z',
    timezone: 'UTC',
  },
  {
    id: 990003,
    teacher_id: 'virtual-teacher-maya',
    teacher_name: 'Maya A.',
    teacher_avatar_url: 'https://i.pravatar.cc/120?img=32',
    start_at: '2026-05-09T10:30:00.000Z',
    end_at: '2026-05-09T11:30:00.000Z',
    timezone: 'UTC',
  },
  {
    id: 990004,
    teacher_id: 'virtual-teacher-maya',
    teacher_name: 'Maya A.',
    teacher_avatar_url: 'https://i.pravatar.cc/120?img=32',
    start_at: '2026-05-09T18:00:00.000Z',
    end_at: '2026-05-09T19:00:00.000Z',
    timezone: 'UTC',
  },
  {
    id: 990005,
    teacher_id: 'virtual-contributor-arjun',
    teacher_name: 'Arjun T.',
    teacher_avatar_url: 'https://i.pravatar.cc/120?img=15',
    start_at: '2026-05-10T12:00:00.000Z',
    end_at: '2026-05-10T13:00:00.000Z',
    timezone: 'UTC',
  },
  {
    id: 990006,
    teacher_id: 'virtual-contributor-sara',
    teacher_name: 'Sara L.',
    teacher_avatar_url: 'https://i.pravatar.cc/120?img=47',
    start_at: '2026-05-11T14:30:00.000Z',
    end_at: '2026-05-11T15:30:00.000Z',
    timezone: 'UTC',
  },
];

// Pre-computed virtual pricing — no rebuild on every effect run
const VIRTUAL_PRICING = {
  'virtual-teacher-rohan': { base_rate_per_hour: 28, currency: 'USD' },
  'virtual-teacher-maya': { base_rate_per_hour: 25, currency: 'USD' },
  'virtual-contributor-arjun': { base_rate_per_hour: 22, currency: 'USD' },
  'virtual-contributor-sara': { base_rate_per_hour: 20, currency: 'USD' },
};

const VIRTUAL_TUTOR_META = {
  'virtual-teacher-rohan': {
    rating: 4.8,
    expertise: 'Chemistry expert',
    topics: 'Organic Chemistry · Chemical Reactions · Grade 9–12',
  },
  'virtual-teacher-maya': {
    rating: 4.9,
    expertise: 'Math specialist',
    topics: 'Algebra · Calculus · Integration · Grade 8–12',
  },
  'virtual-contributor-arjun': {
    rating: 4.6,
    expertise: 'Python & CS',
    topics: 'Data Structures · Algorithms · CS Prep',
  },
  'virtual-contributor-sara': {
    rating: 4.9,
    expertise: 'English language',
    topics: 'Grammar · Writing · Speaking · IELTS',
  },
};

// Pre-computed virtual pricing profiles — stable references, no re-computation
const VIRTUAL_PRICING_PROFILES = Object.fromEntries(
  Object.entries(VIRTUAL_PRICING).map(([tutorId, entry]) => {
    const tiers = DURATIONS.map((duration) => {
      const sessionAmount = Number(((entry.base_rate_per_hour * duration) / 60).toFixed(2));
      const platformFee = 2;
      return {
        duration_minutes: duration,
        session_amount: sessionAmount,
        platform_fee: platformFee,
        total_amount: Number((sessionAmount + platformFee).toFixed(2)),
        currency: entry.currency,
      };
    });
    return [
      tutorId,
      {
        tutor_id: tutorId,
        base_rate_per_hour: entry.base_rate_per_hour,
        currency: entry.currency,
        pricing_tiers: tiers,
      },
    ];
  })
);

const DEFAULT_META = { rating: 4.7, expertise: 'Academic tutor', topics: 'Module guidance and session support' };
const getTutorMeta = (tutorId) => VIRTUAL_TUTOR_META[tutorId] || DEFAULT_META;
const getVirtualProfile = (tutorId) =>
  VIRTUAL_PRICING_PROFILES[tutorId] || VIRTUAL_PRICING_PROFILES['virtual-teacher-rohan'];

// ---------------------------------------------------------------------------
// Shared style helpers
// ---------------------------------------------------------------------------
const cardSx = {
  borderRadius: 3,
  border: '0.5px solid',
  borderColor: 'divider',
  boxShadow: 'none',
  overflow: 'hidden',
};

const sectionLabelSx = {
  fontSize: '0.68rem',
  fontWeight: 500,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: 'text.disabled',
  mb: 0.75,
};

const chipBtnSx = (active, theme) => ({
  textTransform: 'none',
  borderRadius: 2,
  fontSize: '0.78rem',
  fontWeight: active ? 500 : 400,
  px: 1.5,
  py: 0.5,
  minWidth: 0,
  border: '0.5px solid',
  borderColor: active ? 'primary.main' : 'divider',
  bgcolor: active ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
  color: active ? 'primary.main' : 'text.secondary',
  '&:hover': {
    bgcolor: active
      ? alpha(theme.palette.primary.main, 0.12)
      : alpha(theme.palette.action.hover, 0.06),
    borderColor: 'primary.light',
  },
});

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Connected stepper bar */
const StepperBar = () => (
  <Paper
    variant="outlined"
    sx={{
      display: 'flex',
      borderRadius: 2,
      overflow: 'hidden',
      mb: 2.5,
      borderColor: 'divider',
    }}
  >
    {STEPS.map((label, i) => {
      const done = i < 2;
      const active = i === 2;
      return (
        <Box
          key={label}
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
            px: 1.5,
            py: 1,
            borderRight: i < STEPS.length - 1 ? '0.5px solid' : 'none',
            borderColor: 'divider',
            bgcolor: done
              ? (t) => alpha(t.palette.success.main, 0.06)
              : active
              ? (t) => alpha(t.palette.primary.main, 0.06)
              : 'transparent',
          }}
        >
          <Box
            sx={{
              width: 20,
              height: 20,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              fontSize: '0.7rem',
              fontWeight: 500,
              ...(done && { bgcolor: 'success.main', color: '#fff' }),
              ...(active && { bgcolor: 'primary.main', color: '#fff' }),
              ...(!done && !active && {
                border: '0.5px solid',
                borderColor: 'divider',
                color: 'text.disabled',
              }),
            }}
          >
            {done ? <CheckCircleIcon sx={{ fontSize: 13 }} /> : i + 1}
          </Box>
          <Typography
            sx={{
              fontSize: '0.75rem',
              fontWeight: active || done ? 500 : 400,
              color: done ? 'success.dark' : active ? 'primary.main' : 'text.disabled',
              whiteSpace: 'nowrap',
            }}
          >
            {label}
          </Typography>
        </Box>
      );
    })}
  </Paper>
);

/** Single tutor row in the left panel */
const TutorRow = ({ tutor, active, pricingProfile, onSelect }) => {
  const meta = getTutorMeta(tutor.tutor_id);
  const rate =
    pricingProfile?.tutor_id === tutor.tutor_id
      ? pricingProfile.base_rate_per_hour
      : VIRTUAL_PRICING[tutor.tutor_id]?.base_rate_per_hour ?? 24;

  return (
    <Box
      role="button"
      tabIndex={0}
      onClick={() => onSelect(tutor.tutor_id)}
      onKeyDown={(e) => e.key === 'Enter' && onSelect(tutor.tutor_id)}
      aria-pressed={active}
      sx={(theme) => ({
        display: 'flex',
        alignItems: 'center',
        gap: 1.25,
        p: 1.25,
        borderRadius: 2,
        border: '0.5px solid',
        borderColor: active ? 'primary.main' : 'divider',
        bgcolor: active ? alpha(theme.palette.primary.main, 0.06) : 'transparent',
        cursor: 'pointer',
        transition: 'border-color 0.15s, background 0.15s',
        '&:hover': {
          borderColor: 'primary.light',
          bgcolor: alpha(theme.palette.primary.main, 0.04),
        },
      })}
    >
      <Avatar
        src={tutor.avatar_url}
        sx={{ width: 38, height: 38 }}
        imgProps={{ loading: 'lazy' }}
      >
        {String(tutor.tutor_name || '?').charAt(0)}
      </Avatar>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          sx={{ fontSize: '0.82rem', fontWeight: 500, color: active ? 'primary.dark' : 'text.primary' }}
          noWrap
        >
          {tutor.tutor_name}
        </Typography>
        <Typography
          sx={{ fontSize: '0.72rem', color: active ? 'primary.main' : 'text.secondary' }}
          noWrap
        >
          {meta.expertise}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3, mt: 0.25 }}>
          <StarIcon sx={{ fontSize: 11, color: '#BA7517' }} />
          <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>{meta.rating}</Typography>
        </Box>
      </Box>

      <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
        <Typography sx={{ fontSize: '0.82rem', fontWeight: 500 }}>
          ${rate}
          <Typography component="span" sx={{ fontSize: '0.68rem', color: 'text.secondary' }}>
            {' '}
            /hr
          </Typography>
        </Typography>
        {active && <CheckCircleIcon color="primary" sx={{ fontSize: 15, display: 'block', ml: 'auto', mt: 0.25 }} />}
      </Box>
    </Box>
  );
};

/** Pricing tier cards */
const PricingTiers = ({ selectedTier }) => {
  if (!selectedTier) return null;
  const tiers = [
    { label: 'Standard', amount: selectedTier.session_amount, note: 'Your selection', featured: true },
    { label: 'Premium', amount: +(selectedTier.session_amount * 1.2).toFixed(2), note: 'Priority support' },
    { label: 'Elite', amount: +(selectedTier.session_amount * 1.5).toFixed(2), note: 'Dedicated prep' },
  ];
  return (
    <Stack direction="row" spacing={0.75}>
      {tiers.map(({ label, amount, note, featured }) => (
        <Paper
          key={label}
          variant="outlined"
          sx={{
            flex: 1,
            p: 1.25,
            borderRadius: 2,
            textAlign: 'center',
            borderColor: featured ? 'primary.main' : 'divider',
            bgcolor: featured ? (t) => alpha(t.palette.primary.main, 0.05) : 'background.default',
          }}
        >
          <Typography sx={{ fontSize: '0.68rem', color: 'text.secondary', mb: 0.25 }}>{label}</Typography>
          <Typography sx={{ fontSize: '1.05rem', fontWeight: 500, color: featured ? 'primary.dark' : 'text.primary' }}>
            ${Math.round(amount)}
          </Typography>
          <Typography sx={{ fontSize: '0.65rem', color: featured ? 'primary.main' : 'text.disabled', mt: 0.25 }}>
            {note}
          </Typography>
        </Paper>
      ))}
    </Stack>
  );
};

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
const DiscoverTutors = () => {
  const navigate = useNavigate();
  const { showError, showSuccess } = useNotification();

  const [loading, setLoading] = useState(true);
  const [slots, setSlots] = useState([]);
  const [selectedTutorId, setSelectedTutorId] = useState('');
  const [selectedSlotId, setSelectedSlotId] = useState(0);
  const [selectedDuration, setSelectedDuration] = useState(60);
  const [subjectModule, setSubjectModule] = useState('');
  const [pricingProfile, setPricingProfile] = useState(null);
  const [pricingLoading, setPricingLoading] = useState(false);
  const [bookingSubmitting, setBookingSubmitting] = useState(false);

  // Load slots on mount
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const rows = await sessionService.listBookableSlots({ limit: 240 });
        if (!mounted) return;
        const apiRows = Array.isArray(rows) ? rows : [];
        setSlots(
          apiRows.length > 0
            ? apiRows
            : USE_VIRTUAL_TUTOR_DATA_WHEN_EMPTY
            ? VIRTUAL_TUTOR_SLOTS
            : []
        );
      } catch {
        if (mounted)
          setSlots(USE_VIRTUAL_TUTOR_DATA_WHEN_EMPTY ? VIRTUAL_TUTOR_SLOTS : []);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  // Derive tutor list from slots — stable shape, slot IDs normalised to Number at ingestion
  const tutors = useMemo(() => {
    const map = new Map();
    slots.forEach((slot) => {
      const tutorId = String(slot?.teacher_id || '').trim();
      if (!tutorId) return;
      const current = map.get(tutorId) ?? {
        tutor_id: tutorId,
        tutor_name: formatTutorName(slot),
        avatar_url: slot?.teacher_avatar_url || '',
        slot_count: 0,
        next_start_at: slot?.start_at || null,
        timezone: slot?.timezone || 'UTC',
        slots: [],
      };
      current.slot_count += 1;
      // Normalise id to Number once at ingestion
      current.slots.push({ ...slot, id: Number(slot.id) });
      const candidate = new Date(slot?.start_at || 0).getTime();
      const current_t = new Date(current.next_start_at || 0).getTime();
      if (!current.next_start_at || (candidate > 0 && candidate < current_t)) {
        current.next_start_at = slot?.start_at;
      }
      map.set(tutorId, current);
    });

    return Array.from(map.values())
      .map((t) => ({
        ...t,
        slots: [...t.slots].sort(
          (a, b) => new Date(a?.start_at || 0).getTime() - new Date(b?.start_at || 0).getTime()
        ),
      }))
      .sort((a, b) => b.slot_count - a.slot_count);
  }, [slots]);

  const selectedTutor = useMemo(
    () => tutors.find((t) => t.tutor_id === selectedTutorId) ?? null,
    [tutors, selectedTutorId]
  );

  const selectedSlot = useMemo(() => {
    if (!selectedTutor) return null;
    return selectedTutor.slots.find((s) => s.id === selectedSlotId) ?? null;
  }, [selectedTutor, selectedSlotId]);

  const selectedTier = useMemo(() => {
    const tiers = Array.isArray(pricingProfile?.pricing_tiers) ? pricingProfile.pricing_tiers : [];
    return tiers.find((t) => t.duration_minutes === selectedDuration) ?? null;
  }, [pricingProfile, selectedDuration]);

  // Auto-select first tutor
  useEffect(() => {
    if (!tutors.length || selectedTutorId) return;
    setSelectedTutorId(tutors[0].tutor_id);
  }, [tutors, selectedTutorId]);

  // Auto-select first slot when tutor changes
  useEffect(() => {
    if (!selectedTutor) return;
    const firstId = selectedTutor.slots[0]?.id ?? 0;
    if (!firstId) return;
    if (selectedSlotId && selectedTutor.slots.some((s) => s.id === selectedSlotId)) return;
    setSelectedSlotId(firstId);
  }, [selectedTutor, selectedSlotId]);

  // Load pricing when tutor changes
  useEffect(() => {
    if (!selectedTutorId) return;
    let mounted = true;
    const loadPricing = async () => {
      setPricingLoading(true);
      try {
        if (selectedTutorId.startsWith('virtual-')) {
          if (mounted) setPricingProfile(getVirtualProfile(selectedTutorId));
          return;
        }
        const profile = await sessionService.getTutorPricingProfile(selectedTutorId);
        if (mounted) setPricingProfile(profile ?? null);
      } catch {
        if (mounted) {
          setPricingProfile(
            selectedTutorId.startsWith('virtual-') ? getVirtualProfile(selectedTutorId) : null
          );
        }
      } finally {
        if (mounted) setPricingLoading(false);
      }
    };
    loadPricing();
    return () => { mounted = false; };
  }, [selectedTutorId]);

  const handleBookSession = async () => {
    if (!selectedSlot?.id) {
      showError('Please choose a tutor and a time slot first.');
      return;
    }
    setBookingSubmitting(true);
    try {
      if (selectedTutorId.startsWith('virtual-')) {
        showSuccess('Virtual booking preview created (demo data).');
        navigate('/dashboard/sessions');
        return;
      }
      const payload = {
        slot_id: selectedSlot.id,
        note: subjectModule ? `Subject/Module: ${subjectModule}` : undefined,
        duration_minutes: selectedDuration,
        session_mode: 'remote',
        subject_module: subjectModule || null,
        pricing_snapshot: selectedTier
          ? {
              duration_minutes: selectedTier.duration_minutes,
              session_amount: selectedTier.session_amount,
              platform_fee: selectedTier.platform_fee,
              total_amount: selectedTier.total_amount,
              currency: selectedTier.currency,
            }
          : {},
        booking_metadata: { source: 'discover_tutors_wizard' },
      };
      const booking = await sessionService.createBooking(payload);
      const bookingId = Number(booking?.booking_id || booking?.id || 0);
      showSuccess('Booking request sent. Waiting tutor confirmation.');
      navigate(
        bookingId > 0
          ? `/dashboard/sessions?booking=${bookingId}&chat=1`
          : '/dashboard/sessions'
      );
    } catch (error) {
      showError(
        error?.response?.data?.message || error?.message || 'Failed to book the session.'
      );
    } finally {
      setBookingSubmitting(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <DiscoveryHeader />

      <Box sx={{ maxWidth: 1280, mx: 'auto', px: { xs: 2, md: 3 }, py: { xs: 3, md: 4 } }}>

        {/* Breadcrumb */}
        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 1.5 }}>
          {['Home', 'Discover', 'Book a session'].map((crumb, i, arr) => (
            <Stack key={crumb} direction="row" spacing={0.5} alignItems="center">
              <Typography variant="caption" color={i === arr.length - 1 ? 'text.secondary' : 'text.disabled'}>
                {crumb}
              </Typography>
              {i < arr.length - 1 && (
                <Typography variant="caption" color="text.disabled">›</Typography>
              )}
            </Stack>
          ))}
        </Stack>

        {/* Page heading */}
        <Typography variant="h4" sx={{ fontWeight: 500, mb: 0.5, letterSpacing: '-0.01em' }}>
          Book a private tutoring session
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 2.5, fontSize: '0.9rem' }}>
          Choose a tutor, pick a time that works for you, and get started.
        </Typography>

        {/* Stepper */}
        <StepperBar />

        {/* Loading */}
        {loading && (
          <Stack alignItems="center" sx={{ py: 10 }}>
            <CircularProgress size={28} thickness={3} />
          </Stack>
        )}

        {/* Empty state */}
        {!loading && !tutors.length && (
          <Paper sx={{ ...cardSx, p: 3 }}>
            <Typography sx={{ fontWeight: 500, mb: 0.5 }}>No tutors available right now</Typography>
            <Typography color="text.secondary" sx={{ fontSize: '0.875rem' }}>
              Please check back soon — new slots are published regularly.
            </Typography>
          </Paper>
        )}

        {/* Main layout */}
        {!loading && tutors.length > 0 && (
          <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.5} alignItems="flex-start">

            {/* ── Left: tutor list ── */}
            <Paper sx={{ ...cardSx, width: { xs: '100%', lg: 280 }, flexShrink: 0 }}>
              <Box sx={{ px: 1.5, py: 1.25, borderBottom: '0.5px solid', borderColor: 'divider' }}>
                <Typography sx={sectionLabelSx}>Tutors</Typography>
              </Box>
              <Stack spacing={0.75} sx={{ p: 1.25 }}>
                {tutors.map((tutor) => (
                  <TutorRow
                    key={tutor.tutor_id}
                    tutor={tutor}
                    active={tutor.tutor_id === selectedTutorId}
                    pricingProfile={pricingProfile}
                    onSelect={setSelectedTutorId}
                  />
                ))}
              </Stack>
            </Paper>

            {/* ── Centre: session setup ── */}
            <Paper sx={{ ...cardSx, flex: 1 }}>
              <Box sx={{ px: 1.75, py: 1.25, borderBottom: '0.5px solid', borderColor: 'divider' }}>
                <Typography sx={sectionLabelSx}>Session setup</Typography>
              </Box>

              <Box sx={{ p: 1.75 }}>
                {!selectedTutor ? (
                  <Typography color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                    Pick a tutor to continue.
                  </Typography>
                ) : (
                  <>
                    {/* Demo badge */}
                    {selectedTutorId.startsWith('virtual-') && (
                      <Chip
                        size="small"
                        label="Demo data"
                        color="warning"
                        variant="outlined"
                        sx={{ mb: 1.5, fontSize: '0.7rem', height: 22 }}
                      />
                    )}

                    {/* Tutor spotlight */}
                    <Paper
                      variant="outlined"
                      sx={{ p: 1.5, borderRadius: 2, mb: 1.75, borderColor: 'divider' }}
                    >
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar
                          src={selectedTutor.avatar_url}
                          sx={{ width: 46, height: 46 }}
                          imgProps={{ loading: 'lazy' }}
                        >
                          {String(selectedTutor.tutor_name || '?').charAt(0)}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Typography sx={{ fontWeight: 500, fontSize: '0.9rem' }}>
                              {selectedTutor.tutor_name}
                            </Typography>
                            <Stack direction="row" spacing={0.25} alignItems="center">
                              <StarIcon sx={{ fontSize: 12, color: '#BA7517' }} />
                              <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                                {getTutorMeta(selectedTutor.tutor_id).rating}
                              </Typography>
                            </Stack>
                          </Stack>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: 'block', mt: 0.25 }}
                          >
                            {getTutorMeta(selectedTutor.tutor_id).topics}
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                          <Typography sx={{ fontSize: '1.4rem', fontWeight: 500, lineHeight: 1 }}>
                            ${pricingProfile?.base_rate_per_hour ??
                              VIRTUAL_PRICING[selectedTutor.tutor_id]?.base_rate_per_hour ??
                              24}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">/ hr</Typography>
                        </Box>
                      </Stack>

                      {/* Next available */}
                      <Stack
                        direction="row"
                        spacing={0.75}
                        alignItems="center"
                        sx={{
                          mt: 1.25,
                          pt: 1,
                          borderTop: '0.5px solid',
                          borderColor: 'divider',
                          fontSize: '0.78rem',
                          color: 'text.secondary',
                        }}
                      >
                        <CalendarTodayIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                        <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary' }}>
                          Next available:{' '}
                          <Box component="span" sx={{ fontWeight: 500, color: 'text.primary' }}>
                            {selectedTutor.next_start_at
                              ? formatDateTime(selectedTutor.next_start_at)
                              : 'TBD'}
                          </Box>
                        </Typography>
                      </Stack>
                    </Paper>

                    {/* Time slots */}
                    <Typography sx={sectionLabelSx}>Available slots</Typography>
                    <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap" sx={{ mb: 1.75 }}>
                      {selectedTutor.slots.slice(0, 12).map((slot) => {
                        const active = slot.id === selectedSlotId;
                        return (
                          <Button
                            key={slot.id}
                            size="small"
                            onClick={() => setSelectedSlotId(slot.id)}
                            sx={(t) => chipBtnSx(active, t)}
                          >
                            {formatTime(slot.start_at)}
                          </Button>
                        );
                      })}
                    </Stack>

                    {/* Duration */}
                    <Typography sx={sectionLabelSx}>Duration</Typography>
                    <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap" sx={{ mb: 1.75 }}>
                      {DURATIONS.map((d) => {
                        const active = d === selectedDuration;
                        return (
                          <Button
                            key={d}
                            size="small"
                            onClick={() => setSelectedDuration(d)}
                            sx={(t) => ({ ...chipBtnSx(active, t), minWidth: 80 })}
                          >
                            {d} min
                          </Button>
                        );
                      })}
                    </Stack>

                    {/* Subject */}
                    <Typography sx={sectionLabelSx}>Subject or module</Typography>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="e.g. Organic chemistry reactions"
                      value={subjectModule}
                      onChange={(e) => setSubjectModule(e.target.value)}
                      sx={{
                        mb: 1.75,
                        '& .MuiOutlinedInput-root': {
                          fontSize: '0.85rem',
                          borderRadius: 2,
                        },
                      }}
                    />

                    {/* Session mode */}
                    <Typography sx={sectionLabelSx}>Session mode</Typography>
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      sx={{
                        mb: 1.75,
                        px: 1.25,
                        py: 0.875,
                        border: '0.5px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                      }}
                    >
                      <VideocamIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
                      <Typography sx={{ fontSize: '0.82rem', color: 'text.secondary', flex: 1 }}>
                        Remote session
                      </Typography>
                      <Chip
                        label="Included"
                        size="small"
                        color="success"
                        variant="outlined"
                        sx={{ fontSize: '0.68rem', height: 20 }}
                      />
                    </Stack>

                    {/* Pricing tiers */}
                    <Typography sx={sectionLabelSx}>Pricing overview</Typography>
                    {pricingLoading ? (
                      <CircularProgress size={16} thickness={3} />
                    ) : (
                      <PricingTiers selectedTier={selectedTier} />
                    )}
                  </>
                )}
              </Box>
            </Paper>

            {/* ── Right: summary ── */}
            <Paper sx={{ ...cardSx, width: { xs: '100%', lg: 250 }, flexShrink: 0 }}>
              <Box sx={{ px: 1.5, py: 1.25, borderBottom: '0.5px solid', borderColor: 'divider' }}>
                <Typography sx={sectionLabelSx}>Summary</Typography>
              </Box>

              <Box sx={{ p: 1.5 }}>
                {!selectedTutor ? (
                  <Typography color="text.secondary" sx={{ fontSize: '0.82rem' }}>
                    Choose a tutor to see booking details.
                  </Typography>
                ) : (
                  <Stack spacing={0}>

                    {/* Tutor identity */}
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.25 }}>
                      <Avatar
                        src={selectedTutor.avatar_url}
                        sx={{ width: 32, height: 32 }}
                        imgProps={{ loading: 'lazy' }}
                      >
                        {String(selectedTutor.tutor_name || '?').charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography sx={{ fontSize: '0.82rem', fontWeight: 500 }}>
                          {selectedTutor.tutor_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {getTutorMeta(selectedTutor.tutor_id).expertise}
                        </Typography>
                      </Box>
                    </Stack>

                    <Divider sx={{ mb: 1.25 }} />

                    {/* Meta rows */}
                    {[
                      {
                        icon: <ScheduleIcon sx={{ fontSize: 14, color: 'text.disabled' }} />,
                        text: selectedSlot?.start_at
                          ? formatDateTime(selectedSlot.start_at)
                          : 'No slot selected',
                      },
                      {
                        icon: <AccessTimeIcon sx={{ fontSize: 14, color: 'text.disabled' }} />,
                        text: `${selectedDuration} minutes`,
                      },
                      {
                        icon: <VideocamIcon sx={{ fontSize: 14, color: 'text.disabled' }} />,
                        text: 'Remote',
                      },
                      ...(subjectModule
                        ? [{ icon: null, text: `Subject: ${subjectModule}` }]
                        : []),
                    ].map(({ icon, text }, i) => (
                      <Stack
                        key={i}
                        direction="row"
                        spacing={0.75}
                        alignItems="flex-start"
                        sx={{ mb: 0.875 }}
                      >
                        {icon && <Box sx={{ mt: 0.1, flexShrink: 0 }}>{icon}</Box>}
                        <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary', lineHeight: 1.4 }}>
                          {text}
                        </Typography>
                      </Stack>
                    ))}

                    <Divider sx={{ my: 1.25 }} />

                    {/* Pricing breakdown */}
                    {pricingLoading ? (
                      <Stack alignItems="center" sx={{ py: 0.75 }}>
                        <CircularProgress size={16} thickness={3} />
                      </Stack>
                    ) : selectedTier ? (
                      <>
                        {[
                          { label: 'Session fee', value: `$${selectedTier.session_amount.toFixed(2)}` },
                          { label: 'Platform fee', value: `$${selectedTier.platform_fee.toFixed(2)}` },
                        ].map(({ label, value }) => (
                          <Stack key={label} direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                            <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary' }}>{label}</Typography>
                            <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary' }}>{value}</Typography>
                          </Stack>
                        ))}
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          sx={{ mt: 0.75, pt: 1, borderTop: '0.5px solid', borderColor: 'divider' }}
                        >
                          <Typography sx={{ fontSize: '0.85rem', fontWeight: 500 }}>Total</Typography>
                          <Typography sx={{ fontSize: '0.85rem', fontWeight: 500 }}>
                            ${selectedTier.total_amount.toFixed(2)}{' '}
                            <Typography component="span" sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
                              {selectedTier.currency}
                            </Typography>
                          </Typography>
                        </Stack>
                      </>
                    ) : (
                      <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary' }}>
                        Default pricing will apply.
                      </Typography>
                    )}

                    {/* CTA */}
                    <Button
                      fullWidth
                      variant="contained"
                      endIcon={bookingSubmitting ? null : <ArrowForwardIcon />}
                      onClick={handleBookSession}
                      disabled={!selectedSlot || bookingSubmitting}
                      disableElevation
                      sx={{
                        mt: 1.75,
                        py: 1,
                        textTransform: 'none',
                        borderRadius: 2,
                        fontWeight: 500,
                        fontSize: '0.85rem',
                        bgcolor: 'primary.main',
                        '&:hover': { bgcolor: 'primary.dark' },
                      }}
                    >
                      {bookingSubmitting ? 'Booking…' : 'Confirm booking'}
                    </Button>

                    <Stack
                      direction="row"
                      spacing={0.5}
                      alignItems="center"
                      justifyContent="center"
                      sx={{ mt: 1 }}
                    >
                      <ShieldIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
                      <Typography variant="caption" color="text.disabled">
                        Secure · cancel anytime
                      </Typography>
                    </Stack>
                  </Stack>
                )}
              </Box>
            </Paper>
          </Stack>
        )}

        {/* Trust strip */}
        {!loading && tutors.length > 0 && (
          <Paper
            variant="outlined"
            sx={{ mt: 1.5, p: 1.5, borderRadius: 2, borderColor: 'divider' }}
          >
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={2}
              divider={
                <Divider
                  orientation="vertical"
                  flexItem
                  sx={{ display: { xs: 'none', md: 'block' } }}
                />
              }
            >
              {[
                {
                  icon: <ScheduleIcon color="primary" sx={{ fontSize: 18 }} />,
                  title: 'Flexible scheduling',
                  sub: 'Book sessions that fit your timetable',
                },
                {
                  icon: <VerifiedUserIcon color="primary" sx={{ fontSize: 18 }} />,
                  title: 'Safe & secure',
                  sub: 'Protected payments and data',
                },
              ].map(({ icon, title, sub }) => (
                <Stack key={title} direction="row" spacing={1.25} alignItems="center" sx={{ flex: 1 }}>
                  {icon}
                  <Box>
                    <Typography sx={{ fontSize: '0.82rem', fontWeight: 500 }}>{title}</Typography>
                    <Typography variant="caption" color="text.secondary">{sub}</Typography>
                  </Box>
                </Stack>
              ))}
            </Stack>
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default DiscoverTutors;
