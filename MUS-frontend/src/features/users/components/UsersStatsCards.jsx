import { Box, Card, CardContent, Typography } from '@mui/material';
import { People, PersonAdd, CheckCircle } from '@mui/icons-material';
import PropTypes from 'prop-types';

const UsersStatsCards = ({ totalUsers, activeUsers, teachers }) => {
  return (
    <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: 'repeat(3, 1fr)' }} gap={2} mb={4}>
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography color="textSecondary" gutterBottom variant="caption">
                Total Users
              </Typography>
              <Typography variant="h5" fontWeight="700">
                {totalUsers}
              </Typography>
            </Box>
            <People sx={{ fontSize: 40, color: 'primary.main', opacity: 0.1 }} />
          </Box>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography color="textSecondary" gutterBottom variant="caption">
                Active Users
              </Typography>
              <Typography variant="h5" fontWeight="700">
                {activeUsers}
              </Typography>
            </Box>
            <CheckCircle sx={{ fontSize: 40, color: 'success.main', opacity: 0.1 }} />
          </Box>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography color="textSecondary" gutterBottom variant="caption">
                Teachers
              </Typography>
              <Typography variant="h5" fontWeight="700">
                {teachers}
              </Typography>
            </Box>
            <PersonAdd sx={{ fontSize: 40, color: 'warning.main', opacity: 0.1 }} />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

UsersStatsCards.propTypes = {
  totalUsers: PropTypes.number.isRequired,
  activeUsers: PropTypes.number.isRequired,
  teachers: PropTypes.number.isRequired,
};

export default UsersStatsCards;
