import * as React from "react";
import * as ReactDOM from "react-dom";

import { StateManager } from "./StateManager";
import {DentedLotus} from "./components/DentedLotus";

// Create our singleton little state manager. This will be the arbiter for data in the application.
// It will be the single source for data. Allowing us to easily manage it all in one location.
const stateManager = new StateManager();

const dentedLotusElement = document.getElementById("dentedlotus");

// Render our react app. Inject the StateManager
ReactDOM.render(
    <DentedLotus stateManager={stateManager}/>,
    dentedLotusElement
);