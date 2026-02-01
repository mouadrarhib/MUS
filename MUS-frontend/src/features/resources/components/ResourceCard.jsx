import React from 'react';
import { Card, IconButton } from '../../../shared/components/ui';

export const ResourceCard = ({ resource }) => {
  return (
    <Card>
      <img src={resource.image} alt={resource.title} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
      <div style={{ padding: '16px' }}>
        <h3>{resource.title}</h3>
        <p>{resource.description}</p>
        <p>By: {resource.author}</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
          <IconButton icon="edit" />
          <IconButton icon="delete" />
        </div>
      </div>
    </Card>
  );
};