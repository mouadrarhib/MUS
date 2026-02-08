/**
 * USAGE EXAMPLES
 * 
 * This file demonstrates how to use the UI component library.
 * Copy and adapt these examples for your own components.
 */

import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import {
  // Buttons
  PrimaryButton,
  OutlinedButton,
  IconButton,
  // Inputs
  TextField,
  Select,
  Checkbox,
  Switch,
  // Navigation
  Navbar,
  Sidebar,
  // Modals
  Modal,
  Modal,
  // Notifications
  useNotification,
  // Data Display
  Card,
  Badge,
  Avatar,
  // Feedback
  Loading,
  Alert,
} from '@/components/ui';
import {
  Save as SaveIcon,
  Delete as DeleteIcon,
  Notifications as NotificationsIcon,
  Dashboard,
  People,
  Settings,
} from '@mui/icons-material';

// ============================================
// EXAMPLE 1: Form with Inputs and Buttons
// ============================================
export function FormExample() {
  const { showSuccess, showError } = useNotification();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: '',
    agree: false,
    notifications: false,
    description: '',
  });

  const handleSubmit = () => {
    if (!formData.name || !formData.email) {
      showError('Please fill in all required fields');
      return;
    }
    showSuccess('Form submitted successfully!');
  };

  return (
    <Box sx={{ p: 3, maxWidth: 600 }}>
      <Typography variant="h5" gutterBottom>
        Form Example
      </Typography>

      <TextField
        label="Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
        fullWidth
        sx={{ mb: 2 }}
      />

      <TextField
        label="Email"
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        required
        fullWidth
        sx={{ mb: 2 }}
      />

      <Select
        label="Category"
        value={formData.category}
        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
        options={[
          { value: '1', label: 'Option 1' },
          { value: '2', label: 'Option 2' },
          { value: '3', label: 'Option 3' },
        ]}
        sx={{ mb: 2 }}
      />



      <Checkbox
        label="I agree to the terms"
        checked={formData.agree}
        onChange={(e) => setFormData({ ...formData, agree: e.target.checked })}
        sx={{ mb: 2 }}
      />

      <Switch
        label="Enable notifications"
        checked={formData.notifications}
        onChange={(e) => setFormData({ ...formData, notifications: e.target.checked })}
        sx={{ mb: 2 }}
      />

      <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
        <OutlinedButton onClick={() => setFormData({})}>Reset</OutlinedButton>
        <PrimaryButton onClick={handleSubmit} startIcon={<SaveIcon />}>
          Submit
        </PrimaryButton>
      </Box>
    </Box>
  );
}

// ============================================
// EXAMPLE 2: Modal Usage
// ============================================
export function ModalExample() {
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { showSuccess } = useNotification();

  return (
    <Box sx={{ p: 3 }}>
      <PrimaryButton onClick={() => setOpen(true)}>Open Modal</PrimaryButton>


      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Edit Item"
        actions={
          <>
            <OutlinedButton onClick={() => setOpen(false)}>Cancel</OutlinedButton>
            <PrimaryButton
              onClick={() => {
                setOpen(false);
                showSuccess('Item saved!');
              }}
            >
              Save
            </PrimaryButton>
          </>
        }
      >
        <TextField label="Name" fullWidth />
      </Modal>

    </Box>
  );
}

// ============================================
// EXAMPLE 3: Navigation with Navbar and Sidebar
// ============================================
export function NavigationExample() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { showInfo } = useNotification();

  const menuItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <Dashboard /> },
    { label: 'Users', path: '/users', icon: <People /> },
    { label: 'Settings', path: '/settings', icon: <Settings /> },
  ];

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Navbar
        title="My Application"
        showMenuButton
        onMenuClick={() => setSidebarOpen(true)}
        rightActions={
          <>
            <Badge badgeContent={4} color="error">
              <IconButton
                tooltip="Notifications"
                onClick={() => showInfo('You have 4 notifications')}
              >
                <NotificationsIcon />
              </IconButton>
            </Badge>
            <Avatar sx={{ ml: 2 }}>JD</Avatar>
          </>
        }
      />

      <Sidebar
        title="Menu"
        items={menuItems}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        variant="responsive"
      />

      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
        <Typography variant="h4">Page Content</Typography>
      </Box>
    </Box>
  );
}

// ============================================
// EXAMPLE 4: Cards and Data Display
// ============================================
export function CardExample() {
  return (
    <Box sx={{ p: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
      <Card
        title="Card Title"
        subtitle="Card Subtitle"
        actions={
          <PrimaryButton size="small">Action</PrimaryButton>
        }
        sx={{ width: 300 }}
      >
        <Typography>This is card content. You can put any content here.</Typography>
      </Card>

      <Card
        title="Card with Image"
        image="https://via.placeholder.com/300"
        imageAlt="Placeholder"
        actions={
          <>

            <PrimaryButton size="small">Save</PrimaryButton>
          </>
        }
        sx={{ width: 300 }}
      >
        <Typography>Card with an image header.</Typography>
      </Card>
    </Box>
  );
}

// ============================================
// EXAMPLE 5: Notifications
// ============================================
export function NotificationExample() {
  const { showSuccess, showError, showWarning, showInfo } = useNotification();

  return (
    <Box sx={{ p: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
      <PrimaryButton onClick={() => showSuccess('Operation successful!')}>
        Show Success
      </PrimaryButton>

    </Box>
  );
}

// ============================================
// EXAMPLE 6: Loading States
// ============================================
export function LoadingExample() {
  const [loading, setLoading] = useState(false);

  const handleLoad = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 3000);
  };

  return (
    <Box sx={{ p: 3 }}>
      <PrimaryButton onClick={handleLoad} loading={loading}>
        Load Data
      </PrimaryButton>

      <Box sx={{ mt: 4 }}>

      </Box>
    </Box>
  );
}

