import { useDeferredValue, useEffect, useMemo, useState, useTransition } from "react";
import {
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
  CalendarMonth,
  Category,
  Hub,
  Layers,
  School,
  Link,
  Close,
  MenuBook,
  SearchOutlined,
  InfoOutlined,
} from "@mui/icons-material";
import institutionTypeService from "@/services/institutionTypeService";
import domainService from "@/services/domainService";
import programService from "@/services/programService";
import institutionService from "@/services/institutionService";
import institutionProgramService from "@/services/institutionProgramService";
import levelService from "@/services/levelService";
import semesterService from "@/services/semesterService";
import moduleService from "@/services/moduleService";
import { PageHeader } from "@/shared/components/ui";
import { ConfirmDialog, useNotification } from "@/shared/components/ui";
import { useLanguage } from "@/app/providers/LanguageContext";
import { useForm, Controller } from "react-hook-form";

/* ───────────────────────────────────────────── constants */
const TAB_KEYS = {
  HIERARCHY_EXPLORER: "hierarchyExplorer",
  INSTITUTION_TYPES: "institutionTypes",
  DOMAINS: "domains",
  PROGRAMS: "programs",
  LEVELS: "levels",
  SEMESTERS: "semesters",
  MODULES: "modules",
  INSTITUTIONS: "institutions",
  MAPPING: "mapping",
};

const TAB_META = {
  [TAB_KEYS.HIERARCHY_EXPLORER]: { icon: Hub,          color: "#60a5fa", label: "Hierarchy Explorer" },
  [TAB_KEYS.INSTITUTION_TYPES]: { icon: Category,    color: "#7c5cfc", label: "Institution Types" },
  [TAB_KEYS.DOMAINS]:           { icon: AccountTree,  color: "#3b82f6", label: "Domains" },
  [TAB_KEYS.PROGRAMS]:          { icon: School,       color: "#10b981", label: "Programs" },
  [TAB_KEYS.LEVELS]:            { icon: Layers,       color: "#14b8a6", label: "Levels" },
  [TAB_KEYS.SEMESTERS]:         { icon: CalendarMonth,color: "#f97316", label: "Semesters" },
  [TAB_KEYS.MODULES]:           { icon: MenuBook,     color: "#eab308", label: "Modules" },
  [TAB_KEYS.INSTITUTIONS]:      { icon: Apartment,    color: "#f59e0b", label: "Institutions" },
  [TAB_KEYS.MAPPING]:           { icon: Link,         color: "#ec4899", label: "Mapping" },
};

/* ───────────────────────────────────────────── helpers */
const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

const extractData   = (response) => response?.data ?? response;
const extractList   = (response) => { const d = extractData(response); return Array.isArray(d) ? d : []; };
const extractOne    = (response) => { const d = extractData(response); return Array.isArray(d) ? d[0] || null : d || null; };

const getDialogDefaultValues = (type, item = null, presetValues = {}) => {
  const defaults = (() => {
  if (type === TAB_KEYS.INSTITUTION_TYPES || type === TAB_KEYS.DOMAINS)
    return { name: item?.name || "" };
  if (type === TAB_KEYS.PROGRAMS)
    return { name: item?.name || "", domain_id: String(item?.domain_id || item?.domainId || "") };
  if (type === TAB_KEYS.LEVELS)
    return {
      name: item?.name || "",
      program_id: String(item?.program_id || item?.programId || ""),
      sort_order: String(item?.sort_order || item?.sortOrder || "1"),
    };
  if (type === TAB_KEYS.SEMESTERS)
    return {
      name: item?.name || "",
      level_id: String(item?.level_id || item?.levelId || ""),
      sort_order: String(item?.sort_order || item?.sortOrder || "1"),
    };
  if (type === TAB_KEYS.MODULES)
    return {
      code: item?.code || "",
      title: item?.title || "",
      description: item?.description || "",
      semester_id: String(item?.semester_id || item?.semesterId || ""),
    };
  if (type === TAB_KEYS.INSTITUTIONS)
    return {
      name: item?.name || "",
      institution_type_id: String(item?.institution_type_id || item?.institutionTypeId || ""),
      country: item?.country || "",
      city: item?.city || "",
    };
  return {};
  })();

  return { ...defaults, ...presetValues };
};

const sortByName = (items = []) =>
  [...items].sort((a, b) => String(a?.name || a?.title || "").localeCompare(String(b?.name || b?.title || ""), undefined, { sensitivity: "base" }));

const sortByOrderThenName = (items = []) =>
  [...items].sort((a, b) => {
    const orderA = Number(a?.sort_order || a?.sortOrder || 0);
    const orderB = Number(b?.sort_order || b?.sortOrder || 0);
    if (orderA !== orderB) return orderA - orderB;
    return String(a?.name || "").localeCompare(String(b?.name || ""), undefined, { sensitivity: "base" });
  });

/* ───────────────────────────────────────────── BreadcrumbFlow */
const BreadcrumbFlow = ({ steps }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 0.5,
      py: 1.4,
      px: 2,
      borderRadius: 2.5,
      border: "1px solid",
      borderColor: (theme) =>
        theme.palette.mode === "dark" ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)",
      bgcolor: (theme) =>
        theme.palette.mode === "dark" ? "rgba(255,255,255,0.02)" : "rgba(248,250,255,0.85)",
    }}
  >
    {steps.map((step, index) => (
      <Box key={step.label} display="flex" alignItems="center" gap={0.5}>
        {index > 0 && (
          <Box
            sx={{
              width: 16,
              height: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "text.disabled",
              fontSize: "0.7rem",
              userSelect: "none",
            }}
          >
            ›
          </Box>
        )}
        <Box
          onClick={step.onReset}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.6,
            px: 1.1,
            py: 0.4,
            borderRadius: 10,
            border: "1px solid",
            borderColor: step.active ? alpha(step.color, 0.45) : (theme) =>
              theme.palette.mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
            bgcolor: step.active ? alpha(step.color, 0.1) : "transparent",
            cursor: step.active && step.onReset ? "pointer" : "default",
            transition: "all 0.18s ease",
            "&:hover": step.active && step.onReset ? {
              bgcolor: alpha(step.color, 0.18),
              borderColor: alpha(step.color, 0.6),
            } : {},
          }}
        >
          {step.icon && (
            <step.icon
              sx={{
                fontSize: 11,
                color: step.active ? step.color : "text.disabled",
                flexShrink: 0,
              }}
            />
          )}
          <Typography
            variant="caption"
            sx={{
              fontSize: "0.71rem",
              fontWeight: step.active ? 700 : 500,
              color: step.active ? step.color : "text.disabled",
              whiteSpace: "nowrap",
              lineHeight: 1,
            }}
          >
            {step.label}:{" "}
            <Box component="span" sx={{ fontWeight: step.value ? 800 : 500 }}>
              {step.value || "—"}
            </Box>
          </Typography>
        </Box>
      </Box>
    ))}
  </Box>
);

/* ───────────────────────────────────────────── InterPanelConnector */
const InterPanelConnector = ({ active, color }) => (
  <Box
    sx={{
      display: { xs: "none", lg: "flex" },
      alignItems: "center",
      justifyContent: "center",
      alignSelf: "center",
      mt: "52px",
      flexShrink: 0,
    }}
  >
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0,
        opacity: active ? 1 : 0.22,
        transition: "opacity 0.35s ease",
      }}
    >
      <Box
        sx={{
          width: 18,
          height: 2,
          borderRadius: 2,
          bgcolor: active ? color : "text.disabled",
          transition: "background 0.35s ease",
        }}
      />
      <Box
        component="span"
        sx={{
          fontSize: "0.85rem",
          color: active ? color : "text.disabled",
          lineHeight: 1,
          transition: "color 0.35s ease",
          ml: "-1px",
        }}
      >
        ›
      </Box>
    </Box>
  </Box>
);

