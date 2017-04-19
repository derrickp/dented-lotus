import * as React from "react";
import * as ReactDOM from "react-dom";

import * as injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import { StateManager } from "./StateManager";
import { DentedLotus } from "./components/DentedLotus";
import { SplashScreen } from "./components/SplashScreen";

window.onerror = function (error) {
    alert(error);
};

// Create our singleton little state manager. This will be the arbiter for data in the application.
// It will be the single source for data. Allowing us to easily manage it all in one location.
const stateManager = new StateManager();

const dentedLotusElement = document.getElementById("dentedlotus");

const Loading = () => (
    <MuiThemeProvider>
        <SplashScreen ></SplashScreen>
    </MuiThemeProvider>
);

const App = () => (
    <MuiThemeProvider>
        <DentedLotus stateManager={stateManager} />
    </MuiThemeProvider>
);

// Render our react app. Inject the StateManager
ReactDOM.render(
    <Loading />,
    dentedLotusElement
);

stateManager.initialize().then(success => {
    // Render our react app. Inject the StateManager
    ReactDOM.render(
        <App />,
        dentedLotusElement
    );
});