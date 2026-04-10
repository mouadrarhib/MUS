import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import {
  Alert,
  alpha,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  AdminPanelSettings,
  CheckCircle,
  Close,
  PersonAdd,
  School,
} from "@mui/icons-material";
import { Controller, useForm } from "react-hook-form";
import { AsyncButton } from "@/shared/components/ui";
import institutionProgramService from "@/services/institutionProgramService";

const roleMeta = {
  student: {
    label: "Student",
    helper: "Learner account with academic profile support",
  },
  teacher: {
    label: "Teacher",
    helper: "Content contributor and academic referent",
  },
  admin: {
    label: "Admin",
    helper: "Protected project administrator account",
  },
};

const getDefaultValues = (user) => ({
  fullName: user?.full_name || "",
  email: user?.email || "",
  password: "",
  roleName: user?.primary_role || (typeof user?.roles === "string" ? user.roles.split(",")[0].trim().toLowerCase() : "student"),
  isActive: user?.is_active !== undefined ? Boolean(user.is_active) : true,
  institutionId: user?.institution_id ? String(user.institution_id) : "",
  programId: user?.program_id ? String(user.program_id) : "",
  levelId: user?.current_level_id ? String(user.current_level_id) : "",
  currentSemesterId: user?.current_semester_id ? String(user.current_semester_id) : "",
});

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

  const {
    control,
    register,
    reset,
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: getDefaultValues(user),
  });

  const selectedRole = watch("roleName");
  const selectedInstitutionId = watch("institutionId");
  const selectedProgramId = watch("programId");
  const selectedLevelId = watch("levelId");

  useEffect(() => {
    reset(getDefaultValues(user));
    setLoadError("");
  }, [user, open, reset]);

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
    const allowedNames = user?.primary_role === "admin"
      ? ["admin"]
      : availableRoles
          .map((role) => role.name)
          .filter((name) => (name === "admin" ? allowAdminCreation : true));

    return availableRoles.filter((role) => allowedNames.includes(role.name));
  }, [availableRoles, user]);

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
      ...(data.roleName === "student" && data.institutionId && data.programId && data.levelId && data.currentSemesterId
        ? {
            institution_id: Number(data.institutionId),
            program_id: Number(data.programId),
            level_id: Number(data.levelId),
            current_semester_id: Number(data.currentSemesterId),
          }
        : {}),
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
        sx: {
          borderRadius: { xs: 0, sm: 3 },
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle sx={{ p: 0 }}>
        <Box sx={{ px: 3, py: 2.6, background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.04)} 100%)`, borderBottom: "1px solid", borderColor: "divider", position: "relative" }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Box sx={{ width: 46, height: 46, borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: alpha(theme.palette.primary.main, 0.15), color: "primary.main" }}>
              <PersonAdd />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" fontWeight={800}>{user ? "Edit User" : "Create User"}</Typography>
              <Typography variant="body2" color="text.secondary">
                {user ? "Update account status and role assignment" : "Create a new account with exactly one operational role"}
              </Typography>
            </Box>
          </Stack>
          <IconButton onClick={onClose} disabled={saving} sx={{ position: "absolute", top: 12, right: 12 }}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3, display: "grid", gap: 3 }}>
        {loadError ? <Alert severity="error">{loadError}</Alert> : null}

        {user?.primary_role === "admin" ? (
          <Alert severity="info" icon={<AdminPanelSettings fontSize="inherit" />}>
            This is the unique admin account. Its role is locked and cannot be changed.
          </Alert>
        ) : null}

        <Box>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Account Information</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Full Name"
                {...register("fullName", { required: "Full name is required" })}
                error={!!errors.fullName}
                helperText={errors.fullName?.message}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email format" },
                })}
                error={!!errors.email}
                helperText={errors.email?.message}
              />
            </Grid>
            {!user ? (
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Temporary Password"
                  type="password"
                  {...register("password", {
                    required: "Password is required",
                    minLength: { value: 8, message: "Password must be at least 8 characters" },
                  })}
                  error={!!errors.password}
                  helperText={errors.password?.message || "The user can change it later from account settings"}
                />
              </Grid>
            ) : null}
          </Grid>
        </Box>

        <Box>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Role Assignment</Typography>
          <Controller
            name="roleName"
            control={control}
            rules={{ required: "Role is required" }}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.roleName}>
                <InputLabel>Role</InputLabel>
                <Select {...field} label="Role" disabled={user?.primary_role === "admin"}>
                  {availableRoleOptions.map((role) => (
                    <MenuItem key={role.id} value={role.name}>
                      <Box>
                        <Typography variant="body2" fontWeight={700}>{roleMeta[role.name]?.label || role.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{roleMeta[role.name]?.helper || role.description}</Typography>
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
          <Box>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Student Academic Profile</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Controller
                  name="institutionId"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Institution</InputLabel>
                      <Select {...field} label="Institution">
                        {institutions.map((institution) => (
                          <MenuItem key={institution.id} value={String(institution.id)}>{institution.name}</MenuItem>
                        ))}
                      </Select>
                      <FormHelperText>Optional, but required if you want to create a student academic profile</FormHelperText>
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="programId"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth disabled={!selectedInstitutionId || programsLoading}>
                      <InputLabel>Program</InputLabel>
                      <Select {...field} label="Program">
                        {programOptions.map((program) => (
                          <MenuItem key={program.id} value={String(program.id)}>{program.name}</MenuItem>
                        ))}
                      </Select>
                      <FormHelperText>{selectedInstitutionId ? "Programs available for the selected institution" : "Choose an institution first"}</FormHelperText>
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="levelId"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth disabled={!selectedProgramId}>
                      <InputLabel>Level</InputLabel>
                      <Select {...field} label="Level">
                        {filteredLevels.map((level) => (
                          <MenuItem key={level.id} value={String(level.id)}>{level.name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="currentSemesterId"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth disabled={!selectedLevelId}>
                      <InputLabel>Current Semester</InputLabel>
                      <Select {...field} label="Current Semester">
                        {filteredSemesters.map((semester) => (
                          <MenuItem key={semester.id} value={String(semester.id)}>{semester.name}</MenuItem>
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

        <Box>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>Account Status</Typography>
          <Controller
            name="isActive"
            control={control}
            render={({ field }) => (
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Switch checked={Boolean(field.value)} onChange={(event) => field.onChange(event.target.checked)} disabled={user?.primary_role === "admin"} color="success" />
                <Box>
                  <Typography variant="body2" fontWeight={700}>{field.value ? "Active account" : "Inactive account"}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {user?.primary_role === "admin" ? "The unique admin account must remain active." : "Inactive users cannot sign in."}
                  </Typography>
                </Box>
                {field.value ? <CheckCircle sx={{ color: "success.main", fontSize: 18 }} /> : null}
              </Stack>
            )}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 1.5, borderTop: "1px solid", borderColor: "divider" }}>
        <Button onClick={onClose} variant="outlined" disabled={saving} sx={{ textTransform: "none", fontWeight: 600, borderRadius: 2 }}>
          Cancel
        </Button>
        <AsyncButton onClick={handleSave} loading={saving} loadingText={user ? "Saving..." : "Creating..."} variant="contained" sx={{ textTransform: "none", fontWeight: 700, borderRadius: 2 }}>
          {user ? "Save Changes" : "Create User"}
        </AsyncButton>
      </DialogActions>
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
