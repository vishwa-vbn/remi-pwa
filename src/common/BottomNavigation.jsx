import React, { memo, useMemo } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { IoIosHome, IoIosSettings } from "react-icons/io";
import { BottomNavigation, BottomNavigationAction } from "@mui/material";
import { styled } from "@mui/material/styles";

// Styled Components
const StyledBottomNavigation = styled(BottomNavigation)(({ theme }) => ({
  width: "100vw",
  position: "fixed",
  bottom: 0,
  backgroundColor: theme.palette.background.paper,
  borderTop: `1px solid ${theme.palette.grey[200]}`,
  boxShadow: theme.shadows[4],
  paddingBottom: "env(safe-area-inset-bottom)",
  height: "56px",
  display: "flex",
  justifyContent: "space-evenly",
  alignItems: "center",
  zIndex: theme.zIndex.appBar,
}));

const StyledBottomNavigationAction = styled(BottomNavigationAction)(
  ({ theme }) => ({
    padding: theme.spacing(1),
    color: theme.palette.grey[500],
    "&.Mui-selected": {
      color: theme.palette.primary.main,
    },
    "& .MuiBottomNavigationAction-label": {
      fontSize: "0.75rem",
      marginTop: theme.spacing(0.5),
    },
    transition: "color 200ms",
    display: "flex",
    justifyContent: "center",
    flex: 1,
    minWidth: 0,
  })
);

// Component
const BottomNavigationComponent = ({ className }) => {
  const location = useLocation();

  const navMap = useMemo(
    () => ({
      "/tasks": 0,
      "/settings": 1,
    }),
    []
  );

  const currentValue = navMap[location.pathname] ?? -1;

  return (
    <StyledBottomNavigation
      className={className}
      showLabels
      value={currentValue}
    >
      <StyledBottomNavigationAction
        icon={<IoIosHome size={20} />}
        component={NavLink}
        to="/tasks"
        aria-label="Tasks"
      />
      <StyledBottomNavigationAction
        icon={<IoIosSettings size={20} />}
        component={NavLink}
        to="/settings"
        aria-label="Settings"
      />
    </StyledBottomNavigation>
  );
};

export default memo(BottomNavigationComponent);
