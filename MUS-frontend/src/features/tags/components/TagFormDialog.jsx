// src/features/tags/components/TagFormDialog.jsx
import { memo, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Alert, alpha, Box, Button, Dialog, Divider, FormControlLabel,
  FormControl, IconButton, MenuItem, Select, Stack, Switch,
  TextField, Tooltip, Typography,
} from '@mui/material';
import {
  ArrowBack, ArrowForward, Check, Close,
  InfoOutlined, LocalOffer, TuneRounded,
} from '@mui/icons-material';
import { AsyncButton } from '@/shared/components/ui';
import { CATEGORY_OPTIONS, slugify } from './tagsConstants';

// ─── Module-scope constants ───────────────────────────────────────────────────

const SIDEBAR_BG     = '#0f172a';
const SIDEBAR_ACCENT = '#14b8a6';

const BASE_STEPS = [
  { label: 'Name & Category', description: 'Core tag identity and slug', icon: LocalOffer   },
  { label: 'Description',     description: 'Context for search & discovery', icon: InfoOutlined },
];
const STATUS_STEP = {
  label: 'Activation Status', description: 'Control visibility in selectors', icon: TuneRounded,
};

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px', fontSize: '0.875rem', transition: 'box-shadow 0.15s ease',
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main' },
    '&.Mui-focused': { boxShadow: (t) => `0 0 0 3px ${alpha(t.palette.primary.main, 0.12)}` },
  },
};

// ─── FieldLabel ───────────────────────────────────────────────────────────────
const FieldLabel = memo(({ children, required, hint }) => (
  <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.75 }}>
    <Typography sx={{ fontSize: '0.695rem', fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: 'text.secondary' }}>
      {children}
      {required && <Box component="span" sx={{ color: 'error.main', ml: 0.3 }}>*</Box>}
    </Typography>
    {hint && (
      <Tooltip title={hint} placement="top" arrow>
        <InfoOutlined sx={{ fontSize: 12, color: 'text.disabled', cursor: 'help' }} />
      </Tooltip>
    )}
  </Stack>
));
FieldLabel.displayName = 'FieldLabel';

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const Sidebar = memo(({ editingTag, draftName, draftCategory, steps, activeStep, onClose }) => (
  <Box sx={{
    width: { xs: 0, sm: 210 }, flexShrink: 0,
    bgcolor: SIDEBAR_BG, display: { xs: 'none', sm: 'flex' },
    flexDirection: 'column', overflow: 'hidden',
  }}>
    {/* Header */}
    <Box sx={{ px: 2.5, pt: 2.5, pb: 2 }}>
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
        <Box>
          <Typography sx={{ fontWeight: (t) => t.typography.fontWeightExtraBold, color: 'white', fontSize: '0.9rem', letterSpacing: -0.2, lineHeight: 1.2 }}>
            {editingTag ? 'Edit Tag' : 'Create Tag'}
          </Typography>
          <Typography sx={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.38)', mt: 0.4, display: 'block', lineHeight: 1.4 }} noWrap>
            {draftName || 'Fill in the details below'}
          </Typography>
        </Box>
        <IconButton
          size="small" onClick={onClose} aria-label="Close dialog"
          sx={{ color: 'rgba(255,255,255,0.4)', borderRadius: '8px', p: 0.5,
                '&:hover': { color: 'white', bgcolor: 'rgba(255,255,255,0.08)' } }}
        >
          <Close sx={{ fontSize: 16 }} />
        </IconButton>
      </Stack>
    </Box>

    <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />

    {/* Vertical stepper */}
    <Box sx={{ px: 2.5, py: 2.5, flex: 1 }}>
      {steps.map((step, i) => {
        const done    = i < activeStep;
        const current = i === activeStep;
        const Icon    = step.icon;
        return (
          <Box key={step.label} sx={{ display: 'flex', gap: 1.5 }}>
            {/* Circle + connector */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Box sx={{
                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                bgcolor: done ? SIDEBAR_ACCENT : current ? 'rgba(20,184,166,0.15)' : 'rgba(255,255,255,0.07)',
                border: `1.5px solid ${done ? SIDEBAR_ACCENT : current ? SIDEBAR_ACCENT : 'rgba(255,255,255,0.1)'}`,
                transition: 'all 0.2s ease',
              }}>
                {done
                  ? <Check sx={{ fontSize: 13, color: 'white' }} />
                  : <Icon sx={{ fontSize: 13, color: current ? SIDEBAR_ACCENT : 'rgba(255,255,255,0.25)' }} />
                }
              </Box>
              {i < steps.length - 1 && (
                <Box sx={{
                  width: '1.5px', flex: 1, minHeight: 24, my: 0.5,
                  bgcolor: done ? `${SIDEBAR_ACCENT}55` : 'rgba(255,255,255,0.08)',
                  transition: 'background 0.3s ease',
                }} />
              )}
            </Box>

            {/* Label + description */}
            <Box sx={{ pb: i < steps.length - 1 ? 2.5 : 0, pt: 0.25 }}>
              <Typography sx={{
                fontSize: '0.8rem', fontWeight: current ? 700 : done ? 600 : 400,
                color: current ? 'white' : done ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.28)',
                lineHeight: 1.2, transition: 'color 0.2s ease',
              }}>
                {step.label}
              </Typography>
              <Typography sx={{ fontSize: '0.68rem', mt: 0.2, lineHeight: 1.4,
                color: current ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.18)' }}>
                {step.description}
              </Typography>
            </Box>
          </Box>
        );
      })}
    </Box>

    {/* Live preview */}
    {draftName && (
      <>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />
        <Box sx={{ p: 2.5 }}>
          <Typography sx={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.28)', display: 'block', mb: 1.25 }}>
            Preview
          </Typography>
          <Box sx={{ p: 1.5, borderRadius: '10px', bgcolor: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-dark)' }}>
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: 'rgba(255,255,255,0.85)', mb: 0.75,
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {draftName}
            </Typography>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5,
              px: 1, py: 0.25, borderRadius: '6px',
              bgcolor: `${SIDEBAR_ACCENT}2a`, border: `1px solid ${SIDEBAR_ACCENT}40` }}>
              <LocalOffer sx={{ fontSize: 10, color: SIDEBAR_ACCENT }} />
              <Typography sx={{ fontSize: '0.62rem', fontWeight: 700, color: SIDEBAR_ACCENT, textTransform: 'capitalize' }}>
                {draftCategory || 'topic'}
              </Typography>
            </Box>
          </Box>
        </Box>
      </>
    )}
  </Box>
));
Sidebar.displayName = 'Sidebar';

