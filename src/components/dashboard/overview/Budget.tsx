import * as React from 'react';
import { useEffect, useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import type { SxProps } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { Wallet as BudgetIcon } from '@phosphor-icons/react/dist/ssr/Wallet';
import { useAuth } from '@/hooks/use-auth';
import { budgetService, type Budget } from '@/services/budget';

export interface BudgetProps {
  sx?: SxProps;
}

export function Budget({ sx }: BudgetProps): React.JSX.Element {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBudgets = async () => {
      if (!user?.id) return;
      
      try {
        const data = await budgetService.getUserBudgets(Number(user.id));
        setBudgets(data);
      } catch (error) {
        console.error('Failed to fetch budgets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBudgets();
  }, [user?.id]);

  const calculateTotalProgress = () => {
    if (budgets.length === 0) return 0;
    
    const totalAmount = budgets.reduce((sum, budget) => sum + budget.limit, 0);
    const totalSpent = budgets.reduce((sum, budget) => sum + budget.currentSpent, 0);
    
    return Math.min(100, Math.round((totalSpent / totalAmount) * 100));
  };

  const value = calculateTotalProgress();

  return (
    <Card sx={sx}>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }} spacing={3}>
            <Stack spacing={1}>
              <Typography color="text.secondary" gutterBottom variant="overline">
                Total Budget Status
              </Typography>
              <Typography variant="h4">{value}%</Typography>
              <Typography color="text.secondary" variant="caption">
                of total budget used
              </Typography>
            </Stack>
            <Avatar 
              sx={{ 
                backgroundColor: value > 90 
                  ? 'var(--mui-palette-error-main)' 
                  : value > 75 
                    ? 'var(--mui-palette-warning-main)' 
                    : 'var(--mui-palette-primary-main)', 
                height: '56px', 
                width: '56px' 
              }}
            >
              <BudgetIcon fontSize="var(--icon-fontSize-lg)" />
            </Avatar>
          </Stack>
          <div>
            <LinearProgress 
              value={value} 
              variant={loading ? "indeterminate" : "determinate"}
              color={value > 90 ? "error" : value > 75 ? "warning" : "primary"}
            />
          </div>
        </Stack>
      </CardContent>
    </Card>
  );
}
