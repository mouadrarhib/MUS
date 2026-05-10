import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Box, Button, Paper, Stack, Tab, Tabs, Typography } from "@mui/material";
import { Add, AutoStories, EventAvailable } from "@mui/icons-material";
import { EmptyState, PageHeader, useNotification } from "@/shared/components/ui";
import { useAuth } from "@/features/auth/context/AuthContext";
import sessionService from "@/services/sessionService";
import { useLocation, useNavigate } from "react-router-dom";
import SessionSlotDialog from "@/features/sessions/components/SessionSlotDialog";
import SessionChatDialog from "@/features/sessions/components/SessionChatDialog";
import { PublicSlotCard, SessionBookingCard, TeacherSlotCard } from "@/features/sessions/components/SessionCards";
import { toInputDateTime } from "@/features/sessions/components/sessionUtils";

const Sessions = () => {
  const { user, isStudent, isTeacher } = useAuth();
  const { showSuccess, showError } = useNotification();
  const location = useLocation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [slots, setSlots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState(isTeacher ? "my-slots" : "available");

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
  const [deepLinkHandled, setDeepLinkHandled] = useState(false);

  const isTeacherViewEnabled = isTeacher;
  const requestedBookingId = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const booking = Number(params.get("booking") || 0);
    const openChat = String(params.get("chat") || "").toLowerCase();
    if (!booking || Number.isNaN(booking)) return null;
    if (openChat && openChat !== "1" && openChat !== "true") return null;
    return booking;
  }, [location.search]);

  const requestedTab = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const value = String(params.get("tab") || "").toLowerCase();
    if (["available", "my-slots", "bookings", "chats"].includes(value)) return value;
    return null;
  }, [location.search]);

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

  useEffect(() => {
    if (!requestedTab) return;
    if (requestedTab === "my-slots" && !isTeacherViewEnabled) return;
    setActiveTab(requestedTab);
  }, [requestedTab, isTeacherViewEnabled]);

  const myTeacherSlots = useMemo(() => {
    if (!isTeacherViewEnabled) return [];
    return slots.filter((slot) => slot.teacher_id === user?.id);
  }, [isTeacherViewEnabled, slots, user?.id]);

  const discoverSlots = useMemo(() => {
    if (isTeacherViewEnabled && activeTab === "my-slots") return myTeacherSlots;
    return slots;
  }, [activeTab, isTeacherViewEnabled, myTeacherSlots, slots]);

  const chatOnlyBookings = useMemo(() => {
    const list = Array.isArray(bookings) ? bookings : [];
    return [...list]
      .filter((item) => ['confirmed', 'completed'].includes(String(item?.status || '').toLowerCase()))
      .filter((item) => Number(item.booking_id || item.id || 0) > 0)
      .sort((a, b) => {
        const aTime = new Date(a.updated_at || a.start_at || 0).getTime();
        const bTime = new Date(b.updated_at || b.start_at || 0).getTime();
        return bTime - aTime;
      });
  }, [bookings]);

  const handleBookSlot = async (slotId) => {
    setBookingSubmittingId(slotId);
    try {
      await sessionService.createBooking({ slot_id: slotId });
      showSuccess("Session booked successfully!");
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

  const handleSaveSlot = async (bulkSlots = null) => {
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
        const entries = Array.isArray(bulkSlots) && bulkSlots.length
          ? bulkSlots
          : [{ start_at: slotDraft.start_at, end_at: slotDraft.end_at, timezone: slotDraft.timezone }];
        await Promise.all(
          entries.map((entry) =>
            sessionService.createTeacherSlot({
              start_at: new Date(entry.start_at).toISOString(),
              end_at: new Date(entry.end_at).toISOString(),
              timezone: entry.timezone || slotDraft.timezone,
            })
          )
        );
        showSuccess(entries.length > 1 ? `${entries.length} slots created successfully.` : "Slot created successfully.");
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

  const openChat = useCallback(async (booking) => {
    const status = String(booking?.status || '').toLowerCase();
    if (!['confirmed', 'completed'].includes(status)) {
      showError('Chat is available for confirmed bookings.');
      return;
    }
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
  }, [showError]);

  useEffect(() => {
    setDeepLinkHandled(false);
  }, [requestedBookingId]);

  useEffect(() => {
    if (!requestedBookingId || deepLinkHandled || loading || !bookings.length) return;
    const match = bookings.find((item) => Number(item.booking_id || item.id || 0) === requestedBookingId);
    if (!match) return;
    setDeepLinkHandled(true);
    openChat(match);
    navigate("/dashboard/sessions", { replace: true });
  }, [requestedBookingId, deepLinkHandled, loading, bookings, openChat, navigate]);

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

  const confirmBooking = async (bookingId) => {
    try {
      await sessionService.confirmBooking(bookingId);
      showSuccess('Booking confirmed.');
      await loadData();
    } catch (error) {
      showError(error?.response?.data?.message || error?.message || 'Failed to confirm booking.');
    }
  };

  const rejectBooking = async (bookingId) => {
    try {
      await sessionService.rejectBooking(bookingId, 'Tutor unavailable for requested time');
      showSuccess('Booking request rejected.');
      await loadData();
    } catch (error) {
      showError(error?.response?.data?.message || error?.message || 'Failed to reject booking.');
    }
  };

  return (
    <Box>
      <PageHeader
        title="Tutor Sessions"
        subtitle="Book 1:1 tutoring sessions, manage availability slots, and chat directly after booking."
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
              ? "Choose a tutor slot to book your session. Chat unlocks immediately."
              : "Publish your tutoring slots to receive auto-confirmed student bookings."}
          </Typography>
        </Stack>
      </Paper>

      <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 2 }}>
        <Tab value="available" label="Available Slots" />
        {isTeacherViewEnabled ? <Tab value="my-slots" label="My Slots" /> : null}
        <Tab value="bookings" label="My Bookings" />
        <Tab value="chats" label="Chats" />
      </Tabs>

      {loading ? (
        <Alert severity="info">Loading sessions...</Alert>
      ) : (
        <>
          {activeTab === "available" ? (
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
              <EmptyState title="No slots available" subtitle="Tutors have not published upcoming slots yet." />
            )
          ) : null}

          {isTeacherViewEnabled && activeTab === "my-slots" ? (
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
              <EmptyState title="No tutor slots yet" subtitle="Create your first slot to start receiving bookings." />
            )
          ) : null}

          {activeTab === "bookings" ? (
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
                    onConfirm={confirmBooking}
                    onReject={rejectBooking}
                  />
                ))}
              </Stack>
            ) : (
              <EmptyState title="No bookings yet" subtitle="Booked sessions will appear here with direct chat access." />
            )
          ) : null}

          {activeTab === "chats" ? (
            chatOnlyBookings.length ? (
              <Stack spacing={1.25}>
                {chatOnlyBookings.map((booking) => (
                  <Paper key={`chat-${booking.booking_id || booking.id}`} sx={{ p: 2, borderRadius: 2.5, border: "1px solid", borderColor: "divider" }}>
                    <Stack direction={{ xs: "column", md: "row" }} spacing={1.2} alignItems={{ md: "center" }}>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="subtitle2" fontWeight={700} noWrap>
                          {isTeacherViewEnabled ? booking.student_name || "Student" : booking.teacher_name || "Teacher"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Session: {new Date(booking.start_at).toLocaleDateString()} • {String(booking.status || "confirmed")}
                        </Typography>
                      </Box>
                      <Button
                        variant="contained"
                        onClick={() => openChat(booking)}
                        sx={{ textTransform: "none", borderRadius: 2, fontWeight: 700 }}
                      >
                        Open Chat
                      </Button>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            ) : (
              <EmptyState title="No chats yet" subtitle="Booked sessions will appear here as a dedicated chat inbox." />
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
