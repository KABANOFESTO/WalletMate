'use client';

import React, { useState, useMemo } from 'react';
import type { JSX } from 'react';
import { useMediaQuery, useTheme, Box, Button, Pagination, Stack, Typography, Chip, Avatar, Card, InputAdornment } from '@mui/material';
import Grid from "@mui/material/Unstable_Grid2";
import { DotsThreeVertical, Plus, ArrowDown, ArrowUp } from "@phosphor-icons/react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

// Add RelativeTime plugin to dayjs
dayjs.extend(relativeTime);

// Define the Account type
export interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
  logo: string;
  updatedAt: Date | string;
}

// Example accounts data
const defaultAccounts: Account[] = [
  {
    id: "ACC-001",
    name: "Personal Savings",
    type: "Savings",
    balance: 12500.45,
    currency: "USD",
    logo: "/api/placeholder/48/48",
    updatedAt: dayjs().subtract(10, "minute").toDate(),
  },
];

// Stats Card Component
function StatsCard({
  icon: Icon,
  title,
  value,
  trend
}: {
  icon: React.ElementType;
  title: string;
  value: string;
  trend?: string;
}): JSX.Element {
  return (
    <Card
      sx={{
        p: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 4,
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            backgroundColor: 'primary.light',
            color: 'primary.main',
            display: 'flex',
          }}
        >
          <Icon size={24} />
        </Box>
      </Box>
      <Typography variant="h6" sx={{ mb: 0.5 }}>
        {value}
      </Typography>
      <Typography color="text.secondary" variant="body2">
        {title}
      </Typography>
      {Boolean(trend) && (
        <Chip
          size="small"
          label={trend}
          color="success"
          sx={{ mt: 1, alignSelf: 'flex-start' }}
        />
      )}
    </Card>
  );
}

// Filter component
function AccountsFilter(): JSX.Element {
  return (
    <Card
      elevation={0}
      sx={{
        p: 2,
        mb: 3,
        borderRadius: 4,
        backgroundColor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <InputAdornment position="start">
        <DotsThreeVertical size={20} />
      </InputAdornment>
      <InputAdornment position="end">
        <ArrowDown size={20} />
        <ArrowUp size={20} />
      </InputAdornment>
    </Card>
  );
}

// Account Card component
function AccountCard({ account }: { account: Account }): JSX.Element {
  const formattedDate = useMemo(() => {
    return dayjs(account.updatedAt).fromNow();
  }, [account.updatedAt]);

  return (
    <Card
      sx={{
        p: 3,
        height: '100%',
        borderRadius: 4,
        transition: 'all 0.3s ease',
        background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
        },
      }}
    >
      <Stack spacing={2}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Avatar
            src={account.logo}
            alt={account.name}
            sx={{ width: 48, height: 48, backgroundColor: 'primary.light' }}
          />
          <Chip
            label={account.type}
            size="small"
            sx={{
              borderRadius: 2,
              backgroundColor: 'primary.lighter',
              color: 'primary.dark',
            }}
          />
        </Box>
        <Box>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            {account.name}
          </Typography>
          <Typography variant="h5" color="primary.main" sx={{ fontWeight: 600 }}>
            {account.currency} {account.balance.toLocaleString()}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Last updated {formattedDate}
          </Typography>
        </Box>
      </Stack>
    </Card>
  );
}

// Calculate total balance
const calculateTotalBalance = (accountList: Account[]): number => {
  return accountList.reduce((total, account) => {
    if (account.currency === 'EUR') {
      return total + account.balance * 1.1; // Example conversion rate
    }
    if (account.currency === 'GBP') {
      return total + account.balance * 1.3; // Example conversion rate
    }
    return total + account.balance;
  }, 0);
};

// Main Client Component
export default function AccountsPage(): JSX.Element {
  const theme = useTheme();
  const _isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [accounts, _setAccounts] = useState<Account[]>(defaultAccounts);
  const [_page, _setPage] = useState(1);

  const totalBalance = calculateTotalBalance(accounts);

  const handleAddAccount = (): void => {
    // Add account functionality will be implemented later
  };

  return (
    <Stack spacing={3}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Accounts</Typography>
        <Button
          variant="contained"
          startIcon={<Plus />}
          onClick={handleAddAccount}
          sx={{ borderRadius: 3 }}
        >
          Add Account
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid xs={12} md={4}>
          <StatsCard
            icon={DotsThreeVertical}
            title="Total Balance"
            value={`$${totalBalance.toLocaleString()}`}
            trend="+14% from last month"
          />
        </Grid>
        <Grid xs={12} md={4}>
          <StatsCard
            icon={ArrowDown}
            title="Monthly Growth"
            value="8.5%"
            trend="Positive trend"
          />
        </Grid>
        <Grid xs={12} md={4}>
          <StatsCard
            icon={ArrowUp}
            title="Average Balance"
            value={`$${(totalBalance / accounts.length).toLocaleString()}`}
          />
        </Grid>
      </Grid>

      <AccountsFilter />

      <Grid container spacing={3}>
        {accounts.map((account) => (
          <Grid key={account.id} xs={12} sm={6} md={4}>
            <AccountCard account={account} />
          </Grid>
        ))}
      </Grid>

      {accounts.length > 6 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination count={Math.ceil(accounts.length / 6)} color="primary" />
        </Box>
      )}
    </Stack>
  );
}
