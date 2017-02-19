"use strict";
var React = require("react");
var ReactDOM = require("react-dom");
var StateManager_1 = require("./StateManager");
var DentedLotus_1 = require("./components/DentedLotus");
var stateManager = new StateManager_1.StateManager();
ReactDOM.render(React.createElement(DentedLotus_1.DentedLotus, { stateManager: stateManager }), document.getElementById("example"));
