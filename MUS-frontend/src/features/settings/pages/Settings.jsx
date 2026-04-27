// src/features/settings/pages/Settings.jsx
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert, Autocomplete, Box, CircularProgress, Typography,
  Switch, Button, Select, MenuItem, FormControl, Divider,
  TextField, Chip, ToggleButton, ToggleButtonGroup,
} from '@mui/material';
import {
  Palette, DarkMode, LightMode, FormatSize, Notifications, Email,
  NotificationsActive, NotificationsOff, Security, VpnKey, Devices,
  VisibilityOff, Language, AccessTime, CalendarToday, ManageAccounts,
  Delete, Download, Link, Check, LocalOffer, Settings as SettingsIcon,
} from '@mui/icons-material';
import { useThemeMode } from '@/app/providers/ThemeContext';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useLanguage } from '@/app/providers/LanguageContext';
import userSettingsService from '@/services/userSettingsService';
import personalizationService from '@/services/personalizationService';
import tagService from '@/services/tagService';
import institutionService from '@/services/institutionService';
import institutionProgramService from '@/services/institutionProgramService';
import levelService from '@/services/levelService';
import semesterService from '@/services/semesterService';
import studentProfileService from '@/services/studentProfileService';
import { PageHeader } from '@/shared/components/ui';
import { SettingSection, SettingRow } from '@/features/settings/components/SettingLayout';
import DeleteAccountDialog from '@/features/settings/components/DeleteAccountDialog';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const toList = (response) => {
  const payload = response?.data ?? response;
  return Array.isArray(payload) ? payload : [];
};

const applyFontSize = (size) => {
  localStorage.setItem('fontSize', size);
  document.documentElement.style.fontSize =
    size === 'small' ? '14px' : size === 'large' ? '18px' : '16px';
};

// ─── Settings Page ────────────────────────────────────────────────────────────

