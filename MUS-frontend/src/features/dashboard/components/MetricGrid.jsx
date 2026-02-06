// src/features/dashboard/components/MetricGrid.jsx
import { Grid } from '@mui/material';

const MetricGrid = ({ children, spacing = 3 }) => {
  return (
    <Grid container spacing={spacing}>
      {children}
    </Grid>
  );
};

export default MetricGrid;
