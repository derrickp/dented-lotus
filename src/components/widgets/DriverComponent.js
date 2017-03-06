"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var formsy_react_components_1 = require("formsy-react-components");
var DriverComponent = (function (_super) {
    __extends(DriverComponent, _super);
    /**
     *
     */
    function DriverComponent(props) {
        var _this = _super.call(this, props) || this;
        _this.driver = props.driver;
        _this.state = { isEditing: false };
        return _this;
    }
    DriverComponent.prototype.editClicked = function () {
        this.setState({ isEditing: true });
    };
    DriverComponent.prototype.closeEdit = function () {
        this.setState({ isEditing: false });
    };
    DriverComponent.prototype.onValueChanged = function (name, value) {
    };
    DriverComponent.prototype.render = function () {
        var content;
        if (this.state.isEditing) {
            content = React.createElement(EditDriver, { driver: this.driver, onEditClicked: this.editClicked.bind(this), onCloseEdit: this.closeEdit.bind(this), onValueChanged: this.onValueChanged.bind(this) });
        }
        else {
            content = React.createElement(DisplayDriver, { driver: this.driver, onEditClicked: this.editClicked.bind(this), onCloseEdit: this.closeEdit.bind(this), onValueChanged: this.onValueChanged.bind(this) });
        }
        return content;
    };
    return DriverComponent;
}(React.Component));
exports.DriverComponent = DriverComponent;
function EditDriver(props) {
    return React.createElement(formsy_react_components_1.Form, { onSubmit: function (data) { props.driver.update(data); } },
        React.createElement(formsy_react_components_1.Input, { layout: "vertical", type: "text", value: props.driver.firstName, onChange: function (name, s) { props.driver[name] = s; }, name: "firstName", label: "First Name:" }),
        React.createElement(formsy_react_components_1.Input, { layout: "vertical", type: "text", value: props.driver.lastName, onChange: function (name, s) { props.driver[name] = s; }, name: "lastName", label: "Last Name:" }),
        React.createElement(formsy_react_components_1.Input, { layout: "vertical", type: "text", value: props.driver.nationality, onChange: function (name, s) { props.driver[name] = s; }, name: "nationality", label: "Nationality:" }),
        React.createElement(formsy_react_components_1.Input, { layout: "vertical", type: "number", value: props.driver.points, onChange: function (name, s) { props.driver[name] = s; }, name: "points", label: "Points:" }),
        React.createElement(formsy_react_components_1.Input, { layout: "vertical", type: "text", value: props.driver.nationality, onChange: function (name, s) { props.driver[name] = s; }, name: "wins", label: "Wins:" }),
        React.createElement("button", { onClick: props.onCloseEdit }, "Close"));
}
function DisplayDriver(props) {
    return React.createElement("div", { className: "driver" },
        React.createElement("label", { htmlFor: "form-field-1" }, "First Name:"),
        React.createElement("span", { id: "form-field-1" }, props.driver.firstName),
        React.createElement("br", null),
        React.createElement("label", { htmlFor: "form-field-2" }, "Last Name:"),
        React.createElement("span", { id: "form-field-2" }, props.driver.lastName),
        React.createElement("br", null),
        React.createElement("label", { htmlFor: "form-field-3" }, "Nationality:"),
        React.createElement("span", { id: "form-field-3" }, props.driver.nationality),
        React.createElement("br", null),
        React.createElement("label", { htmlFor: "form-field-4" }, "Points:"),
        React.createElement("span", { id: "form-field-4" }, props.driver.points),
        React.createElement("br", null),
        React.createElement("label", { htmlFor: "form-field-5" }, "Wins:"),
        React.createElement("span", { id: "form-field-5" }, props.driver.wins),
        React.createElement("br", null),
        React.createElement("button", { onClick: props.onEditClicked }, "Edit"));
}
