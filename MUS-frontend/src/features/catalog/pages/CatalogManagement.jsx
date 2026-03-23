import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Skeleton,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
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
  SearchOutlined,
  InfoOutlined,
} from "@mui/icons-material";
import institutionTypeService from "@/services/institutionTypeService";
import domainService from "@/services/domainService";
import programService from "@/services/programService";
import institutionService from "@/services/institutionService";
import institutionProgramService from "@/services/institutionProgramService";
import { PageHeader } from "@/shared/components/ui";
import { useLanguage } from "@/app/providers/LanguageContext";
import { useForm, Controller } from "react-hook-form";

/* ───────────────────────────────────────────── constants */
const TAB_KEYS = {
  INSTITUTION_TYPES: "institutionTypes",
  DOMAINS: "domains",
  PROGRAMS: "programs",
  INSTITUTIONS: "institutions",
  MAPPING: "mapping",
};

const TAB_META = {
  [TAB_KEYS.INSTITUTION_TYPES]: { icon: Category,    color: "#7c5cfc", label: "Institution Types" },
  [TAB_KEYS.DOMAINS]:           { icon: AccountTree,  color: "#3b82f6", label: "Domains" },
  [TAB_KEYS.PROGRAMS]:          { icon: School,       color: "#10b981", label: "Programs" },
  [TAB_KEYS.INSTITUTIONS]:      { icon: Apartment,    color: "#f59e0b", label: "Institutions" },
  [TAB_KEYS.MAPPING]:           { icon: Link,         color: "#ec4899", label: "Mapping" },
};

/* ───────────────────────────────────────────── helpers */
const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

const extractData   = (response) => response?.data ?? response;
const extractList   = (response) => { const d = extractData(response); return Array.isArray(d) ? d : []; };
const extractOne    = (response) => { const d = extractData(response); return Array.isArray(d) ? d[0] || null : d || null; };

const getDialogDefaultValues = (type, item = null) => {
  if (type === TAB_KEYS.INSTITUTION_TYPES || type === TAB_KEYS.DOMAINS)
    return { name: item?.name || "" };
  if (type === TAB_KEYS.PROGRAMS)
    return { name: item?.name || "", domain_id: String(item?.domain_id || item?.domainId || "") };
  if (type === TAB_KEYS.INSTITUTIONS)
    return {
      name: item?.name || "",
      institution_type_id: String(item?.institution_type_id || item?.institutionTypeId || ""),
      country: item?.country || "",
      city: item?.city || "",
    };
  return {};
};

/* ───────────────────────────────────────────── sub-components */
const StatCard = ({ label, count, icon: Icon, color, loading }) => (
  <Box
    sx={{
      p: 2,
      borderRadius: 2.5,
      border: "1px solid",
      borderColor: alpha(color, 0.2),
      bgcolor: alpha(color, 0.05),
      display: "flex",
      alignItems: "center",
      gap: 1.5,
      transition: "all 0.2s ease",
      "&:hover": {
        borderColor: alpha(color, 0.35),
        bgcolor: alpha(color, 0.09),
        transform: "translateY(-1px)",
      },
    }}
  >
    <Box
      sx={{
        width: 38,
        height: 38,
        borderRadius: 2,
        bgcolor: alpha(color, 0.12),
        border: "1px solid",
        borderColor: alpha(color, 0.22),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <Icon sx={{ fontSize: 19, color }} />
    </Box>
    <Box>
      {loading ? (
        <Skeleton width={40} height={24} />
      ) : (
        <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.1, fontSize: "1.15rem", color }}>
          {count}
        </Typography>
      )}
      <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.72rem", fontWeight: 600 }}>
        {label}
      </Typography>
    </Box>
  </Box>
);

const EmptyState = ({ message }) => (
  <Box sx={{ textAlign: "center", py: 6 }}>
    <Box
      sx={{
        width: 56,
        height: 56,
        borderRadius: "50%",
        bgcolor: (theme) => alpha(theme.palette.text.secondary, 0.06),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        mx: "auto",
        mb: 1.5,
      }}
    >
      <InfoOutlined sx={{ fontSize: 26, color: "text.secondary", opacity: 0.5 }} />
    </Box>
    <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.7 }}>
      {message}
    </Typography>
  </Box>
);

