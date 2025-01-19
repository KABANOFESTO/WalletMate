'use client';

import * as React from "react";
import type { Metadata } from "next";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Unstable_Grid2";
import Card from "@mui/material/Card";
import InputAdornment from "@mui/material/InputAdornment";
import OutlinedInput from "@mui/material/OutlinedInput";
import { Download, PlusCircle, Upload, Search, TrendingUp, Wallet, DollarSign } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useMediaQuery, useTheme, Chip, Avatar } from "@mui/material";
import { AddAccountDialog } from "@/components/dashboard/account/add-account";

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
const accounts: Account[] = [
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
}): React.JSX.Element {
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
      {trend && (
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
function AccountsFilter(): React.JSX.Element {
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
      <OutlinedInput
        fullWidth
        placeholder="Search accounts..."
        startAdornment={
          <InputAdornment position="start">
            <Search size={20} />
          </InputAdornment>
        }
        sx={{
          borderRadius: 3,
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'transparent',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'transparent',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: 'primary.main',
          },
        }}
      />
    </Card>
  );
}

// Account Card component
function AccountCard({ account }: { account: Account }): React.JSX.Element {
  const formattedDate = React.useMemo(() => {
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
const calculateTotalBalance = (accounts: Account[]): number => {
  return accounts.reduce((total, account) => {
    if (account.currency === 'EUR') {
      return total + (account.balance * 1.1);
    }
    return total + account.balance;
  }, 0);
};

// Main Client Component
export default function AccountsPage(): React.JSX.Element {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const totalBalance = React.useMemo(() => calculateTotalBalance(accounts), []);

  // State to manage dialog visibility
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const handleDialogOpen = () => setIsDialogOpen(true);
  const handleDialogClose = () => setIsDialogOpen(false);

  return (
    <Stack spacing={4}>
      <Box sx={{ mb: 2 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          sx={{ mb: 4 }}
        >
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Accounts Dashboard
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<Upload size={20} />}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
              }}
            >
              Import
            </Button>
            <Button
              variant="contained"
              startIcon={<PlusCircle size={20} />}
              onClick={handleDialogOpen}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                boxShadow: "none",
                "&:hover": {
                  boxShadow: "none",
                },
              }}
            >
              Add Account
            </Button>
          </Stack>
        </Stack>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid xs={12} sm={6} md={4}>
            <StatsCard
              icon={Wallet}
              title="Total Balance"
              value={`$${totalBalance.toLocaleString()}`}
              trend="+12.5%"
            />
          </Grid>
          <Grid xs={12} sm={6} md={4}>
            <StatsCard
              icon={DollarSign}
              title="Monthly Income"
              value="$12,345.67"
              trend="+8.2%"
            />
          </Grid>
          <Grid xs={12} sm={6} md={4}>
            <StatsCard
              icon={TrendingUp}
              title="Active Accounts"
              value={accounts.length.toString()}
            />
          </Grid>
        </Grid>
      </Box>

      <AccountsFilter />

      <Grid container spacing={3}>
        {accounts.map((account) => (
          <Grid key={account.id} xs={12} sm={6} lg={4}>
            <AccountCard account={account} />
          </Grid>
        ))}
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Pagination
          count={3}
          size={isMobile ? "small" : "medium"}
          sx={{
            '& .MuiPaginationItem-root': {
              borderRadius: 2,
              '&.Mui-selected': {
                backgroundColor: 'primary.main',
                color: 'primary.contrastText',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
              },
            },
          }}
        />
      </Box>

      {/* AddAccountDialog with required props */}
      <AddAccountDialog open={isDialogOpen} onClose={handleDialogClose} />
    </Stack>
  );
}
