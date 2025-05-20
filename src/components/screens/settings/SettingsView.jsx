import React from 'react';
import { MdExitToApp } from 'react-icons/md';
import {
  Box,
  Typography,
  Divider,
  FormControl,
  Select,
  MenuItem,
  Button,
  Switch,
  Stack,
} from '@mui/material';

const SettingsView = ({
  selectedPeriod,
  setSelectedPeriod,
  notificationsEnabled,
  toggleNotifications,
  handleClearData,
  handleLogout,
}) => {
  return (
    <Box
      sx={{
        p: { xs: 2, sm: 2 },
        height: '100%',
        bgcolor: 'background.paper',
        fontSize: { xs: '12px', sm: '13px' },
      }}
    >
      <Typography
        variant="h6"
        fontWeight={600}
        gutterBottom
        sx={{ fontSize: { xs: '1.3rem', sm: '1.3rem' } }}
      >
        Settings
      </Typography>

      <Divider sx={{ mb: 2 }} />

      {/* Data Management */}
      <Typography
        variant="subtitle2"
        fontWeight={600}
        gutterBottom
        sx={{ fontSize: { xs: '0.85rem', sm: '0.9rem' } }}
      >
        Data Management
      </Typography>

      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        spacing={2}
        sx={{ mb: 1.5 }}
      >
        <Typography sx={{ fontSize: '0.8rem' }}>Clear Data Older Than</Typography>
        <FormControl size="small" sx={{ minWidth: 100 ,maxWidth:150}}>
          <Select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            sx={{ fontSize: '0.8rem', height: 32 }}
          >
            <MenuItem value="week">Last Week</MenuItem>
            <MenuItem value="month">Last Month</MenuItem>
            <MenuItem value="year">Last Year</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      <Button
        variant="outlined"
        color="primary"
        onClick={handleClearData}
        sx={{
          fontSize: '0.75rem',
          px: 2,
          py: 0.75,
          mb: 3,
          textTransform: 'none',
          minWidth: 'fit-content',
        }}
      >
        Clear Data
      </Button>

      <Divider sx={{ mb: 2 }} />

      {/* Notifications */}
      <Typography
        variant="subtitle2"
        fontWeight={600}
        gutterBottom
        sx={{ fontSize: { xs: '0.85rem', sm: '0.9rem' } }}
      >
        Notifications
      </Typography>

      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Typography sx={{ fontSize: '0.8rem' }}>Enable Notifications</Typography>
        <Switch
          checked={notificationsEnabled}
          onChange={(e) => toggleNotifications(e.target.checked)}
          color="primary"
          size="small"
        />
      </Stack>

      <Divider sx={{ my: 2 }} />

      {/* Logout */}
      <Button
        variant="text"
        onClick={handleLogout}
        startIcon={<MdExitToApp size={18} />}
        sx={{
          fontSize: '0.8rem',
          fontWeight: 600,
          textTransform: 'none',
          color: 'text.primary',
        }}
      >
        Logout
      </Button>
    </Box>
  );
};

export default SettingsView;
