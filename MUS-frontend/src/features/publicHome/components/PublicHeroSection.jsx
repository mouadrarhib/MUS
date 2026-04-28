// src/features/publicHome/components/PublicHeroSection.jsx
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from 'framer-motion';
import { alpha, Box, Button, Chip, Stack, Typography } from '@mui/material';
import { ArrowForward, AutoStories, School, Search } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/app/providers/LanguageContext';
import { useAuth } from '@/features/auth/context/AuthContext';
import PublicAuthPromptDialog from '@/features/publicHome/components/PublicAuthPromptDialog';
import heroIllustration from '@/assets/images/hero.png';

const POPULAR_SEARCHES = ['Mathematics', 'Physics', 'Data Science', 'History', 'Programming'];

// ─── Animation variants (staggered entry) ────────────────────────────────────
const makeContainerVariants = (reduced) =>
  reduced ? { show: {} } : { hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: 0.04 } } };

const makeItemVariants = (reduced) =>
  reduced
    ? { hidden: { opacity: 1, y: 0 }, show: { opacity: 1, y: 0 } }
    : { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { type: 'spring', damping: 28, stiffness: 175 } } };

const makeImageVariants = (reduced) =>
  reduced
    ? { hidden: { opacity: 1, scale: 1 }, show: { opacity: 1, scale: 1 } }
    : { hidden: { opacity: 0, scale: 0.96 }, show: { opacity: 1, scale: 1, transition: { type: 'spring', damping: 22, stiffness: 110, delay: 0.18 } } };

