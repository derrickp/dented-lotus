import * as React from "react";
import * as ReactDOM from "react-dom";

import * as injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { HashRouter } from 'react-router-dom'

import { AppManager } from "./AppManager";
import { DentedLotus } from "./components/DentedLotus";
import { SplashScreen } from "./components/SplashScreen";

window.onerror = function (error) {
    alert(error);
};

// Create our singleton little state manager. This will be the arbiter for data in the application.
// It will be the single source for data. Allowing us to easily manage it all in one location.
const app = new AppManager();

const dentedLotusElement = document.getElementById("dentedlotus");

const Loading = () => (
    <MuiThemeProvider>
        <SplashScreen ></SplashScreen>
    </MuiThemeProvider>
);

const App = () => (
    <HashRouter>
        <MuiThemeProvider>
            <DentedLotus app={app} />
        </MuiThemeProvider>
    </HashRouter>
);

// Render our react app. Inject the StateManager
ReactDOM.render(
    <Loading />,
    dentedLotusElement
);

app.initialize().then(success => {
    // Render our react app. Inject the StateManager
    ReactDOM.render(
        <App />,
        dentedLotusElement
    );
});