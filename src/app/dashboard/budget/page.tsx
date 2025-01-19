'use client';

import React, { useState, ChangeEvent, JSX } from 'react';
import {
  Box,
  Stack,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Button,
  TextField,
  Tooltip,
  useTheme,
  useMediaQuery,
  MenuItem,
  InputAdornment,
} from '@mui/material';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

// Sample transaction data
interface Transaction {
  id: number;
  category: string;
  amount: number;
  type: string;
  date: string;
}

const transactions: Transaction[] = [
  { id: 1, category: 'Food', amount: 200, type: 'Expense', date: '2025-01-10' },
  { id: 2, category: 'Rent', amount: 1000, type: 'Expense', date: '2025-01-05' },
  { id: 3, category: 'Transport', amount: 150, type: 'Expense', date: '2025-01-12' },
  { id: 4, category: 'Entertainment', amount: 300, type: 'Expense', date: '2025-01-15' },
];

// Pie chart colors
const COLORS = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'];

// BudgetPage Component
interface Category {
  name: string;
  value: number;
}

export default function BudgetPage(): JSX.Element {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  // State for budget and notification
  const [budget, setBudget] = useState<number>(2000); // Default budget
  const [budgetInput, setBudgetInput] = useState<string>('2000');
  const [categories] = useState<Category[]>([
    { name: 'Food', value: 300 },
    { name: 'Transport', value: 150 },
    { name: 'Entertainment', value: 200 },
  ]);

  // Calculate total expenses
  const currentTotalExpenses = categories.reduce((acc, category) => acc + category.value, 0);

  // Budget exceeded flag
  const isOverBudget = currentTotalExpenses > budget;

  // Data for pie chart
  const categoryData = transactions
    .filter((transaction: Transaction) => transaction.type === 'Expense')
    .map((transaction: Transaction) => ({
      name: transaction.category,
      value: transaction.amount,
    }));

  // Handle budget update
  const handleBudgetUpdate = (): void => {
    const newBudget = parseFloat(budgetInput);
    if (!isNaN(newBudget) && newBudget > 0) {
      setBudget(newBudget);
    }
  };

  // Handle budget input change
  const handleBudgetInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setBudgetInput(e.target.value);
  };

  return (
    <Stack spacing={3}>
      {/* Budget Overview */}
      <Card>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <CircularProgressWithLabel
                  value={(currentTotalExpenses / budget) * 100}
                  isOverBudget={isOverBudget}
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack spacing={2}>
                <Typography variant="h6">Budget Settings</Typography>
                <TextField
                  label="Monthly Budget"
                  type="number"
                  value={budgetInput}
                  onChange={handleBudgetInputChange}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  fullWidth
                />
                <Button variant="contained" onClick={handleBudgetUpdate}>
                  Update Budget
                </Button>
                {Boolean(isOverBudget) && (
                  <Tooltip title="Your spending has exceeded the budget!" arrow>
                    <Typography color="error" variant="body1">
                      Warning: You are over your budget by ${(currentTotalExpenses - budget).toFixed(2)}
                    </Typography>
                  </Tooltip>
                )}
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Expense Distribution */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Expense Distribution
          </Typography>
          <Box sx={{ width: '100%', height: isSmallScreen ? 300 : 400 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={isSmallScreen ? 100 : 150}
                >
                  {categoryData.map((entry) => (
                    <Cell key={entry.name} fill={COLORS[categoryData.indexOf(entry) % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>

      {/* Categories */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Categories
          </Typography>
          <Stack spacing={2}>
            {categories.map((category) => (
              <MenuItem key={category.name} value={category.name}>
                {category.name}
              </MenuItem>
            ))}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}

// Circular Progress with Label
function CircularProgressWithLabel({
  value,
  isOverBudget,
}: {
  value: number;
  isOverBudget: boolean;
}): JSX.Element {
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <CircularProgress
        variant="determinate"
        value={Math.min(value, 100)}
        sx={{ color: isOverBudget ? 'error.main' : 'success.main' }}
        size={150}
      />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="h6" component="div" color={isOverBudget ? 'error' : 'text.primary'}>
          {isOverBudget ? 'Over Budget' : `${Math.min(value, 100).toFixed(1)}%`}
        </Typography>
      </Box>
    </Box>
  );
}
