export const panelSx = (theme) => ({
  borderRadius: 3.5,
  border: '1px solid',
  borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)',
  background:
    theme.palette.mode === 'dark'
      ? 'linear-gradient(155deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 100%)'
      : 'linear-gradient(155deg, rgba(255,255,255,0.92) 0%, rgba(248,249,255,0.95) 100%)',
  backdropFilter: 'blur(10px)',
  boxShadow:
    theme.palette.mode === 'dark'
      ? '0 2px 20px rgba(0,0,0,0.3)'
      : '0 4px 24px rgba(20,20,60,0.06)',
  overflow: 'hidden',
  position: 'relative',
});
