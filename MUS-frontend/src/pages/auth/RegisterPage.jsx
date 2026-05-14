import { Box, Typography } from '@mui/material';
import { RegisterForm } from '@/features/auth/components/RegisterForm';

const RegisterPage = () => {
  return (
    <Box 
      sx={{ 
        position: 'relative', 
        minHeight: '100vh', 
        overflow: 'hidden',
        bgcolor: (t) => t.palette.mode === 'dark' ? '#0f172a' : '#f8fafc'
      }}
    >
      {/* Abstract Background Shapes */}
      <Box 
        sx={{ 
          position: 'absolute', 
          top: -100, 
          right: -100, 
          width: 400, 
          height: 400, 
          borderRadius: '50%', 
          background: 'radial-gradient(circle, rgba(37,99,235,0.08) 0%, rgba(37,99,235,0) 70%)',
          zIndex: 0
        }} 
      />
      <Box 
        sx={{ 
          position: 'absolute', 
          bottom: -150, 
          left: -150, 
          width: 500, 
          height: 500, 
          borderRadius: '50%', 
          background: 'radial-gradient(circle, rgba(124,58,237,0.08) 0%, rgba(124,58,237,0) 70%)',
          zIndex: 0
        }} 
      />

      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <RegisterForm />
      </Box>

      {/* Footer link */}
      <Box sx={{ pb: 4, textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <Typography variant="caption" color="text.disabled">
          © {new Date().getFullYear()} Moroccan Uni Student. Empowering your academic journey.
        </Typography>
      </Box>
    </Box>
  );
};

export default RegisterPage;