/* ───────────────────────────────────────────── HierarchyPanel */
const HierarchyPanel = ({
  title,
  subtitle,
  icon: Icon,
  color,
  items,
  selectedId,
  onSelect,
  onCreate,
  onEdit,
  onDelete,
  getPrimaryLabel,
  getSecondaryLabel,
  emptyMessage,
  disabled,
  disabledMessage,
  addLabel,
  submitting,
}) => (
  <Box
    sx={{
      borderRadius: 3,
      border: "1px solid",
      borderColor: (theme) =>
        theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)",
      bgcolor: (theme) =>
        theme.palette.mode === "dark" ? "rgba(255,255,255,0.025)" : "rgba(255,255,255,0.92)",
      overflow: "hidden",
      minHeight: 290,
      position: "relative",
      transition: "box-shadow 0.25s ease",
      "&:hover": {
        boxShadow: (theme) =>
          theme.palette.mode === "dark"
            ? `0 0 0 1px ${alpha(color, 0.22)}, 0 8px 32px ${alpha(color, 0.08)}`
            : `0 0 0 1px ${alpha(color, 0.18)}, 0 8px 28px ${alpha(color, 0.07)}`,
      },
    }}
  >
    {/* Top gradient accent bar */}
    <Box
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        background: `linear-gradient(90deg, ${color} 0%, ${alpha(color, 0.45)} 100%)`,
        opacity: disabled ? 0.3 : 1,
        transition: "opacity 0.25s ease",
      }}
    />

    {/* Header */}
    <Box
      sx={{
        px: 2,
        py: 1.5,
        pt: 2.2,
        borderBottom: "1px solid",
        borderColor: (theme) =>
          theme.palette.mode === "dark" ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 1,
      }}
    >
      {/* Left side: icon + text — can shrink */}
      <Box display="flex" gap={1} alignItems="center" sx={{ minWidth: 0, overflow: "hidden" }}>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: 2,
            background: `linear-gradient(135deg, ${alpha(color, 0.18)} 0%, ${alpha(color, 0.08)} 100%)`,
            border: "1px solid",
            borderColor: alpha(color, 0.25),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            boxShadow: `0 2px 8px ${alpha(color, 0.12)}`,
          }}
        >
          <Icon sx={{ fontSize: 16, color }} />
        </Box>

        {/* Text block — truncates when space runs out */}
        <Box sx={{ minWidth: 0, overflow: "hidden" }}>
          <Box display="flex" alignItems="center" gap={0.6} sx={{ minWidth: 0 }}>
            <Typography
              variant="subtitle2"
              fontWeight={800}
              noWrap
              sx={{ lineHeight: 1.2, fontSize: "0.82rem", minWidth: 0 }}
            >
              {title}
            </Typography>
            {!disabled && items.length > 0 && (
              <Box
                sx={{
                  px: 0.65,
                  py: 0.12,
                  borderRadius: 10,
                  bgcolor: alpha(color, 0.12),
                  border: "1px solid",
                  borderColor: alpha(color, 0.25),
                  lineHeight: 1,
                  flexShrink: 0,
                }}
              >
                <Typography sx={{ fontSize: "0.62rem", fontWeight: 800, color, lineHeight: 1 }}>
                  {items.length}
                </Typography>
              </Box>
            )}
          </Box>
          <Typography
            variant="caption"
            color="text.secondary"
            noWrap
            sx={{ fontSize: "0.68rem", opacity: 0.75, display: "block" }}
          >
            {subtitle}
          </Typography>
        </Box>
      </Box>

      {/* Right side: add button — never shrinks */}
      {onCreate ? (
        <Tooltip title={addLabel}>
          <span>
            <IconButton
              size="small"
              onClick={onCreate}
              disabled={disabled}
              sx={{
                width: 28,
                height: 28,
                borderRadius: 1.6,
                flexShrink: 0,
                background: disabled
                  ? undefined
                  : `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.8)} 100%)`,
                color: "#fff",
                boxShadow: disabled ? "none" : `0 2px 8px ${alpha(color, 0.3)}`,
                transition: "all 0.2s ease",
                "&:hover": {
                  boxShadow: `0 4px 14px ${alpha(color, 0.45)}`,
                  transform: "translateY(-1px)",
                },
                "&.Mui-disabled": {
                  background: (theme) =>
                    theme.palette.mode === "dark"
                      ? "rgba(255,255,255,0.08)"
                      : "rgba(0,0,0,0.08)",
                  color: "text.disabled",
                },
              }}
            >
              <Add sx={{ fontSize: 15 }} />
            </IconButton>
          </span>
        </Tooltip>
      ) : null}
    </Box>

    {/* Items list */}
    <Box sx={{ p: 1.2, display: "grid", gap: 0.85, maxHeight: 380, overflowY: "auto" }}>
      {disabled ? (
        <EmptyState message={disabledMessage} dimmed />
      ) : items.length === 0 ? (
        <EmptyState message={emptyMessage} />
      ) : (
        items.map((item) => {
          const itemId = item.id ?? item.program_id;
          const selected = String(itemId) === String(selectedId);

          return (
            <Box
              key={`${title}-${itemId}`}
              onClick={() => onSelect?.(item)}
              sx={{
                pl: selected ? 1.6 : 1.35,
                pr: 1.35,
                py: 1.2,
                borderRadius: 2,
                border: "1px solid",
                borderColor: selected
                  ? alpha(color, 0.5)
                  : (theme) =>
                      theme.palette.mode === "dark"
                        ? "rgba(255,255,255,0.07)"
                        : "rgba(0,0,0,0.07)",
                bgcolor: selected
                  ? alpha(color, 0.1)
                  : (theme) =>
                      theme.palette.mode === "dark"
                        ? "rgba(255,255,255,0.02)"
                        : "rgba(255,255,255,0.75)",
                position: "relative",
                overflow: "hidden",
                transition: "all 0.18s ease",
                cursor: onSelect ? "pointer" : "default",
                "&:hover": {
                  borderColor: alpha(color, 0.38),
                  bgcolor: alpha(color, 0.07),
                  transform: "translateY(-1px)",
                  boxShadow: `0 3px 12px ${alpha(color, 0.1)}`,
                },
              }}
            >
              {/* Left color stripe for selected */}
              {selected && (
                <Box
                  sx={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 3,
                    borderRadius: "2px 0 0 2px",
                    background: `linear-gradient(180deg, ${color} 0%, ${alpha(color, 0.55)} 100%)`,
                  }}
                />
              )}

              <Box
                display="flex"
                alignItems="flex-start"
                justifyContent="space-between"
                gap={1}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    variant="body2"
                    fontWeight={selected ? 800 : 700}
                    sx={{
                      fontSize: "0.84rem",
                      color: selected ? color : "text.primary",
                      lineHeight: 1.3,
                    }}
                  >
                    {getPrimaryLabel(item)}
                  </Typography>
                  {getSecondaryLabel ? (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block", mt: 0.25, fontSize: "0.70rem", opacity: 0.75 }}
                    >
                      {getSecondaryLabel(item)}
                    </Typography>
                  ) : null}
                </Box>

                <Box display="flex" gap={0.4} flexShrink={0}>
                  {onEdit ? (
                    <ActionButton
                      icon={Edit}
                      label={`Edit ${title}`}
                      color="primary"
                      onClick={(event) => {
                        event.stopPropagation();
                        onEdit(item);
                      }}
                    />
                  ) : null}
                  {onDelete ? (
                    <ActionButton
                      icon={Delete}
                      label={`Delete ${title}`}
                      color="error"
                      disabled={submitting}
                      onClick={(event) => {
                        event.stopPropagation();
                        onDelete(item);
                      }}
                    />
                  ) : null}
                </Box>
              </Box>
            </Box>
          );
        })
      )}
    </Box>
  </Box>
);

/* ───────────────────────────────────────────── sub-components */
const StatCard = ({ label, count, icon: Icon, color, loading }) => (
  <Box
    sx={{
      p: 2,
      borderRadius: 2.5,
      border: "1px solid",
      borderColor: alpha(color, 0.2),
      bgcolor: alpha(color, 0.04),
      display: "flex",
      alignItems: "center",
      gap: 1.5,
      position: "relative",
      overflow: "hidden",
      transition: "all 0.22s ease",
      "&:hover": {
        borderColor: alpha(color, 0.4),
        bgcolor: alpha(color, 0.08),
        transform: "translateY(-2px)",
        boxShadow: `0 6px 20px ${alpha(color, 0.12)}`,
      },
      "&::before": {
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 2,
        background: `linear-gradient(90deg, ${color} 0%, ${alpha(color, 0.4)} 100%)`,
      },
    }}
  >
    <Box
      sx={{
        width: 40,
        height: 40,
        borderRadius: 2,
        background: `linear-gradient(135deg, ${alpha(color, 0.18)} 0%, ${alpha(color, 0.08)} 100%)`,
        border: "1px solid",
        borderColor: alpha(color, 0.22),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        boxShadow: `0 2px 8px ${alpha(color, 0.1)}`,
      }}
    >
      <Icon sx={{ fontSize: 20, color }} />
    </Box>
    <Box>
      {loading ? (
        <Skeleton width={40} height={24} />
      ) : (
        <Typography
          variant="h6"
          fontWeight={800}
          sx={{
            lineHeight: 1.1,
            fontSize: "1.18rem",
            color,
            "@keyframes countPulse": {
              "0%": { opacity: 0, transform: "translateY(4px)" },
              "100%": { opacity: 1, transform: "translateY(0)" },
            },
            animation: "countPulse 0.4s ease forwards",
          }}
        >
          {count}
        </Typography>
      )}
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ fontSize: "0.71rem", fontWeight: 600, opacity: 0.85 }}
      >
        {label}
      </Typography>
    </Box>
  </Box>
);

const EmptyState = ({ message, dimmed = false }) => (
  <Box
    sx={{
      textAlign: "center",
      py: 5,
      opacity: dimmed ? 0.45 : 1,
      transition: "opacity 0.25s ease",
    }}
  >
    <Box
      sx={{
        width: 48,
        height: 48,
        borderRadius: "50%",
        bgcolor: (theme) => alpha(theme.palette.text.secondary, 0.06),
        border: "1px dashed",
        borderColor: (theme) => alpha(theme.palette.text.secondary, 0.15),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        mx: "auto",
        mb: 1.2,
      }}
    >
      <InfoOutlined sx={{ fontSize: 22, color: "text.secondary", opacity: 0.4 }} />
    </Box>
    <Typography
      variant="body2"
      color="text.secondary"
      sx={{ fontSize: "0.78rem", opacity: 0.65, maxWidth: 160, mx: "auto", lineHeight: 1.5 }}
    >
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
          width: 28,
          height: 28,
          borderRadius: 1.4,
          border: "1px solid",
          borderColor: (theme) => alpha(theme.palette[color]?.main || color, 0.18),
          bgcolor: (theme) => alpha(theme.palette[color]?.main || color, 0.04),
          color: `${color}.main`,
          transition: "all 0.18s ease",
          "&:hover": {
            borderColor: (theme) => alpha(theme.palette[color]?.main || color, 0.5),
            bgcolor: (theme) => alpha(theme.palette[color]?.main || color, 0.12),
            transform: "scale(1.08)",
          },
        }}
      >
        <Icon sx={{ fontSize: 14 }} />
      </IconButton>
    </span>
  </Tooltip>
);

