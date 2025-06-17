import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Create as CreateIcon,
  Send as QuickPostIcon,
  Schedule as ScheduleIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';

const drawerWidth = 240;

const menuItems = [
  {
    text: 'Dashboard',
    icon: <DashboardIcon />,
    path: '/dashboard',
  },
  {
    text: 'Generate Content',
    icon: <CreateIcon />,
    path: '/generate',
  },
  {
    text: 'Quick Post',
    icon: <QuickPostIcon />,
    path: '/quick-post',
  },
  {
    text: 'Schedule',
    icon: <ScheduleIcon />,
    path: '/schedule',
  },
  {
    text: 'Settings',
    icon: <SettingsIcon />,
    path: '/settings',
  },
];

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
    >
      <Toolbar />
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => handleNavigation(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;