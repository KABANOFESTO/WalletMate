'use client';

import * as React from 'react';
import { useState } from 'react';
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
    Typography
} from '@mui/material';
import { Save, Wallet, Building, CreditCard, X, } from 'lucide-react';
import dayjs from 'dayjs';

interface AddAccountDialogProps {
    open: boolean;
    onClose: () => void;
}

export function AddAccountDialog({ open, onClose }: AddAccountDialogProps) {
    const accountTypes = {
        'Savings': ['Personal Savings', 'Joint Savings', 'Fixed Deposit'],
        'Current': ['Personal Current', 'Business Current'],
        'Investment': ['Stocks', 'Mutual Funds', 'Retirement'],
        'Credit': ['Credit Card', 'Line of Credit'],
        'Digital': ['Mobile Money', 'E-Wallet'],
    };

    const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD'];

    const [account, setAccount] = useState<{
        name: string;
        accountNumber: string;
        type: keyof typeof accountTypes | '';
        subType: string;
        balance: string;
        currency: string;
        description: string;
        institution: string;
    }>({
        name: '',
        accountNumber: '',
        type: '',
        subType: '',
        balance: '',
        currency: 'USD',
        description: '',
        institution: '',
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        if (name === 'type') {
            setAccount({ ...account, [name]: value as keyof typeof accountTypes, subType: '' });
        } else {
            setAccount({ ...account, [name]: value });
        }
    };

    const handleSubmit = () => {
        console.log('Account Created:', account);
        // Add your submission logic here
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Add New Account
                <Button onClick={onClose} color="inherit" sx={{ minWidth: 'auto', p: 0.5 }}>
                    <X className="w-5 h-5" />
                </Button>
            </DialogTitle>
            <DialogContent dividers>
                <Grid container spacing={3}>
                    {/* Account Name */}
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Account Name"
                            name="name"
                            value={account.name}
                            onChange={handleInputChange}
                            variant="outlined"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Wallet className="w-5 h-5" />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Grid>

                    {/* Account Number */}
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Account Number"
                            name="accountNumber"
                            value={account.accountNumber}
                            onChange={handleInputChange}
                            variant="outlined"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <CreditCard className="w-5 h-5" />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Grid>

                    {/* Account Type */}
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Account Type"
                            name="type"
                            select
                            value={account.type}
                            onChange={handleInputChange}
                            variant="outlined"
                        >
                            {Object.keys(accountTypes).map((type) => (
                                <MenuItem key={type} value={type}>
                                    {type}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    {/* Account SubType */}
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Account SubType"
                            name="subType"
                            select
                            value={account.subType}
                            onChange={handleInputChange}
                            variant="outlined"
                            disabled={!account.type}
                        >
                            {account.type &&
                                accountTypes[account.type].map((subType) => (
                                    <MenuItem key={subType} value={subType}>
                                        {subType}
                                    </MenuItem>
                                ))}
                        </TextField>
                    </Grid>

                    {/* Initial Balance */}
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Initial Balance"
                            name="balance"
                            type="number"
                            value={account.balance}
                            onChange={handleInputChange}
                            variant="outlined"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <CreditCard className="w-5 h-5" />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Grid>

                    {/* Currency */}
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Currency"
                            name="currency"
                            select
                            value={account.currency}
                            onChange={handleInputChange}
                            variant="outlined"
                        >
                            {currencies.map((currency) => (
                                <MenuItem key={currency} value={currency}>
                                    {currency}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    {/* Financial Institution */}
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Financial Institution"
                            name="institution"
                            value={account.institution}
                            onChange={handleInputChange}
                            variant="outlined"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Building className="w-5 h-5" />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Grid>

                    {/* Description */}
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Description"
                            name="description"
                            value={account.description}
                            onChange={handleInputChange}
                            variant="outlined"
                            multiline
                            rows={3}
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button
                    variant="contained"
                    startIcon={<Save className="w-5 h-5" />}
                    onClick={handleSubmit}
                >
                    Save Account
                </Button>
            </DialogActions>
        </Dialog>
    );
}