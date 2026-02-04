import React from 'react';
import { Box } from '@mui/material';
import { ResourceList } from '../../features/resources';
import { PageHeader, PageTitle } from '../../shared/components/common';
import { Scrollbar } from '../../shared/components/ui/navigation';

function ResourcesPage() {
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <PageHeader>
        <PageTitle>Resources</PageTitle>
      </PageHeader>
      <Box sx={{ position: 'relative', flex: '1 1 auto', overflow: 'hidden' }}>
        <Scrollbar>
          <ResourceList />
        </Scrollbar>
      </Box>
    </Box>
  );
}

export default ResourcesPage;