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
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import CodeIcon from '@mui/icons-material/Code';
import TimelineIcon from '@mui/icons-material/Timeline';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import sessionService from '@/services/sessionService';
import DiscoveryHeader from '@/features/discover/components/DiscoveryHeader';
import resourcesService from '@/services/resourcesService';
import tutorProfileService from '@/services/tutorProfileService';
import ResourceCard from '@/features/discover/components/ResourceCard';
import { toResourceCardModel } from '@/features/discover/components/resourceCardMapper';
import { toResourceDetailModel } from '@/entities/resource/mappers/resourceViewModel';
import ResourceDetailsDialog from '@/features/resources/components/ResourceDetailsDialog';
import { useNotification } from '@/shared/components/ui';

// ─── brand tokens ─────────────────────────────────────────────────────────────
const BRAND_BLUE = '#2563EB';
const BRAND_PURPLE = '#7C3AED';
const BRAND_GREEN = '#22C55E';
const SOFT_GREEN_BG = 'rgba(34, 197, 94, 0.14)';
const SOFT_BLUE_BG = 'rgba(37, 99, 235, 0.10)';

const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const TABS = ['Profile', 'Resources', 'Booking'];
const DURATION_OPTIONS = [30, 60, 90, 120];

// ─── helpers ──────────────────────────────────────────────────────────────────
const toDateKey = (d) => {
  const date = new Date(d);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
const formatLocalDateString = (dateStr, options) => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-US', options);
};
const formatMonthYear = (d) => d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
const formatSlotTimeLabel = (dateValue) => {
  const date = new Date(dateValue);
  const h = date.getHours();
  const m = date.getMinutes();
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${String(hour12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${suffix}`;
};

const parseMetadata = (metadata) => {
  if (!metadata) return {};
  if (typeof metadata === 'object') return metadata;
  if (typeof metadata === 'string') {
    try {
      return JSON.parse(metadata);
    } catch {
      return {};
    }
  }
  return {};
};

const toTutorResourceDetail = (resource) => {
  const base = toResourceDetailModel(resource || {});
  const metadata = parseMetadata(resource?.metadata);
  const mdAcademic = metadata?.academicContext && typeof metadata.academicContext === 'object' ? metadata.academicContext : {};
  return {
    ...base,
    id: Number(resource?.id || resource?.resource_id || base?.id || 0),
    educationalType: resource?.educational_type || base?.educationalType || 'notes',
    createdAt: resource?.created_at || base?.createdAt,
    author: {
      id: String(resource?.created_by || base?.author?.id || ''),
      name: resource?.creator_name || base?.author?.name || 'Creator',
      avatar: resource?.creator_avatar_url || base?.author?.avatar || '',
      avatar_url: resource?.creator_avatar_url || base?.author?.avatar_url || '',
      role: resource?.creator_role || base?.author?.role || 'creator',
      institution: base?.author?.institution || '',
    },
    academicContext: {
      ...(base?.academicContext || {}),
      institutionId: String(base?.academicContext?.institutionId || mdAcademic.institutionId || mdAcademic.institution_id || ''),
      programId: String(base?.academicContext?.programId || mdAcademic.programId || mdAcademic.program_id || ''),
      levelId: String(base?.academicContext?.levelId || mdAcademic.levelId || mdAcademic.level_id || ''),
      semesterId: String(base?.academicContext?.semesterId || mdAcademic.semesterId || mdAcademic.semester_id || ''),
      moduleId: String(base?.academicContext?.moduleId || mdAcademic.moduleId || mdAcademic.module_id || resource?.module_id || ''),
      chapter: base?.academicContext?.chapter || mdAcademic.chapter || '',
      difficulty: base?.academicContext?.difficulty || mdAcademic.difficulty || resource?.difficulty || '',
      isExamRelated: Boolean(base?.academicContext?.isExamRelated ?? mdAcademic.isExamRelated ?? mdAcademic.examRelated ?? false),
    },
  };
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
  bio = '',
  expertise = [],
  education = [],
  sessionsCount = 0,
  responseTimeMinutes = null,
  baseRatePerHour = 25,
  currency = 'USD',
  availableDates = [],
  availableSlots = {},
  slotIndex = {},
  resources = [],
  initialTab = 'Booking',
  onResourceOpen = () => {},
  onBook = () => { },
  onMessage = () => { },
  onSave = () => { },
}) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [displayMonth, setDisplayMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const cardResources = useMemo(() => (Array.isArray(resources) ? resources : []).map(toResourceCardModel), [resources]);

  useEffect(() => {
    setActiveTab(TABS.includes(initialTab) ? initialTab : 'Booking');
  }, [initialTab]);

  // Auto-select first available date
  useEffect(() => {
    if (!selectedDate && availableDates.length) {
      const first = availableDates[0];
      setSelectedDate(first);
      const [year, month, day] = first.split('-').map(Number);
      const dt = new Date(year, month - 1, day);
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
    
    // First weekday of current month (0 = Sun, 6 = Sat)
    const startWeekday = new Date(y, m, 1).getDay();
    // Total days in current month
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    // Total days in previous month
    const daysInPrevMonth = new Date(y, m, 0).getDate();
    
    const cells = [];
    
    // 1. Fill previous month's trailing days
    for (let i = startWeekday - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const dt = new Date(y, m - 1, day);
      cells.push({
        day,
        key: toDateKey(dt),
        isCurrentMonth: false,
      });
    }
    
    // 2. Fill current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const dt = new Date(y, m, day);
      cells.push({
        day,
        key: toDateKey(dt),
        isCurrentMonth: true,
      });
    }
    
    // 3. Fill next month's leading days to make a complete week grid
    let nextMonthDay = 1;
    while (cells.length % 7 !== 0) {
      const dt = new Date(y, m + 1, nextMonthDay);
      cells.push({
        day: nextMonthDay,
        key: toDateKey(dt),
        isCurrentMonth: false,
      });
      nextMonthDay++;
    }
    
    return cells;
  }, [displayMonth]);

  const todaySlots = availableSlots[selectedDate] || [];

  const selectedSlot = useMemo(() => {
    if (!selectedDate || !selectedTime) return null;
    return slotIndex?.[selectedDate]?.[selectedTime] || null;
  }, [selectedDate, selectedTime, slotIndex]);

  const pricing = useMemo(() => {
    if (selectedSlot) {
      const price = Number(selectedSlot.price || 0);
      return {
        session_amount: price,
        platform_fee: 2,
        total_amount: price + 2,
      };
    }
    return {
      session_amount: 0,
      platform_fee: 2,
      total_amount: 2,
    };
  }, [selectedSlot]);

  const handleSelectDate = (dateKey) => {
    setSelectedDate(dateKey);
    setSelectedTime('');
  };

  const handleBook = () => {
    onBook({
      date: selectedDate,
      time: selectedTime,
    });
  };

  return (
    <>
      <DiscoveryHeader />
      <Box sx={{ 
        background: `linear-gradient(135deg, rgba(37,99,235,0.03) 0%, rgba(124,58,237,0.04) 100%)`, 
        minHeight: '100vh', 
        py: { xs: 3, md: 6 }, 
        px: { xs: 1, sm: 3, md: 6 } 
      }}>
      <Paper 
        elevation={0} 
        sx={{ 
          maxWidth: 1100, 
          mx: 'auto', 
          borderRadius: 4, 
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.4)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.05)',
          bgcolor: 'background.paper'
        }}
      >
        {/* ── Tutor Cover & Header ───────────────────────────────────────── */}
        <Box sx={{ height: 140, background: `linear-gradient(90deg, ${BRAND_BLUE} 0%, ${BRAND_PURPLE} 100%)`, opacity: 0.9 }} />
        <Box sx={{ px: { xs: 2, sm: 4 }, pt: 0, pb: 3, mt: -6 }}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            alignItems={{ xs: 'flex-start', md: 'flex-start' }}
            spacing={3}
            justifyContent="space-between"
            gap={2}
          >
            <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'flex-start' }} spacing={3}>
              <Avatar
                src={tutorAvatar}
                sx={{ 
                  width: 120, 
                  height: 120, 
                  fontSize: '3rem', 
                  bgcolor: BRAND_BLUE,
                  border: '4px solid #fff',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
                  zIndex: 2,
                }}
              >
                {tutorName.charAt(0)}
              </Avatar>

              <Box sx={{ pt: { xs: 2, sm: 7.5 } }}>
                <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                  <Typography variant="h4" fontWeight={800}>
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

            <Stack direction="row" spacing={1} alignItems="center" sx={{ pt: { xs: 0, md: 7.5 } }}>
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
                  {calendarCells.map((cell) => {
                    const isAvailable = cell.isCurrentMonth && availableDates.includes(cell.key);
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
                          fontWeight: isSelected ? 700 : 500,
                          color: isSelected
                            ? '#fff'
                            : isAvailable
                              ? '#22C55E'
                              : cell.isCurrentMonth
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
                                : 'transparent',
                          },
                          '&.Mui-disabled': {
                            color: cell.isCurrentMonth ? 'text.primary' : 'text.disabled',
                            bgcolor: 'transparent',
                            opacity: cell.isCurrentMonth ? 1.0 : 0.4,
                          },
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
                    ? ` (${formatLocalDateString(selectedDate, {
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
                            fontWeight: active ? 700 : 500,
                            justifyContent: 'center',
                            borderColor: active ? BRAND_GREEN : 'rgba(0,0,0,0.08)',
                            bgcolor: active ? 'rgba(34, 197, 94, 0.08)' : 'background.paper',
                            color: active ? '#16a34a' : 'text.primary',
                            boxShadow: 'none',
                            '&:hover': {
                              bgcolor: active
                                ? 'rgba(34, 197, 94, 0.14)'
                                : 'rgba(34, 197, 94, 0.03)',
                              borderColor: active ? BRAND_GREEN : BRAND_GREEN,
                              color: active ? '#16a34a' : '#16a34a',
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

              {/* ── 3. Session Pricing & Duration ─────────────────────────── */}
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Typography sx={sectionLabelSx}>3. Pricing & Details</Typography>

                {selectedSlot ? (
                  <Stack spacing={2} sx={{ mt: 1.5 }}>
                    <Box sx={{ p: 1.8, borderRadius: 2, border: '1px solid rgba(124, 58, 237, 0.15)', bgcolor: 'rgba(124, 58, 237, 0.04)' }}>
                      <Typography variant="body2" color="text.secondary" fontWeight={500}>Session Duration</Typography>
                      <Typography variant="h6" fontWeight={700} sx={{ color: BRAND_PURPLE }}>
                        ⏱️ {selectedSlot.duration_minutes || 60} minutes
                      </Typography>
                    </Box>

                    <Box sx={{ p: 1.8, borderRadius: 2, border: '1px solid rgba(37, 99, 235, 0.15)', bgcolor: 'rgba(37, 99, 235, 0.04)' }}>
                      <Typography variant="body2" color="text.secondary" fontWeight={500}>Tutor Price</Typography>
                      <Typography variant="h6" fontWeight={700} sx={{ color: BRAND_BLUE }}>
                        💵 ${Number(selectedSlot.price || 0).toFixed(2)}
                      </Typography>
                    </Box>
                  </Stack>
                ) : (
                  <Box sx={{ p: 3, textAlign: 'center', border: '1px dashed divider', borderRadius: 2, mt: 1.5 }}>
                    <Typography variant="body2" color="text.secondary">
                      Select a date and time slot first to view details.
                    </Typography>
                  </Box>
                )}
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
                      ? formatLocalDateString(selectedDate, {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })
                      : '—',
                  },
                  { label: 'Time', value: selectedTime || '—' },
                  { label: 'Duration', value: selectedSlot ? `${selectedSlot.duration_minutes || 60} minutes` : '—' },
                  { label: 'Rate', value: selectedSlot ? `$${Number(selectedSlot.price || 0).toFixed(2)}` : '—' },
                ].map(({ label, value }) => (
                  <Box key={label} sx={summaryRowSx}>
                    <Typography variant="body2" color="text.secondary">{label}</Typography>
                    <Typography variant="body2" fontWeight={600}>{value}</Typography>
                  </Box>
                ))}

                <Divider sx={{ my: 1.2 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <Typography variant="body2" fontWeight={700}>Total (incl. $2 fee)</Typography>
                  <Typography variant="h6" fontWeight={800} color={BRAND_BLUE}>
                    ${pricing.total_amount.toFixed(2)}{' '}
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
                  disabled={!selectedSlot}
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

        {/* ── Profile Panel ────────────────────────────────────────────────── */}
        {activeTab === 'Profile' && (
          <Box sx={{ p: { xs: 2, sm: 4 } }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1.2fr' }, gap: 5 }}>
              
              {/* Left Column: About & Timeline */}
              <Stack spacing={5}>
                
                {/* About Me Card */}
                <Box>
                  <Typography variant="h6" fontWeight={800} mb={2} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonIcon sx={{ color: BRAND_BLUE }} /> About {tutorName.split(' ')[0]}
                  </Typography>
                  <Paper 
                    elevation={0}
                    sx={{ 
                      p: 3.5, 
                      borderRadius: 4, 
                      bgcolor: 'rgba(255, 255, 255, 0.4)', 
                      backdropFilter: 'blur(16px)',
                      border: '1px solid rgba(255, 255, 255, 0.6)',
                      boxShadow: '0 8px 32px rgba(37, 99, 235, 0.04)',
                      lineHeight: 1.8,
                      color: 'text.secondary'
                    }}
                  >
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {bio || `Hello! I'm ${tutorName}, a dedicated ${subject} tutor focused on helping students learn with confidence and practical understanding.`}
                    </Typography>
                    {!bio && (
                      <Typography variant="body1">
                        Whether you are preparing for exams, working on projects, or building fundamentals, sessions are tailored to your pace and goals.
                      </Typography>
                    )}
                  </Paper>
                </Box>

                {/* Education Timeline */}
                <Box>
                  <Typography variant="h6" fontWeight={800} mb={3} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SchoolIcon sx={{ color: BRAND_PURPLE }} /> Education & Credentials
                  </Typography>
                  <Box sx={{ ml: 2, pl: 4, borderLeft: '2px solid rgba(124, 58, 237, 0.15)', position: 'relative' }}>
                    
                    {(Array.isArray(education) && education.length > 0 ? education : []).map((item, index) => {
                      const accent = index % 2 === 0 ? BRAND_PURPLE : '#f59e0b';
                      const years = [item?.start_year, item?.end_year].filter(Boolean).join(' - ');
                      return (
                        <Box key={`edu-${index}`} sx={{ position: 'relative', mb: index === education.length - 1 ? 0 : 4 }}>
                          <Box sx={{
                            position: 'absolute', left: -50, top: 0,
                            width: 32, height: 32, borderRadius: '50%',
                            bgcolor: '#fff', border: `2px solid ${accent}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 2px 8px rgba(124,58,237,0.2)'
                          }}>
                            {index % 2 === 0 ? <EmojiEvents sx={{ fontSize: 16, color: accent }} /> : <StarBorder sx={{ fontSize: 16, color: accent }} />}
                          </Box>
                          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, bgcolor: 'rgba(255, 255, 255, 0.5)', border: '1px solid rgba(255,255,255,0.8)' }}>
                            <Typography variant="subtitle1" fontWeight={800} color="text.primary">{item?.degree || 'Education'}</Typography>
                            <Typography variant="body2" fontWeight={600} sx={{ mb: 1, color: accent }}>
                              {item?.institution || 'Institution'}{years ? ` · ${years}` : ''}
                            </Typography>
                            {item?.description && <Typography variant="body2" color="text.secondary">{item.description}</Typography>}
                          </Paper>
                        </Box>
                      );
                    })}

                    {(!Array.isArray(education) || education.length === 0) && (
                      <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, bgcolor: 'rgba(255, 255, 255, 0.5)', border: '1px solid rgba(255,255,255,0.8)' }}>
                        <Typography variant="body2" color="text.secondary">No education details added yet.</Typography>
                      </Paper>
                    )}

                  </Box>
                </Box>
              </Stack>

              {/* Right Column: Expertise & Stats */}
              <Stack spacing={4}>
                
                {/* Expertise Glass Card */}
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 3, 
                    borderRadius: 4, 
                    bgcolor: 'rgba(37, 99, 235, 0.02)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(37, 99, 235, 0.1)',
                    boxShadow: '0 8px 24px rgba(37, 99, 235, 0.04)'
                  }}
                >
                  <Typography variant="subtitle1" fontWeight={800} mb={2.5} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CodeIcon sx={{ color: BRAND_BLUE }} /> Areas of Expertise
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.2 }}>
                    {(Array.isArray(expertise) && expertise.length > 0 ? expertise : ['General Tutoring']).map((skill) => (
                      <Chip
                        key={skill}
                        label={skill}
                        sx={{
                          bgcolor: 'rgba(255, 255, 255, 0.9)',
                          border: '1px solid rgba(37, 99, 235, 0.15)',
                          color: '#1e293b',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          borderRadius: 2,
                          px: 0.5,
                          boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                        }}
                      />
                    ))}
                  </Box>
                </Paper>

                {/* Stats Grid */}
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 3, 
                    borderRadius: 4, 
                    bgcolor: 'rgba(34, 197, 94, 0.02)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(34, 197, 94, 0.1)',
                    boxShadow: '0 8px 24px rgba(34, 197, 94, 0.04)'
                  }}
                >
                  <Typography variant="subtitle1" fontWeight={800} mb={3} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TimelineIcon sx={{ color: BRAND_GREEN }} /> Tutor Performance
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    
                    <Box sx={{ p: 2, borderRadius: 3, bgcolor: '#fff', border: '1px solid rgba(0,0,0,0.04)', textAlign: 'center' }}>
                      <Typography variant="h5" fontWeight={800} color={BRAND_BLUE}>{sessionsCount || 0}</Typography>
                      <Typography variant="caption" fontWeight={600} color="text.secondary">Total Sessions</Typography>
                    </Box>

                    <Box sx={{ p: 2, borderRadius: 3, bgcolor: '#fff', border: '1px solid rgba(0,0,0,0.04)', textAlign: 'center' }}>
                      <Typography variant="h5" fontWeight={800} color={BRAND_PURPLE}>{responseTimeMinutes != null ? `${responseTimeMinutes} min` : 'N/A'}</Typography>
                      <Typography variant="caption" fontWeight={600} color="text.secondary">Response Time</Typography>
                    </Box>

                    <Box sx={{ p: 2, borderRadius: 3, bgcolor: '#fff', border: '1px solid rgba(0,0,0,0.04)', textAlign: 'center' }}>
                      <Typography variant="h5" fontWeight={800} color={BRAND_GREEN}>100%</Typography>
                      <Typography variant="caption" fontWeight={600} color="text.secondary">Attendance</Typography>
                    </Box>

                    <Box sx={{ p: 2, borderRadius: 3, bgcolor: '#fff', border: '1px solid rgba(0,0,0,0.04)', textAlign: 'center' }}>
                      <Typography variant="h5" fontWeight={800} color="#f59e0b">{studentsCount}</Typography>
                      <Typography variant="caption" fontWeight={600} color="text.secondary">Students</Typography>
                    </Box>

                  </Box>
                </Paper>

              </Stack>
            </Box>
          </Box>
        )}

        {/* ── Resources Panel ──────────────────────────────────────────────── */}
        {activeTab === 'Resources' && (
          <Box sx={{ p: { xs: 2, sm: 4 } }}>
            {cardResources.length > 0 ? (
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
                {cardResources.map((resourceCard, index) => (
                  <ResourceCard
                    key={resourceCard.id || index}
                    resource={resourceCard}
                    onOpen={() => onResourceOpen(resources[index])}
                  />
                ))}
              </Box>
            ) : (
              <Box sx={{ p: { xs: 4, sm: 8 }, textAlign: 'center' }}>
                <Typography variant="h6" fontWeight={700} color="text.secondary" mb={1}>
                  No Resources Yet
                </Typography>
                <Typography variant="body2" color="text.disabled">
                  This tutor hasn't published any public resources.
                </Typography>
              </Box>
            )}
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
  const initialTab = String(location.state?.initialTab || 'Booking');

  const [slots, setSlots] = useState([]);
  const [resources, setResources] = useState([]);
  const [viewingResource, setViewingResource] = useState(null);
  const [openResourceDialog, setOpenResourceDialog] = useState(false);
  const [baseRatePerHour, setBaseRatePerHour] = useState(25);
  const [currency, setCurrency] = useState('USD');
  const [publicTutorProfile, setPublicTutorProfile] = useState(null);

  const handleOpenResource = (resource) => {
    const detail = toTutorResourceDetail(resource);
    if (!detail?.id) return;
    setViewingResource(detail);
    setOpenResourceDialog(true);
  };

  const handleCloseResource = () => {
    setOpenResourceDialog(false);
    setViewingResource(null);
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!tutorId) return;
      try {
        const [slotRows, pricing, resourceList, profile] = await Promise.all([
          sessionService.listBookableSlots({ teacherId: tutorId, limit: 200 }),
          sessionService.getTutorPricingProfile(tutorId).catch(() => null),
          resourcesService.listResourcesByCreator(tutorId).catch(() => []),
          tutorProfileService.getPublicTutorProfile(tutorId).catch(() => null),
        ]);
        if (cancelled) return;
        const safeSlots = Array.isArray(slotRows) ? slotRows : [];
        setSlots(safeSlots);
        setResources(Array.isArray(resourceList) ? resourceList : []);
        setBaseRatePerHour(Number(pricing?.base_rate_per_hour || 25));
        setCurrency(String(pricing?.currency || 'USD').toUpperCase());
        setPublicTutorProfile(profile || null);
      } catch {
        if (!cancelled) {
          setSlots([]);
          setResources([]);
          setBaseRatePerHour(25);
          setCurrency('USD');
          setPublicTutorProfile(null);
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
      const dateKey = (slot.available_date || "").split("T")[0] || toDateKey(slot.start_at);
      const timeParts = (slot.available_time || "").split(":");
      let timeLabel = "";
      if (timeParts.length >= 2) {
        const h = Number(timeParts[0]);
        const m = Number(timeParts[1]);
        const suffix = h >= 12 ? 'PM' : 'AM';
        const hour12 = h % 12 || 12;
        timeLabel = `${String(hour12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${suffix}`;
      } else {
        timeLabel = formatSlotTimeLabel(slot.start_at);
      }
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

  const handleBook = async ({ date, time }) => {
    const slot = slotIndex?.[date]?.[time] || null;
    if (!slot?.id) {
      showError('Selected time is not available with tutor slots.');
      return;
    }
    try {
      const price = Number(slot.price || 0);
      const dur = Number(slot.duration_minutes || 60);
      const payload = {
        slot_id: Number(slot.id),
        duration_minutes: dur,
        session_mode: 'remote',
        subject_module: subjectModule || 'Resource support',
        pricing_snapshot: {
          duration_minutes: dur,
          session_amount: price,
          platform_fee: 2,
          total_amount: Number((price + 2).toFixed(2)),
          currency: currency,
          plan: 'standard',
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
    <>
      <TutorBookingPageView
        tutorName={String(publicTutorProfile?.full_name || tutor?.name || slots?.[0]?.teacher_name || 'Tutor')}
        tutorAvatar={String(publicTutorProfile?.avatar_url || tutor?.avatar || tutor?.avatar_url || slots?.[0]?.teacher_avatar_url || '')}
        subject={subjectModule || 'Chemistry'}
        experience={publicTutorProfile?.years_experience ? `${publicTutorProfile.years_experience}+ years experience` : 'Tutor'}
        studentsCount={String(publicTutorProfile?.students_taught_count || 0)}
        rating={Number(publicTutorProfile?.rating_avg || 0)}
        reviewCount={String(publicTutorProfile?.rating_count || 0)}
        bio={String(publicTutorProfile?.bio || '')}
        expertise={(publicTutorProfile?.skills || []).map((entry) => entry?.skill_name).filter(Boolean)}
        education={Array.isArray(publicTutorProfile?.education) ? publicTutorProfile.education : []}
        sessionsCount={Number(publicTutorProfile?.sessions_taught_count || 0)}
        responseTimeMinutes={publicTutorProfile?.response_time_minutes ?? null}
        baseRatePerHour={baseRatePerHour}
        currency={currency}
        availableDates={availableDates}
        availableSlots={availableSlots}
        slotIndex={slotIndex}
        resources={resources}
        initialTab={TABS.includes(initialTab) ? initialTab : 'Booking'}
        onResourceOpen={handleOpenResource}
        onBook={handleBook}
        onMessage={handleMessage}
      />
      <ResourceDetailsDialog
        open={openResourceDialog}
        resource={viewingResource}
        onClose={handleCloseResource}
      />
    </>
  );
};

export default TutorBookingPage;
