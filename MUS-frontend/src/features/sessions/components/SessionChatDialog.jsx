import PropTypes from "prop-types";
import { Alert, alpha, Box, Dialog, DialogActions, DialogContent, DialogTitle, Divider, IconButton, Paper, Stack, TextField, Typography } from "@mui/material";
import { AccessTime, Close, Send } from "@mui/icons-material";
import { AsyncButton, EmptyState } from "@/shared/components/ui";
import { formatDate } from "./sessionUtils";

const SessionChatDialog = ({ open, onClose, loading, booking, messages, userId, draft, setDraft, sending, onSend }) => (
  <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
    <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <Stack direction="row" spacing={1} alignItems="center">
        <AccessTime color="primary" />
        <Box>
          <Typography variant="subtitle1" fontWeight={700}>Session Chat</Typography>
          <Typography variant="caption" color="text.secondary">
            {booking ? `${formatDate(booking.start_at)} - ${formatDate(booking.end_at)}` : ""}
          </Typography>
        </Box>
      </Stack>
      <IconButton onClick={onClose}>
        <Close />
      </IconButton>
    </DialogTitle>
    <Divider />
    <DialogContent sx={{ p: 0 }}>
      <Box
        sx={(theme) => ({
          minHeight: 320,
          maxHeight: 460,
          overflowY: "auto",
          px: 2,
          py: 1.5,
          background: theme.palette.mode === "dark"
            ? `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, transparent 55%)`
            : `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, transparent 58%)`,
        })}
      >
        {loading ? (
          <Alert severity="info">Loading chat...</Alert>
        ) : messages.length ? (
          <Stack spacing={1}>
            {messages.map((message) => {
              const mine = message.sender_id === userId;
              return (
                <Box key={message.id} sx={{ display: "flex", justifyContent: mine ? "flex-end" : "flex-start" }}>
                  <Paper
                    sx={(theme) => ({
                      p: 1.1,
                      maxWidth: "80%",
                      borderRadius: 2,
                      bgcolor: mine ? alpha(theme.palette.primary.main, 0.16) : alpha(theme.palette.background.paper, 0.9),
                      border: "1px solid",
                      borderColor: mine ? alpha(theme.palette.primary.main, 0.35) : "divider",
                    })}
                  >
                    <Typography variant="caption" color="text.secondary">
                      {message.sender_name || "User"}
                    </Typography>
                    <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                      {message.body}
                    </Typography>
                  </Paper>
                </Box>
              );
            })}
          </Stack>
        ) : (
          <EmptyState title="No messages yet" subtitle="Start the conversation with your first message." />
        )}
      </Box>
    </DialogContent>
    <Divider />
    <DialogActions sx={{ px: 2, py: 1.25 }}>
      <TextField
        placeholder="Write your message..."
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        fullWidth
        size="small"
      />
      <AsyncButton
        loading={sending}
        onClick={onSend}
        variant="contained"
        startIcon={<Send sx={{ fontSize: 16 }} />}
        sx={{ textTransform: "none", borderRadius: 2 }}
      >
        Send
      </AsyncButton>
    </DialogActions>
  </Dialog>
);

SessionChatDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  booking: PropTypes.object,
  messages: PropTypes.array.isRequired,
  userId: PropTypes.string,
  draft: PropTypes.string.isRequired,
  setDraft: PropTypes.func.isRequired,
  sending: PropTypes.bool.isRequired,
  onSend: PropTypes.func.isRequired,
};

export default SessionChatDialog;
