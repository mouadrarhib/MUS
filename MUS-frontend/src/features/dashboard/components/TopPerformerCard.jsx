// src/features/dashboard/components/TopPerformerCard.jsx
import { Card, CardContent, Typography, Box, Avatar, Chip, alpha } from '@mui/material';
import { EmojiEvents, TrendingUp, WorkspacePremium } from '@mui/icons-material';

const TopPerformerCard = ({ name, resourceCount, id, rank = 1 }) => {
  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        minHeight: { xs: 320, md: 380 },
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 12px 28px rgba(102, 126, 234, 0.35)',
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: 0,
          width: '120px',
          height: '120px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          transform: 'translate(30%, -30%)',
        },
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 2.5 }, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center" gap={0.75}>
            <WorkspacePremium sx={{ color: '#FFD700', fontSize: { xs: 18, sm: 20 } }} />
            <Typography 
              variant="caption" 
              fontWeight="600" 
              color="white"
              sx={{ opacity: 0.9, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
            >
              Top Contributor
            </Typography>
          </Box>
          <Chip
            icon={<EmojiEvents sx={{ fontSize: 12, color: '#FFD700 !important' }} />}
            label={`#${rank}`}
            size="small"
            sx={{
              bgcolor: alpha('#FFD700', 0.2),
              color: '#FFD700',
              fontWeight: 700,
              fontSize: 11,
              height: 22,
              '& .MuiChip-label': { px: 0.75 },
            }}
          />
        </Box>

        {/* Avatar Section */}
        <Box 
          display="flex" 
          flexDirection="column" 
          alignItems="center" 
          flex={1}
          justifyContent="center"
          py={2}
        >
          <Box position="relative" mb={1.5}>
            <Box
              sx={{
                position: 'absolute',
                inset: -4,
                background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                borderRadius: '50%',
                opacity: 0.4,
                filter: 'blur(8px)',
                animation: 'pulse 2s ease-in-out infinite',
                '@keyframes pulse': {
                  '0%, 100%': { opacity: 0.4, transform: 'scale(1)' },
                  '50%': { opacity: 0.6, transform: 'scale(1.05)' },
                },
              }}
            />
            <Avatar
              sx={{
                width: { xs: 60, sm: 70 },
                height: { xs: 60, sm: 70 },
                bgcolor: 'white',
                color: 'primary.main',
                fontWeight: 'bold',
                fontSize: { xs: '1.5rem', sm: '1.75rem' },
                position: 'relative',
                boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
                border: '2px solid',
                borderColor: '#FFD700',
              }}
            >
              {name.charAt(0)}
            </Avatar>
          </Box>

          <Typography 
            variant="subtitle1" 
            color="white" 
            fontWeight="700"
            textAlign="center"
            sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
          >
            {name}
          </Typography>
          
          <Typography 
            variant="caption" 
            sx={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.7rem' }}
            textAlign="center"
          >
            {resourceCount} resources shared
          </Typography>
        </Box>

        {/* Stats Footer */}
        <Box 
          sx={{
            pt: 1.5,
            borderTop: '1px solid',
            borderColor: 'rgba(255,255,255,0.2)',
            display: 'flex',
            justifyContent: 'center',
            gap: { xs: 2, sm: 3 },
          }}
        >
          <Box textAlign="center">
            <Typography variant="subtitle2" fontWeight="700" color="white">
              {resourceCount}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.65rem' }}>
              Uploads
            </Typography>
          </Box>
          <Box 
            sx={{ 
              width: 1, 
              bgcolor: 'rgba(255,255,255,0.2)',
            }} 
          />
          <Box textAlign="center">
            <Box display="flex" alignItems="center" gap={0.25} justifyContent="center">
              <TrendingUp sx={{ fontSize: 12, color: '#4caf50' }} />
              <Typography variant="subtitle2" fontWeight="700" color="white">
                +24%
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.65rem' }}>
              Growth
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TopPerformerCard;
