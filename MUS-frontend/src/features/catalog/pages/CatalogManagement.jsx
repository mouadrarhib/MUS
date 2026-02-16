import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  Add,
  Delete,
  Edit,
  AccountTree,
  Apartment,
  Category,
  School,
  Link,
  Close,
} from "@mui/icons-material";
import institutionTypeService from "@/services/institutionTypeService";
import domainService from "@/services/domainService";
import programService from "@/services/programService";
import institutionService from "@/services/institutionService";
import institutionProgramService from "@/services/institutionProgramService";
import { PageHeader } from "@/shared/components/ui";

const TAB_KEYS = {
  INSTITUTION_TYPES: "institutionTypes",
  DOMAINS: "domains",
  PROGRAMS: "programs",
  INSTITUTIONS: "institutions",
  MAPPING: "mapping",
};

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

const extractData = (response) => response?.data ?? response;
const extractList = (response) => {
  const data = extractData(response);
  return Array.isArray(data) ? data : [];
};
const extractOne = (response) => {
  const data = extractData(response);
  return Array.isArray(data) ? data[0] || null : data || null;
};

const CatalogManagement = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [activeTab, setActiveTab] = useState(TAB_KEYS.INSTITUTION_TYPES);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [institutionTypes, setInstitutionTypes] = useState([]);
  const [domains, setDomains] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [institutions, setInstitutions] = useState([]);

  const [selectedInstitutionId, setSelectedInstitutionId] = useState("");
  const [selectedProgramId, setSelectedProgramId] = useState("");
  const [institutionPrograms, setInstitutionPrograms] = useState([]);
  const [mappingLoading, setMappingLoading] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState("create");
  const [dialogType, setDialogType] = useState(TAB_KEYS.INSTITUTION_TYPES);
  const [editingId, setEditingId] = useState(null);
  const [formValues, setFormValues] = useState({});

  const domainNameById = useMemo(() => {
    const map = new Map();
    domains.forEach((domain) => {
      map.set(String(domain.id), domain.name);
    });
    return map;
  }, [domains]);

  const institutionTypeNameById = useMemo(() => {
    const map = new Map();
    institutionTypes.forEach((item) => {
      map.set(String(item.id), item.name);
    });
    return map;
  }, [institutionTypes]);

  const institutionNameById = useMemo(() => {
    const map = new Map();
    institutions.forEach((item) => {
      map.set(String(item.id), item.name);
    });
    return map;
  }, [institutions]);

  const programNameById = useMemo(() => {
    const map = new Map();
    programs.forEach((item) => {
      map.set(String(item.id), item.name);
    });
    return map;
  }, [programs]);

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  const loadCoreData = async () => {
    setLoading(true);
    clearMessages();
    try {
      const [institutionTypesResp, domainsResp, programsResp, institutionsResp] = await Promise.all([
        institutionTypeService.getAllInstitutionTypes(),
        domainService.getAllDomains(),
        programService.getAllPrograms(),
        institutionService.getAllInstitutions(),
      ]);

      setInstitutionTypes(extractList(institutionTypesResp));
      setDomains(extractList(domainsResp));
      setPrograms(extractList(programsResp));
      setInstitutions(extractList(institutionsResp));
    } catch (e) {
      setError(getErrorMessage(e, "Failed to load catalog data"));
    } finally {
      setLoading(false);
    }
  };

  const loadInstitutionPrograms = async (institutionId) => {
    if (!institutionId) {
      setInstitutionPrograms([]);
      setMappingLoading(false);
      return;
    }

    setMappingLoading(true);
    setInstitutionPrograms([]);

    try {
      const response = await institutionProgramService.getProgramsByInstitution(institutionId);
      setInstitutionPrograms(extractList(response));
    } catch (e) {
      setInstitutionPrograms([]);
      setError(getErrorMessage(e, "Failed to load program mappings"));
    } finally {
      setMappingLoading(false);
    }
  };

  useEffect(() => {
    loadCoreData();
  }, []);

  useEffect(() => {
    loadInstitutionPrograms(selectedInstitutionId);
  }, [selectedInstitutionId]);

  const openCreateDialog = (type) => {
    clearMessages();
    setDialogType(type);
    setDialogMode("create");
    setEditingId(null);

    if (type === TAB_KEYS.INSTITUTION_TYPES || type === TAB_KEYS.DOMAINS) {
      setFormValues({ name: "" });
    } else if (type === TAB_KEYS.PROGRAMS) {
      setFormValues({ name: "", domain_id: "" });
    } else if (type === TAB_KEYS.INSTITUTIONS) {
      setFormValues({
        name: "",
        institution_type_id: "",
        country: "",
        city: "",
      });
    }

    setDialogOpen(true);
  };

  const openEditDialog = (type, item) => {
    clearMessages();
    setDialogType(type);
    setDialogMode("edit");
    setEditingId(item.id);

    if (type === TAB_KEYS.INSTITUTION_TYPES || type === TAB_KEYS.DOMAINS) {
      setFormValues({ name: item.name || "" });
    } else if (type === TAB_KEYS.PROGRAMS) {
      setFormValues({
        name: item.name || "",
        domain_id: String(item.domain_id || item.domainId || ""),
      });
    } else if (type === TAB_KEYS.INSTITUTIONS) {
      setFormValues({
        name: item.name || "",
        institution_type_id: String(item.institution_type_id || item.institutionTypeId || ""),
        country: item.country || "",
        city: item.city || "",
      });
    }

    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setFormValues({});
    setEditingId(null);
  };

  const handleFormChange = (name, value) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const refreshAfterMutation = async () => {
    await loadCoreData();
    if (selectedInstitutionId) {
      await loadInstitutionPrograms(selectedInstitutionId);
    }
  };

  const handleSubmitDialog = async () => {
    setSubmitting(true);
    clearMessages();
    try {
      if (dialogType === TAB_KEYS.INSTITUTION_TYPES) {
        if (dialogMode === "create") {
          await institutionTypeService.createInstitutionType(formValues.name.trim());
          setSuccess("Institution type created successfully");
        } else {
          await institutionTypeService.updateInstitutionType(editingId, { name: formValues.name.trim() });
          setSuccess("Institution type updated successfully");
        }
      }

      if (dialogType === TAB_KEYS.DOMAINS) {
        if (dialogMode === "create") {
          await domainService.createDomain(formValues.name.trim());
          setSuccess("Domain created successfully");
        } else {
          await domainService.updateDomain(editingId, { name: formValues.name.trim() });
          setSuccess("Domain updated successfully");
        }
      }

      if (dialogType === TAB_KEYS.PROGRAMS) {
        const payload = {
          name: formValues.name.trim(),
          domain_id: Number(formValues.domain_id),
        };
        if (dialogMode === "create") {
          await programService.createProgram(payload);
          setSuccess("Program created successfully");
        } else {
          await programService.updateProgram(editingId, payload);
          setSuccess("Program updated successfully");
        }
      }

      if (dialogType === TAB_KEYS.INSTITUTIONS) {
        const payload = {
          name: formValues.name.trim(),
          institution_type_id: Number(formValues.institution_type_id),
          country: formValues.country?.trim() || null,
          city: formValues.city?.trim() || null,
        };
        if (dialogMode === "create") {
          await institutionService.createInstitution(payload);
          setSuccess("Institution created successfully");
        } else {
          await institutionService.updateInstitution(editingId, payload);
          setSuccess("Institution updated successfully");
        }
      }

      await refreshAfterMutation();
      closeDialog();
    } catch (e) {
      setError(getErrorMessage(e, "Operation failed"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (type, item) => {
    const confirmed = window.confirm(`Delete ${item.name}? This action cannot be undone.`);
    if (!confirmed) return;

    setSubmitting(true);
    clearMessages();
    try {
      if (type === TAB_KEYS.INSTITUTION_TYPES) {
        await institutionTypeService.deleteInstitutionType(item.id);
        setSuccess("Institution type deleted successfully");
      }

      if (type === TAB_KEYS.DOMAINS) {
        await domainService.deleteDomain(item.id);
        setSuccess("Domain deleted successfully");
      }

      if (type === TAB_KEYS.PROGRAMS) {
        await programService.deleteProgram(item.id);
        setSuccess("Program deleted successfully");
      }

      if (type === TAB_KEYS.INSTITUTIONS) {
        await institutionService.deleteInstitution(item.id);
        setSuccess("Institution deleted successfully");
      }

      await refreshAfterMutation();
    } catch (e) {
      setError(getErrorMessage(e, "Delete failed"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddMapping = async () => {
    if (!selectedInstitutionId || !selectedProgramId) return;
    setSubmitting(true);
    clearMessages();
    try {
      await institutionProgramService.addAssociation(Number(selectedInstitutionId), Number(selectedProgramId));
      setSelectedProgramId("");
      await loadInstitutionPrograms(selectedInstitutionId);
      setSuccess("Program mapped to institution successfully");
    } catch (e) {
      setError(getErrorMessage(e, "Failed to create mapping"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveMapping = async (programId) => {
    if (!selectedInstitutionId) return;
    const confirmed = window.confirm("Remove this program from selected institution?");
    if (!confirmed) return;

    setSubmitting(true);
    clearMessages();
    try {
      await institutionProgramService.removeAssociation(Number(selectedInstitutionId), Number(programId));
      await loadInstitutionPrograms(selectedInstitutionId);
      setSuccess("Program mapping removed successfully");
    } catch (e) {
      setError(getErrorMessage(e, "Failed to remove mapping"));
    } finally {
      setSubmitting(false);
    }
  };

  const renderCrudTable = (type, rows, columns) => (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small">
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell key={column.key}>{column.label}</TableCell>
            ))}
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id} hover>
              {columns.map((column) => (
                <TableCell key={column.key}>{column.render ? column.render(row) : row[column.key]}</TableCell>
              ))}
              <TableCell align="right">
                <Button
                  size="small"
                  startIcon={<Edit fontSize="small" />}
                  onClick={() => openEditDialog(type, row)}
                >
                  Edit
                </Button>
                <Button
                  size="small"
                  color="error"
                  startIcon={<Delete fontSize="small" />}
                  onClick={() => handleDelete(type, row)}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderTabContent = () => {
    if (activeTab === TAB_KEYS.INSTITUTION_TYPES) {
      return (
        <Box>
          {renderCrudTable(TAB_KEYS.INSTITUTION_TYPES, institutionTypes, [
            { key: "name", label: "Name" },
          ])}
        </Box>
      );
    }

    if (activeTab === TAB_KEYS.DOMAINS) {
      return (
        <Box>
          {renderCrudTable(TAB_KEYS.DOMAINS, domains, [
            { key: "name", label: "Name" },
          ])}
        </Box>
      );
    }

    if (activeTab === TAB_KEYS.PROGRAMS) {
      return (
        <Box>
          {renderCrudTable(TAB_KEYS.PROGRAMS, programs, [
            { key: "name", label: "Program" },
            {
              key: "domain_id",
              label: "Domain",
              render: (row) => row.domain_name || domainNameById.get(String(row.domain_id || row.domainId)) || "-",
            },
          ])}
        </Box>
      );
    }

    if (activeTab === TAB_KEYS.INSTITUTIONS) {
      return (
        <Box>
          {renderCrudTable(TAB_KEYS.INSTITUTIONS, institutions, [
            { key: "name", label: "Institution" },
            {
              key: "institution_type_id",
              label: "Type",
              render: (row) =>
                row.institution_type_name ||
                institutionTypeNameById.get(String(row.institution_type_id || row.institutionTypeId)) ||
                "-",
            },
            { key: "country", label: "Country" },
            { key: "city", label: "City" },
          ])}
        </Box>
      );
    }

    return (
      <Box>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr auto" }, gap: 2, mb: 2 }}>
          <FormControl size="small" fullWidth>
            <InputLabel>Institution</InputLabel>
            <Select
              value={selectedInstitutionId}
              label="Institution"
              onChange={(event) => setSelectedInstitutionId(String(event.target.value))}
            >
              {institutions.map((institution) => (
                <MenuItem key={institution.id} value={String(institution.id)}>
                  {institution.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" fullWidth>
            <InputLabel>Program</InputLabel>
            <Select
              value={selectedProgramId}
              label="Program"
              onChange={(event) => setSelectedProgramId(String(event.target.value))}
            >
              {programs.map((program) => (
                <MenuItem key={program.id} value={String(program.id)}>
                  {program.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="contained"
            onClick={handleAddMapping}
            disabled={!selectedInstitutionId || !selectedProgramId || submitting || mappingLoading}
          >
            Add Mapping
          </Button>
        </Box>

        <Typography variant="subtitle1" sx={{ mb: 1.5 }}>
          Programs mapped to {institutionNameById.get(String(selectedInstitutionId)) || "selected institution"}
        </Typography>

        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Institution</TableCell>
                <TableCell>Program Name</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mappingLoading ? (
                <TableRow>
                  <TableCell colSpan={3}>
                    <Box sx={{ py: 2.5, display: "flex", alignItems: "center", justifyContent: "center", gap: 1.25 }}>
                      <CircularProgress size={20} />
                      <Typography variant="body2" color="text.secondary">
                        Loading institution programs...
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : null}
              {!mappingLoading && selectedInstitutionId && institutionPrograms.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3}>
                    <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
                      No programs mapped to this institution yet.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : null}
              {!mappingLoading && !selectedInstitutionId ? (
                <TableRow>
                  <TableCell colSpan={3}>
                    <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
                      Select an institution to view its mapped programs.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : null}
              {institutionPrograms.map((program) => (
                <TableRow key={program.id || program.program_id}>
                  <TableCell>
                    {program.institution_name || institutionNameById.get(String(selectedInstitutionId)) || "-"}
                  </TableCell>
                  <TableCell>{program.name || programNameById.get(String(program.program_id)) || "-"}</TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      color="error"
                      startIcon={<Delete fontSize="small" />}
                      onClick={() => handleRemoveMapping(program.id || program.program_id)}
                    >
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  const renderDialogFields = () => {
    if (dialogType === TAB_KEYS.INSTITUTION_TYPES || dialogType === TAB_KEYS.DOMAINS) {
      return (
        <Box sx={{ pt: 0.5 }}>
          <Typography variant="caption" sx={{ display: "block", mb: 0.75, fontWeight: 700, color: "text.primary" }}>
            Name
          </Typography>
          <TextField
            size="small"
            fullWidth
            value={formValues.name || ""}
            placeholder={dialogType === TAB_KEYS.DOMAINS ? "e.g. Computer Science" : "e.g. University"}
            onChange={(event) => handleFormChange("name", event.target.value)}
            sx={{
              "& .MuiInputBase-root": {
                borderRadius: 2,
              },
            }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.9 }}>
            Use a clear unique name
          </Typography>
        </Box>
      );
    }

    if (dialogType === TAB_KEYS.PROGRAMS) {
      return (
        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            alignItems: "start",
          }}
        >
          <TextField
            size="small"
            fullWidth
            label="Program Name"
            value={formValues.name || ""}
            helperText="Program label shown to students"
            placeholder="e.g. Software Engineering"
            onChange={(event) => handleFormChange("name", event.target.value)}
            sx={{ gridColumn: { xs: "1 / -1", sm: "1 / 2" } }}
            InputLabelProps={{ shrink: true }}
            InputProps={{ sx: { borderRadius: 2 } }}
          />
          <FormControl fullWidth size="small" sx={{ gridColumn: { xs: "1 / -1", sm: "2 / 3" } }}>
            <InputLabel>Domain</InputLabel>
            <Select
              value={formValues.domain_id || ""}
              label="Domain"
              onChange={(event) => handleFormChange("domain_id", String(event.target.value))}
            >
              {domains.map((domain) => (
                <MenuItem key={domain.id} value={String(domain.id)}>
                  {domain.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      );
    }

    return (
      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          alignItems: "start",
        }}
      >
        <TextField
          size="small"
          fullWidth
          label="Institution Name"
          value={formValues.name || ""}
          helperText="Official name of the institution"
          placeholder="e.g. National School of AI"
          onChange={(event) => handleFormChange("name", event.target.value)}
          sx={{ gridColumn: { xs: "1 / -1", sm: "1 / -1" } }}
          InputLabelProps={{ shrink: true }}
          InputProps={{ sx: { borderRadius: 2 } }}
        />
        <FormControl fullWidth size="small" sx={{ gridColumn: { xs: "1 / -1", sm: "1 / -1" } }}>
          <InputLabel>Institution Type</InputLabel>
          <Select
            value={formValues.institution_type_id || ""}
            label="Institution Type"
            onChange={(event) => handleFormChange("institution_type_id", String(event.target.value))}
          >
            {institutionTypes.map((item) => (
              <MenuItem key={item.id} value={String(item.id)}>
                {item.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          size="small"
          fullWidth
          label="Country"
          value={formValues.country || ""}
          placeholder="e.g. Morocco"
          onChange={(event) => handleFormChange("country", event.target.value)}
          sx={{ gridColumn: { xs: "1 / -1", sm: "1 / 2" } }}
          InputLabelProps={{ shrink: true }}
          InputProps={{ sx: { borderRadius: 2 } }}
        />
        <TextField
          size="small"
          fullWidth
          label="City"
          value={formValues.city || ""}
          placeholder="e.g. Casablanca"
          onChange={(event) => handleFormChange("city", event.target.value)}
          sx={{ gridColumn: { xs: "1 / -1", sm: "2 / 3" } }}
          InputLabelProps={{ shrink: true }}
          InputProps={{ sx: { borderRadius: 2 } }}
        />
      </Box>
    );
  };

  const dialogMeta = {
    [TAB_KEYS.INSTITUTION_TYPES]: {
      title: "Institution Type",
      subtitle: "Create or update a category such as University or School",
      icon: <Category fontSize="small" />,
    },
    [TAB_KEYS.DOMAINS]: {
      title: "Domain",
      subtitle: "Create or update a study domain",
      icon: <AccountTree fontSize="small" />,
    },
    [TAB_KEYS.PROGRAMS]: {
      title: "Program",
      subtitle: "Create or update an academic program and link it to a domain",
      icon: <School fontSize="small" />,
    },
    [TAB_KEYS.INSTITUTIONS]: {
      title: "Institution",
      subtitle: "Create or update an institution and its location",
      icon: <Apartment fontSize="small" />,
    },
  };

  const activeDialogMeta = dialogMeta[dialogType] || {
    title: "Entry",
    subtitle: "Manage catalog entry",
    icon: <Edit fontSize="small" />,
  };

  const isDialogValid = () => {
    if (dialogType === TAB_KEYS.INSTITUTION_TYPES || dialogType === TAB_KEYS.DOMAINS) {
      return Boolean(formValues.name?.trim());
    }
    if (dialogType === TAB_KEYS.PROGRAMS) {
      return Boolean(formValues.name?.trim() && formValues.domain_id);
    }
    if (dialogType === TAB_KEYS.INSTITUTIONS) {
      return Boolean(formValues.name?.trim() && formValues.institution_type_id);
    }
    return true;
  };

  const getHeaderAction = () => {
    const actionMap = {
      [TAB_KEYS.INSTITUTION_TYPES]: {
        label: "Add Institution Type",
        onClick: () => openCreateDialog(TAB_KEYS.INSTITUTION_TYPES),
      },
      [TAB_KEYS.DOMAINS]: {
        label: "Add Domain",
        onClick: () => openCreateDialog(TAB_KEYS.DOMAINS),
      },
      [TAB_KEYS.PROGRAMS]: {
        label: "Add Program",
        onClick: () => openCreateDialog(TAB_KEYS.PROGRAMS),
      },
      [TAB_KEYS.INSTITUTIONS]: {
        label: "Add Institution",
        onClick: () => openCreateDialog(TAB_KEYS.INSTITUTIONS),
      },
    };

    const action = actionMap[activeTab];
    if (!action) return null;

    return (
      <Button
        variant="contained"
        startIcon={<Add />}
        onClick={action.onClick}
        sx={{
          borderRadius: 2,
          px: 2.5,
          py: 1,
          textTransform: "none",
          fontWeight: 600,
          fontSize: "0.875rem",
          boxShadow: "none",
          "&:hover": {
            boxShadow: (theme) => `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
          },
        }}
      >
        {action.label}
      </Button>
    );
  };

  return (
    <Box sx={{ width: "100%" }}>
      <PageHeader
        title="Academic Catalog"
        subtitle="Manage institution types, domains, programs, institutions, and their mappings"
        icon={AccountTree}
        breadcrumbs={[{ label: "Dashboard", to: "/dashboard" }, { label: "Academic Catalog" }]}
        actions={getHeaderAction()}
      />

      {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}
      {success ? <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert> : null}

      <Paper variant="outlined" sx={{ mb: 2 }}>
        <Tabs
          value={activeTab}
          onChange={(_event, nextTab) => {
            clearMessages();
            setActiveTab(nextTab);
          }}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab value={TAB_KEYS.INSTITUTION_TYPES} icon={<Category />} iconPosition="start" label="Institution Types" />
          <Tab value={TAB_KEYS.DOMAINS} icon={<AccountTree />} iconPosition="start" label="Domains" />
          <Tab value={TAB_KEYS.PROGRAMS} icon={<School />} iconPosition="start" label="Programs" />
          <Tab value={TAB_KEYS.INSTITUTIONS} icon={<Apartment />} iconPosition="start" label="Institutions" />
          <Tab value={TAB_KEYS.MAPPING} icon={<Link />} iconPosition="start" label="Institution ↔ Program" />
        </Tabs>
      </Paper>

      {loading ? <Typography>Loading catalog data...</Typography> : renderTabContent()}

      <Dialog
        open={dialogOpen}
        onClose={closeDialog}
        fullScreen={isMobile}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: { xs: 0, sm: 3 },
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle
          sx={{
            py: 2.25,
            px: { xs: 2, sm: 2.5 },
            borderBottom: "1px solid",
            borderColor: "divider",
            bgcolor: (theme) => alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.16 : 0.06),
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                }}
              >
                {activeDialogMeta.icon}
              </Box>
              <Box>
                <Typography variant="subtitle1" fontWeight={700}>
                  {dialogMode === "create" ? `Create ${activeDialogMeta.title}` : `Edit ${activeDialogMeta.title}`}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {activeDialogMeta.subtitle}
                </Typography>
              </Box>
            </Box>
            <Button onClick={closeDialog} color="inherit" size="small" startIcon={<Close fontSize="small" />}>
              Close
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ px: { xs: 2.25, sm: 3.5 }, py: { xs: 2.75, sm: 3.5 }, overflow: "visible" }}>
          <Box
            sx={{
              mt: { xs: 0.75, sm: 1 },
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2.5,
              p: { xs: 2, sm: 2.75 },
              bgcolor: (theme) => alpha(theme.palette.background.default, theme.palette.mode === "dark" ? 0.24 : 0.7),
            }}
          >
            {renderDialogFields()}
          </Box>
        </DialogContent>
        <DialogActions
          sx={{
            px: { xs: 2.25, sm: 3.5 },
            pb: { xs: 2.25, sm: 3 },
            pt: 2,
            gap: 1,
            borderTop: "1px solid",
            borderColor: "divider",
            bgcolor: (theme) => alpha(theme.palette.background.default, theme.palette.mode === "dark" ? 0.2 : 0.5),
          }}
        >
          <Button variant="outlined" onClick={closeDialog} sx={{ minWidth: { xs: 110, sm: 120 } }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmitDialog}
            disabled={submitting || !isDialogValid()}
            sx={{ minWidth: { xs: 140, sm: 160 } }}
          >
            {dialogMode === "create" ? "Create" : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CatalogManagement;
