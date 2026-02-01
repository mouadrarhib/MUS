import React from 'react';
import { ResourceList } from '../../features/resources';
import { PageHeader, PageTitle } from '../../shared/components/common';

function ResourcesPage() {
  return (
    <div>
      <PageHeader>
        <PageTitle>Resources</PageTitle>
      </PageHeader>
      <ResourceList />
    </div>
  );
}

export default ResourcesPage;