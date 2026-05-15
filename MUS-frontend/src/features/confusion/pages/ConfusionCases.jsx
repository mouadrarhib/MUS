import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { AssignmentTurnedIn, Refresh, ReportProblem } from '@mui/icons-material';
import { EmptyState, PageHeader, useNotification } from '@/shared/components/ui';
import confusionService from '@/services/confusionService';
import moduleService from '@/services/moduleService';
import usersService from '@/services/usersService';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';

const STATUS_OPTIONS = ['nouveau', 'assigne', 'en_cours', 'repondu_officiel', 'resolu'];
const STATUS_TRANSITIONS = {
  nouveau: ['assigne', 'en_cours'],
  assigne: ['en_cours', 'repondu_officiel', 'resolu'],
  en_cours: ['repondu_officiel', 'resolu'],
  repondu_officiel: ['en_cours', 'resolu'],
  resolu: ['en_cours'],
};

const getCaseId = (item) => Number(item?.id || item?.case_id || 0);
const getCaseStatus = (item) => String(item?.status || 'nouveau');
const getCaseResourceId = (item) => Number(item?.resource_id || 0);
const getCaseQuestionId = (item) => Number(item?.question_id || 0);
const getCaseAnswerId = (item) => Number(item?.official_answer_id || item?.answer_id || 0);
const getStudentName = (item) => item?.student_name || item?.student_full_name || item?.student_email || 'Student';
const getModuleLabel = (item) => item?.module_label || item?.module_title || item?.module_code || 'Unknown module';
const getResourceLabel = (item) => item?.resource_title || item?.title || 'Unknown resource';
const getAssigneeLabel = (item) => item?.assigned_to_user_name || item?.assigned_to_full_name || item?.assigned_to_name || 'Unassigned';
const formatDateTime = (value) => {
  if (!value) return 'N/A';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'N/A';
  return parsed.toLocaleString();
};

const getEventDescription = (event) => {
  const payload = event?.payload && typeof event.payload === 'object' ? event.payload : {};
  if (payload.reason) return payload.reason;
  switch (event?.event_type) {
    case 'auto_assigned':
      return 'The case was automatically routed to an available referent.';
    case 'admin_assigned':
      return 'An administrator updated the assignee for this case.';
    case 'official_answer_linked':
      return 'A teacher linked an official Q&A answer to this case.';
    case 'resolved':
      return 'This case was marked as resolved.';
    case 'reopened':
      return 'This case was reopened for additional follow-up.';
    case 'status_changed':
      return payload.status ? `Status changed to ${statusLabelMap[payload.status] || payload.status}.` : 'Status updated.';
    default:
      return '';
  }
};

const statusColorMap = {
  nouveau: 'default',
  assigne: 'info',
  en_cours: 'warning',
  repondu_officiel: 'secondary',
  resolu: 'success',
};

const statusLabelMap = {
  nouveau: 'New issue',
  assigne: 'Assigned',
  en_cours: 'In review',
  repondu_officiel: 'Official answer posted',
  resolu: 'Resolved',
};

const eventLabelMap = {
  case_created: 'Case created',
  signal_attached: 'Signal attached',
  auto_assigned: 'Automatically assigned',
  admin_assigned: 'Assigned by admin',
  status_changed: 'Status updated',
  official_answer_linked: 'Official answer linked',
  resolved: 'Case resolved',
  reopened: 'Case reopened',
};

const badgeLabelMap = {
  signal_recu: 'Student reported issue',
  pris_en_charge: 'Handled by staff',
  reponse_officielle: 'Official answer linked',
  resolu: 'Resolved',
};

const statusActionLabelMap = {
  assigne: 'Assign to staff',
  en_cours: 'Start review',
  repondu_officiel: 'Official answer posted',
  resolu: 'Mark resolved',
};

const getNextActionHint = (item) => {
  const status = getCaseStatus(item);
  if (status === 'nouveau') return 'Review the student context and assign the right referent.';
  if (status === 'assigne') return 'Coordinate with the assigned referent and start the review.';
  if (status === 'en_cours') return 'Answer the linked Q&A thread and guide the student toward a clear resolution.';
  if (status === 'repondu_officiel') return 'Confirm the official answer solved the issue, then mark the case resolved.';
  if (status === 'resolu') return 'Keep this case as historical context unless the issue needs to be reopened.';
  return 'Follow the next pedagogical step with the student.';
};

