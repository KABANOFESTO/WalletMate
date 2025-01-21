'use client';

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import { List as ListIcon } from '@phosphor-icons/react/dist/ssr/List';
import { MagnifyingGlass as MagnifyingGlassIcon } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';
import { usePopover } from '@/hooks/use-popover';
import { useUser } from '@/hooks/use-user';
import { MobileNav } from './mobile-nav';
import { UserPopover } from './user-popover';
import NotificationIcon from '@/components/notifications/NotificationIcon';

export function MainNav(): React.JSX.Element {
  const [openNav, setOpenNav] = React.useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = React.useState<boolean>(false);
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const { user } = useUser();

  const userPopover = usePopover<HTMLDivElement>();

  const handleSearchToggle = (): void => {
    setIsSearchOpen((prev) => !prev);
    setSearchQuery(''); // Clear the search query on toggle
  };

  return (
    <React.Fragment>
      <Box
        component="header"
        sx={{
          borderBottom: '1px solid var(--mui-palette-divider)',
          backgroundColor: 'var(--mui-palette-background-paper)',
          position: 'sticky',
          top: 0,
          zIndex: 'var(--mui-zIndex-appBar)',
        }}
      >
        <Stack
          direction="row"
          spacing={2}
          sx={{
            alignItems: 'center',
            justifyContent: 'space-between',
            minHeight: '64px',
            px: 2,
          }}
        >
          <Stack direction="row" spacing={2}>
            <IconButton
              onClick={(): void => setOpenNav(true)}
              sx={{
                display: {
                  lg: 'none',
                },
              }}
            >
              <ListIcon />
            </IconButton>
            <Box
              sx={{
                alignItems: 'center',
                display: 'flex',
                gap: 2,
                maxWidth: isSearchOpen ? '100%' : '200px',
                transition: 'max-width 0.3s ease-in-out',
              }}
            >
              {isSearchOpen && (
                <TextField
                  fullWidth
                  placeholder="Search..."
                  size="small"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <MagnifyingGlassIcon />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiInputBase-root': {
                      backgroundColor: 'var(--mui-palette-background-default)',
                    },
                  }}
                />
              )}
            </Box>
          </Stack>
          <Stack direction="row" spacing={3} alignItems="center">
            {!isSearchOpen && (
              <IconButton onClick={handleSearchToggle}>
                <MagnifyingGlassIcon />
              </IconButton>
            )}
            <NotificationIcon />
            <Box
              onClick={userPopover.handleOpen}
              ref={userPopover.anchorRef}
              sx={{ cursor: 'pointer' }}
            >
              <Avatar
                sx={{
                  backgroundColor: user?.name ? 'primary.main' : 'grey.500',
                }}
              >
                {user?.name ? user.name.charAt(0).toUpperCase() : 'G'}
              </Avatar>
            </Box>
          </Stack>
        </Stack>
      </Box>
      <MobileNav
        onClose={(): void => setOpenNav(false)}
        open={openNav}
      />
      <UserPopover
        anchorEl={userPopover.anchorRef.current}
        onClose={userPopover.handleClose}
        open={userPopover.open}
      />
    </React.Fragment>
  );
}
