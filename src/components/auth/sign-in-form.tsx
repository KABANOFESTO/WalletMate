'use client';

import * as React from 'react';
import RouterLink from 'next/link';
import { useRouter } from 'next/navigation';
import { login } from '@/services/auth';
import { useAuth } from '@/hooks/use-auth';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import Link from '@mui/material/Link';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Eye as EyeIcon } from '@phosphor-icons/react';
import { EyeSlash as EyeSlashIcon } from '@phosphor-icons/react';

import { paths } from '@/paths';

const validationSchema = Yup.object({
  email: Yup
    .string()
    .email('Must be a valid email')
    .max(255)
    .required('Email is required'),
  password: Yup
    .string()
    .max(255)
    .required('Password is required')
});

export function SignInForm(): React.JSX.Element {
  const router = useRouter();
  const { setUser } = useAuth();
  const [showPassword, setShowPassword] = React.useState<boolean>();
  const [error, setError] = React.useState('');

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      submit: null
    },
    validationSchema,
    onSubmit: async (values, helpers) => {
      try {
        const user = await login({
          email: values.email,
          password: values.password
        });
        setUser(user);
        router.push('/dashboard');
      } catch (err) {
        helpers.setStatus({ success: false });
        helpers.setErrors({ submit: 'Invalid email or password' });
        helpers.setSubmitting(false);
        setError('Invalid email or password');
      }
    }
  });

  return (
    <Stack spacing={4}>
      <Stack spacing={1}>
        <Typography variant="h4">Sign in</Typography>
        <Typography color="text.secondary" variant="body2">
          Don&apos;t have an account?{' '}
          <Link component={RouterLink} href={paths.auth.signUp} underline="hover" variant="subtitle2">
            Sign up
          </Link>
        </Typography>
      </Stack>
      {error && (
        <Alert severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      )}
      <form onSubmit={formik.handleSubmit}>
        <Stack spacing={2}>
          <FormControl error={Boolean(formik.errors.email)}>
            <InputLabel>Email address</InputLabel>
            <OutlinedInput
              id="email"
              name="email"
              type="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.errors.email ? <FormHelperText>{formik.errors.email}</FormHelperText> : null}
          </FormControl>
          <FormControl error={Boolean(formik.errors.password)}>
            <InputLabel>Password</InputLabel>
            <OutlinedInput
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              endAdornment={
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={(): void => setShowPassword((prev) => !prev)}
                  edge="end"
                  sx={{ mr: -1 }}
                >
                  {showPassword ? (
                    <EyeSlashIcon fontSize="var(--icon-fontSize-md)" />
                  ) : (
                    <EyeIcon fontSize="var(--icon-fontSize-md)" />
                  )}
                </IconButton>
              }
            />
            {formik.errors.password ? <FormHelperText>{formik.errors.password}</FormHelperText> : null}
          </FormControl>
          <Button disabled={formik.isSubmitting} type="submit" variant="contained" fullWidth>
            Sign in
          </Button>
        </Stack>
      </form>
    </Stack>
  );
}
