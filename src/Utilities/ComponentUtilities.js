"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
function arrayToList(array) {
    var out = [];
    array.forEach(function (a) { out.push(React.createElement("li", null, a)); });
    return out;
}
exports.arrayToList = arrayToList;
