import { memo } from 'react';
import PropTypes from 'prop-types';
import { motion, useSpring, useTransform } from 'framer-motion';
import { alpha, Box } from '@mui/material';
import { AutoStories } from '@mui/icons-material';

const PublicHomeCursorFollower = memo(({ mouseX, mouseY, isVisible, reduced }) => {
  const followX = useSpring(mouseX, { damping: 24, stiffness: 210, mass: 0.42 });
  const followY = useSpring(mouseY, { damping: 24, stiffness: 210, mass: 0.42 });
  const rotate = useTransform(followX, [0, 1600], [-12, 12]);

  if (reduced) return null;

  return (
    <motion.div
      aria-hidden="true"
      animate={{ opacity: isVisible ? 0.95 : 0, scale: isVisible ? 1 : 0.85 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: 'fixed',
        left: followX,
        top: followY,
        x: '-50%',
        y: '-50%',
        rotate,
        zIndex: 40,
        pointerEvents: 'none',
      }}
    >
      <Box
        sx={(t) => ({
          display: { xs: 'none', md: 'flex' },
          alignItems: 'center',
          justifyContent: 'center',
          width: 50,
          height: 50,
          borderRadius: '14px',
          backdropFilter: 'blur(8px)',
          border: '1px solid',
          borderColor: alpha(t.palette.primary.main, 0.28),
          bgcolor: t.palette.mode === 'dark'
            ? alpha(t.palette.background.paper, 0.56)
            : 'rgba(255,255,255,0.72)',
          boxShadow: `0 8px 24px ${alpha(t.palette.primary.main, 0.2)}`,
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: -5,
            borderRadius: '18px',
            border: `1px solid ${alpha(t.palette.primary.main, 0.2)}`,
            opacity: 0.8,
          },
        })}
      >
        <AutoStories sx={{ fontSize: 19, color: 'primary.main' }} />
      </Box>
    </motion.div>
  );
});

PublicHomeCursorFollower.displayName = 'PublicHomeCursorFollower';

PublicHomeCursorFollower.propTypes = {
  mouseX: PropTypes.object.isRequired,
  mouseY: PropTypes.object.isRequired,
  isVisible: PropTypes.bool.isRequired,
  reduced: PropTypes.bool.isRequired,
};

export default PublicHomeCursorFollower;
