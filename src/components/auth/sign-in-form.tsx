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
import { Eye, EyeSlash } from '@phosphor-icons/react';

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
    .required('Password is required'),
});

export function LoginForm(): React.JSX.Element {
  const router = useRouter();
  const auth = useAuth();
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      submit: null,
    },
    validationSchema,
    onSubmit: async (values, helpers): Promise<void> => {
      try {
        setError(null);
        const user = await login({ email: values.email, password: values.password });
        auth.setUser(user);
        helpers.setStatus({ success: true });
        helpers.setSubmitting(false);
        router.push(paths.dashboard.overview);
      } catch (err) {
        helpers.setStatus({ success: false });
        helpers.setSubmitting(false);
        setError('Invalid email or password');
      }
    },
  });

  return (
    <form
      noValidate
      onSubmit={formik.handleSubmit}
    >
      <Stack spacing={3}>
        <FormControl error={!!(formik.touched.email && formik.errors.email)}>
          <InputLabel>
            Email Address
          </InputLabel>
          <OutlinedInput
            fullWidth
            label="Email Address"
            name="email"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            type="email"
            value={formik.values.email}
          />
          {formik.touched.email && formik.errors.email && (
            <FormHelperText>
              {formik.errors.email}
            </FormHelperText>
          )}
        </FormControl>
        <FormControl error={!!(formik.touched.password && formik.errors.password)}>
          <InputLabel>
            Password
          </InputLabel>
          <OutlinedInput
            fullWidth
            label="Password"
            name="password"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            type={showPassword ? 'text' : 'password'}
            value={formik.values.password}
            endAdornment={
              <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                {showPassword ? <EyeSlash /> : <Eye />}
              </IconButton>
            }
          />
          {formik.touched.password && formik.errors.password && (
            <FormHelperText>
              {formik.errors.password}
            </FormHelperText>
          )}
        </FormControl>
        {error && (
          <Alert severity="error">
            {error}
          </Alert>
        )}
        <Button
          disabled={formik.isSubmitting}
          fullWidth
          size="large"
          type="submit"
          variant="contained"
          color="primary"
        >
          Log In
        </Button>
        <Stack 
          direction="row" 
          justifyContent="space-between" 
          spacing={2}
        >
          <Link
            component={RouterLink}
            href={paths.auth.signUp}
            variant="body2"
          >
            Create new account
          </Link>
          <Link
            component={RouterLink}
            href={paths.auth.forgotPassword}
            variant="body2"
          >
            Forgot password?
          </Link>
        </Stack>
      </Stack>
    </form>
  );
}
