import React from "react";
import { Route, Redirect } from "react-router-dom";
import { useSelector } from "react-redux";
import MainLayout from "../MainLayout/MainLayout";

const RestrictedRoute = ({ component: Component, path, ...rest }) => {
  const user = useSelector((state) => state.auth.user);

  return (
    <Route
      {...rest}
      render={(props) =>
        user ? (
          <MainLayout>
            <Component {...props} />
          </MainLayout>
        ) : (
          <Redirect to="/login" />
        )
      }
    />
  );
};

export default RestrictedRoute;
