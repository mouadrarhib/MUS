import { Box, Button, Paper, Stack, Typography, Accordion, AccordionSummary, AccordionDetails, Divider, Chip } from '@mui/material';
import { ArrowForward, ExpandMore, EmojiEvents, Settings, UploadFile, LockOpen, Recommend, MilitaryTech, AccountCircle } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import DiscoveryHeader from '@/features/discover/components/DiscoveryHeader';

const steps = [
  {
    title: 'Complete your profile',
    description: 'Navigate to your Settings and add your real name, upload an avatar, and confirm your academic context (Institution, Program, Level, and Semester).',
    icon: <AccountCircle color="primary" sx={{ mt: 0.2 }} />
  },
  {
    title: 'Enable Contributor Mode',
    description: 'Go to Settings > Academic Information. Under the "Student Mode" section, switch your toggle from Learner to Contributor.',
    icon: <Settings color="primary" sx={{ mt: 0.2 }} />
  },
  {
    title: 'Prepare & Upload',
    description: 'Navigate to the newly unlocked Uploads page. Attach your files, provide a thumbnail if applicable, and use clear titles and relevant tags.',
    icon: <UploadFile color="primary" sx={{ mt: 0.2 }} />
  },
  {
    title: 'Respond to feedback',
    description: 'Our Admin team will review the content. If reviewers request changes, update your content and resubmit quickly. Once approved, your resource is published globally!',
    icon: <MilitaryTech color="primary" sx={{ mt: 0.2 }} />
  },
];

const faqs = [
  {
    q: "Do I need to fill out a separate application form to become a creator?",
    a: "No! Any registered student can become a creator simply by navigating to their Settings and switching their Student Mode from Learner to Contributor."
  },
  {
    q: "Why can't I access the Uploads page?",
    a: "If you are getting redirected to the dashboard when trying to access uploads, it means your account is currently in Learner mode. You must enable Contributor mode in your settings first."
  },
  {
    q: "Are my uploaded resources published immediately?",
    a: "No. To maintain platform quality, all uploaded resources are put into a 'Pending' queue. Administrators review and verify the content through the Content Verification portal before it becomes visible to all students."
  },
  {
    q: "Can I switch back to being just a Learner?",
    a: "Yes. You can toggle back to Learner mode at any time in your Settings. However, doing so will block your access to the Uploads area until you switch back."
  },
  {
    q: "What information is visible to other students when I upload?",
    a: "When your resource is published, the platform will display your Full Name, Avatar, and your Primary Role on the resource card, giving you full credit for your contribution."
  },
  {
    q: "How do I earn points and access premium resources?",
    a: "As a Creator, you earn points whenever another user downloads or favorites your uploaded resources. You can then use these accumulated points from your wallet to download premium resources without needing a paid premium membership."
  }
];

