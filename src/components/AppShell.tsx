'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  AppBar, Box, CssBaseline, Divider, Drawer, IconButton, List,
  ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Menu, CalendarMonth, People, Home, ClassOutlined, MeetingRoom} from '@mui/icons-material';
import { auth0 } from "@/lib/auth0";

const drawerWidth = 240;

export default function AppShell({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

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

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
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
