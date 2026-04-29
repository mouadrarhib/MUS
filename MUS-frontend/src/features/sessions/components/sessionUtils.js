export const statusColor = {
  confirmed: "success",
  cancelled: "default",
  completed: "secondary",
  no_show: "warning",
};

export const statusLabel = {
  confirmed: "Confirmed",
  cancelled: "Cancelled",
  completed: "Completed",
  no_show: "No show",
};

export const formatDate = (value) => {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleString();
};

export const toInputDateTime = (value) => {
  const d = value ? new Date(value) : new Date(Date.now() + 3600_000);
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
};