const getStudentNote = (item) => item?.latest_note || item?.note || item?.signal_note || item?.last_signal_note || '';

const ConfusionCases = () => {
  const { isAdmin } = useAuth();
  const { showSuccess, showError, showInfo } = useNotification();
  const location = useLocation();
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCaseId, setSelectedCaseId] = useState(null);
  const [selectedCase, setSelectedCase] = useState(null);
  const [events, setEvents] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [filters, setFilters] = useState({ status: '', moduleId: '', assignedToMe: false });
  const [modules, setModules] = useState([]);
  const [assignees, setAssignees] = useState([]);
  const [assigning, setAssigning] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [assignmentUserId, setAssignmentUserId] = useState('');
  const [assignmentReason, setAssignmentReason] = useState('');
  const [statusReason, setStatusReason] = useState('');
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const requestedCaseId = Number(new URLSearchParams(location.search).get('case') || 0) || null;

  const loadCaseDetails = async (caseId) => {
    const [details, eventRows] = await Promise.all([
      confusionService.getCaseDetails(caseId),
      confusionService.listCaseEvents(caseId, { limit: 50 }),
    ]);
    setSelectedCase(details);
    setEvents(Array.isArray(eventRows) ? eventRows : []);
    setAssignmentUserId(String(details?.assigned_to_user_id || ''));
  };

  const loadCases = useCallback(async ({ keepSelection = true } = {}) => {
    setLoading(true);
    setError('');
    try {
      const rows = await confusionService.listStaffCases({
        status: filters.status || undefined,
        moduleId: filters.moduleId ? Number(filters.moduleId) : undefined,
        assignedToMe: filters.assignedToMe,
        page: 1,
        limit: 50,
      });
      setCases(rows);
      setSelectedCaseId((current) => {
        if (requestedCaseId && rows.some((item) => getCaseId(item) === requestedCaseId)) return requestedCaseId;
        if (keepSelection && rows.some((item) => getCaseId(item) === current)) return current;
        return getCaseId(rows[0]) || null;
      });
    } catch (nextError) {
      setError(nextError?.response?.data?.message || nextError?.message || 'Unable to load confusion cases.');
      setCases([]);
      setSelectedCaseId(null);
    } finally {
      setLoading(false);
    }
  }, [filters.status, filters.moduleId, filters.assignedToMe, requestedCaseId]);

  useEffect(() => {
    loadCases({ keepSelection: false });
  }, [loadCases]);

  useEffect(() => {
    if (!requestedCaseId || !selectedCaseId || requestedCaseId !== selectedCaseId) return;
    showInfo('Opened from a confusion notification.');
    navigate('/dashboard/confusion', { replace: true });
  }, [requestedCaseId, selectedCaseId, showInfo, navigate]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      moduleService.getDiscoverModules().catch(() => []),
      isAdmin ? usersService.getAllUsers({ force: true }).catch(() => []) : Promise.resolve([]),
    ]).then(([moduleRows, userRows]) => {
      if (cancelled) return;
      setModules(Array.isArray(moduleRows) ? moduleRows : []);
      setAssignees(
        (Array.isArray(userRows) ? userRows : []).filter((item) => ['teacher', 'admin'].includes(String(item?.primary_role || '').toLowerCase()))
      );
    });

    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  useEffect(() => {
    if (!selectedCaseId) {
      setSelectedCase(null);
      setEvents([]);
      setAssignmentUserId('');
      return;
    }

    let cancelled = false;
    setDetailLoading(true);
    setFeedback({ type: '', message: '' });

    Promise.all([
      confusionService.getCaseDetails(selectedCaseId),
      confusionService.listCaseEvents(selectedCaseId, { limit: 50 }),
    ])
      .then(([details, eventRows]) => {
        if (cancelled) return;
        setSelectedCase(details);
        setEvents(Array.isArray(eventRows) ? eventRows : []);
        setAssignmentUserId(String(details?.assigned_to_user_id || ''));
      })
      .catch((nextError) => {
        if (cancelled) return;
        setSelectedCase(null);
        setEvents([]);
        setFeedback({
          type: 'error',
          message: nextError?.response?.data?.message || nextError?.message || 'Unable to load case details.',
        });
      })
      .finally(() => {
        if (!cancelled) setDetailLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedCaseId]);

  const selectedStatus = getCaseStatus(selectedCase);
  const allowedStatusTransitions = useMemo(() => STATUS_TRANSITIONS[selectedStatus] || [], [selectedStatus]);
  const selectedCasePreviewLink = useMemo(() => {
    if (!selectedCase) return null;
    const resourceId = getCaseResourceId(selectedCase);
    if (!resourceId) return null;
    const params = new URLSearchParams();
    const questionId = getCaseQuestionId(selectedCase);
    const answerId = getCaseAnswerId(selectedCase);
    if (questionId > 0) params.set('question', String(questionId));
    if (answerId > 0) params.set('answer', String(answerId));
    return `/discover/resources/${resourceId}/preview${params.toString() ? `?${params}` : ''}`;
  }, [selectedCase]);

  const handleAssign = async () => {
    if (!isAdmin || !selectedCaseId || !assignmentUserId || assigning) return;
    setAssigning(true);
    setFeedback({ type: '', message: '' });
    try {
      await confusionService.assignCase(selectedCaseId, {
        assignee_user_id: assignmentUserId,
        reason: assignmentReason.trim() || undefined,
      });
      setAssignmentReason('');
      setFeedback({ type: 'success', message: 'Case assigned successfully.' });
      showSuccess('Case assignment saved.');
      await loadCases();
      await loadCaseDetails(selectedCaseId);
    } catch (nextError) {
      showError(nextError?.response?.data?.message || nextError?.message || 'Unable to assign case.');
      setFeedback({ type: 'error', message: nextError?.response?.data?.message || nextError?.message || 'Unable to assign case.' });
    } finally {
      setAssigning(false);
    }
  };

  const handleStatusUpdate = async (nextStatus) => {
    if (!selectedCaseId || !nextStatus || statusUpdating) return;
    setStatusUpdating(true);
    setFeedback({ type: '', message: '' });
    try {
      await confusionService.updateCaseStatus(selectedCaseId, {
        status: nextStatus,
        reason: statusReason.trim() || undefined,
      });
      setStatusReason('');
      setFeedback({ type: 'success', message: `Case moved to ${nextStatus}.` });
      showSuccess(`Case updated: ${statusLabelMap[nextStatus] || nextStatus}.`);
      await loadCases();
      await loadCaseDetails(selectedCaseId);
    } catch (nextError) {
      showError(nextError?.response?.data?.message || nextError?.message || 'Unable to update case status.');
      setFeedback({ type: 'error', message: nextError?.response?.data?.message || nextError?.message || 'Unable to update case status.' });
    } finally {
      setStatusUpdating(false);
    }
  };

  return (
    <Box>
      <PageHeader
        title="Confusion Cases"
        subtitle="Review blocked students, follow the support workflow, and confirm when an official answer resolves the issue."
        icon={ReportProblem}
        breadcrumbs={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Confusion Cases' }]}
        actions={
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => loadCases()}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Refresh
          </Button>
        }
      />

      {feedback.message ? <Alert severity={feedback.type || 'info'} sx={{ mb: 2 }}>{feedback.message}</Alert> : null}
      <Alert severity="info" sx={{ mb: 2 }}>
        Staff workflow: review the student issue, answer in the linked Q&A thread, then move the case toward resolution.
      </Alert>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: '360px 1fr' }, gap: 2 }}>
        <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: (t) => `${t.shape.xl}px`, p: 2, backgroundColor: 'background.paper' }}>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>Case filters</Typography>
          <Stack spacing={1.5}>
            <FormControl size="small" fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                label="Status"
                onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}
              >
                <MenuItem value="">All statuses</MenuItem>
                {STATUS_OPTIONS.map((status) => (
                  <MenuItem key={status} value={status}>{statusLabelMap[status] || status}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" fullWidth>
              <InputLabel>Module</InputLabel>
              <Select
                value={filters.moduleId}
                label="Module"
                onChange={(event) => setFilters((prev) => ({ ...prev, moduleId: event.target.value }))}
              >
                <MenuItem value="">All modules</MenuItem>
                {modules.map((moduleItem) => (
                  <MenuItem key={moduleItem.id || moduleItem.module_id} value={String(moduleItem.id || moduleItem.module_id)}>
                    {(moduleItem.code || moduleItem.module_code) ? `${moduleItem.code || moduleItem.module_code} - ` : ''}
                    {moduleItem.title || moduleItem.module_title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="body2">Assigned to me only</Typography>
              <Switch
                checked={filters.assignedToMe}
                onChange={(event) => setFilters((prev) => ({ ...prev, assignedToMe: event.target.checked }))}
              />
            </Stack>
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
            Cases {loading ? '' : `(${cases.length})`}
          </Typography>

          {loading ? (
            <Stack direction="row" spacing={1} alignItems="center">
              <CircularProgress size={18} />
              <Typography variant="body2" color="text.secondary">Loading cases...</Typography>
            </Stack>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : !cases.length ? (
            <EmptyState title="No confusion cases" description="No cases match the current filters." icon={AssignmentTurnedIn} />
              ) : (
                <Stack spacing={1}>
                  {cases.map((item) => {
                const caseId = getCaseId(item);
                const isSelected = caseId === selectedCaseId;
                return (
                  <Box
                    key={caseId}
                    role="button"
                    onClick={() => setSelectedCaseId(caseId)}
                    sx={(theme) => ({
                      border: '1px solid',
                      borderColor: isSelected ? 'primary.main' : 'divider',
                      borderRadius: 2,
                      p: 1.25,
                      cursor: 'pointer',
                      backgroundColor: isSelected ? theme.palette.action.hover : 'transparent',
                    })}
                  >
                    <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                      <Typography variant="body2" fontWeight={700}>Case #{caseId}</Typography>
                      <Chip size="small" label={statusLabelMap[getCaseStatus(item)] || getCaseStatus(item)} color={statusColorMap[getCaseStatus(item)] || 'default'} />
                    </Stack>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.6 }}>
                          {getResourceLabel(item)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.4 }}>
                          {getStudentName(item)} • {getModuleLabel(item)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.45 }}>
                          Next step: {getNextActionHint(item)}
                        </Typography>
                      </Box>
                    );
                  })}
                </Stack>
              )}
        </Box>

        <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: (t) => `${t.shape.xl}px`, p: 2, backgroundColor: 'background.paper', minHeight: 420 }}>
          {!selectedCaseId ? (
            <EmptyState title="Select a case" description="Choose a confusion case to review details, update status, or assign a referent." icon={ReportProblem} />
          ) : detailLoading ? (
            <Stack direction="row" spacing={1} alignItems="center">
              <CircularProgress size={18} />
              <Typography variant="body2" color="text.secondary">Loading case details...</Typography>
            </Stack>
          ) : !selectedCase ? (
            <Alert severity="warning">Case details are unavailable right now.</Alert>
          ) : (
            <Stack spacing={2}>
              <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
                <Box>
                  <Typography variant="h6" fontWeight={700}>Case #{getCaseId(selectedCase)}</Typography>
                  <Typography variant="body2" color="text.secondary">{getResourceLabel(selectedCase)}</Typography>
                  <Typography variant="caption" color="text.secondary">{getStudentName(selectedCase)} • {getModuleLabel(selectedCase)}</Typography>
                </Box>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Chip label={statusLabelMap[selectedStatus] || selectedStatus} color={statusColorMap[selectedStatus] || 'default'} />
                  {Array.isArray(selectedCase.badges) ? selectedCase.badges.map((badge) => (
                    <Chip key={badge} size="small" label={badgeLabelMap[badge] || badge} variant="outlined" />
                  )) : null}
                </Stack>
              </Stack>

              <Alert severity="info">
                Next step: {getNextActionHint(selectedCase)}
              </Alert>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 1.5 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Assigned to</Typography>
                  <Typography variant="body2">{getAssigneeLabel(selectedCase)}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Updated at</Typography>
                  <Typography variant="body2">{formatDateTime(selectedCase.updated_at || selectedCase.created_at)}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">First signal</Typography>
                  <Typography variant="body2">{formatDateTime(selectedCase.first_signal_at || selectedCase.created_at)}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Resolved at</Typography>
                  <Typography variant="body2">{formatDateTime(selectedCase.resolved_at)}</Typography>
                </Box>
              </Box>

              {getStudentNote(selectedCase) ? (
                <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 1.5 }}>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.8 }}>Latest student note</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                    {getStudentNote(selectedCase)}
                  </Typography>
                </Box>
              ) : null}

              {selectedCasePreviewLink ? (
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                  <Button component="a" href={selectedCasePreviewLink} target="_blank" rel="noreferrer" variant="contained" sx={{ textTransform: 'none', borderRadius: 2 }}>
                    Open Q&A thread to answer student
                  </Button>
                  <Button component="a" href={selectedCasePreviewLink} target="_blank" rel="noreferrer" variant="outlined" sx={{ textTransform: 'none', borderRadius: 2 }}>
                    Open read-only discussion preview
                  </Button>
                </Stack>
              ) : null}

              {selectedCase.official_answer_id || selectedCase.answer_id ? (
                <Alert severity="info">
                  An official answer is already linked to this case. Review the discussion, confirm the student is unblocked, then mark the case resolved when appropriate.
                </Alert>
              ) : (
                <Alert severity="warning">No official answer is linked yet. A teacher should answer the student through the Q&A thread before resolving the case.</Alert>
              )}

              {isAdmin ? (
                <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 1.5 }}>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>Assign / reassign case</Typography>
                  <Stack spacing={1.25}>
                    <FormControl size="small" fullWidth>
                      <InputLabel>Assignee</InputLabel>
                      <Select
                        value={assignmentUserId}
                        label="Assignee"
                        onChange={(event) => setAssignmentUserId(event.target.value)}
                      >
                        {assignees.map((user) => (
                          <MenuItem key={user.user_id} value={String(user.user_id)}>
                            {user.full_name} ({user.primary_role})
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <TextField
                      size="small"
                      label="Reason (optional)"
                      value={assignmentReason}
                      onChange={(event) => setAssignmentReason(event.target.value)}
                    />
                    <Box>
                      <Button
                        variant="contained"
                        onClick={handleAssign}
                        disabled={!assignmentUserId || assigning}
                        sx={{ textTransform: 'none', borderRadius: 2 }}
                      >
                        {assigning ? 'Assigning...' : 'Save assignment'}
                      </Button>
                    </Box>
                  </Stack>
                </Box>
              ) : null}

              <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 1.5 }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>Update status</Typography>
                <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.25} alignItems={{ lg: 'center' }}>
                  <TextField
                    size="small"
                    fullWidth
                    label="Reason (optional)"
                    value={statusReason}
                    onChange={(event) => setStatusReason(event.target.value)}
                  />
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {allowedStatusTransitions.map((status) => (
                      <Button
                        key={status}
                        variant="outlined"
                        onClick={() => handleStatusUpdate(status)}
                        disabled={statusUpdating}
                        sx={{ textTransform: 'none', borderRadius: 2 }}
                      >
                        {statusUpdating ? 'Updating...' : (statusActionLabelMap[status] || statusLabelMap[status] || status)}
                      </Button>
                    ))}
                  </Stack>
                </Stack>
              </Box>

              <Box>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>Case timeline</Typography>
                {!events.length ? (
                  <Typography variant="body2" color="text.secondary">No timeline events yet.</Typography>
                ) : (
                  <Stack spacing={1}>
                    {events.map((event) => (
                      <Box key={event.id} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 1.25 }}>
                        <Typography variant="body2" fontWeight={600}>{eventLabelMap[event.event_type] || event.event_type}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>
                          {eventLabelMap[event.event_type] || event.event_type}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          {event.actor_user_name || 'System'} • {formatDateTime(event.created_at)}
                        </Typography>
                        {getEventDescription(event) ? (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            {getEventDescription(event)}
                          </Typography>
                        ) : null}
                      </Box>
                    ))}
                  </Stack>
                )}
              </Box>
            </Stack>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ConfusionCases;
