import { Box, Button, Paper, Stack, Typography, Accordion, AccordionSummary, AccordionDetails, Divider } from '@mui/material';
import { ArrowForward, ExpandMore, Star, TrendingUp, EmojiEvents, AttachMoney, LockOpen, AccountBalanceWallet } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import DiscoveryHeader from '@/features/discover/components/DiscoveryHeader';

import folderIcon from '@/assets/images/folderIcon.png';
import videoIcon from '@/assets/images/videoIcon.png';
import trophyIcon from '@/assets/images/trophyIcon.png';
import coinStack from '@/assets/images/coinStack.png';

const steps = [
  {
    num: 1,
    title: 'Share to Unlock',
    description: 'Post summaries, exercises, explanations',
    badgeText: 'Earn points â†’ unlock resources',
    badgeIcon: <Star sx={{ fontSize: 16 }} />,
    badgeColor: '#10B981', // green
    badgeBg: 'rgba(16, 185, 129, 0.08)',
    image: folderIcon,
  },
  {
    num: 2,
    title: 'Become a Creator',
    description: 'Upload lesson videos, help others learn',
    badgeText: 'The more you help, the more you grow',
    badgeIcon: <TrendingUp sx={{ fontSize: 16 }} />,
    badgeColor: '#3B82F6', // blue
    badgeBg: 'rgba(59, 130, 246, 0.08)',
    image: videoIcon,
  },
  {
    num: 3,
    title: 'Grow Your Rank',
    description: 'Earn points, increase visibility',
    badgeText: 'Top students become recognized creators',
    badgeIcon: <EmojiEvents sx={{ fontSize: 16 }} />, // crown approx
    badgeColor: '#F59E0B', // yellow/orange
    badgeBg: 'rgba(245, 158, 11, 0.08)',
    image: trophyIcon,
  },
  {
    num: 4,
    title: 'Start Earning',
    description: 'Offer consultations, premium content',
    badgeText: 'Turn knowledge into income',
    badgeIcon: <AttachMoney sx={{ fontSize: 16 }} />,
    badgeColor: '#8B5CF6', // purple
    badgeBg: 'rgba(139, 92, 246, 0.08)',
    image: coinStack,
  },
];

const faqs = [
  {
    q: "Do I need to fill out a separate application form?",
    a: "No! Any registered student can become a creator simply by navigating to their Settings and switching their Student Mode from Learner to Contributor."
  },
  {
    q: "Are my uploaded resources published immediately?",
    a: "To maintain platform quality, all uploaded resources are put into a 'Pending' queue. Administrators review the content before it becomes visible to all students."
  },
  {
    q: "How do I earn points and access premium resources?",
    a: "You earn points whenever another user downloads or favorites your uploaded resources. You can then use these accumulated points to download premium resources without needing a paid membership."
  }
];

const StepCard = ({ step, isLast }) => (
  <Box sx={{ display: 'flex', alignItems: 'stretch', position: 'relative', width: { xs: '100%', sm: 300, lg: '25%' } }}>
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', height: '100%' }}>
      {/* Number Badge */}
      <Box 
        sx={{ 
          width: 36, 
          height: 36, 
          borderRadius: '50%', 
          bgcolor: 'background.paper', 
          color: '#6366F1', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          fontWeight: 800,
          fontSize: '1.1rem',
          mb: 1.5,
          boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
          zIndex: 2,
        }}
      >
        {step.num}
      </Box>
      
      {/* Card */}
      <Paper
        sx={(theme) => ({
          p: 3,
          width: '100%',
          flex: 1, // ensure it grows
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          borderRadius: 4,
          border: '1px solid',
          borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
          boxShadow: theme.palette.mode === 'dark' ? '0 12px 32px rgba(0,0,0,0.3)' : '0 12px 32px rgba(17,24,39,0.04)',
          bgcolor: theme.palette.background.paper,
        })}
      >
        <Box component="img" src={step.image} alt={step.title} sx={{ width: 140, height: 140, objectFit: 'contain', mb: 2 }} />
        <Typography sx={{ fontWeight: 800, fontSize: '1.15rem', color: 'primary.main', mb: 0.5 }}>
          {step.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 'auto', lineHeight: 1.5 }}>
          {step.description}
        </Typography>
        
        {/* Bottom Badge */}
        <Box 
          sx={{ 
            mt: 3,
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            px: 1.5,
            py: 0.75,
            borderRadius: 2,
            bgcolor: step.badgeBg,
            color: step.badgeColor,
          }}
        >
          {step.badgeIcon}
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, lineHeight: 1.2 }}>
            {step.badgeText}
          </Typography>
        </Box>
      </Paper>
    </Box>

    {/* Arrow Connector (Desktop only) */}
    {!isLast && (
      <ArrowForward 
        sx={{ 
          display: { xs: 'none', lg: 'block' }, 
          position: 'absolute', 
          right: -16, 
          top: '50%', 
          transform: 'translateY(-50%)',
          color: 'text.disabled',
          zIndex: 1,
        }} 
      />
    )}
  </Box>
);

