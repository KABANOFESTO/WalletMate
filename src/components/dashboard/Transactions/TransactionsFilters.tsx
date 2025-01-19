'use client';

import * as React from 'react';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import { MagnifyingGlass as MagnifyingGlassIcon } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';

interface TransactionsFiltersProps {
  onFilterChange: (filters: {
    startDate: string;
    endDate: string;
    type: string;
    categoryId?: number;
    search: string;
  }) => void;
}

export function TransactionsFilters({ onFilterChange }: TransactionsFiltersProps): React.JSX.Element {
  const [filters, setFilters] = React.useState({
    search: '',
    type: '',
    categoryId: undefined as number | undefined,
    startDate: '',
    endDate: ''
  });

  // Debounce filter changes
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange(filters);
    }, 500);

    return () => clearTimeout(timer);
  }, [filters, onFilterChange]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, search: event.target.value }));
  };

  const handleTypeChange = (event: SelectChangeEvent<string>) => {
    setFilters(prev => ({ ...prev, type: event.target.value }));
  };

  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card
      sx={{
        p: 2,
        borderRadius: 2,
        boxShadow: 2,
        backgroundColor: 'background.paper',
      }}
    >
      <Grid container spacing={2} alignItems="center">
        {/* Search Bar */}
        <Grid item xs={12} sm={6} md={4}>
          <OutlinedInput
            value={filters.search}
            onChange={handleSearchChange}
            fullWidth
            placeholder="Search transactions"
            startAdornment={(
              <InputAdornment position="start">
                <MagnifyingGlassIcon />
              </InputAdornment>
            )}
          />
        </Grid>

        {/* Transaction Type Filter */}
        <Grid item xs={12} sm={6} md={2}>
          <Select
            value={filters.type}
            onChange={handleTypeChange}
            fullWidth
            displayEmpty
          >
            <MenuItem value="">All Types</MenuItem>
            <MenuItem value="INCOME">Income</MenuItem>
            <MenuItem value="EXPENSE">Expense</MenuItem>
          </Select>
        </Grid>

        {/* Date Range Filters */}
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            type="date"
            label="Start Date"
            value={filters.startDate}
            onChange={(e) => handleDateChange('startDate', e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            type="date"
            label="End Date"
            value={filters.endDate}
            onChange={(e) => handleDateChange('endDate', e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
      </Grid>
    </Card>
  );
}
