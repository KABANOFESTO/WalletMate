'use client';

import React, { useState } from 'react';
import { useTheme, useMediaQuery, Stack, Box, Typography, Card, Grid, Button, TextField } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import dayjs, { Dayjs } from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
dayjs.extend(isBetween);
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { SaveAlt } from '@mui/icons-material';

// Sample transaction data for reports
const transactions = [
  { id: 1, category: 'Food', amount: 200, type: 'Expense', date: '2025-01-10' },
  { id: 2, category: 'Rent', amount: 1000, type: 'Expense', date: '2025-01-05' },
  { id: 3, category: 'Salary', amount: 3000, type: 'Income', date: '2025-01-01' },
  { id: 4, category: 'Transport', amount: 150, type: 'Expense', date: '2025-01-12' },
];

// Colors for the pie chart
const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7f50'];

export default function ReportsPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // State for date range
  const [startDate, setStartDate] = useState<Dayjs | null>(dayjs().startOf('month'));
  const [endDate, setEndDate] = useState<Dayjs | null>(dayjs().endOf('month'));

  // Filtered transactions based on date range
  const filteredTransactions = transactions.filter((txn) =>
    dayjs(txn.date).isBetween(startDate, endDate, null, '[]')
  );

  // Summarized data for charts
  const summaryData = filteredTransactions.reduce(
    (acc, txn) => {
      if (txn.type === 'Income') {
        acc.income += txn.amount;
      } else {
        acc.expenses += txn.amount;
        acc.categories[txn.category] = (acc.categories[txn.category] || 0) + txn.amount;
      }
      return acc;
    },
    { income: 0, expenses: 0, categories: {} as Record<string, number> }
  );

  const categoryData = Object.entries(summaryData.categories).map(([name, value]) => ({
    name,
    value,
  }));

  // Handle CSV Download
  const handleDownloadCSV = () => {
    const headers = ['Date', 'Category', 'Amount', 'Type'];
    const rows = filteredTransactions.map((txn) => [txn.date, txn.category, txn.amount, txn.type]);
    const csvContent =
      [headers, ...rows]
        .map((row) => row.join(','))
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'transactions_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Stack spacing={4}>
      <Typography variant="h4" sx={{ fontWeight: 700 }}>
        Reports
      </Typography>

      {/* Date Range Picker */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <DatePicker
            label="Start Date"
            value={startDate}
            onChange={(newDate) => setStartDate(newDate)}
            slotProps={{
              textField: { fullWidth: true },
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <DatePicker
            label="End Date"
            value={endDate}
            onChange={(newDate) => setEndDate(newDate)}
            slotProps={{
              textField: { fullWidth: true },
            }}
          />
        </Grid>
      </Grid>

      {/* Summary Cards */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ p: 3 }}>
            <Typography>Total Income</Typography>
            <Typography variant="h5" color="success.main">
              ${summaryData.income.toLocaleString()}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ p: 3 }}>
            <Typography>Total Expenses</Typography>
            <Typography variant="h5" color="error.main">
              ${summaryData.expenses.toLocaleString()}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ p: 3 }}>
            <Typography>Net Balance</Typography>
            <Typography variant="h5" color={summaryData.income - summaryData.expenses >= 0 ? 'success.main' : 'error.main'}>
              ${(summaryData.income - summaryData.expenses).toLocaleString()}
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Expense Distribution by Category
          </Typography>
          <PieChart width={isMobile ? 300 : 400} height={300}>
            <Pie
              data={categoryData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              label={(entry) => `${entry.name}: $${entry.value}`}
            >
              {categoryData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Income vs Expenses
          </Typography>
          <BarChart width={isMobile ? 300 : 400} height={300} data={[{ name: 'Summary', Income: summaryData.income, Expenses: summaryData.expenses }]}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Income" fill="#82ca9d" />
            <Bar dataKey="Expenses" fill="#8884d8" />
          </BarChart>
        </Grid>
      </Grid>

      {/* Download Report Button */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Button
          variant="contained"
          startIcon={<SaveAlt />}
          sx={{ textTransform: 'none', borderRadius: 2 }}
          onClick={handleDownloadCSV}
        >
          Download CSV
        </Button>
      </Box>
    </Stack>
  );
}