// ─── HeroSearchBar (isolated state — no lag on typing) ───────────────────────
const HeroSearchBar = memo(({ onSearch, onPopularSearch, t }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = useCallback(
    (e) => { e?.preventDefault(); onSearch(query.trim()); },
    [onSearch, query],
  );

  return (
    <>
      <Box
        component="form"
        onSubmit={handleSubmit}
        role="search"
        sx={(t) => ({
          display: 'flex', alignItems: 'center',
          borderRadius: '14px',
          border: '1.5px solid',
          borderColor: alpha(t.palette.primary.main, 0.22),
          bgcolor: 'background.paper',
          boxShadow: t.palette.mode === 'dark'
            ? `0 0 0 4px ${alpha(t.palette.primary.main, 0.06)}, 0 4px 24px rgba(0,0,0,0.35)`
            : `0 0 0 4px ${alpha(t.palette.primary.main, 0.07)}, 0 4px 24px rgba(0,0,0,0.08)`,
          transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
          '&:focus-within': {
            borderColor: 'primary.main',
            boxShadow: t.palette.mode === 'dark'
              ? `0 0 0 4px ${alpha(t.palette.primary.main, 0.12)}, 0 4px 24px rgba(0,0,0,0.4)`
              : `0 0 0 4px ${alpha(t.palette.primary.main, 0.1)}, 0 4px 24px rgba(0,0,0,0.1)`,
          },
        })}
      >
        <Search sx={{ ml: 2, mr: 1, fontSize: 22, color: 'text.disabled', flexShrink: 0 }} />
        <Box
          component="input"
          type="search"
          aria-label={t('publicHome.hero.searchPlaceholder', 'Search for courses, quizzes, or documents')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSearch(query.trim())}
          placeholder={t('publicHome.hero.searchPlaceholder', 'Search for courses, quizzes, or documents')}
          sx={{
            flex: 1, border: 0, outline: 'none', bgcolor: 'transparent',
            color: 'text.primary',
            fontSize: { xs: '0.9375rem', md: '1rem' },
            lineHeight: 1.4, fontFamily: 'inherit',
            py: { xs: 1.5, md: 1.75 }, pr: 1,
            '&::placeholder': { color: 'text.disabled', opacity: 1 },
            '&::-webkit-search-cancel-button': { display: 'none' },
          }}
        />
        <motion.div
          whileHover={{ scale: 1.03, y: -1 }}
          whileTap={{ scale: 0.97, y: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          style={{ margin: 6, flexShrink: 0 }}
        >
          <Button
            type="submit"
            variant="contained"
            disableElevation
            endIcon={<ArrowForward sx={{ fontSize: '16px !important' }} />}
            sx={{
              borderRadius: '10px',
              px: { xs: 2, sm: 2.5 }, py: { xs: 1.1, md: 1.25 },
              textTransform: 'none', fontWeight: 700,
              fontSize: { xs: '0.875rem', md: '0.9375rem' },
              whiteSpace: 'nowrap',
            }}
          >
            {t('publicHome.hero.searchAction', 'Search')}
          </Button>
        </motion.div>
      </Box>

      <Stack direction="row" flexWrap="wrap" spacing={1} useFlexGap sx={{ mt: 2 }}>
        <Typography variant="caption" color="text.disabled"
          sx={{ alignSelf: 'center', fontSize: '0.75rem' }}>
          {t('publicHome.hero.popularLabel', 'Popular:')}
        </Typography>
        {POPULAR_SEARCHES.map((term) => (
          <Chip
            key={term}
            label={term}
            size="small"
            onClick={() => onPopularSearch(term)}
            sx={(t) => ({
              height: 24, fontSize: '0.72rem', fontWeight: 600,
              cursor: 'pointer', borderRadius: '8px',
              bgcolor: t.palette.mode === 'dark'
                ? alpha(t.palette.common.white, 0.06)
                : alpha(t.palette.common.black, 0.05),
              color: 'text.secondary',
              border: '1px solid', borderColor: 'divider',
              '&:hover': {
                bgcolor: alpha(t.palette.primary.main, 0.09),
                color: 'primary.main',
                borderColor: alpha(t.palette.primary.main, 0.3),
                transform: 'translateY(-1px)',
              },
              '&:active': { transform: 'translateY(0)' },
              '& .MuiChip-label': { px: 1 },
              transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
            })}
          />
        ))}
      </Stack>
    </>
  );
});
HeroSearchBar.displayName = 'HeroSearchBar';

// ─── PublicHeroSection ────────────────────────────────────────────────────────
const PublicHeroSection = memo(() => {
  const { t }               = useLanguage();
  const navigate            = useNavigate();
  const { isAuthenticated } = useAuth();
  const reduced             = useReducedMotion();
  const sectionRef          = useRef(null);

  const [authPromptOpen, setAuthPromptOpen] = useState(false);
  const [pendingQuery, setPendingQuery]       = useState('');
  const [isHovering, setIsHovering]           = useState(false);
  const [size, setSize]                       = useState({ w: 1200, h: 600 });

  // Measure section for coordinate normalization
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || reduced) return;
    const ro = new ResizeObserver(([entry]) => {
      setSize({ w: entry.contentRect.width, h: entry.contentRect.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [reduced]);

  // Raw mouse position (no re-renders — motion values only)
  const mouseX = useMotionValue(size.w / 2);
  const mouseY = useMotionValue(size.h / 2);

  // Spotlight: fast spring so it feels like it's chasing the cursor
  const spotX = useSpring(mouseX, { damping: 22, stiffness: 180, mass: 0.4 });
  const spotY = useSpring(mouseY, { damping: 22, stiffness: 180, mass: 0.4 });

  // Tilt: slower spring for heavier, physical feel on the illustration
  const tiltX = useSpring(mouseX, { damping: 32, stiffness: 100, mass: 0.9 });
  const tiltY = useSpring(mouseY, { damping: 32, stiffness: 100, mass: 0.9 });

  // Map mouse position → rotation degrees (±8° X, ±5° Y)
  const rotateY = useTransform(tiltX, [0, size.w], [-8, 8]);
  const rotateX = useTransform(tiltY, [0, size.h], [5, -5]);

  const handleMouseMove = useCallback(
    (e) => {
      if (reduced) return;
      const rect = sectionRef.current?.getBoundingClientRect();
      if (!rect) return;
      mouseX.set(e.clientX - rect.left);
      mouseY.set(e.clientY - rect.top);
    },
    [mouseX, mouseY, reduced],
  );

  const handleMouseEnter = useCallback(() => { if (!reduced) setIsHovering(true); }, [reduced]);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    // Spring illustration back to flat
    mouseX.set(size.w / 2);
    mouseY.set(size.h / 2);
  }, [mouseX, mouseY, size]);

  // Entry animation variants
  const containerVariants = makeContainerVariants(reduced);
  const itemVariants      = makeItemVariants(reduced);
  const imageVariants     = makeImageVariants(reduced);

  // Auth helpers
  const buildSearch = useCallback(
    (q) => (q ? `/discover?q=${encodeURIComponent(q)}` : '/discover'),
    [],
  );
  const handleSearch = useCallback(
    (query) => {
      if (isAuthenticated) { navigate(buildSearch(query)); return; }
      setPendingQuery(query);
      setAuthPromptOpen(true);
    },
    [isAuthenticated, navigate, buildSearch],
  );
  const navigateToAuth = useCallback(
    (mode) => {
      navigate(mode === 'register' ? '/register' : '/login', {
        state: { from: { pathname: '/discover', search: pendingQuery ? `?q=${encodeURIComponent(pendingQuery)}` : '' } },
      });
      setAuthPromptOpen(false);
    },
    [navigate, pendingQuery],
  );

  return (
    <Box
      ref={sectionRef}
      component="section"
      aria-label="Hero"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      sx={(t) => ({
        position: 'relative',
        overflow: 'hidden',
        px: { xs: 2, sm: 4, md: 6, lg: 8 },
        pt: { xs: 6, sm: 8, md: 10 },
        pb: { xs: 5, sm: 7, md: 9 },
        backgroundImage: t.palette.mode === 'dark'
          ? `radial-gradient(circle, ${alpha(t.palette.primary.main, 0.07)} 1px, transparent 1px)`
          : `radial-gradient(circle, ${alpha(t.palette.primary.main, 0.06)} 1px, transparent 1px)`,
        backgroundSize: '28px 28px',
        bgcolor: 'background.default',
      })}
    >
      {/* ── Mouse-following spotlight (two-layer depth) ── */}
      {!reduced && (
        <>
          {/* Outer ambient glow — large, very soft */}
          <motion.div
            aria-hidden="true"
            animate={{ opacity: isHovering ? 1 : 0 }}
            transition={{ duration: 0.4 }}
            style={{
              position: 'absolute',
              left: spotX,
              top: spotY,
              x: '-50%',
              y: '-50%',
              width: 700,
              height: 700,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(var(--spot-color), 0.07) 0%, transparent 70%)',
              pointerEvents: 'none',
              zIndex: 0,
              // CSS variable trick so the color adapts to dark/light via the component's sx
            }}
            sx={(t) => ({
              '--spot-color': t.palette.mode === 'dark' ? '79,152,163' : '1,105,111',
              background: `radial-gradient(circle, ${alpha(t.palette.primary.main, t.palette.mode === 'dark' ? 0.12 : 0.07)} 0%, transparent 70%)`,
            })}
          />
          {/* Inner focused glow — smaller, slightly stronger */}
          <motion.div
            aria-hidden="true"
            animate={{ opacity: isHovering ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'absolute',
              left: spotX,
              top: spotY,
              x: '-50%',
              y: '-50%',
              width: 280,
              height: 280,
              borderRadius: '50%',
              pointerEvents: 'none',
              zIndex: 0,
            }}
            sx={(t) => ({
              background: `radial-gradient(circle, ${alpha(t.palette.primary.main, t.palette.mode === 'dark' ? 0.16 : 0.09)} 0%, transparent 70%)`,
            })}
          />
        </>
      )}

      {/* ── Content grid ── */}
      <Box
        sx={{
          position: 'relative', zIndex: 1,
          maxWidth: 1200, mx: 'auto',
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          alignItems: 'center',
          gap: { xs: 5, md: 6 },
        }}
      >
        {/* Left: staggered entry */}
        <motion.div variants={containerVariants} initial="hidden" animate="show">
          {/* Badge */}
          <motion.div variants={itemVariants}>
            <Box sx={(t) => ({
              display: 'inline-flex', alignItems: 'center', gap: 0.75,
              px: 1.5, py: 0.6, mb: 3, borderRadius: '99px',
              border: '1px solid', borderColor: alpha(t.palette.primary.main, 0.25),
              bgcolor: alpha(t.palette.primary.main, 0.06),
              color: 'primary.main',
            })}>
              <School sx={{ fontSize: 14 }} />
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: 0.4 }}>
                {t('publicHome.hero.badge', 'Built for students, by students')}
              </Typography>
            </Box>
          </motion.div>

          {/* Heading */}
          <motion.div variants={itemVariants}>
            <Typography
              component="h1"
              sx={{
                fontWeight: 900, letterSpacing: -1.5, lineHeight: 1.07,
                fontSize: { xs: '2.5rem', sm: '3.25rem', md: '3.75rem' },
                mb: 2.5, color: 'text.primary',
              }}
            >
              {t('publicHome.hero.titleLineOne', 'Grow smarter')}{' '}
              <Box component="span" sx={{
                color: 'primary.main',
                position: 'relative',
                display: 'inline-block',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: '2px', left: 0,
                  height: '3px', width: '100%',
                  bgcolor: 'primary.main',
                  borderRadius: '2px',
                  transformOrigin: 'left center',
                  transform: 'scaleX(0)',
                  animation: 'underline-sweep 0.55s cubic-bezier(0.16, 1, 0.3, 1) 0.52s forwards',
                },
                '@keyframes underline-sweep': {
                  from: { transform: 'scaleX(0)' },
                  to:   { transform: 'scaleX(1)' },
                },
                '@media (prefers-reduced-motion: reduce)': {
                  '&::after': { animation: 'none', transform: 'scaleX(1)' },
                },
              }}>
                {t('publicHome.hero.titleLineTwo', 'together')}
              </Box>
            </Typography>
          </motion.div>

          {/* Subtitle */}
          <motion.div variants={itemVariants}>
            <Typography sx={{
              fontSize: { xs: '1rem', md: '1.125rem' },
              color: 'text.secondary', lineHeight: 1.7, mb: 4, maxWidth: '52ch',
            }}>
              {t('publicHome.hero.subtitle', 'Find top-rated study notes from students taking the same courses as you.')}
            </Typography>
          </motion.div>

          {/* Search bar */}
          <motion.div variants={itemVariants}>
            <HeroSearchBar
              onSearch={handleSearch}
              onPopularSearch={handleSearch}
              t={t}
            />
          </motion.div>

          {/* Social proof */}
          <motion.div variants={itemVariants}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 4 }}>
              <Box sx={(t) => ({
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 32, height: 32, borderRadius: '8px',
                bgcolor: alpha(t.palette.primary.main, 0.1), color: 'primary.main',
              })}>
                <AutoStories sx={{ fontSize: 16 }} />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                {t('publicHome.hero.socialProof', '10,000+ resources shared by students across Morocco')}
              </Typography>
            </Stack>
          </motion.div>
        </motion.div>

        {/* Right: illustration with 3D tilt */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', justifyContent: 'center' }}>
          <motion.div
            variants={imageVariants}
            initial="hidden"
            animate="show"
            style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
          >
            {/* 3D tilt wrapper — perspective applied directly */}
            <motion.div
              style={{
                rotateX: reduced ? 0 : rotateX,
                rotateY: reduced ? 0 : rotateY,
                transformPerspective: 900,
              }}
              transition={{ type: 'spring', damping: 30, stiffness: 100 }}
            >
              <Box
                component="img"
                src={heroIllustration}
                alt="Students sharing study resources"
                width={520}
                height={420}
                loading="eager"
                decoding="async"
                sx={{
                  width: '100%', maxWidth: 520, height: 'auto',
                  objectFit: 'contain',
                  userSelect: 'none', pointerEvents: 'none',
                  // Subtle drop-shadow that shifts with the tilt
                  filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.12))',
                  transition: 'filter 0.3s ease',
                }}
              />
            </motion.div>
          </motion.div>
        </Box>
      </Box>

      <PublicAuthPromptDialog
        open={authPromptOpen}
        onClose={() => setAuthPromptOpen(false)}
        onRegister={() => navigateToAuth('register')}
        onLogin={() => navigateToAuth('login')}
        title={t('publicHome.hero.authRequired.title', 'Sign in required')}
        description={t('publicHome.hero.authRequired.description', 'To search and access resources, please sign in first. You can also create a new account.')}
        cancelLabel={t('common.cancel', 'Cancel')}
        registerLabel={t('publicHome.hero.register', 'Register')}
        loginLabel={t('publicHome.hero.signIn', 'Sign in')}
      />
    </Box>
  );
});

PublicHeroSection.displayName = 'PublicHeroSection';
export default PublicHeroSection;