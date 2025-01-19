'use client';

import React, { useState } from 'react';
import {
    useTheme,
    useMediaQuery,
    Box,
    Stack,
    Typography,
    Grid,
    Card,
    CardContent,
    CircularProgress,
    CircularProgressProps,
    Button,
    TextField,
    Tooltip,
} from '@mui/material';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import dayjs from 'dayjs';

// Sample transaction data
const transactions = [
    { id: 1, category: 'Food', amount: 200, type: 'Expense', date: '2025-01-10' },
    { id: 2, category: 'Rent', amount: 1000, type: 'Expense', date: '2025-01-05' },
    { id: 3, category: 'Transport', amount: 150, type: 'Expense', date: '2025-01-12' },
    { id: 4, category: 'Entertainment', amount: 300, type: 'Expense', date: '2025-01-15' },
];

// Pie chart colors
const COLORS = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'];

// Function to calculate total expenses
const calculateTotalExpenses = () =>
    transactions.reduce((acc, txn) => (txn.type === 'Expense' ? acc + txn.amount : acc), 0);

// BudgetPage Component
export default function BudgetPage() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // State for budget and notification
    const [budget, setBudget] = useState(2000); // Default budget
    const [totalExpenses, setTotalExpenses] = useState(calculateTotalExpenses());
    const [budgetInput, setBudgetInput] = useState('');

    // Budget exceeded flag
    const isOverBudget = totalExpenses > budget;

    // Data for pie chart
    const categoryData = transactions
        .filter((txn) => txn.type === 'Expense')
        .reduce((acc, txn) => {
            acc[txn.category] = (acc[txn.category] || 0) + txn.amount;
            return acc;
        }, {} as Record<string, number>);

    const pieChartData = Object.entries(categoryData).map(([name, value]) => ({
        name,
        value,
    }));

    // Handle budget update
    const handleBudgetUpdate = () => {
        const newBudget = parseFloat(budgetInput);
        if (!isNaN(newBudget) && newBudget > 0) {
            setBudget(newBudget);
            setBudgetInput('');
        }
    };

    return (
        <Stack spacing={4} sx={{ p: isMobile ? 2 : 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
                Budget Management
            </Typography>

            {/* Budget Overview */}
            <Card>
                <CardContent>
                    <Grid container spacing={3} alignItems="center">
                        <Grid item xs={12} md={6}>
                            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                <CircularProgressWithLabel
                                    value={(totalExpenses / budget) * 100}
                                    isOverBudget={isOverBudget}
                                />
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Stack spacing={2}>
                                <Typography variant="h6">Set Your Monthly Budget</Typography>
                                <TextField
                                    label="Budget ($)"
                                    variant="outlined"
                                    value={budgetInput}
                                    onChange={(e) => setBudgetInput(e.target.value)}
                                    type="number"
                                    fullWidth
                                />
                                <Button
                                    variant="contained"
                                    onClick={handleBudgetUpdate}
                                    sx={{ textTransform: 'none', borderRadius: 2 }}
                                >
                                    Update Budget
                                </Button>
                                {isOverBudget && (
                                    <Tooltip title="Your spending has exceeded the budget!" arrow>
                                        <Typography color="error" variant="body1">
                                            Warning: You are over your budget by ${(totalExpenses - budget).toFixed(2)}
                                        </Typography>
                                    </Tooltip>
                                )}
                            </Stack>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Category Spending Pie Chart */}
            <Card>
                <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        Spending by Category
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={pieChartData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                fill="#8884d8"
                                label={(entry) => `${entry.name}: $${entry.value}`}
                            >
                                {pieChartData.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <RechartsTooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card>
                <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        Recent Transactions
                    </Typography>
                    {transactions.map((txn) => (
                        <Box key={txn.id} sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                            <Typography>{txn.category}</Typography>
                            <Typography>${txn.amount}</Typography>
                        </Box>
                    ))}
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
}) {
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
