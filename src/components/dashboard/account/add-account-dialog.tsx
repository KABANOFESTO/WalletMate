import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  SelectChangeEvent,
} from '@mui/material';
import { accountService, CreateAccountDto, AccountType, accountTypeDisplayNames } from '@/services/account';
import { useAuth } from '@/hooks/use-auth';

interface AddAccountDialogProps {
  open: boolean;
  onClose: () => void;
  onAccountAdded: () => void;
}

const accountTypes = [
  { value: AccountType.BANK, label: accountTypeDisplayNames[AccountType.BANK] },
  { value: AccountType.MOBILE_MONEY, label: accountTypeDisplayNames[AccountType.MOBILE_MONEY] },
  { value: AccountType.CASH, label: accountTypeDisplayNames[AccountType.CASH] },
  { value: AccountType.SAVINGS, label: accountTypeDisplayNames[AccountType.SAVINGS] },
  { value: AccountType.INVESTMENT, label: accountTypeDisplayNames[AccountType.INVESTMENT] }
];

export function AddAccountDialog({ open, onClose, onAccountAdded }: AddAccountDialogProps): JSX.Element {
  const [formData, setFormData] = useState<CreateAccountDto>({
    name: '',
    type: AccountType.BANK,
    balance: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  // Handle text input changes
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle select input changes
  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    try {
      setIsSubmitting(true);
      await accountService.createAccount(formData);
      onAccountAdded();
      onClose();
    } catch (error) {
      console.error('Failed to create account:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Add New Account</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              name="name"
              label="Account Name"
              fullWidth
              required
              value={formData.name}
              onChange={handleTextChange}
            />
            <FormControl fullWidth required>
              <InputLabel>Account Type</InputLabel>
              <Select
                name="type"
                value={formData.type}
                label="Account Type"
                onChange={handleSelectChange}
              >
                {accountTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              name="balance"
              label="Initial Balance"
              type="number"
              fullWidth
              required
              value={formData.balance}
              onChange={handleTextChange}
              inputProps={{ step: '0.01' }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Adding...' : 'Add Account'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
