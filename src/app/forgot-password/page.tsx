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
import { useRouter } from 'next/navigation';
import { paths } from '@/paths';
import { passwordService } from '@/services/password';

export default function Page(): React.JSX.Element {
  const [email, setEmail] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState(false);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await passwordService.requestPasswordReset(email);
      setSuccess(true);
    } catch (err) {
      setError('Failed to send reset email. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
            title="Check Your Email"
            sx={{ textAlign: 'center' }}
          />
          <CardContent>
            <Typography align="center" sx={{ mb: 3 }}>
              We have sent password reset instructions to your email address.
              Please check your inbox and follow the instructions to reset your password.
            </Typography>
            <Button
              fullWidth
              onClick={() => router.push(paths.auth.login)}
              variant="contained"
            >
              Back to Login
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
          title="Forgot Password"
          sx={{ textAlign: 'center' }}
        />
        <CardContent>
          <form onSubmit={handleSubmit} noValidate>
            <Stack spacing={3}>
              <TextField
                autoFocus
                fullWidth
                label="Email Address"
                name="email"
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                value={email}
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
                Send Reset Link
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