/* ───────────────────────────────────────────── main component */
const CatalogManagement = () => {
  const { t } = useLanguage();
  const { showSuccess, showError, showInfo } = useNotification();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [activeTab, setActiveTab]             = useState(TAB_KEYS.HIERARCHY_EXPLORER);
  const [loading, setLoading]                 = useState(true);
  const [submitting, setSubmitting]           = useState(false);
  const [error, setError]                     = useState("");
  const [search, setSearch]                   = useState("");
  const [isSearchPending, startSearchTransition] = useTransition();
  const deferredSearch = useDeferredValue(search);

  const [institutionTypes, setInstitutionTypes] = useState([]);
  const [domains, setDomains]                   = useState([]);
  const [programs, setPrograms]                 = useState([]);
  const [levels, setLevels]                     = useState([]);
  const [semesters, setSemesters]               = useState([]);
  const [modules, setModules]                   = useState([]);
  const [institutions, setInstitutions]         = useState([]);

  const [institutionPrograms, setInstitutionPrograms] = useState([]);
  const [mappingLoading, setMappingLoading]           = useState(false);
  const [explorerMappingProgramId, setExplorerMappingProgramId] = useState("");

  const [selectedDomainId, setSelectedDomainId] = useState("");
  const [selectedProgramId, setSelectedProgramId] = useState("");
  const [selectedLevelId, setSelectedLevelId] = useState("");
  const [selectedSemesterId, setSelectedSemesterId] = useState("");
  const [selectedInstitutionTypeId, setSelectedInstitutionTypeId] = useState("");
  const [selectedExplorerInstitutionId, setSelectedExplorerInstitutionId] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState("create");
  const [dialogType, setDialogType] = useState(TAB_KEYS.INSTITUTION_TYPES);
  const [editingId, setEditingId]   = useState(null);
  const [confirmState, setConfirmState] = useState({
    open: false,
    title: '',
    message: '',
    details: [],
    confirmLabel: 'Confirm',
    severity: 'warning',
    action: null,
  });

  const { register, control, reset, handleSubmit, setValue, watch, formState: { errors: formErrors } } = useForm({
    defaultValues: getDialogDefaultValues(TAB_KEYS.INSTITUTION_TYPES),
  });

  const {
    control: mappingControl,
    watch: watchMapping,
    setValue: setMappingValue,
    handleSubmit: handleMappingSubmit,
  } = useForm({ defaultValues: { institutionId: "", programId: "" } });

  const selectedMappingInstitutionId = watchMapping("institutionId") || "";
  const selectedMappingProgramId     = watchMapping("programId") || "";
  const watchedDialogProgramId = watch("program_id") || "";
  const watchedDialogLevelId = watch("level_id") || "";
  const normalizedSearch = useMemo(() => deferredSearch.trim().toLowerCase(), [deferredSearch]);

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

  const programById = useMemo(() => {
    const map = new Map();
    programs.forEach((item) => map.set(String(item.id), item));
    return map;
  }, [programs]);

  const levelNameById = useMemo(() => {
    const map = new Map();
    levels.forEach((item) => map.set(String(item.id), item.name));
    return map;
  }, [levels]);

  const levelById = useMemo(() => {
    const map = new Map();
    levels.forEach((item) => map.set(String(item.id), item));
    return map;
  }, [levels]);

  const semesterNameById = useMemo(() => {
    const map = new Map();
    semesters.forEach((item) => map.set(String(item.id), item.name));
    return map;
  }, [semesters]);

  const semesterById = useMemo(() => {
    const map = new Map();
    semesters.forEach((item) => map.set(String(item.id), item));
    return map;
  }, [semesters]);

  const institutionById = useMemo(() => {
    const map = new Map();
    institutions.forEach((item) => map.set(String(item.id), item));
    return map;
  }, [institutions]);

  const filteredHierarchyPrograms = useMemo(() => {
    if (!selectedDomainId) return [];
    return sortByName(programs.filter((item) => String(item.domain_id || item.domainId) === String(selectedDomainId)));
  }, [programs, selectedDomainId]);

  const filteredHierarchyLevels = useMemo(() => {
    if (!selectedProgramId) return [];
    return sortByOrderThenName(levels.filter((item) => String(item.program_id || item.programId) === String(selectedProgramId)));
  }, [levels, selectedProgramId]);

  const filteredHierarchySemesters = useMemo(() => {
    if (!selectedLevelId) return [];
    return sortByOrderThenName(semesters.filter((item) => String(item.level_id || item.levelId) === String(selectedLevelId)));
  }, [semesters, selectedLevelId]);

  const filteredHierarchyModules = useMemo(() => {
    if (!selectedSemesterId) return [];
    return sortByName(modules.filter((item) => String(item.semester_id || item.semesterId) === String(selectedSemesterId)));
  }, [modules, selectedSemesterId]);

  const filteredInstitutionsByType = useMemo(() => {
    if (!selectedInstitutionTypeId) return [];
    return sortByName(institutions.filter((item) => String(item.institution_type_id || item.institutionTypeId) === String(selectedInstitutionTypeId)));
  }, [institutions, selectedInstitutionTypeId]);

  const availableProgramsForSelectedInstitution = useMemo(() => {
    const mappedProgramIds = new Set(institutionPrograms.map((item) => String(item.id || item.program_id)));
    return sortByName(programs.filter((item) => !mappedProgramIds.has(String(item.id))));
  }, [institutionPrograms, programs]);

  const programCountByDomain = useMemo(() => {
    const map = new Map();
    programs.forEach((item) => {
      const key = String(item.domain_id || item.domainId);
      map.set(key, (map.get(key) || 0) + 1);
    });
    return map;
  }, [programs]);

  const levelCountByProgram = useMemo(() => {
    const map = new Map();
    levels.forEach((item) => {
      const key = String(item.program_id || item.programId);
      map.set(key, (map.get(key) || 0) + 1);
    });
    return map;
  }, [levels]);

  const semesterCountByLevel = useMemo(() => {
    const map = new Map();
    semesters.forEach((item) => {
      const key = String(item.level_id || item.levelId);
      map.set(key, (map.get(key) || 0) + 1);
    });
    return map;
  }, [semesters]);

  const moduleCountBySemester = useMemo(() => {
    const map = new Map();
    modules.forEach((item) => {
      const key = String(item.semester_id || item.semesterId);
      map.set(key, (map.get(key) || 0) + 1);
    });
    return map;
  }, [modules]);

  const institutionCountByType = useMemo(() => {
    const map = new Map();
    institutions.forEach((item) => {
      const key = String(item.institution_type_id || item.institutionTypeId);
      map.set(key, (map.get(key) || 0) + 1);
    });
    return map;
  }, [institutions]);

  const selectedDomain = selectedDomainId ? domains.find((item) => String(item.id) === String(selectedDomainId)) : null;
  const selectedProgram = selectedProgramId ? programs.find((item) => String(item.id) === String(selectedProgramId)) : null;
  const selectedLevel = selectedLevelId ? levels.find((item) => String(item.id) === String(selectedLevelId)) : null;
  const selectedSemester = selectedSemesterId ? semesters.find((item) => String(item.id) === String(selectedSemesterId)) : null;
  const selectedInstitutionType = selectedInstitutionTypeId ? institutionTypes.find((item) => String(item.id) === String(selectedInstitutionTypeId)) : null;
  const selectedExplorerInstitution = selectedExplorerInstitutionId ? institutions.find((item) => String(item.id) === String(selectedExplorerInstitutionId)) : null;

  const clearMessages = () => { setError(""); };

  const openConfirmDialog = ({ title, message, details = [], confirmLabel = 'Confirm', severity = 'warning', action }) => {
    setConfirmState({
      open: true,
      title,
      message,
      details,
      confirmLabel,
      severity,
      action,
    });
  };

  const closeConfirmDialog = () => {
    if (submitting) return;
    setConfirmState((prev) => ({ ...prev, open: false, action: null }));
  };

  const loadCoreData = async () => {
    setLoading(true);
    clearMessages();
    try {
      const [typesResp, domainsResp, programsResp, levelsResp, semestersResp, modulesResp, institutionsResp] = await Promise.all([
        institutionTypeService.getAllInstitutionTypes(),
        domainService.getAllDomains(),
        programService.getAllPrograms(),
        levelService.getAllLevels(),
        semesterService.getAllSemesters(),
        moduleService.getAllModules(),
        institutionService.getAllInstitutions(),
      ]);
      setInstitutionTypes(sortByName(extractList(typesResp)));
      setDomains(sortByName(extractList(domainsResp)));
      setPrograms(sortByName(extractList(programsResp)));
      setLevels(sortByOrderThenName(extractList(levelsResp)));
      setSemesters(sortByOrderThenName(extractList(semestersResp)));
      setModules(sortByName(extractList(modulesResp)));
      setInstitutions(sortByName(extractList(institutionsResp)));
    } catch (e) {
      const message = getErrorMessage(e, "Failed to load catalog data");
      setError(message);
      showError(message);
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
      const message = getErrorMessage(e, "Failed to load program mappings");
      setError(message);
      showError(message);
    } finally {
      setMappingLoading(false);
    }
  };

  useEffect(() => { loadCoreData(); }, []);

  const activeMappingInstitutionId = activeTab === TAB_KEYS.HIERARCHY_EXPLORER
    ? selectedExplorerInstitutionId
    : selectedMappingInstitutionId;

  useEffect(() => { loadInstitutionPrograms(activeMappingInstitutionId); }, [activeMappingInstitutionId]);

  useEffect(() => {
    setSelectedProgramId("");
    setSelectedLevelId("");
    setSelectedSemesterId("");
  }, [selectedDomainId]);

  useEffect(() => {
    setSelectedLevelId("");
    setSelectedSemesterId("");
  }, [selectedProgramId]);

  useEffect(() => {
    setSelectedSemesterId("");
  }, [selectedLevelId]);

  useEffect(() => {
    setSelectedExplorerInstitutionId("");
    setExplorerMappingProgramId("");
  }, [selectedInstitutionTypeId]);

  useEffect(() => {
    setExplorerMappingProgramId("");
  }, [selectedExplorerInstitutionId]);

  useEffect(() => {
    const syncNextLevelSortOrder = async () => {
      if (!dialogOpen || dialogMode !== "create" || dialogType !== TAB_KEYS.LEVELS || !watchedDialogProgramId) return;

      try {
        const response = await levelService.getNextSortOrder(Number(watchedDialogProgramId));
        const nextValue = extractData(response)?.sort_order ?? extractData(response)?.next_sort_order ?? extractData(response)?.nextSortOrder;
        if (nextValue !== undefined && nextValue !== null) {
          setValue("sort_order", String(nextValue), { shouldDirty: false, shouldValidate: true });
        }
      } catch {
        setValue("sort_order", "1", { shouldDirty: false, shouldValidate: false });
      }
    };

    syncNextLevelSortOrder();
  }, [dialogOpen, dialogMode, dialogType, watchedDialogProgramId, setValue]);

  useEffect(() => {
    const syncNextSemesterSortOrder = async () => {
      if (!dialogOpen || dialogMode !== "create" || dialogType !== TAB_KEYS.SEMESTERS || !watchedDialogLevelId) return;

      try {
        const response = await semesterService.getNextSortOrder(Number(watchedDialogLevelId));
        const nextValue = extractData(response)?.sort_order ?? extractData(response)?.next_sort_order ?? extractData(response)?.nextSortOrder;
        if (nextValue !== undefined && nextValue !== null) {
          setValue("sort_order", String(nextValue), { shouldDirty: false, shouldValidate: true });
        }
      } catch {
        setValue("sort_order", "1", { shouldDirty: false, shouldValidate: false });
      }
    };

    syncNextSemesterSortOrder();
  }, [dialogOpen, dialogMode, dialogType, watchedDialogLevelId, setValue]);

  const openCreateDialog = (type, presetValues = {}) => {
    clearMessages();
    setDialogType(type);
    setDialogMode("create");
    setEditingId(null);
    reset(getDialogDefaultValues(type, null, presetValues));
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

  const getDeleteConfirmationContent = (type, item) => {
    const label = item?.name || item?.title || item?.code || "this entry";
    const warnings = [];

    if (type === TAB_KEYS.INSTITUTION_TYPES) {
      const institutionCount = institutions.filter((institution) => String(institution.institution_type_id || institution.institutionTypeId) === String(item.id)).length;
      if (institutionCount > 0) warnings.push(`${institutionCount} institution(s) currently use this type.`);
    }

    if (type === TAB_KEYS.DOMAINS) {
      const linkedPrograms = programs.filter((program) => String(program.domain_id || program.domainId) === String(item.id));
      const linkedProgramIds = new Set(linkedPrograms.map((program) => String(program.id)));
      const linkedLevels = levels.filter((level) => linkedProgramIds.has(String(level.program_id || level.programId)));
      const linkedLevelIds = new Set(linkedLevels.map((level) => String(level.id)));
      const linkedSemesters = semesters.filter((semester) => linkedLevelIds.has(String(semester.level_id || semester.levelId)));
      const linkedSemesterIds = new Set(linkedSemesters.map((semester) => String(semester.id)));
      const linkedModules = modules.filter((module) => linkedSemesterIds.has(String(module.semester_id || module.semesterId)));

      if (linkedPrograms.length > 0) warnings.push(`${linkedPrograms.length} program(s) will be affected.`);
      if (linkedLevels.length > 0) warnings.push(`${linkedLevels.length} level(s) belong to those programs.`);
      if (linkedSemesters.length > 0) warnings.push(`${linkedSemesters.length} semester(s) belong to those levels.`);
      if (linkedModules.length > 0) warnings.push(`${linkedModules.length} module(s) belong to those semesters.`);
    }

    if (type === TAB_KEYS.PROGRAMS) {
      const linkedLevels = levels.filter((level) => String(level.program_id || level.programId) === String(item.id));
      const linkedLevelIds = new Set(linkedLevels.map((level) => String(level.id)));
      const linkedSemesters = semesters.filter((semester) => linkedLevelIds.has(String(semester.level_id || semester.levelId)));
      const linkedSemesterIds = new Set(linkedSemesters.map((semester) => String(semester.id)));
      const linkedModules = modules.filter((module) => linkedSemesterIds.has(String(module.semester_id || module.semesterId)));

      if (linkedLevels.length > 0) warnings.push(`${linkedLevels.length} level(s) belong to this program.`);
      if (linkedSemesters.length > 0) warnings.push(`${linkedSemesters.length} semester(s) depend on those levels.`);
      if (linkedModules.length > 0) warnings.push(`${linkedModules.length} module(s) depend on those semesters.`);
      if (institutionPrograms.some((program) => String(program.id || program.program_id) === String(item.id))) {
        warnings.push("This program may already be linked to one or more institutions.");
      }
    }

    if (type === TAB_KEYS.LEVELS) {
      const linkedSemesters = semesters.filter((semester) => String(semester.level_id || semester.levelId) === String(item.id));
      const linkedSemesterIds = new Set(linkedSemesters.map((semester) => String(semester.id)));
      const linkedModules = modules.filter((module) => linkedSemesterIds.has(String(module.semester_id || module.semesterId)));
      if (linkedSemesters.length > 0) warnings.push(`${linkedSemesters.length} semester(s) belong to this level.`);
      if (linkedModules.length > 0) warnings.push(`${linkedModules.length} module(s) depend on those semesters.`);
    }

    if (type === TAB_KEYS.SEMESTERS) {
      const linkedModules = modules.filter((module) => String(module.semester_id || module.semesterId) === String(item.id));
      if (linkedModules.length > 0) warnings.push(`${linkedModules.length} module(s) belong to this semester.`);
    }

    if (type === TAB_KEYS.INSTITUTIONS) {
      const isSelectedInstitution = String(activeMappingInstitutionId || item.id) === String(item.id);
      if (isSelectedInstitution && institutionPrograms.length > 0) {
        warnings.push(`${institutionPrograms.length} program mapping(s) are currently attached to this institution.`);
      } else {
        warnings.push("This institution may already be linked to one or more programs.");
      }
    }

    return {
      title: 'Confirm Deletion',
      message: `Delete "${label}"?\nThis action cannot be undone.`,
      details: warnings,
      confirmLabel: 'Delete',
      severity: 'error',
    };
  };

  const refreshAfterMutation = async () => {
    await loadCoreData();
    if (activeMappingInstitutionId) await loadInstitutionPrograms(activeMappingInstitutionId);
  };

  const handleSubmitDialog = handleSubmit(async (formValues) => {
    setSubmitting(true);
    clearMessages();
    try {
      if (dialogType === TAB_KEYS.INSTITUTION_TYPES) {
        dialogMode === "create"
          ? await institutionTypeService.createInstitutionType(formValues.name.trim())
          : await institutionTypeService.updateInstitutionType(editingId, { name: formValues.name.trim() });
        showSuccess(`Institution type ${dialogMode === "create" ? "created" : "updated"} successfully`);
      }
      if (dialogType === TAB_KEYS.DOMAINS) {
        dialogMode === "create"
          ? await domainService.createDomain(formValues.name.trim())
          : await domainService.updateDomain(editingId, { name: formValues.name.trim() });
        showSuccess(`Domain ${dialogMode === "create" ? "created" : "updated"} successfully`);
      }
      if (dialogType === TAB_KEYS.PROGRAMS) {
        const payload = { name: formValues.name.trim(), domain_id: Number(formValues.domain_id) };
        dialogMode === "create"
          ? await programService.createProgram(payload)
          : await programService.updateProgram(editingId, payload);
        showSuccess(`Program ${dialogMode === "create" ? "created" : "updated"} successfully`);
      }
      if (dialogType === TAB_KEYS.LEVELS) {
        const payload = {
          name: formValues.name.trim(),
          program_id: Number(formValues.program_id),
          sort_order: Number(formValues.sort_order),
        };
        dialogMode === "create"
          ? await levelService.createLevel(payload)
          : await levelService.updateLevel(editingId, payload);
        showSuccess(`Level ${dialogMode === "create" ? "created" : "updated"} successfully`);
      }
      if (dialogType === TAB_KEYS.SEMESTERS) {
        const payload = {
          name: formValues.name.trim(),
          level_id: Number(formValues.level_id),
          sort_order: Number(formValues.sort_order),
        };
        dialogMode === "create"
          ? await semesterService.createSemester(payload)
          : await semesterService.updateSemester(editingId, payload);
        showSuccess(`Semester ${dialogMode === "create" ? "created" : "updated"} successfully`);
      }
      if (dialogType === TAB_KEYS.MODULES) {
        const payload = {
          code: formValues.code.trim(),
          title: formValues.title.trim(),
          description: formValues.description?.trim() || "",
          semester_id: Number(formValues.semester_id),
        };
        dialogMode === "create"
          ? await moduleService.createModule(payload)
          : await moduleService.updateModule(editingId, payload);
        showSuccess(`Module ${dialogMode === "create" ? "created" : "updated"} successfully`);
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
        showSuccess(`Institution ${dialogMode === "create" ? "created" : "updated"} successfully`);
      }
      await refreshAfterMutation();
      closeDialog();
    } catch (e) {
      const message = getErrorMessage(e, "Operation failed");
      setError(message);
      showError(message);
    } finally {
      setSubmitting(false);
    }
  });

  const handleDelete = (type, item) => {
    const confirmation = getDeleteConfirmationContent(type, item);
    openConfirmDialog({
      ...confirmation,
      action: async () => {
        setSubmitting(true);
        clearMessages();
        try {
          if (type === TAB_KEYS.INSTITUTION_TYPES) await institutionTypeService.deleteInstitutionType(item.id);
          if (type === TAB_KEYS.DOMAINS)           await domainService.deleteDomain(item.id);
          if (type === TAB_KEYS.PROGRAMS)          await programService.deleteProgram(item.id);
          if (type === TAB_KEYS.LEVELS)            await levelService.deleteLevel(item.id);
          if (type === TAB_KEYS.SEMESTERS)         await semesterService.deleteSemester(item.id);
          if (type === TAB_KEYS.MODULES)           await moduleService.deleteModule(item.id);
          if (type === TAB_KEYS.INSTITUTIONS)      await institutionService.deleteInstitution(item.id);
          await refreshAfterMutation();
          showSuccess('Deleted successfully');
          closeConfirmDialog();
        } catch (e) {
          const message = getErrorMessage(e, 'Delete failed');
          setError(message);
          showError(message);
        } finally {
          setSubmitting(false);
        }
      },
    });
  };

  const handleConfirmAction = async () => {
    if (!confirmState.action) return;
    await confirmState.action();
  };

  const handleAddMapping = handleMappingSubmit(async ({ institutionId, programId }) => {
    if (!institutionId || !programId) return;
    setSubmitting(true);
    clearMessages();
    try {
      await institutionProgramService.addAssociation(Number(institutionId), Number(programId));
      setMappingValue("programId", "");
      await loadInstitutionPrograms(institutionId);
      showSuccess('Program mapped to institution successfully');
    } catch (e) {
      const message = getErrorMessage(e, 'Failed to create mapping');
      setError(message);
      showError(message);
    } finally {
      setSubmitting(false);
    }
  });

  const handleRemoveMapping = (programId) => {
    if (!selectedMappingInstitutionId) return;
    openConfirmDialog({
      title: 'Remove Program Mapping',
      message: 'Remove this program from the selected institution?\nThis action can be restored later by creating the mapping again.',
      confirmLabel: 'Remove Mapping',
      severity: 'warning',
      action: async () => {
        setSubmitting(true);
        clearMessages();
        try {
          await institutionProgramService.removeAssociation(Number(selectedMappingInstitutionId), Number(programId));
          await loadInstitutionPrograms(selectedMappingInstitutionId);
          showInfo('Program mapping removed successfully');
          closeConfirmDialog();
        } catch (e) {
          const message = getErrorMessage(e, 'Failed to remove mapping');
          setError(message);
          showError(message);
        } finally {
          setSubmitting(false);
        }
      },
    });
  };

  const handleAddExplorerMapping = async () => {
    if (!selectedExplorerInstitutionId || !explorerMappingProgramId) return;
    setSubmitting(true);
    clearMessages();
    try {
      await institutionProgramService.addAssociation(Number(selectedExplorerInstitutionId), Number(explorerMappingProgramId));
      setExplorerMappingProgramId("");
      await loadInstitutionPrograms(selectedExplorerInstitutionId);
      showSuccess('Program mapped to institution successfully');
    } catch (e) {
      const message = getErrorMessage(e, 'Failed to create mapping');
      setError(message);
      showError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveExplorerMapping = (programId) => {
    if (!selectedExplorerInstitutionId) return;
    openConfirmDialog({
      title: 'Remove Program Mapping',
      message: 'Remove this program from the selected institution?\nThis action can be restored later by creating the mapping again.',
      confirmLabel: 'Remove Mapping',
      severity: 'warning',
      action: async () => {
        setSubmitting(true);
        clearMessages();
        try {
          await institutionProgramService.removeAssociation(Number(selectedExplorerInstitutionId), Number(programId));
          await loadInstitutionPrograms(selectedExplorerInstitutionId);
          showInfo('Program mapping removed successfully');
          closeConfirmDialog();
        } catch (e) {
          const message = getErrorMessage(e, 'Failed to remove mapping');
          setError(message);
          showError(message);
        } finally {
          setSubmitting(false);
        }
      },
    });
  };

  /* ─── Table renderer ────────────────────────────────── */
  const renderCrudTable = (type, rows, columns) => {
    const tabMeta  = TAB_META[type];
    const searchableKeys = columns.map((column) => column.key);
    const filtered = normalizedSearch
      ? rows.filter((row) => {
          if (String(row?.id ?? "").toLowerCase().includes(normalizedSearch)) return true;

          return searchableKeys.some((key) => {
            const value = row?.[key];
            return String(value ?? "").toLowerCase().includes(normalizedSearch);
          });
        })
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
                    <EmptyState message={normalizedSearch ? `No results for "${search}"` : "No entries yet. Click Add to create one."} />
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
    if (activeTab === TAB_KEYS.HIERARCHY_EXPLORER)
      return (
        <Box display="grid" gap={2.5}>
          {/* ─── Academic Hierarchy Explorer ─── */}
          <Box
            sx={{
              borderRadius: 3.5,
              border: "1px solid",
              borderColor: (theme) =>
                theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)",
              bgcolor: (theme) =>
                theme.palette.mode === "dark" ? "rgba(255,255,255,0.025)" : "rgba(255,255,255,0.92)",
              overflow: "hidden",
              position: "relative",
              transition: "box-shadow 0.25s ease",
              "&:hover": {
                boxShadow: (theme) =>
                  theme.palette.mode === "dark"
                    ? "0 8px 40px rgba(96,165,250,0.06)"
                    : "0 8px 40px rgba(96,165,250,0.05)",
              },
            }}
          >
            {/* Top gradient accent */}
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 3,
                background: "linear-gradient(90deg, #60a5fa 0%, #3b82f6 40%, rgba(96,165,250,0.3) 100%)",
              }}
            />

            <Box sx={{ px: 2.8, pt: 3, pb: 2.2 }}>
              {/* Section header */}
              <Box display="flex" alignItems="flex-start" justifyContent="space-between" gap={2} mb={2}>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2.2,
                      background: "linear-gradient(135deg, rgba(96,165,250,0.2) 0%, rgba(59,130,246,0.1) 100%)",
                      border: "1px solid",
                      borderColor: alpha("#60a5fa", 0.3),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      boxShadow: "0 2px 12px rgba(96,165,250,0.15)",
                    }}
                  >
                    <Hub sx={{ fontSize: 20, color: "#60a5fa" }} />
                  </Box>
                  <Box>
                    <Typography
                      variant="subtitle1"
                      fontWeight={900}
                      sx={{
                        lineHeight: 1.2,
                        fontSize: "1.05rem",
                        background: "linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                      }}
                    >
                      Academic Hierarchy Explorer
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8rem", mt: 0.2 }}>
                      Navigate from domains to modules — create and manage entities in context
                    </Typography>
                  </Box>
                </Box>

                {/* Step indicators */}
                <Box
                  sx={{
                    display: { xs: "none", md: "flex" },
                    alignItems: "center",
                    gap: 0.6,
                    flexShrink: 0,
                  }}
                >
                  {[
                    { color: "#3b82f6", active: true },
                    { color: "#10b981", active: !!selectedDomainId },
                    { color: "#14b8a6", active: !!selectedProgramId },
                    { color: "#f97316", active: !!selectedLevelId },
                    { color: "#eab308", active: !!selectedSemesterId },
                  ].map((step, i) => (
                    <Box
                      key={i}
                      sx={{
                        width: step.active ? 20 : 8,
                        height: 8,
                        borderRadius: 4,
                        bgcolor: step.active ? step.color : alpha(step.color, 0.2),
                        border: "1px solid",
                        borderColor: step.active ? step.color : alpha(step.color, 0.3),
                        transition: "all 0.35s ease",
                        boxShadow: step.active ? `0 0 8px ${alpha(step.color, 0.4)}` : "none",
                      }}
                    />
                  ))}
                </Box>
              </Box>

              {/* Breadcrumb flow */}
              <BreadcrumbFlow
                steps={[
                  {
                    label: "Domain",
                    value: selectedDomain?.name || null,
                    color: "#3b82f6",
                    icon: AccountTree,
                    active: !!selectedDomainId,
                    onReset: selectedDomainId ? () => {
                      setSelectedDomainId("");
                      setSelectedProgramId("");
                      setSelectedLevelId("");
                      setSelectedSemesterId("");
                    } : null,
                  },
                  {
                    label: "Program",
                    value: selectedProgram?.name || null,
                    color: "#10b981",
                    icon: School,
                    active: !!selectedProgramId,
                    onReset: selectedProgramId ? () => {
                      setSelectedProgramId("");
                      setSelectedLevelId("");
                      setSelectedSemesterId("");
                    } : null,
                  },
                  {
                    label: "Level",
                    value: selectedLevel?.name || null,
                    color: "#14b8a6",
                    icon: Layers,
                    active: !!selectedLevelId,
                    onReset: selectedLevelId ? () => {
                      setSelectedLevelId("");
                      setSelectedSemesterId("");
                    } : null,
                  },
                  {
                    label: "Semester",
                    value: selectedSemester?.name || null,
                    color: "#f97316",
                    icon: CalendarMonth,
                    active: !!selectedSemesterId,
                    onReset: selectedSemesterId ? () => setSelectedSemesterId("") : null,
                  },
                  {
                    label: "Modules",
                    value: selectedSemesterId ? `${filteredHierarchyModules.length}` : null,
                    color: "#eab308",
                    icon: MenuBook,
                    active: !!selectedSemesterId,
                    onReset: null,
                  },
                ]}
              />

              {/* Panel grid with connectors */}
              <Box
                sx={{
                  display: { xs: "grid", lg: "flex" },
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: 1.5,
                  mt: 2.2,
                  alignItems: "stretch",
                }}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <HierarchyPanel
                    title="Domains"
                    subtitle={`${domains.length} available`}
                    icon={AccountTree}
                    color="#3b82f6"
                    items={domains}
                    selectedId={selectedDomainId}
                    onSelect={(item) => setSelectedDomainId(String(item.id))}
                    onCreate={() => openCreateDialog(TAB_KEYS.DOMAINS)}
                    onEdit={(item) => openEditDialog(TAB_KEYS.DOMAINS, item)}
                    onDelete={(item) => handleDelete(TAB_KEYS.DOMAINS, item)}
                    getPrimaryLabel={(item) => item.name}
                    getSecondaryLabel={(item) => `${programCountByDomain.get(String(item.id)) || 0} program(s)`}
                    emptyMessage="No domains created yet."
                    addLabel="Add Domain"
                    submitting={submitting}
                  />
                </Box>

                <InterPanelConnector active={!!selectedDomainId} color="#10b981" />

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <HierarchyPanel
                    title="Programs"
                    subtitle={selectedDomainId ? `${filteredHierarchyPrograms.length} in selected domain` : "Select a domain first"}
                    icon={School}
                    color="#10b981"
                    items={filteredHierarchyPrograms}
                    selectedId={selectedProgramId}
                    onSelect={(item) => setSelectedProgramId(String(item.id))}
                    onCreate={() => openCreateDialog(TAB_KEYS.PROGRAMS, { domain_id: String(selectedDomainId) })}
                    onEdit={(item) => openEditDialog(TAB_KEYS.PROGRAMS, item)}
                    onDelete={(item) => handleDelete(TAB_KEYS.PROGRAMS, item)}
                    getPrimaryLabel={(item) => item.name}
                    getSecondaryLabel={(item) => `${domainNameById.get(String(item.domain_id || item.domainId)) || "Domain"} · ${levelCountByProgram.get(String(item.id)) || 0} level(s)`}
                    emptyMessage="No programs found under this domain."
                    disabled={!selectedDomainId}
                    disabledMessage="Select a domain to manage programs."
                    addLabel="Add Program"
                    submitting={submitting}
                  />
                </Box>

                <InterPanelConnector active={!!selectedProgramId} color="#14b8a6" />

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <HierarchyPanel
                    title="Levels"
                    subtitle={selectedProgramId ? `${filteredHierarchyLevels.length} in selected program` : "Select a program first"}
                    icon={Layers}
                    color="#14b8a6"
                    items={filteredHierarchyLevels}
                    selectedId={selectedLevelId}
                    onSelect={(item) => setSelectedLevelId(String(item.id))}
                    onCreate={() => openCreateDialog(TAB_KEYS.LEVELS, { program_id: String(selectedProgramId) })}
                    onEdit={(item) => openEditDialog(TAB_KEYS.LEVELS, item)}
                    onDelete={(item) => handleDelete(TAB_KEYS.LEVELS, item)}
                    getPrimaryLabel={(item) => item.name}
                    getSecondaryLabel={(item) => `Order ${item.sort_order || item.sortOrder || 1} · ${semesterCountByLevel.get(String(item.id)) || 0} semester(s)`}
                    emptyMessage="No levels found under this program."
                    disabled={!selectedProgramId}
                    disabledMessage="Select a program to manage levels."
                    addLabel="Add Level"
                    submitting={submitting}
                  />
                </Box>

                <InterPanelConnector active={!!selectedLevelId} color="#f97316" />

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <HierarchyPanel
                    title="Semesters"
                    subtitle={selectedLevelId ? `${filteredHierarchySemesters.length} in selected level` : "Select a level first"}
                    icon={CalendarMonth}
                    color="#f97316"
                    items={filteredHierarchySemesters}
                    selectedId={selectedSemesterId}
                    onSelect={(item) => setSelectedSemesterId(String(item.id))}
                    onCreate={() => openCreateDialog(TAB_KEYS.SEMESTERS, { level_id: String(selectedLevelId) })}
                    onEdit={(item) => openEditDialog(TAB_KEYS.SEMESTERS, item)}
                    onDelete={(item) => handleDelete(TAB_KEYS.SEMESTERS, item)}
                    getPrimaryLabel={(item) => item.name}
                    getSecondaryLabel={(item) => `Order ${item.sort_order || item.sortOrder || 1} · ${moduleCountBySemester.get(String(item.id)) || 0} module(s)`}
                    emptyMessage="No semesters found under this level."
                    disabled={!selectedLevelId}
                    disabledMessage="Select a level to manage semesters."
                    addLabel="Add Semester"
                    submitting={submitting}
                  />
                </Box>

                <InterPanelConnector active={!!selectedSemesterId} color="#eab308" />

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <HierarchyPanel
                    title="Modules"
                    subtitle={selectedSemesterId ? `${filteredHierarchyModules.length} in selected semester` : "Select a semester first"}
                    icon={MenuBook}
                    color="#eab308"
                    items={filteredHierarchyModules}
                    selectedId={null}
                    onSelect={null}
                    onCreate={() => openCreateDialog(TAB_KEYS.MODULES, { semester_id: String(selectedSemesterId) })}
                    onEdit={(item) => openEditDialog(TAB_KEYS.MODULES, item)}
                    onDelete={(item) => handleDelete(TAB_KEYS.MODULES, item)}
                    getPrimaryLabel={(item) => item.title}
                    getSecondaryLabel={(item) => item.code || "Module code"}
                    emptyMessage="No modules found under this semester."
                    disabled={!selectedSemesterId}
                    disabledMessage="Select a semester to manage modules."
                    addLabel="Add Module"
                    submitting={submitting}
                  />
                </Box>
              </Box>
            </Box>
          </Box>

          {/* ─── Institution Mapping Explorer ─── */}
          <Box
            sx={{
              borderRadius: 3.5,
              border: "1px solid",
              borderColor: (theme) =>
                theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)",
              bgcolor: (theme) =>
                theme.palette.mode === "dark" ? "rgba(255,255,255,0.025)" : "rgba(255,255,255,0.92)",
              overflow: "hidden",
              position: "relative",
              transition: "box-shadow 0.25s ease",
              "&:hover": {
                boxShadow: (theme) =>
                  theme.palette.mode === "dark"
                    ? "0 8px 40px rgba(236,72,153,0.06)"
                    : "0 8px 40px rgba(236,72,153,0.05)",
              },
            }}
          >
            {/* Top gradient accent */}
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 3,
                background: "linear-gradient(90deg, #ec4899 0%, #f59e0b 50%, rgba(236,72,153,0.3) 100%)",
              }}
            />

            <Box sx={{ px: 2.8, pt: 3, pb: 2.2 }}>
              {/* Section header */}
              <Box display="flex" alignItems="flex-start" justifyContent="space-between" gap={2} mb={2}>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2.2,
                      background: "linear-gradient(135deg, rgba(236,72,153,0.2) 0%, rgba(245,158,11,0.1) 100%)",
                      border: "1px solid",
                      borderColor: alpha("#ec4899", 0.3),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      boxShadow: "0 2px 12px rgba(236,72,153,0.15)",
                    }}
                  >
                    <Link sx={{ fontSize: 20, color: "#ec4899" }} />
                  </Box>
                  <Box>
                    <Typography
                      variant="subtitle1"
                      fontWeight={900}
                      sx={{
                        lineHeight: 1.2,
                        fontSize: "1.05rem",
                        background: "linear-gradient(135deg, #ec4899 0%, #f59e0b 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                      }}
                    >
                      Institution Mapping Explorer
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8rem", mt: 0.2 }}>
                      Manage institution types, institutions, and the programs linked to each institution
                    </Typography>
                  </Box>
                </Box>

                {/* Step indicators */}
                <Box
                  sx={{
                    display: { xs: "none", md: "flex" },
                    alignItems: "center",
                    gap: 0.6,
                    flexShrink: 0,
                  }}
                >
                  {[
                    { color: "#7c5cfc", active: true },
                    { color: "#f59e0b", active: !!selectedInstitutionTypeId },
                    { color: "#ec4899", active: !!selectedExplorerInstitutionId },
                  ].map((step, i) => (
                    <Box
                      key={i}
                      sx={{
                        width: step.active ? 20 : 8,
                        height: 8,
                        borderRadius: 4,
                        bgcolor: step.active ? step.color : alpha(step.color, 0.2),
                        border: "1px solid",
                        borderColor: step.active ? step.color : alpha(step.color, 0.3),
                        transition: "all 0.35s ease",
                        boxShadow: step.active ? `0 0 8px ${alpha(step.color, 0.4)}` : "none",
                      }}
                    />
                  ))}
                </Box>
              </Box>

              {/* Breadcrumb flow */}
              <BreadcrumbFlow
                steps={[
                  {
                    label: "Type",
                    value: selectedInstitutionType?.name || null,
                    color: "#7c5cfc",
                    icon: Category,
                    active: !!selectedInstitutionTypeId,
                    onReset: selectedInstitutionTypeId ? () => {
                      setSelectedInstitutionTypeId("");
                      setSelectedExplorerInstitutionId("");
                      setExplorerMappingProgramId("");
                    } : null,
                  },
                  {
                    label: "Institution",
                    value: selectedExplorerInstitution?.name || null,
                    color: "#f59e0b",
                    icon: Apartment,
                    active: !!selectedExplorerInstitutionId,
                    onReset: selectedExplorerInstitutionId ? () => {
                      setSelectedExplorerInstitutionId("");
                      setExplorerMappingProgramId("");
                    } : null,
                  },
                  {
                    label: "Linked Programs",
                    value: selectedExplorerInstitutionId ? `${institutionPrograms.length}` : null,
                    color: "#ec4899",
                    icon: Link,
                    active: !!selectedExplorerInstitutionId,
                    onReset: null,
                  },
                ]}
              />

              {/* Panel grid with connectors */}
              <Box
                sx={{
                  display: { xs: "grid", lg: "flex" },
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: 1.5,
                  mt: 2.2,
                  alignItems: "stretch",
                }}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <HierarchyPanel
                    title="Institution Types"
                    subtitle={`${institutionTypes.length} available`}
                    icon={Category}
                    color="#7c5cfc"
                    items={institutionTypes}
                    selectedId={selectedInstitutionTypeId}
                    onSelect={(item) => setSelectedInstitutionTypeId(String(item.id))}
                    onCreate={() => openCreateDialog(TAB_KEYS.INSTITUTION_TYPES)}
                    onEdit={(item) => openEditDialog(TAB_KEYS.INSTITUTION_TYPES, item)}
                    onDelete={(item) => handleDelete(TAB_KEYS.INSTITUTION_TYPES, item)}
                    getPrimaryLabel={(item) => item.name}
                    getSecondaryLabel={(item) => `${institutionCountByType.get(String(item.id)) || 0} institution(s)`}
                    emptyMessage="No institution types created yet."
                    addLabel="Add Type"
                    submitting={submitting}
                  />
                </Box>

                <InterPanelConnector active={!!selectedInstitutionTypeId} color="#f59e0b" />

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <HierarchyPanel
                    title="Institutions"
                    subtitle={selectedInstitutionTypeId ? `${filteredInstitutionsByType.length} in selected type` : "Select a type first"}
                    icon={Apartment}
                    color="#f59e0b"
                    items={filteredInstitutionsByType}
                    selectedId={selectedExplorerInstitutionId}
                    onSelect={(item) => setSelectedExplorerInstitutionId(String(item.id))}
                    onCreate={() => openCreateDialog(TAB_KEYS.INSTITUTIONS, { institution_type_id: String(selectedInstitutionTypeId) })}
                    onEdit={(item) => openEditDialog(TAB_KEYS.INSTITUTIONS, item)}
                    onDelete={(item) => handleDelete(TAB_KEYS.INSTITUTIONS, item)}
                    getPrimaryLabel={(item) => item.name}
                    getSecondaryLabel={(item) => [item.city, item.country].filter(Boolean).join(", ") || "Location not set"}
                    emptyMessage="No institutions found for this type."
                    disabled={!selectedInstitutionTypeId}
                    disabledMessage="Select an institution type to manage institutions."
                    addLabel="Add Institution"
                    submitting={submitting}
                  />
                </Box>

                <InterPanelConnector active={!!selectedExplorerInstitutionId} color="#ec4899" />

                {/* Program Links panel — upgraded */}
                <Box
                  sx={{
                    flex: 1.15,
                    minWidth: 0,
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: (theme) =>
                      selectedExplorerInstitutionId
                        ? alpha("#ec4899", 0.3)
                        : theme.palette.mode === "dark"
                        ? "rgba(255,255,255,0.08)"
                        : "rgba(0,0,0,0.07)",
                    bgcolor: (theme) =>
                      theme.palette.mode === "dark" ? "rgba(255,255,255,0.025)" : "rgba(255,255,255,0.92)",
                    overflow: "hidden",
                    minHeight: 290,
                    position: "relative",
                    transition: "all 0.25s ease",
                    boxShadow: selectedExplorerInstitutionId
                      ? `0 0 0 1px ${alpha("#ec4899", 0.15)}, 0 8px 28px ${alpha("#ec4899", 0.07)}`
                      : "none",
                  }}
                >
                  {/* Top gradient accent */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 3,
                      background: "linear-gradient(90deg, #ec4899 0%, rgba(236,72,153,0.4) 100%)",
                      opacity: selectedExplorerInstitutionId ? 1 : 0.3,
                      transition: "opacity 0.25s ease",
                    }}
                  />

                  {/* Header */}
                  <Box
                    sx={{
                      px: 2,
                      py: 1.7,
                      pt: 2.2,
                      borderBottom: "1px solid",
                      borderColor: (theme) =>
                        theme.palette.mode === "dark" ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)",
                    }}
                  >
                    <Box display="flex" alignItems="flex-start" justifyContent="space-between" gap={1}>
                      <Box display="flex" gap={1.2} alignItems="flex-start">
                        <Box
                          sx={{
                            width: 34,
                            height: 34,
                            borderRadius: 2,
                            background: `linear-gradient(135deg, ${alpha("#ec4899", 0.18)} 0%, ${alpha("#ec4899", 0.08)} 100%)`,
                            border: "1px solid",
                            borderColor: alpha("#ec4899", 0.25),
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            boxShadow: `0 2px 8px ${alpha("#ec4899", 0.12)}`,
                          }}
                        >
                          <Link sx={{ fontSize: 17, color: "#ec4899" }} />
                        </Box>
                        <Box>
                          <Box display="flex" alignItems="center" gap={0.8}>
                            <Typography variant="subtitle2" fontWeight={800} sx={{ lineHeight: 1.2, fontSize: "0.84rem" }}>
                              Program Links
                            </Typography>
                            {selectedExplorerInstitutionId && !mappingLoading && institutionPrograms.length > 0 && (
                              <Box
                                sx={{
                                  px: 0.7,
                                  py: 0.15,
                                  borderRadius: 10,
                                  bgcolor: alpha("#ec4899", 0.12),
                                  border: "1px solid",
                                  borderColor: alpha("#ec4899", 0.25),
                                }}
                              >
                                <Typography sx={{ fontSize: "0.64rem", fontWeight: 800, color: "#ec4899", lineHeight: 1 }}>
                                  {institutionPrograms.length}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ fontSize: "0.70rem", opacity: 0.8, display: "block" }}
                          >
                            {selectedExplorerInstitutionId
                              ? `Linked to ${institutionNameById.get(String(selectedExplorerInstitutionId)) || "institution"}`
                              : "Select an institution to manage links"}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>

                  {/* Body */}
                  <Box sx={{ p: 1.8, display: "grid", gap: 1.4 }}>
                    {!selectedExplorerInstitutionId ? (
                      <EmptyState message="Select an institution to view and manage linked programs." dimmed />
                    ) : (
                      <>
                        {/* Add mapping row */}
                        <Box
                          sx={{
                            display: "grid",
                            gridTemplateColumns: { xs: "1fr", sm: "1fr auto" },
                            gap: 1,
                            alignItems: "center",
                            p: 1.4,
                            borderRadius: 2.5,
                            border: "1px solid",
                            borderColor: (theme) =>
                              theme.palette.mode === "dark" ? "rgba(255,255,255,0.07)" : alpha("#ec4899", 0.12),
                            bgcolor: (theme) =>
                              theme.palette.mode === "dark"
                                ? "rgba(255,255,255,0.02)"
                                : alpha("#ec4899", 0.03),
                          }}
                        >
                          <FormControl fullWidth size="small">
                            <InputLabel sx={{ fontSize: "0.82rem" }}>Add a Program</InputLabel>
                            <Select
                              value={explorerMappingProgramId}
                              label="Add a Program"
                              onChange={(event) => setExplorerMappingProgramId(String(event.target.value))}
                              sx={{ borderRadius: 2, fontSize: "0.85rem" }}
                            >
                              {availableProgramsForSelectedInstitution.length === 0 ? (
                                <MenuItem disabled value="">
                                  <Typography variant="caption" color="text.secondary">
                                    All programs already linked
                                  </Typography>
                                </MenuItem>
                              ) : (
                                availableProgramsForSelectedInstitution.map((program) => (
                                  <MenuItem key={program.id} value={String(program.id)}>
                                    {program.name}
                                  </MenuItem>
                                ))
                              )}
                            </Select>
                          </FormControl>
                          <Button
                            variant="contained"
                            startIcon={<Add sx={{ fontSize: 15 }} />}
                            onClick={handleAddExplorerMapping}
                            disabled={!explorerMappingProgramId || submitting}
                            sx={{
                              borderRadius: 2,
                              textTransform: "none",
                              fontWeight: 700,
                              fontSize: "0.82rem",
                              height: 40,
                              px: 2,
                              background: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)",
                              boxShadow: "0 2px 8px rgba(236,72,153,0.25)",
                              whiteSpace: "nowrap",
                              transition: "all 0.2s ease",
                              "&:hover": {
                                boxShadow: "0 4px 14px rgba(236,72,153,0.4)",
                                transform: "translateY(-1px)",
                              },
                              "&:disabled": { background: "rgba(0,0,0,0.12)" },
                            }}
                          >
                            Link
                          </Button>
                        </Box>

                        {/* Linked programs list */}
                        <Box sx={{ display: "grid", gap: 0.85 }}>
                          {mappingLoading ? (
                            [...Array(2)].map((_, index) => (
                              <Skeleton key={`mapping-skeleton-${index}`} variant="rounded" height={56} sx={{ borderRadius: 2 }} />
                            ))
                          ) : institutionPrograms.length === 0 ? (
                            <EmptyState message="No programs are linked to this institution yet." />
                          ) : (
                            institutionPrograms.map((program) => {
                              const resolvedProgramId = program.id || program.program_id;
                              const resolvedProgram = programById.get(String(resolvedProgramId));

                              return (
                                <Box
                                  key={`mapped-program-${resolvedProgramId}`}
                                  sx={{
                                    pl: 1.6,
                                    pr: 1.35,
                                    py: 1.2,
                                    borderRadius: 2,
                                    border: "1px solid",
                                    borderColor: alpha("#ec4899", 0.2),
                                    bgcolor: (theme) =>
                                      theme.palette.mode === "dark"
                                        ? "rgba(255,255,255,0.02)"
                                        : alpha("#ec4899", 0.03),
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    gap: 1,
                                    position: "relative",
                                    overflow: "hidden",
                                    transition: "all 0.18s ease",
                                    "&:hover": {
                                      borderColor: alpha("#ec4899", 0.4),
                                      bgcolor: alpha("#ec4899", 0.06),
                                      transform: "translateY(-1px)",
                                      boxShadow: `0 3px 12px ${alpha("#ec4899", 0.1)}`,
                                    },
                                  }}
                                >
                                  {/* Left stripe */}
                                  <Box
                                    sx={{
                                      position: "absolute",
                                      left: 0,
                                      top: 0,
                                      bottom: 0,
                                      width: 3,
                                      borderRadius: "2px 0 0 2px",
                                      background: `linear-gradient(180deg, #ec4899 0%, ${alpha("#ec4899", 0.5)} 100%)`,
                                    }}
                                  />
                                  <Box>
                                    <Typography variant="body2" fontWeight={700} sx={{ fontSize: "0.84rem", color: "#ec4899" }}>
                                      {program.name || resolvedProgram?.name || "—"}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.70rem", opacity: 0.75 }}>
                                      {domainNameById.get(String(resolvedProgram?.domain_id || resolvedProgram?.domainId)) || "Program mapping"}
                                    </Typography>
                                  </Box>
                                  <ActionButton
                                    icon={Delete}
                                    label="Remove mapping"
                                    color="error"
                                    disabled={submitting}
                                    onClick={() => handleRemoveExplorerMapping(resolvedProgramId)}
                                  />
                                </Box>
                              );
                            })
                          )}
                        </Box>
                      </>
                    )}
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      );


    if (activeTab === TAB_KEYS.INSTITUTION_TYPES)
      return renderCrudTable(TAB_KEYS.INSTITUTION_TYPES, institutionTypes, [{ key: "name", label: "Name" }]);

    if (activeTab === TAB_KEYS.DOMAINS)
      return renderCrudTable(TAB_KEYS.DOMAINS, domains, [{ key: "name", label: "Name" }]);

    if (activeTab === TAB_KEYS.PROGRAMS)
      return renderCrudTable(TAB_KEYS.PROGRAMS, programs, [
        { key: "name", label: "Program" },
        { key: "domain_id", label: "Domain", render: (row) => row.domain_name || domainNameById.get(String(row.domain_id || row.domainId)) || "-" },
      ]);

    if (activeTab === TAB_KEYS.LEVELS)
      return renderCrudTable(TAB_KEYS.LEVELS, levels, [
        { key: "name", label: "Level" },
        { key: "program_id", label: "Program", render: (row) => programNameById.get(String(row.program_id || row.programId)) || "-" },
        {
          key: "domain_name",
          label: "Domain",
          render: (row) => {
            const program = programById.get(String(row.program_id || row.programId));
            return domainNameById.get(String(program?.domain_id || program?.domainId)) || "-";
          },
        },
        { key: "sort_order", label: "Order", render: (row) => row.sort_order || row.sortOrder || "-" },
      ]);

    if (activeTab === TAB_KEYS.SEMESTERS)
      return renderCrudTable(TAB_KEYS.SEMESTERS, semesters, [
        { key: "name", label: "Semester" },
        { key: "level_id", label: "Level", render: (row) => levelNameById.get(String(row.level_id || row.levelId)) || "-" },
        {
          key: "program_id",
          label: "Program",
          render: (row) => {
            const level = levelById.get(String(row.level_id || row.levelId));
            return programNameById.get(String(level?.program_id || level?.programId)) || "-";
          },
        },
        { key: "sort_order", label: "Order", render: (row) => row.sort_order || row.sortOrder || "-" },
      ]);

    if (activeTab === TAB_KEYS.MODULES)
      return renderCrudTable(TAB_KEYS.MODULES, modules, [
        { key: "title", label: "Module" },
        { key: "code", label: "Code" },
        { key: "semester_id", label: "Semester", render: (row) => semesterNameById.get(String(row.semester_id || row.semesterId)) || "-" },
        {
          key: "level_id",
          label: "Level",
          render: (row) => {
            const semester = semesterById.get(String(row.semester_id || row.semesterId));
            return levelNameById.get(String(semester?.level_id || semester?.levelId)) || "-";
          },
        },
        {
          key: "program_id",
          label: "Program",
          render: (row) => {
            const semester = semesterById.get(String(row.semester_id || row.semesterId));
            const level = levelById.get(String(semester?.level_id || semester?.levelId));
            return programNameById.get(String(level?.program_id || level?.programId)) || "-";
          },
        },
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
               disabled={!selectedMappingInstitutionId || !selectedMappingProgramId || submitting || mappingLoading}
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
          {selectedMappingInstitutionId && (
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
                {institutionNameById.get(String(selectedMappingInstitutionId)) || "Selected Institution"} — Mapped Programs
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
                  ) : !selectedMappingInstitutionId ? (
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
                            <Typography variant="body2" fontWeight={600}>{program.institution_name || institutionNameById.get(String(selectedMappingInstitutionId)) || "—"}</Typography>
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

    if (dialogType === TAB_KEYS.LEVELS) {
      return (
        <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
          <TextField
            size="small"
            fullWidth
            label="Level Name"
            {...register("name", { required: "Level name is required" })}
            placeholder="e.g. First Year"
            error={!!formErrors.name}
            helperText={formErrors.name?.message || "Name displayed in the academic path"}
            InputLabelProps={{ shrink: true }}
            sx={{ ...fieldSx, gridColumn: { xs: "1 / -1", sm: "1 / 2" } }}
          />
          <Controller
            name="program_id"
            control={control}
            rules={{ required: "Program is required" }}
            render={({ field }) => (
              <FormControl fullWidth size="small" sx={{ gridColumn: { xs: "1 / -1", sm: "2 / 3" } }} error={!!formErrors.program_id}>
                <InputLabel>Program</InputLabel>
                <Select {...field} label="Program" sx={{ borderRadius: 2 }}>
                  {programs.map((program) => (
                    <MenuItem key={program.id} value={String(program.id)}>{program.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />
          <TextField
            size="small"
            fullWidth
            type="number"
            label="Sort Order"
            {...register("sort_order", {
              required: "Sort order is required",
              validate: (value) => Number(value) > 0 || "Sort order must be greater than 0",
            })}
            error={!!formErrors.sort_order}
            helperText={formErrors.sort_order?.message || "Controls level order within the selected program"}
            InputLabelProps={{ shrink: true }}
            sx={{ ...fieldSx, gridColumn: "1 / -1" }}
          />
        </Box>
      );
    }

    if (dialogType === TAB_KEYS.SEMESTERS) {
      return (
        <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
          <TextField
            size="small"
            fullWidth
            label="Semester Name"
            {...register("name", { required: "Semester name is required" })}
            placeholder="e.g. Semester 1"
            error={!!formErrors.name}
            helperText={formErrors.name?.message || "Name displayed in the academic path"}
            InputLabelProps={{ shrink: true }}
            sx={{ ...fieldSx, gridColumn: { xs: "1 / -1", sm: "1 / 2" } }}
          />
          <Controller
            name="level_id"
            control={control}
            rules={{ required: "Level is required" }}
            render={({ field }) => (
              <FormControl fullWidth size="small" sx={{ gridColumn: { xs: "1 / -1", sm: "2 / 3" } }} error={!!formErrors.level_id}>
                <InputLabel>Level</InputLabel>
                <Select {...field} label="Level" sx={{ borderRadius: 2 }}>
                  {levels.map((level) => (
                    <MenuItem key={level.id} value={String(level.id)}>
                      {level.name} · {programNameById.get(String(level.program_id || level.programId)) || "Program"}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />
          <TextField
            size="small"
            fullWidth
            type="number"
            label="Sort Order"
            {...register("sort_order", {
              required: "Sort order is required",
              validate: (value) => Number(value) > 0 || "Sort order must be greater than 0",
            })}
            error={!!formErrors.sort_order}
            helperText={formErrors.sort_order?.message || "Controls semester order within the selected level"}
            InputLabelProps={{ shrink: true }}
            sx={{ ...fieldSx, gridColumn: "1 / -1" }}
          />
        </Box>
      );
    }

    if (dialogType === TAB_KEYS.MODULES) {
      return (
        <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
          <TextField
            size="small"
            fullWidth
            label="Module Code"
            {...register("code", { required: "Module code is required" })}
            placeholder="e.g. ALG101"
            error={!!formErrors.code}
            helperText={formErrors.code?.message || "Short code used by students and staff"}
            InputLabelProps={{ shrink: true }}
            sx={fieldSx}
          />
          <Controller
            name="semester_id"
            control={control}
            rules={{ required: "Semester is required" }}
            render={({ field }) => (
              <FormControl fullWidth size="small" error={!!formErrors.semester_id}>
                <InputLabel>Semester</InputLabel>
                <Select {...field} label="Semester" sx={{ borderRadius: 2 }}>
                  {semesters.map((semester) => {
                    const level = levelById.get(String(semester.level_id || semester.levelId));
                    return (
                      <MenuItem key={semester.id} value={String(semester.id)}>
                        {semester.name} · {level?.name || "Level"}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            )}
          />
          <TextField
            size="small"
            fullWidth
            label="Module Title"
            {...register("title", { required: "Module title is required" })}
            placeholder="e.g. Algorithms and Complexity"
            error={!!formErrors.title}
            helperText={formErrors.title?.message || "Full academic title of the module"}
            InputLabelProps={{ shrink: true }}
            sx={{ ...fieldSx, gridColumn: "1 / -1" }}
          />
          <TextField
            size="small"
            fullWidth
            multiline
            minRows={3}
            label="Description"
            {...register("description")}
            placeholder="Optional notes about the module scope"
            InputLabelProps={{ shrink: true }}
            sx={{ ...fieldSx, gridColumn: "1 / -1" }}
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
    [TAB_KEYS.LEVELS]:            { title: "Level",            subtitle: "Create or update a level within a program",                  color: "#14b8a6" },
    [TAB_KEYS.SEMESTERS]:         { title: "Semester",         subtitle: "Create or update a semester within a level",                color: "#f97316" },
    [TAB_KEYS.MODULES]:           { title: "Module",           subtitle: "Create or update a teaching module within a semester",      color: "#eab308" },
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
      [TAB_KEYS.LEVELS]:            { label: t("pages.catalog.addLevel"),            onClick: () => openCreateDialog(TAB_KEYS.LEVELS) },
      [TAB_KEYS.SEMESTERS]:         { label: t("pages.catalog.addSemester"),         onClick: () => openCreateDialog(TAB_KEYS.SEMESTERS) },
      [TAB_KEYS.MODULES]:           { label: t("pages.catalog.addModule"),           onClick: () => openCreateDialog(TAB_KEYS.MODULES) },
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

      {/* Stats row */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2,1fr)", md: "repeat(4,1fr)" }, gap: 1.5, mb: 2.5 }}>
        <StatCard label="Institution Types" count={institutionTypes.length} icon={Category}    color="#7c5cfc" loading={loading} />
        <StatCard label="Domains"           count={domains.length}          icon={AccountTree}  color="#3b82f6" loading={loading} />
        <StatCard label="Programs"          count={programs.length}         icon={School}       color="#10b981" loading={loading} />
        <StatCard label="Levels"            count={levels.length}           icon={Layers}       color="#14b8a6" loading={loading} />
        <StatCard label="Semesters"         count={semesters.length}        icon={CalendarMonth} color="#f97316" loading={loading} />
        <StatCard label="Modules"           count={modules.length}          icon={MenuBook}     color="#eab308" loading={loading} />
        <StatCard label="Institutions"      count={institutions.length}     icon={Apartment}    color="#f59e0b" loading={loading} />
        <StatCard label="Institution Links" count={institutionPrograms.length} icon={Link}       color="#ec4899" loading={mappingLoading && Boolean(activeMappingInstitutionId)} />
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
      {activeTab !== TAB_KEYS.MAPPING && activeTab !== TAB_KEYS.HIERARCHY_EXPLORER && (
        <Box sx={{ mb: 2 }}>
          <TextField
            size="small"
            placeholder="Search…"
            value={search}
            onChange={(e) => {
              const nextValue = e.target.value;
              startSearchTransition(() => {
                setSearch(nextValue);
              });
            }}
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
          {isSearchPending ? (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.8, display: "block" }}>
              Filtering...
            </Typography>
          ) : null}
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

      <ConfirmDialog
        open={confirmState.open}
        onClose={closeConfirmDialog}
        onConfirm={handleConfirmAction}
        title={confirmState.title}
        message={confirmState.message}
        details={confirmState.details}
        confirmLabel={confirmState.confirmLabel}
        severity={confirmState.severity}
        loading={submitting}
      />
    </Box>
  );
};

export default CatalogManagement;
