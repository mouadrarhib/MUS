// src/features/settings/pages/Settings.jsx
import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Switch,
  Button,
  Select,
  MenuItem,
  FormControl,
  Divider,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Chip,
  Slider,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  Palette,
  DarkMode,
  LightMode,
  FormatSize,
  Notifications,
  Email,
  NotificationsActive,
  NotificationsOff,
  Security,
  VpnKey,
  Devices,
  VisibilityOff,
  Language,
  AccessTime,
  CalendarToday,
  ManageAccounts,
  Delete,
  Download,
  Link,
  Close,
  Warning,
  Check,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useThemeMode } from '@/app/providers/ThemeContext';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useLanguage } from '@/app/providers/LanguageContext';
import userSettingsService from '@/services/userSettingsService';
import { PageHeader } from '@/shared/components/ui';

const Settings = () => {
  const { mode, toggleTheme } = useThemeMode();
  const { user } = useAuth();
  const { language, setLanguage: setAppLanguage, t } = useLanguage();
  
  // Theme & Appearance
  const [fontSize, setFontSize] = useState(() => localStorage.getItem('fontSize') || 'medium');
  
  // Notifications
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [resourceAlerts, setResourceAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  
  // Privacy & Security
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showActivityStatus, setShowActivityStatus] = useState(true);
  const [showProfile, setShowProfile] = useState(true);
  
  // Language & Region
  const [timezone, setTimezone] = useState('Africa/Casablanca');
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');
  
  // Dialogs
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [exportLoading, setExportLoading] = useState(false);

  const applyFontSize = (size) => {
    localStorage.setItem('fontSize', size);
    document.documentElement.style.fontSize =
      size === 'small' ? '14px' : size === 'large' ? '18px' : '16px';
  };

  const applyServerSettings = (settings) => {
    if (!settings) return;

    if (settings.theme_mode && settings.theme_mode !== mode) {
      toggleTheme();
    }

    if (settings.font_size) {
      setFontSize(settings.font_size);
      applyFontSize(settings.font_size);
    }

    setEmailNotifications(Boolean(settings.email_notifications));
    setPushNotifications(Boolean(settings.push_notifications));
    setResourceAlerts(Boolean(settings.resource_alerts));
    setWeeklyDigest(Boolean(settings.weekly_digest));
    setTwoFactorEnabled(Boolean(settings.two_factor_enabled));
    setShowActivityStatus(Boolean(settings.show_activity_status));
    setShowProfile(Boolean(settings.show_profile));
    const resolvedLanguage = settings.language || 'en';
    setAppLanguage(resolvedLanguage);
    setTimezone(settings.timezone || 'Africa/Casablanca');
    setDateFormat(settings.date_format || 'DD/MM/YYYY');
  };

  useEffect(() => {
    const syncSettings = async () => {
      if (!user?.id) return;

      try {
        const existsResponse = await userSettingsService.exists(user.id);
        if (!existsResponse?.data) {
          const created = await userSettingsService.create({ user_id: user.id });
          applyServerSettings(created?.data);
          return;
        }

        const loaded = await userSettingsService.getByUserId(user.id);
        applyServerSettings(loaded?.data);
      } catch (error) {
        console.error('Failed to sync user settings:', error);
      }
    };

    syncSettings();
  }, [user?.id]);

  const persistNotifications = async (nextValues) => {
    if (!user?.id) return;
    try {
      await userSettingsService.updateNotifications(user.id, nextValues);
    } catch (error) {
      console.error('Failed to update notifications settings:', error);
    }
  };

  const persistPrivacy = async (nextValues) => {
    if (!user?.id) return;
    try {
      await userSettingsService.updatePrivacy(user.id, nextValues);
    } catch (error) {
      console.error('Failed to update privacy settings:', error);
    }
  };

  const persistLocale = async (nextValues) => {
    if (!user?.id) return;
    try {
      await userSettingsService.updateLocale(user.id, nextValues);
    } catch (error) {
      console.error('Failed to update locale settings:', error);
    }
  };

  const persistAppearance = async (nextValues) => {
    if (!user?.id) return;
    try {
      await userSettingsService.updateAppearance(user.id, nextValues);
    } catch (error) {
      console.error('Failed to update appearance settings:', error);
    }
  };

  const handleThemeChange = async () => {
    const nextTheme = mode === 'dark' ? 'light' : 'dark';
    toggleTheme();
    await persistAppearance({
      theme_mode: nextTheme,
      font_size: fontSize,
    });
  };

  const handleFontSizeChange = async (_event, newSize) => {
    if (newSize) {
      setFontSize(newSize);
      applyFontSize(newSize);
      await persistAppearance({
        theme_mode: mode,
        font_size: newSize,
      });
    }
  };

  const handleEmailNotificationsChange = async (value) => {
    setEmailNotifications(value);
    await persistNotifications({
      email_notifications: value,
      push_notifications: pushNotifications,
      resource_alerts: resourceAlerts,
      weekly_digest: weeklyDigest,
    });
  };

  const handlePushNotificationsChange = async (value) => {
    setPushNotifications(value);
    await persistNotifications({
      email_notifications: emailNotifications,
      push_notifications: value,
      resource_alerts: resourceAlerts,
      weekly_digest: weeklyDigest,
    });
  };

  const handleResourceAlertsChange = async (value) => {
    setResourceAlerts(value);
    await persistNotifications({
      email_notifications: emailNotifications,
      push_notifications: pushNotifications,
      resource_alerts: value,
      weekly_digest: weeklyDigest,
    });
  };

  const handleWeeklyDigestChange = async (value) => {
    setWeeklyDigest(value);
    await persistNotifications({
      email_notifications: emailNotifications,
      push_notifications: pushNotifications,
      resource_alerts: resourceAlerts,
      weekly_digest: value,
    });
  };

  const handleTwoFactorChange = async () => {
    const next = !twoFactorEnabled;
    setTwoFactorEnabled(next);
    await persistPrivacy({
      show_activity_status: showActivityStatus,
      show_profile: showProfile,
      two_factor_enabled: next,
    });
  };

  const handleShowActivityStatusChange = async (value) => {
    setShowActivityStatus(value);
    await persistPrivacy({
      show_activity_status: value,
      show_profile: showProfile,
      two_factor_enabled: twoFactorEnabled,
    });
  };

  const handleShowProfileChange = async (value) => {
    setShowProfile(value);
    await persistPrivacy({
      show_activity_status: showActivityStatus,
      show_profile: value,
      two_factor_enabled: twoFactorEnabled,
    });
  };

  const handleLanguageChange = async (value) => {
    setAppLanguage(value);
    await persistLocale({
      language: value,
      timezone: timezone,
      date_format: dateFormat,
    });
  };

  const handleTimezoneChange = async (value) => {
    setTimezone(value);
    await persistLocale({
      language: language,
      timezone: value,
      date_format: dateFormat,
    });
  };

  const handleDateFormatChange = async (value) => {
    setDateFormat(value);
    await persistLocale({
      language: language,
      timezone: timezone,
      date_format: value,
    });
  };

  const handleExportData = async () => {
    setExportLoading(true);
    // Simulate export
    setTimeout(() => {
      setExportLoading(false);
      // Create a dummy file download
      const data = { user: user, exportDate: new Date().toISOString() };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'my-data-export.json';
      a.click();
      URL.revokeObjectURL(url);
    }, 1500);
  };

  const SettingSection = ({ icon, title, subtitle, color = 'primary', children }) => (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
        mb: 3,
      }}
    >
      <Box
        sx={{
          px: 3,
          py: 2.5,
          background: (theme) => `linear-gradient(135deg, ${alpha(theme.palette[color].main, 0.08)} 0%, ${alpha(theme.palette[color].main, 0.02)} 100%)`,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: (theme) => `linear-gradient(135deg, ${theme.palette[color].main} 0%, ${theme.palette[color].dark} 100%)`,
              boxShadow: (theme) => `0 4px 12px ${alpha(theme.palette[color].main, 0.3)}`,
            }}
          >
            {icon}
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          </Box>
        </Box>
      </Box>
      <Box sx={{ p: 3 }}>
        {children}
      </Box>
    </Paper>
  );

  const SettingRow = ({ icon, title, description, action, noBorder }) => (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        py: 2,
        borderBottom: noBorder ? 'none' : '1px solid',
        borderColor: 'divider',
        gap: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
            color: 'primary.main',
          }}
        >
          {icon}
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="body1" fontWeight={600}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </Box>
      </Box>
      {action}
    </Box>
  );

  return (
    <Box sx={{ width: '100%', minHeight: '100%' }}>
      <PageHeader
        title={t('pages.settings.title')}
        subtitle={t('pages.settings.subtitle')}
        icon={SettingsIcon}
        breadcrumbs={[
          { label: t('common.dashboard'), to: '/dashboard' },
          { label: t('common.settings') },
        ]}
      />

      {/* Theme & Appearance */}
      <SettingSection
        icon={<Palette sx={{ fontSize: 24, color: 'white' }} />}
        title="Theme & Appearance"
        subtitle="Customize how the app looks and feels"
        color="primary"
      >
        <SettingRow
          icon={mode === 'dark' ? <DarkMode sx={{ fontSize: 20 }} /> : <LightMode sx={{ fontSize: 20 }} />}
          title="Dark Mode"
          description="Switch between light and dark theme"
          action={
            <Switch
              checked={mode === 'dark'}
              onChange={handleThemeChange}
              color="primary"
            />
          }
        />
        <SettingRow
          icon={<FormatSize sx={{ fontSize: 20 }} />}
          title="Font Size"
          description="Adjust the text size across the application"
          noBorder
          action={
            <ToggleButtonGroup
              value={fontSize}
              exclusive
              onChange={handleFontSizeChange}
              size="small"
              sx={{
                '& .MuiToggleButton-root': {
                  px: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                },
              }}
            >
              <ToggleButton value="small">Small</ToggleButton>
              <ToggleButton value="medium">Medium</ToggleButton>
              <ToggleButton value="large">Large</ToggleButton>
            </ToggleButtonGroup>
          }
        />
      </SettingSection>

      {/* Notifications */}
      <SettingSection
        icon={<Notifications sx={{ fontSize: 24, color: 'white' }} />}
        title="Notifications"
        subtitle="Control how you receive updates and alerts"
        color="info"
      >
        <SettingRow
          icon={<Email sx={{ fontSize: 20 }} />}
          title="Email Notifications"
          description="Receive updates and alerts via email"
          action={
            <Switch
              checked={emailNotifications}
              onChange={(e) => handleEmailNotificationsChange(e.target.checked)}
              color="info"
            />
          }
        />
        <SettingRow
          icon={<NotificationsActive sx={{ fontSize: 20 }} />}
          title="Push Notifications"
          description="Get real-time notifications in your browser"
          action={
            <Switch
              checked={pushNotifications}
              onChange={(e) => handlePushNotificationsChange(e.target.checked)}
              color="info"
            />
          }
        />
        <SettingRow
          icon={<NotificationsOff sx={{ fontSize: 20 }} />}
          title="Resource Alerts"
          description="Notify when new resources are available"
          action={
            <Switch
              checked={resourceAlerts}
              onChange={(e) => handleResourceAlertsChange(e.target.checked)}
              color="info"
            />
          }
        />
        <SettingRow
          icon={<CalendarToday sx={{ fontSize: 20 }} />}
          title="Weekly Digest"
          description="Receive a weekly summary of activities"
          noBorder
          action={
            <Switch
              checked={weeklyDigest}
              onChange={(e) => handleWeeklyDigestChange(e.target.checked)}
              color="info"
            />
          }
        />
      </SettingSection>

      {/* Privacy & Security */}
      <SettingSection
        icon={<Security sx={{ fontSize: 24, color: 'white' }} />}
        title="Privacy & Security"
        subtitle="Manage your security preferences and privacy"
        color="warning"
      >
        <SettingRow
          icon={<VpnKey sx={{ fontSize: 20 }} />}
          title="Two-Factor Authentication"
          description="Add an extra layer of security to your account"
          action={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {twoFactorEnabled && (
                <Chip label="Enabled" color="success" size="small" sx={{ fontWeight: 600 }} />
              )}
              <Button
                variant={twoFactorEnabled ? "outlined" : "contained"}
                size="small"
                color="warning"
                onClick={handleTwoFactorChange}
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                {twoFactorEnabled ? 'Disable' : 'Enable'}
              </Button>
            </Box>
          }
        />
        <SettingRow
          icon={<Devices sx={{ fontSize: 20 }} />}
          title="Active Sessions"
          description="View and manage your logged-in devices"
          action={
            <Button
              variant="outlined"
              size="small"
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              Manage
            </Button>
          }
        />
        <SettingRow
          icon={<VisibilityOff sx={{ fontSize: 20 }} />}
          title="Show Activity Status"
          description="Let others see when you're online"
          action={
            <Switch
              checked={showActivityStatus}
              onChange={(e) => handleShowActivityStatusChange(e.target.checked)}
              color="warning"
            />
          }
        />
        <SettingRow
          icon={<ManageAccounts sx={{ fontSize: 20 }} />}
          title="Public Profile"
          description="Make your profile visible to other users"
          noBorder
          action={
            <Switch
              checked={showProfile}
              onChange={(e) => handleShowProfileChange(e.target.checked)}
              color="warning"
            />
          }
        />
      </SettingSection>

      {/* Language & Region */}
      <SettingSection
        icon={<Language sx={{ fontSize: 24, color: 'white' }} />}
        title={t('settings.languageRegion.title', 'Language & Region')}
        subtitle={t('settings.languageRegion.subtitle', 'Set your language and regional preferences')}
        color="success"
      >
        <SettingRow
          icon={<Language sx={{ fontSize: 20 }} />}
          title={t('settings.languageRegion.language', 'Language')}
          description={t('settings.languageRegion.languageDesc', 'Select your preferred language')}
          action={
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <Select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                sx={{ borderRadius: 2, fontWeight: 500 }}
              >
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="fr">Francais</MenuItem>
                <MenuItem value="ar">العربية</MenuItem>
              </Select>
            </FormControl>
          }
        />
        <SettingRow
          icon={<AccessTime sx={{ fontSize: 20 }} />}
          title={t('settings.languageRegion.timezone', 'Timezone')}
          description={t('settings.languageRegion.timezoneDesc', 'Set your local timezone')}
          action={
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <Select
                value={timezone}
                onChange={(e) => handleTimezoneChange(e.target.value)}
                sx={{ borderRadius: 2, fontWeight: 500 }}
              >
                <MenuItem value="Africa/Casablanca">Casablanca (GMT+1)</MenuItem>
                <MenuItem value="Europe/Paris">Paris (GMT+1)</MenuItem>
                <MenuItem value="Europe/London">London (GMT)</MenuItem>
                <MenuItem value="America/New_York">New York (GMT-5)</MenuItem>
              </Select>
            </FormControl>
          }
        />
        <SettingRow
          icon={<CalendarToday sx={{ fontSize: 20 }} />}
          title={t('settings.languageRegion.dateFormat', 'Date Format')}
          description={t('settings.languageRegion.dateFormatDesc', 'Choose how dates are displayed')}
          noBorder
          action={
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <Select
                value={dateFormat}
                onChange={(e) => handleDateFormatChange(e.target.value)}
                sx={{ borderRadius: 2, fontWeight: 500 }}
              >
                <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
              </Select>
            </FormControl>
          }
        />
      </SettingSection>

      {/* Account Management */}
      <SettingSection
        icon={<ManageAccounts sx={{ fontSize: 24, color: 'white' }} />}
        title="Account Management"
        subtitle="Manage your account data and connections"
        color="error"
      >
        <SettingRow
          icon={<Download sx={{ fontSize: 20 }} />}
          title="Export Your Data"
          description="Download a copy of all your data"
          action={
            <Button
              variant="outlined"
              size="small"
              onClick={handleExportData}
              disabled={exportLoading}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              {exportLoading ? 'Exporting...' : 'Export Data'}
            </Button>
          }
        />
        <SettingRow
          icon={<Link sx={{ fontSize: 20 }} />}
          title="Linked Accounts"
          description="Manage connected third-party services"
          action={
            <Button
              variant="outlined"
              size="small"
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              Manage
            </Button>
          }
        />
        <SettingRow
          icon={<Delete sx={{ fontSize: 20 }} />}
          title="Delete Account"
          description="Permanently delete your account and all data"
          noBorder
          action={
            <Button
              variant="contained"
              color="error"
              size="small"
              onClick={() => setDeleteDialogOpen(true)}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              Delete Account
            </Button>
          }
        />
      </SettingSection>

      {/* Delete Account Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, overflow: 'hidden' }
        }}
      >
        <DialogTitle sx={{ p: 0, position: 'relative' }}>
          <Box
            sx={{
              px: 3,
              py: 2.5,
              background: (theme) => `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.08)} 0%, ${alpha(theme.palette.error.main, 0.02)} 100%)`,
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Box display="flex" alignItems="center" gap={2}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: (theme) => `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.error.dark} 100%)`,
                  boxShadow: (theme) => `0 4px 12px ${alpha(theme.palette.error.main, 0.3)}`,
                }}
              >
                <Warning sx={{ fontSize: 24, color: 'white' }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  Delete Account
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  This action cannot be undone
                </Typography>
              </Box>
            </Box>
          </Box>
          <IconButton
            onClick={() => setDeleteDialogOpen(false)}
            sx={{ 
              position: 'absolute', 
              right: 12, 
              top: 12, 
              color: 'text.secondary',
              bgcolor: (theme) => alpha(theme.palette.action.active, 0.04),
              '&:hover': {
                bgcolor: (theme) => alpha(theme.palette.action.active, 0.08),
              }
            }}
          >
            <Close sx={{ fontSize: 20 }} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          <Box
            sx={{
              p: 2,
              mb: 3,
              borderRadius: 2,
              bgcolor: (theme) => alpha(theme.palette.error.main, 0.08),
              border: '1px solid',
              borderColor: (theme) => alpha(theme.palette.error.main, 0.2),
            }}
          >
            <Typography variant="body2" color="error.main" fontWeight={500}>
              Warning: Deleting your account will permanently remove all your data, including your profile, resources, and activity history. This action cannot be reversed.
            </Typography>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            To confirm deletion, please type <strong>DELETE</strong> below:
          </Typography>

          <TextField
            fullWidth
            placeholder="Type DELETE to confirm"
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            sx={{ 
              '& .MuiOutlinedInput-root': { 
                borderRadius: 2,
                bgcolor: (theme) => alpha(theme.palette.action.active, 0.02),
              } 
            }}
          />
        </DialogContent>

        <DialogActions 
          sx={{ 
            px: 3, 
            py: 2.5, 
            borderTop: '1px solid', 
            borderColor: 'divider',
            bgcolor: (theme) => alpha(theme.palette.action.active, 0.02),
            gap: 1.5,
          }}
        >
          <Button
            onClick={() => {
              setDeleteDialogOpen(false);
              setDeleteConfirmText('');
            }}
            variant="outlined"
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, px: 3 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            disabled={deleteConfirmText !== 'DELETE'}
            startIcon={<Delete sx={{ fontSize: 18 }} />}
            sx={{ 
              borderRadius: 2, 
              textTransform: 'none', 
              fontWeight: 600, 
              boxShadow: 'none',
              px: 3,
              '&:hover': { boxShadow: 'none' },
            }}
          >
            Delete My Account
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Settings;
