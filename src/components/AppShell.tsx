'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  AppBar, Box, CssBaseline, Divider, Drawer, IconButton, List,
  ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography,
  useMediaQuery, Menu as MuiMenu, MenuItem, Tooltip, Button
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Menu, CalendarMonth, People, Home, ClassOutlined, MeetingRoom, AccountCircle
} from '@mui/icons-material';
import { useUser } from '@auth0/nextjs-auth0';

const drawerWidth = 240;

export default function AppShell({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const { user, error, isLoading } = useUser();

  const navItems = [
    { href: '/', label: 'Home', icon: <Home /> },
    { href: '/instructors', label: 'Instructors', icon: <People /> },
    { href: '/rooms', label: 'Rooms', icon: <MeetingRoom /> },
    { href: '/classes', label: 'Classes', icon: <ClassOutlined /> },
    { href: '/calendar', label: 'Calendar', icon: <CalendarMonth /> },
  ];

  const drawer = (
    <Box role="navigation" sx={{ width: drawerWidth }}>
      <Toolbar />
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItemButton
            key={item.href}
            component={Link}
            href={item.href}
            selected={pathname === item.href}
            onClick={() => setMobileOpen(false)}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );

  // Account menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);
  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      <AppBar
        position="fixed"
        sx={{
          zIndex: (t) => t.zIndex.drawer + 1,
          // If you find the first column hidden behind the drawer on desktop,
          // uncomment the next two lines to shift the AppBar over:
          // width: { md: `calc(100% - ${drawerWidth}px)` },
          // ml: { md: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          {!isMdUp && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setMobileOpen((o) => !o)}
              sx={{ mr: 2 }}
              aria-label="open navigation"
            >
              <Menu />
            </IconButton>
          )}
          <Typography variant="h6" noWrap component="div">
            TutorMS
          </Typography>

          {/* Right-aligned account section */}
          <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
            {isLoading ? (
              <Typography variant="body2" sx={{ opacity: 0.7 }}>Loading…</Typography>
            ) : user ? (
              <>
                <Typography
                  variant="body2"
                  sx={{ display: { xs: 'none', sm: 'block' }, maxWidth: 260 }}
                  noWrap
                  title={user.email || user.name || ''}
                >
                  {user.name || user.email}
                </Typography>
                <Tooltip title="Account">
                  <IconButton
                    color="inherit"
                    onClick={handleMenuOpen}
                    aria-controls={menuOpen ? 'account-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={menuOpen ? 'true' : undefined}
                  >
                    <AccountCircle />
                  </IconButton>
                </Tooltip>

                <MuiMenu
                  id="account-menu"
                  anchorEl={anchorEl}
                  open={menuOpen}
                  onClose={handleMenuClose}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                  <MenuItem
                    onClick={() => {
                      handleMenuClose();
                      router.push('/account'); // change to your account/settings page
                    }}
                  >
                    Account settings
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      handleMenuClose();
                      // Auth0 v4 default logout route:
                      router.push('/auth/logout');
                    }}
                  >
                    Logout
                  </MenuItem>
                </MuiMenu>
              </>
            ) : (
              <Button
                color="inherit"
                onClick={() => router.push('/auth/login')}
              >
                Login
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile: temporary drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
      >
        {drawer}
      </Drawer>

      {/* Desktop: permanent drawer */}
      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
      >
        {drawer}
      </Drawer>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
        }}
      >
        <Toolbar /> {/* offset for AppBar */}
        {children}
      </Box>
    </Box>
  );
}
