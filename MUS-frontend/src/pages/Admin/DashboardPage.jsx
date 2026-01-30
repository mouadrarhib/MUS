import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  LinearProgress,
} from '@mui/material';
import {
  TrendingUp,
  People,
  LibraryBooks,
  VerifiedUser,
} from '@mui/icons-material';

const StatCard = ({ title, value, icon, color, change }) => (
  <Card sx={{ height: '100%', borderRadius: 2 }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Avatar sx={{ bgcolor: `${color}.main`, mr: 2 }}>
          {icon}
        </Avatar>
        <Box sx={{ flexGrow: 1 }}>
          <Typography color="text.secondary" variant="body2">
            {title}
          </Typography>
          <Typography variant="h4" fontWeight={700}>
            {value}
          </Typography>
        </Box>
      </Box>
      <Typography variant="body2" color={change > 0 ? 'success.main' : 'error.main'}>
        {change > 0 ? '+' : ''}{change}% ce mois
      </Typography>
      <LinearProgress
        variant="determinate"
        value={Math.abs(change)}
        sx={{ mt: 1, height: 6, borderRadius: 1 }}
        color={change > 0 ? 'success' : 'error'}
      />
    </CardContent>
  </Card>
);

const DashboardPage = () => {
  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Tableau de bord
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        Bienvenue sur votre dashboard administrateur
      </Typography>

      {/* <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Utilisateurs"
            value="1,234"
            icon={<People />}
            color="primary"
            change={12.5}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Ressources"
            value="856"
            icon={<LibraryBooks />}
            color="success"
            change={8.2}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="En Modération"
            value="23"
            icon={<VerifiedUser />}
            color="warning"
            change={-5.1}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Taux de croissance"
            value="15%"
            icon={<TrendingUp />}
            color="info"
            change={3.8}
          />
        </Grid>
      </Grid> */}
    </Box>
  );
};

export default DashboardPage;