const ActionButton = ({ icon: Icon, label, color = "primary", onClick, disabled }) => (
  <Tooltip title={label}>
    <span>
      <IconButton
        size="small"
        onClick={onClick}
        disabled={disabled}
        sx={{
          width: 30,
          height: 30,
          borderRadius: 1.5,
          border: "1px solid",
          borderColor: (theme) => alpha(theme.palette[color]?.main || color, 0.2),
          bgcolor: (theme) => alpha(theme.palette[color]?.main || color, 0.05),
          color: `${color}.main`,
          transition: "all 0.18s ease",
          "&:hover": {
            borderColor: (theme) => alpha(theme.palette[color]?.main || color, 0.45),
            bgcolor: (theme) => alpha(theme.palette[color]?.main || color, 0.12),
          },
        }}
      >
        <Icon sx={{ fontSize: 15 }} />
      </IconButton>
    </span>
  </Tooltip>
);

/* ───────────────────────────────────────────── main component */
const CatalogManagement = () => {
  const { t } = useLanguage();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [activeTab, setActiveTab]             = useState(TAB_KEYS.INSTITUTION_TYPES);
  const [loading, setLoading]                 = useState(true);
  const [submitting, setSubmitting]           = useState(false);
  const [error, setError]                     = useState("");
  const [success, setSuccess]                 = useState("");
  const [search, setSearch]                   = useState("");

  const [institutionTypes, setInstitutionTypes] = useState([]);
  const [domains, setDomains]                   = useState([]);
  const [programs, setPrograms]                 = useState([]);
  const [institutions, setInstitutions]         = useState([]);

  const [institutionPrograms, setInstitutionPrograms] = useState([]);
  const [mappingLoading, setMappingLoading]           = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState("create");
  const [dialogType, setDialogType] = useState(TAB_KEYS.INSTITUTION_TYPES);
  const [editingId, setEditingId]   = useState(null);

  const { register, control, reset, handleSubmit, formState: { errors: formErrors } } = useForm({
    defaultValues: getDialogDefaultValues(TAB_KEYS.INSTITUTION_TYPES),
  });

  const {
    control: mappingControl,
    watch: watchMapping,
    setValue: setMappingValue,
    handleSubmit: handleMappingSubmit,
  } = useForm({ defaultValues: { institutionId: "", programId: "" } });

  const selectedInstitutionId = watchMapping("institutionId") || "";
  const selectedProgramId     = watchMapping("programId") || "";

  const domainNameById = useMemo(() => {
    const map = new Map();
    domains.forEach((d) => map.set(String(d.id), d.name));
    return map;
  }, [domains]);

  const institutionTypeNameById = useMemo(() => {
    const map = new Map();
    institutionTypes.forEach((d) => map.set(String(d.id), d.name));
    return map;
  }, [institutionTypes]);

  const institutionNameById = useMemo(() => {
    const map = new Map();
    institutions.forEach((d) => map.set(String(d.id), d.name));
    return map;
  }, [institutions]);

  const programNameById = useMemo(() => {
    const map = new Map();
    programs.forEach((d) => map.set(String(d.id), d.name));
    return map;
  }, [programs]);

  const clearMessages = () => { setError(""); setSuccess(""); };

  const loadCoreData = async () => {
    setLoading(true);
    clearMessages();
    try {
      const [typesResp, domainsResp, programsResp, institutionsResp] = await Promise.all([
        institutionTypeService.getAllInstitutionTypes(),
        domainService.getAllDomains(),
        programService.getAllPrograms(),
        institutionService.getAllInstitutions(),
      ]);
      setInstitutionTypes(extractList(typesResp));
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
    if (!institutionId) { setInstitutionPrograms([]); setMappingLoading(false); return; }
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

  useEffect(() => { loadCoreData(); }, []);
  useEffect(() => { loadInstitutionPrograms(selectedInstitutionId); }, [selectedInstitutionId]);

  const openCreateDialog = (type) => {
    clearMessages();
    setDialogType(type);
    setDialogMode("create");
    setEditingId(null);
    reset(getDialogDefaultValues(type));
    setDialogOpen(true);
  };

  const openEditDialog = (type, item) => {
    clearMessages();
    setDialogType(type);
    setDialogMode("edit");
    setEditingId(item.id);
    reset(getDialogDefaultValues(type, item));
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    reset(getDialogDefaultValues(dialogType));
    setEditingId(null);
  };

  const refreshAfterMutation = async () => {
    await loadCoreData();
    if (selectedInstitutionId) await loadInstitutionPrograms(selectedInstitutionId);
  };

  const handleSubmitDialog = handleSubmit(async (formValues) => {
    setSubmitting(true);
    clearMessages();
    try {
      if (dialogType === TAB_KEYS.INSTITUTION_TYPES) {
        dialogMode === "create"
          ? await institutionTypeService.createInstitutionType(formValues.name.trim())
          : await institutionTypeService.updateInstitutionType(editingId, { name: formValues.name.trim() });
        setSuccess(`Institution type ${dialogMode === "create" ? "created" : "updated"} successfully`);
      }
      if (dialogType === TAB_KEYS.DOMAINS) {
        dialogMode === "create"
          ? await domainService.createDomain(formValues.name.trim())
          : await domainService.updateDomain(editingId, { name: formValues.name.trim() });
        setSuccess(`Domain ${dialogMode === "create" ? "created" : "updated"} successfully`);
      }
      if (dialogType === TAB_KEYS.PROGRAMS) {
        const payload = { name: formValues.name.trim(), domain_id: Number(formValues.domain_id) };
        dialogMode === "create"
          ? await programService.createProgram(payload)
          : await programService.updateProgram(editingId, payload);
        setSuccess(`Program ${dialogMode === "create" ? "created" : "updated"} successfully`);
      }
      if (dialogType === TAB_KEYS.INSTITUTIONS) {
        const payload = {
          name: formValues.name.trim(),
          institution_type_id: Number(formValues.institution_type_id),
          country: formValues.country?.trim() || null,
          city: formValues.city?.trim() || null,
        };
        dialogMode === "create"
          ? await institutionService.createInstitution(payload)
          : await institutionService.updateInstitution(editingId, payload);
        setSuccess(`Institution ${dialogMode === "create" ? "created" : "updated"} successfully`);
      }
      await refreshAfterMutation();
      closeDialog();
    } catch (e) {
      setError(getErrorMessage(e, "Operation failed"));
    } finally {
      setSubmitting(false);
    }
  });

  const handleDelete = async (type, item) => {
    const confirmed = window.confirm(`Delete "${item.name}"? This action cannot be undone.`);
    if (!confirmed) return;
    setSubmitting(true);
    clearMessages();
    try {
      if (type === TAB_KEYS.INSTITUTION_TYPES) await institutionTypeService.deleteInstitutionType(item.id);
      if (type === TAB_KEYS.DOMAINS)           await domainService.deleteDomain(item.id);
      if (type === TAB_KEYS.PROGRAMS)          await programService.deleteProgram(item.id);
      if (type === TAB_KEYS.INSTITUTIONS)      await institutionService.deleteInstitution(item.id);
      setSuccess("Deleted successfully");
      await refreshAfterMutation();
    } catch (e) {
      setError(getErrorMessage(e, "Delete failed"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddMapping = handleMappingSubmit(async ({ institutionId, programId }) => {
    if (!institutionId || !programId) return;
    setSubmitting(true);
    clearMessages();
    try {
      await institutionProgramService.addAssociation(Number(institutionId), Number(programId));
      setMappingValue("programId", "");
      await loadInstitutionPrograms(institutionId);
      setSuccess("Program mapped to institution successfully");
    } catch (e) {
      setError(getErrorMessage(e, "Failed to create mapping"));
    } finally {
      setSubmitting(false);
    }
  });

  const handleRemoveMapping = async (programId) => {
    if (!selectedInstitutionId) return;
    const confirmed = window.confirm("Remove this program from the selected institution?");
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

  /* ─── Table renderer ────────────────────────────────── */
  const renderCrudTable = (type, rows, columns) => {
    const tabMeta  = TAB_META[type];
    const filtered = search
      ? rows.filter((r) => Object.values(r).some((v) => String(v ?? "").toLowerCase().includes(search.toLowerCase())))
      : rows;

    return (
      <Box
        sx={{
          borderRadius: 3,
          border: "1px solid",
          borderColor: (theme) => theme.palette.mode === "dark" ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)",
          bgcolor: (theme) => theme.palette.mode === "dark"
            ? "rgba(255,255,255,0.025)"
            : "rgba(255,255,255,0.85)",
          overflow: "hidden",
        }}
      >
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow
                sx={{
                  bgcolor: (theme) => theme.palette.mode === "dark"
                    ? "rgba(255,255,255,0.04)"
                    : alpha(tabMeta?.color || theme.palette.primary.main, 0.05),
                }}
              >
                {columns.map((col) => (
                  <TableCell
                    key={col.key}
                    sx={{
                      fontWeight: 700,
                      fontSize: "0.78rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      color: "text.secondary",
                      py: 1.5,
                      borderBottom: "1px solid",
                      borderColor: (theme) => theme.palette.mode === "dark" ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)",
                    }}
                  >
                    {col.label}
                  </TableCell>
                ))}
                <TableCell
                  align="right"
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.78rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: "text.secondary",
                    py: 1.5,
                    borderBottom: "1px solid",
                    borderColor: (theme) => theme.palette.mode === "dark" ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)",
                  }}
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <TableRow key={i}>
                    {columns.map((col) => (
                      <TableCell key={col.key}><Skeleton variant="text" width="80%" /></TableCell>
                    ))}
                    <TableCell align="right"><Skeleton variant="rounded" width={72} height={24} /></TableCell>
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + 1} sx={{ border: 0 }}>
                    <EmptyState message={search ? `No results for "${search}"` : "No entries yet. Click Add to create one."} />
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((row, rowIndex) => (
                  <TableRow
                    key={row.id}
                    sx={{
                      transition: "background 0.15s ease",
                      "&:last-child td": { borderBottom: 0 },
                      "&:hover": {
                        bgcolor: (theme) => theme.palette.mode === "dark"
                          ? "rgba(255,255,255,0.03)"
                          : alpha(tabMeta?.color || theme.palette.primary.main, 0.035),
                      },
                    }}
                  >
                    {columns.map((col, colIndex) => (
                      <TableCell
                        key={col.key}
                        sx={{
                          py: 1.4,
                          fontSize: "0.875rem",
                          borderColor: (theme) => theme.palette.mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
                        }}
                      >
                        {colIndex === 0 ? (
                          <Box display="flex" alignItems="center" gap={1.2}>
                            <Box
                              sx={{
                                width: 28,
                                height: 28,
                                borderRadius: 1.5,
                                bgcolor: alpha(tabMeta?.color || "#7c5cfc", 0.1),
                                border: "1px solid",
                                borderColor: alpha(tabMeta?.color || "#7c5cfc", 0.2),
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                              }}
                            >
                              {tabMeta?.icon && <tabMeta.icon sx={{ fontSize: 14, color: tabMeta.color || "primary.main" }} />}
                            </Box>
                            <Typography variant="body2" fontWeight={600} sx={{ fontSize: "0.875rem" }}>
                              {col.render ? col.render(row) : row[col.key]}
                            </Typography>
                          </Box>
                        ) : col.render ? (
                          <Chip
                            label={col.render(row) || "—"}
                            size="small"
                            sx={{
                              height: 22,
                              fontSize: "0.72rem",
                              fontWeight: 600,
                              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.07),
                              color: "primary.main",
                              border: "1px solid",
                              borderColor: (theme) => alpha(theme.palette.primary.main, 0.14),
                              "& .MuiChip-label": { px: 0.8 },
                            }}
                          />
                        ) : (
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.85rem" }}>
                            {row[col.key] || "—"}
                          </Typography>
                        )}
                      </TableCell>
                    ))}
                    <TableCell
                      align="right"
                      sx={{
                        borderColor: (theme) => theme.palette.mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
                      }}
                    >
                      <Box display="flex" gap={0.6} justifyContent="flex-end">
                        <ActionButton icon={Edit} label="Edit" color="primary" onClick={() => openEditDialog(type, row)} />
                        <ActionButton icon={Delete} label="Delete" color="error" onClick={() => handleDelete(type, row)} disabled={submitting} />
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  /* ─── Tab content renderer ──────────────────────────── */
  const renderTabContent = () => {
    if (activeTab === TAB_KEYS.INSTITUTION_TYPES)
      return renderCrudTable(TAB_KEYS.INSTITUTION_TYPES, institutionTypes, [{ key: "name", label: "Name" }]);

    if (activeTab === TAB_KEYS.DOMAINS)
      return renderCrudTable(TAB_KEYS.DOMAINS, domains, [{ key: "name", label: "Name" }]);

    if (activeTab === TAB_KEYS.PROGRAMS)
      return renderCrudTable(TAB_KEYS.PROGRAMS, programs, [
        { key: "name", label: "Program" },
        { key: "domain_id", label: "Domain", render: (row) => row.domain_name || domainNameById.get(String(row.domain_id || row.domainId)) || "-" },
      ]);

    if (activeTab === TAB_KEYS.INSTITUTIONS)
      return renderCrudTable(TAB_KEYS.INSTITUTIONS, institutions, [
        { key: "name", label: "Institution" },
        { key: "institution_type_id", label: "Type", render: (row) => row.institution_type_name || institutionTypeNameById.get(String(row.institution_type_id || row.institutionTypeId)) || "-" },
        { key: "country", label: "Country" },
        { key: "city", label: "City" },
      ]);

    /* ─ Mapping tab ─ */
    return (
      <Box display="flex" flexDirection="column" gap={2.5}>
        {/* Controls row */}
        <Box
          sx={{
            p: 2.5,
            borderRadius: 3,
            border: "1px solid",
            borderColor: (theme) => theme.palette.mode === "dark" ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)",
            bgcolor: (theme) => theme.palette.mode === "dark" ? "rgba(255,255,255,0.025)" : "rgba(255,255,255,0.85)",
          }}
        >
          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2, fontSize: "0.88rem" }}>
            Link a Program to an Institution
          </Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr auto" }, gap: 1.5, alignItems: "flex-start" }}>
            <Controller
              name="institutionId"
              control={mappingControl}
              render={({ field }) => (
                <FormControl size="small" fullWidth>
                  <InputLabel>Institution</InputLabel>
                  <Select
                    {...field}
                    label="Institution"
                    onChange={(e) => { field.onChange(String(e.target.value)); setMappingValue("programId", ""); }}
                    sx={{ borderRadius: 2 }}
                  >
                    {institutions.map((inst) => (
                      <MenuItem key={inst.id} value={String(inst.id)}>{inst.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
            <Controller
              name="programId"
              control={mappingControl}
              render={({ field }) => (
                <FormControl size="small" fullWidth>
                  <InputLabel>Program</InputLabel>
                  <Select
                    {...field}
                    label="Program"
                    onChange={(e) => field.onChange(String(e.target.value))}
                    sx={{ borderRadius: 2 }}
                  >
                    {programs.map((p) => (
                      <MenuItem key={p.id} value={String(p.id)}>{p.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleAddMapping}
              disabled={!selectedInstitutionId || !selectedProgramId || submitting || mappingLoading}
              sx={{
                borderRadius: 2,
                fontWeight: 700,
                textTransform: "none",
                background: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)",
                boxShadow: "0 2px 8px rgba(236,72,153,0.25)",
                "&:hover": { boxShadow: "0 4px 14px rgba(236,72,153,0.38)" },
                "&:disabled": { background: "rgba(0,0,0,0.12)" },
                height: 40,
                px: 2.5,
                whiteSpace: "nowrap",
              }}
            >
              Add Mapping
            </Button>
          </Box>
        </Box>

        {/* Mapped programs table */}
        <Box>
          {selectedInstitutionId && (
            <Box display="flex" alignItems="center" gap={1} mb={1.5}>
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: 1,
                  bgcolor: alpha("#ec4899", 0.1),
                  border: "1px solid",
                  borderColor: alpha("#ec4899", 0.2),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Link sx={{ fontSize: 14, color: "#ec4899" }} />
              </Box>
              <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: "0.88rem" }}>
                {institutionNameById.get(String(selectedInstitutionId)) || "Selected Institution"} — Mapped Programs
              </Typography>
              {!mappingLoading && (
                <Chip
                  label={institutionPrograms.length}
                  size="small"
                  sx={{ height: 20, fontSize: "0.68rem", fontWeight: 700, bgcolor: alpha("#ec4899", 0.1), color: "#ec4899", "& .MuiChip-label": { px: 0.7 } }}
                />
              )}
            </Box>
          )}

          <Box
            sx={{
              borderRadius: 3,
              border: "1px solid",
              borderColor: (theme) => theme.palette.mode === "dark" ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)",
              bgcolor: (theme) => theme.palette.mode === "dark" ? "rgba(255,255,255,0.025)" : "rgba(255,255,255,0.85)",
              overflow: "hidden",
            }}
          >
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: (theme) => theme.palette.mode === "dark" ? "rgba(255,255,255,0.04)" : alpha("#ec4899", 0.05) }}>
                    {["Institution", "Program", "Actions"].map((h, i) => (
                      <TableCell
                        key={h}
                        align={i === 2 ? "right" : "left"}
                        sx={{
                          fontWeight: 700,
                          fontSize: "0.78rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          color: "text.secondary",
                          py: 1.5,
                          borderBottom: "1px solid",
                          borderColor: (theme) => theme.palette.mode === "dark" ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)",
                        }}
                      >
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {mappingLoading ? (
                    [...Array(3)].map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton variant="text" width="60%" /></TableCell>
                        <TableCell><Skeleton variant="text" width="70%" /></TableCell>
                        <TableCell align="right"><Skeleton variant="rounded" width={60} height={24} /></TableCell>
                      </TableRow>
                    ))
                  ) : !selectedInstitutionId ? (
                    <TableRow>
                      <TableCell colSpan={3} sx={{ border: 0 }}>
                        <EmptyState message="Select an institution above to view its mapped programs." />
                      </TableCell>
                    </TableRow>
                  ) : institutionPrograms.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} sx={{ border: 0 }}>
                        <EmptyState message="No programs mapped to this institution yet." />
                      </TableCell>
                    </TableRow>
                  ) : (
                    institutionPrograms.map((program) => (
                      <TableRow
                        key={program.id || program.program_id}
                        sx={{
                          "&:last-child td": { borderBottom: 0 },
                          "&:hover": { bgcolor: (theme) => alpha("#ec4899", theme.palette.mode === "dark" ? 0.04 : 0.03) },
                        }}
                      >
                        <TableCell sx={{ py: 1.4, fontSize: "0.875rem", borderColor: (theme) => theme.palette.mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }}>
                          <Box display="flex" alignItems="center" gap={1.2}>
                            <Box sx={{ width: 28, height: 28, borderRadius: 1.5, bgcolor: alpha("#f59e0b", 0.1), border: "1px solid", borderColor: alpha("#f59e0b", 0.2), display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <Apartment sx={{ fontSize: 14, color: "#f59e0b" }} />
                            </Box>
                            <Typography variant="body2" fontWeight={600}>{program.institution_name || institutionNameById.get(String(selectedInstitutionId)) || "—"}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ py: 1.4, borderColor: (theme) => theme.palette.mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }}>
                          <Chip
                            label={program.name || programNameById.get(String(program.program_id)) || "—"}
                            size="small"
                            sx={{ height: 22, fontSize: "0.72rem", fontWeight: 600, bgcolor: alpha("#10b981", 0.08), color: "#10b981", border: "1px solid", borderColor: alpha("#10b981", 0.18), "& .MuiChip-label": { px: 0.8 } }}
                          />
                        </TableCell>
                        <TableCell align="right" sx={{ borderColor: (theme) => theme.palette.mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }}>
                          <ActionButton icon={Delete} label="Remove mapping" color="error" onClick={() => handleRemoveMapping(program.id || program.program_id)} disabled={submitting} />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Box>
      </Box>
    );
  };

  /* ─── Dialog fields ─────────────────────────────────── */
  const renderDialogFields = () => {
    const fieldSx = { "& .MuiInputBase-root": { borderRadius: 2 } };

    if (dialogType === TAB_KEYS.INSTITUTION_TYPES || dialogType === TAB_KEYS.DOMAINS) {
      return (
        <TextField
          size="small"
          fullWidth
          label="Name"
          {...register("name", { required: "Name is required" })}
          placeholder={dialogType === TAB_KEYS.DOMAINS ? "e.g. Computer Science" : "e.g. University"}
          error={!!formErrors.name}
          helperText={formErrors.name?.message || "Use a clear and unique name"}
          InputLabelProps={{ shrink: true }}
          sx={fieldSx}
        />
      );
    }

    if (dialogType === TAB_KEYS.PROGRAMS) {
      return (
        <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
          <TextField
            size="small" fullWidth label="Program Name"
            {...register("name", { required: "Program name is required" })}
            placeholder="e.g. Software Engineering"
            error={!!formErrors.name}
            helperText={formErrors.name?.message || "Label shown to students"}
            InputLabelProps={{ shrink: true }}
            sx={{ ...fieldSx, gridColumn: { xs: "1 / -1", sm: "1 / 2" } }}
          />
          <Controller
            name="domain_id" control={control} rules={{ required: "Domain is required" }}
            render={({ field }) => (
              <FormControl fullWidth size="small" sx={{ gridColumn: { xs: "1 / -1", sm: "2 / 3" } }} error={!!formErrors.domain_id}>
                <InputLabel>Domain</InputLabel>
                <Select {...field} label="Domain" sx={{ borderRadius: 2 }}>
                  {domains.map((d) => <MenuItem key={d.id} value={String(d.id)}>{d.name}</MenuItem>)}
                </Select>
              </FormControl>
            )}
          />
        </Box>
      );
    }

    return (
      <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
        <TextField
          size="small" fullWidth label="Institution Name"
          {...register("name", { required: "Institution name is required" })}
          placeholder="e.g. National School of AI"
          error={!!formErrors.name}
          helperText={formErrors.name?.message || "Official name of the institution"}
          InputLabelProps={{ shrink: true }}
          sx={{ ...fieldSx, gridColumn: "1 / -1" }}
        />
        <Controller
          name="institution_type_id" control={control} rules={{ required: "Type is required" }}
          render={({ field }) => (
            <FormControl fullWidth size="small" sx={{ gridColumn: "1 / -1" }} error={!!formErrors.institution_type_id}>
              <InputLabel>Institution Type</InputLabel>
              <Select {...field} label="Institution Type" sx={{ borderRadius: 2 }}>
                {institutionTypes.map((it) => <MenuItem key={it.id} value={String(it.id)}>{it.name}</MenuItem>)}
              </Select>
            </FormControl>
          )}
        />
        <TextField size="small" fullWidth label="Country" {...register("country")} placeholder="e.g. Morocco"
          InputLabelProps={{ shrink: true }} sx={fieldSx} />
        <TextField size="small" fullWidth label="City" {...register("city")} placeholder="e.g. Casablanca"
          InputLabelProps={{ shrink: true }} sx={fieldSx} />
      </Box>
    );
  };

  /* ─── Dialog meta ───────────────────────────────────── */
  const dialogMeta = {
    [TAB_KEYS.INSTITUTION_TYPES]: { title: "Institution Type", subtitle: "Create or update a category such as University or School", color: "#7c5cfc" },
    [TAB_KEYS.DOMAINS]:           { title: "Domain",           subtitle: "Create or update a study domain",                            color: "#3b82f6" },
    [TAB_KEYS.PROGRAMS]:          { title: "Program",          subtitle: "Create or update an academic program",                       color: "#10b981" },
    [TAB_KEYS.INSTITUTIONS]:      { title: "Institution",      subtitle: "Create or update an institution and its location",           color: "#f59e0b" },
  };
  const activeDialogMeta = dialogMeta[dialogType] || { title: "Entry", subtitle: "Manage catalog entry", color: "#7c5cfc" };
  const ActiveDialogIcon = TAB_META[dialogType]?.icon || Edit;

  /* ─── Add button by tab ─────────────────────────────── */
  const getHeaderAction = () => {
    const map = {
      [TAB_KEYS.INSTITUTION_TYPES]: { label: t("pages.catalog.addInstitutionType"), onClick: () => openCreateDialog(TAB_KEYS.INSTITUTION_TYPES) },
      [TAB_KEYS.DOMAINS]:           { label: t("pages.catalog.addDomain"),           onClick: () => openCreateDialog(TAB_KEYS.DOMAINS) },
      [TAB_KEYS.PROGRAMS]:          { label: t("pages.catalog.addProgram"),          onClick: () => openCreateDialog(TAB_KEYS.PROGRAMS) },
      [TAB_KEYS.INSTITUTIONS]:      { label: t("pages.catalog.addInstitution"),      onClick: () => openCreateDialog(TAB_KEYS.INSTITUTIONS) },
    };
    const action = map[activeTab];
    if (!action) return null;

    const color = TAB_META[activeTab]?.color || "#7c5cfc";
    return (
      <Button
        variant="contained"
        startIcon={<Add />}
        onClick={action.onClick}
        sx={{
          borderRadius: 2,
          px: 2.2,
          py: 0.85,
          textTransform: "none",
          fontWeight: 700,
          fontSize: "0.85rem",
          background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)`,
          boxShadow: `0 2px 8px ${alpha(color, 0.3)}`,
          "&:hover": { boxShadow: `0 4px 14px ${alpha(color, 0.42)}` },
        }}
      >
        {action.label}
      </Button>
    );
  };

  /* ─── Render ────────────────────────────────────────── */
  return (
    <Box sx={{ width: "100%" }}>
      <PageHeader
        title={t("pages.catalog.title")}
        subtitle={t("pages.catalog.subtitle")}
        icon={AccountTree}
        breadcrumbs={[{ label: t("common.dashboard"), to: "/dashboard" }, { label: t("pages.catalog.title") }]}
        actions={getHeaderAction()}
      />

      {/* Alerts */}
      {error   && <Alert severity="error"   sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError("")}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setSuccess("")}>{success}</Alert>}

      {/* Stats row */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2,1fr)", md: "repeat(4,1fr)" }, gap: 1.5, mb: 2.5 }}>
        <StatCard label="Institution Types" count={institutionTypes.length} icon={Category}    color="#7c5cfc" loading={loading} />
        <StatCard label="Domains"           count={domains.length}          icon={AccountTree}  color="#3b82f6" loading={loading} />
        <StatCard label="Programs"          count={programs.length}         icon={School}       color="#10b981" loading={loading} />
        <StatCard label="Institutions"      count={institutions.length}     icon={Apartment}    color="#f59e0b" loading={loading} />
      </Box>

      {/* Tabs */}
      <Box
        sx={{
          mb: 2.5,
          borderRadius: 3,
          border: "1px solid",
          borderColor: (theme) => theme.palette.mode === "dark" ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)",
          bgcolor: (theme) => theme.palette.mode === "dark" ? "rgba(255,255,255,0.025)" : "rgba(255,255,255,0.85)",
          overflow: "hidden",
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(_, next) => { clearMessages(); setSearch(""); setActiveTab(next); }}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: 52,
            "& .MuiTab-root": {
              minHeight: 52,
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.85rem",
              gap: 0.5,
              transition: "all 0.2s ease",
            },
            "& .Mui-selected": { fontWeight: 700 },
            "& .MuiTabs-indicator": {
              height: 3,
              borderRadius: "3px 3px 0 0",
              background: TAB_META[activeTab]?.color || "primary.main",
            },
          }}
        >
          {Object.entries(TAB_META).map(([key, meta]) => {
            const Icon = meta.icon;
            return (
              <Tab
                key={key}
                value={key}
                icon={<Icon sx={{ fontSize: 17, color: activeTab === key ? meta.color : "text.secondary" }} />}
                iconPosition="start"
                label={t(`pages.catalog.tabs.${key}`) || meta.label}
                sx={{ color: activeTab === key ? meta.color : "text.secondary" }}
              />
            );
          })}
        </Tabs>
      </Box>

      {/* Search bar (non-mapping tabs) */}
      {activeTab !== TAB_KEYS.MAPPING && (
        <Box sx={{ mb: 2 }}>
          <TextField
            size="small"
            placeholder="Search…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchOutlined sx={{ fontSize: 18, color: "text.secondary" }} />
                </InputAdornment>
              ),
              sx: { borderRadius: 2.5, fontSize: "0.875rem" },
            }}
            sx={{ width: { xs: "100%", sm: 280 } }}
          />
        </Box>
      )}

      {/* Tab content */}
      {renderTabContent()}

      {/* Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={closeDialog}
        fullScreen={isMobile}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: { xs: 0, sm: 3 },
            border: "1px solid",
            borderColor: (theme) => theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)",
            overflow: "hidden",
            backdropFilter: "blur(16px)",
          },
        }}
      >
        <DialogTitle sx={{ p: 0 }}>
          <Box
            sx={{
              position: "relative",
              px: 3,
              pt: 3,
              pb: 2.5,
              overflow: "hidden",
            }}
          >
            {/* Gradient accent */}
            <Box
              sx={{
                position: "absolute",
                top: 0, left: 0, right: 0,
                height: 3,
                background: `linear-gradient(90deg, ${activeDialogMeta.color}, ${activeDialogMeta.color}88)`,
              }}
            />
            <Box display="flex" alignItems="flex-start" justifyContent="space-between" gap={2}>
              <Box display="flex" alignItems="center" gap={1.5}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    bgcolor: alpha(activeDialogMeta.color, 0.12),
                    border: "1px solid",
                    borderColor: alpha(activeDialogMeta.color, 0.22),
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <ActiveDialogIcon sx={{ fontSize: 20, color: activeDialogMeta.color }} />
                </Box>
                <Box>
                  <Typography variant="subtitle1" fontWeight={800} sx={{ lineHeight: 1.2 }}>
                    {dialogMode === "create" ? `Create ${activeDialogMeta.title}` : `Edit ${activeDialogMeta.title}`}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.76rem" }}>
                    {activeDialogMeta.subtitle}
                  </Typography>
                </Box>
              </Box>
              <IconButton
                size="small"
                onClick={closeDialog}
                sx={{
                  border: "1px solid",
                  borderColor: (theme) => theme.palette.mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
                  borderRadius: 1.5,
                  "&:hover": { bgcolor: (theme) => alpha(theme.palette.error.main, 0.06), borderColor: "error.main", color: "error.main" },
                }}
              >
                <Close sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ px: 3, py: 2.5 }}>
          <Box
            sx={{
              border: "1px solid",
              borderColor: (theme) => theme.palette.mode === "dark" ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)",
              borderRadius: 2.5,
              p: 2.5,
              bgcolor: (theme) => theme.palette.mode === "dark" ? "rgba(255,255,255,0.025)" : "rgba(248,249,255,0.8)",
            }}
          >
            {renderDialogFields()}
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 3,
            pt: 1,
            gap: 1,
            borderTop: "1px solid",
            borderColor: (theme) => theme.palette.mode === "dark" ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)",
          }}
        >
          <Button
            variant="outlined"
            onClick={closeDialog}
            sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600, px: 2.5 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmitDialog}
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={14} color="inherit" /> : null}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 700,
              px: 2.5,
              background: `linear-gradient(135deg, ${activeDialogMeta.color} 0%, ${activeDialogMeta.color}cc 100%)`,
              boxShadow: `0 2px 8px ${alpha(activeDialogMeta.color, 0.28)}`,
              "&:hover": { boxShadow: `0 4px 14px ${alpha(activeDialogMeta.color, 0.4)}` },
            }}
          >
            {submitting ? "Saving…" : dialogMode === "create" ? "Create" : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CatalogManagement;
