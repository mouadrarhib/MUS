import { memo, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import {
  Alert,
  alpha,
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import {
  AdminPanelSettings,
  Check,
  CheckCircle,
  Close,
  InfoOutlined,
  PersonAdd,
  PhotoCamera,
  School,
  SchoolOutlined,
  Security,
  TuneRounded,
} from "@mui/icons-material";
import { Controller, useForm } from "react-hook-form";
import { AsyncButton } from "@/shared/components/ui";
import institutionProgramService from "@/services/institutionProgramService";

const SIDEBAR_BG = "#0f172a";
const SIDEBAR_ACCENT = "#14b8a6";

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    fontSize: "0.875rem",
    transition: "box-shadow 0.15s ease",
    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "primary.main" },
    "&.Mui-focused": {
      boxShadow: (theme) => `0 0 0 3px ${alpha(theme.palette.primary.main, 0.12)}`,
    },
  },
  "& .MuiInputLabel-root": { fontSize: "0.875rem" },
};

const selectSx = { borderRadius: "10px", fontSize: "0.875rem" };

const roleMeta = {
  student: {
    label: "Student",
    helper: "Learner account with academic profile support",
    color: "info",
  },
  teacher: {
    label: "Teacher",
    helper: "Content contributor and academic referent",
    color: "success",
  },
  admin: {
    label: "Admin",
    helper: "Protected project administrator account",
    color: "warning",
  },
};

const getDefaultValues = (user) => ({
  fullName: user?.full_name || "",
  email: user?.email || "",
  password: "",
  roleName:
    user?.primary_role ||
    (typeof user?.roles === "string" ? user.roles.split(",")[0].trim().toLowerCase() : "student"),
  isActive: user?.is_active !== undefined ? Boolean(user.is_active) : true,
  institutionId: user?.institution_id ? String(user.institution_id) : "",
  programId: user?.program_id ? String(user.program_id) : "",
  levelId: user?.current_level_id ? String(user.current_level_id) : "",
  currentSemesterId: user?.current_semester_id ? String(user.current_semester_id) : "",
});

const FieldLabel = memo(({ children, required, hint }) => (
  <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.75 }}>
    <Typography
      sx={{
        fontSize: "0.695rem",
        fontWeight: 700,
        letterSpacing: 0.6,
        textTransform: "uppercase",
        color: "text.secondary",
      }}
    >
      {children}
      {required && (
        <Box component="span" sx={{ color: "error.main", ml: 0.3 }}>
          *
        </Box>
      )}
    </Typography>
    {hint && (
      <Tooltip title={hint} placement="top" arrow>
        <InfoOutlined sx={{ fontSize: 12, color: "text.disabled", cursor: "help" }} />
      </Tooltip>
    )}
  </Stack>
));

FieldLabel.displayName = "FieldLabel";

FieldLabel.propTypes = {
  children: PropTypes.node.isRequired,
  required: PropTypes.bool,
  hint: PropTypes.string,
};

