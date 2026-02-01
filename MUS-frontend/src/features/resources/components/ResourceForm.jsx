import React, { useState } from 'react';
import {
  Card,
  PrimaryButton,
  TextField,
} from '../../../shared/components/ui';

export const ResourceForm = ({ resource, onSave }) => {
  const [title, setTitle] = useState(resource ? resource.title : '');
  const [description, setDescription] = useState(resource ? resource.description : '');
  const [author, setAuthor] = useState(resource ? resource.author : '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ title, description, author });
  };

  return (
    <Card>
      <h2>{resource ? 'Edit Resource' : 'New Resource'}</h2>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          style={{ marginBottom: '16px' }}
        />
        <TextField
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          style={{ marginBottom: '16px' }}
        />
        <TextField
          label="Author"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          required
          style={{ marginBottom: '16px' }}
        />
        <PrimaryButton type="submit">Save</PrimaryButton>
      </form>
    </Card>
  );
};