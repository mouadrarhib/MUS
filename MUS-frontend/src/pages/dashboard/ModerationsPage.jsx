import React from 'react';
import { Box } from '@mui/material';
import { ModerationList } from '../../features/moderations';
import { PageHeader, PageTitle } from '../../shared/components/common';
import { Scrollbar } from '../../shared/components/ui/navigation';

function ModerationsPage() {
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <PageHeader>
        <PageTitle>Moderations</PageTitle>
      </PageHeader>
      <Box sx={{ position: 'relative', flex: '1 1 auto', overflow: 'hidden' }}>
        <Scrollbar>
          <ModerationList />
        </Scrollbar>
      </Box>
    </Box>
  );
}

export default ModerationsPage;