const Sidebar = memo(({ user, onClose, fullName, selectedRole }) => {
  const role = roleMeta[selectedRole] || roleMeta.student;

  return (
    <Box
      sx={{
        width: { xs: 0, sm: 230 },
        flexShrink: 0,
        bgcolor: SIDEBAR_BG,
        display: { xs: "none", sm: "flex" },
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Box sx={{ px: 2.5, pt: 2.5, pb: 2 }}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
          <Box>
            <Typography
              sx={{
                fontWeight: (t) => t.typography.fontWeightExtraBold,
                color: "white",
                fontSize: "0.9375rem",
                letterSpacing: -0.2,
                lineHeight: 1.2,
              }}
            >
              {user ? "Edit User" : "Create User"}
            </Typography>
            <Typography
              sx={{
                fontSize: "0.7rem",
                color: "rgba(255,255,255,0.38)",
                mt: 0.4,
                display: "block",
                lineHeight: 1.4,
                maxWidth: 150,
              }}
              noWrap
            >
              {fullName || "Fill account and role details"}
            </Typography>
          </Box>
          <IconButton
            size="small"
            onClick={onClose}
            aria-label="Close dialog"
            sx={{
              color: "rgba(255,255,255,0.4)",
              borderRadius: "8px",
              p: 0.5,
              "&:hover": { color: "white", bgcolor: "rgba(255,255,255,0.08)" },
            }}
          >
            <Close sx={{ fontSize: 16 }} />
          </IconButton>
        </Stack>
      </Box>

      <Box sx={{ borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)", px: 2.5, py: 2 }}>
        <Typography sx={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", color: "rgba(255,255,255,0.28)", display: "block", mb: 1.1 }}>
          Assigned Role
        </Typography>
        <Chip
          label={role.label}
          size="small"
          sx={{
            height: 22,
            fontSize: "0.72rem",
            fontWeight: 700,
            bgcolor: `${SIDEBAR_ACCENT}2a`,
            color: SIDEBAR_ACCENT,
            border: `1px solid ${SIDEBAR_ACCENT}40`,
            textTransform: "capitalize",
          }}
        />
        <Typography sx={{ color: "rgba(255,255,255,0.45)", fontSize: "0.72rem", lineHeight: 1.55, mt: 1 }}>
          {role.helper}
        </Typography>
      </Box>

      <Box sx={{ px: 2.5, py: 2.3, display: "grid", gap: 1.25 }}>
        {["Account info", "Role assignment", "Academic profile", "Status & access"].map((item, idx) => (
          <Stack key={item} direction="row" spacing={1} alignItems="center">
            <Box
              sx={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                bgcolor: idx === 0 ? SIDEBAR_ACCENT : "rgba(255,255,255,0.08)",
                color: idx === 0 ? "#fff" : "rgba(255,255,255,0.55)",
                border: `1px solid ${idx === 0 ? SIDEBAR_ACCENT : "rgba(255,255,255,0.12)"}`,
                display: "grid",
                placeItems: "center",
                fontSize: "0.62rem",
                fontWeight: 700,
              }}
            >
              {idx + 1}
            </Box>
            <Typography sx={{ fontSize: "0.74rem", color: "rgba(255,255,255,0.62)" }}>{item}</Typography>
          </Stack>
        ))}
      </Box>
    </Box>
  );
});

Sidebar.displayName = "Sidebar";

Sidebar.propTypes = {
  user: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  fullName: PropTypes.string,
  selectedRole: PropTypes.string,
};

const UserDialog = ({
  open,
  user,
  onClose,
  onSave,
  saving = false,
  availableRoles = [],
  allowAdminCreation = false,
  institutions = [],
  levels = [],
  semesters = [],
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));
  const [programOptions, setProgramOptions] = useState([]);
  const [programsLoading, setProgramsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");

  const {
    control,
    register,
    reset,
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: getDefaultValues(user) });

  const selectedRole = watch("roleName");
  const selectedInstitutionId = watch("institutionId");
  const selectedProgramId = watch("programId");
  const selectedLevelId = watch("levelId");
  const fullName = watch("fullName");

  useEffect(() => {
    reset(getDefaultValues(user));
    setLoadError("");
    setSelectedAvatar(null);
    setAvatarPreview(user?.avatar_url || "");
  }, [user, open, reset]);

  useEffect(() => {
    return () => {
      if (avatarPreview?.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!String(file.type || '').startsWith('image/')) return;

    if (avatarPreview?.startsWith('blob:')) {
      URL.revokeObjectURL(avatarPreview);
    }

    setSelectedAvatar(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  useEffect(() => {
    const loadPrograms = async () => {
      if (!selectedInstitutionId || selectedRole !== "student") {
        setProgramOptions([]);
        return;
      }

      setProgramsLoading(true);
      setLoadError("");
      try {
        const response = await institutionProgramService.getProgramsByInstitution(Number(selectedInstitutionId));
        const programs = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
        setProgramOptions(programs);
      } catch (error) {
        setProgramOptions([]);
        setLoadError(error?.response?.data?.message || "Failed to load institution programs");
      } finally {
        setProgramsLoading(false);
      }
    };

    loadPrograms();
  }, [selectedInstitutionId, selectedRole]);

  useEffect(() => {
    setValue("programId", "");
    setValue("levelId", "");
    setValue("currentSemesterId", "");
  }, [selectedInstitutionId, selectedRole, setValue]);

  useEffect(() => {
    setValue("levelId", "");
    setValue("currentSemesterId", "");
  }, [selectedProgramId, setValue]);

  useEffect(() => {
    setValue("currentSemesterId", "");
  }, [selectedLevelId, setValue]);

  const availableRoleOptions = useMemo(() => {
    const allowedNames =
      user?.primary_role === "admin"
        ? ["admin"]
        : availableRoles
            .map((role) => role.name)
            .filter((name) => (name === "admin" ? allowAdminCreation : true));

    return availableRoles.filter((role) => allowedNames.includes(role.name));
  }, [availableRoles, user, allowAdminCreation]);

  const filteredLevels = useMemo(
    () => levels.filter((level) => String(level.program_id || level.programId) === String(selectedProgramId)),
    [levels, selectedProgramId]
  );

  const filteredSemesters = useMemo(
    () => semesters.filter((semester) => String(semester.level_id || semester.levelId) === String(selectedLevelId)),
    [semesters, selectedLevelId]
  );

  const handleSave = handleSubmit(async (data) => {
    const payload = {
      full_name: data.fullName.trim(),
      email: data.email.trim(),
      role_name: data.roleName,
      is_active: Boolean(data.isActive),
      ...(user ? {} : { password: data.password }),
      ...(data.roleName === "student" &&
      data.institutionId &&
      data.programId &&
      data.levelId &&
      data.currentSemesterId
        ? {
            institution_id: Number(data.institutionId),
            program_id: Number(data.programId),
            level_id: Number(data.levelId),
            current_semester_id: Number(data.currentSemesterId),
          }
        : {}),
      ...(selectedAvatar ? { avatar_file: selectedAvatar } : {}),
    };

    await onSave(payload);
  });

  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onClose}
      fullWidth
      maxWidth="md"
      fullScreen={fullScreen}
      PaperProps={{
        elevation: 0,
        sx: {
          borderRadius: { xs: 0, sm: "20px" },
          border: "1px solid",
          borderColor: "divider",
          overflow: "hidden",
          display: "flex",
          flexDirection: "row",
          minHeight: { sm: 560 },
        },
      }}
      keepMounted
      transitionDuration={{ enter: 120, exit: 80 }}
    >
      <Sidebar user={user} onClose={onClose} fullName={fullName} selectedRole={selectedRole} />

      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        <DialogTitle sx={{ p: 0 }}>
          <Box
            sx={{
              px: { xs: 2.5, sm: 3.5 },
              py: 2.4,
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(
                theme.palette.primary.main,
                0.04
              )} 100%)`,
              borderBottom: "1px solid",
              borderColor: "divider",
              position: "relative",
            }}
          >
            <Stack direction="row" spacing={1.4} alignItems="center">
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: alpha(theme.palette.primary.main, 0.15),
                  color: "primary.main",
                }}
              >
                <PersonAdd sx={{ fontSize: 20 }} />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="subtitle1" fontWeight={800} noWrap>
                  {user ? "Edit User" : "Create User"}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  {user
                    ? "Update account status, role, and academic profile details"
                    : "Create a new account with one operational role and optional student profile"}
                </Typography>
              </Box>
            </Stack>
            <IconButton onClick={onClose} disabled={saving} sx={{ position: "absolute", top: 10, right: 10 }}>
              <Close sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: { xs: 2.5, sm: 3.5 }, display: "grid", gap: 2.5 }}>
          {loadError ? <Alert severity="error">{loadError}</Alert> : null}

          {user?.primary_role === "admin" ? (
            <Alert severity="info" icon={<AdminPanelSettings fontSize="inherit" />}>
              This is the unique admin account. Its role is locked and cannot be changed.
            </Alert>
          ) : null}

          <Box sx={{ p: 2.25, borderRadius: "12px", border: "1px solid", borderColor: "divider", bgcolor: (t) => alpha(t.palette.primary.main, 0.015) }}>
            <Stack direction="row" spacing={0.8} alignItems="center" sx={{ mb: 1.8 }}>
              <PersonAdd sx={{ fontSize: 18, color: "primary.main" }} />
              <Typography variant="subtitle2" fontWeight={800}>Account Information</Typography>
            </Stack>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FieldLabel required>Full Name</FieldLabel>
                <TextField
                  fullWidth
                  placeholder="User full name"
                  {...register("fullName", { required: "Full name is required" })}
                  error={!!errors.fullName}
                  helperText={errors.fullName?.message}
                  size="small"
                  sx={fieldSx}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FieldLabel required>Email</FieldLabel>
                <TextField
                  fullWidth
                  placeholder="user@institution.edu"
                  type="email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email format" },
                  })}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  size="small"
                  sx={fieldSx}
                />
              </Grid>
              {!user ? (
                <Grid item xs={12} md={6}>
                  <FieldLabel required hint="The user can change it later from account settings.">
                    Temporary Password
                  </FieldLabel>
                  <TextField
                    fullWidth
                    type="password"
                    {...register("password", {
                      required: "Password is required",
                      minLength: { value: 8, message: "Password must be at least 8 characters" },
                    })}
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    size="small"
                    sx={fieldSx}
                  />
                </Grid>
              ) : null}

              <Grid item xs={12}>
                <FieldLabel hint="Optional profile photo for this user account.">Profile Photo</FieldLabel>
                <Stack direction="row" spacing={1.2} alignItems="center">
                  <Avatar src={avatarPreview || user?.avatar_url || ''} sx={{ width: 48, height: 48 }}>
                    {(watch('fullName') || user?.full_name || 'U').charAt(0)}
                  </Avatar>
                  <Button component="label" variant="outlined" size="small" startIcon={<PhotoCamera />} sx={{ textTransform: 'none' }}>
                    {selectedAvatar ? 'Replace photo' : 'Upload photo'}
                    <input hidden type="file" accept="image/*" onChange={handleAvatarChange} />
                  </Button>
                  {selectedAvatar ? (
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {selectedAvatar.name}
                    </Typography>
                  ) : null}
                </Stack>
              </Grid>
            </Grid>
          </Box>

          <Box sx={{ p: 2.25, borderRadius: "12px", border: "1px solid", borderColor: "divider" }}>
            <Stack direction="row" spacing={0.8} alignItems="center" sx={{ mb: 1.8 }}>
              <Security sx={{ fontSize: 18, color: "info.main" }} />
              <Typography variant="subtitle2" fontWeight={800}>Role Assignment</Typography>
            </Stack>
            <Controller
              name="roleName"
              control={control}
              rules={{ required: "Role is required" }}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.roleName} size="small">
                  <InputLabel>Role</InputLabel>
                  <Select {...field} label="Role" disabled={user?.primary_role === "admin"} sx={selectSx}>
                    {availableRoleOptions.map((role) => (
                      <MenuItem key={role.id} value={role.name}>
                        <Box>
                          <Typography variant="body2" fontWeight={700}>
                            {roleMeta[role.name]?.label || role.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {roleMeta[role.name]?.helper || role.description}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>{errors.roleName?.message || "Exactly one role is allowed for each user"}</FormHelperText>
                </FormControl>
              )}
            />
          </Box>

          {!user && selectedRole === "student" ? (
            <Box sx={{ p: 2.25, borderRadius: "12px", border: "1px solid", borderColor: "divider", bgcolor: (t) => alpha(t.palette.success.main, 0.02) }}>
              <Stack direction="row" spacing={0.8} alignItems="center" sx={{ mb: 1.8 }}>
                <SchoolOutlined sx={{ fontSize: 18, color: "success.main" }} />
                <Typography variant="subtitle2" fontWeight={800}>Student Academic Profile</Typography>
              </Stack>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FieldLabel>Institution</FieldLabel>
                  <Controller
                    name="institutionId"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth size="small">
                        <InputLabel>Institution</InputLabel>
                        <Select {...field} label="Institution" sx={selectSx}>
                          {institutions.map((institution) => (
                            <MenuItem key={institution.id} value={String(institution.id)}>
                              {institution.name}
                            </MenuItem>
                          ))}
                        </Select>
                        <FormHelperText>
                          Optional, but required if you want to create a student academic profile
                        </FormHelperText>
                      </FormControl>
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FieldLabel>Program</FieldLabel>
                  <Controller
                    name="programId"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth size="small" disabled={!selectedInstitutionId || programsLoading}>
                        <InputLabel>Program</InputLabel>
                        <Select {...field} label="Program" sx={selectSx}>
                          {programOptions.map((program) => (
                            <MenuItem key={program.id || program.program_id} value={String(program.id || program.program_id)}>
                              {program.name || program.program_name}
                            </MenuItem>
                          ))}
                        </Select>
                        <FormHelperText>
                          {selectedInstitutionId ? "Programs available for the selected institution" : "Choose an institution first"}
                        </FormHelperText>
                      </FormControl>
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FieldLabel>Level</FieldLabel>
                  <Controller
                    name="levelId"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth size="small" disabled={!selectedProgramId}>
                        <InputLabel>Level</InputLabel>
                        <Select {...field} label="Level" sx={selectSx}>
                          {filteredLevels.map((level) => (
                            <MenuItem key={level.id || level.level_id} value={String(level.id || level.level_id)}>
                              {level.name || level.level_name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FieldLabel>Current Semester</FieldLabel>
                  <Controller
                    name="currentSemesterId"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth size="small" disabled={!selectedLevelId}>
                        <InputLabel>Current Semester</InputLabel>
                        <Select {...field} label="Current Semester" sx={selectSx}>
                          {filteredSemesters.map((semester) => (
                            <MenuItem key={semester.id || semester.semester_id} value={String(semester.id || semester.semester_id)}>
                              {semester.name || semester.semester_name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  />
                </Grid>
              </Grid>
            </Box>
          ) : null}

          {user ? (
            <Alert severity="info" icon={<School fontSize="inherit" />}>
              Academic profile data is kept in the database and managed separately from this user administration form.
            </Alert>
          ) : null}

          <Box sx={{ p: 2.25, borderRadius: "12px", border: "1px solid", borderColor: "divider" }}>
            <Stack direction="row" spacing={0.8} alignItems="center" sx={{ mb: 1.8 }}>
              <TuneRounded sx={{ fontSize: 18, color: "warning.main" }} />
              <Typography variant="subtitle2" fontWeight={800}>Account Status</Typography>
            </Stack>
            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Switch
                    checked={Boolean(field.value)}
                    onChange={(event) => field.onChange(event.target.checked)}
                    disabled={user?.primary_role === "admin"}
                    color="success"
                  />
                  <Box>
                    <Typography variant="body2" fontWeight={700}>
                      {field.value ? "Active account" : "Inactive account"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {user?.primary_role === "admin"
                        ? "The unique admin account must remain active."
                        : "Inactive users cannot sign in."}
                    </Typography>
                  </Box>
                  {field.value ? <CheckCircle sx={{ color: "success.main", fontSize: 18 }} /> : null}
                </Stack>
              )}
            />
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            px: { xs: 2.5, sm: 3.5 },
            py: 2,
            gap: 1.2,
            borderTop: "1px solid",
            borderColor: "divider",
          }}
        >
          <Button
            onClick={onClose}
            variant="outlined"
            disabled={saving}
            sx={{ textTransform: "none", fontWeight: 600, borderRadius: 2 }}
          >
            Cancel
          </Button>
          <AsyncButton
            onClick={handleSave}
            loading={saving}
            loadingText={user ? "Saving..." : "Creating..."}
            variant="contained"
            startIcon={!saving ? <Check sx={{ fontSize: 16 }} /> : null}
            sx={{ textTransform: "none", fontWeight: 700, borderRadius: 2 }}
          >
            {user ? "Save Changes" : "Create User"}
          </AsyncButton>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

UserDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  user: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  saving: PropTypes.bool,
  availableRoles: PropTypes.array,
  allowAdminCreation: PropTypes.bool,
  institutions: PropTypes.array,
  levels: PropTypes.array,
  semesters: PropTypes.array,
};

export default UserDialog;
