import * as React from "react";
import * as ReactDOM from "react-dom";

import { Banner } from "./components/Banner";
import { UserComponent } from "./components/User";
import { StateManager } from "./StateManager";
import { BlogComponent } from "./components/BlogComponent";
import { HeaderSection } from "./components/HeaderSection";
import { RaceCountdown } from "./components/widgets/RaceCountdown";
import {DentedLotus} from "./components/DentedLotus";
let stateManager = new StateManager();

ReactDOM.render(
    <DentedLotus stateManager={stateManager}/>,
    document.getElementById("example")
);