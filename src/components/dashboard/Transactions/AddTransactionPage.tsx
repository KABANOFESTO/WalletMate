'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Grid,
    InputAdornment,
    MenuItem,
    Typography,
    Alert,
    CircularProgress
} from '@mui/material';
import { Save, Banknote, FolderTree, Calendar, X } from 'lucide-react';
import dayjs from 'dayjs';
import { useAuth } from '@/hooks/use-auth';
import { createTransaction } from '@/services/transaction';
import { toast } from 'react-toastify';

interface AddTransactionDialogProps {
    open: boolean;
    onClose: () => void;
}

export function AddTransactionDialog({ open, onClose }: AddTransactionDialogProps) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const [transaction, setTransaction] = useState<{
        description: string;
        amount: string;
        type: 'INCOME' | 'EXPENSE';
        category: { id: number; name: string };
        subcategory: string;
        date: string;
        account: { id: number; name: string; type: 'BANK' | 'MOBILE_MONEY' | 'CASH'; balance: number };
    }>({
        description: '',
        amount: '',
        type: 'EXPENSE',
        category: { id: 1, name: '' },
        subcategory: '',
        date: dayjs().format('YYYY-MM-DD'),
        account: { id: 1, name: '', type: 'BANK', balance: 0 },
    });

    // Reset form when dialog opens
    useEffect(() => {
        if (open) {
            setTransaction({
                description: '',
                amount: '',
                type: 'EXPENSE',
                category: { id: 1, name: '' },
                subcategory: '',
                date: dayjs().format('YYYY-MM-DD'),
                account: { id: 1, name: '', type: 'BANK', balance: 0 },
            });
            setError(null);
        }
    }, [open]);

    const handleChange = (field: keyof typeof transaction) => (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setTransaction((prev) => ({
            ...prev,
            [field]: event.target.value,
        }));
    };

    const handleAccountTypeChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setTransaction((prev) => ({
            ...prev,
            account: {
                ...prev.account,
                type: event.target.value as 'BANK' | 'MOBILE_MONEY' | 'CASH'
            }
        }));
    };

    const handleCategoryChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setTransaction((prev) => ({
            ...prev,
            category: {
                ...prev.category,
                name: event.target.value
            }
        }));
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!user?.id) {
            setError('User not authenticated');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const amount = parseFloat(transaction.amount);
            if (isNaN(amount) || amount <= 0) {
                throw new Error('Please enter a valid amount');
            }

            await createTransaction({
                accountId: transaction.account.id,
                description: transaction.description,
                amount: amount,
                type: transaction.type,
                date: transaction.date || new Date().toISOString().split('T')[0],
                categoryId: transaction.category.id
            });

            onClose();
            toast.success('Transaction created successfully');
        } catch (err) {
            console.error('Failed to create transaction:', err);
            setError(err instanceof Error ? err.message : 'Failed to create transaction');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="sm"
            fullWidth
        >
            <form onSubmit={handleSubmit}>
                <DialogTitle>
                    <Grid container alignItems="center" justifyContent="space-between">
                        <Typography variant="h6">Add New Transaction</Typography>
                        <Button
                            onClick={onClose}
                            color="inherit"
                            startIcon={<X />}
                        >
                            Close
                        </Button>
                    </Grid>
                </DialogTitle>

                <DialogContent>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                label="Description"
                                fullWidth
                                value={transaction.description}
                                onChange={handleChange('description')}
                                required
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Amount"
                                fullWidth
                                type="number"
                                value={transaction.amount}
                                onChange={handleChange('amount')}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Banknote size={20} />
                                        </InputAdornment>
                                    ),
                                }}
                                required
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                select
                                label="Type"
                                fullWidth
                                value={transaction.type}
                                onChange={handleChange('type')}
                                required
                            >
                                <MenuItem value="INCOME">Income</MenuItem>
                                <MenuItem value="EXPENSE">Expense</MenuItem>
                            </TextField>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                select
                                label="Account Type"
                                fullWidth
                                value={transaction.account.type}
                                onChange={handleAccountTypeChange}
                                required
                            >
                                <MenuItem value="BANK">Bank Account</MenuItem>
                                <MenuItem value="MOBILE_MONEY">Mobile Money</MenuItem>
                                <MenuItem value="CASH">Cash</MenuItem>
                            </TextField>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                type="date"
                                label="Date"
                                fullWidth
                                value={transaction.date}
                                onChange={handleChange('date')}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Calendar size={20} />
                                        </InputAdornment>
                                    ),
                                }}
                                required
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Category"
                                fullWidth
                                value={transaction.category.name}
                                onChange={handleCategoryChange}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <FolderTree size={20} />
                                        </InputAdornment>
                                    ),
                                }}
                                required
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Subcategory"
                                fullWidth
                                value={transaction.subcategory}
                                onChange={handleChange('subcategory')}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>

                <DialogActions sx={{ p: 2 }}>
                    <Button
                        variant="contained"
                        color="primary"
                        type="submit"
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                    >
                        {loading ? 'Saving...' : 'Save Transaction'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
