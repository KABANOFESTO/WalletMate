'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useRouter, useSearchParams } from 'next/navigation';
import { paths } from '@/paths';
import { passwordService } from '@/services/password';

export default function Page(): React.JSX.Element {
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  React.useEffect(() => {
    if (!token) {
      router.push(paths.auth.login);
    }
  }, [token, router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setIsSubmitting(true);

    try {
      await passwordService.resetPassword(token!, password);
      setSuccess(true);
    } catch (err) {
      setError('Failed to reset password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return null;
  }

  if (success) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          justifyContent: 'center',
          alignItems: 'center',
          p: 3,
        }}
      >
        <Card sx={{ maxWidth: 450, width: '100%' }}>
          <CardHeader
            title="Password Reset Successful"
            sx={{ textAlign: 'center' }}
          />
          <CardContent>
            <Typography align="center" sx={{ mb: 3 }}>
              Your password has been successfully reset.
              You can now log in with your new password.
            </Typography>
            <Button
              fullWidth
              onClick={() => router.push(paths.auth.login)}
              variant="contained"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        justifyContent: 'center',
        alignItems: 'center',
        p: 3,
      }}
    >
      <Card sx={{ maxWidth: 450, width: '100%' }}>
        <CardHeader
          title="Reset Password"
          sx={{ textAlign: 'center' }}
        />
        <CardContent>
          <form onSubmit={handleSubmit} noValidate>
            <Stack spacing={3}>
              <TextField
                autoFocus
                fullWidth
                label="New Password"
                name="password"
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                value={password}
              />
              <TextField
                fullWidth
                label="Confirm Password"
                name="confirmPassword"
                onChange={(event) => setConfirmPassword(event.target.value)}
                type="password"
                value={confirmPassword}
              />
              {error && (
                <Typography color="error" variant="body2">
                  {error}
                </Typography>
              )}
              <Button
                disabled={isSubmitting}
                fullWidth
                size="large"
                type="submit"
                variant="contained"
              >
                Reset Password
              </Button>
              <Link
                href={paths.auth.login}
                sx={{ textAlign: 'center' }}
                underline="hover"
                variant="body2"
              >
                Back to login
              </Link>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}