const CreatorGuide = () => {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <DiscoveryHeader />

      <Box sx={{ maxWidth: 900, mx: 'auto', px: { xs: 2, md: 3 }, py: { xs: 4, md: 6 } }}>
        
        {/* ── Hero Section ── */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 800, 
              mb: 2, 
              background: 'linear-gradient(92deg, #1D72F2 0%, #7C3AED 100%)', 
              WebkitBackgroundClip: 'text', 
              WebkitTextFillColor: 'transparent',
              fontSize: { xs: '2rem', md: '3rem' }
            }}
          >
            Share your knowledge.<br/>Help others. Earn recognition.
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500, mb: 4 }}>
            Join our community of student educators today!
          </Typography>
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
              px: 4, 
              py: 1.5, 
              fontSize: '1.1rem',
              background: 'linear-gradient(92deg, #1D72F2 0%, #7C3AED 100%)', 
              boxShadow: '0 4px 20px rgba(29,114,242,0.3)',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 6px 24px rgba(29,114,242,0.4)' }
            }}
          >
            Become a Creator
          </Button>
        </Box>

        {/* ── What is a Creator ── */}
        <Paper sx={{ p: { xs: 3, md: 4 }, borderRadius: 4, mb: 4, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>What is a Creator on MUS?</Typography>
          <Typography color="text.secondary" sx={{ mb: 2, fontSize: '1.05rem', lineHeight: 1.6 }}>
            A <strong>Creator</strong> on the MUS platform is a student who actively contributes to the learning ecosystem by sharing their own study materials.
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            While standard students (Learner Mode) can browse, discover, and save resources, Creators (Contributor Mode) have elevated permissions that allow them to:
          </Typography>
          <Box component="ul" sx={{ color: 'text.secondary', pl: 3, m: 0, '& li': { mb: 1 } }}>
            <li>Access the dedicated <strong>My Uploads</strong> portal.</li>
            <li>Upload study files, thumbnails, and learning materials.</li>
            <li>Categorize content by institution, program, level, and specific modules.</li>
            <li>Have their name, avatar, and academic role publicly credited on the resources they author.</li>
          </Box>
        </Paper>

        {/* ── Gamification & Rewards ── */}
        <Paper sx={{ 
          p: { xs: 3, md: 4 }, 
          borderRadius: 4, 
          mb: 4, 
          border: '1.5px solid', 
          borderColor: 'primary.main', 
          background: 'linear-gradient(145deg, rgba(29,114,242,0.03) 0%, rgba(124,58,237,0.03) 100%)',
          boxShadow: 'none' 
        }}>
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
            <EmojiEvents color="primary" sx={{ fontSize: 32 }} />
            <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main' }}>Rewards & Gamification</Typography>
          </Stack>
          <Typography color="text.secondary" sx={{ mb: 3, fontSize: '1.05rem', lineHeight: 1.6 }}>
            As a Creator, your contributions directly earn you rewards on the platform! You gain <strong>points</strong> whenever another user interacts with your approved content:
          </Typography>
          
          <Stack spacing={2} sx={{ mb: 4 }}>
            <Paper sx={{ p: 2, borderRadius: 3, display: 'flex', gap: 2, alignItems: 'center', border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
              <Chip label="+10 pts" color="success" sx={{ fontWeight: 700, borderRadius: 2 }} />
              <Typography color="text.secondary"><strong>Downloads:</strong> Earn points every time a unique user downloads your resource.</Typography>
            </Paper>
            <Paper sx={{ p: 2, borderRadius: 3, display: 'flex', gap: 2, alignItems: 'center', border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
              <Chip label="+2 pts" color="info" sx={{ fontWeight: 700, borderRadius: 2 }} />
              <Typography color="text.secondary"><strong>Favorites:</strong> Earn points every time a user adds your resource to their library.</Typography>
            </Paper>
          </Stack>

          <Divider sx={{ mb: 3 }} />
          
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1.5 }}>
            <LockOpen color="warning" />
            <Typography sx={{ fontWeight: 800, fontSize: '1.1rem' }}>Unlock Premium Resources</Typography>
          </Stack>
          <Typography color="text.secondary" sx={{ lineHeight: 1.6 }}>
            The points you accumulate are deposited into your personal wallet. These points can be used to <strong>unlock and download Premium resources</strong> on the platform without needing a paid membership! Sharing your own study materials pays for the premium materials you need to succeed.
          </Typography>
        </Paper>

        {/* ── Step-by-Step ── */}
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 3, mt: 5 }}>Step-by-Step Guide</Typography>
        <Stack spacing={2} sx={{ mb: 5 }}>
          {steps.map((step, index) => (
            <Paper
              key={step.title}
              sx={(theme) => ({
                p: 3,
                borderRadius: 4,
                border: '1px solid',
                borderColor: theme.palette.divider,
                boxShadow: 'none',
                display: 'flex',
                gap: 2,
                alignItems: 'flex-start',
              })}
            >
              {step.icon}
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', mb: 0.5 }}>
                  {index + 1}. {step.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  {step.description}
                </Typography>
              </Box>
            </Paper>
          ))}
        </Stack>

        {/* ── FAQ ── */}
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 3, mt: 5 }}>Frequently Asked Questions</Typography>
        <Box sx={{ mb: 6 }}>
          {faqs.map((faq, index) => (
            <Accordion 
              key={index} 
              disableGutters
              sx={{ 
                border: '1px solid', 
                borderColor: 'divider', 
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

        {/* ── Bottom Actions ── */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center" sx={{ mt: 4 }}>
          <Button
            component={RouterLink}
            to="/dashboard/uploads"
            variant="contained"
            endIcon={<ArrowForward />}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 99, px: 3, py: 1.2 }}
          >
            Go to My Uploads
          </Button>
          <Button
            component={RouterLink}
            to="/discover"
            variant="outlined"
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 99, px: 3, py: 1.2 }}
          >
            Back to discover
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};

export default CreatorGuide;
