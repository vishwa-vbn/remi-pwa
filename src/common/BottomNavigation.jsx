import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { IoIosHome, IoIosSettings } from 'react-icons/io';
import { IoChatboxEllipses } from "react-icons/io5";
import { BottomNavigation, BottomNavigationAction } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledBottomNavigation = styled(BottomNavigation)(({ theme }) => ({
  width: '100vw', // Full viewport width
  maxWidth: '100%', // Prevent overflow
  bottom: 0,
  left: 0,
  right: 0,
  backgroundColor: theme.palette.background.paper,
  borderTop: `1px solid ${theme.palette.grey[200]}`,
  boxShadow: theme.shadows[4],
  paddingBottom: 'env(safe-area-inset-bottom)',
  height: '5%', // Set to 10% of viewport height
  display: 'flex', // Flexbox for centering
  justifyContent: 'space-evenly', // Evenly space actions
  boxSizing: 'border-box', // Include padding/borders in width
  alignItems: 'center', // Vertically center content
}));

const StyledBottomNavigationAction = styled(BottomNavigationAction)(({ theme }) => ({
  padding: theme.spacing(1),
  color: theme.palette.grey[500],
  '&.Mui-selected': {
    color: theme.palette.primary.main,
  },
  '& .MuiBottomNavigationAction-label': {
    fontSize: '0.75rem',
    marginTop: theme.spacing(0.5),
  },
  transition: 'color 200ms',
  display: 'flex', // Center content
  justifyContent: 'center', // Center icons
  flex: 1, // Equal width for each action
  minWidth: 0, // Prevent shrinking issues
}));

const BottomNavigationComponent = ({ className }) => {
  const location = useLocation();
  const value = location.pathname === '/tasks' ? 0 : location.pathname === '/settings' ? 1 : -1;

  return (
    <StyledBottomNavigation className={className} showLabels value={value}>
      <StyledBottomNavigationAction
        icon={<IoIosHome size={20} />}
        component={NavLink}
        to="/tasks"
      />
      <StyledBottomNavigationAction
        icon={<IoChatboxEllipses size={20} />}
        component={NavLink}
        to="/chat"
      />
      <StyledBottomNavigationAction
        icon={<IoIosSettings size={20} />}
        component={NavLink}
        to="/settings"
      />
    </StyledBottomNavigation>
  );
};

export default BottomNavigationComponent;