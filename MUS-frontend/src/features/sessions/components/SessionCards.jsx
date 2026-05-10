import PropTypes from "prop-types";
import { Box, Button, Chip, IconButton, Paper, Stack, Typography } from "@mui/material";
import { CalendarMonth, Chat, CheckCircle, DeleteOutline, EventAvailable } from "@mui/icons-material";
import { motion } from "framer-motion";
import { AsyncButton } from "@/shared/components/ui";
import { formatDate, statusColor, statusLabel } from "./sessionUtils";

export const PublicSlotCard = ({ slot, index, isStudent, loadingId, onBook }) => (
  <Box
    component={motion.div}
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: Math.min(index * 0.04, 0.22), duration: 0.34 }}
  >
    <Paper sx={{ p: 2, borderRadius: 2.5, border: "1px solid", borderColor: "divider" }}>
      <Stack direction={{ xs: "column", md: "row" }} alignItems={{ md: "center" }} spacing={1.2}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0, flex: 1 }}>
          <CalendarMonth color="primary" sx={{ fontSize: 19 }} />
          <Box>
            <Typography variant="subtitle2" fontWeight={700}>
              {slot.teacher_name || "Teacher"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatDate(slot.start_at)} - {formatDate(slot.end_at)} ({slot.timezone || "UTC"})
            </Typography>
          </Box>
        </Stack>
        {isStudent ? (
          <AsyncButton
            loading={loadingId === slot.id}
            onClick={() => onBook(slot.id)}
            variant="contained"
            startIcon={<EventAvailable sx={{ fontSize: 16 }} />}
            sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700 }}
          >
            Book Session
          </AsyncButton>
        ) : (
          <Chip label="Public slot" size="small" />
        )}
      </Stack>
    </Paper>
  </Box>
);

export const TeacherSlotCard = ({ slot, onEdit, onDelete }) => (
  <Paper sx={{ p: 2, borderRadius: 2.5, border: "1px solid", borderColor: "divider" }}>
    <Stack direction={{ xs: "column", md: "row" }} alignItems={{ md: "center" }} spacing={1.25}>
      <Box sx={{ flex: 1 }}>
        <Typography variant="subtitle2" fontWeight={700}>
          {formatDate(slot.start_at)} - {formatDate(slot.end_at)}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {slot.timezone || "UTC"} • {slot.is_booked ? "Booked" : slot.is_active ? "Active" : "Inactive"}
        </Typography>
      </Box>
      <Stack direction="row" spacing={1}>
        <Button variant="outlined" size="small" onClick={() => onEdit(slot)} sx={{ textTransform: "none" }}>
          Edit
        </Button>
        <IconButton color="error" onClick={() => onDelete(slot.id)}>
          <DeleteOutline />
        </IconButton>
      </Stack>
    </Stack>
  </Paper>
);

export const SessionBookingCard = ({ booking, isTeacherViewEnabled, onOpenChat, onCancel, onComplete, onConfirm, onReject }) => {
  const bookingId = booking.booking_id || booking.id;

  return (
    <Paper sx={{ p: 2, borderRadius: 2.5, border: "1px solid", borderColor: "divider" }}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={1.25} alignItems={{ md: "center" }}>
        <Box sx={{ flex: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="subtitle2" fontWeight={700}>
              {isTeacherViewEnabled ? booking.student_name || "Student" : booking.teacher_name || "Teacher"}
            </Typography>
            <Chip size="small" label={statusLabel[booking.status] || booking.status} color={statusColor[booking.status] || "default"} />
          </Stack>
          <Typography variant="caption" color="text.secondary">
            {formatDate(booking.start_at)} - {formatDate(booking.end_at)}
          </Typography>
        </Box>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Button
              variant="outlined"
              startIcon={<Chat sx={{ fontSize: 16 }} />}
              onClick={() => onOpenChat(booking)}
              disabled={!['confirmed', 'completed'].includes(String(booking.status || '').toLowerCase())}
              sx={{ textTransform: "none" }}
            >
              Open Chat
            </Button>
            {String(booking.status || '').toLowerCase() === 'pending' ? (
              <>
                <Chip size="small" color="success" label="Confirmed ✔️" />
                {isTeacherViewEnabled ? (
                  <>
                    <Button variant="contained" size="small" onClick={() => onConfirm(bookingId)} sx={{ textTransform: 'none' }}>
                      Confirm
                    </Button>
                    <Button variant="outlined" color="error" size="small" onClick={() => onReject(bookingId)} sx={{ textTransform: 'none' }}>
                      Reject
                    </Button>
                  </>
                ) : null}
              </>
            ) : null}
            {String(booking.status) === "confirmed" ? (
            <>
              <Button variant="text" color="error" onClick={() => onCancel(bookingId)} sx={{ textTransform: "none" }}>
                Cancel
              </Button>
              {isTeacherViewEnabled ? (
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<CheckCircle sx={{ fontSize: 16 }} />}
                  onClick={() => onComplete(bookingId)}
                  sx={{ textTransform: "none" }}
                >
                  Complete
                </Button>
              ) : null}
            </>
          ) : null}
        </Stack>
      </Stack>
    </Paper>
  );
};

PublicSlotCard.propTypes = {
  slot: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  isStudent: PropTypes.bool.isRequired,
  loadingId: PropTypes.number,
  onBook: PropTypes.func.isRequired,
};

TeacherSlotCard.propTypes = {
  slot: PropTypes.object.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

SessionBookingCard.propTypes = {
  booking: PropTypes.object.isRequired,
  isTeacherViewEnabled: PropTypes.bool.isRequired,
  onOpenChat: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onComplete: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onReject: PropTypes.func.isRequired,
};
