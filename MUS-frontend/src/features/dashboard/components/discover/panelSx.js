export const panelSx = (theme) => ({
  borderRadius: `${theme.shape.xl}px`,
  border: '1px solid',
  borderColor: 'var(--border)',
  background:
    theme.palette.mode === 'dark'
      ? 'linear-gradient(155deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 100%)'
      : 'linear-gradient(155deg, rgba(255,255,255,0.92) 0%, rgba(248,249,255,0.95) 100%)',
  boxShadow:
    theme.palette.mode === 'dark'
      ? '0 2px 14px rgba(0,0,0,0.25)'
      : '0 3px 16px rgba(20,20,60,0.05)',
  overflow: 'hidden',
  position: 'relative',
});
