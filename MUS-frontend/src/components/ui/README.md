# UI Component Library

A comprehensive, reusable UI component library built with Material-UI (MUI) for the MUS Frontend application.

## Installation

All components are ready to use. Make sure you have the required dependencies:

```bash
npm install @mui/material @mui/icons-material prop-types
```

## Usage

### Import Components

```jsx
// Import individual components
import { PrimaryButton, TextField, Modal } from '@/components/ui';

// Or import from specific categories
import { PrimaryButton, SecondaryButton } from '@/components/ui/buttons';
import { TextField, Select } from '@/components/ui/inputs';
```

## Components

### Buttons

#### PrimaryButton
Primary action button with loading state support.

```jsx
import { PrimaryButton } from '@/components/ui';

<PrimaryButton
  onClick={handleClick}
  loading={isLoading}
  startIcon={<SaveIcon />}
>
  Save
</PrimaryButton>
```

#### SecondaryButton
Secondary action button.

```jsx
import { SecondaryButton } from '@/components/ui';

<SecondaryButton onClick={handleClick}>
  Cancel
</SecondaryButton>
```

#### OutlinedButton
Outlined button variant.

```jsx
import { OutlinedButton } from '@/components/ui';

<OutlinedButton onClick={handleClick} color="error">
  Delete
</OutlinedButton>
```

#### TextButton
Text button variant.

```jsx
import { TextButton } from '@/components/ui';

<TextButton onClick={handleClick}>
  Learn More
</TextButton>
```

#### IconButton
Icon button with optional tooltip.

```jsx
import { IconButton } from '@/components/ui';
import { Delete as DeleteIcon } from '@mui/icons-material';

<IconButton
  onClick={handleDelete}
  tooltip="Delete item"
  color="error"
>
  <DeleteIcon />
</IconButton>
```

### Inputs

#### TextField
Enhanced text input with adornments support.

```jsx
import { TextField } from '@/components/ui';
import { Email as EmailIcon } from '@mui/icons-material';

<TextField
  label="Email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  startAdornment={<EmailIcon />}
  error={hasError}
  helperText={errorMessage}
/>
```

#### Select
Dropdown select component.

```jsx
import { Select } from '@/components/ui';

<Select
  label="Category"
  value={category}
  onChange={(e) => setCategory(e.target.value)}
  options={[
    { value: '1', label: 'Option 1' },
    { value: '2', label: 'Option 2' },
  ]}
/>
```

#### Checkbox
Checkbox input.

```jsx
import { Checkbox } from '@/components/ui';

<Checkbox
  label="I agree to terms"
  checked={agreed}
  onChange={(e) => setAgreed(e.target.checked)}
/>
```

#### Radio
Radio button group.

```jsx
import { Radio } from '@/components/ui';

<Radio
  label="Select option"
  value={selected}
  onChange={(e) => setSelected(e.target.value)}
  options={[
    { value: '1', label: 'Option 1' },
    { value: '2', label: 'Option 2' },
  ]}
/>
```

#### Switch
Toggle switch component.

```jsx
import { Switch } from '@/components/ui';

<Switch
  label="Enable notifications"
  checked={enabled}
  onChange={(e) => setEnabled(e.target.checked)}
/>
```

#### TextArea
Multi-line text input.

```jsx
import { TextArea } from '@/components/ui';

<TextArea
  label="Description"
  value={description}
  onChange={(e) => setDescription(e.target.value)}
  rows={4}
/>
```

### Navigation

#### Navbar
Reusable navigation bar.

```jsx
import { Navbar } from '@/components/ui';
import { IconButton } from '@mui/material';
import { Notifications as NotificationsIcon } from '@mui/icons-material';

<Navbar
  title="My App"
  showMenuButton={isMobile}
  onMenuClick={handleMenuClick}
  rightActions={
    <IconButton>
      <NotificationsIcon />
    </IconButton>
  }
/>
```

#### Sidebar
Reusable sidebar navigation.

```jsx
import { Sidebar } from '@/components/ui';
import { Dashboard, People } from '@mui/icons-material';

<Sidebar
  title="Admin Panel"
  items={[
    { label: 'Dashboard', path: '/admin', icon: <Dashboard /> },
    { label: 'Users', path: '/admin/users', icon: <People /> },
  ]}
  open={sidebarOpen}
  onClose={() => setSidebarOpen(false)}
/>
```

### Modals

#### Modal
Base modal component.

```jsx
import { Modal, PrimaryButton, OutlinedButton } from '@/components/ui';

<Modal
  open={open}
  onClose={handleClose}
  title="Edit Item"
  actions={
    <>
      <OutlinedButton onClick={handleClose}>Cancel</OutlinedButton>
      <PrimaryButton onClick={handleSave}>Save</PrimaryButton>
    </>
  }
>
  <TextField label="Name" value={name} onChange={handleChange} />
</Modal>
```

