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
import CheckCircle from '@mui/icons-material/CheckCircle';
import AccessTime from '@mui/icons-material/AccessTime';
import School from '@mui/icons-material/School';
import Schedule from '@mui/icons-material/Schedule';
import Videocam from '@mui/icons-material/Videocam';
import ArrowForward from '@mui/icons-material/ArrowForward';
import Star from '@mui/icons-material/Star';
import Chat from '@mui/icons-material/Chat';
import VerifiedUser from '@mui/icons-material/VerifiedUser';
import { useNavigate } from 'react-router-dom';
import DiscoveryHeader from '@/features/discover/components/DiscoveryHeader';
import sessionService from '@/services/sessionService';
import { useNotification } from '@/shared/components/ui';

const formatTutorName = (slot) => {
  const name = String(slot?.teacher_name || '').trim();
  return name || 'Tutor';
};

const formatTime = (value) => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const formatDateTime = (value) => new Date(value).toLocaleString();

const STEPS = ['Choose Tutor', 'Choose Time', 'Session Details', 'Confirm'];
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

const VIRTUAL_PRICING = {
  'virtual-teacher-rohan': { base_rate_per_hour: 28, currency: 'USD' },
  'virtual-teacher-maya': { base_rate_per_hour: 25, currency: 'USD' },
  'virtual-contributor-arjun': { base_rate_per_hour: 22, currency: 'USD' },
  'virtual-contributor-sara': { base_rate_per_hour: 20, currency: 'USD' },
};

const VIRTUAL_TUTOR_META = {
  'virtual-teacher-rohan': { rating: 4.8, expertise: 'Chemistry Expert', topics: 'Organic Chemistry, Chemical Reactions, Grade 9-12' },
  'virtual-teacher-maya': { rating: 4.9, expertise: 'Math Specialist', topics: 'Algebra, Calculus, Integration, Grade 8-12' },
  'virtual-contributor-arjun': { rating: 4.6, expertise: 'Python Programming', topics: 'Data Structures, Algorithms, CS Prep' },
  'virtual-contributor-sara': { rating: 4.9, expertise: 'English Language', topics: 'Grammar, Writing, Speaking, IELTS' },
};

const getTutorMeta = (tutorId) => VIRTUAL_TUTOR_META[tutorId] || { rating: 4.7, expertise: 'Academic Tutor', topics: 'Module guidance and session support' };

