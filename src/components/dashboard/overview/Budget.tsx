import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import type { SxProps } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { Wallet as BudgetIcon } from '@phosphor-icons/react/dist/ssr/Wallet';

export interface BudgetProps {
  sx?: SxProps;
  value: number;
}

export function Budget({ value, sx }: BudgetProps): React.JSX.Element {
  return (
    <Card sx={sx}>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }} spacing={3}>
            <Stack spacing={1}>
              <Typography color="text.secondary" gutterBottom variant="overline">
                Budget Status
              </Typography>
              <Typography variant="h4">{value}%</Typography>
              <Typography color="text.secondary" variant="caption">
                used
              </Typography>
            </Stack>
            <Avatar sx={{ backgroundColor: 'var(--mui-palette-warning-main)', height: '56px', width: '56px' }}>
              <BudgetIcon fontSize="var(--icon-fontSize-lg)" />
            </Avatar>
          </Stack>
          <div>
            <LinearProgress value={value} variant="determinate" />
          </div>
        </Stack>
      </CardContent>
    </Card>
  );
}