const CreatorGuide = () => {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <DiscoveryHeader />

      <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 3 }, py: { xs: 4, md: 6 } }}>
        
        {/* â”€â”€ Hero Section â”€â”€ */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography 
            variant="h2" 
            sx={{ 
              fontWeight: 800, 
              mb: 1.5, 
              background: 'linear-gradient(92deg, #1D72F2 0%, #7C3AED 100%)', 
              WebkitBackgroundClip: 'text', 
              WebkitTextFillColor: 'transparent',
              fontSize: { xs: '2.5rem', md: '4rem' },
              letterSpacing: '-0.02em',
            }}
          >
            Become a Creator
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500, fontSize: { xs: '1.1rem', md: '1.3rem' } }}>
            Share your knowledge. Help others. Earn recognition.
          </Typography>
        </Box>

        {/* â”€â”€ Cards Journey â”€â”€ */}
        <Stack 
          direction={{ xs: 'column', lg: 'row' }} 
          spacing={{ xs: 6, lg: 2 }} 
          alignItems={{ xs: 'center', lg: 'stretch' }}
          justifyContent="center"
          sx={{ mb: 6, position: 'relative' }}
        >
          {steps.map((step, index) => (
            <StepCard key={step.title} step={step} isLast={index === steps.length - 1} />
          ))}
        </Stack>

        {/* â”€â”€ Rewards Strip â”€â”€ */}
        <Paper 
          sx={(theme) => ({ 
            p: 0,
            borderRadius: 4, 
            mb: 6, 
            border: '1px solid', 
            borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', 
            boxShadow: theme.palette.mode === 'dark' ? '0 8px 24px rgba(0,0,0,0.2)' : '0 8px 24px rgba(17,24,39,0.03)',
            overflow: 'hidden',
          })}
        >
          <Stack 
            direction={{ xs: 'column', md: 'row' }} 
            divider={<Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' } }} />}
          >
            <Box sx={{ flex: 1, p: { xs: 3, md: 4 }, display: 'flex', gap: 2.5, alignItems: 'flex-start' }}>
              <EmojiEvents sx={{ fontSize: 40, color: '#2563EB' }} />
              <Box>
                <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', mb: 0.5 }}>Rewards & Gamification</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                  Earn points when users download or favorite your content.
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ display: { xs: 'block', md: 'none' } }} />
            <Box sx={{ flex: 1, p: { xs: 3, md: 4 }, display: 'flex', gap: 2.5, alignItems: 'flex-start' }}>
              <LockOpen sx={{ fontSize: 40, color: '#F59E0B' }} />
              <Box>
                <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', mb: 0.5 }}>Unlock Premium Resources</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                  Use your points to unlock and download premium resources.
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ display: { xs: 'block', md: 'none' } }} />
            <Box sx={{ flex: 1, p: { xs: 3, md: 4 }, display: 'flex', gap: 2.5, alignItems: 'flex-start' }}>
              <AccountBalanceWallet sx={{ fontSize: 40, color: '#10B981' }} />
              <Box>
                <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', mb: 0.5 }}>Your Earnings</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                  Points are stored in your wallet. More contribution, more rewards!
                </Typography>
              </Box>
            </Box>
          </Stack>
        </Paper>

        {/* â”€â”€ Main CTA â”€â”€ */}
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Button
            component={RouterLink}
            to="/dashboard/settings"
            variant="contained"
            size="large"
            endIcon={<ArrowForward />}
            sx={{ 
              textTransform: 'none', 
              fontWeight: 700, 
              borderRadius: 99, 
              px: 4.5, 
              py: 1.6, 
              fontSize: '1.15rem',
              background: 'linear-gradient(92deg, #1D72F2 0%, #7C3AED 100%)', 
              boxShadow: '0 8px 24px rgba(29,114,242,0.3)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 12px 32px rgba(29,114,242,0.4)' }
            }}
          >
            Become a Creator
          </Button>
        </Box>

        {/* â”€â”€ Short FAQ â”€â”€ */}
        <Box sx={{ maxWidth: 800, mx: 'auto' }}>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, textAlign: 'center' }}>Frequently Asked Questions</Typography>
          <Box>
            {faqs.map((faq, index) => (
              <Accordion 
                key={index} 
                disableGutters
                sx={{ 
                  border: '1px solid', 
                  borderColor: 'divider', 
                  bgcolor: 'transparent',
                  boxShadow: 'none',
                  '&:before': { display: 'none' },
                  '&:first-of-type': { borderTopLeftRadius: 16, borderTopRightRadius: 16 },
                  '&:last-of-type': { borderBottomLeftRadius: 16, borderBottomRightRadius: 16 },
                  mb: '-1px'
                }}
              >
                <AccordionSummary expandIcon={<ExpandMore />} sx={{ px: 3, py: 1 }}>
                  <Typography sx={{ fontWeight: 600 }}>{faq.q}</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ px: 3, pb: 3, pt: 0 }}>
                  <Typography color="text.secondary" sx={{ lineHeight: 1.6 }}>{faq.a}</Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </Box>

      </Box>
    </Box>
  );
};

export default CreatorGuide;