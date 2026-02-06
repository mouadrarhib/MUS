// src/features/dashboard/components/TopPerformerCard.jsx
import { Card, CardContent, Typography, Box, Avatar, Chip, alpha } from '@mui/material';
import { EmojiEvents, TrendingUp } from '@mui/icons-material';

const TopPerformerCard = ({ name, resourceCount, id, rank = 1 }) => {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: '2px solid',
        borderColor: 'warning.main',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 20px 40px rgba(102, 126, 234, 0.4)',
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: 0,
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          transform: 'translate(40%, -40%)',
        },
      }}
    >
      <CardContent sx={{ p: 4, position: 'relative', zIndex: 1 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          {/* Left Section: Avatar & Info */}
          <Box display="flex" alignItems="center" gap={3}>
            {/* Avatar with glow effect */}
            <Box position="relative">
              <Box
                sx={{
                  position: 'absolute',
                  inset: -4,
                  background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                  borderRadius: '50%',
                  opacity: 0.6,
                  filter: 'blur(8px)',
                }}
              />
              <Avatar
                sx={{
                  width: 72,
                  height: 72,
                  bgcolor: 'white',
                  color: 'primary.main',
                  fontWeight: 'bold',
                  fontSize: '2rem',
                  position: 'relative',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                  border: '3px solid',
                  borderColor: 'warning.main',
                }}
              >
                {name.charAt(0)}
              </Avatar>
            </Box>

            {/* Name & Stats */}
            <Box>
              <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                <Typography 
                  variant="h5" 
                  color="white" 
                  fontWeight="700"
                  letterSpacing={0.5}
                >
                  {name}
                </Typography>
                <Chip
                  icon={<EmojiEvents sx={{ fontSize: 16, color: '#FFD700 !important' }} />}
                  label={`#${rank}`}
                  size="small"
                  sx={{
                    bgcolor: alpha('#FFD700', 0.2),
                    color: '#FFD700',
                    fontWeight: 700,
                    border: '1px solid',
                    borderColor: alpha('#FFD700', 0.3),
                  }}
                />
              </Box>

              <Typography 
                variant="body1" 
                sx={{ 
                  color: 'rgba(255,255,255,0.9)',
                  fontWeight: 500 
                }}
              >
                {resourceCount} resources shared
              </Typography>

              {/* Achievement Badge */}
              <Box 
                display="flex" 
                alignItems="center" 
                gap={0.5} 
                mt={1.5}
                sx={{
                  px: 1.5,
                  py: 0.5,
                  bgcolor: alpha('#ffffff', 0.2),
                  borderRadius: 2,
                  width: 'fit-content',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <TrendingUp sx={{ fontSize: 16, color: '#4caf50' }} />
                <Typography 
                  variant="caption" 
                  color="white"
                  fontWeight={600}
                >
                  Top Contributor
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Right Section: Trophy Icon */}
          <Box
            sx={{
              width: 100,
              height: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(circle, rgba(255,215,0,0.3) 0%, transparent 70%)',
                borderRadius: '50%',
                animation: 'pulse 2s ease-in-out infinite',
                '@keyframes pulse': {
                  '0%, 100%': { transform: 'scale(1)', opacity: 0.5 },
                  '50%': { transform: 'scale(1.1)', opacity: 0.8 },
                },
              }}
            />
            <EmojiEvents 
              sx={{ 
                fontSize: 80, 
                color: '#FFD700',
                filter: 'drop-shadow(0 4px 8px rgba(255, 215, 0, 0.5))',
                position: 'relative',
                zIndex: 1,
              }} 
            />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TopPerformerCard;
