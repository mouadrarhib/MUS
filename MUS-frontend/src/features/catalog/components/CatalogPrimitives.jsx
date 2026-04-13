import { Box, IconButton, Skeleton, Tooltip, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Add, Delete, Edit, InfoOutlined } from '@mui/icons-material';

export const BreadcrumbFlow = ({ steps }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 0.5,
      py: 1.4,
      px: 2,
      borderRadius: 2.5,
      border: '1px solid',
      borderColor: (theme) =>
        theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)',
      bgcolor: (theme) =>
        theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(248,250,255,0.85)',
    }}
  >
    {steps.map((step, index) => (
      <Box key={step.label} display="flex" alignItems="center" gap={0.5}>
        {index > 0 && (
          <Box
            sx={{
              width: 16,
              height: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'text.disabled',
              fontSize: '0.7rem',
              userSelect: 'none',
            }}
          >
            ›
          </Box>
        )}
        <Box
          onClick={step.onReset}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.6,
            px: 1.1,
            py: 0.4,
            borderRadius: 10,
            border: '1px solid',
            borderColor: step.active
              ? alpha(step.color, 0.45)
              : (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'),
            bgcolor: step.active ? alpha(step.color, 0.1) : 'transparent',
            cursor: step.active && step.onReset ? 'pointer' : 'default',
            transition: 'all 0.18s ease',
            '&:hover':
              step.active && step.onReset
                ? {
                    bgcolor: alpha(step.color, 0.18),
                    borderColor: alpha(step.color, 0.6),
                  }
                : {},
          }}
        >
          {step.icon && (
            <step.icon
              sx={{
                fontSize: 11,
                color: step.active ? step.color : 'text.disabled',
                flexShrink: 0,
              }}
            />
          )}
          <Typography
            variant="caption"
            sx={{
              fontSize: '0.71rem',
              fontWeight: step.active ? 700 : 500,
              color: step.active ? step.color : 'text.disabled',
              whiteSpace: 'nowrap',
              lineHeight: 1,
            }}
          >
            {step.label}:{' '}
            <Box component="span" sx={{ fontWeight: step.value ? 800 : 500 }}>
              {step.value || '—'}
            </Box>
          </Typography>
        </Box>
      </Box>
    ))}
  </Box>
);

export const InterPanelConnector = ({ active, color }) => (
  <Box
    sx={{
      display: { xs: 'none', lg: 'flex' },
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'center',
      mt: '52px',
      flexShrink: 0,
    }}
  >
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0,
        opacity: active ? 1 : 0.22,
        transition: 'opacity 0.35s ease',
      }}
    >
      <Box
        sx={{
          width: 18,
          height: 2,
          borderRadius: 2,
          bgcolor: active ? color : 'text.disabled',
          transition: 'background 0.35s ease',
        }}
      />
      <Box
        sx={{
          width: 10,
          height: 10,
          borderRadius: '50%',
          border: '2px solid',
          borderColor: active ? color : 'text.disabled',
          bgcolor: (theme) => (active ? alpha(color, 0.25) : alpha(theme.palette.text.disabled, 0.12)),
          transition: 'all 0.35s ease',
        }}
      />
      <Box
        component="span"
        sx={{
          fontSize: '0.85rem',
          color: active ? color : 'text.disabled',
          lineHeight: 1,
          transition: 'color 0.35s ease',
          ml: '-1px',
        }}
      >
        ›
      </Box>
    </Box>
  </Box>
);

export const EmptyState = ({ message, dimmed = false }) => (
  <Box
    sx={{
      textAlign: 'center',
      py: 5,
      opacity: dimmed ? 0.45 : 1,
      transition: 'opacity 0.25s ease',
    }}
  >
    <Box
      sx={{
        width: 48,
        height: 48,
        borderRadius: '50%',
        bgcolor: (theme) => alpha(theme.palette.text.secondary, 0.06),
        border: '1px dashed',
        borderColor: (theme) => alpha(theme.palette.text.secondary, 0.15),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        mx: 'auto',
        mb: 1.2,
      }}
    >
      <InfoOutlined sx={{ fontSize: 22, color: 'text.secondary', opacity: 0.4 }} />
    </Box>
    <Typography
      variant="body2"
      color="text.secondary"
      sx={{ fontSize: '0.78rem', opacity: 0.65, maxWidth: 160, mx: 'auto', lineHeight: 1.5 }}
    >
      {message}
    </Typography>
  </Box>
);

export const ActionButton = ({ icon, label, color = 'primary', onClick, disabled }) => {
  const Icon = icon;
  return (
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
            border: '1px solid',
            borderColor: (theme) => alpha(theme.palette[color]?.main || color, 0.18),
            bgcolor: (theme) => alpha(theme.palette[color]?.main || color, 0.04),
            color: `${color}.main`,
            transition: 'all 0.18s ease',
            '&:hover': {
              borderColor: (theme) => alpha(theme.palette[color]?.main || color, 0.5),
              bgcolor: (theme) => alpha(theme.palette[color]?.main || color, 0.12),
              transform: 'scale(1.08)',
            },
          }}
        >
          <Icon sx={{ fontSize: 14 }} />
        </IconButton>
      </span>
    </Tooltip>
  );
};

