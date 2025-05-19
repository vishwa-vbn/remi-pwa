import React from 'react';
import { Switch, Redirect, Route } from 'react-router-dom';
import RestrictedRoute from '../restricted/index';
import LoginContainer from '../screens/login/LoginContainer.jsx';
import SettingsContainer from '../screens/settings/SettingsContainer.jsx';
import TaskContainer from './task/TaskContainer.jsx';
import ChatContainer from './chat/chatContainer.jsx';

function App({ match }) {
    console.log("match is", match);
    
    const routes = [
        {
            component: SettingsContainer,
            link: 'settings',
        },
        {
            component: TaskContainer,
            link: 'tasks',
        },
        {
            component:ChatContainer,
            link: 'chat',
        }
    ];

    const login_routes = [
        {
            component: LoginContainer,
            link: '/login',
        },
    ];

    return (
        <Switch>
            {routes?.map((element) => (
                <RestrictedRoute
                    exact
                    key={element.link}
                    path={`${match.url}${element.link}`}
                    component={element.component}
                />
            ))}

            {login_routes?.map((element) => (
                <Route
                    exact
                    key={element.link}
                    path={element.link}
                    component={element.component}
                />
            ))}
            
            {/* Default redirect to /tasks */}
            <Route exact path="/">
                <Redirect to={`${match.url}tasks`} />
            </Route>
            
            {/* Optional: Catch-all redirect for unmatched routes */}
            <Route path="*">
                <Redirect to={`${match.url}tasks`} />
            </Route>
        </Switch>
    );
}

export default App;