#### ConfirmModal
Confirmation dialog.

```jsx
import { ConfirmModal } from '@/components/ui';

<ConfirmModal
  open={open}
  onClose={handleClose}
  onConfirm={handleConfirm}
  title="Delete Item"
  message="Are you sure you want to delete this item?"
  confirmText="Delete"
  cancelText="Cancel"
  loading={isDeleting}
/>
```

#### AlertModal
Alert/info modal.

```jsx
import { AlertModal } from '@/components/ui';

<AlertModal
  open={open}
  onClose={handleClose}
  title="Success"
  message="Item saved successfully!"
  severity="success"
/>
```

### Notifications

First, wrap your app with NotificationProvider:

```jsx
import { NotificationProvider } from '@/components/ui';

function App() {
  return (
    <NotificationProvider>
      {/* Your app content */}
    </NotificationProvider>
  );
}
```

Then use the hook in components:

```jsx
import { useNotification } from '@/components/ui';

function MyComponent() {
  const { showSuccess, showError, showWarning, showInfo } = useNotification();

  const handleSave = () => {
    // ... save logic
    showSuccess('Item saved successfully!');
  };

  const handleError = () => {
    showError('Something went wrong!');
  };

  return (
    // ... component JSX
  );
}
```

### Data Display

#### Card
Card component for displaying content.

```jsx
import { Card, PrimaryButton } from '@/components/ui';

<Card
  title="Card Title"
  subtitle="Card Subtitle"
  image="/path/to/image.jpg"
  actions={
    <PrimaryButton>Action</PrimaryButton>
  }
>
  Card content goes here
</Card>
```

#### Badge
Badge for notifications and counts.

```jsx
import { Badge, IconButton } from '@/components/ui';
import { Notifications as NotificationsIcon } from '@mui/icons-material';

<Badge badgeContent={4} color="error">
  <IconButton>
    <NotificationsIcon />
  </IconButton>
</Badge>
```

#### Avatar
Avatar component.

```jsx
import { Avatar } from '@/components/ui';

<Avatar src="/path/to/image.jpg" alt="User" size="large" />
<Avatar>JD</Avatar> {/* Initials */}
```

### Feedback

#### Loading
Loading indicator.

```jsx
import { Loading } from '@/components/ui';

<Loading message="Loading data..." />
<Loading fullScreen message="Loading..." />
```

#### Skeleton
Skeleton loading placeholder.

```jsx
import { Skeleton } from '@/components/ui';

<Skeleton variant="rectangular" width={200} height={100} />
<Skeleton variant="circular" width={40} height={40} />
```

#### Alert
Alert message component.

```jsx
import { Alert } from '@/components/ui';

<Alert severity="success" title="Success" onClose={handleClose}>
  Operation completed successfully!
</Alert>
```

## Theming

All components respect the Material-UI theme configuration. Customize the theme in `src/app/styles/theme.js`.

## Best Practices

1. **Consistent Styling**: Always use these components instead of creating custom buttons, inputs, etc.
2. **Props**: All components accept `sx` prop for custom styling when needed.
3. **Accessibility**: Components follow Material-UI accessibility guidelines.
4. **Type Safety**: Use PropTypes for prop validation (TypeScript support can be added later).

## Examples

### Complete Form Example

```jsx
import {
  TextField,
  Select,
  Checkbox,
  PrimaryButton,
  OutlinedButton,
  useNotification,
} from '@/components/ui';

function MyForm() {
  const { showSuccess, showError } = useNotification();
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    agree: false,
  });

  const handleSubmit = async () => {
    try {
      // Submit logic
      showSuccess('Form submitted successfully!');
    } catch (error) {
      showError('Failed to submit form');
    }
  };

  return (
    <form>
      <TextField
        label="Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />
      <Select
        label="Category"
        value={formData.category}
        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
        options={categories}
      />
      <Checkbox
        label="I agree"
        checked={formData.agree}
        onChange={(e) => setFormData({ ...formData, agree: e.target.checked })}
      />
      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
        <OutlinedButton onClick={handleCancel}>Cancel</OutlinedButton>
        <PrimaryButton onClick={handleSubmit}>Submit</PrimaryButton>
      </Box>
    </form>
  );
}
```

### Layout with Navbar and Sidebar

```jsx
import { Navbar, Sidebar } from '@/components/ui';
import { useState } from 'react';

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Box sx={{ display: 'flex' }}>
      <Navbar
        title="My App"
        showMenuButton
        onMenuClick={() => setSidebarOpen(true)}
      />
      <Sidebar
        items={menuItems}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        variant="responsive"
      />
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
        {/* Page content */}
      </Box>
    </Box>
  );
}
```