const buildVirtualPricingProfile = (tutorId) => {
  const entry = VIRTUAL_PRICING[tutorId] || { base_rate_per_hour: 24, currency: 'USD' };
  const durations = [30, 60, 90, 120];
  const tiers = durations.map((duration) => {
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
  return {
    tutor_id: tutorId,
    base_rate_per_hour: entry.base_rate_per_hour,
    currency: entry.currency,
    pricing_tiers: tiers,
  };
};

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

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      try {
        const rows = await sessionService.listBookableSlots({ limit: 240 });
        if (mounted) {
          const apiRows = Array.isArray(rows) ? rows : [];
          setSlots(apiRows.length > 0 ? apiRows : (USE_VIRTUAL_TUTOR_DATA_WHEN_EMPTY ? VIRTUAL_TUTOR_SLOTS : []));
        }
      } catch {
        if (mounted) setSlots(USE_VIRTUAL_TUTOR_DATA_WHEN_EMPTY ? VIRTUAL_TUTOR_SLOTS : []);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const tutors = useMemo(() => {
    const map = new Map();

    slots.forEach((slot) => {
      const tutorId = String(slot?.teacher_id || '').trim();
      if (!tutorId) return;

      const current = map.get(tutorId) || {
        tutor_id: tutorId,
        tutor_name: formatTutorName(slot),
        avatar_url: slot?.teacher_avatar_url || '',
        slot_count: 0,
        next_start_at: slot?.start_at || null,
        timezone: slot?.timezone || 'UTC',
        slots: [],
      };

      current.slot_count += 1;
      current.slots.push(slot);
      const candidateTime = new Date(slot?.start_at || 0).getTime();
      const currentTime = new Date(current.next_start_at || 0).getTime();
      if (!current.next_start_at || (candidateTime > 0 && candidateTime < currentTime)) {
        current.next_start_at = slot?.start_at || current.next_start_at;
      }

      map.set(tutorId, current);
    });

    return Array.from(map.values())
      .map((tutor) => ({
        ...tutor,
        slots: [...tutor.slots].sort(
          (a, b) => new Date(a?.start_at || 0).getTime() - new Date(b?.start_at || 0).getTime()
        ),
      }))
      .sort((a, b) => b.slot_count - a.slot_count);
  }, [slots]);

  const selectedTutor = useMemo(
    () => tutors.find((item) => item.tutor_id === selectedTutorId) || null,
    [tutors, selectedTutorId]
  );

  const selectedSlot = useMemo(() => {
    if (!selectedTutor) return null;
    return selectedTutor.slots.find((slot) => Number(slot.id) === Number(selectedSlotId)) || null;
  }, [selectedTutor, selectedSlotId]);

  const selectedTier = useMemo(() => {
    const tiers = Array.isArray(pricingProfile?.pricing_tiers) ? pricingProfile.pricing_tiers : [];
    return tiers.find((item) => Number(item.duration_minutes) === Number(selectedDuration)) || null;
  }, [pricingProfile, selectedDuration]);

  useEffect(() => {
    if (!tutors.length) return;
    if (selectedTutorId) return;
    setSelectedTutorId(tutors[0].tutor_id);
  }, [tutors, selectedTutorId]);

  useEffect(() => {
    if (!selectedTutor) return;
    const firstSlotId = Number(selectedTutor.slots?.[0]?.id || 0);
    if (!firstSlotId) return;
    if (selectedSlotId && selectedTutor.slots.some((slot) => Number(slot.id) === Number(selectedSlotId))) return;
    setSelectedSlotId(firstSlotId);
  }, [selectedTutor, selectedSlotId]);

  useEffect(() => {
    if (!selectedTutorId) return;
    let mounted = true;

    const loadPricing = async () => {
      setPricingLoading(true);
      try {
        if (String(selectedTutorId).startsWith('virtual-')) {
          if (mounted) setPricingProfile(buildVirtualPricingProfile(selectedTutorId));
          return;
        }
        const profile = await sessionService.getTutorPricingProfile(selectedTutorId);
        if (mounted) setPricingProfile(profile || null);
      } catch {
        if (mounted) {
          if (String(selectedTutorId).startsWith('virtual-')) {
            setPricingProfile(buildVirtualPricingProfile(selectedTutorId));
          } else {
            setPricingProfile(null);
          }
        }
      } finally {
        if (mounted) setPricingLoading(false);
      }
    };

    loadPricing();
    return () => {
      mounted = false;
    };
  }, [selectedTutorId]);

  const handleBookSession = async () => {
    if (!selectedSlot?.id) {
      showError('Please choose a tutor and a slot first.');
      return;
    }
    setBookingSubmitting(true);
    try {
      if (String(selectedTutorId).startsWith('virtual-')) {
        showSuccess('Virtual booking preview created (demo data).');
        navigate('/dashboard/sessions');
        return;
      }

      const payload = {
        slot_id: Number(selectedSlot.id),
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
        booking_metadata: {
          source: 'discover_tutors_wizard',
        },
      };

      const booking = await sessionService.createBooking(payload);
      const bookingId = Number(booking?.booking_id || booking?.id || 0);
      showSuccess('Session booked successfully.');
      if (bookingId > 0) {
        navigate(`/dashboard/sessions?booking=${bookingId}&chat=1`);
      } else {
        navigate('/dashboard/sessions');
      }
    } catch (error) {
      showError(error?.response?.data?.message || error?.message || 'Failed to book the session.');
    } finally {
      setBookingSubmitting(false);
    }
  };

  const durations = [30, 60, 90, 120];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <DiscoveryHeader />

      <Box sx={{ maxWidth: 1280, mx: 'auto', px: { xs: 2, md: 3 }, py: { xs: 3, md: 4 } }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.6 }}>
          Home / Find a Tutor / Book a Session
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 900, mb: 0.6, letterSpacing: '-0.02em' }}>
          Book a Private Tutoring Session
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Find the perfect tutor and schedule a session that fits your goals and availability.
        </Typography>

        {loading ? (
          <Stack alignItems="center" sx={{ py: 8 }}>
            <CircularProgress />
          </Stack>
        ) : !tutors.length ? (
          <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Typography sx={{ fontWeight: 700, mb: 0.6 }}>No tutors available right now</Typography>
            <Typography color="text.secondary">Please check again soon as new slots are published.</Typography>
          </Paper>
        ) : (
          <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2} alignItems="stretch">
            <Paper sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider', width: { xs: '100%', lg: 330 }, flexShrink: 0, boxShadow: '0 10px 30px rgba(15,23,42,0.04)' }}>
              <Typography sx={{ fontWeight: 800, mb: 1.2 }}>Select Your Tutor</Typography>
              <Stack spacing={1}>
                {tutors.map((tutor) => {
                  const active = tutor.tutor_id === selectedTutorId;
                  const meta = getTutorMeta(tutor.tutor_id);
                  const rate = Number(pricingProfile?.tutor_id === tutor.tutor_id ? pricingProfile?.base_rate_per_hour : (VIRTUAL_PRICING[tutor.tutor_id]?.base_rate_per_hour || 24));
                  return (
                    <Box
                      key={tutor.tutor_id}
                      onClick={() => setSelectedTutorId(tutor.tutor_id)}
                      sx={(theme) => ({
                        p: 1.3,
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: active ? theme.palette.primary.main : theme.palette.divider,
                        bgcolor: active ? alpha(theme.palette.primary.main, 0.07) : 'transparent',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          borderColor: theme.palette.primary.main,
                          bgcolor: alpha(theme.palette.primary.main, 0.05),
                        },
                      })}
                    >
                      <Stack direction="row" alignItems="center" spacing={1.1}>
                        <Avatar src={tutor.avatar_url} sx={{ width: 42, height: 42 }}>
                          {String(tutor.tutor_name || '?').charAt(0)}
                        </Avatar>
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Typography sx={{ fontWeight: 700 }} noWrap>{tutor.tutor_name}</Typography>
                          <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 700 }} noWrap>
                            {meta.expertise} · <Star sx={{ fontSize: 12, verticalAlign: 'text-top' }} /> {meta.rating}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                            {meta.topics}
                          </Typography>
                        </Box>
                        <Typography sx={{ fontWeight: 800, fontSize: '0.95rem' }}>${rate}<Typography component="span" variant="caption" color="text.secondary"> /hr</Typography></Typography>
                        {active ? <CheckCircle color="primary" sx={{ fontSize: 18 }} /> : null}
                      </Stack>
                    </Box>
                  );
                })}
              </Stack>
            </Paper>

            <Paper sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider', flex: 1, boxShadow: '0 10px 30px rgba(15,23,42,0.04)' }}>
              <Stack direction="row" alignItems="center" spacing={0.6} sx={{ mb: 2, overflowX: 'auto', pb: 0.4 }}>
                {STEPS.map((label, i) => (
                  <Stack key={label} direction="row" alignItems="center" spacing={0.6}>
                    <Chip
                      label={`${i + 1}`}
                      size="small"
                      color={i <= 2 ? 'primary' : 'default'}
                      sx={{ fontWeight: 800, minWidth: 26 }}
                    />
                    <Typography variant="caption" sx={{ fontWeight: 700, whiteSpace: 'nowrap', color: i <= 2 ? 'primary.main' : 'text.secondary' }}>
                      {label}
                    </Typography>
                    {i < STEPS.length - 1 ? <ArrowForward sx={{ fontSize: 14, color: 'text.disabled' }} /> : null}
                  </Stack>
                ))}
              </Stack>

              {!selectedTutor ? (
                <Typography color="text.secondary">Pick a tutor to continue.</Typography>
              ) : (
                <>
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
                    <Paper variant="outlined" sx={{ p: 1.4, borderRadius: 2, flex: 1 }}>
                      <Stack direction="row" spacing={1.2} alignItems="center">
                        <Avatar src={selectedTutor.avatar_url} sx={{ width: 48, height: 48 }}>
                          {String(selectedTutor.tutor_name || '?').charAt(0)}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography sx={{ fontWeight: 800 }}>{selectedTutor.tutor_name} <Typography component="span" variant="caption" color="primary.main"><Star sx={{ fontSize: 12, verticalAlign: 'text-top' }} /> {getTutorMeta(selectedTutor.tutor_id).rating}</Typography></Typography>
                          <Typography variant="caption" color="text.secondary">{getTutorMeta(selectedTutor.tutor_id).expertise}</Typography>
                        </Box>
                        <Typography sx={{ fontWeight: 900, fontSize: '1.8rem' }}>${Number(pricingProfile?.base_rate_per_hour || VIRTUAL_PRICING[selectedTutor.tutor_id]?.base_rate_per_hour || 24)}<Typography component="span" variant="body2" color="text.secondary"> /hr</Typography></Typography>
                      </Stack>
                      <Stack direction="row" spacing={1} sx={{ mt: 0.8 }}>
                        <Chip size="small" icon={<Chat />} label="Message Tutor" />
                        <Chip size="small" icon={<CheckCircle />} label="Typically replies quickly" color="success" variant="outlined" />
                      </Stack>
                    </Paper>
                    <Paper variant="outlined" sx={{ p: 1.3, borderRadius: 2, minWidth: 190 }}>
                      <Typography variant="caption" color="text.secondary">Next available</Typography>
                      <Typography sx={{ fontWeight: 700 }}>
                        {selectedTutor.next_start_at ? formatDateTime(selectedTutor.next_start_at) : 'TBD'}
                      </Typography>
                    </Paper>
                  </Stack>

                  <Typography sx={{ fontWeight: 700, mb: 1 }}>Available Time Slots</Typography>
                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mb: 2 }}>
                    {selectedTutor.slots.slice(0, 12).map((slot) => {
                      const active = Number(slot.id) === Number(selectedSlotId);
                      return (
                        <Button
                          key={slot.id}
                          size="small"
                          variant={active ? 'contained' : 'outlined'}
                          onClick={() => setSelectedSlotId(Number(slot.id))}
                          sx={{ textTransform: 'none', borderRadius: 2 }}
                        >
                          {formatTime(slot.start_at)}
                        </Button>
                      );
                    })}
                  </Stack>

                  <Typography sx={{ fontWeight: 700, mb: 1 }}>Session Duration</Typography>
                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mb: 2 }}>
                    {durations.map((duration) => {
                      const active = duration === selectedDuration;
                      return (
                        <Button
                          key={duration}
                          size="small"
                          variant={active ? 'contained' : 'outlined'}
                          onClick={() => setSelectedDuration(duration)}
                          sx={{ textTransform: 'none', borderRadius: 2, minWidth: 96 }}
                        >
                          {duration} mins
                        </Button>
                      );
                    })}
                  </Stack>

                  <TextField
                    fullWidth
                    size="small"
                    label="Subject / Module"
                    placeholder="e.g. Chemical Reactions"
                    value={subjectModule}
                    onChange={(event) => setSubjectModule(event.target.value)}
                    sx={{ mb: 1.5 }}
                  />
                  <Typography sx={{ fontWeight: 700, mb: 0.8 }}>Session Type</Typography>
                  <Chip icon={<Videocam />} label="Remote" color="primary" variant="outlined" sx={{ mb: 1.4 }} />

                  <Typography sx={{ fontWeight: 700, mb: 0.8 }}>Pricing Tier</Typography>
                  <Stack direction="row" spacing={1}>
                    <Paper variant="outlined" sx={{ p: 1, borderRadius: 1.5, minWidth: 96, borderColor: 'primary.main', bgcolor: (t) => alpha(t.palette.primary.main, 0.05) }}>
                      <Typography variant="caption" color="text.secondary">Standard</Typography>
                      <Typography sx={{ fontWeight: 800 }}>${Number(selectedTier?.session_amount || 0).toFixed(0)}</Typography>
                    </Paper>
                    <Paper variant="outlined" sx={{ p: 1, borderRadius: 1.5, minWidth: 96 }}>
                      <Typography variant="caption" color="text.secondary">Premium</Typography>
                      <Typography sx={{ fontWeight: 800 }}>${Number((selectedTier?.session_amount || 0) * 1.2).toFixed(0)}</Typography>
                    </Paper>
                    <Paper variant="outlined" sx={{ p: 1, borderRadius: 1.5, minWidth: 96 }}>
                      <Typography variant="caption" color="text.secondary">Elite</Typography>
                      <Typography sx={{ fontWeight: 800 }}>${Number((selectedTier?.session_amount || 0) * 1.5).toFixed(0)}</Typography>
                    </Paper>
                  </Stack>
                </>
              )}
            </Paper>

            <Paper sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider', width: { xs: '100%', lg: 320 }, flexShrink: 0, boxShadow: '0 10px 30px rgba(15,23,42,0.04)' }}>
              <Typography sx={{ fontWeight: 800, mb: 1.2 }}>Your Booking Summary</Typography>
              {selectedTutor ? (
                <Stack spacing={1.2}>
                  {String(selectedTutorId).startsWith('virtual-') ? (
                    <Chip size="small" color="info" label="Demo Tutor Data" sx={{ alignSelf: 'flex-start', fontWeight: 700 }} />
                  ) : null}
                  <Stack direction="row" spacing={1.1} alignItems="center">
                    <Avatar src={selectedTutor.avatar_url} sx={{ width: 40, height: 40 }}>
                      {String(selectedTutor.tutor_name || '?').charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography sx={{ fontWeight: 700 }}>{selectedTutor.tutor_name}</Typography>
                      <Typography variant="caption" color="text.secondary">Teacher / Contributor</Typography>
                    </Box>
                  </Stack>

                  <Divider />
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Schedule sx={{ fontSize: 18, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {selectedSlot?.start_at ? formatDateTime(selectedSlot.start_at) : 'Select a slot'}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <AccessTime sx={{ fontSize: 18, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">{selectedDuration} minutes</Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Videocam sx={{ fontSize: 18, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">Remote</Typography>
                  </Stack>
                  {subjectModule ? (
                    <Typography variant="body2" color="text.secondary">Subject: {subjectModule}</Typography>
                  ) : null}

                  <Divider />
                  {pricingLoading ? (
                    <Stack alignItems="center" sx={{ py: 1 }}><CircularProgress size={18} /></Stack>
                  ) : selectedTier ? (
                    <>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">Session fee</Typography>
                        <Typography variant="body2">${Number(selectedTier.session_amount).toFixed(2)}</Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">Platform fee</Typography>
                        <Typography variant="body2">${Number(selectedTier.platform_fee).toFixed(2)}</Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography sx={{ fontWeight: 800 }}>Total</Typography>
                        <Typography sx={{ fontWeight: 800 }}>${Number(selectedTier.total_amount).toFixed(2)} {selectedTier.currency}</Typography>
                      </Stack>
                    </>
                  ) : (
                    <Typography variant="body2" color="text.secondary">No pricing profile yet. Default pricing will apply later.</Typography>
                  )}

                  <Button
                    variant="contained"
                    endIcon={<ArrowForward />}
                    onClick={handleBookSession}
                    disabled={!selectedSlot || bookingSubmitting}
                    sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 800, mt: 1, py: 1, background: 'linear-gradient(90deg,#2563EB 0%, #7C3AED 100%)' }}
                  >
                    {bookingSubmitting ? 'Booking...' : 'Book Session'}
                  </Button>
                  <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>Secure payment. Cancel anytime.</Typography>
                </Stack>
              ) : (
                <Typography color="text.secondary">Choose a tutor to see booking details.</Typography>
              )}
            </Paper>
          </Stack>
        )}

        {!loading && tutors.length > 0 ? (
          <Paper sx={{ mt: 2, p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: '0 8px 20px rgba(15,23,42,0.03)' }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} divider={<Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' } }} />}>
              <Stack direction="row" spacing={1.2} alignItems="center" sx={{ flex: 1 }}>
                <Schedule color="primary" />
                <Box><Typography sx={{ fontWeight: 700 }}>Flexible Scheduling</Typography><Typography variant="caption" color="text.secondary">Book sessions that fit your timetable</Typography></Box>
              </Stack>
              <Stack direction="row" spacing={1.2} alignItems="center" sx={{ flex: 1 }}>
                <VerifiedUser color="primary" />
                <Box><Typography sx={{ fontWeight: 700 }}>Safe & Secure</Typography><Typography variant="caption" color="text.secondary">Secure bookings and protected data</Typography></Box>
              </Stack>
            </Stack>
          </Paper>
        ) : null}
      </Box>
    </Box>
  );
};

export default DiscoverTutors;
