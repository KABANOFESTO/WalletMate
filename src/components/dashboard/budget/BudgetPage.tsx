'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  LinearProgress,
  IconButton,
  Box,
  Stack,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { PencilSimple as EditIcon, Trash as DeleteIcon, Plus as PlusIcon } from '@phosphor-icons/react';
import { useAuth } from '@/hooks/use-auth';
import { budgetService, type Budget, type CreateBudgetRequest, type Category } from '@/services/budget';
import { categoryService } from '@/services/category';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import dayjs from 'dayjs';
import { toast } from 'react-hot-toast';

// Pie chart colors
const COLORS = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'];

export function BudgetPage(): JSX.Element {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [formData, setFormData] = useState<CreateBudgetRequest>({
    userId: Number(user?.id) || 0,
    categoryId: 0,
    limit: 0,
    startDate: dayjs().format('YYYY-MM-DD'),
    endDate: dayjs().add(1, 'month').format('YYYY-MM-DD'),
  });

  const fetchBudgets = async () => {
    if (!user?.id) return;
    
    try {
      const data = await budgetService.getUserBudgets(Number(user.id));
      setBudgets(data);
    } catch (error) {
      toast.error('Failed to fetch budgets');
      console.error('Failed to fetch budgets:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      if (!user) {
        toast.error('User not authenticated');
        return;
      }
      const data = await categoryService.getCategories(Number(user.id));
      setCategories(data);
    } catch (error) {
      toast.error('Failed to fetch categories');
      console.error('Failed to fetch categories:', error);
    }
  };

  useEffect(() => {
    const initializePage = async () => {
      setLoading(true);
      await Promise.all([fetchBudgets(), fetchCategories()]);
      setLoading(false);
    };

    if (user?.id) {
      initializePage();
    }
  }, [user?.id]);

  const handleOpenDialog = (budget?: Budget) => {
    if (budget) {
      setSelectedBudget(budget);
      setFormData({
        userId: budget.userId,
        categoryId: budget.categoryId,
        subcategoryId: budget.subcategoryId,
        limit: budget.limit,
        startDate: budget.startDate,
        endDate: budget.endDate,
      });
    } else {
      setSelectedBudget(null);
      setFormData({
        userId: Number(user?.id),
        categoryId: 0,
        limit: 0,
        startDate: dayjs().format('YYYY-MM-DD'),
        endDate: dayjs().add(1, 'month').format('YYYY-MM-DD'),
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedBudget(null);
    setFormData({
      userId: Number(user?.id),
      categoryId: 0,
      limit: 0,
      startDate: dayjs().format('YYYY-MM-DD'),
      endDate: dayjs().add(1, 'month').format('YYYY-MM-DD'),
    });
  };

  const handleSubmit = async () => {
    if (!user?.id || submitting) return;

    setSubmitting(true);
    try {
      if (selectedBudget) {
        await budgetService.updateBudget(selectedBudget.id, {
          limit: formData.limit,
          startDate: formData.startDate,
          endDate: formData.endDate,
        });
        toast.success('Budget updated successfully');
      } else {
        await budgetService.createBudget({
          ...formData,
          userId: Number(user.id),
        });
        toast.success('Budget created successfully');
      }
      handleCloseDialog();
      fetchBudgets();
    } catch (error) {
      console.error('Failed to save budget:', error);
      toast.error(selectedBudget ? 'Failed to update budget' : 'Failed to create budget');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (budgetId: number) => {
    try {
      await budgetService.deleteBudget(budgetId);
      toast.success('Budget deleted successfully');
      fetchBudgets();
    } catch (error) {
      console.error('Failed to delete budget:', error);
      toast.error('Failed to delete budget');
    }
  };

  // Calculate total budget and spent
  const totalBudget = budgets.reduce((sum, budget) => sum + budget.limit, 0);
  const totalSpent = budgets.reduce((sum, budget) => sum + budget.currentSpent, 0);
  const totalProgress = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  const isOverBudget = totalSpent > totalBudget;

  // Prepare data for pie chart
  const categoryData = budgets.map((budget) => ({
    name: budget.categoryName,
    value: budget.currentSpent,
  }));

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <LinearProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Stack spacing={3}>
        {/* Overview */}
        <Card>
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <CircularProgressWithLabel
                    value={totalProgress}
                    isOverBudget={isOverBudget}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Stack spacing={2}>
                  <Typography variant="h6">Budget Overview</Typography>
                  <Typography variant="body1">
                    Total Budget: ${totalBudget.toLocaleString()}
                  </Typography>
                  <Typography variant="body1">
                    Total Spent: ${totalSpent.toLocaleString()}
                  </Typography>
                  <Typography variant="body1">
                    Remaining: ${(totalBudget - totalSpent).toLocaleString()}
                  </Typography>
                  {isOverBudget && (
                    <Typography color="error" variant="body1">
                      Warning: You are over your total budget by ${(totalSpent - totalBudget).toLocaleString()}
                    </Typography>
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
            <Box sx={{ width: '100%', height: 400 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={150}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>

        {/* Budget List */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">Budget Management</Typography>
          <Button
            variant="contained"
            startIcon={<PlusIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Budget
          </Button>
        </Box>

        <Grid container spacing={3}>
          {budgets.map((budget) => (
            <Grid item xs={12} md={6} key={budget.id}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography variant="h6">{budget.categoryName}</Typography>
                      {budget.subcategoryName && (
                        <Typography color="textSecondary" gutterBottom>
                          {budget.subcategoryName}
                        </Typography>
                      )}
                    </Box>
                    <Box>
                      <IconButton size="small" onClick={() => handleOpenDialog(budget)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete(budget.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                  
                  <Box mt={2}>
                    <Typography variant="body2" color="textSecondary">
                      Spent: ${budget.currentSpent.toLocaleString()} / ${budget.limit.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Remaining: ${budget.remainingAmount.toLocaleString()}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={budget.spentPercentage}
                      sx={{ mt: 1 }}
                      color={budget.spentPercentage > 90 ? "error" : budget.spentPercentage > 75 ? "warning" : "primary"}
                    />
                  </Box>

                  <Box mt={2}>
                    <Typography variant="body2" color="textSecondary">
                      Period: {dayjs(budget.startDate).format('MMM D, YYYY')} - {dayjs(budget.endDate).format('MMM D, YYYY')}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {selectedBudget ? 'Edit Budget' : 'Create New Budget'}
          </DialogTitle>
          <DialogContent>
            <Box component="form" sx={{ mt: 2 }}>
              <TextField
                fullWidth
                select
                label="Category"
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: Number(e.target.value) })}
                margin="normal"
                disabled={submitting}
              >
                <MenuItem value={0} disabled>Select a category</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </TextField>
              
              {formData.categoryId !== 0 && categories.find(c => c.id === formData.categoryId)?.subcategories && (
                <TextField
                  fullWidth
                  select
                  label="Subcategory"
                  value={formData.subcategoryId || ''}
                  onChange={(e) => setFormData({ ...formData, subcategoryId: Number(e.target.value) })}
                  margin="normal"
                  disabled={submitting}
                >
                  <MenuItem value="">No subcategory</MenuItem>
                  {categories
                    .find(c => c.id === formData.categoryId)
                    ?.subcategories?.map((sub) => (
                      <MenuItem key={sub.id} value={sub.id}>
                        {sub.name}
                      </MenuItem>
                    ))}
                </TextField>
              )}

              <TextField
                fullWidth
                type="number"
                label="Budget Limit"
                value={formData.limit}
                onChange={(e) => setFormData({ ...formData, limit: Number(e.target.value) })}
                margin="normal"
                disabled={submitting}
                inputProps={{ min: 0 }}
              />
              
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={6}>
                  <DatePicker
                    label="Start Date"
                    value={dayjs(formData.startDate)}
                    onChange={(date) => setFormData({ ...formData, startDate: date?.format('YYYY-MM-DD') || '' })}
                    slotProps={{ 
                      textField: { 
                        fullWidth: true,
                        disabled: submitting
                      } 
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <DatePicker
                    label="End Date"
                    value={dayjs(formData.endDate)}
                    onChange={(date) => setFormData({ ...formData, endDate: date?.format('YYYY-MM-DD') || '' })}
                    slotProps={{ 
                      textField: { 
                        fullWidth: true,
                        disabled: submitting
                      } 
                    }}
                  />
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} disabled={submitting}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              variant="contained" 
              disabled={submitting || formData.categoryId === 0 || formData.limit <= 0}
            >
              {submitting ? 'Saving...' : selectedBudget ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>
      </Stack>
    </Container>
  );
}

// Circular Progress with Label component
function CircularProgressWithLabel(props: {
  value: number;
  isOverBudget: boolean;
}): JSX.Element {
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <CircularProgress
        variant="determinate"
        value={Math.min(props.value, 100)}
        sx={{ color: props.isOverBudget ? 'error.main' : 'success.main' }}
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
        <Typography variant="h6" component="div" color={props.isOverBudget ? 'error' : 'text.primary'}>
          {props.isOverBudget ? 'Over Budget' : `${Math.min(props.value, 100).toFixed(1)}%`}
        </Typography>
      </Box>
    </Box>
  );
}
