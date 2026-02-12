const prefersReducedMotion = '@media (prefers-reduced-motion: reduce)';

export const pageTransitionSx = (theme) => ({
  animation: `fadeIn ${theme.transitions.duration.standard}ms ${theme.transitions.easing.easeInOut}`,
  [prefersReducedMotion]: {
    animation: 'none',
  },
});

export const cardEnterSx = (theme) => ({
  animation: `slideUp ${theme.transitions.duration.standard}ms ${theme.transitions.easing.easeOut}`,
  animationFillMode: 'both',
  animationDelay: 'calc(var(--stagger-index, 0) * 80ms)',
  [prefersReducedMotion]: {
    animation: 'none',
  },
});

export const staggerContainerSx = (theme) => ({
  '> *': {
    animation: `slideUp ${theme.transitions.duration.standard}ms ${theme.transitions.easing.easeOut}`,
    animationFillMode: 'both',
    animationDelay: 'calc(var(--stagger-index, 0) * 80ms)',
  },
  [prefersReducedMotion]: {
    '> *': {
      animation: 'none',
    },
  },
});
