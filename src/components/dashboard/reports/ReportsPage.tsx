import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Box,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Card,
  CardContent,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useAuth } from '@/hooks/use-auth';
import { reportService } from '@/services/report';
import dayjs, { Dayjs } from 'dayjs';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`reports-tabpanel-${index}`}
      aria-labelledby={`reports-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function ReportsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [startDate, setStartDate] = useState<Dayjs | null>(dayjs().subtract(30, 'day'));
  const [endDate, setEndDate] = useState<Dayjs | null>(dayjs());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [categorySummary, setCategorySummary] = useState<any>(null);
  const [accountsSummary, setAccountsSummary] = useState<any>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const generateReport = async () => {
    if (!user?.id || !startDate || !endDate) return;

    setLoading(true);
    setError(null);

    try {
      const report = await reportService.generateReport(Number(user.id), {
        startDate: startDate.format('YYYY-MM-DD'),
        endDate: endDate.format('YYYY-MM-DD'),
      });
      setReportData(report);

      const categoryData = await reportService.getCategorySummary(
        Number(user.id),
        startDate.format('YYYY-MM-DD'),
        endDate.format('YYYY-MM-DD')
      );
      setCategorySummary(categoryData);

      const accountsData = await reportService.getAccountsSummary(
        Number(user.id),
        startDate.format('YYYY-MM-DD'),
        endDate.format('YYYY-MM-DD')
      );
      setAccountsSummary(accountsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      generateReport();
    }
  }, [user?.id]);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Financial Reports
        </Typography>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={4}>
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={(newValue) => setStartDate(newValue)}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <DatePicker
              label="End Date"
              value={endDate}
              onChange={(newValue) => setEndDate(newValue)}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Button
              variant="contained"
              onClick={generateReport}
              disabled={loading || !startDate || !endDate}
              sx={{ mt: 1 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Generate Report'}
            </Button>
          </Grid>
        </Grid>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Overview" />
            <Tab label="Categories" />
            <Tab label="Accounts" />
          </Tabs>
        </Box>

        <TabPanel value={activeTab} index={0}>
          {reportData && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Total Income
                    </Typography>
                    <Typography variant="h4" color="success.main">
                      ${reportData.totalIncome?.toFixed(2)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Total Expenses
                    </Typography>
                    <Typography variant="h4" color="error.main">
                      ${reportData.totalExpense?.toFixed(2)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          {categorySummary && (
            <Grid container spacing={3}>
              {Object.entries(categorySummary).map(([category, data]: [string, any]) => (
                <Grid item xs={12} md={6} key={category}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {category}
                      </Typography>
                      <Typography variant="body1">
                        Total: ${data.totalAmount?.toFixed(2)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {data.transactionCount} transactions ({data.percentage?.toFixed(1)}%)
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          {accountsSummary && (
            <Grid container spacing={3}>
              {Object.entries(accountsSummary).map(([accountId, data]: [string, any]) => (
                <Grid item xs={12} key={accountId}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {data.accountName} ({data.accountType})
                      </Typography>
                      <Typography variant="body1">
                        Current Balance: ${data.currentBalance?.toFixed(2)}
                      </Typography>
                      {data.transactions && data.transactions.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Recent Transactions
                          </Typography>
                          {data.transactions.map((tx: any, index: number) => (
                            <Box key={index} sx={{ mt: 1 }}>
                              <Typography variant="body2">
                                {dayjs(tx.date).format('MMM D, YYYY')} - {tx.description}:{' '}
                                <span style={{ color: tx.type === 'EXPENSE' ? 'red' : 'green' }}>
                                  ${tx.amount?.toFixed(2)}
                                </span>
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>
      </Paper>
    </Container>
  );
}
