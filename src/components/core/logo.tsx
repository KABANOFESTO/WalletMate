'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const HEIGHT = 60;
const WIDTH = 60;

type Color = 'dark' | 'light';

export interface LogoProps {
  color?: Color;
  emblem?: boolean;
  height?: number;
  width?: number;
}

export function Logo({ height = HEIGHT, width = WIDTH }: LogoProps): React.JSX.Element {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: `${height}px`,
        width: `${width * 2}px`,
        background: 'linear-gradient(90deg,rgb(76, 82, 164),rgb(91, 79, 81))', // Gradient background for a modern look
        borderRadius: 2,
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)', 
        padding: '10px',
        textDecoration: 'none', 
      }}
    >
      <Typography
        variant="h5"
        sx={{
          fontWeight: 700,
          color: '#FFFFFF',
          fontFamily: '"Poppins", sans-serif', 
          letterSpacing: 1.5, 
          textTransform: 'uppercase',
          textDecoration: 'none', 
        }}
      >
        Wallet
      </Typography>
    </Box>
  );
}

export interface DynamicLogoProps {
  colorDark?: Color;
  colorLight?: Color;
  emblem?: boolean;
  height?: number;
  width?: number;
}

export function DynamicLogo({
  height = HEIGHT,
  width = WIDTH,
}: DynamicLogoProps): React.JSX.Element {
  return <Logo height={height} width={width} />;
}
