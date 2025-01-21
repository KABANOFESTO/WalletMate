'use client';

import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import { useSettings } from '@/contexts/settings-context';

export function Appearance(): React.JSX.Element {
  const { settings, updateSettings } = useSettings();

  return (
    <Card>
      <CardHeader subheader="Customize your app appearance" title="Appearance" />
      <Divider />
      <CardContent>
        <Stack spacing={3}>
          <FormControl fullWidth>
            <InputLabel id="theme-select-label">Theme</InputLabel>
            <Select
              labelId="theme-select-label"
              id="theme-select"
              value={settings.theme}
              label="Theme"
              onChange={(e) => updateSettings({ theme: e.target.value as 'light' | 'dark' | 'system' })}
            >
              <MenuItem value="light">Light</MenuItem>
              <MenuItem value="dark">Dark</MenuItem>
              <MenuItem value="system">System</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel id="language-select-label">Language</InputLabel>
            <Select
              labelId="language-select-label"
              id="language-select"
              value={settings.language}
              label="Language"
              onChange={(e) => updateSettings({ language: e.target.value as 'en' | 'id' })}
            >
              <MenuItem value="en">English</MenuItem>
              <MenuItem value="id">Indonesian</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel id="currency-select-label">Currency</InputLabel>
            <Select
              labelId="currency-select-label"
              id="currency-select"
              value={settings.currency}
              label="Currency"
              onChange={(e) => updateSettings({ currency: e.target.value as 'USD' | 'IDR' })}
            >
              <MenuItem value="USD">USD ($)</MenuItem>
              <MenuItem value="IDR">IDR (Rp)</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </CardContent>
    </Card>
  );
}