// ─── TagFormDialog ────────────────────────────────────────────────────────────
const TagFormDialog = memo(({
  open, editingTag, draft, submitting, formError,
  onClose, onDraftChange, onSave, t,
}) => {
  const steps = useMemo(() => (editingTag ? [...BASE_STEPS, STATUS_STEP] : BASE_STEPS), [editingTag]);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (!open) return;
    setActiveStep(0);
  }, [open, editingTag?.id]);

  const isNameValid = draft.name.trim().length >= 2;
  const canContinue = activeStep !== 0 || isNameValid;
  const isLastStep  = activeStep === steps.length - 1;

  const handleNext = () => { if (canContinue && !isLastStep) setActiveStep((p) => p + 1); };
  const handleBack = () => setActiveStep((p) => Math.max(0, p - 1));

  const StepIcon = steps[activeStep].icon;

  return (
    <Dialog
      open={open}
      onClose={submitting ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      transitionDuration={{ enter: 180, exit: 80 }}
      PaperProps={{
        elevation: 0,
        sx: {
          borderRadius: '20px',
          border: '1px solid', borderColor: 'divider',
          overflow: 'hidden', display: 'flex', flexDirection: 'row',
          minHeight: { sm: 480 },
        },
      }}
    >
      {/* ── Sidebar ── */}
      <Sidebar
        editingTag={editingTag}
        draftName={draft.name}
        draftCategory={draft.category}
        steps={steps}
        activeStep={activeStep}
        onClose={submitting ? undefined : onClose}
      />

      {/* ── Form panel ── */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        {/* Step header */}
        <Box sx={(t) => ({
          px: { xs: 2.5, sm: 3 }, pt: 2.75, pb: 2.25,
          borderBottom: '1px solid', borderColor: 'divider',
          bgcolor: t.palette.mode === 'dark'
            ? alpha(t.palette.common.white, 0.015)
            : alpha(t.palette.common.black, 0.01),
        })}>
          <Stack direction="row" alignItems="center" spacing={1.25}>
            <StepIcon sx={{ fontSize: 18, color: 'primary.main' }} />
            <Box>
              <Typography variant="subtitle2" fontWeight={800} sx={{ lineHeight: 1.15, fontSize: '0.9375rem' }}>
                {steps[activeStep].label}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {steps[activeStep].description}
              </Typography>
            </Box>
          </Stack>
          {formError && <Alert severity="error" sx={{ mt: 1.5, borderRadius: '10px', py: 0.5 }}>{formError}</Alert>}
        </Box>

        {/* Scrollable content */}
        <Box sx={{ flex: 1, overflowY: 'auto', px: { xs: 2.5, sm: 3 }, py: 3 }}>
          {activeStep === 0 && (
            <Stack spacing={2.5}>
              {/* Tag name */}
              <Box>
                <FieldLabel required>Tag Name</FieldLabel>
                <TextField
                  value={draft.name}
                  onChange={(e) => onDraftChange('name', e.target.value)}
                  autoFocus fullWidth size="small" sx={fieldSx}
                  placeholder="e.g. Machine Learning"
                  error={draft.name.trim().length > 0 && !isNameValid}
                  helperText={draft.name.trim().length > 0 && !isNameValid
                    ? 'Tag name must be at least 2 characters.' : ''}
                />
              </Box>

              {/* Slug */}
              <Box>
                <FieldLabel hint="Auto-generated from the name. Lowercase letters, numbers and hyphens only.">Slug</FieldLabel>
                <TextField
                  value={draft.slug}
                  onChange={(e) => onDraftChange('slug', slugify(e.target.value))}
                  fullWidth size="small" sx={fieldSx}
                  placeholder="machine-learning"
                  helperText="Normalized automatically when the name changes."
                />
              </Box>

              {/* Category */}
              <Box>
                <FieldLabel required>Category</FieldLabel>
                <FormControl fullWidth size="small">
                  <Select
                    value={draft.category || 'topic'}
                    onChange={(e) => onDraftChange('category', e.target.value)}
                    sx={{ borderRadius: '10px', fontSize: '0.875rem' }}
                  >
                    {CATEGORY_OPTIONS.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Stack>
          )}

          {activeStep === 1 && (
            <Box>
              <FieldLabel hint="Displayed in tag selectors and search results to help users choose the right tag.">
                Description
              </FieldLabel>
              <TextField
                value={draft.description}
                onChange={(e) => onDraftChange('description', e.target.value)}
                multiline minRows={5} fullWidth size="small" sx={fieldSx}
                placeholder="Briefly describe what this tag is for…"
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Optional but recommended — helps students pick the most relevant tags.
              </Typography>
            </Box>
          )}

          {activeStep === 2 && editingTag && (
            <Box>
              <Box sx={(t) => ({
                p: 2.25, borderRadius: '12px',
                border: '1.5px solid', borderColor: draft.is_active
                  ? alpha(t.palette.success.main, 0.3)
                  : alpha(t.palette.warning.main, 0.3),
                bgcolor: draft.is_active
                  ? alpha(t.palette.success.main, 0.04)
                  : alpha(t.palette.warning.main, 0.04),
                transition: 'all 0.18s ease',
              })}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={!!draft.is_active}
                      onChange={(e) => onDraftChange('is_active', e.target.checked)}
                      color="success"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2" fontWeight={700}>
                        {draft.is_active ? 'Active' : 'Inactive'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {draft.is_active
                          ? 'Visible in tag selectors and search suggestions.'
                          : 'Hidden from selectors — existing assignments are kept.'}
                      </Typography>
                    </Box>
                  }
                />
              </Box>
            </Box>
          )}
        </Box>

        {/* Footer */}
        <Box sx={(t) => ({
          px: { xs: 2.5, sm: 3 }, py: 2,
          display: 'flex', alignItems: 'center', gap: 1,
          borderTop: '1px solid', borderColor: 'divider',
          bgcolor: t.palette.mode === 'dark'
            ? alpha(t.palette.common.white, 0.015)
            : alpha(t.palette.common.black, 0.015),
        })}>
          {/* Progress dots */}
          <Stack direction="row" spacing={0.75} sx={{ mr: 'auto' }}>
            {steps.map((_, i) => (
              <Box key={i} sx={(t) => ({
                height: 5, borderRadius: '99px',
                width: i === activeStep ? 22 : 6,
                bgcolor: i <= activeStep ? t.palette.primary.main : t.palette.divider,
                transition: 'width 0.28s cubic-bezier(0.34,1.56,0.64,1), background 0.2s ease',
              })} />
            ))}
          </Stack>

          <Button
            variant="text" onClick={submitting ? undefined : onClose} disabled={submitting}
            sx={{ textTransform: 'none', borderRadius: '10px', fontWeight: 500, color: 'text.secondary', px: 2 }}
          >
            {t('common.cancel')}
          </Button>

          {activeStep > 0 && (
            <Button
              startIcon={<ArrowBack sx={{ fontSize: '15px !important' }} />}
              variant="outlined" onClick={handleBack} disabled={submitting}
              sx={{
                textTransform: 'none', borderRadius: '10px', fontWeight: 600,
                borderColor: 'divider', color: 'text.primary',
                '&:hover': { borderColor: 'primary.main', bgcolor: (t) => alpha(t.palette.primary.main, 0.04) },
              }}
            >
              Back
            </Button>
          )}

          {!isLastStep ? (
            <Button
              endIcon={<ArrowForward sx={{ fontSize: '15px !important' }} />}
              variant="contained" disableElevation
              onClick={handleNext} disabled={submitting || !canContinue}
              sx={{ textTransform: 'none', borderRadius: '10px', fontWeight: 700, px: 2.5 }}
            >
              Continue
            </Button>
          ) : (
            <AsyncButton
              loading={submitting}
              onClick={onSave}
              variant="contained" disableElevation
              sx={{ textTransform: 'none', borderRadius: '10px', fontWeight: 700, px: 2.5 }}
            >
              {editingTag ? 'Save Changes' : 'Create Tag'}
            </AsyncButton>
          )}
        </Box>
      </Box>
    </Dialog>
  );
});

TagFormDialog.displayName = 'TagFormDialog';

TagFormDialog.propTypes = {
  open:          PropTypes.bool.isRequired,
  editingTag:    PropTypes.object,
  draft:         PropTypes.object.isRequired,
  submitting:    PropTypes.bool.isRequired,
  formError:     PropTypes.string.isRequired,
  onClose:       PropTypes.func.isRequired,
  onDraftChange: PropTypes.func.isRequired,
  onSave:        PropTypes.func.isRequired,
  t:             PropTypes.func.isRequired,
};

export default TagFormDialog;