export const HierarchyPanel = ({
  title,
  subtitle,
  icon,
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
}) => {
  const Icon = icon;
  return (
  <Box
    sx={{
      borderRadius: 3,
      border: '1px solid',
      borderColor: (theme) =>
        theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)',
      bgcolor: (theme) =>
        theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.025)' : 'rgba(255,255,255,0.92)',
      overflow: 'hidden',
      minHeight: 290,
      position: 'relative',
      transition: 'box-shadow 0.25s ease',
      '&:hover': {
        boxShadow: (theme) =>
          theme.palette.mode === 'dark'
            ? `0 0 0 1px ${alpha(color, 0.22)}, 0 8px 32px ${alpha(color, 0.08)}`
            : `0 0 0 1px ${alpha(color, 0.18)}, 0 8px 28px ${alpha(color, 0.07)}`,
      },
    }}
  >
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        background: `linear-gradient(90deg, ${color} 0%, ${alpha(color, 0.45)} 100%)`,
        opacity: disabled ? 0.3 : 1,
        transition: 'opacity 0.25s ease',
      }}
    />

    <Box
      sx={{
        px: 2,
        py: 1.5,
        pt: 2.2,
        borderBottom: '1px solid',
        borderColor: (theme) =>
          theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1,
      }}
    >
      <Box display="flex" gap={1} alignItems="center" sx={{ minWidth: 0, overflow: 'hidden' }}>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: 2,
            background: `linear-gradient(135deg, ${alpha(color, 0.18)} 0%, ${alpha(color, 0.08)} 100%)`,
            border: '1px solid',
            borderColor: alpha(color, 0.25),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: `0 2px 8px ${alpha(color, 0.12)}`,
          }}
        >
          <Icon sx={{ fontSize: 16, color }} />
        </Box>

        <Box sx={{ minWidth: 0, overflow: 'hidden' }}>
          <Box display="flex" alignItems="center" gap={0.6} sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2" fontWeight={800} noWrap sx={{ lineHeight: 1.2, fontSize: '0.82rem', minWidth: 0 }}>
              {title}
            </Typography>
            {!disabled && items.length > 0 && (
              <Box
                sx={{
                  px: 0.65,
                  py: 0.12,
                  borderRadius: 10,
                  bgcolor: alpha(color, 0.12),
                  border: '1px solid',
                  borderColor: alpha(color, 0.25),
                  lineHeight: 1,
                  flexShrink: 0,
                }}
              >
                <Typography sx={{ fontSize: '0.62rem', fontWeight: 800, color, lineHeight: 1 }}>{items.length}</Typography>
              </Box>
            )}
          </Box>
          <Typography variant="caption" color="text.secondary" noWrap sx={{ fontSize: '0.68rem', opacity: 0.75, display: 'block' }}>
            {subtitle}
          </Typography>
        </Box>
      </Box>

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
                background: disabled ? undefined : `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.8)} 100%)`,
                color: '#fff',
                boxShadow: disabled ? 'none' : `0 2px 8px ${alpha(color, 0.3)}`,
                transition: 'all 0.2s ease',
                '&:hover': {
                  boxShadow: `0 4px 14px ${alpha(color, 0.45)}`,
                  transform: 'translateY(-1px)',
                },
                '&.Mui-disabled': {
                  background: (theme) =>
                    theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                  color: 'text.disabled',
                },
              }}
            >
              <Add sx={{ fontSize: 15 }} />
            </IconButton>
          </span>
        </Tooltip>
      ) : null}
    </Box>

    <Box sx={{ p: 1.2, display: 'grid', gap: 0.85, maxHeight: 380, overflowY: 'auto' }}>
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
                border: '1px solid',
                borderColor: selected
                  ? alpha(color, 0.5)
                  : (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'),
                bgcolor: selected
                  ? alpha(color, 0.1)
                  : (theme) =>
                      theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.75)',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.18s ease',
                cursor: onSelect ? 'pointer' : 'default',
                '&:hover': {
                  borderColor: alpha(color, 0.38),
                  bgcolor: alpha(color, 0.07),
                  transform: 'translateY(-1px)',
                  boxShadow: `0 3px 12px ${alpha(color, 0.1)}`,
                },
              }}
            >
              {selected && (
                <Box
                  sx={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 3,
                    borderRadius: '2px 0 0 2px',
                    background: `linear-gradient(180deg, ${color} 0%, ${alpha(color, 0.55)} 100%)`,
                  }}
                />
              )}

              <Box display="flex" alignItems="flex-start" justifyContent="space-between" gap={1}>
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    variant="body2"
                    fontWeight={selected ? 800 : 700}
                    sx={{
                      fontSize: '0.84rem',
                      color: selected ? color : 'text.primary',
                      lineHeight: 1.3,
                    }}
                  >
                    {getPrimaryLabel(item)}
                  </Typography>
                  {getSecondaryLabel ? (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25, fontSize: '0.70rem', opacity: 0.75 }}>
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
};

export const StatCard = ({ label, count, icon, color, loading }) => {
  const Icon = icon;
  return (
  <Box
    sx={{
      p: 2,
      borderRadius: 2.5,
      border: '1px solid',
      borderColor: alpha(color, 0.2),
      bgcolor: alpha(color, 0.04),
      display: 'flex',
      alignItems: 'center',
      gap: 1.5,
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.22s ease',
      '&:hover': {
        borderColor: alpha(color, 0.4),
        bgcolor: alpha(color, 0.08),
        transform: 'translateY(-2px)',
        boxShadow: `0 6px 20px ${alpha(color, 0.12)}`,
      },
      '&::before': {
        content: '""',
        position: 'absolute',
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
        border: '1px solid',
        borderColor: alpha(color, 0.22),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
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
            fontSize: '1.18rem',
            color,
            '@keyframes countPulse': {
              '0%': { opacity: 0, transform: 'translateY(4px)' },
              '100%': { opacity: 1, transform: 'translateY(0)' },
            },
            animation: 'countPulse 0.4s ease forwards',
          }}
        >
          {count}
        </Typography>
      )}
      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.71rem', fontWeight: 600, opacity: 0.85 }}>
        {label}
      </Typography>
    </Box>
  </Box>
  );
};
