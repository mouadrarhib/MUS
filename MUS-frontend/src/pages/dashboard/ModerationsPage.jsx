import React from 'react';
import { ModerationList } from '../../features/moderations';
import { PageHeader, PageTitle } from '../../shared/components/common';

function ModerationsPage() {
  return (
    <div>
      <PageHeader>
        <PageTitle>Moderations</PageTitle>
      </PageHeader>
      <ModerationList />
    </div>
  );
}

export default ModerationsPage;