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
import { Bell as BellIcon } from '@phosphor-icons/react/dist/ssr/Bell';
import { List as ListIcon } from '@phosphor-icons/react/dist/ssr/List';
import { MagnifyingGlass as MagnifyingGlassIcon } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';
import { usePopover } from '@/hooks/use-popover';
import { MobileNav } from './mobile-nav';
import { UserPopover } from './user-popover';

export function MainNav(): React.JSX.Element {
  const [openNav, setOpenNav] = React.useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = React.useState<boolean>(false);
  const [searchQuery, setSearchQuery] = React.useState<string>('');

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
          {/* Left Section */}
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            {/* Hamburger Menu for Mobile */}
            <IconButton
              onClick={(): void => {
                setOpenNav(true);
              }}
              sx={{ display: { lg: 'none' } }}
            >
              <ListIcon />
            </IconButton>

            {/* Search Button */}
            <Tooltip title={isSearchOpen ? 'Close Search' : 'Search'}>
              <IconButton onClick={handleSearchToggle}>
                <MagnifyingGlassIcon />
              </IconButton>
            </Tooltip>

            {/* Search Bar */}
            {isSearchOpen && (
              <TextField
                variant="outlined"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{
                  width: { xs: '100%', sm: 300 },
                  transition: 'width 0.3s',
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      
                    </InputAdornment>
                  ),
                  endAdornment: searchQuery && (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setSearchQuery('')}>
                        ✕
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            )}
          </Stack>

          {/* Right Section */}
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            {/* Notifications */}
            <Tooltip title="Notifications">
              <Badge badgeContent={4} color="success" variant="dot">
                <IconButton>
                  <BellIcon />
                </IconButton>
              </Badge>
            </Tooltip>

            {/* User Avatar */}
            <Avatar
              onClick={userPopover.handleOpen}
              ref={userPopover.anchorRef}
              src="/assets/Festo.jpeg"
              sx={{ cursor: 'pointer' }}
            />
          </Stack>
        </Stack>
      </Box>

      {/* User Popover */}
      <UserPopover
        anchorEl={userPopover.anchorRef.current}
        onClose={userPopover.handleClose}
        open={userPopover.open}
      />

      {/* Mobile Navigation */}
      <MobileNav
        onClose={() => {
          setOpenNav(false);
        }}
        open={openNav}
      />
    </React.Fragment>
  );
}
