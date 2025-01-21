'use client';

import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Unstable_Grid2';
import { useSettings } from '@/contexts/settings-context';

export function Notifications(): React.JSX.Element {
  const { settings, updateSettings } = useSettings();

  const handleNotificationChange = (enabled: boolean) => {
    updateSettings({
      notifications: {
        ...settings.notifications,
        enabled
      }
    });
  };

  const handleSoundChange = (sound: boolean) => {
    updateSettings({
      notifications: {
        ...settings.notifications,
        sound
      }
    });
  };

  return (
    <Card>
      <CardHeader subheader="Manage the notifications" title="Notifications" />
      <Divider />
      <CardContent>
        <Grid container spacing={6} wrap="wrap">
          <Grid xs={12}>
            <Stack spacing={1}>
              <Typography variant="h6">Notifications</Typography>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={settings.notifications.enabled}
                      onChange={(e) => handleNotificationChange(e.target.checked)}
                    />
                  }
                  label="Enable notifications"
                />
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={settings.notifications.sound}
                      onChange={(e) => handleSoundChange(e.target.checked)}
                      disabled={!settings.notifications.enabled}
                    />
                  }
                  label="Enable notification sounds"
                />
              </FormGroup>
            </Stack>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
