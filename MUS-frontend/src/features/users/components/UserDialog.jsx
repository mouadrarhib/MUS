import React, { useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  FormControlLabel,
  Checkbox,
  Typography,
  Divider,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormHelperText,
  Slide,
  IconButton,
  Stack,
  alpha,
  useTheme,
  useMediaQuery,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import Grid from '@mui/material/GridLegacy';
import {
  Close,
  School as SchoolIcon,
  Business as BusinessIcon,
  Code as CodeIcon,
  PersonAdd,
  CheckCircle,
  Assignment,
} from "@mui/icons-material";
import PropTypes from "prop-types";
import { useForm, Controller } from "react-hook-form";
import { AsyncButton } from '@/shared/components/ui';

// Sample universities
const commonUniversities = [
  { label: "Mohammed V University", city: "Rabat" },
  { label: "Al Akhawayn University", city: "Ifrane" },
  { label: "Cadi Ayyad University", city: "Marrakech" },
  { label: "Sidi Mohamed Ben Abdellah University", city: "Fez" },
  { label: "Hassan II University", city: "Casablanca" },
  { label: "Hassan I University", city: "Settat" },
  { label: "Abdelmalek Essaadi University", city: "Tangier" },
  { label: "Sultan Moulay Slimane University", city: "Beni Mellal" },
  { label: "Ibnou Zohr University", city: "Agadir" },
  { label: "ENSEM Engineering School", city: "Casablanca" },
  { label: "INPT Engineering School", city: "Rabat" },
  { label: "ENSA Marrakech", city: "Marrakech" },
];

const institutionTypes = [
  {
    value: "Public University",
    label: "Public University",
    icon: <SchoolIcon fontSize="small" />,
  },
  {
    value: "Private University",
    label: "Private University",
    icon: <BusinessIcon fontSize="small" />,
  },
  {
    value: "Engineering School",
    label: "Engineering School",
    icon: <CodeIcon fontSize="small" />,
  },
  {
    value: "Business School",
    label: "Business School",
    icon: <BusinessIcon fontSize="small" />,
  },
  { value: "Other", label: "Other", icon: <SchoolIcon fontSize="small" /> },
];

const userRoles = [
  { value: "student", label: "Student", icon: "🎓" },
  { value: "teacher", label: "Teacher", icon: "👨‍🏫" },
  { value: "admin", label: "Admin", icon: "🔐" },
];

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const getDefaultValues = (user) => {
  let rolesArray = ["student"];
  if (Array.isArray(user?.roles)) {
    rolesArray = user.roles.map((r) => String(r).trim().toLowerCase()).filter(Boolean);
  } else if (typeof user?.roles === "string") {
    rolesArray = user.roles.split(",").map((r) => r.trim().toLowerCase()).filter(Boolean);
  } else if (user?.role) {
    rolesArray = [String(user.role).trim().toLowerCase()];
  }

  if (rolesArray.length === 0) {
    rolesArray = ["student"];
  }

  return {
    fullName: user?.full_name || "",
    email: user?.email || "",
    userRoles: rolesArray,
    isActive: user?.is_active !== undefined ? user.is_active : true,
    institutionName: user?.institution_name || "",
    institutionCity: user?.institution_city || "",
    institutionType: user?.institution_type || "",
    programName: user?.program_name || "",
    domainName: user?.domain_name || "",
    currentSemesterName: user?.current_semester_name || "",
    levelName: user?.current_level_name || "",
  };
};

const UserDialog = ({ open, user, onClose, onSave, saving = false }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const {
    register,
    control,
    reset,
    watch,
    getValues,
    setValue,
    setError,
    clearErrors,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: getDefaultValues(user),
  });

  const selectedRoles = watch("userRoles") || [];
  const isActive = watch("isActive");

  useEffect(() => {
    reset(getDefaultValues(user));
    clearErrors();
  }, [user, open, reset, clearErrors]);

  const handleRoleChange = (role) => {
    const currentRoles = getValues("userRoles") || [];
    const nextRoles = currentRoles.includes(role)
      ? currentRoles.filter((r) => r !== role)
      : [...currentRoles, role];
    setValue("userRoles", nextRoles, { shouldDirty: true });
    clearErrors("userRoles");
  };

  const handleSave = handleSubmit(async (data) => {
    if (!data.userRoles?.length) {
      setError("userRoles", {
        type: "manual",
        message: "At least one role is required",
      });
      return;
    }

    await onSave({
      full_name: data.fullName,
      email: data.email,
      roles: data.userRoles.join(", "),
      is_active: data.isActive,
      institution_name: data.institutionName,
      institution_city: data.institutionCity,
      institution_type: data.institutionType,
      program_name: data.programName,
      domain_name: data.domainName,
      current_semester_name: data.currentSemesterName,
      current_level_name: data.levelName,
      ...(user && { user_id: user.user_id }),
    });
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionComponent={Transition}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: { xs: 0, sm: 3 },
          boxShadow: theme.shadows[24],
          maxHeight: "95vh",
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          position: "relative",
          p: 3,
          pb: 2,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: alpha(theme.palette.primary.main, 0.15),
              color: "primary.main",
            }}
          >
            <PersonAdd />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontWeight: 700,
                color: "text.primary",
              }}
            >
              {user ? "Edit User Profile" : "Create New User"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user
                ? "Update user information and academic details"
                : "Add a new user to the system"}
            </Typography>
          </Box>
        </Stack>
        <IconButton
          onClick={onClose}
          disabled={saving}
          sx={{
            position: "absolute",
            right: 12,
            top: 12,
            color: "text.secondary",
            transition: "all 0.2s ease",
            "&:hover": {
              bgcolor: alpha(theme.palette.error.main, 0.1),
              color: "error.main",
              transform: "rotate(90deg)",
            },
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0, overflowY: "auto" }}>
        <Box sx={{ p: 4 }}>
          <Stack spacing={4}>
            {/* Basic Information Section */}
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  mb: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <PersonAdd sx={{ fontSize: 20 }} /> Personal Information
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Enter the user's basic information
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    {...register("fullName", {
                      required: "Full name is required",
                    })}
                    error={!!errors.fullName}
                    helperText={errors.fullName?.message}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        "&:hover fieldset": {
                          borderColor: "primary.main",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "primary.main",
                          borderWidth: 2,
                        },
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Invalid email format",
                      },
                    })}
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        "&:hover fieldset": {
                          borderColor: "primary.main",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "primary.main",
                          borderWidth: 2,
                        },
                      },
                    }}
                  />
                </Grid>
              </Grid>
            </Box>

            <Divider />

            {/* Role Selection Section */}
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  mb: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Assignment sx={{ fontSize: 20 }} /> User Roles
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Select one or more roles for this user
              </Typography>
              {errors.userRoles && (
                <FormHelperText error sx={{ mb: 2 }}>
                  {errors.userRoles}
                </FormHelperText>
              )}
              <Grid container spacing={2}>
                {userRoles.map((role) => (
                  <Grid item xs={12} key={role.value}>
                    <Box
                      onClick={() => handleRoleChange(role.value)}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        border: "2px solid",
                        borderColor: selectedRoles.includes(role.value)
                          ? "primary.main"
                          : "divider",
                        bgcolor: selectedRoles.includes(role.value)
                          ? alpha(theme.palette.primary.main, 0.08)
                          : "background.paper",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          borderColor: "primary.main",
                          bgcolor: alpha(theme.palette.primary.main, 0.05),
                          transform: "translateY(-2px)",
                          boxShadow: theme.shadows[4],
                        },
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 1.5,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            bgcolor: selectedRoles.includes(role.value)
                              ? alpha(theme.palette.primary.main, 0.15)
                              : alpha(theme.palette.text.primary, 0.05),
                            fontSize: "1.2rem",
                          }}
                        >
                          {role.icon}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {role.label}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {role.value === "admin"
                              ? "Full access"
                              : role.value === "teacher"
                                ? "Content creator"
                                : "Learner"}
                          </Typography>
                        </Box>
                        {selectedRoles.includes(role.value) && (
                          <CheckCircle
                            sx={{ color: "primary.main", fontSize: 20 }}
                          />
                        )}
                      </Stack>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>

            <Divider />

            {/* Academic Information Section */}
            {/* Academic Information Section */}
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  mb: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <SchoolIcon sx={{ fontSize: 20 }} /> Academic Information
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Add institution and academic details (optional for
                teachers/admins)
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel id="institution-label">Institution</InputLabel>
                    <Controller
                      name="institutionName"
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          labelId="institution-label"
                          id="institution-select"
                          label="Institution"
                          onChange={(e) => {
                            const selectedUni = commonUniversities.find((u) => u.label === e.target.value);
                            field.onChange(e.target.value);
                            setValue("institutionCity", selectedUni ? selectedUni.city : "", { shouldDirty: true });
                          }}
                          renderValue={(value) => {
                            const selected = commonUniversities.find((u) => u.label === value);
                            return selected ? (
                              <Stack direction="row" alignItems="center" spacing={1.5}>
                                <SchoolIcon fontSize="small" sx={{ color: "primary.main" }} />
                                <Box>
                                  <Typography variant="body2">{selected.label}</Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    📍 {selected.city}
                                  </Typography>
                                </Box>
                              </Stack>
                            ) : (
                              <Typography color="text.secondary">Select institution</Typography>
                            );
                          }}
                          sx={{
                            borderRadius: 2,
                            "& .MuiOutlinedInput-notchedOutline": {
                              borderColor: "divider",
                            },
                            "&:hover .MuiOutlinedInput-notchedOutline": {
                              borderColor: "primary.main",
                            },
                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                              borderColor: "primary.main",
                              borderWidth: 2,
                            },
                          }}
                          MenuProps={{
                            PaperProps: {
                              sx: {
                                borderRadius: 2,
                                mt: 1,
                                maxHeight: 400,
                                boxShadow: theme.shadows[8],
                                "& .MuiMenuItem-root": {
                                  borderRadius: 1,
                                  mx: 1,
                                  my: 0.5,
                                  py: 1.5,
                                  "&:hover": {
                                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                                  },
                                  "&.Mui-selected": {
                                    bgcolor: alpha(theme.palette.primary.main, 0.12),
                                    "&:hover": {
                                      bgcolor: alpha(theme.palette.primary.main, 0.16),
                                    },
                                  },
                                },
                              },
                            },
                          }}
                        >
                          {commonUniversities.map((university) => (
                            <MenuItem key={university.label} value={university.label}>
                              <ListItemIcon sx={{ minWidth: 36 }}>
                                <SchoolIcon fontSize="small" sx={{ color: "primary.main" }} />
                              </ListItemIcon>
                              <ListItemText
                                primary={university.label}
                                secondary={`📍 ${university.city}`}
                                primaryTypographyProps={{
                                  variant: "body2",
                                  fontWeight: 500,
                                }}
                                secondaryTypographyProps={{
                                  variant: "caption",
                                }}
                              />
                            </MenuItem>
                          ))}
                        </Select>
                      )}
                    />
                    <FormHelperText>
                      Select your educational institution
                    </FormHelperText>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel id="institution-type-label">
                      Institution Type
                    </InputLabel>
                    <Controller
                      name="institutionType"
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          labelId="institution-type-label"
                          id="institution-type-select"
                          label="Institution Type"
                          renderValue={(value) => {
                            const selected = institutionTypes.find((t) => t.value === value);
                            return selected ? (
                              <Stack direction="row" alignItems="center" spacing={1.5}>
                                {selected.icon}
                                <Typography>{selected.label}</Typography>
                              </Stack>
                            ) : (
                              <Typography color="text.secondary">Select institution type</Typography>
                            );
                          }}
                          sx={{
                            borderRadius: 2,
                            "& .MuiOutlinedInput-notchedOutline": {
                              borderColor: "divider",
                            },
                            "&:hover .MuiOutlinedInput-notchedOutline": {
                              borderColor: "primary.main",
                            },
                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                              borderColor: "primary.main",
                              borderWidth: 2,
                            },
                          }}
                          MenuProps={{
                            PaperProps: {
                              sx: {
                                borderRadius: 2,
                                mt: 1,
                                boxShadow: theme.shadows[8],
                                "& .MuiMenuItem-root": {
                                  borderRadius: 1,
                                  mx: 1,
                                  my: 0.5,
                                  "&:hover": {
                                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                                  },
                                  "&.Mui-selected": {
                                    bgcolor: alpha(theme.palette.primary.main, 0.12),
                                    "&:hover": {
                                      bgcolor: alpha(theme.palette.primary.main, 0.16),
                                    },
                                  },
                                },
                              },
                            },
                          }}
                        >
                          {institutionTypes.map((type) => (
                            <MenuItem key={type.value} value={type.value}>
                              <ListItemIcon sx={{ minWidth: 36 }}>{type.icon}</ListItemIcon>
                              <ListItemText primary={type.label} />
                            </MenuItem>
                          ))}
                        </Select>
                      )}
                    />
                    <FormHelperText>
                      Select the type of educational institution
                    </FormHelperText>
                  </FormControl>
                </Grid>
              </Grid>

              {selectedRoles.includes("student") && (
                <Grid container spacing={3} sx={{ mt: 1 }}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Program Name"
                      {...register("programName")}
                      placeholder="e.g., Computer Science"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Domain/Field"
                      {...register("domainName")}
                      placeholder="e.g., Software Engineering"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Current Semester"
                      {...register("currentSemesterName")}
                      placeholder="e.g., Fall 2026"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Level/Year"
                      {...register("levelName")}
                      placeholder="e.g., 3rd Year"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                        },
                      }}
                    />
                  </Grid>
                </Grid>
              )}
            </Box>

            <Divider />

            {/* Status Section */}
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  mb: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <CheckCircle sx={{ fontSize: 20 }} /> Account Status
              </Typography>
              <FormControlLabel
                control={
                  <Controller
                    name="isActive"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        checked={!!field.value}
                        onChange={(event) => field.onChange(event.target.checked)}
                        sx={{
                          color: "primary.main",
                          "&.Mui-checked": {
                            color: "primary.main",
                          },
                        }}
                      />
                    )}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {isActive
                        ? "Active Account"
                        : "Inactive Account"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {isActive
                        ? "User can access the platform"
                        : "User access is disabled"}
                    </Typography>
                  </Box>
                }
              />
            </Box>
          </Stack>
        </Box>
      </DialogContent>

      {/* Footer */}
      <DialogActions
        sx={{
          p: 3,
          borderTop: "1px solid",
          borderColor: "divider",
          gap: 2,
        }}
      >
        <Button
          onClick={onClose}
          variant="outlined"
          fullWidth
          disabled={saving}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
            py: 1.5,
            "&:hover": {
              borderColor: "error.main",
              color: "error.main",
            },
          }}
        >
          Cancel
        </Button>
        <AsyncButton
          onClick={handleSave}
          variant="contained"
          fullWidth
          loading={saving}
          loadingText={user ? 'Saving...' : 'Creating...'}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
            py: 1.5,
            boxShadow: "none",
            "&:hover": {
              boxShadow: theme.shadows[8],
            },
          }}
        >
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
};

UserDialog.defaultProps = {
  user: null,
  saving: false,
};

export default UserDialog;
