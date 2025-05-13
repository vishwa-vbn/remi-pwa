import React from "react";
import { Route, Redirect } from "react-router-dom";
import { useSelector } from "react-redux";
import MainLayout from "../MainLayout/MainLayout";
import auth from "./auth";

const RestrictedRoute = ({ component: Component, path, ...rest }) => {

  const isAuthenticated = auth.isAuthenticated();
  
  return (
    <Route
      {...rest}
      render={(props) =>
        isAuthenticated ? (
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
