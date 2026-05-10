import { useEffect, useMemo, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Paper,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import Chat from '@mui/icons-material/Chat';
import BookmarkBorder from '@mui/icons-material/BookmarkBorder';
import Verified from '@mui/icons-material/Verified';
import Star from '@mui/icons-material/Star';
import EmojiEvents from '@mui/icons-material/EmojiEvents';
import Lock from '@mui/icons-material/Lock';
import ChevronLeft from '@mui/icons-material/ChevronLeft';
import ChevronRight from '@mui/icons-material/ChevronRight';
import StarBorder from '@mui/icons-material/StarBorder';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import sessionService from '@/services/sessionService';
import DiscoveryHeader from '@/features/discover/components/DiscoveryHeader';
import { useNotification } from '@/shared/components/ui';

// ─── brand tokens ─────────────────────────────────────────────────────────────
const BRAND_BLUE = '#2563EB';
const BRAND_PURPLE = '#7C3AED';
const BRAND_GREEN = '#22C55E';
const SOFT_GREEN_BG = 'rgba(34, 197, 94, 0.14)';
const SOFT_BLUE_BG = 'rgba(37, 99, 235, 0.10)';

const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const TABS = ['Profile', 'Resources', 'Playlist', 'Booking'];
const DURATION_OPTIONS = [30, 60, 90, 120];

// ─── helpers ──────────────────────────────────────────────────────────────────
const toDateKey = (d) => new Date(d).toISOString().slice(0, 10);
const formatMonthYear = (d) => d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
const formatSlotTimeLabel = (dateValue) => {
  const date = new Date(dateValue);
  const h = date.getHours();
  const m = date.getMinutes();
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${String(hour12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${suffix}`;
};

// ─── shared sx constants ──────────────────────────────────────────────────────
const sectionLabelSx = {
  fontWeight: 700,
  fontSize: '0.92rem',
  color: 'text.primary',
  mb: 1.5,
};

const summaryRowSx = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  py: 0.55,
};

// ─────────────────────────────────────────────────────────────────────────────
const TutorBookingPageView = ({
  tutorName = 'Rohan K.',
  tutorAvatar = '',
  subject = 'Chemistry',
  experience = '6+ years experience',
  studentsCount = '4,200+',
  rating = 4.8,
  reviewCount = '1,842',
  baseRatePerHour = 25,
  currency = 'USD',
  availableDates = [],
  availableSlots = {},
  onBook = () => { },
  onMessage = () => { },
  onSave = () => { },
}) => {
  const [activeTab, setActiveTab] = useState('Booking');
  const [displayMonth, setDisplayMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('standard');
  const [durationMinutes, setDurationMinutes] = useState(60);

  // Auto-select first available date
  useEffect(() => {
    if (!selectedDate && availableDates.length) {
      const first = availableDates[0];
      setSelectedDate(first);
      const dt = new Date(first);
      setDisplayMonth(new Date(dt.getFullYear(), dt.getMonth(), 1));
    }
  }, [availableDates, selectedDate]);

  // Auto-select first time slot when date changes
  useEffect(() => {
    const slots = availableSlots[selectedDate] || [];
    setSelectedTime(slots[0] || '');
  }, [selectedDate, availableSlots]);

  const calendarCells = useMemo(() => {
    const y = displayMonth.getFullYear();
    const m = displayMonth.getMonth();
    const startWeekday = new Date(y, m, 1).getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < startWeekday; i++) cells.push(null);
    for (let day = 1; day <= daysInMonth; day++) {
      const dt = new Date(y, m, day);
      const key = toDateKey(dt);
      cells.push({ day, key });
    }
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [displayMonth]);

  const todaySlots = availableSlots[selectedDate] || [];

  const pricing = useMemo(() => {
    const sessionBase = Number(((baseRatePerHour * durationMinutes) / 60).toFixed(2));
    const premiumBase = Number((sessionBase * 1.4).toFixed(2));
    return {
      standard: { rate: baseRatePerHour, total: sessionBase },
      premium: { rate: Math.round(baseRatePerHour * 1.4), total: premiumBase },
    };
  }, [baseRatePerHour, durationMinutes]);

  const selectedPrice = pricing[selectedPlan] || pricing.standard;

  const handleSelectDate = (dateKey) => {
    setSelectedDate(dateKey);
    setSelectedTime('');
  };

  const handleBook = () => {
    onBook({
      date: selectedDate,
      time: selectedTime,
      plan: selectedPlan,
      duration: durationMinutes,
      total: selectedPrice.total,
      currency,
    });
  };

  return (
    <>
      <DiscoveryHeader />
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 3, px: { xs: 1, sm: 3, md: 6 } }}>
      <Paper elevation={1} sx={{ maxWidth: 1100, mx: 'auto', borderRadius: 3, overflow: 'hidden' }}>

        {/* ── Tutor Header ─────────────────────────────────────────────────── */}
        <Box sx={{ px: { xs: 2, sm: 4 }, pt: 3, pb: 2 }}>
          <Stack
            direction="row"
            alignItems="flex-start"
            spacing={2.5}
            justifyContent="space-between"
            flexWrap="wrap"
            gap={1}
          >
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar
                src={tutorAvatar}
                sx={{ width: 80, height: 80, fontSize: '2rem', bgcolor: BRAND_BLUE }}
              >
                {tutorName.charAt(0)}
              </Avatar>

              <Box>
                <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                  <Typography variant="h5" fontWeight={700}>
                    {tutorName}
                  </Typography>
                  <Tooltip title="Verified tutor">
                    <Verified sx={{ color: BRAND_BLUE, fontSize: 20 }} />
                  </Tooltip>
                  <Chip
                    icon={<EmojiEvents sx={{ fontSize: 15, color: '#d97706 !important' }} />}
                    label="Gold Tutor"
                    size="small"
                    sx={{
                      bgcolor: 'rgba(251, 191, 36, 0.14)',
                      color: '#92400e',
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      border: '1px solid rgba(251,191,36,0.35)',
                    }}
                  />
                </Stack>

                <Stack direction="row" alignItems="center" spacing={0.6} mt={0.4} flexWrap="wrap">
                  <Star sx={{ fontSize: 16, color: '#f59e0b' }} />
                  <Typography variant="body2" fontWeight={700}>{rating}</Typography>
                  <Typography variant="body2" color="text.secondary">/ 5</Typography>
                  <Typography variant="body2" color="text.secondary">· {reviewCount} reviews</Typography>
                  <Typography variant="body2" color="text.secondary">·</Typography>
                  <Typography variant="body2" fontWeight={600} color={BRAND_BLUE}>
                    Top 5% Tutors
                  </Typography>
                </Stack>

                <Typography variant="body2" color="text.secondary" mt={0.4}>
                  {subject} Expert &nbsp;·&nbsp; {experience} &nbsp;·&nbsp; {studentsCount} students taught
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              <Button
                variant="outlined"
                startIcon={<BookmarkBorder />}
                onClick={onSave}
                sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600 }}
              >
                Save
              </Button>
              <Button
                variant="contained"
                startIcon={<Chat />}
                onClick={onMessage}
                sx={{
                  textTransform: 'none',
                  borderRadius: 2,
                  fontWeight: 600,
                  bgcolor: BRAND_BLUE,
                  '&:hover': { bgcolor: '#1d4ed8' },
                }}
              >
                Message
              </Button>
            </Stack>
          </Stack>
        </Box>

        {/* ── Tabs ─────────────────────────────────────────────────────────── */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={activeTab}
            onChange={(_, newVal) => setActiveTab(newVal)}
            sx={{
              px: { xs: 1, sm: 3 },
              minHeight: 48,
              '& .MuiTabs-indicator': {
                backgroundColor: BRAND_BLUE,
                height: 2,
              },
              '& .MuiTabs-flexContainer': {
                gap: 0,
              },
            }}
          >
            {TABS.map((tab) => (
              <Tab
                key={tab}
                label={tab}
                value={tab}
                sx={{
                  textTransform: 'none',
                  fontWeight: activeTab === tab ? 700 : 500,
                  fontSize: '0.95rem',
                  color: activeTab === tab ? BRAND_BLUE : 'text.secondary',
                  minHeight: 48,
                  px: 2.5,
                  py: 0,
                  '&.Mui-selected': {
                    color: BRAND_BLUE,
                  },
                  '&:hover': {
                    color: 'text.primary',
                    bgcolor: 'rgba(0,0,0,0.03)',
                  },
                  transition: 'color 0.15s ease, background-color 0.15s ease',
                }}
              />
            ))}
          </Tabs>
        </Box>

        {/* ── Booking Panel ────────────────────────────────────────────────── */}
        {activeTab === 'Booking' && (
          <Box sx={{ p: { xs: 2, sm: 3 } }}>

            {/* Top 3-column row */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
                gap: 2,
                mb: 2,
              }}
            >
              {/* ── 1. Select a Date ───────────────────────────────────────── */}
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Typography sx={sectionLabelSx}>1. Select a Date</Typography>

                {/* Month nav */}
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                  <Tooltip title="Previous month">
                    <IconButton
                      size="small"
                      onClick={() =>
                        setDisplayMonth(
                          new Date(displayMonth.getFullYear(), displayMonth.getMonth() - 1, 1)
                        )
                      }
                    >
                      <ChevronLeft fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Typography variant="body2" fontWeight={700}>
                    {formatMonthYear(displayMonth)}
                  </Typography>
                  <Tooltip title="Next month">
                    <IconButton
                      size="small"
                      onClick={() =>
                        setDisplayMonth(
                          new Date(displayMonth.getFullYear(), displayMonth.getMonth() + 1, 1)
                        )
                      }
                    >
                      <ChevronRight fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>

                {/* Weekday headers */}
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', mb: 0.5 }}>
                  {WEEKDAYS.map((d) => (
                    <Typography
                      key={d}
                      variant="caption"
                      align="center"
                      sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.68rem' }}
                    >
                      {d}
                    </Typography>
                  ))}
                </Box>

                {/* Calendar days */}
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.3 }}>
                  {calendarCells.map((cell, idx) => {
                    if (!cell) return <Box key={`empty-${idx}`} />;
                    const isAvailable = availableDates.includes(cell.key);
                    const isSelected = selectedDate === cell.key;
                    return (
                      <Button
                        key={cell.key}
                        disabled={!isAvailable}
                        onClick={() => handleSelectDate(cell.key)}
                        sx={(theme) => ({
                          minWidth: 0,
                          p: 0,
                          height: 30,
                          borderRadius: '50%',
                          fontSize: '0.78rem',
                          fontWeight: isSelected ? 700 : 400,
                          color: isSelected
                            ? '#fff'
                            : isAvailable
                              ? 'text.primary'
                              : 'text.disabled',
                          bgcolor: isSelected
                            ? BRAND_BLUE
                            : isAvailable
                              ? SOFT_GREEN_BG
                              : 'transparent',
                          '&:hover': {
                            bgcolor: isSelected
                              ? '#1d4ed8'
                              : isAvailable
                                ? 'rgba(34, 197, 94, 0.22)'
                                : alpha(theme.palette.action.active, 0.04),
                          },
                          '&.Mui-disabled': { color: 'text.disabled', bgcolor: 'transparent' },
                          transition: 'all 0.15s ease',
                        })}
                      >
                        {cell.day}
                      </Button>
                    );
                  })}
                </Box>

                {/* Legend */}
                <Stack direction="row" spacing={2} mt={1.5}>
                  <Stack direction="row" alignItems="center" spacing={0.6}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: BRAND_GREEN }} />
                    <Typography variant="caption" color="text.secondary">Available</Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={0.6}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: BRAND_BLUE }} />
                    <Typography variant="caption" color="text.secondary">Selected</Typography>
                  </Stack>
                </Stack>
              </Paper>

              {/* ── 2. Choose a Time ───────────────────────────────────────── */}
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Typography sx={sectionLabelSx}>2. Choose a Time</Typography>
                <Typography variant="caption" color="text.secondary" display="block" mb={1.5}>
                  Available Time Slots
                  {selectedDate
                    ? ` (${new Date(selectedDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })})`
                    : ''}
                </Typography>

                {todaySlots.length ? (
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
                    {todaySlots.map((slot) => {
                      const active = selectedTime === slot;
                      return (
                        <Button
                          key={slot}
                          variant="outlined"
                          onClick={() => setSelectedTime(slot)}
                          sx={(theme) => ({
                            textTransform: 'none',
                            borderRadius: 1.5,
                            py: 0.8,
                            px: 0.6,
                            fontSize: '0.84rem',
                            fontWeight: active ? 700 : 600,
                            justifyContent: 'center',
                            borderColor: active ? BRAND_GREEN : 'rgba(34, 197, 94, 0.45)',
                            bgcolor: active ? 'rgba(34, 197, 94, 0.20)' : SOFT_GREEN_BG,
                            color: '#15803d',
                            '&:hover': {
                              bgcolor: active
                                ? 'rgba(34, 197, 94, 0.26)'
                                : 'rgba(34, 197, 94, 0.22)',
                              borderColor: active ? BRAND_GREEN : 'rgba(34, 197, 94, 0.72)',
                            },
                            '&.Mui-disabled': { color: 'text.disabled' },
                            transition: 'all 0.15s ease',
                          })}
                        >
                          {slot}
                        </Button>
                      );
                    })}
                  </Box>
                ) : (
                  <Paper
                    variant="outlined"
                    sx={{
                      borderStyle: 'dashed',
                      borderRadius: 2,
                      py: 2,
                      px: 1.5,
                      textAlign: 'center',
                      bgcolor: 'rgba(148, 163, 184, 0.08)',
                    }}
                  >
                    <Typography variant="body2" color="text.secondary" fontWeight={600}>
                      No time slots available for this date
                    </Typography>
                  </Paper>
                )}

                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', mt: 1.5 }}
                >
                  Time zone: GMT+2
                </Typography>
              </Paper>

              {/* ── 3. Choose Your Plan ────────────────────────────────────── */}
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Typography sx={sectionLabelSx}>3. Choose Your Plan</Typography>

                <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                  Session Duration
                </Typography>
                <Stack direction="row" spacing={1} mb={1.5} flexWrap="wrap" useFlexGap>
                  {DURATION_OPTIONS.map((minutes) => {
                    const active = durationMinutes === minutes;
                    return (
                      <Button
                        key={minutes}
                        size="small"
                        variant={active ? 'contained' : 'outlined'}
                        onClick={() => setDurationMinutes(minutes)}
                        sx={{
                          textTransform: 'none',
                          borderRadius: 2,
                          fontWeight: 700,
                          minWidth: 68,
                          bgcolor: active ? BRAND_BLUE : undefined,
                          borderColor: active ? BRAND_BLUE : 'divider',
                          '&:hover': { bgcolor: active ? '#1d4ed8' : undefined },
                        }}
                      >
                        {minutes}m
                      </Button>
                    );
                  })}
                </Stack>

                <Stack spacing={1.5}>

                  {/* Standard Card */}
                  <Paper
                    variant="outlined"
                    onClick={() => setSelectedPlan('standard')}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      cursor: 'pointer',
                      borderWidth: selectedPlan === 'standard' ? 2 : 1,
                      borderColor: selectedPlan === 'standard' ? BRAND_BLUE : 'divider',
                      bgcolor: selectedPlan === 'standard' ? SOFT_BLUE_BG : 'background.paper',
                      transition: 'all 0.18s ease',
                      '&:hover': {
                        borderColor: BRAND_BLUE,
                        bgcolor:
                          selectedPlan === 'standard'
                            ? 'rgba(37, 99, 235, 0.13)'
                            : 'rgba(37, 99, 235, 0.04)',
                      },
                    }}
                  >
                    <Stack direction="row" alignItems="flex-start" spacing={1.5}>
                      {/* Radio dot */}
                      <Box
                        sx={{
                          mt: 0.3,
                          width: 18,
                          height: 18,
                          borderRadius: '50%',
                          border: `2px solid ${selectedPlan === 'standard' ? BRAND_BLUE : '#9ca3af'
                            }`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          transition: 'border-color 0.15s ease',
                        }}
                      >
                        {selectedPlan === 'standard' && (
                          <Box
                            sx={{
                              width: 9,
                              height: 9,
                              borderRadius: '50%',
                              bgcolor: BRAND_BLUE,
                            }}
                          />
                        )}
                      </Box>

                      {/* Text */}
                      <Box>
                        <Typography
                          variant="body1"
                          fontWeight={700}
                          color={selectedPlan === 'standard' ? BRAND_BLUE : 'text.primary'}
                          lineHeight={1.2}
                        >
                          Standard
                        </Typography>
                        <Stack direction="row" alignItems="baseline" spacing={0.4} mt={0.5}>
                          <Typography
                            variant="h5"
                            fontWeight={800}
                            color={selectedPlan === 'standard' ? BRAND_BLUE : 'text.primary'}
                            lineHeight={1}
                          >
                            ${pricing.standard.rate}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" fontWeight={400}>
                            /hr
                          </Typography>
                        </Stack>
                      </Box>
                    </Stack>
                  </Paper>

                  {/* Premium Card */}
                  <Paper
                    variant="outlined"
                    onClick={() => setSelectedPlan('premium')}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      cursor: 'pointer',
                      borderWidth: selectedPlan === 'premium' ? 2 : 1,
                      borderColor: selectedPlan === 'premium' ? BRAND_PURPLE : 'divider',
                      bgcolor:
                        selectedPlan === 'premium'
                          ? 'rgba(124, 58, 237, 0.08)'
                          : 'background.paper',
                      transition: 'all 0.18s ease',
                      '&:hover': {
                        borderColor: BRAND_PURPLE,
                        bgcolor:
                          selectedPlan === 'premium'
                            ? 'rgba(124, 58, 237, 0.13)'
                            : 'rgba(124, 58, 237, 0.04)',
                      },
                    }}
                  >
                    <Stack direction="row" alignItems="flex-start" spacing={1.5}>
                      {/* Star icon as indicator */}
                      <Box sx={{ mt: 0.2, flexShrink: 0 }}>
                        <StarBorder
                          sx={{
                            fontSize: 20,
                            color: selectedPlan === 'premium' ? BRAND_PURPLE : '#9ca3af',
                            transition: 'color 0.15s ease',
                          }}
                        />
                      </Box>

                      {/* Text */}
                      <Box>
                        <Typography
                          variant="body1"
                          fontWeight={700}
                          color={selectedPlan === 'premium' ? BRAND_PURPLE : 'text.primary'}
                          lineHeight={1.2}
                        >
                          Premium
                        </Typography>
                        <Stack direction="row" alignItems="baseline" spacing={0.4} mt={0.5}>
                          <Typography
                            variant="h5"
                            fontWeight={800}
                            color={selectedPlan === 'premium' ? BRAND_PURPLE : 'text.primary'}
                            lineHeight={1}
                          >
                            ${pricing.premium.rate}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" fontWeight={400}>
                            /hr
                          </Typography>
                        </Stack>
                      </Box>
                    </Stack>
                  </Paper>

                </Stack>
              </Paper>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Bottom 2-column row */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                gap: 2,
              }}
            >
              {/* ── 4. Session Summary ─────────────────────────────────────── */}
              <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
                <Typography sx={sectionLabelSx}>4. Session Summary</Typography>

                {[
                  { label: 'Subject', value: subject },
                  {
                    label: 'Date',
                    value: selectedDate
                      ? new Date(selectedDate).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })
                      : '—',
                  },
                  { label: 'Time', value: selectedTime || '—' },
                  { label: 'Duration', value: `${durationMinutes} minutes` },
                  {
                    label: 'Plan',
                    value: selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1),
                  },
                ].map(({ label, value }) => (
                  <Box key={label} sx={summaryRowSx}>
                    <Typography variant="body2" color="text.secondary">{label}</Typography>
                    <Typography variant="body2" fontWeight={600}>{value}</Typography>
                  </Box>
                ))}

                <Divider sx={{ my: 1.2 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <Typography variant="body2" fontWeight={700}>Total</Typography>
                  <Typography variant="h6" fontWeight={800} color={BRAND_BLUE}>
                    ${selectedPrice.total.toFixed(2)}{' '}
                    <Typography
                      component="span"
                      variant="caption"
                      color="text.secondary"
                      fontWeight={500}
                    >
                      {currency}
                    </Typography>
                  </Typography>
                </Box>
              </Paper>

              {/* ── 5. Confirm Your Booking ────────────────────────────────── */}
              <Paper
                variant="outlined"
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 1.5,
                }}
              >
                <Typography sx={{ ...sectionLabelSx, mb: 0 }}>
                  5. Confirm Your Booking
                </Typography>

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handleBook}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: '1rem',
                    borderRadius: 2.5,
                    py: 1.5,
                    bgcolor: BRAND_PURPLE,
                    boxShadow: '0 4px 14px rgba(124,58,237,0.35)',
                    '&:hover': {
                      bgcolor: '#6d28d9',
                      boxShadow: '0 6px 18px rgba(124,58,237,0.45)',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  📅 Book Now
                </Button>

                <Stack direction="row" alignItems="center" spacing={0.6}>
                  <Lock sx={{ fontSize: 14, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">
                    Secure booking · Cancel anytime
                  </Typography>
                </Stack>
              </Paper>
            </Box>

          </Box>
        )}

      </Paper>
      </Box>
    </>
  );
};

const TutorBookingPage = () => {
  const { tutorId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { showError, showInfo, showSuccess } = useNotification();

  const tutor = location.state?.tutor || {};
  const subjectModule = String(location.state?.subjectModule || '').trim();

  const [slots, setSlots] = useState([]);
  const [baseRatePerHour, setBaseRatePerHour] = useState(25);
  const [currency, setCurrency] = useState('USD');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!tutorId) return;
      try {
        const [slotRows, pricing] = await Promise.all([
          sessionService.listBookableSlots({ teacherId: tutorId, limit: 300 }),
          sessionService.getTutorPricingProfile(tutorId).catch(() => null),
        ]);
        if (cancelled) return;
        const safeSlots = Array.isArray(slotRows) ? slotRows : [];
        setSlots(safeSlots);
        setBaseRatePerHour(Number(pricing?.base_rate_per_hour || 25));
        setCurrency(String(pricing?.currency || 'USD').toUpperCase());
      } catch {
        if (!cancelled) {
          setSlots([]);
          setBaseRatePerHour(25);
          setCurrency('USD');
        }
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [tutorId]);

  const slotIndex = useMemo(() => {
    const map = {};
    slots.forEach((slot) => {
      const dateKey = toDateKey(slot.start_at);
      const timeLabel = formatSlotTimeLabel(slot.start_at);
      if (!map[dateKey]) map[dateKey] = {};
      map[dateKey][timeLabel] = slot;
    });
    return map;
  }, [slots]);

  const availableDates = useMemo(() => Object.keys(slotIndex).sort(), [slotIndex]);
  const availableSlots = useMemo(() => {
    const out = {};
    Object.entries(slotIndex).forEach(([date, timeMap]) => {
      out[date] = Object.keys(timeMap).sort((a, b) => new Date(`2000-01-01 ${a}`).getTime() - new Date(`2000-01-01 ${b}`).getTime());
    });
    return out;
  }, [slotIndex]);

  const handleMessage = async () => {
    try {
      const rows = await sessionService.listMyBookings({ status: 'confirmed', limit: 200 });
      const match = (Array.isArray(rows) ? rows : []).find((b) => String(b?.teacher_id || '') === String(tutorId));
      if (!match) {
        showInfo('No confirmed session with this tutor yet.');
        return;
      }
      const bookingId = Number(match.booking_id || match.id || 0);
      if (!bookingId) return;
      navigate(`/dashboard/sessions?booking=${bookingId}&chat=1`);
    } catch (error) {
      showError(error?.response?.data?.message || error?.message || 'Unable to open chat.');
    }
  };

  const handleBook = async ({ date, time, plan, duration, total, currency: selectedCurrency }) => {
    const slot = slotIndex?.[date]?.[time] || null;
    if (!slot?.id) {
      showError('Selected time is not available with tutor slots.');
      return;
    }
    try {
      const payload = {
        slot_id: Number(slot.id),
        duration_minutes: Number(duration || 60),
        session_mode: 'remote',
        subject_module: subjectModule || 'Resource support',
        pricing_snapshot: {
          duration_minutes: Number(duration || 60),
          session_amount: Number(total || 0),
          platform_fee: 2,
          total_amount: Number((Number(total || 0) + 2).toFixed(2)),
          currency: selectedCurrency || currency,
          plan,
        },
        booking_metadata: { source: 'tutor_profile_page' },
      };
      const booking = await sessionService.createBooking(payload);
      const bookingId = Number(booking?.booking_id || booking?.id || 0);
      showSuccess('Session booked successfully!');
      if (bookingId > 0) {
        navigate(`/dashboard/sessions?booking=${bookingId}`);
      }
    } catch (error) {
      showError(error?.response?.data?.message || error?.message || 'Failed to create booking request.');
    }
  };

  return (
    <TutorBookingPageView
      tutorName={String(tutor?.name || slots?.[0]?.teacher_name || 'Tutor')}
      tutorAvatar={String(tutor?.avatar || tutor?.avatar_url || slots?.[0]?.teacher_avatar_url || '')}
      subject={subjectModule || 'Chemistry'}
      baseRatePerHour={baseRatePerHour}
      currency={currency}
      availableDates={availableDates}
      availableSlots={availableSlots}
      onBook={handleBook}
      onMessage={handleMessage}
    />
  );
};

export default TutorBookingPage;
