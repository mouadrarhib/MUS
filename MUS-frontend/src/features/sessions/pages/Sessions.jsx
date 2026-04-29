import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Box, Button, Paper, Stack, Tab, Tabs, Typography } from "@mui/material";
import { Add, AutoStories, EventAvailable } from "@mui/icons-material";
import { EmptyState, PageHeader, useNotification } from "@/shared/components/ui";
import { useAuth } from "@/features/auth/context/AuthContext";
import sessionService from "@/services/sessionService";
import SessionSlotDialog from "@/features/sessions/components/SessionSlotDialog";
import SessionChatDialog from "@/features/sessions/components/SessionChatDialog";
import { PublicSlotCard, SessionBookingCard, TeacherSlotCard } from "@/features/sessions/components/SessionCards";
import { toInputDateTime } from "@/features/sessions/components/sessionUtils";

const Sessions = () => {
  const { user, isStudent, isTeacher } = useAuth();
  const { showSuccess, showError } = useNotification();

  const [loading, setLoading] = useState(true);
  const [slots, setSlots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState(isTeacher ? 1 : 0);

  const [slotDialogOpen, setSlotDialogOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [slotSubmitting, setSlotSubmitting] = useState(false);
  const [slotDraft, setSlotDraft] = useState({
    start_at: toInputDateTime(),
    end_at: toInputDateTime(Date.now() + 5400_000),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
  });

  const [bookingSubmittingId, setBookingSubmittingId] = useState(null);
  const [chatDialogOpen, setChatDialogOpen] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatBooking, setChatBooking] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageDraft, setMessageDraft] = useState("");
  const [messageSending, setMessageSending] = useState(false);

  const isTeacherViewEnabled = isTeacher;

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [bookableSlots, myBookings] = await Promise.all([
        sessionService.listBookableSlots({ limit: 120 }),
        sessionService.listMyBookings({ limit: 120 }),
      ]);
      setSlots(bookableSlots);
      setBookings(myBookings);
    } catch (error) {
      showError(error?.response?.data?.message || error?.message || "Failed to load sessions data.");
    } finally {
      setLoading(false);
    }
  }, [showError]);

  const loadTeacherSlots = useCallback(async () => {
    if (!isTeacherViewEnabled) return;
    try {
      const teacherSlots = await sessionService.listTeacherSlots({ includeInactive: true });
      setSlots(teacherSlots);
    } catch (error) {
      showError(error?.response?.data?.message || error?.message || "Failed to load teacher slots.");
    }
  }, [isTeacherViewEnabled, showError]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const myTeacherSlots = useMemo(() => {
    if (!isTeacherViewEnabled) return [];
    return slots.filter((slot) => slot.teacher_id === user?.id);
  }, [isTeacherViewEnabled, slots, user?.id]);

  const discoverSlots = useMemo(() => {
    if (isTeacherViewEnabled && activeTab === 1) return myTeacherSlots;
    return slots;
  }, [activeTab, isTeacherViewEnabled, myTeacherSlots, slots]);

  const handleBookSlot = async (slotId) => {
    setBookingSubmittingId(slotId);
    try {
      await sessionService.createBooking({ slot_id: slotId });
      showSuccess("Session booked successfully.");
      await loadData();
    } catch (error) {
      showError(error?.response?.data?.message || error?.message || "Failed to book this session.");
    } finally {
      setBookingSubmittingId(null);
    }
  };

  const handleOpenSlotDialog = (slot = null) => {
    setEditingSlot(slot);
    setSlotDraft({
      start_at: toInputDateTime(slot?.start_at),
      end_at: toInputDateTime(slot?.end_at || Date.now() + 5400_000),
      timezone: slot?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    });
    setSlotDialogOpen(true);
  };

  const handleSaveSlot = async () => {
    setSlotSubmitting(true);
    try {
      const payload = {
        start_at: new Date(slotDraft.start_at).toISOString(),
        end_at: new Date(slotDraft.end_at).toISOString(),
        timezone: slotDraft.timezone,
      };

      if (editingSlot?.id) {
        await sessionService.updateTeacherSlot(editingSlot.id, payload);
        showSuccess("Slot updated successfully.");
      } else {
        await sessionService.createTeacherSlot(payload);
        showSuccess("Slot created successfully.");
      }

      setSlotDialogOpen(false);
      setEditingSlot(null);
      await loadTeacherSlots();
      await loadData();
    } catch (error) {
      showError(error?.response?.data?.message || error?.message || "Failed to save slot.");
    } finally {
      setSlotSubmitting(false);
    }
  };

  const handleDeleteSlot = async (slotId) => {
    try {
      await sessionService.deleteTeacherSlot(slotId);
      showSuccess("Slot deleted.");
      await loadTeacherSlots();
      await loadData();
    } catch (error) {
      showError(error?.response?.data?.message || error?.message || "Failed to delete slot.");
    }
  };

  const openChat = async (booking) => {
    setChatDialogOpen(true);
    setChatBooking(booking);
    setChatLoading(true);
    try {
      const [details, rows] = await Promise.all([
        sessionService.getBookingById(booking.booking_id || booking.id),
        sessionService.listMessages(booking.booking_id || booking.id),
      ]);
      setChatBooking(details || booking);
      setMessages(rows);
    } catch (error) {
      showError(error?.response?.data?.message || error?.message || "Failed to open session chat.");
    } finally {
      setChatLoading(false);
    }
  };

  const sendMessage = async () => {
    const body = messageDraft.trim();
    if (!body || !chatBooking) return;
    setMessageSending(true);
    try {
      await sessionService.sendMessage(chatBooking.booking_id || chatBooking.id, body);
      const rows = await sessionService.listMessages(chatBooking.booking_id || chatBooking.id);
      setMessages(rows);
      setMessageDraft("");
    } catch (error) {
      showError(error?.response?.data?.message || error?.message || "Failed to send message.");
    } finally {
      setMessageSending(false);
    }
  };

  const cancelBooking = async (bookingId) => {
    try {
      await sessionService.cancelBooking(bookingId, "Cancelled from dashboard");
      showSuccess("Booking cancelled.");
      await loadData();
    } catch (error) {
      showError(error?.response?.data?.message || error?.message || "Failed to cancel booking.");
    }
  };

  const completeBooking = async (bookingId) => {
    try {
      await sessionService.completeBooking(bookingId);
      showSuccess("Booking marked as completed.");
      await loadData();
    } catch (error) {
      showError(error?.response?.data?.message || error?.message || "Failed to complete booking.");
    }
  };

  return (
    <Box>
      <PageHeader
        title="Teacher Sessions"
        subtitle="Book 1:1 academic sessions, manage availability slots, and chat directly after booking."
        icon={AutoStories}
        actions={
          isTeacherViewEnabled ? (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenSlotDialog()}
              sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700 }}
            >
              Add Slot
            </Button>
          ) : null
        }
      />

      <Paper
        elevation={0}
        sx={(theme) => ({
          p: { xs: 2, md: 2.5 },
          borderRadius: 3,
          mb: 2,
          border: "1px solid",
          borderColor: "divider",
          background: theme.palette.mode === "dark"
            ? "linear-gradient(135deg, rgba(124,92,252,0.12) 0%, rgba(14,165,233,0.08) 100%)"
            : "linear-gradient(135deg, rgba(124,92,252,0.08) 0%, rgba(14,165,233,0.07) 100%)",
        })}
      >
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} alignItems={{ xs: "flex-start", sm: "center" }}>
          <EventAvailable color="primary" />
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {isStudent
              ? "Choose a confirmed teacher slot to instantly start your session journey."
              : "Publish clean time slots to let students book you instantly with auto-confirmation."}
          </Typography>
        </Stack>
      </Paper>

      <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 2 }}>
        <Tab label="Available Slots" />
        {isTeacherViewEnabled ? <Tab label="My Slots" /> : null}
        <Tab label="My Bookings" />
      </Tabs>

      {loading ? (
        <Alert severity="info">Loading sessions...</Alert>
      ) : (
        <>
          {activeTab === 0 ? (
            discoverSlots.length ? (
              <Stack spacing={1.25}>
                {discoverSlots.map((slot, index) => (
                  <PublicSlotCard
                    key={slot.id}
                    slot={slot}
                    index={index}
                    isStudent={isStudent}
                    loadingId={bookingSubmittingId}
                    onBook={handleBookSlot}
                  />
                ))}
              </Stack>
            ) : (
              <EmptyState title="No slots available" subtitle="Teachers have not published upcoming slots yet." />
            )
          ) : null}

          {isTeacherViewEnabled && activeTab === 1 ? (
            myTeacherSlots.length ? (
              <Stack spacing={1.25}>
                {myTeacherSlots.map((slot) => (
                  <TeacherSlotCard
                    key={slot.id}
                    slot={slot}
                    onEdit={handleOpenSlotDialog}
                    onDelete={handleDeleteSlot}
                  />
                ))}
              </Stack>
            ) : (
              <EmptyState title="No teacher slots yet" subtitle="Create your first slot to start receiving bookings." />
            )
          ) : null}

          {activeTab === (isTeacherViewEnabled ? 2 : 1) ? (
            bookings.length ? (
              <Stack spacing={1.25}>
                {bookings.map((booking) => (
                  <SessionBookingCard
                    key={booking.booking_id || booking.id}
                    booking={booking}
                    isTeacherViewEnabled={isTeacherViewEnabled}
                    onOpenChat={openChat}
                    onCancel={cancelBooking}
                    onComplete={completeBooking}
                  />
                ))}
              </Stack>
            ) : (
              <EmptyState title="No bookings yet" subtitle="Booked sessions will appear here with direct chat access." />
            )
          ) : null}
        </>
      )}

      <SessionSlotDialog
        open={slotDialogOpen}
        editingSlot={editingSlot}
        draft={slotDraft}
        setDraft={setSlotDraft}
        submitting={slotSubmitting}
        onClose={() => setSlotDialogOpen(false)}
        onSave={handleSaveSlot}
      />

      <SessionChatDialog
        open={chatDialogOpen}
        onClose={() => setChatDialogOpen(false)}
        loading={chatLoading}
        booking={chatBooking}
        messages={messages}
        userId={user?.id}
        draft={messageDraft}
        setDraft={setMessageDraft}
        sending={messageSending}
        onSend={sendMessage}
      />
    </Box>
  );
};

export default Sessions;
