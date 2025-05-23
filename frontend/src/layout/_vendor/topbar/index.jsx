// File: C:\Users\hanos\nextall\frontend\src\layout\_vendor\topbar\index.jsx
'use client';
import React from 'react';
import PropTypes from 'prop-types';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';

// mui
import { styled, alpha, useMediaQuery, useTheme, Toolbar, IconButton, Skeleton, Stack } from '@mui/material';
import MuiAppBar from '@mui/material/AppBar';

// icons
import { RxHamburgerMenu } from 'react-icons/rx';

// components
import Logo from 'src/components/logo';
import { navlinks } from '../sidebar';
import Search from 'src/components/search';

// dynamic imports
const UserSelect = dynamic(() => import('src/components/select/userSelect'), {
  ssr: false,
  loading: () => <Skeleton variant="circular" width={50} height={50} />
});
const SettingMode = dynamic(() => import('src/components/settings/themeModeSetting'), {
  ssr: false,
  loading: () => <Skeleton variant="circular" width={40} height={40} />
});

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open'
})(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen
  }),
  backdropFilter: 'blur(6px)',
  WebkitBackdropFilter: 'blur(6px)', // Fix on Mobile
  backgroundColor: alpha(theme.palette.background.default, 0.72),
  borderBottom: '1px solid ' + theme.palette.divider
}));

export default function Topbar({ open, handleDrawerOpen, handleDrawerClose }) {
  const theme = useTheme();
  const pathname = usePathname();
  const filtered = navlinks.filter((v) => '/dashboard' + v.slug === pathname);
  const isActive = filtered;
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSearch = Boolean(isActive[0]?.isSearch);
  return (
    <AppBar position="fixed" open={open} sx={{ borderRadius: 0, boxShadow: 'none', zIndex: 999 }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Stack direction="row" alignItems="center">
          <IconButton
            aria-label="open drawer"
            onClick={open ? handleDrawerClose : handleDrawerOpen}
            edge="start"
            sx={{
              display: { xs: 'flex', md: 'none' }
            }}
            size="small"
          >
            <RxHamburgerMenu size={20} />
          </IconButton>
          {!isMobile && <Logo />}
          {isSearch && <Search />}
        </Stack>
        <Stack direction="row" alignItems="center" gap={1}>
          <SettingMode isAdmin />
          <UserSelect />
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
Topbar.propTypes = {
  open: PropTypes.bool.isRequired,
  handleDrawerOpen: PropTypes.func.isRequired,
  handleDrawerClose: PropTypes.func.isRequired
};
