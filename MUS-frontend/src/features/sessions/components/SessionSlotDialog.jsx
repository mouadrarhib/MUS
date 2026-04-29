import PropTypes from "prop-types";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from "@mui/material";
import { AsyncButton } from "@/shared/components/ui";

const SessionSlotDialog = ({ open, editingSlot, draft, setDraft, submitting, onClose, onSave }) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle>{editingSlot ? "Edit Slot" : "Create Slot"}</DialogTitle>
    <DialogContent>
      <Stack spacing={2} sx={{ mt: 0.5 }}>
        <TextField
          label="Start time"
          type="datetime-local"
          value={draft.start_at}
          onChange={(event) => setDraft((prev) => ({ ...prev, start_at: event.target.value }))}
          InputLabelProps={{ shrink: true }}
          fullWidth
        />
        <TextField
          label="End time"
          type="datetime-local"
          value={draft.end_at}
          onChange={(event) => setDraft((prev) => ({ ...prev, end_at: event.target.value }))}
          InputLabelProps={{ shrink: true }}
          fullWidth
        />
        <TextField
          label="Timezone"
          value={draft.timezone}
          onChange={(event) => setDraft((prev) => ({ ...prev, timezone: event.target.value }))}
          fullWidth
        />
      </Stack>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Cancel</Button>
      <AsyncButton loading={submitting} onClick={onSave} variant="contained">
        {editingSlot ? "Save" : "Create"}
      </AsyncButton>
    </DialogActions>
  </Dialog>
);

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