const Settings = () => {
  const { mode, setThemeMode } = useThemeMode();
  const { user, isAdmin, isStudent, contributionMode, canContribute, refreshProfile } = useAuth();
  const { language, setLanguage: setAppLanguage, t } = useLanguage();

  // ── Appearance ─────────────────────────────────────────────────────────────
  const [fontSize, setFontSize] = useState(
    () => localStorage.getItem('fontSize') || 'medium'
  );

  // ── Notifications — grouped into one object to avoid stale closure bugs ───
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    resourceAlerts: true,
    weeklyDigest: false,
  });

  // ── Privacy & Security ─────────────────────────────────────────────────────
  const [privacy, setPrivacy] = useState({
    twoFactor: false,
    showActivityStatus: true,
    showProfile: true,
  });

  // ── Language & Region ──────────────────────────────────────────────────────
  const [locale, setLocale] = useState({
    timezone: 'Africa/Casablanca',
    dateFormat: 'DD/MM/YYYY',
  });

  // ── Account Management ─────────────────────────────────────────────────────
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [exportLoading, setExportLoading] = useState(false);
  const exportTimerRef = useRef(null);

  // ── Tag Preferences ────────────────────────────────────────────────────────
  const [availableTags, setAvailableTags] = useState([]);
  const [preferenceTags, setPreferenceTags] = useState([]);
  const [tagPreferencesLoading, setTagPreferencesLoading] = useState(false);
  const [tagPreferencesSaving, setTagPreferencesSaving] = useState(false);
  const [tagPreferencesFeedback, setTagPreferencesFeedback] = useState({ type: '', message: '' });

  // ── Academic Information ───────────────────────────────────────────────────
  const [academicLoading, setAcademicLoading] = useState(false);
  const [academicSaving, setAcademicSaving] = useState(false);
  const [academicFeedback, setAcademicFeedback] = useState({ type: '', message: '' });
  const [academicCatalogLoading, setAcademicCatalogLoading] = useState({
    institutions: false, programs: false, levels: false, semesters: false,
  });
  const [academicInstitutions, setAcademicInstitutions] = useState([]);
  const [academicPrograms, setAcademicPrograms] = useState([]);
  const [academicLevels, setAcademicLevels] = useState([]);
  const [academicSemesters, setAcademicSemesters] = useState([]);
  const [academicIds, setAcademicIds] = useState({
    institution: '', program: '', level: '', semester: '',
  });
  const [studentContributionMode, setStudentContributionMode] = useState('contributor');
  const [contributionModeSaving, setContributionModeSaving] = useState(false);

  // ── Persist helpers — stable refs, never trigger re-renders ───────────────
  const persistAppearance = useCallback(async (values) => {
    if (!user?.id) return;
    try { await userSettingsService.updateAppearance(user.id, values); }
    catch (err) { console.error('Failed to update appearance:', err); }
  }, [user?.id]);

  const persistNotifications = useCallback(async (values) => {
    if (!user?.id) return;
    try { await userSettingsService.updateNotifications(user.id, values); }
    catch (err) { console.error('Failed to update notifications:', err); }
  }, [user?.id]);

  const persistPrivacy = useCallback(async (values) => {
    if (!user?.id) return;
    try { await userSettingsService.updatePrivacy(user.id, values); }
    catch (err) { console.error('Failed to update privacy:', err); }
  }, [user?.id]);

  const persistLocale = useCallback(async (values) => {
    if (!user?.id) return;
    try { await userSettingsService.updateLocale(user.id, values); }
    catch (err) { console.error('Failed to update locale:', err); }
  }, [user?.id]);

  // ── Cascade loaders ────────────────────────────────────────────────────────
  const loadProgramsForInstitution = useCallback(async (institutionId) => {
    if (!institutionId) { setAcademicPrograms([]); return []; }
    setAcademicCatalogLoading((prev) => ({ ...prev, programs: true }));
    try {
      const list = toList(await institutionProgramService.getProgramsByInstitution(institutionId));
      setAcademicPrograms(list);
      return list;
    } catch { setAcademicPrograms([]); return []; }
    finally { setAcademicCatalogLoading((prev) => ({ ...prev, programs: false })); }
  }, []);

  const loadLevelsForProgram = useCallback(async (programId) => {
    if (!programId) { setAcademicLevels([]); return []; }
    setAcademicCatalogLoading((prev) => ({ ...prev, levels: true }));
    try {
      const list = toList(await levelService.getLevelsByProgram(programId));
      setAcademicLevels(list);
      return list;
    } catch { setAcademicLevels([]); return []; }
    finally { setAcademicCatalogLoading((prev) => ({ ...prev, levels: false })); }
  }, []);

  const loadSemestersForLevel = useCallback(async (levelId) => {
    if (!levelId) { setAcademicSemesters([]); return []; }
    setAcademicCatalogLoading((prev) => ({ ...prev, semesters: true }));
    try {
      const list = toList(await semesterService.getSemestersByLevel(levelId));
      setAcademicSemesters(list);
      return list;
    } catch { setAcademicSemesters([]); return []; }
    finally { setAcademicCatalogLoading((prev) => ({ ...prev, semesters: false })); }
  }, []);

  // ── Apply server settings on load ─────────────────────────────────────────
  const applyServerSettings = useCallback((settings) => {
    if (!settings) return;
    if ((settings.theme_mode === 'light' || settings.theme_mode === 'dark') && settings.theme_mode !== mode) {
      setThemeMode(settings.theme_mode);
    }
    if (settings.font_size) {
      setFontSize(settings.font_size);
      applyFontSize(settings.font_size);
    }
    setNotifications({
      email: Boolean(settings.email_notifications),
      push: Boolean(settings.push_notifications),
      resourceAlerts: Boolean(settings.resource_alerts),
      weeklyDigest: Boolean(settings.weekly_digest),
    });
    setPrivacy({
      twoFactor: Boolean(settings.two_factor_enabled),
      showActivityStatus: Boolean(settings.show_activity_status),
      showProfile: Boolean(settings.show_profile),
    });
    setAppLanguage(settings.language || 'en');
    setLocale({
      timezone: settings.timezone || 'Africa/Casablanca',
      dateFormat: settings.date_format || 'DD/MM/YYYY',
    });
  }, [mode, setThemeMode, setAppLanguage]);

  // ── Sync settings on mount ─────────────────────────────────────────────────
  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      try {
        const existsResponse = await userSettingsService.exists(user.id);
        if (!existsResponse?.data) {
          const created = await userSettingsService.create({ user_id: user.id });
          applyServerSettings(created?.data);
          return;
        }
        const loaded = await userSettingsService.getByUserId(user.id);
        applyServerSettings(loaded?.data);
      } catch (err) { console.error('Failed to sync user settings:', err); }
    })();
  }, [user?.id]);

  // ── Load tag preferences ───────────────────────────────────────────────────
  useEffect(() => {
    if (!user?.id || isAdmin) {
      setAvailableTags([]);
      setPreferenceTags([]);
      setTagPreferencesFeedback({ type: '', message: '' });
      return;
    }
    (async () => {
      setTagPreferencesLoading(true);
      setTagPreferencesFeedback({ type: '', message: '' });
      try {
        const [tagsCatalog, currentPreferences] = await Promise.all([
          tagService.listTags({ is_active: true, limit: 200 }, { force: true }),
          personalizationService.getMyTagPreferences(),
        ]);
        setAvailableTags(Array.isArray(tagsCatalog) ? tagsCatalog : []);
        setPreferenceTags(Array.isArray(currentPreferences) ? currentPreferences : []);
      } catch (err) {
        console.error('Failed to load tag preferences:', err);
        setTagPreferencesFeedback({ type: 'error', message: 'We could not load your learning interests right now.' });
      } finally { setTagPreferencesLoading(false); }
    })();
  }, [user?.id, isAdmin]);

  // ── Load academic information (students only) ──────────────────────────────
  useEffect(() => {
    if (!user?.id || !isStudent) {
      setAcademicInstitutions([]);
      setAcademicPrograms([]);
      setAcademicLevels([]);
      setAcademicSemesters([]);
      setAcademicIds({ institution: '', program: '', level: '', semester: '' });
      setAcademicFeedback({ type: '', message: '' });
      return;
    }

    let mounted = true;
    (async () => {
      setAcademicLoading(true);
      setAcademicFeedback({ type: '', message: '' });
      setAcademicCatalogLoading((prev) => ({ ...prev, institutions: true }));

      try {
        const [institutionsResponse, profileResponse] = await Promise.all([
          institutionService.getAllInstitutions(),
          studentProfileService
            .getStudentProfileFullDetails(user.id)
            .catch(() => studentProfileService.getStudentProfileByUserId(user.id)),
        ]);

        if (!mounted) return;

        const institutions = toList(institutionsResponse);
        const profile = profileResponse?.data ?? profileResponse ?? {};

        const institutionId = String(profile?.institution_id || '');
        const programId = String(profile?.program_id || '');
        const semesterId = String(profile?.current_semester_id || profile?.semester_id || '');

        let levelId = String(profile?.level_id || profile?.current_level_id || '');
        if (!levelId && semesterId) {
          try {
            const semDetails = await semesterService.getSemesterById(semesterId);
            const sem = semDetails?.data ?? semDetails ?? {};
            levelId = String(sem?.level_id || '');
          } catch { levelId = ''; }
        }

        setAcademicInstitutions(institutions);
        setAcademicIds({ institution: institutionId, program: programId, level: levelId, semester: semesterId });

        if (institutionId) await loadProgramsForInstitution(institutionId);
        if (programId) await loadLevelsForProgram(programId);
        if (levelId) await loadSemestersForLevel(levelId);

      } catch {
        if (!mounted) return;
        setAcademicFeedback({ type: 'error', message: 'Failed to load your academic information.' });
      } finally {
        if (mounted) {
          setAcademicCatalogLoading((prev) => ({ ...prev, institutions: false }));
          setAcademicLoading(false);
        }
      }
    })();
    return () => { mounted = false; };
  }, [user?.id, isStudent, loadProgramsForInstitution, loadLevelsForProgram, loadSemestersForLevel]);

  // ── Sync contribution mode ─────────────────────────────────────────────────
  useEffect(() => {
    if (!isStudent) return;
    setStudentContributionMode(contributionMode === 'learner' ? 'learner' : 'contributor');
  }, [contributionMode, isStudent]);

  // ── Cleanup export timer on unmount ───────────────────────────────────────
  useEffect(() => () => clearTimeout(exportTimerRef.current), []);

  // ── Derived tag values — memoized to avoid recomputing on every render ─────
  const tagOptions = useMemo(() => {
    const merged = [...availableTags, ...preferenceTags];
    const seen = new Set();
    return merged.filter((tag) => {
      const id = Number(tag?.id || tag?.tag_id);
      if (!Number.isFinite(id) || seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  }, [availableTags, preferenceTags]);

  const selectedPreferenceIds = useMemo(
    () => preferenceTags.map((t) => Number(t?.id || t?.tag_id)).filter(Number.isFinite),
    [preferenceTags]
  );

  const selectedPreferenceOptions = useMemo(
    () => tagOptions.filter((tag) => selectedPreferenceIds.includes(Number(tag.id || tag.tag_id))),
    [tagOptions, selectedPreferenceIds]
  );

  // ── Appearance handlers ────────────────────────────────────────────────────
  const handleThemeChange = useCallback(async () => {
    const next = mode === 'dark' ? 'light' : 'dark';
    setThemeMode(next);
    await persistAppearance({ theme_mode: next, font_size: fontSize });
  }, [mode, fontSize, setThemeMode, persistAppearance]);

  const handleFontSizeChange = useCallback(async (_e, newSize) => {
    if (!newSize) return;
    setFontSize(newSize);
    applyFontSize(newSize);
    await persistAppearance({ theme_mode: mode, font_size: newSize });
  }, [mode, persistAppearance]);

  // ── Notification handler — single function, functional update avoids stale state ─
  const handleNotificationChange = useCallback(async (key, value) => {
    setNotifications((prev) => {
      const next = { ...prev, [key]: value };
      persistNotifications({
        email_notifications: next.email,
        push_notifications: next.push,
        resource_alerts: next.resourceAlerts,
        weekly_digest: next.weeklyDigest,
      });
      return next;
    });
  }, [persistNotifications]);

  // ── Privacy handler — same single-function pattern ─────────────────────────
  const handlePrivacyChange = useCallback(async (key, value) => {
    setPrivacy((prev) => {
      const next = { ...prev, [key]: value };
      persistPrivacy({
        two_factor_enabled: next.twoFactor,
        show_activity_status: next.showActivityStatus,
        show_profile: next.showProfile,
      });
      return next;
    });
  }, [persistPrivacy]);

  // ── Language & Region handlers ─────────────────────────────────────────────
  const handleLanguageChange = useCallback(async (value) => {
    setAppLanguage(value);
    await persistLocale({ language: value, timezone: locale.timezone, date_format: locale.dateFormat });
  }, [locale, setAppLanguage, persistLocale]);

  const handleLocaleChange = useCallback(async (key, value) => {
    setLocale((prev) => {
      const next = { ...prev, [key]: value };
      persistLocale({ language, timezone: next.timezone, date_format: next.dateFormat });
      return next;
    });
  }, [language, persistLocale]);

  // ── Academic handlers ──────────────────────────────────────────────────────
  const handleAcademicInstitutionChange = useCallback(async (value) => {
    setAcademicIds({ institution: value, program: '', level: '', semester: '' });
    setAcademicPrograms([]);
    setAcademicLevels([]);
    setAcademicSemesters([]);
    setAcademicFeedback({ type: '', message: '' });
    await loadProgramsForInstitution(value);
  }, [loadProgramsForInstitution]);

  const handleAcademicProgramChange = useCallback(async (value) => {
    setAcademicIds((prev) => ({ ...prev, program: value, level: '', semester: '' }));
    setAcademicLevels([]);
    setAcademicSemesters([]);
    setAcademicFeedback({ type: '', message: '' });
    await loadLevelsForProgram(value);
  }, [loadLevelsForProgram]);

  const handleAcademicLevelChange = useCallback(async (value) => {
    setAcademicIds((prev) => ({ ...prev, level: value, semester: '' }));
    setAcademicSemesters([]);
    setAcademicFeedback({ type: '', message: '' });
    await loadSemestersForLevel(value);
  }, [loadSemestersForLevel]);

  const handleAcademicSemesterChange = useCallback((value) => {
    setAcademicIds((prev) => ({ ...prev, semester: value }));
    setAcademicFeedback({ type: '', message: '' });
  }, []);

  const handleSaveContributionMode = useCallback(async () => {
    if (!user?.id || !isStudent) return;
    setContributionModeSaving(true);
    setAcademicFeedback({ type: '', message: '' });
    try {
      await studentProfileService.updateStudentContributionMode(user.id, studentContributionMode);
      await refreshProfile();
      setAcademicFeedback({ type: 'success', message: `Student mode updated to ${studentContributionMode}.` });
    } catch (err) {
      setAcademicFeedback({ type: 'error', message: err?.response?.data?.message || 'Failed to update student mode.' });
    } finally { setContributionModeSaving(false); }
  }, [user?.id, isStudent, studentContributionMode, refreshProfile]);

  const handleSaveAcademicInformation = useCallback(async () => {
    if (!user?.id || !isStudent) return;
    const { institution, program, semester } = academicIds;
    if (!institution || !program || !semester) {
      setAcademicFeedback({ type: 'error', message: 'Please select institution, program, and semester before saving.' });
      return;
    }
    setAcademicSaving(true);
    setAcademicFeedback({ type: '', message: '' });
    try {
      await studentProfileService.updateStudentProfile(user.id, {
        institution_id: Number(institution),
        program_id: Number(program),
        current_semester_id: Number(semester),
      });
      await refreshProfile();
      setAcademicFeedback({ type: 'success', message: 'Academic information updated successfully.' });
    } catch (err) {
      setAcademicFeedback({ type: 'error', message: err?.response?.data?.message || 'Failed to update academic information.' });
    } finally { setAcademicSaving(false); }
  }, [user?.id, isStudent, academicIds, refreshProfile]);

  // ── Tag preference handlers ────────────────────────────────────────────────
  const handleTagPreferencesChange = useCallback((_e, selected) => {
    setPreferenceTags(Array.isArray(selected) ? selected : []);
    setTagPreferencesFeedback({ type: '', message: '' });
  }, []);

  const handleSaveTagPreferences = useCallback(async () => {
    const tagIds = preferenceTags
      .map((tag) => Number(tag?.id || tag?.tag_id))
      .filter(Number.isFinite);

    setTagPreferencesSaving(true);
    setTagPreferencesFeedback({ type: '', message: '' });
    try {
      const saved = await personalizationService.setMyTagPreferences(tagIds);
      setPreferenceTags(Array.isArray(saved) ? saved : []);
      setTagPreferencesFeedback({
        type: 'success',
        message: tagIds.length
          ? 'Your learning interests were updated successfully.'
          : 'Your learning interests were cleared successfully.',
      });
    } catch (err) {
      console.error('Failed to save tag preferences:', err);
      setTagPreferencesFeedback({ type: 'error', message: err?.response?.data?.message || 'Failed to save your learning interests.' });
    } finally { setTagPreferencesSaving(false); }
  }, [preferenceTags]);

  // ── Export handler — timer ref prevents state update on unmounted component ─
  const handleExportData = useCallback(() => {
    setExportLoading(true);
    exportTimerRef.current = setTimeout(() => {
      setExportLoading(false);
      const data = { user, exportDate: new Date().toISOString() };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'my-data-export.json';
      a.click();
      URL.revokeObjectURL(url);
    }, 1500);
  }, [user]);

  // ── Delete account ─────────────────────────────────────────────────────────
  const handleDeleteAccount = useCallback(() => {
    // TODO: call userSettingsService.deleteAccount(user.id)
    setDeleteDialogOpen(false);
    setDeleteConfirmText('');
  }, []);

  const handleDeleteDialogClose = useCallback(() => {
    setDeleteDialogOpen(false);
    setDeleteConfirmText('');
  }, []);

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ maxWidth: 860, mx: 'auto', px: { xs: 2, sm: 3 }, py: { xs: 3, sm: 4 } }}>
      <PageHeader
        icon={SettingsIcon}
        title={t('settings.title', 'Settings')}
        subtitle={t('settings.subtitle', 'Manage your account preferences')}
      />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

        {/* ── Theme & Appearance ─────────────────────────────────────────── */}
        <SettingSection icon={<Palette />} title="Theme & Appearance" subtitle="Customize how the app looks and feels" color="primary">
          <SettingRow
            icon={mode === 'dark' ? <DarkMode /> : <LightMode />}
            title="Dark Mode"
            description="Switch between light and dark theme"
            action={<Switch checked={mode === 'dark'} onChange={handleThemeChange} color="primary" />}
          />
          <SettingRow
            icon={<FormatSize />}
            title="Font Size"
            description="Adjust the text size across the application"
            noBorder
            action={
              <ToggleButtonGroup value={fontSize} exclusive onChange={handleFontSizeChange} size="small">
                <ToggleButton value="small">Small</ToggleButton>
                <ToggleButton value="medium">Medium</ToggleButton>
                <ToggleButton value="large">Large</ToggleButton>
              </ToggleButtonGroup>
            }
          />
        </SettingSection>

        {/* ── Notifications ─────────────────────────────────────────────── */}
        <SettingSection icon={<Notifications />} title="Notifications" subtitle="Control how you receive updates and alerts" color="info">
          <SettingRow
            icon={<Email />}
            title="Email Notifications"
            description="Receive updates and alerts via email"
            action={<Switch checked={notifications.email} onChange={(e) => handleNotificationChange('email', e.target.checked)} color="info" />}
          />
          <SettingRow
            icon={<NotificationsActive />}
            title="Push Notifications"
            description="Get real-time notifications in your browser"
            action={<Switch checked={notifications.push} onChange={(e) => handleNotificationChange('push', e.target.checked)} color="info" />}
          />
          <SettingRow
            icon={<NotificationsActive />}
            title="Resource Alerts"
            description="Notify when new resources are available"
            action={<Switch checked={notifications.resourceAlerts} onChange={(e) => handleNotificationChange('resourceAlerts', e.target.checked)} color="info" />}
          />
          <SettingRow
            icon={<NotificationsOff />}
            title="Weekly Digest"
            description="Receive a weekly summary of activities"
            noBorder
            action={<Switch checked={notifications.weeklyDigest} onChange={(e) => handleNotificationChange('weeklyDigest', e.target.checked)} color="info" />}
          />
        </SettingSection>

        {/* ── Learning Interests (non-admins) ───────────────────────────── */}
        {!isAdmin && (
          <SettingSection icon={<LocalOffer />} title="Learning Interests" subtitle="Choose the tags that personalize recommendations and discovery across the platform" color="secondary">
            {tagPreferencesFeedback.message && (
              <Alert severity={tagPreferencesFeedback.type || 'info'} sx={{ m: 2, mb: 0 }}>
                {tagPreferencesFeedback.message}
              </Alert>
            )}
            <Box sx={{ p: { xs: 2.5, sm: 3 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" fontWeight={600}>Preferred Tags</Typography>
                <Chip
                  label={`${selectedPreferenceIds.length} selected`}
                  size="small"
                  color={selectedPreferenceIds.length >= 1 ? 'success' : 'default'}
                  variant={selectedPreferenceIds.length >= 1 ? 'filled' : 'outlined'}
                  sx={{ fontWeight: 600 }}
                />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                Leave this empty, or choose one or more tags to improve your resource feed.
              </Typography>
              <Autocomplete
                multiple
                options={tagOptions}
                value={selectedPreferenceOptions}
                loading={tagPreferencesLoading}
                isOptionEqualToValue={(option, value) =>
                  Number(option.id || option.tag_id) === Number(value.id || value.tag_id)
                }
                getOptionLabel={(option) => option.name || option.tag_name || ''}
                onChange={handleTagPreferencesChange}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip key={option.id || option.tag_id} label={option.name || option.tag_name} size="small" {...getTagProps({ index })} />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Search tags…"
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {tagPreferencesLoading ? <CircularProgress size={16} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5, mb: 2.5 }}>
                Recommended tags for this platform include revision, practice, exam preparation, and module support themes.
              </Typography>
              <Button
                variant="contained"
                size="small"
                disabled={tagPreferencesSaving}
                onClick={handleSaveTagPreferences}
                startIcon={tagPreferencesSaving ? <CircularProgress size={14} /> : <Check />}
              >
                {tagPreferencesSaving ? 'Saving...' : 'Save Interests'}
              </Button>
            </Box>
          </SettingSection>
        )}

        {/* ── Academic Information (students only) ──────────────────────── */}
        {isStudent && (
          <SettingSection icon={<ManageAccounts />} title="Academic Information" subtitle="Update your institution, program, and current semester" color="success">
            {academicFeedback.message && (
              <Alert severity={academicFeedback.type || 'info'} sx={{ m: 2, mb: 0 }}>
                {academicFeedback.message}
              </Alert>
            )}
            <Box sx={{ p: { xs: 2.5, sm: 3 }, display: 'flex', flexDirection: 'column', gap: 3 }}>

              {/* Student Mode */}
              <Box>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>Student Mode</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                  Learner mode blocks uploads and resource contribution routes until you switch back.
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                  <ToggleButtonGroup
                    value={studentContributionMode}
                    exclusive
                    size="small"
                    onChange={(_, value) => {
                      if (value) {
                        setStudentContributionMode(value);
                        setAcademicFeedback({ type: '', message: '' });
                      }
                    }}
                  >
                    <ToggleButton value="contributor">Contributor</ToggleButton>
                    <ToggleButton value="learner">Learner</ToggleButton>
                  </ToggleButtonGroup>
                  <Button
                    size="small" variant="outlined"
                    disabled={contributionModeSaving}
                    onClick={handleSaveContributionMode}
                    startIcon={contributionModeSaving ? <CircularProgress size={14} /> : <Check />}
                  >
                    {contributionModeSaving ? 'Saving Mode...' : 'Save Student Mode'}
                  </Button>
                </Box>
              </Box>

              <Divider />

              {/* Institution */}
              <FormControl fullWidth disabled={academicLoading}>
                <Typography variant="caption" fontWeight={600} sx={{ mb: 0.75 }}>Institution</Typography>
                <Select
                  value={academicIds.institution}
                  onChange={(e) => handleAcademicInstitutionChange(String(e.target.value || ''))}
                  displayEmpty sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="" disabled>Select Institution</MenuItem>
                  {academicInstitutions.map((i) => (
                    <MenuItem key={i.id} value={String(i.id)}>{i.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Program */}
              <FormControl fullWidth disabled={!academicIds.institution || academicCatalogLoading.programs}>
                <Typography variant="caption" fontWeight={600} sx={{ mb: 0.75 }}>Program</Typography>
                <Select
                  value={academicIds.program}
                  onChange={(e) => handleAcademicProgramChange(String(e.target.value || ''))}
                  displayEmpty sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="" disabled>
                    {academicIds.institution ? 'Select Program' : 'Select institution first'}
                  </MenuItem>
                  {academicPrograms.map((p) => (
                    <MenuItem key={p.id} value={String(p.id)}>{p.name || p.program_name}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Level */}
              <FormControl fullWidth disabled={!academicIds.program || academicCatalogLoading.levels}>
                <Typography variant="caption" fontWeight={600} sx={{ mb: 0.75 }}>Level</Typography>
                <Select
                  value={academicIds.level}
                  onChange={(e) => handleAcademicLevelChange(String(e.target.value || ''))}
                  displayEmpty sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="" disabled>
                    {academicIds.program ? 'Select Level' : 'Select program first'}
                  </MenuItem>
                  {academicLevels.map((l) => (
                    <MenuItem key={l.id} value={String(l.id)}>{l.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Semester */}
              <FormControl fullWidth disabled={!academicIds.level || academicCatalogLoading.semesters}>
                <Typography variant="caption" fontWeight={600} sx={{ mb: 0.75 }}>Semester</Typography>
                <Select
                  value={academicIds.semester}
                  onChange={(e) => handleAcademicSemesterChange(String(e.target.value || ''))}
                  displayEmpty sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="" disabled>
                    {academicIds.level ? 'Select Semester' : 'Select level first'}
                  </MenuItem>
                  {academicSemesters.map((s) => (
                    <MenuItem key={s.id} value={String(s.id)}>{s.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Typography variant="caption" color="text.secondary">
                Keep this section up to date to improve your recommendations and module matching.
              </Typography>

              <Box>
                <Button
                  variant="contained" color="success"
                  disabled={academicSaving}
                  onClick={handleSaveAcademicInformation}
                  startIcon={academicSaving ? <CircularProgress size={14} /> : <Check />}
                >
                  {academicSaving ? 'Saving...' : 'Save Academic Info'}
                </Button>
              </Box>
            </Box>
          </SettingSection>
        )}

        {/* ── Privacy & Security ────────────────────────────────────────── */}
        <SettingSection icon={<Security />} title="Privacy & Security" subtitle="Manage your security preferences and privacy" color="warning">
          <SettingRow
            icon={<VpnKey />}
            title="Two-Factor Authentication"
            description="Add an extra layer of security to your account"
            action={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {privacy.twoFactor && <Chip icon={<Check />} label="Active" size="small" color="success" />}
                <Button
                  size="small" variant="outlined" color="warning"
                  onClick={() => handlePrivacyChange('twoFactor', !privacy.twoFactor)}
                >
                  {privacy.twoFactor ? 'Disable' : 'Enable'}
                </Button>
              </Box>
            }
          />
          <SettingRow
            icon={<Devices />}
            title="Active Sessions"
            description="View and manage your logged-in devices"
            action={<Button size="small" variant="outlined">Manage</Button>}
          />
          <SettingRow
            icon={<VisibilityOff />}
            title="Show Activity Status"
            description="Let others see when you're online"
            action={<Switch checked={privacy.showActivityStatus} onChange={(e) => handlePrivacyChange('showActivityStatus', e.target.checked)} color="warning" />}
          />
          <SettingRow
            icon={<VisibilityOff />}
            title="Public Profile"
            description="Make your profile visible to other users"
            noBorder
            action={<Switch checked={privacy.showProfile} onChange={(e) => handlePrivacyChange('showProfile', e.target.checked)} color="warning" />}
          />
        </SettingSection>

        {/* ── Language & Region ─────────────────────────────────────────── */}
        <SettingSection icon={<Language />} title={t('settings.languageRegion.title', 'Language & Region')} subtitle={t('settings.languageRegion.subtitle', 'Set your language and regional preferences')} color="success">
          <SettingRow
            icon={<Language />}
            title={t('settings.languageRegion.language', 'Language')}
            description={t('settings.languageRegion.languageDesc', 'Select your preferred language')}
            action={
              <Select value={language} onChange={(e) => handleLanguageChange(e.target.value)} size="small" sx={{ borderRadius: 2, fontWeight: 500 }}>
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="fr">Français</MenuItem>
                <MenuItem value="ar">العربية</MenuItem>
              </Select>
            }
          />
          <SettingRow
            icon={<AccessTime />}
            title={t('settings.languageRegion.timezone', 'Timezone')}
            description={t('settings.languageRegion.timezoneDesc', 'Set your local timezone')}
            action={
              <Select value={locale.timezone} onChange={(e) => handleLocaleChange('timezone', e.target.value)} size="small" sx={{ borderRadius: 2, fontWeight: 500 }}>
                <MenuItem value="Africa/Casablanca">Casablanca (GMT+1)</MenuItem>
                <MenuItem value="Europe/Paris">Paris (GMT+1)</MenuItem>
                <MenuItem value="Europe/London">London (GMT)</MenuItem>
                <MenuItem value="America/New_York">New York (GMT-5)</MenuItem>
              </Select>
            }
          />
          <SettingRow
            icon={<CalendarToday />}
            title={t('settings.languageRegion.dateFormat', 'Date Format')}
            description={t('settings.languageRegion.dateFormatDesc', 'Choose how dates are displayed')}
            noBorder
            action={
              <Select value={locale.dateFormat} onChange={(e) => handleLocaleChange('dateFormat', e.target.value)} size="small" sx={{ borderRadius: 2, fontWeight: 500 }}>
                <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
              </Select>
            }
          />
        </SettingSection>

        {/* ── Account Management ────────────────────────────────────────── */}
        <SettingSection icon={<ManageAccounts />} title="Account Management" subtitle="Manage your account data and connections" color="error">
          <SettingRow
            icon={<Download />}
            title="Export Your Data"
            description="Download a copy of all your data"
            action={
              <Button
                size="small" variant="outlined"
                disabled={exportLoading}
                onClick={handleExportData}
                startIcon={exportLoading ? <CircularProgress size={14} /> : <Download />}
              >
                {exportLoading ? 'Exporting...' : 'Export Data'}
              </Button>
            }
          />
          <SettingRow
            icon={<Link />}
            title="Linked Accounts"
            description="Manage connected third-party services"
            action={<Button size="small" variant="outlined">Manage</Button>}
          />
          <SettingRow
            icon={<Delete />}
            title="Delete Account"
            description="Permanently delete your account and all data"
            noBorder
            action={
              <Button
                size="small" variant="outlined" color="error"
                onClick={() => setDeleteDialogOpen(true)}
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                Delete Account
              </Button>
            }
          />
        </SettingSection>

      </Box>

      {/* ── Delete Account Dialog ──────────────────────────────────────── */}
      <DeleteAccountDialog
        open={deleteDialogOpen}
        confirmText={deleteConfirmText}
        onConfirmTextChange={setDeleteConfirmText}
        onClose={handleDeleteDialogClose}
        onDelete={handleDeleteAccount}
      />
    </Box>
  );
};

export default Settings;
