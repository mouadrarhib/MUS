import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import ChevronLeft from "@mui/icons-material/ChevronLeft";
import ChevronRight from "@mui/icons-material/ChevronRight";
import Check from "@mui/icons-material/Check";
import { AsyncButton } from "@/shared/components/ui";

const SIDEBAR_BG = "#0f172a";
const SIDEBAR_ACCENT = "#14b8a6";
const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

const pad2 = (num) => String(num).padStart(2, "0");
const toDateKey = (date) => `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
const formatMonthYear = (date) => date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
const toDraftDateTime = (date, time) => `${date}T${time}`;
const DEFAULT_START_TIME = "09:00";
const DEFAULT_END_TIME = "10:00";

const splitDateTime = (value) => {
  if (!value || !String(value).includes("T")) {
    const now = new Date();
    return {
      date: toDateKey(now),
      time: `${pad2(now.getHours())}:00`,
    };
  }
  const [date, timePart] = String(value).split("T");
  return { date, time: String(timePart || "00:00").slice(0, 5) };
};

const StepSidebar = ({ activeStep, onClose }) => {
  const steps = [
    { label: "Pick Dates", description: "Select all dates you are available" },
    { label: "Set Times", description: "Assign one or more times per date" },
  ];
  return (
    <Box sx={{ width: { xs: 0, sm: 220 }, bgcolor: SIDEBAR_BG, display: { xs: "none", sm: "flex" }, flexDirection: "column" }}>
      <Box sx={{ px: 2.5, py: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography sx={{ color: "white", fontWeight: (t) => t.typography.fontWeightExtraBold, fontSize: "0.95rem" }}>Create Slots</Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.45)", fontSize: "0.72rem", mt: 0.4 }}>Two-step availability setup</Typography>
          </Box>
          <IconButton size="small" onClick={onClose} sx={{ color: "rgba(255,255,255,0.6)" }}>x</IconButton>
        </Stack>
      </Box>
      <Divider sx={{ borderColor: 'var(--border-dark)' }} />
      <Box sx={{ p: 2.5 }}>
        {steps.map((step, i) => {
          const done = i < activeStep;
          const current = i === activeStep;
          return (
            <Box key={step.label} sx={{ display: "flex", gap: 1.25, mb: i === steps.length - 1 ? 0 : 2.25 }}>
              <Box sx={{ width: 24, height: 24, borderRadius: "50%", display: "grid", placeItems: "center", bgcolor: done ? SIDEBAR_ACCENT : current ? "rgba(20,184,166,0.2)" : "rgba(255,255,255,0.1)", border: `1px solid ${done || current ? SIDEBAR_ACCENT : "rgba(255,255,255,0.2)"}` }}>
                {done ? <Check sx={{ fontSize: 14, color: "white" }} /> : <Typography sx={{ fontSize: "0.72rem", color: current ? SIDEBAR_ACCENT : "rgba(255,255,255,0.6)" }}>{i + 1}</Typography>}
              </Box>
              <Box>
                <Typography sx={{ fontSize: "0.8rem", color: current ? "white" : "rgba(255,255,255,0.7)", fontWeight: current ? 700 : 500 }}>{step.label}</Typography>
                <Typography sx={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.42)", mt: 0.2 }}>{step.description}</Typography>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

StepSidebar.propTypes = {
  activeStep: PropTypes.number.isRequired,
  onClose: PropTypes.func.isRequired,
};

const DURATION_OPTIONS = [
  { label: "30 mins", value: 30 },
  { label: "45 mins", value: 45 },
  { label: "60 mins (1 hr)", value: 60 },
  { label: "90 mins (1.5 hrs)", value: 90 },
  { label: "120 mins (2 hrs)", value: 120 },
];

const SessionSlotDialog = ({ open, editingSlot, draft, setDraft, submitting, onClose, onSave }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [displayMonth, setDisplayMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [selectedDates, setSelectedDates] = useState([]);
  const [selectedDateForTime, setSelectedDateForTime] = useState("");
  const [dateSlotsMap, setDateSlotsMap] = useState({});
  const [startTime, setStartTime] = useState(DEFAULT_START_TIME);
  const [duration, setDuration] = useState(60);
  const [price, setPrice] = useState(25.00);

  const timeOptions = useMemo(() => {
    const list = [];
    for (let hour = 6; hour <= 22; hour += 1) {
      for (let minute = 0; minute <= 30; minute += 30) {
        if (hour === 22 && minute > 0) continue;
        list.push(`${pad2(hour)}:${pad2(minute)}`);
      }
    }
    return list;
  }, []);

  const calendarCells = useMemo(() => {
    const year = displayMonth.getFullYear();
    const month = displayMonth.getMonth();
    const startWeekday = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < startWeekday; i += 1) cells.push(null);
    for (let day = 1; day <= daysInMonth; day += 1) cells.push({ day, key: toDateKey(new Date(year, month, day)) });
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [displayMonth]);

  useEffect(() => {
    if (!open) return;
    setActiveStep(0);
    if (editingSlot) {
      const date = draft.available_date || (draft.start_at ? splitDateTime(draft.start_at).date : toDateKey(new Date()));
      const time = draft.available_time || (draft.start_at ? splitDateTime(draft.start_at).time : "09:00");
      const dur = Number(draft.duration_minutes || 60);
      const prc = Number(draft.price || 25.00);
      setSelectedDates([date]);
      setSelectedDateForTime(date);
      setDateSlotsMap({ [date]: [{ start: time, duration: dur, price: prc }] });
      setDisplayMonth(new Date(`${date}T00:00`));
    } else {
      setSelectedDates([]);
      setSelectedDateForTime("");
      setDateSlotsMap({});
      setStartTime(DEFAULT_START_TIME);
      setDuration(60);
      setPrice(25.00);
      const now = new Date();
      setDisplayMonth(new Date(now.getFullYear(), now.getMonth(), 1));
    }
  }, [open, editingSlot, draft.available_date, draft.available_time, draft.duration_minutes, draft.price, draft.start_at]);

  const toggleDate = (dateKey) => {
    setSelectedDates((prev) => {
      const exists = prev.includes(dateKey);
      const next = exists ? prev.filter((d) => d !== dateKey) : [...prev, dateKey].sort();
      if (!exists) {
        setDateSlotsMap((m) => ({ ...m, [dateKey]: m[dateKey] || [] }));
      } else {
        setDateSlotsMap((m) => {
          const copy = { ...m };
          delete copy[dateKey];
          return copy;
        });
      }
      if (!next.includes(selectedDateForTime)) setSelectedDateForTime(next[0] || "");
      return next;
    });
  };

  const addTimeRangeToSelectedDate = () => {
    if (!selectedDateForTime) return;
    if (!startTime) return;
    setDateSlotsMap((prev) => {
      const current = prev[selectedDateForTime] || [];
      if (current.some((item) => item.start === startTime)) return prev;
      return { ...prev, [selectedDateForTime]: [...current, { start: startTime, duration, price: Number(price || 0) }] };
    });
    setStartTime(DEFAULT_START_TIME);
  };

  const removeTimeRange = (dateKey, idx) => {
    setDateSlotsMap((prev) => ({
      ...prev,
      [dateKey]: (prev[dateKey] || []).filter((_, i) => i !== idx),
    }));
  };

  const canGoNext = selectedDates.length > 0;
  const slotsCount = selectedDates.reduce((acc, dateKey) => acc + ((dateSlotsMap[dateKey] || []).length), 0);

  const handleNext = () => {
    if (!canGoNext) return;
    setActiveStep(1);
    if (!selectedDateForTime) setSelectedDateForTime(selectedDates[0]);
  };

  const handleSubmit = () => {
    if (editingSlot) {
      const dateKey = selectedDates[0];
      const first = (dateSlotsMap[dateKey] || [])[0];
      if (!dateKey || !first) return;
      setDraft((prev) => ({
        ...prev,
        available_date: dateKey,
        available_time: first.start,
        duration_minutes: first.duration,
        price: first.price,
      }));
      onSave();
      return;
    }

    const rows = selectedDates.flatMap((dateKey) =>
      (dateSlotsMap[dateKey] || []).map((slot) => ({
        available_date: dateKey,
        available_time: slot.start,
        duration_minutes: slot.duration,
        price: slot.price,
        timezone: draft.timezone,
      }))
    );
    if (!rows.length) return;
    onSave(rows);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <Box sx={{ display: "flex", minHeight: 560 }}>
        <StepSidebar activeStep={activeStep} onClose={onClose} />
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <DialogTitle>{editingSlot ? "Edit Slot" : "Create Availability Slots"}</DialogTitle>
          <DialogContent>
            {activeStep === 0 ? (
              <Stack spacing={2}>
                <Typography variant="body2" color="text.secondary">Choose all dates you are available on.</Typography>
                <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                    <IconButton size="small" onClick={() => setDisplayMonth(new Date(displayMonth.getFullYear(), displayMonth.getMonth() - 1, 1))}><ChevronLeft fontSize="small" /></IconButton>
                    <Typography variant="body2" fontWeight={700}>{formatMonthYear(displayMonth)}</Typography>
                    <IconButton size="small" onClick={() => setDisplayMonth(new Date(displayMonth.getFullYear(), displayMonth.getMonth() + 1, 1))}><ChevronRight fontSize="small" /></IconButton>
                  </Stack>

                  <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", mb: 0.5 }}>
                    {WEEKDAYS.map((day) => (
                      <Typography key={day} variant="caption" align="center" sx={{ fontWeight: 700, fontSize: "0.68rem", color: "text.secondary" }}>{day}</Typography>
                    ))}
                  </Box>

                  <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 0.4 }}>
                    {calendarCells.map((cell, idx) => {
                      if (!cell) return <Box key={`empty-${idx}`} />;
                      const selected = selectedDates.includes(cell.key);
                      return (
                        <Button
                          key={cell.key}
                          size="small"
                          onClick={() => toggleDate(cell.key)}
                          sx={{
                            minWidth: 0,
                            height: 32,
                            borderRadius: "50%",
                            color: selected ? "#fff" : "text.primary",
                            bgcolor: selected ? "primary.main" : "transparent",
                            "&:hover": { bgcolor: selected ? "primary.dark" : alpha("#2563eb", 0.08) },
                          }}
                        >
                          {cell.day}
                        </Button>
                      );
                    })}
                  </Box>
                </Paper>

                {selectedDates.length ? (
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {selectedDates.map((dateKey) => (
                      <Chip
                        key={dateKey}
                        label={`${dateKey}${(dateSlotsMap[dateKey] || []).length ? " • configured" : ""}`}
                        onDelete={() => toggleDate(dateKey)}
                        color={(dateSlotsMap[dateKey] || []).length ? "success" : "primary"}
                        variant="outlined"
                      />
                    ))}
                  </Stack>
                ) : null}
              </Stack>
            ) : (
              <Stack spacing={2}>
                <Typography variant="body2" color="text.secondary">Select one of your created dates, then add available times with their duration and pricing.</Typography>

                <TextField
                  select
                  label="Selected date"
                  value={selectedDateForTime}
                  onChange={(event) => setSelectedDateForTime(event.target.value)}
                  fullWidth
                  size="small"
                >
                  {selectedDates.map((dateKey) => (
                    <MenuItem key={dateKey} value={dateKey}>
                      {dateKey}{(dateSlotsMap[dateKey] || []).length ? " (configured)" : ""}
                    </MenuItem>
                  ))}
                </TextField>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                  <TextField select label="Start Time" value={startTime} onChange={(event) => setStartTime(event.target.value)} size="small" fullWidth>
                    {timeOptions.map((time) => <MenuItem key={time} value={time}>{time}</MenuItem>)}
                  </TextField>
                  <TextField select label="Duration" value={duration} onChange={(event) => setDuration(Number(event.target.value))} size="small" fullWidth>
                    {DURATION_OPTIONS.map((opt) => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                  </TextField>
                  <TextField
                    label="Price ($)"
                    type="number"
                    value={price}
                    onChange={(event) => setPrice(Number(event.target.value))}
                    size="small"
                    fullWidth
                    inputProps={{ min: 0, step: 1 }}
                  />
                  <Button
                    variant="outlined"
                    onClick={addTimeRangeToSelectedDate}
                    disabled={!selectedDateForTime}
                    sx={{ textTransform: "none", minWidth: 140 }}
                  >
                    Add Slot
                  </Button>
                </Stack>

                <Divider />

                {selectedDates.map((dateKey) => {
                  const rows = dateSlotsMap[dateKey] || [];
                  return (
                    <Paper key={`list-${dateKey}`} variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                      <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>{dateKey}</Typography>
                      {rows.length ? (
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                          {rows.map((slot, idx) => (
                            <Chip
                              key={`${dateKey}-${slot.start}-${idx}`}
                              label={`${slot.start} (${slot.duration}m) • $${slot.price}`}
                              onDelete={() => removeTimeRange(dateKey, idx)}
                              color="primary"
                              variant="outlined"
                            />
                          ))}
                        </Stack>
                      ) : (
                        <Typography variant="caption" color="text.secondary">No times added for this date yet.</Typography>
                      )}
                    </Paper>
                  );
                })}
              </Stack>
            )}

            <TextField
              label="Timezone"
              value={draft.timezone}
              onChange={(event) => setDraft((prev) => ({ ...prev, timezone: event.target.value }))}
              fullWidth
              size="small"
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose}>Cancel</Button>
            {activeStep === 1 ? <Button onClick={() => setActiveStep(0)}>Back</Button> : null}
            {activeStep === 0 ? (
              <Button variant="contained" onClick={handleNext} disabled={!canGoNext}>Next</Button>
            ) : (
              <AsyncButton loading={submitting} onClick={handleSubmit} variant="contained" disabled={slotsCount < 1}>
                {editingSlot ? "Save" : `Create ${slotsCount} Slot${slotsCount === 1 ? "" : "s"}`}
              </AsyncButton>
            )}
          </DialogActions>
        </Box>
      </Box>
    </Dialog>
  );
};

SessionSlotDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  editingSlot: PropTypes.object,
  draft: PropTypes.object.isRequired,
  setDraft: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default SessionSlotDialog;
